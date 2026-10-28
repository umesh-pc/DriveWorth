import pandas as pd
import numpy as np

df = pd.read_csv(r"d:\DriveWorth\dataset\cardekho_cleaned_filtered.csv")

print("=== All Hyundai i20 rows ===")
i20 = df[(df['brand'] == 'Hyundai') & (df['model'] == 'i20')]
print("Count:", len(i20))
print(i20['mileage'].value_counts())
print("\n=== Hyundai i20 Diesel rows ===")
i20_diesel = i20[i20['fuel_type'] == 'Diesel']
print("Count:", len(i20_diesel))
print(i20_diesel['mileage'].value_counts())

print("\n=== Hyundai i20 Petrol rows ===")
i20_petrol = i20[i20['fuel_type'] == 'Petrol']
print("Count:", len(i20_petrol))
print(i20_petrol['mileage'].value_counts())

print("\n=== Any Hyundai i20 with mileage <= 15 km/l? ===")
print(i20[i20['mileage'] <= 15][['brand', 'model', 'vehicle_age', 'fuel_type', 'engine', 'max_power', 'mileage', 'selling_price']])

print("\n=== Dataset mileage statistics by vehicle segment / brand ===")
print("Cars with mileage <= 12 km/l:")
low_m = df[df['mileage'] <= 12]
print(f"Count of cars with mileage <= 12: {len(low_m)}")
print(f"Mean price of cars with mileage <= 12: Rs. {low_m['selling_price'].mean():,.0f}")
print("Cars with mileage between 18 and 22 km/l:")
mid_m = df[(df['mileage'] >= 18) & (df['mileage'] <= 22)]
print(f"Count of cars with mileage 18-22: {len(mid_m)}")
print(f"Mean price of cars with mileage 18-22: Rs. {mid_m['selling_price'].mean():,.0f}")
print("Cars with mileage > 22 km/l:")
high_m = df[df['mileage'] > 22]
print(f"Count of cars with mileage > 22: {len(high_m)}")
print(f"Mean price of cars with mileage > 22: Rs. {high_m['selling_price'].mean():,.0f}")
