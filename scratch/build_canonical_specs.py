import json
import os
from collections import defaultdict

SRC_SPECS_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'vehicle_specs.json')
OUT_SPECS_PATH = os.path.join(os.path.dirname(__file__), 'cleaned_vehicle_specs.json')

# Complete authoritative canonical mapping table
# Key: (brand, model, fuel_type, transmission, engine)
# Value: dict of {old_power: new_power}
# If new_power is None, row is dropped (e.g. erroneous CNG petrol leakage)
CANONICAL_MAPPINGS = {
    # Audi
    ('Audi', 'A4', 'Diesel', 'Automatic', 1968): {140.8: 140.0},
    ('Audi', 'A8', 'Diesel', 'Automatic', 2967): {246.7: 246.74},
    ('Audi', 'Q7', 'Diesel', 'Automatic', 2967): {245.0: 241.4},

    # Datsun
    ('Datsun', 'GO', 'Petrol', 'Manual', 1198): {67.0: 67.04, 67.05: 67.04, 67.06: 67.04},
    ('Datsun', 'RediGO', 'Petrol', 'Manual', 799): {53.0: 53.64},
    ('Datsun', 'RediGO', 'Petrol', 'Manual', 999): {67.0: 67.04, 68.0: 67.04},

    # Ford
    ('Ford', 'Aspire', 'Diesel', 'Manual', 1498): {99.0: 98.63, 99.23: 98.63},
    ('Ford', 'Ecosport', 'Diesel', 'Manual', 1498): {98.96: 98.59},
    ('Ford', 'Ecosport', 'Petrol', 'Automatic', 1499): {110.0: 110.4},
    ('Ford', 'Ecosport', 'Petrol', 'Manual', 1499): {110.0: 110.4},
    ('Ford', 'Ecosport', 'Petrol', 'Manual', 999): {123.24: 123.37},
    ('Ford', 'Ecosport', 'Petrol', 'Manual', 1497): {121.31: 121.36},
    ('Ford', 'Endeavour', 'Diesel', 'Automatic', 2953): {156.0: 153.86},
    ('Ford', 'Endeavour', 'Diesel', 'Automatic', 3198): {197.0: 197.2},
    ('Ford', 'Endeavour', 'Diesel', 'Manual', 2499): {143.0: 141.0},
    ('Ford', 'Figo', 'Diesel', 'Manual', 1399): {68.0: 68.05, 68.1: 68.05},
    ('Ford', 'Figo', 'Petrol', 'Manual', 1196): {70.0: 70.02},
    ('Ford', 'Freestyle', 'Petrol', 'Manual', 1194): {94.68: 94.93},

    # Honda
    ('Honda', 'Amaze', 'Diesel', 'Manual', 1498): {98.6: 98.63},
    ('Honda', 'Amaze', 'Petrol', 'Automatic', 1199): {88.7: 88.76},
    ('Honda', 'CR-V', 'Petrol', 'Automatic', 1997): {151.89: 153.86},
    ('Honda', 'CR-V', 'Petrol', 'Automatic', 2354): {141.1: None, 152.0: 158.8},
    ('Honda', 'CR-V', 'Petrol', 'Manual', 2354): {152.0: 158.8},
    ('Honda', 'City', 'Diesel', 'Manual', 1498): {97.9: 98.63, 98.6: 98.63},
    ('Honda', 'City', 'Petrol', 'Automatic', 1497): {116.3: 117.3, 116.4: 117.3, 117.6: 117.3, 118.0: 117.3},
    ('Honda', 'City', 'Petrol', 'Manual', 1497): {116.3: 117.3, 116.4: 117.3, 117.6: 117.3, 118.0: 117.3},
    ('Honda', 'City', 'Petrol', 'Automatic', 1498): {119.3: 119.35},
    ('Honda', 'Civic', 'Petrol', 'Automatic', 1799): {130.0: 130.2, 130.3: 130.2},
    ('Honda', 'Civic', 'Petrol', 'Manual', 1799): {130.0: 130.2},
    ('Honda', 'Jazz', 'Petrol', 'Automatic', 1199): {88.51: 88.76, 88.7: 88.76},
    ('Honda', 'Jazz', 'Petrol', 'Manual', 1198): {88.8: 88.76, 90.0: 88.76},
    ('Honda', 'Jazz', 'Petrol', 'Manual', 1199): {88.51: 88.76, 88.7: 88.76},
    ('Honda', 'WR-V', 'Diesel', 'Manual', 1498): {97.89: 98.63, 98.6: 98.63},

    # Hyundai
    ('Hyundai', 'Elantra', 'Diesel', 'Automatic', 1582): {126.2: 126.24},
    ('Hyundai', 'Elantra', 'Diesel', 'Manual', 1582): {126.2: 126.24},
    ('Hyundai', 'Elantra', 'Petrol', 'Manual', 1797): {147.4: 147.5},
    ('Hyundai', 'Grand', 'CNG', 'Manual', 1197): {81.86: None, 82.0: None},
    ('Hyundai', 'Grand', 'Petrol', 'Automatic', 1197): {82.0: 81.86},
    ('Hyundai', 'Grand', 'Petrol', 'Manual', 1197): {82.0: 81.86},
    ('Hyundai', 'Santro', 'CNG', 'Manual', 1086): {62.1: None, 58.0: 59.18},
    ('Hyundai', 'Santro', 'LPG', 'Manual', 1086): {63.0: 62.1},
    ('Hyundai', 'Santro', 'Petrol', 'Automatic', 1086): {68.0: 68.05, 68.07: 68.05},
    ('Hyundai', 'Santro', 'Petrol', 'Manual', 1086): {63.0: 62.1, 68.0: 68.05, 68.07: 68.05},
    ('Hyundai', 'Tucson', 'Diesel', 'Automatic', 1995): {183.0: 182.46},
    ('Hyundai', 'Venue', 'Diesel', 'Manual', 1396): {88.7: 88.76},
    ('Hyundai', 'Verna', 'Diesel', 'Automatic', 1582): {126.2: 126.24, 126.3: 126.24, 126.32: 126.24},
    ('Hyundai', 'Verna', 'Diesel', 'Manual', 1396): {88.7: 88.76},
    ('Hyundai', 'Verna', 'Diesel', 'Manual', 1582): {126.2: 126.24, 126.3: 126.24, 126.32: 126.24},
    ('Hyundai', 'Verna', 'Petrol', 'Automatic', 1591): {121.4: 121.3},
    ('Hyundai', 'Verna', 'Petrol', 'Manual', 1591): {121.4: 121.3},
    ('Hyundai', 'i10', 'LPG', 'Manual', 1086): {68.1: 68.05},
    ('Hyundai', 'i10', 'Petrol', 'Automatic', 1197): {80.0: 78.9},
    ('Hyundai', 'i10', 'Petrol', 'Manual', 1086): {68.1: 68.05},
    ('Hyundai', 'i20', 'Diesel', 'Manual', 1396): {88.73: 88.76, 88.8: 88.76, 90.0: 88.76},
    ('Hyundai', 'i20', 'Petrol', 'Automatic', 1396): {98.6: 98.63, 100.0: 98.63},
    ('Hyundai', 'i20', 'Petrol', 'Manual', 1197): {81.83: 81.86, 82.9: 82.85},

    # Jeep
    ('Jeep', 'Compass', 'Diesel', 'Manual', 1956): {170.0: 170.63, 173.0: 170.63},
    ('Jeep', 'Compass', 'Petrol', 'Automatic', 1368): {160.0: 160.77},

    # Mahindra
    ('Mahindra', 'Bolero', 'Diesel', 'Manual', 2523): {62.1: 63.0},
    ('Mahindra', 'Scorpio', 'Diesel', 'Manual', 2179): {115.0: 120.0, 138.13: 140.0},
    ('Mahindra', 'Scorpio', 'Diesel', 'Manual', 2609): {116.6: 115.0, 120.0: 115.0},
    ('Mahindra', 'XUV300', 'Petrol', 'Manual', 1197): {110.0: 108.6},
    ('Mahindra', 'XUV500', 'Diesel', 'Manual', 2179): {138.0: 140.0, 155.0: 152.87},

    # Maruti
    ('Maruti', 'Alto', 'CNG', 'Manual', 796): {47.3: None},
    ('Maruti', 'Alto', 'CNG', 'Manual', 998): {58.2: 58.33, 58.3: 58.33},
    ('Maruti', 'Alto', 'Petrol', 'Automatic', 998): {67.05: 67.04, 67.1: 67.04},
    ('Maruti', 'Alto', 'Petrol', 'Manual', 796): {46.3: 47.3, 47.0: 47.3},
    ('Maruti', 'Alto', 'Petrol', 'Manual', 998): {67.05: 67.04, 67.1: 67.04},
    ('Maruti', 'Baleno', 'Petrol', 'Automatic', 1197): {81.8: 83.1},
    ('Maruti', 'Baleno', 'Petrol', 'Manual', 998): {100.0: 100.5},
    ('Maruti', 'Baleno', 'Petrol', 'Manual', 1197): {81.8: 83.1},
    ('Maruti', 'Celerio', 'CNG', 'Manual', 998): {58.2: 58.33},
    ('Maruti', 'Celerio', 'Petrol', 'Automatic', 998): {67.0: 67.04, 67.05: 67.04},
    ('Maruti', 'Celerio', 'Petrol', 'Manual', 998): {67.0: 67.04, 67.05: 67.04},
    ('Maruti', 'Ciaz', 'Petrol', 'Manual', 1373): {91.2: 91.1},
    ('Maruti', 'Eeco', 'CNG', 'Manual', 1196): {73.0: None, 63.0: 61.7},
    ('Maruti', 'Eeco', 'Petrol', 'Manual', 1196): {72.42: 73.0},
    ('Maruti', 'Ertiga', 'CNG', 'Manual', 1373): {80.9: 80.46},
    ('Maruti', 'Ertiga', 'CNG', 'Manual', 1462): {103.0: None},
    ('Maruti', 'Ertiga', 'Diesel', 'Manual', 1248): {88.5: 88.76, 88.8: 88.76},
    ('Maruti', 'Ertiga', 'Petrol', 'Automatic', 1462): {103.0: 103.26},
    ('Maruti', 'Ertiga', 'Petrol', 'Manual', 1462): {103.0: 103.26},
    ('Maruti', 'Swift', 'Diesel', 'Manual', 1248): {75.0: 74.0},
    ('Maruti', 'Swift', 'Petrol', 'Manual', 1197): {81.8: 83.11, 85.0: 85.8},
    ('Maruti', 'Swift Dzire', 'CNG', 'Manual', 1197): {85.8: 81.8},
    ('Maruti', 'Swift Dzire', 'Diesel', 'Automatic', 1248): {74.02: 74.0},
    ('Maruti', 'Swift Dzire', 'Diesel', 'Manual', 1248): {73.9: 74.0, 74.02: 74.0},
    ('Maruti', 'Swift Dzire', 'Petrol', 'Automatic', 1197): {81.8: 83.14},
    ('Maruti', 'Swift Dzire', 'Petrol', 'Manual', 1197): {81.8: 83.14},
    ('Maruti', 'Wagon R', 'CNG', 'Manual', 998): {67.04: None, 58.16: 58.33, 58.2: 58.33},
    ('Maruti', 'Wagon R', 'LPG', 'Manual', 998): {61.6: 61.7},
    ('Maruti', 'Wagon R', 'Petrol', 'Automatic', 998): {67.0: 67.04, 67.05: 67.04, 67.1: 67.04},
    ('Maruti', 'Wagon R', 'Petrol', 'Manual', 998): {67.0: 67.04, 67.05: 67.04, 67.06: 67.04, 67.1: 67.04},
    ('Maruti', 'Wagon R', 'Petrol', 'Manual', 1061): {67.0: 64.0},

    # Renault
    ('Renault', 'Duster', 'Diesel', 'Automatic', 1461): {108.5: 108.45},
    ('Renault', 'Duster', 'Diesel', 'Manual', 1461): {84.0: 83.8},
    ('Renault', 'Duster', 'Petrol', 'Automatic', 1498): {105.0: 104.5},
    ('Renault', 'KWID', 'Petrol', 'Manual', 799): {53.3: 53.26},
    ('Renault', 'Triber', 'Petrol', 'Manual', 999): {71.0: 72.0},

    # Skoda
    ('Skoda', 'Octavia', 'Diesel', 'Manual', 1896): {66.0: 90.0},
    ('Skoda', 'Octavia', 'Petrol', 'Automatic', 1798): {177.0: 177.5, 178.0: 177.5},
    ('Skoda', 'Rapid', 'Diesel', 'Automatic', 1498): {103.6: 103.52},
    ('Skoda', 'Rapid', 'Diesel', 'Manual', 1498): {103.6: 103.52},
    ('Skoda', 'Rapid', 'Diesel', 'Manual', 1598): {103.5: 103.52, 103.6: 103.52, 105.0: 103.52},
    ('Skoda', 'Rapid', 'Petrol', 'Automatic', 1598): {103.2: 103.52, 103.5: 103.52, 103.6: 103.52, 105.0: 103.52},
    ('Skoda', 'Rapid', 'Petrol', 'Manual', 1598): {103.2: 103.52, 103.5: 103.52, 103.6: 103.52, 105.0: 103.52},
    ('Skoda', 'Superb', 'Diesel', 'Automatic', 1968): {138.03: 138.08, 138.1: 138.08},
    ('Skoda', 'Superb', 'Petrol', 'Automatic', 1798): {157.75: 157.8, 161.6: 157.8},
    ('Skoda', 'Superb', 'Petrol', 'Manual', 1798): {157.75: 157.8, 160.0: 157.8},

    # Tata
    ('Tata', 'Safari', 'Diesel', 'Manual', 2179): {138.0: 138.03, 138.1: 138.03, 148.0: 147.94},
    ('Tata', 'Tiago', 'Petrol', 'Automatic', 1199): {83.81: 84.48, 83.83: 84.48, 84.0: 84.48},
    ('Tata', 'Tiago', 'Petrol', 'Manual', 1199): {83.81: 84.48, 83.83: 84.48, 84.0: 84.48},
    ('Tata', 'Tigor', 'Petrol', 'Manual', 1199): {83.81: 84.48, 84.0: 84.48},

    # Toyota
    ('Toyota', 'Camry', 'Petrol', 'Automatic', 2494): {157.7: 158.2, 178.3: 178.4},
    ('Toyota', 'Fortuner', 'Diesel', 'Automatic', 2982): {168.7: 168.5, 169.0: 168.5},
    ('Toyota', 'Fortuner', 'Diesel', 'Manual', 2982): {168.7: 168.5, 171.0: 168.5},
    ('Toyota', 'Innova', 'Diesel', 'Manual', 2393): {147.8: 147.51},
    ('Toyota', 'Innova', 'Diesel', 'Manual', 2494): {100.0: 100.6, 100.57: 100.6, 102.0: 100.6},
    ('Toyota', 'Innova', 'Petrol', 'Manual', 1998): {132.0: 130.1},
    ('Toyota', 'Yaris', 'Petrol', 'Automatic', 1496): {105.5: 105.94},
    ('Toyota', 'Yaris', 'Petrol', 'Manual', 1496): {105.5: 105.94},

    # Volkswagen
    ('Volkswagen', 'Polo', 'Diesel', 'Manual', 1498): {88.0: 88.76, 88.5: 88.76, 88.7: 88.76, 88.8: 88.76},
    ('Volkswagen', 'Polo', 'Petrol', 'Automatic', 1197): {103.5: 103.6},
    ('Volkswagen', 'Polo', 'Petrol', 'Manual', 999): {75.1: 75.0},
    ('Volkswagen', 'Polo', 'Petrol', 'Manual', 1198): {73.9: 74.0},
    ('Volkswagen', 'Vento', 'Diesel', 'Automatic', 1498): {103.2: 103.52, 108.5: 108.6},
    ('Volkswagen', 'Vento', 'Diesel', 'Manual', 1498): {103.2: 103.52, 108.49: 108.6},
    ('Volkswagen', 'Vento', 'Diesel', 'Manual', 1598): {103.5: 103.52, 103.6: 103.52, 105.0: 103.52},
    ('Volkswagen', 'Vento', 'Petrol', 'Automatic', 1197): {103.2: 103.6, 103.5: 103.6},
    ('Volkswagen', 'Vento', 'Petrol', 'Automatic', 1598): {105.0: 103.52, 103.6: 103.52},
    ('Volkswagen', 'Vento', 'Petrol', 'Manual', 1598): {103.2: 103.52, 103.5: 103.52, 103.6: 103.52, 105.0: 103.52},
}

