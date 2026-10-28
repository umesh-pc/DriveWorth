import json
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

DATASET_CSV_PATH = r"d:\DriveWorth\dataset\cardekho_cleaned_filtered.csv"
TRAIN_CSV_PATH = r"d:\DriveWorth\dataset\xgb_rf_train_filtered.csv"
MODEL_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgboost_filtered.json"
ARTIFACTS_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgb_preprocessing_artifacts.json"

clean_df = pd.read_csv(DATASET_CSV_PATH)
train_df = pd.read_csv(TRAIN_CSV_PATH)

with open(ARTIFACTS_PATH, "r", encoding="utf-8") as f:
    artifacts = json.load(f)

global_mean = artifacts["global_mean"]
brand_map = artifacts["brand_encoded_map"]
model_map = artifacts["model_encoded_map"]
feature_names = artifacts["features"]

xgb_model = XGBRegressor()
xgb_model.load_model(MODEL_PATH)
booster = xgb_model.get_booster()

print("=== 1. FEATURE IMPORTANCE (GAIN, WEIGHT, COVER) ===")
score_gain = booster.get_score(importance_type='gain')
score_weight = booster.get_score(importance_type='weight')
score_cover = booster.get_score(importance_type='cover')

fi_df = pd.DataFrame({
    'Feature': feature_names,
    'Gain': [score_gain.get(f, 0) for f in feature_names],
    'Weight (Splits)': [score_weight.get(f, 0) for f in feature_names],
    'Cover': [score_cover.get(f, 0) for f in feature_names]
}).sort_values('Gain', ascending=False)
print(fi_df.to_string(index=False))

print("\n=== 2. VEHICLE DISTRIBUTION AT LOW VS HIGH MILEAGE ===")
print("Top 10 models with mileage <= 12 km/l:")
low_models = clean_df[clean_df['mileage'] <= 12]['model'].value_counts().head(10)
print(low_models)

print("\nTop 10 models with mileage >= 22 km/l:")
high_models = clean_df[clean_df['mileage'] >= 22]['model'].value_counts().head(10)
print(high_models)

print("\n=== 3. DETAILED SENSITIVITY SWEEP (mileage 5 to 30 km/l) ===")
def predict_raw(m):
    row = {
        'vehicle_age': 5,
        'km_driven': 45000,
        'mileage': float(m),
        'engine': 1396,
        'max_power': 88.76,
        'seats': 5,
        'brand_encoded': float(brand_map['Hyundai']),
        'model_encoded': float(model_map['i20']),
        'seller_type_Individual': 1,
        'seller_type_Trustmark Dealer': 0,
        'fuel_type_Diesel': 1,
        'fuel_type_LPG': 0,
        'fuel_type_Petrol': 0,
        'transmission_type_Manual': 1
    }
    df = pd.DataFrame([row], columns=feature_names)
    pred_log = float(xgb_model.predict(df)[0])
    price = round(float(np.expm1(pred_log)))
    return pred_log, price

sweep_points = [5, 8, 10, 11, 12, 12.5, 12.8, 12.9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21.19, 21.9, 22, 22.54, 23, 24, 25, 26, 28, 30]
sweep_data = []
for m in sweep_points:
    plog, p = predict_raw(m)
    sweep_data.append({'mileage': m, 'pred_log': plog, 'predicted_price': p})

sw_df = pd.DataFrame(sweep_data)
sw_df['delta_from_canonical_22.54'] = sw_df['predicted_price'] - 622727
print(sw_df.to_string(index=False))

print("\n=== 4. CHECK HYUNDAI i20 DIESEL TRAINING SAMPLES ===")
i20_d = clean_df[(clean_df['brand'] == 'Hyundai') & (clean_df['model'] == 'i20') & (clean_df['fuel_type'] == 'Diesel')]
print(f"Total i20 Diesel samples: {len(i20_d)}")
print("Correlation in i20 Diesel subset between mileage and price:", i20_d['mileage'].corr(i20_d['selling_price']))
print("Unique mileage values in i20 Diesel:", sorted(i20_d['mileage'].unique()))
