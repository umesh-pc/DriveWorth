"""
Preprocessing pipeline for the CarDekho dataset, extended with
removal of 16 specified brands (luxury/rare brands identified
in the outlier analysis).

Steps: clean -> remove specified brands -> log-transform target
       -> train/test split -> CatBoost + XGBoost/RF encoded versions
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# ----------------------------------------------------------------------
# 0. Brands to remove (exact list provided)
# ----------------------------------------------------------------------
REMOVE_BRANDS = [
    "Ferrari", "Rolls-Royce", "Bentley", "Mercedes-Benz", "Porsche",
    "Land Rover", "BMW", "Lexus", "Maserati", "Mercedes-AMG",
    "Mini", "Isuzu", "MG", "ISUZU", "Nissan", "Force"
]

RAW_PATH = r"D:\DriveWorth\dataset\cardekho_dataset.csv"
OUT_DIR = r"D:\DriveWorth\dataset"


# ----------------------------------------------------------------------
# 1. Standard cleaning (same as the original pipeline)
# ----------------------------------------------------------------------
def load_and_clean(path):
    df = pd.read_csv(path, index_col=0)

    before = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    print(f"[clean] Dropped {before - len(df)} duplicate rows")

    if "car_name" in df.columns:
        df = df.drop(columns=["car_name"])
        print("[clean] Dropped redundant 'car_name' column")

    zero_seats_mask = df["seats"] == 0
    if zero_seats_mask.any():
        overall_mode = df.loc[~zero_seats_mask, "seats"].mode()[0]
        for idx in df[zero_seats_mask].index:
            model_name = df.loc[idx, "model"]
            model_rows = df[(df["model"] == model_name) & (~zero_seats_mask)]
            fix_value = model_rows["seats"].mode()[0] if not model_rows.empty else overall_mode
            df.loc[idx, "seats"] = fix_value
        print(f"[clean] Fixed {zero_seats_mask.sum()} rows with seats == 0")

    electric_mask = (df["fuel_type"] == "Electric") & (df["engine"] > 0)
    if electric_mask.any():
        df.loc[electric_mask, "fuel_type"] = "Petrol"
        print(f"[clean] Relabeled {electric_mask.sum()} mislabeled 'Electric' rows to 'Petrol'")

    cap = df["km_driven"].quantile(0.99)
    outliers = (df["km_driven"] > cap).sum()
    df["km_driven"] = df["km_driven"].clip(upper=cap)
    print(f"[clean] Capped {outliers} km_driven outliers at {cap:,.0f} km (99th percentile)")

    return df


# ----------------------------------------------------------------------
# 2. Remove the 16 specified brands
# ----------------------------------------------------------------------
def remove_brands(df, brands_to_remove):
    before = len(df)
    removed_counts = df[df["brand"].isin(brands_to_remove)]["brand"].value_counts()
    df_filtered = df[~df["brand"].isin(brands_to_remove)].reset_index(drop=True)

    print(f"\n[brand removal] Removing {len(brands_to_remove)} brands:")
    print(removed_counts.sort_values(ascending=False))
    print(f"\n[brand removal] Rows before: {before}  |  Rows after: {len(df_filtered)}  "
          f"|  Removed: {before - len(df_filtered)}")

    missing = set(brands_to_remove) - set(removed_counts.index)
    if missing:
        print(f"[brand removal] Note: these brands were not found in the data: {missing}")

    return df_filtered


# ----------------------------------------------------------------------
# 3. Target log-transform
# ----------------------------------------------------------------------
def add_log_target(df):
    df["selling_price_log"] = np.log1p(df["selling_price"])
    return df


# ----------------------------------------------------------------------
# 4. Train/test split
# ----------------------------------------------------------------------
def split_data(df, test_size=0.2, random_state=42):
    train_df, test_df = train_test_split(
        df, test_size=test_size, random_state=random_state,
        stratify=df["transmission_type"]
    )
    print(f"\n[split] Train: {len(train_df)} rows | Test: {len(test_df)} rows")
    return train_df.reset_index(drop=True), test_df.reset_index(drop=True)


# ----------------------------------------------------------------------
# 5a. CatBoost version
# ----------------------------------------------------------------------
def prepare_catboost(train_df, test_df):
    cat_features = ["brand", "model", "seller_type", "fuel_type", "transmission_type"]
    train_cb, test_cb = train_df.copy(), test_df.copy()
    for col in cat_features:
        train_cb[col] = train_cb[col].astype(str)
        test_cb[col] = test_cb[col].astype(str)
    return train_cb, test_cb, cat_features


# ----------------------------------------------------------------------
# 5b. XGBoost/RandomForest version (smoothed target encoding + one-hot)
# ----------------------------------------------------------------------
def target_encode(train_df, test_df, col, target_col, smoothing=10):
    global_mean = train_df[target_col].mean()
    stats = train_df.groupby(col)[target_col].agg(["mean", "count"])
    smoothed = (stats["mean"] * stats["count"] + global_mean * smoothing) / (stats["count"] + smoothing)
    train_encoded = train_df[col].map(smoothed)
    test_encoded = test_df[col].map(smoothed).fillna(global_mean)
    return train_encoded, test_encoded


def prepare_xgb_rf(train_df, test_df):
    train_x, test_x = train_df.copy(), test_df.copy()

    onehot_cols = ["seller_type", "fuel_type", "transmission_type"]
    combined = pd.concat([train_x[onehot_cols], test_x[onehot_cols]], keys=["train", "test"])
    combined_ohe = pd.get_dummies(combined, columns=onehot_cols, drop_first=True)
    train_ohe = combined_ohe.loc["train"].reset_index(drop=True)
    test_ohe = combined_ohe.loc["test"].reset_index(drop=True)

    for col in ["brand", "model"]:
        train_x[f"{col}_encoded"], test_x[f"{col}_encoded"] = target_encode(
            train_x, test_x, col, target_col="selling_price"
        )

    drop_cols = ["brand", "model", "seller_type", "fuel_type", "transmission_type", "selling_price"]
    train_final = pd.concat([train_x.drop(columns=drop_cols), train_ohe], axis=1)
    test_final = pd.concat([test_x.drop(columns=drop_cols), test_ohe], axis=1)
    return train_final, test_final


# ----------------------------------------------------------------------
# MAIN
# ----------------------------------------------------------------------
def main():
    print("=" * 60); print("STEP 1: Load & clean"); print("=" * 60)
    df = load_and_clean(RAW_PATH)

    print("\n" + "=" * 60); print("STEP 2: Remove specified brands"); print("=" * 60)
    df = remove_brands(df, REMOVE_BRANDS)

    df = add_log_target(df)

    print("\n" + "=" * 60); print("STEP 3: Train/test split"); print("=" * 60)
    train_df, test_df = split_data(df)

    print("\n" + "=" * 60); print("STEP 4: CatBoost version"); print("=" * 60)
    train_cb, test_cb, cat_features = prepare_catboost(train_df, test_df)
    train_cb.to_csv(f"{OUT_DIR}\\catboost_train_filtered.csv", index=False)
    test_cb.to_csv(f"{OUT_DIR}\\catboost_test_filtered.csv", index=False)

    print("\n" + "=" * 60); print("STEP 5: XGBoost/RandomForest version"); print("=" * 60)
    train_xgb, test_xgb = prepare_xgb_rf(train_df, test_df)
    train_xgb.to_csv(f"{OUT_DIR}\\xgb_rf_train_filtered.csv", index=False)
    test_xgb.to_csv(f"{OUT_DIR}\\xgb_rf_test_filtered.csv", index=False)

    df.to_csv(f"{OUT_DIR}\\cardekho_cleaned_filtered.csv", index=False)

    print("\n" + "=" * 60)
    print("DONE. Filtered files saved to:", OUT_DIR)
    print("=" * 60)
    print("  cardekho_cleaned_filtered.csv")
    print("  catboost_train_filtered.csv / catboost_test_filtered.csv")
    print("  xgb_rf_train_filtered.csv / xgb_rf_test_filtered.csv")
    print(f"\nRemaining brands: {df['brand'].nunique()}")
    print(f"Remaining rows: {len(df)}")


if __name__ == "__main__":
    main()