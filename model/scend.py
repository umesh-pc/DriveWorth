"""
Test two fixes for prediction-range compression (models never
predict as low or as high as the true min/max):

  1. Loosened tree constraints (smaller leaves -> less averaging)
  2. Sample weighting on extreme-price rows (loss cares more
     about getting the tails right)

Compares against the original (unmodified) XGBoost as a baseline.
"""

import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_DIR = r"D:\DriveWorth\dataset"
TRAIN_PATH = f"{DATA_DIR}\\xgb_rf_train_filtered.csv"
TEST_PATH = f"{DATA_DIR}\\xgb_rf_test_filtered.csv"
TARGET_COL = "selling_price_log"

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(TEST_PATH)

X_train = train_df.drop(columns=[TARGET_COL])
y_train = train_df[TARGET_COL]
X_test = test_df.drop(columns=[TARGET_COL])
y_test = test_df[TARGET_COL]

actual_train_price = np.expm1(y_train)
actual_test_price = np.expm1(y_test)


def evaluate(name, model, weights=None):
    if weights is not None:
        model.fit(X_train, y_train, sample_weight=weights)
    else:
        model.fit(X_train, y_train)

    pred_log = model.predict(X_test)
    pred_price = np.expm1(pred_log)
    actual_price = actual_test_price.values

    mae = mean_absolute_error(actual_price, pred_price)
    rmse = np.sqrt(mean_squared_error(actual_price, pred_price))
    r2 = r2_score(actual_price, pred_price)

    print(f"\n{'='*65}\n{name}\n{'='*65}")
    print(f"MAE:  Rs.{mae:,.0f}   RMSE: Rs.{rmse:,.0f}   R2: {r2:.4f}")
    print(f"Predicted range: Rs.{pred_price.min():,.0f}  to  Rs.{pred_price.max():,.0f}")
    print(f"Actual range:    Rs.{actual_price.min():,.0f}  to  Rs.{actual_price.max():,.0f}")
    min_gap = 100 * (pred_price.min() - actual_price.min()) / actual_price.min()
    max_gap = 100 * (pred_price.max() - actual_price.max()) / actual_price.max()
    print(f"Min gap: {min_gap:+.1f}%   Max gap: {max_gap:+.1f}%   "
          f"(0% = perfectly matches true range)")
    return {"model": name, "mae": mae, "rmse": rmse, "r2": r2,
            "pred_min": pred_price.min(), "pred_max": pred_price.max(),
            "min_gap_pct": min_gap, "max_gap_pct": max_gap}


results = []

# ------------------------------------------------------------
# Baseline: original settings (for comparison)
# ------------------------------------------------------------
baseline = XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6,
                         random_state=42, n_jobs=-1)
results.append(evaluate("BASELINE (original settings)", baseline))

# ------------------------------------------------------------
# Fix 1: Loosened tree constraints (deeper trees, smaller leaves)
# ------------------------------------------------------------
loosened = XGBRegressor(
    n_estimators=400, learning_rate=0.05, max_depth=9,
    min_child_weight=1,      # default is 1, but set explicitly -- allows small leaves
    subsample=0.9, colsample_bytree=0.9,
    random_state=42, n_jobs=-1
)
results.append(evaluate("FIX 1: Loosened tree constraints", loosened))

# ------------------------------------------------------------
# Fix 2: Sample weighting -- weight extreme-price rows more heavily
# ------------------------------------------------------------
# Weight scales with how far a row's price is from the median (in log space),
# so both very cheap and very expensive cars get more attention.
weighted = XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6,
                         random_state=42, n_jobs=-1)
median_log_price = y_train.median()
weights = 1 + np.abs(y_train - median_log_price)
results.append(evaluate("FIX 2: Sample weighting on extremes", weighted, weights=weights))

# ------------------------------------------------------------
# Fix 3: Both combined
# ------------------------------------------------------------
combined = XGBRegressor(
    n_estimators=400, learning_rate=0.05, max_depth=9,
    min_child_weight=1, subsample=0.9, colsample_bytree=0.9,
    random_state=42, n_jobs=-1
)
results.append(evaluate("FIX 3: Loosened constraints + sample weighting", combined, weights=weights))

# ------------------------------------------------------------
# Final comparison table
# ------------------------------------------------------------
print("\n" + "=" * 65)
print("SUMMARY -- did the fixes actually widen the range without hurting accuracy?")
print("=" * 65)
summary = pd.DataFrame(results).set_index("model")
print(summary.round(2))