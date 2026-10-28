import os
import json
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

# Paths
DATASET_CSV_PATH = r"d:\DriveWorth\dataset\cardekho_cleaned_filtered.csv"
TRAIN_CSV_PATH = r"d:\DriveWorth\dataset\xgb_rf_train_filtered.csv"
TEST_CSV_PATH = r"d:\DriveWorth\dataset\xgb_rf_test_filtered.csv"
MODEL_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgboost_filtered.json"
ARTIFACTS_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgb_preprocessing_artifacts.json"

print("=" * 70)
print("INVESTIGATION: COUNTERINTUITIVE MILEAGE PREDICTION IN DRIVEWORTH")
print("=" * 70)

# Load artifacts
with open(ARTIFACTS_PATH, "r", encoding="utf-8") as f:
    artifacts = json.load(f)

global_mean = artifacts["global_mean"]
brand_map = artifacts["brand_encoded_map"]
model_map = artifacts["model_encoded_map"]
feature_names = artifacts["features"]

# Load model
xgb_model = XGBRegressor()
xgb_model.load_model(MODEL_PATH)
print("Model and artifacts loaded successfully.")

# Base vehicle specs
base_vehicle = {
    'brand': 'Hyundai',
    'model': 'i20',
    'vehicle_age': 5,
    'km_driven': 45000,
    'seller_type': 'Individual',
    'fuel_type': 'Diesel',
    'transmission': 'Manual',
    'transmission_type': 'Manual',
    'engine': 1396,
    'max_power': 88.76,
    'seats': 5
}

def make_prediction(mileage_val):
    brand_encoded = float(brand_map.get('Hyundai', global_mean))
    model_encoded = float(model_map.get('i20', global_mean))

    row = {
        'vehicle_age': base_vehicle['vehicle_age'],
        'km_driven': base_vehicle['km_driven'],
        'mileage': float(mileage_val),
        'engine': base_vehicle['engine'],
        'max_power': base_vehicle['max_power'],
        'seats': base_vehicle['seats'],
        'brand_encoded': brand_encoded,
        'model_encoded': model_encoded,
        'seller_type_Individual': 1,
        'seller_type_Trustmark Dealer': 0,
        'fuel_type_Diesel': 1,
        'fuel_type_LPG': 0,
        'fuel_type_Petrol': 0,
        'transmission_type_Manual': 1
    }
    df = pd.DataFrame([row], columns=feature_names)
    pred_log = float(xgb_model.predict(df)[0])
    raw_price = float(np.expm1(pred_log))
    return df, pred_log, round(raw_price), raw_price

# Task 1 & 2: Compare Prediction A (18) vs Prediction B (10)
df_18, log_18, price_18, raw_18 = make_prediction(18.0)
df_10, log_10, price_10, raw_10 = make_prediction(10.0)

print(f"\n--- Task 1 & 5: Reproduce Predictions ---")
print(f"Prediction A (mileage = 18.0 km/l): log={log_18:.6f}, Price=Rs. {price_18:,} (raw: {raw_18:.2f})")
print(f"Prediction B (mileage = 10.0 km/l): log={log_10:.6f}, Price=Rs. {price_10:,} (raw: {raw_10:.2f})")
diff = price_10 - price_18
print(f"Price Difference (10 km/l minus 18 km/l): Rs. {diff:+,} ({diff/price_18*100:+.2f}%)")

print("\n--- Task 2: Feature Row Comparison (Confirming Difference is ONLY Mileage) ---")
comp_df = pd.concat([df_18, df_10], keys=['18 km/l', '10 km/l'])
diff_cols = [c for c in feature_names if df_18[c].iloc[0] != df_10[c].iloc[0]]
print(f"Columns that differ: {diff_cols}")
for col in feature_names:
    val_18 = df_18[col].iloc[0]
    val_10 = df_10[col].iloc[0]
    match_str = "MATCH" if val_18 == val_10 else "DIFFER"
    print(f"  {col:<30}: 18km/l -> {val_18:<15} | 10km/l -> {val_10:<15} [{match_str}]")

