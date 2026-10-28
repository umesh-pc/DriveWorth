import json
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

ARTIFACTS_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgb_preprocessing_artifacts.json"
MODEL_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgboost_filtered.json"

with open(ARTIFACTS_PATH, "r", encoding="utf-8") as f:
    artifacts = json.load(f)

global_mean = artifacts["global_mean"]
brand_map = artifacts["brand_encoded_map"]
model_map = artifacts["model_encoded_map"]
feature_names = artifacts["features"]

xgb_model = XGBRegressor()
xgb_model.load_model(MODEL_PATH)

def get_row(mileage_val):
    return {
        'vehicle_age': 5,
        'km_driven': 45000,
        'mileage': float(mileage_val),
        'engine': 1396,
        'max_power': 88.76,
        'seats': 5,
        'brand_encoded': float(brand_map.get('Hyundai', global_mean)),
        'model_encoded': float(model_map.get('i20', global_mean)),
        'seller_type_Individual': 1,
        'seller_type_Trustmark Dealer': 0,
        'fuel_type_Diesel': 1,
        'fuel_type_LPG': 0,
        'fuel_type_Petrol': 0,
        'transmission_type_Manual': 1
    }

df_10 = pd.DataFrame([get_row(10.0)], columns=feature_names)
df_18 = pd.DataFrame([get_row(18.0)], columns=feature_names)
df_2254 = pd.DataFrame([get_row(22.54)], columns=feature_names)

pred_log_10 = float(xgb_model.predict(df_10)[0])
pred_log_18 = float(xgb_model.predict(df_18)[0])
pred_log_2254 = float(xgb_model.predict(df_2254)[0])

price_10 = round(float(np.expm1(pred_log_10)))
price_18 = round(float(np.expm1(pred_log_18)))
price_2254 = round(float(np.expm1(pred_log_2254)))

print(f"Prediction for mileage = 10.00 km/l: Rs. {price_10:,} (log: {pred_log_10:.6f})")
print(f"Prediction for mileage = 18.00 km/l: Rs. {price_18:,} (log: {pred_log_18:.6f})")
print(f"Prediction for mileage = 22.54 km/l (canonical dataset spec): Rs. {price_2254:,} (log: {pred_log_2254:.6f})")

# Let's inspect SHAP values or leaf values across all 300 trees
booster = xgb_model.get_booster()

import xgboost as xgb
dmatrix_10 = xgb.DMatrix(df_10)
dmatrix_18 = xgb.DMatrix(df_18)
dmatrix_2254 = xgb.DMatrix(df_2254)

shap_10 = booster.predict(dmatrix_10, pred_contribs=True)[0]
shap_18 = booster.predict(dmatrix_18, pred_contribs=True)[0]
shap_2254 = booster.predict(dmatrix_2254, pred_contribs=True)[0]

features_with_bias = feature_names + ['bias (base value)']

shap_df = pd.DataFrame({
    'Feature': features_with_bias,
    'SHAP (10 km/l)': shap_10,
    'SHAP (18 km/l)': shap_18,
    'SHAP (22.54 km/l)': shap_2254,
    'Diff (10 - 18)': shap_10 - shap_18
})

print("\n=== EXACT TREE-SHAP FEATURE CONTRIBUTIONS ===")
print(shap_df.to_string(index=False))

# Now let's trace every tree where the prediction changes between 10 km/l and 18 km/l
trees_dump = booster.get_dump(dump_format='json')

tree_diffs = []
for i, t_json in enumerate(trees_dump):
    # Predict with single tree
    p10 = booster.predict(dmatrix_10, iteration_range=(i, i+1))[0]
    p18 = booster.predict(dmatrix_18, iteration_range=(i, i+1))[0]
    if abs(p10 - p18) > 1e-6:
        tree_diffs.append((i, p10, p18, p10 - p18))

print(f"\nNumber of trees where leaf output differs between 10 km/l and 18 km/l: {len(tree_diffs)} out of 300")
print("Top 10 trees with biggest difference:")
for idx, p10, p18, d in sorted(tree_diffs, key=lambda x: abs(x[3]), reverse=True)[:10]:
    print(f"  Tree #{idx:3d}: leaf_10 = {p10:+.5f}, leaf_18 = {p18:+.5f}, diff = {d:+.5f}")
