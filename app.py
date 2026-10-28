import os
import re
import json
import logging
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from xgboost import XGBRegressor

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return '', 200

# ----------------------------------------------------------------------
# 16 Excluded Brands configuration (full authoritative exclusion list)
# ----------------------------------------------------------------------
EXCLUDED_BRANDS = [
    "Ferrari", "Rolls-Royce", "Bentley", "Mercedes-Benz", "Porsche",
    "Land Rover", "BMW", "Lexus", "Maserati", "Mercedes-AMG",
    "Mini", "Isuzu", "ISUZU", "Nissan", "Force", "MG"
]
EXCLUDED_BRANDS_LOWER = {b.strip().lower() for b in EXCLUDED_BRANDS}

# 16 Supported Brands
SUPPORTED_BRANDS = [
    "Audi", "Datsun", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep", "Kia",
    "Mahindra", "Maruti", "Renault", "Skoda", "Tata", "Toyota", "Volkswagen", "Volvo"
]
SUPPORTED_BRANDS_MAP = {b.lower(): b for b in SUPPORTED_BRANDS}

DATASET_CSV_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'cardekho_cleaned_filtered.csv')
VEHICLE_SPECS_JSON_PATH = os.path.join(os.path.dirname(__file__), 'src', 'data', 'vehicle_specs.json')
TRAIN_CB_CSV_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'catboost_train_filtered.csv')
XGBOOST_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'saved_models_filtered', 'xgboost_filtered.json')
PREPROCESSING_ARTIFACTS_PATH = os.path.join(os.path.dirname(__file__), 'model', 'saved_models_filtered', 'xgb_preprocessing_artifacts.json')

FEATURE_NAMES = [
    'vehicle_age', 'km_driven', 'mileage', 'engine', 'max_power', 'seats',
    'brand_encoded', 'model_encoded',
    'seller_type_Individual', 'seller_type_Trustmark Dealer',
    'fuel_type_Diesel', 'fuel_type_LPG', 'fuel_type_Petrol',
    'transmission_type_Manual'
]

# Cache for brand -> supported models mapping derived from filtered dataset
FILTERED_SPECS = {}

