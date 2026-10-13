import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import unittest
import json
import numpy as np
import pandas as pd
from app import app, xgb_model, FEATURE_NAMES, EXCLUDED_BRANDS, SUPPORTED_BRANDS, FILTERED_SPECS

class TestBackendIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def test_01_model_loaded(self):
        self.assertIsNotNone(xgb_model, "XGBoost model should be loaded at startup")
        booster = xgb_model.get_booster()
        self.assertEqual(len(booster.feature_names), 14, "Model should have exactly 14 features")
        self.assertEqual(booster.feature_names, FEATURE_NAMES, "Feature names and order must match")

    def test_02_specs_endpoint_brands(self):
        response = self.client.get('/api/specs')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['type'], 'brands')
        self.assertEqual(len(data['options']), 16, "Should return exactly 16 supported brands")
        self.assertEqual(sorted(data['options']), sorted(SUPPORTED_BRANDS))

    def test_03_specs_endpoint_excluded_brands(self):
        for brand in EXCLUDED_BRANDS:
            response = self.client.get(f'/api/specs?brand={brand}')
            self.assertEqual(response.status_code, 400, f"Excluded brand {brand} should be rejected with 400")
            data = response.get_json()
            self.assertFalse(data['success'])
            self.assertIn("excluded", data['message'].lower())

    def test_04_specs_endpoint_unsupported_brands(self):
        unsupported = ["Subaru", "Tesla", "Bugatti", "NonExistentBrand"]
        for brand in unsupported:
            response = self.client.get(f'/api/specs?brand={brand}')
            self.assertEqual(response.status_code, 404, f"Unsupported brand {brand} should return 404")

    def test_05_specs_endpoint_supported_brand_models(self):
        for brand in SUPPORTED_BRANDS:
            response = self.client.get(f'/api/specs?brand={brand}')
            self.assertEqual(response.status_code, 200, f"Supported brand {brand} should return 200")
            data = response.get_json()
            self.assertTrue(data['success'])
            self.assertEqual(data['brand'], brand)
            self.assertEqual(data['options'], FILTERED_SPECS[brand])
            self.assertGreater(len(data['options']), 0, f"{brand} must have at least 1 model")

    def test_06_predict_input_validations(self):
        # Missing brand
        res = self.client.post('/api/predict', json={'model': 'Swift'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("brand", res.get_json()['message'].lower())

        # Excluded brand
        res = self.client.post('/api/predict', json={'brand': 'BMW', 'model': '3'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("excluded", res.get_json()['message'].lower())

        # Mismatched model for brand (e.g., Maruti Innova)
        res = self.client.post('/api/predict', json={'brand': 'Maruti', 'model': 'Innova'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("not a valid model", res.get_json()['message'].lower())

        # Invalid fuel
        res = self.client.post('/api/predict', json={'brand': 'Maruti', 'model': 'Swift', 'fuel_type': 'Nuclear'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("fuel", res.get_json()['message'].lower())

        # Invalid transmission
        res = self.client.post('/api/predict', json={'brand': 'Maruti', 'model': 'Swift', 'fuel_type': 'Petrol', 'transmission': 'DirectDrive'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("transmission", res.get_json()['message'].lower())

        # Negative age
        base_payload = {
            'brand': 'Maruti', 'model': 'Swift', 'fuel_type': 'Petrol', 'transmission': 'Manual',
            'km_driven': 40000, 'mileage': 20.0, 'engine': 1197, 'max_power': 82.0, 'seats': 5
        }
        res = self.client.post('/api/predict', json={**base_payload, 'vehicle_age': -3})
        self.assertEqual(res.status_code, 400)
        self.assertIn("age", res.get_json()['message'].lower())

        # Zero or negative engine
        res = self.client.post('/api/predict', json={**base_payload, 'vehicle_age': 3, 'engine': 0})
        self.assertEqual(res.status_code, 400)
        self.assertIn("engine", res.get_json()['message'].lower())

    def test_07_predict_all_16_supported_brands(self):
        samples = [
            {'brand': 'Maruti', 'model': 'Swift', 'vehicle_age': 4, 'km_driven': 35000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 21.21, 'engine': 1197, 'max_power': 81.8, 'seats': 5},
            {'brand': 'Hyundai', 'model': 'Creta', 'vehicle_age': 3, 'km_driven': 30000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 21.4, 'engine': 1493, 'max_power': 113.4, 'seats': 5},
            {'brand': 'Honda', 'model': 'City', 'vehicle_age': 5, 'km_driven': 50000, 'seller_type': 'Dealer', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 17.8, 'engine': 1497, 'max_power': 117.3, 'seats': 5},
            {'brand': 'Toyota', 'model': 'Fortuner', 'vehicle_age': 4, 'km_driven': 60000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Automatic', 'mileage': 15.04, 'engine': 2755, 'max_power': 174.5, 'seats': 7},
            {'brand': 'Tata', 'model': 'Nexon', 'vehicle_age': 2, 'km_driven': 20000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 17.0, 'engine': 1198, 'max_power': 118.3, 'seats': 5},
            {'brand': 'Mahindra', 'model': 'Scorpio', 'vehicle_age': 6, 'km_driven': 70000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 15.4, 'engine': 2179, 'max_power': 140.0, 'seats': 7},
            {'brand': 'Kia', 'model': 'Seltos', 'vehicle_age': 2, 'km_driven': 25000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Automatic', 'mileage': 16.5, 'engine': 1353, 'max_power': 138.08, 'seats': 5},
            {'brand': 'Ford', 'model': 'Ecosport', 'vehicle_age': 5, 'km_driven': 45000, 'seller_type': 'Dealer', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 21.7, 'engine': 1498, 'max_power': 98.6, 'seats': 5},
            {'brand': 'Volkswagen', 'model': 'Polo', 'vehicle_age': 4, 'km_driven': 40000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 18.24, 'engine': 999, 'max_power': 75.0, 'seats': 5},
            {'brand': 'Renault', 'model': 'KWID', 'vehicle_age': 3, 'km_driven': 25000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 25.17, 'engine': 799, 'max_power': 53.3, 'seats': 5},
            {'brand': 'Skoda', 'model': 'Octavia', 'vehicle_age': 4, 'km_driven': 35000, 'seller_type': 'Dealer', 'fuel_type': 'Petrol', 'transmission': 'Automatic', 'mileage': 15.1, 'engine': 1798, 'max_power': 177.5, 'seats': 5},
            {'brand': 'Datsun', 'model': 'GO', 'vehicle_age': 4, 'km_driven': 30000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 20.63, 'engine': 1198, 'max_power': 67.0, 'seats': 5},
            {'brand': 'Audi', 'model': 'A4', 'vehicle_age': 5, 'km_driven': 45000, 'seller_type': 'Dealer', 'fuel_type': 'Diesel', 'transmission': 'Automatic', 'mileage': 18.25, 'engine': 1968, 'max_power': 187.74, 'seats': 5},
            {'brand': 'Jaguar', 'model': 'XF', 'vehicle_age': 5, 'km_driven': 40000, 'seller_type': 'Dealer', 'fuel_type': 'Diesel', 'transmission': 'Automatic', 'mileage': 19.33, 'engine': 1999, 'max_power': 177.0, 'seats': 5},
            {'brand': 'Jeep', 'model': 'Compass', 'vehicle_age': 3, 'km_driven': 30000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 17.1, 'engine': 1956, 'max_power': 170.0, 'seats': 5},
            {'brand': 'Volvo', 'model': 'XC60', 'vehicle_age': 4, 'km_driven': 38000, 'seller_type': 'Dealer', 'fuel_type': 'Diesel', 'transmission': 'Automatic', 'mileage': 11.2, 'engine': 1969, 'max_power': 235.0, 'seats': 5},
        ]

        for sample in samples:
            res = self.client.post('/api/predict', json=sample)
            self.assertEqual(res.status_code, 200, f"Prediction failed for {sample['brand']} {sample['model']}: {res.get_data(as_text=True)}")
            data = res.get_json()
            self.assertTrue(data['success'])
            pred = data['predicted_price']
            self.assertIsInstance(pred, (int, float))
            self.assertGreater(pred, 50000, f"Predicted price should be realistic and positive for {sample['brand']} {sample['model']}")
            self.assertEqual(data['vehicle']['brand'], sample['brand'])
            self.assertEqual(data['vehicle']['model'], sample['model'])
            print(f"Predicted {sample['brand']} {sample['model']}: Rs. {pred:,.0f}")

    def test_08_predict_multiple_power_variants_same_engine(self):
        """Verifies that different power outputs for the same engine capacity are both accepted and evaluated by the model."""
        variant_pairs = [
            # Swift 1248cc Diesel Manual: 74 bhp vs 75 bhp
            (
                {'brand': 'Maruti', 'model': 'Swift', 'vehicle_age': 4, 'km_driven': 40000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 25.2, 'engine': 1248, 'max_power': 74.0, 'seats': 5},
                {'brand': 'Maruti', 'model': 'Swift', 'vehicle_age': 4, 'km_driven': 40000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 25.2, 'engine': 1248, 'max_power': 75.0, 'seats': 5}
            ),
            # Renault Duster 1461cc Diesel Manual: 85 PS (83.8 bhp) vs 110 PS (108.45 bhp)
            (
                {'brand': 'Renault', 'model': 'Duster', 'vehicle_age': 5, 'km_driven': 50000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 19.87, 'engine': 1461, 'max_power': 83.8, 'seats': 5},
                {'brand': 'Renault', 'model': 'Duster', 'vehicle_age': 5, 'km_driven': 50000, 'seller_type': 'Individual', 'fuel_type': 'Diesel', 'transmission': 'Manual', 'mileage': 19.87, 'engine': 1461, 'max_power': 108.45, 'seats': 5}
            ),
            # Volkswagen Polo 999cc Petrol Manual: MPI (75.0 bhp) vs TSI (108.62 bhp)
            (
                {'brand': 'Volkswagen', 'model': 'Polo', 'vehicle_age': 3, 'km_driven': 30000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 18.24, 'engine': 999, 'max_power': 75.0, 'seats': 5},
                {'brand': 'Volkswagen', 'model': 'Polo', 'vehicle_age': 3, 'km_driven': 30000, 'seller_type': 'Individual', 'fuel_type': 'Petrol', 'transmission': 'Manual', 'mileage': 18.24, 'engine': 999, 'max_power': 108.62, 'seats': 5}
            ),
        ]

        for v1, v2 in variant_pairs:
            res1 = self.client.post('/api/predict', json=v1)
            self.assertEqual(res1.status_code, 200, f"Failed for {v1['brand']} {v1['model']} {v1['max_power']} bhp")
            pred1 = res1.get_json()['predicted_price']

            res2 = self.client.post('/api/predict', json=v2)
            self.assertEqual(res2.status_code, 200, f"Failed for {v2['brand']} {v2['model']} {v2['max_power']} bhp")
            pred2 = res2.get_json()['predicted_price']

            self.assertGreater(pred1, 0)
            self.assertGreater(pred2, 0)
            print(f"Verified variant pricing: {v1['brand']} {v1['model']} {v1['engine']}cc ({v1['max_power']} bhp: Rs. {pred1:,.0f} vs {v2['max_power']} bhp: Rs. {pred2:,.0f})")

    def test_09_predict_canonical_hyundai_i20_diesel(self):
        """Verifies prediction with the audited and verified canonical Hyundai i20 1396cc Diesel (88.76 bhp)."""
        payload = {
            'brand': 'Hyundai',
            'model': 'i20',
            'vehicle_age': 5,
            'km_driven': 45000,
            'seller_type': 'Individual',
            'fuel_type': 'Diesel',
            'transmission': 'Manual',
            'mileage': 22.54,
            'engine': 1396,
            'max_power': 88.76,
            'seats': 5
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        pred = data['predicted_price']
        self.assertGreater(pred, 200000)
        print(f"Verified canonical Hyundai i20 Diesel (88.76 bhp): Rs. {pred:,.0f}")

if __name__ == '__main__':
    unittest.main()
