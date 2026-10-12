import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import unittest
import json
import numpy as np
import pandas as pd
from app import app, xgb_model, FEATURE_NAMES, EXCLUDED_BRANDS, SUPPORTED_BRANDS, FILTERED_SPECS, brand_map, model_map, global_mean

class TestEndToEndScenarios(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'vehicle_specs.json'), 'r') as f:
            cls.vehicle_specs = json.load(f)

    def test_01_all_16_brands_and_85_models_specs_mapping(self):
        """Verifies that all 16 supported brands return their exact filtered models."""
        total_models = 0
        for brand in SUPPORTED_BRANDS:
            res = self.client.get(f'/api/specs?brand={brand}')
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertTrue(data['success'])
            self.assertEqual(data['brand'], brand)
            models = data['options']
            self.assertGreater(len(models), 0)
            self.assertEqual(models, FILTERED_SPECS[brand])
            total_models += len(models)
        self.assertEqual(total_models, 85, "Total models across all 16 brands must be exactly 85")

    def test_02_all_85_models_have_valid_predictions(self):
        """Verifies that every single model of the 85 models can make a valid XGBoost prediction using real specs."""
        tested_pairs = set()
        for spec in self.vehicle_specs:
            b = spec['brand']
            m = spec['model']
            if (b, m) in tested_pairs:
                continue
            tested_pairs.add((b, m))

            payload = {
                'brand': b,
                'model': m,
                'vehicle_age': 4,
                'km_driven': 35000,
                'seller_type': 'Individual',
                'fuel_type': spec['fuel_type'],
                'transmission': spec['transmission'],
                'engine': spec['engine'],
                'max_power': spec['max_power'],
                'mileage': spec['mileage'],
                'seats': spec['seats']
            }
            res = self.client.post('/api/predict', json=payload)
            self.assertEqual(res.status_code, 200, f"Prediction failed for {b} {m}: {res.get_data(as_text=True)}")
            data = res.get_json()
            self.assertTrue(data['success'])
            pred = data['predicted_price']
            self.assertIsInstance(pred, (int, float))
            self.assertGreater(pred, 0, f"Predicted price for {b} {m} must be positive")

        self.assertEqual(len(tested_pairs), 85, f"Expected 85 unique brand-model pairs, tested {len(tested_pairs)}")

    def test_03_price_tiers_representation(self):
        """Verifies predictions across Low, Medium, High, and Premium tiers."""
        test_cases = [
            # Low Tier (< 3 Lakhs)
            {'brand': 'Datsun', 'model': 'RediGO', 'vehicle_age': 7, 'km_driven': 80000, 'fuel_type': 'Petrol', 'transmission': 'Manual', 'engine': 799, 'max_power': 53.3, 'mileage': 22.7, 'seats': 5, 'expected_max': 300000},
            # Medium Tier (3 - 7 Lakhs)
            {'brand': 'Maruti', 'model': 'Swift', 'vehicle_age': 4, 'km_driven': 40000, 'fuel_type': 'Petrol', 'transmission': 'Manual', 'engine': 1197, 'max_power': 81.8, 'mileage': 21.21, 'seats': 5, 'expected_min': 300000, 'expected_max': 800000},
            # High Tier (7 - 15 Lakhs)
            {'brand': 'Hyundai', 'model': 'Creta', 'vehicle_age': 2, 'km_driven': 20000, 'fuel_type': 'Diesel', 'transmission': 'Manual', 'engine': 1493, 'max_power': 113.4, 'mileage': 21.4, 'seats': 5, 'expected_min': 700000, 'expected_max': 1600000},
            # Premium Tier (> 15 Lakhs)
            {'brand': 'Toyota', 'model': 'Fortuner', 'vehicle_age': 2, 'km_driven': 25000, 'fuel_type': 'Diesel', 'transmission': 'Automatic', 'engine': 2755, 'max_power': 174.5, 'mileage': 15.04, 'seats': 7, 'expected_min': 1500000},
            {'brand': 'Volvo', 'model': 'XC90', 'vehicle_age': 3, 'km_driven': 30000, 'fuel_type': 'Diesel', 'transmission': 'Automatic', 'engine': 1969, 'max_power': 235.0, 'mileage': 15.3, 'seats': 7, 'expected_min': 2000000},
        ]

        for tc in test_cases:
            res = self.client.post('/api/predict', json=tc)
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            pred = data['predicted_price']
            if 'expected_min' in tc:
                self.assertGreaterEqual(pred, tc['expected_min'], f"{tc['brand']} {tc['model']} price {pred} below expected min {tc['expected_min']}")
            if 'expected_max' in tc:
                self.assertLessEqual(pred, tc['expected_max'], f"{tc['brand']} {tc['model']} price {pred} above expected max {tc['expected_max']}")

    def test_04_feature_encoding_and_order_verification(self):
        """Verifies that input DataFrame created matches booster expectations precisely."""
        booster = xgb_model.get_booster()
        self.assertEqual(booster.feature_names, FEATURE_NAMES)

        sample = {
            'brand': 'Maruti',
            'model': 'Swift',
            'vehicle_age': 5,
            'km_driven': 45000,
            'seller_type': 'Individual',
            'fuel_type': 'Petrol',
            'transmission': 'Manual',
            'mileage': 21.21,
            'engine': 1197,
            'max_power': 81.8,
            'seats': 5
        }
        res = self.client.post('/api/predict', json=sample)
        self.assertEqual(res.status_code, 200)
        api_pred = res.get_json()['predicted_price']

        # Manual replication of encoding & prediction
        b_enc = brand_map.get('Maruti', global_mean)
        m_enc = model_map.get('Swift', global_mean)
        row = [5, 45000, 21.21, 1197, 81.8, 5, b_enc, m_enc, 1, 0, 0, 0, 1, 1]
        df = pd.DataFrame([row], columns=FEATURE_NAMES)
        manual_log = float(xgb_model.predict(df)[0])
        manual_price = round(float(np.expm1(manual_log)))

        self.assertEqual(api_pred, manual_price, "API prediction must exactly match manual booster prediction")

    def test_05_exclusion_and_negative_test_cases(self):
        """Comprehensive check of rejected inputs."""
        # Check all 16 excluded brands
        for b in EXCLUDED_BRANDS:
            res = self.client.post('/api/predict', json={'brand': b, 'model': 'Any', 'fuel_type': 'Diesel', 'transmission': 'Manual'})
            self.assertEqual(res.status_code, 400)
            self.assertIn("excluded", res.get_json()['message'].lower())

        # Check negative km_driven
        res = self.client.post('/api/predict', json={
            'brand': 'Maruti', 'model': 'Swift', 'vehicle_age': 5, 'km_driven': -500,
            'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 20.0, 'engine': 1197, 'max_power': 82.0, 'seats': 5
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("kilometres driven", res.get_json()['message'].lower())

        # Check negative mileage
        res = self.client.post('/api/predict', json={
            'brand': 'Maruti', 'model': 'Swift', 'vehicle_age': 5, 'km_driven': 40000,
            'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': -15.0, 'engine': 1197, 'max_power': 82.0, 'seats': 5
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("mileage", res.get_json()['message'].lower())

    def test_06_verify_no_catboost_or_fallback_functions(self):
        """Verify that CatBoost and fallback calculations are completely absent from the app module."""
        import app as app_module
        self.assertFalse(hasattr(app_module, 'catboost_model'), "catboost_model should not exist in app")
        self.assertFalse(hasattr(app_module, 'calculate_resale_price'), "calculate_resale_price fallback function should not exist in app")

    def test_07_altroz_target_encoding_fallback_and_prediction(self):
        """Verifies Tata Altroz handling: missing from train encodings (84 vs 85 models), falls back to global_mean."""
        # 1. Altroz should not be in the training model_map
        self.assertNotIn('Altroz', model_map, "Altroz only existed in the test split and should not have a train encoding")
        
        # 2. Lookup falls back to global_mean exactly as in training pipeline (.fillna(global_mean))
        altroz_enc = model_map.get('Altroz', global_mean)
        self.assertEqual(altroz_enc, global_mean, "Altroz encoding should match global_mean")

        # 3. Prediction succeeds and produces a realistic price
        payload = {
            'brand': 'Tata',
            'model': 'Altroz',
            'vehicle_age': 2,
            'km_driven': 20000,
            'seller_type': 'Individual',
            'fuel_type': 'Petrol',
            'transmission': 'Manual',
            'mileage': 19.05,
            'engine': 1199,
            'max_power': 84.82,
            'seats': 5
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertGreater(data['predicted_price'], 400000)
        self.assertLess(data['predicted_price'], 1000000)

    def test_08_preprocessing_artifacts_metrics_exact_consistency(self):
        """Verifies that evaluation metrics in artifacts match the test dataset evaluation."""
        artifacts_path = os.path.join(os.path.dirname(__file__), '..', 'model', 'saved_models_filtered', 'xgb_preprocessing_artifacts.json')
        with open(artifacts_path, 'r') as f:
            art = json.load(f)
        
        test_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '..', 'dataset', 'xgb_rf_test_filtered.csv'))
        X_test = test_df.drop(columns=['selling_price_log'])
        y_test_log = test_df['selling_price_log']
        
        actual = np.expm1(y_test_log)
        pred_log = xgb_model.predict(X_test)
        pred = np.expm1(pred_log)
        
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
        mae = round(mean_absolute_error(actual, pred), 2)
        rmse = round(np.sqrt(mean_squared_error(actual, pred)), 2)
        r2 = round(r2_score(actual, pred), 4)
        
        self.assertEqual(art['evaluation_metrics']['mae'], mae)
        self.assertEqual(art['evaluation_metrics']['rmse'], rmse)
        self.assertEqual(art['evaluation_metrics']['r2'], r2)

if __name__ == '__main__':
    unittest.main()