def init_specs():
    global FILTERED_SPECS
    # Prefer loading directly from filtered dataset csv
    if os.path.exists(DATASET_CSV_PATH):
        try:
            df = pd.read_csv(DATASET_CSV_PATH)
            specs = {}
            for brand, group in df.groupby('brand'):
                b_str = str(brand).strip()
                canonical_brand = SUPPORTED_BRANDS_MAP.get(b_str.lower())
                if canonical_brand and canonical_brand.lower() not in EXCLUDED_BRANDS_LOWER:
                    models = sorted([str(m).strip() for m in group['model'].unique() if str(m).strip()])
                    specs[canonical_brand] = models
            if specs:
                FILTERED_SPECS = specs
                logger.info("Loaded brand-model specifications from filtered dataset CSV.")
                return
        except Exception as e:
            logger.warning(f"Could not load specs from CSV: {e}")

    # Fallback to vehicle_specs.json if csv not directly available
    if os.path.exists(VEHICLE_SPECS_JSON_PATH):
        try:
            with open(VEHICLE_SPECS_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            specs = {}
            for item in data:
                b = str(item.get('brand', '')).strip()
                canonical_brand = SUPPORTED_BRANDS_MAP.get(b.lower())
                m = str(item.get('model', '')).strip()
                if canonical_brand and m and canonical_brand.lower() not in EXCLUDED_BRANDS_LOWER:
                    specs.setdefault(canonical_brand, set()).add(m)
            FILTERED_SPECS = {b: sorted(list(models)) for b, models in specs.items()}
            logger.info("Loaded brand-model specifications from vehicle_specs.json.")
            return
        except Exception as e:
            logger.warning(f"Could not load specs from JSON: {e}")

    # Canonical baseline
    FILTERED_SPECS = {
        "Audi": ["A4", "A6", "A8", "Q7"],
        "Datsun": ["GO", "RediGO", "redi-GO"],
        "Ford": ["Aspire", "Ecosport", "Endeavour", "Figo", "Freestyle"],
        "Honda": ["Amaze", "CR", "CR-V", "City", "Civic", "Jazz", "WR-V"],
        "Hyundai": ["Aura", "Creta", "Elantra", "Grand", "Santro", "Tucson", "Venue", "Verna", "i10", "i20"],
        "Jaguar": ["F-PACE", "XE", "XF"],
        "Jeep": ["Compass", "Wrangler"],
        "Kia": ["Carnival", "Seltos"],
        "Mahindra": ["Alturas", "Bolero", "KUV", "KUV100", "Marazzo", "Scorpio", "Thar", "XUV300", "XUV500"],
        "Maruti": ["Alto", "Baleno", "Celerio", "Ciaz", "Dzire LXI", "Dzire VXI", "Dzire ZXI", "Eeco", "Ertiga", "Ignis", "S-Presso", "Swift", "Swift Dzire", "Vitara", "Wagon R", "XL6"],
        "Renault": ["Duster", "KWID", "Triber"],
        "Skoda": ["Octavia", "Rapid", "Superb"],
        "Tata": ["Altroz", "Harrier", "Hexa", "Nexon", "Safari", "Tiago", "Tigor"],
        "Toyota": ["Camry", "Fortuner", "Glanza", "Innova", "Yaris"],
        "Volkswagen": ["Polo", "Vento"],
        "Volvo": ["S90", "XC", "XC60", "XC90"]
    }

init_specs()

# ----------------------------------------------------------------------
# Load Preprocessing Artifacts & XGBoost Model (Once at Startup)
# ----------------------------------------------------------------------
global_mean = 644497.0232903
brand_map = {}
model_map = {}

def load_preprocessing_artifacts():
    global global_mean, brand_map, model_map
    if os.path.exists(PREPROCESSING_ARTIFACTS_PATH):
        try:
            with open(PREPROCESSING_ARTIFACTS_PATH, 'r', encoding='utf-8') as f:
                artifacts = json.load(f)
            global_mean = float(artifacts.get('global_mean', global_mean))
            brand_map = artifacts.get('brand_encoded_map', {})
            model_map = artifacts.get('model_encoded_map', {})
            logger.info("Loaded XGBoost preprocessing artifacts from JSON.")
            return
        except Exception as e:
            logger.warning(f"Error reading preprocessing artifacts JSON: {e}")

    # Compute directly from catboost_train_filtered.csv if JSON missing
    if os.path.exists(TRAIN_CB_CSV_PATH):
        try:
            cb_train = pd.read_csv(TRAIN_CB_CSV_PATH)
            global_mean = float(cb_train['selling_price'].mean())
            smoothing = 10

            brand_stats = cb_train.groupby('brand')['selling_price'].agg(['mean', 'count'])
            brand_map = ((brand_stats['mean'] * brand_stats['count'] + global_mean * smoothing) / (brand_stats['count'] + smoothing)).to_dict()

            model_stats = cb_train.groupby('model')['selling_price'].agg(['mean', 'count'])
            model_map = ((model_stats['mean'] * model_stats['count'] + global_mean * smoothing) / (model_stats['count'] + smoothing)).to_dict()
            logger.info("Computed target encodings directly from training CSV.")
            return
        except Exception as e:
            logger.warning(f"Error computing encodings from training CSV: {e}")

load_preprocessing_artifacts()

xgb_model = None
if os.path.exists(XGBOOST_MODEL_PATH):
    try:
        xgb_model = XGBRegressor()
        xgb_model.load_model(XGBOOST_MODEL_PATH)
        logger.info(f"[model] Trained XGBoost model loaded successfully from {XGBOOST_MODEL_PATH}")
    except Exception as e:
        logger.error(f"[model] Failed to load XGBoost model: {e}")
        xgb_model = None
else:
    logger.error(f"[model] XGBoost model file not found at {XGBOOST_MODEL_PATH}")

def is_brand_excluded(brand):
    if not brand:
        return False
    return str(brand).strip().lower() in EXCLUDED_BRANDS_LOWER

def get_brand_options():
    if FILTERED_SPECS:
        return sorted(list(FILTERED_SPECS.keys()))
    return SUPPORTED_BRANDS

def get_model_options(brand):
    if not brand or is_brand_excluded(brand):
        return []
    b_norm = str(brand).strip().lower()
    for b_key, models in FILTERED_SPECS.items():
        if b_key.lower() == b_norm:
            return models
    return []

# ----------------------------------------------------------------------
# API Endpoints
# ----------------------------------------------------------------------
@app.route('/api/specs', methods=['GET'])
def get_specs():
    """
    Returns valid vehicle specification options derived from the filtered training dataset.
    """
    brand = request.args.get('brand')
    if not brand:
        brands = get_brand_options()
        return jsonify({
            'success': True,
            'type': 'brands',
            'options': brands
        }), 200

    brand_str = str(brand).strip()
    if is_brand_excluded(brand_str):
        return jsonify({
            'success': False,
            'type': 'models',
            'message': f'Brand "{brand_str}" has been excluded from the model training dataset.',
            'options': []
        }), 400

    canonical_brand = SUPPORTED_BRANDS_MAP.get(brand_str.lower())
    if not canonical_brand or canonical_brand not in FILTERED_SPECS:
        return jsonify({
            'success': False,
            'type': 'models',
            'message': f'Brand "{brand_str}" is not supported.',
            'options': []
        }), 404

    models = get_model_options(canonical_brand)
    return jsonify({
        'success': True,
        'brand': canonical_brand,
        'type': 'models',
        'options': models
    }), 200

# ----------------------------------------------------------------------
# Seller-Type Price Adjustments
# Baseline is always Individual (0% adjustment).
# Multipliers applied after obtaining baseline prediction:
# - Individual: baseline (multiplier 1.0)
# - Dealer: +1.9% (multiplier 1.019)
# - Trustmark Dealer: +2.2% (multiplier 1.022)
# ----------------------------------------------------------------------
SELLER_TYPE_ADJUSTMENTS = {
    'Individual': 1.0,         # 0% baseline
    'Dealer': 1.019,           # +1.9%
    'Trustmark Dealer': 1.022  # +2.2%
}

def apply_seller_type_adjustment(price_or_result, seller_type=None):
    """
    Applies seller-type adjustment multiplier to baseline price:
    - Individual: 0% baseline (1.0)
    - Dealer: +1.9% (1.019)
    - Trustmark Dealer: +2.2% (1.022)

    Validates seller_type against the three supported options:
    Individual, Dealer, Trustmark Dealer.

    Prevents double adjustment by operating strictly from baseline_price.
    """
    if isinstance(price_or_result, dict):
        baseline = price_or_result.get('baseline_price')
        if baseline is None:
            baseline = price_or_result.get('predicted_price', 0.0)
        st = seller_type or price_or_result.get('vehicle', {}).get('seller_type') or price_or_result.get('seller_type')
        adjusted = apply_seller_type_adjustment(baseline, st)
        price_or_result['predicted_price'] = adjusted
        price_or_result['baseline_price'] = round(float(baseline))
        price_or_result['is_seller_adjusted'] = True
        return price_or_result

    baseline_price = float(price_or_result) if price_or_result is not None else 0.0
    if not np.isfinite(baseline_price) or baseline_price < 0:
        baseline_price = 0.0

    canonical = None
    if seller_type:
        st_lower = str(seller_type).strip().lower()
        for valid_type in SELLER_TYPE_ADJUSTMENTS:
            if valid_type.lower() == st_lower:
                canonical = valid_type
                break

    if not canonical:
        raise ValueError(
            f"Invalid seller type '{seller_type}'. Supported options: {list(SELLER_TYPE_ADJUSTMENTS.keys())}"
        )

    multiplier = SELLER_TYPE_ADJUSTMENTS[canonical]
    adjusted_price = baseline_price * multiplier
    return round(adjusted_price)

@app.route('/api/predict', methods=['POST'])
def predict():
    if xgb_model is None:
        return jsonify({
            'success': False,
            'message': 'Prediction model is not available. Please verify model setup.'
        }), 500

    data = request.get_json(silent=True) or {}

    brand = str(data.get('brand', '')).strip()
    model_name = str(data.get('model', '')).strip()
    seller_type = str(data.get('seller_type', 'Individual')).strip()
    fuel_type = str(data.get('fuel_type', '')).strip()
    transmission = str(data.get('transmission_type') or data.get('transmission') or '').strip()

    # 1. Validate Brand
    if not brand:
        return jsonify({'success': False, 'message': 'Please select a vehicle Brand.'}), 400

    if is_brand_excluded(brand):
        return jsonify({
            'success': False,
            'message': f'Brand "{brand}" has been excluded from the model training dataset and cannot be predicted.'
        }), 400

    canonical_brand = SUPPORTED_BRANDS_MAP.get(brand.lower())
    if not canonical_brand or canonical_brand not in FILTERED_SPECS:
        return jsonify({
            'success': False,
            'message': f'Brand "{brand}" is not supported by the model.'
        }), 400

    # 2. Validate Model
    if not model_name:
        return jsonify({'success': False, 'message': 'Please select a vehicle Model.'}), 400

    valid_models = get_model_options(canonical_brand)
    canonical_model = next((m for m in valid_models if m.lower() == model_name.lower()), None)
    if not canonical_model:
        return jsonify({
            'success': False,
            'message': f'Model "{model_name}" is not a valid model for {canonical_brand} in the dataset.'
        }), 400

    # 3. Validate Categorical Attributes
    valid_fuels = {'Diesel', 'Petrol', 'CNG', 'LPG'}
    canonical_fuel = next((f for f in valid_fuels if f.lower() == fuel_type.lower()), None)
    if not canonical_fuel:
        return jsonify({'success': False, 'message': 'Please select a valid Fuel Type (Diesel, Petrol, CNG, LPG).'}), 400

    valid_transmissions = {'Manual', 'Automatic'}
    canonical_transmission = next((t for t in valid_transmissions if t.lower() == transmission.lower()), None)
    if not canonical_transmission:
        return jsonify({'success': False, 'message': 'Please select a valid Transmission (Manual, Automatic).'}), 400

    valid_sellers = {'Individual', 'Dealer', 'Trustmark Dealer'}
    canonical_seller = next((s for s in valid_sellers if s.lower() == seller_type.lower()), None)
    if not canonical_seller:
        return jsonify({'success': False, 'message': 'Please select a valid Seller Type (Individual, Dealer, Trustmark Dealer).'}), 400

    # 4. Validate Numerical Attributes
    try:
        vehicle_age = int(data.get('vehicle_age', -1))
        if vehicle_age < 0:
            return jsonify({'success': False, 'message': 'Vehicle Age cannot be negative.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Vehicle Age must be a valid number.'}), 400

    try:
        km_driven = int(data.get('km_driven', -1))
        if km_driven < 0:
            return jsonify({'success': False, 'message': 'Kilometres Driven cannot be negative.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Kilometres Driven must be a valid number.'}), 400

    try:
        mileage = float(data.get('mileage', 0))
        if mileage <= 0:
            return jsonify({'success': False, 'message': 'Please provide a valid positive Mileage.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Mileage must be a valid number.'}), 400

    try:
        engine = int(data.get('engine', 0))
        if engine <= 0:
            return jsonify({'success': False, 'message': 'Please provide a valid positive Engine capacity.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Engine capacity must be a valid number.'}), 400

    try:
        max_power = float(data.get('max_power', 0))
        if max_power <= 0:
            return jsonify({'success': False, 'message': 'Please provide a valid positive Max Power value.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Max Power must be a valid number.'}), 400

    try:
        seats = int(data.get('seats', 0))
        if seats <= 0:
            return jsonify({'success': False, 'message': 'Please provide a valid positive Seats count.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Seats must be a valid number.'}), 400

    # 5. Exact Training Preprocessing & Prediction with XGBoost
    try:
        brand_encoded = float(brand_map.get(canonical_brand, global_mean))
        model_encoded = float(model_map.get(canonical_model, global_mean))

        # Baseline model prediction: ALWAYS pass seller_type = "Individual" to ML model.
        # The ML model must receive seller_type = "Individual" for every prediction,
        # regardless of the seller type selected by the user.
        # For 'Individual': seller_type_Individual = 1, seller_type_Trustmark Dealer = 0
        seller_ind = 1
        seller_tm = 0
        fuel_diesel = 1 if canonical_fuel == 'Diesel' else 0
        fuel_lpg = 1 if canonical_fuel == 'LPG' else 0
        fuel_petrol = 1 if canonical_fuel == 'Petrol' else 0
        trans_manual = 1 if canonical_transmission == 'Manual' else 0

        input_row = {
            'vehicle_age': vehicle_age,
            'km_driven': km_driven,
            'mileage': mileage,
            'engine': engine,
            'max_power': max_power,
            'seats': seats,
            'brand_encoded': brand_encoded,
            'model_encoded': model_encoded,
            'seller_type_Individual': seller_ind,
            'seller_type_Trustmark Dealer': seller_tm,
            'fuel_type_Diesel': fuel_diesel,
            'fuel_type_LPG': fuel_lpg,
            'fuel_type_Petrol': fuel_petrol,
            'transmission_type_Manual': trans_manual
        }

        input_df = pd.DataFrame([input_row], columns=FEATURE_NAMES)
        pred_log = float(xgb_model.predict(input_df)[0])
        raw_price = float(np.expm1(pred_log))

        if not np.isfinite(raw_price) or raw_price < 0:
            raw_price = 0.0

        baseline_price = round(raw_price)
        predicted_price = apply_seller_type_adjustment(baseline_price, canonical_seller)

        return jsonify({
            'success': True,
            'predicted_price': predicted_price,
            'baseline_price': baseline_price,
            'seller_adjustment': {
                'seller_type': canonical_seller,
                'multiplier': SELLER_TYPE_ADJUSTMENTS[canonical_seller],
                'is_adjusted': canonical_seller != 'Individual'
            },
            'vehicle': {
                'brand': canonical_brand,
                'model': canonical_model,
                'vehicle_age': vehicle_age,
                'km_driven': km_driven,
                'seller_type': canonical_seller,
                'fuel_type': canonical_fuel,
                'transmission': canonical_transmission,
                'transmission_type': canonical_transmission,
                'mileage': mileage,
                'engine': engine,
                'max_power': max_power,
                'seats': seats
            }
        }), 200

    except Exception as e:
        logger.exception("Prediction processing error")
        return jsonify({
            'success': False,
            'message': 'Failed to process vehicle prediction. Please verify inputs.'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