# Task 3: Feature alignment with training data
train_df = pd.read_csv(TRAIN_CSV_PATH)
train_features = [c for c in train_df.columns if c != "selling_price_log"]
print("\n--- Task 3 & 4: Feature Order Alignment with Training Data ---")
print(f"Training feature count: {len(train_features)}")
print(f"Artifacts feature count: {len(feature_names)}")
is_exact_order = train_features == feature_names
print(f"Is exact order match: {is_exact_order}")
if not is_exact_order:
    print(f"Train features: {train_features}")
    print(f"Artifact features: {feature_names}")

# Task 6: Inspect training dataset for i20 and overall dataset
print("\n--- Task 6: Training Data Analysis for Hyundai i20 & Mileage ---")
clean_df = pd.read_csv(DATASET_CSV_PATH)

i20_df = clean_df[(clean_df['brand'] == 'Hyundai') & (clean_df['model'] == 'i20')]
print(f"Total Hyundai i20 cars in filtered dataset: {len(i20_df)}")
print(f"Hyundai i20 mileage min={i20_df['mileage'].min()}, max={i20_df['mileage'].max()}, mean={i20_df['mileage'].mean():.2f}, median={i20_df['mileage'].median():.2f}")

i20_diesel = i20_df[i20_df['fuel_type'] == 'Diesel']
print(f"Hyundai i20 Diesel count: {len(i20_diesel)}")
print(f"Hyundai i20 Diesel mileage range: min={i20_diesel['mileage'].min()}, max={i20_diesel['mileage'].max()}, mean={i20_diesel['mileage'].mean():.2f}, median={i20_diesel['mileage'].median():.2f}")
print("\nHyundai i20 Diesel samples (mileage, engine, max_power, selling_price):")
print(i20_diesel[['vehicle_age', 'km_driven', 'mileage', 'engine', 'max_power', 'selling_price']].sort_values('mileage').to_string())

# Overall correlation between mileage and price in training data
corr_all = clean_df['mileage'].corr(clean_df['selling_price'])
corr_log = clean_df['mileage'].corr(np.log1p(clean_df['selling_price']))
print(f"\nOverall dataset correlation between mileage and selling_price: {corr_all:.4f}")
print(f"Overall dataset correlation between mileage and log(selling_price): {corr_log:.4f}")

# Task 7: Controlled Sensitivity Analysis across mileage
print("\n--- Task 7: Controlled Sensitivity Analysis across Mileage ---")
mileage_grid = [5.0, 8.0, 10.0, 12.0, 14.0, 15.0, 16.0, 17.0, 18.0, 19.0, 20.0, 21.0, 21.99, 22.0, 22.54, 23.0, 24.0, 25.0, 26.0, 28.0, 30.0]
results = []
for m in mileage_grid:
    _, pred_log, price, _ = make_prediction(m)
    results.append({'mileage': m, 'pred_log': pred_log, 'predicted_price': price})

res_df = pd.DataFrame(results)
print(res_df.to_string(index=False))

# Tree inspection: Which trees split on mileage?
print("\n--- Tree Structure Inspection: Splits on 'mileage' ---")
booster = xgb_model.get_booster()
trees_dump = booster.get_dump(dump_format='json')
print(f"Total trees in XGBoost model: {len(trees_dump)}")

# Count how many trees use mileage
trees_using_mileage = 0
mileage_splits = []

def parse_tree_nodes(node, tree_idx):
    if 'split' in node:
        if node['split'] == 'mileage':
            mileage_splits.append({
                'tree': tree_idx,
                'split_condition': node.get('split_condition'),
                'yes': node.get('yes'),
                'no': node.get('no')
            })
        if 'children' in node:
            for child in node['children']:
                parse_tree_nodes(child, tree_idx)

for i, t_json in enumerate(trees_dump):
    t_dict = json.loads(t_json)
    prev_count = len(mileage_splits)
    parse_tree_nodes(t_dict, i)
    if len(mileage_splits) > prev_count:
        trees_using_mileage += 1

print(f"Trees with splits on 'mileage': {trees_using_mileage} out of {len(trees_dump)} ({trees_using_mileage/len(trees_dump)*100:.1f}%)")
print(f"Total split nodes on 'mileage': {len(mileage_splits)}")
split_conds = [s['split_condition'] for s in mileage_splits]
print(f"Mileage split points summary: min={min(split_conds):.2f}, max={max(split_conds):.2f}, median={np.median(split_conds):.2f}")
print(f"Sample of mileage split points: {sorted(split_conds)[:15]}")