def process_specs():
    import subprocess
    raw_json = subprocess.check_output(['git', 'show', 'HEAD:src/data/vehicle_specs.json'], text=True, encoding='utf-8')
    specs = json.loads(raw_json)

    print(f"Total raw specs from git HEAD: {len(specs)}")

    cleaned_specs = []
    dropped_count = 0
    mapped_count = 0

    for item in specs:
        key = (item['brand'], item['model'], item['fuel_type'], item['transmission'], item['engine'])
        old_power = item['max_power']
        
        if key in CANONICAL_MAPPINGS:
            map_dict = CANONICAL_MAPPINGS[key]
            if old_power in map_dict:
                new_power = map_dict[old_power]
                if new_power is None:
                    # Drop row (e.g. erroneous CNG petrol leakage)
                    dropped_count += 1
                    continue
                else:
                    item['max_power'] = new_power
                    mapped_count += 1

        cleaned_specs.append(item)

    print(f"Mapped {mapped_count} values to canonical.")
    print(f"Dropped {dropped_count} erroneous entries.")
    print(f"Specs before deduplication: {len(cleaned_specs)}")

    # Deduplicate exact identical spec dicts
    seen = set()
    deduped_specs = []
    for item in cleaned_specs:
        item_tuple = (
            item.get('brand'),
            item.get('model'),
            item.get('fuel_type'),
            item.get('transmission'),
            item.get('engine'),
            item.get('max_power'),
            item.get('mileage'),
            item.get('seats')
        )
        if item_tuple not in seen:
            seen.add(item_tuple)
            deduped_specs.append(item)

    print(f"Total unique specs after deduplication: {len(deduped_specs)}")

    # Check Hyundai i20 Diesel Manual 1396cc in deduped specs
    i20_diesel = [s for s in deduped_specs if s['brand'] == 'Hyundai' and s['model'] == 'i20' and s['fuel_type'] == 'Diesel' and s['transmission'] == 'Manual' and s['engine'] == 1396]
    i20_powers = set(s['max_power'] for s in i20_diesel)
    print(f"Hyundai i20 Diesel Manual 1396cc options after clean: {i20_powers}")

    # Check Maruti Swift Diesel Manual 1248cc
    swift_diesel = [s for s in deduped_specs if s['brand'] == 'Maruti' and s['model'] == 'Swift' and s['fuel_type'] == 'Diesel' and s['transmission'] == 'Manual' and s['engine'] == 1248]
    swift_powers = set(s['max_power'] for s in swift_diesel)
    print(f"Maruti Swift Diesel Manual 1248cc options after clean: {swift_powers}")

    # Check Duster Diesel Manual 1461cc (genuine variants preserved)
    duster_diesel = [s for s in deduped_specs if s['brand'] == 'Renault' and s['model'] == 'Duster' and s['fuel_type'] == 'Diesel' and s['transmission'] == 'Manual' and s['engine'] == 1461]
    duster_powers = sorted(list(set(s['max_power'] for s in duster_diesel)))
    print(f"Renault Duster Diesel Manual 1461cc options after clean: {duster_powers}")

    # Check Polo Petrol Manual 999cc (genuine variants preserved)
    polo_petrol = [s for s in deduped_specs if s['brand'] == 'Volkswagen' and s['model'] == 'Polo' and s['fuel_type'] == 'Petrol' and s['transmission'] == 'Manual' and s['engine'] == 999]
    polo_powers = sorted(list(set(s['max_power'] for s in polo_petrol)))
    print(f"VW Polo Petrol Manual 999cc options after clean: {polo_powers}")

    # Check Harrier Diesel Manual 1956cc (genuine variants preserved)
    harrier_diesel = [s for s in deduped_specs if s['brand'] == 'Tata' and s['model'] == 'Harrier' and s['fuel_type'] == 'Diesel' and s['transmission'] == 'Manual' and s['engine'] == 1956]
    harrier_powers = sorted(list(set(s['max_power'] for s in harrier_diesel)))
    print(f"Tata Harrier Diesel Manual 1956cc options after clean: {harrier_powers}")

    # Write to output file
    with open(OUT_SPECS_PATH, 'w', encoding='utf-8') as f:
        json.dump(deduped_specs, f, indent=2)
    print(f"Saved cleaned specs to {OUT_SPECS_PATH}")

if __name__ == '__main__':
    process_specs()
