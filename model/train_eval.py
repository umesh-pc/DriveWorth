"""
Train Random Forest, XGBoost, and CatBoost on the brand-filtered
dataset, and report for each model:
  - MAE, RMSE, R2 (train AND test, to check for overfitting)
  - Price-tier confusion matrix + accuracy (train AND test)
  - Separate TRAINING and TESTING accuracy blocks
  - Prediction statistics (actual vs predicted: min/max/mean/median/std)
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from catboost import CatBoostRegressor
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    confusion_matrix, accuracy_score
)

# ----------------------------------------------------------------------
# Paths (filtered files from preprocess_with_brand_removal.py)
# ----------------------------------------------------------------------
DATA_DIR = r"D:\DriveWorth\dataset"
MODEL_DIR = r"D:\DriveWorth\model\saved_models_filtered"
os.makedirs(MODEL_DIR, exist_ok=True)
XGB_RF_TRAIN = f"{DATA_DIR}\\xgb_rf_train_filtered.csv"
XGB_RF_TEST = f"{DATA_DIR}\\xgb_rf_test_filtered.csv"
CB_TRAIN = f"{DATA_DIR}\\catboost_train_filtered.csv"
CB_TEST = f"{DATA_DIR}\\catboost_test_filtered.csv"
TARGET_COL = "selling_price_log"
CAT_FEATURES = ["brand", "model", "seller_type", "fuel_type", "transmission_type"]

TIER_BINS = [0, 300000, 700000, 1500000, np.inf]
TIER_LABELS = ["Low", "Medium", "High", "Premium"]


# ----------------------------------------------------------------------
# Helper: compute MAE/RMSE/R2/tier-accuracy for one split (train or test)
# ----------------------------------------------------------------------
def compute_metrics(y_log, y_pred_log):
    actual = np.expm1(y_log).reset_index(drop=True) if hasattr(y_log, "reset_index") else pd.Series(np.expm1(y_log))
    pred = pd.Series(np.expm1(y_pred_log))

    mae = mean_absolute_error(actual, pred)
    rmse = np.sqrt(mean_squared_error(actual, pred))
    r2 = r2_score(actual, pred)

    actual_tier = pd.cut(actual, bins=TIER_BINS, labels=TIER_LABELS)
    pred_tier = pd.cut(pred, bins=TIER_BINS, labels=TIER_LABELS)
    acc = accuracy_score(actual_tier, pred_tier) * 100
    cm = confusion_matrix(actual_tier, pred_tier, labels=TIER_LABELS)
    cm_df = pd.DataFrame(cm, index=TIER_LABELS, columns=TIER_LABELS)

    return {"mae": mae, "rmse": rmse, "r2": r2, "accuracy": acc,
            "confusion_matrix": cm_df, "actual": actual, "pred": pred}


# ----------------------------------------------------------------------
# Helper: print TRAINING and TESTING accuracy separately
# ----------------------------------------------------------------------
def print_separate_accuracy(model_name, train_m, test_m):
    print(f"\n{'-'*65}")
    print(f"{model_name} - TRAINING ACCURACY")
    print(f"{'-'*65}")
    print(f"  Price-Tier Accuracy : {train_m['accuracy']:.2f} %")
    print(f"  R2 Score            : {train_m['r2']:.4f}  ({train_m['r2']*100:.2f} %)")
    print(f"  MAE                 : Rs. {train_m['mae']:,.2f}")
    print(f"  RMSE                : Rs. {train_m['rmse']:,.2f}")

    print(f"\n{'-'*65}")
    print(f"{model_name} - TESTING ACCURACY")
    print(f"{'-'*65}")
    print(f"  Price-Tier Accuracy : {test_m['accuracy']:.2f} %")
    print(f"  R2 Score            : {test_m['r2']:.4f}  ({test_m['r2']*100:.2f} %)")
    print(f"  MAE                 : Rs. {test_m['mae']:,.2f}")
    print(f"  RMSE                : Rs. {test_m['rmse']:,.2f}")


# ----------------------------------------------------------------------
# Helper: evaluate + print both TRAIN and TEST metrics
# ----------------------------------------------------------------------
def evaluate(model_name, y_train_log, y_train_pred_log, y_test_log, y_test_pred_log):
    train_m = compute_metrics(y_train_log, y_train_pred_log)
    test_m = compute_metrics(y_test_log, y_test_pred_log)

    # Separate training / testing accuracy blocks
    print_separate_accuracy(model_name, train_m, test_m)

    print(f"\n{'='*65}\n{model_name} - TRAIN vs TEST METRICS\n{'='*65}")
    comp = pd.DataFrame({
        "Train": [train_m["mae"], train_m["rmse"], train_m["r2"], train_m["accuracy"]],
        "Test":  [test_m["mae"], test_m["rmse"], test_m["r2"], test_m["accuracy"]]
    }, index=["MAE (Rs.)", "RMSE (Rs.)", "R2", "Price-Tier Accuracy (%)"])
    print(comp.round(4))

    gap = train_m["accuracy"] - test_m["accuracy"]
    print(f"\nTrain - Test accuracy gap: {gap:+.2f} percentage points")
    if gap > 5:
        print("  -> Gap > 5 points: possible sign of overfitting.")
    else:
        print("  -> Gap is small: model generalizes reasonably well.")

    print(f"\n{model_name} - TRAIN SET PRICE-TIER CONFUSION MATRIX")
    print(train_m["confusion_matrix"])

    print(f"\n{model_name} - TEST SET PRICE-TIER CONFUSION MATRIX")
    print(test_m["confusion_matrix"])

    stats = pd.DataFrame({
        "Actual": [test_m["actual"].min(), test_m["actual"].max(), test_m["actual"].mean(),
                   test_m["actual"].median(), test_m["actual"].std()],
        "Predicted": [test_m["pred"].min(), test_m["pred"].max(), test_m["pred"].mean(),
                      test_m["pred"].median(), test_m["pred"].std()]
    }, index=["Minimum", "Maximum", "Mean", "Median", "Standard Deviation"])
    print(f"\n{model_name} - PREDICTION STATISTICS (Unseen Test Data)")
    print(stats.round(2))

    return {"model": model_name,
            "train_mae": train_m["mae"], "train_rmse": train_m["rmse"],
            "train_r2": train_m["r2"], "train_accuracy": train_m["accuracy"],
            "test_mae": test_m["mae"], "test_rmse": test_m["rmse"],
            "test_r2": test_m["r2"], "test_accuracy": test_m["accuracy"]}


# ----------------------------------------------------------------------
# 1. Random Forest
# ----------------------------------------------------------------------
def run_random_forest():
    train_df = pd.read_csv(XGB_RF_TRAIN)
    test_df = pd.read_csv(XGB_RF_TEST)
    X_train = train_df.drop(columns=[TARGET_COL])
    y_train = train_df[TARGET_COL]
    X_test = test_df.drop(columns=[TARGET_COL])
    y_test = test_df[TARGET_COL]

    model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    model_path = os.path.join(MODEL_DIR, "random_forest_filtered.pkl")
    joblib.dump(model, model_path)
    print(f"\n[saved] Random Forest model -> {model_path}")

    return evaluate("Random Forest", y_train, y_train_pred, y_test, y_test_pred)


# ----------------------------------------------------------------------
# 2. XGBoost
# ----------------------------------------------------------------------
def run_xgboost():
    train_df = pd.read_csv(XGB_RF_TRAIN)
    test_df = pd.read_csv(XGB_RF_TEST)
    X_train = train_df.drop(columns=[TARGET_COL])
    y_train = train_df[TARGET_COL]
    X_test = test_df.drop(columns=[TARGET_COL])
    y_test = test_df[TARGET_COL]

    model = XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6,
                         random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    model_path = os.path.join(MODEL_DIR, "xgboost_filtered.json")
    model.save_model(model_path)
    print(f"\n[saved] XGBoost model -> {model_path}")

    return evaluate("XGBoost", y_train, y_train_pred, y_test, y_test_pred)


# ----------------------------------------------------------------------
# 3. CatBoost
# ----------------------------------------------------------------------
def run_catboost():
    train_df = pd.read_csv(CB_TRAIN)
    test_df = pd.read_csv(CB_TEST)
    X_train = train_df.drop(columns=[TARGET_COL, "selling_price"])
    y_train = train_df[TARGET_COL]
    X_test = test_df.drop(columns=[TARGET_COL, "selling_price"])
    y_test = test_df[TARGET_COL]

    model = CatBoostRegressor(iterations=300, learning_rate=0.05, depth=6,
                              cat_features=CAT_FEATURES, random_state=42, verbose=False)
    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    model_path = os.path.join(MODEL_DIR, "catboost_filtered.cbm")
    model.save_model(model_path)
    print(f"\n[saved] CatBoost model -> {model_path}")

    return evaluate("CatBoost", y_train, y_train_pred, y_test, y_test_pred)


# ----------------------------------------------------------------------
# MAIN
# ----------------------------------------------------------------------
def main():
    results = []
    results.append(run_random_forest())
    results.append(run_xgboost())
    results.append(run_catboost())

    comparison = pd.DataFrame(results).set_index("model")

    print("\n" + "=" * 65)
    print("FINAL MODEL COMPARISON -- TRAIN vs TEST (filtered dataset)")
    print("=" * 65)
    print(comparison.round(4))

    print("\n" + "=" * 65)
    print("TRAINING ACCURACY SUMMARY (Price-Tier %)")
    print("=" * 65)
    print(comparison[["train_accuracy"]].round(2))

    print("\n" + "=" * 65)
    print("TESTING ACCURACY SUMMARY (Price-Tier %)")
    print("=" * 65)
    print(comparison[["test_accuracy"]].round(2))


if __name__ == "__main__":
    main()