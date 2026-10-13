import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  EXCLUDED_BRANDS,
  isBrandExcluded,
  getBrandOptions,
  getModelOptions,
  getFuelOptions,
  getTransmissionOptions,
  getEngineOptions,
  getMaxPowerOptions,
  getMileageOptions,
  getSeatsOptions,
  isValidBrandModel,
  isValidSpecCombination
} from '../src/utils/vehicleSpecsLogic.js';
import vehicleSpecs from '../src/data/vehicle_specs.json' with { type: 'json' };

describe('Frontend Vehicle Specs Logic', () => {
  it('1. Returns exactly 16 supported brands', () => {
    const brands = getBrandOptions();
    assert.strictEqual(brands.length, 16);
    const expected = [
      'Audi', 'Datsun', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia',
      'Mahindra', 'Maruti', 'Renault', 'Skoda', 'Tata', 'Toyota', 'Volkswagen', 'Volvo'
    ];
    assert.deepStrictEqual(brands, expected);
  });

  it('2. Excludes all 16 specified excluded brands', () => {
    for (const b of EXCLUDED_BRANDS) {
      assert.strictEqual(isBrandExcluded(b), true, `${b} should be excluded`);
      assert.strictEqual(isBrandExcluded(b.toLowerCase()), true, `${b.toLowerCase()} should be excluded`);
      assert.strictEqual(isBrandExcluded(b.toUpperCase()), true, `${b.toUpperCase()} should be excluded`);
    }

    const availableBrands = getBrandOptions();
    for (const b of EXCLUDED_BRANDS) {
      assert.strictEqual(availableBrands.includes(b), false, `${b} must not appear in brand options`);
    }
  });

  it('3. Preserves distinct model names from training dataset', () => {
    const marutiModels = getModelOptions('Maruti');
    assert.strictEqual(marutiModels.includes('Swift Dzire'), true);
    assert.strictEqual(marutiModels.includes('Dzire LXI'), true);
    assert.strictEqual(marutiModels.includes('Dzire VXI'), true);
    assert.strictEqual(marutiModels.includes('Dzire ZXI'), true);

    const datsunModels = getModelOptions('Datsun');
    assert.strictEqual(datsunModels.includes('redi-GO'), true);
    assert.strictEqual(datsunModels.includes('RediGO'), true);
    assert.strictEqual(datsunModels.includes('GO'), true);
  });

  it('4. Rejects excluded or invalid brands for model lookup', () => {
    assert.deepStrictEqual(getModelOptions('BMW'), []);
    assert.deepStrictEqual(getModelOptions('Mercedes-Benz'), []);
    assert.deepStrictEqual(getModelOptions('Ferrari'), []);
    assert.deepStrictEqual(getModelOptions('UnknownBrand'), []);
  });

  it('5. Cascading specs for multiple variants (e.g. Maruti Swift)', () => {
    const fuels = getFuelOptions('Maruti', 'Swift');
    assert.deepStrictEqual(fuels, ['Diesel', 'Petrol']);

    // Diesel transmission options
    const dieselTrans = getTransmissionOptions('Maruti', 'Swift', 'Diesel');
    assert.deepStrictEqual(dieselTrans, ['Automatic', 'Manual']);

    // Diesel Manual engine options
    const engines = getEngineOptions('Maruti', 'Swift', 'Diesel', 'Manual');
    assert.deepStrictEqual(engines, [1248]);

    // Diesel Manual 1248cc power options (74 bhp canonical)
    const powers = getMaxPowerOptions('Maruti', 'Swift', 'Diesel', 'Manual', 1248);
    assert.deepStrictEqual(powers, [74]);

    // Diesel Manual 1248cc 74bhp mileage options (multiple variants in dataset)
    const mileages = getMileageOptions('Maruti', 'Swift', 'Diesel', 'Manual', 1248, 74);
    assert.ok(mileages.length >= 2, 'Should provide multiple mileage choices for Swift diesel variants');
    assert.deepStrictEqual(mileages, [17.8, 22.9, 25.2, 28.4]);

    // Seats count
    const seats = getSeatsOptions('Maruti', 'Swift', 'Diesel', 'Manual', 1248, 74);
    assert.deepStrictEqual(seats, [5]);
  });

  it('6. Validates brand-model relationships', () => {
    assert.strictEqual(isValidBrandModel('Maruti', 'Swift'), true);
    assert.strictEqual(isValidBrandModel('Toyota', 'Fortuner'), true);
    assert.strictEqual(isValidBrandModel('Maruti', 'Fortuner'), false);
    assert.strictEqual(isValidBrandModel('BMW', 'X5'), false);
  });

  it('7. Filters engine capacities by selected brand and model', () => {
    const swiftEngines = getEngineOptions('Maruti', 'Swift');
    assert.deepStrictEqual(swiftEngines, [1197, 1248, 1298]);

    const fortunerEngines = getEngineOptions('Toyota', 'Fortuner');
    assert.deepStrictEqual(fortunerEngines, [2694, 2755, 2982]);

    // Engine options for non-existent brand/model is empty
    assert.deepStrictEqual(getEngineOptions('BMW', '3'), []);
    assert.deepStrictEqual(getEngineOptions('Maruti', 'NonExistent'), []);
  });

  it('8. Filters max-power options strictly matching engine capacity and relevant attributes', () => {
    // Diesel Manual 1248cc for Swift (deduplicated to canonical 74 bhp)
    const dieselPowers = getMaxPowerOptions('Maruti', 'Swift', 'Diesel', 'Manual', 1248);
    assert.deepStrictEqual(dieselPowers, [74]);

    // Petrol Manual 1197cc for Swift (genuine generational tunes: 83.11 bhp vs 85.8 bhp)
    const petrolPowers = getMaxPowerOptions('Maruti', 'Swift', 'Petrol', 'Manual', 1197);
    assert.deepStrictEqual(petrolPowers, [83.11, 85.8]);

    // Petrol Automatic (CVT) vs Manual for Datsun GO 1198cc
    const autoGoPowers = getMaxPowerOptions('Datsun', 'GO', 'Petrol', 'Automatic', 1198);
    assert.deepStrictEqual(autoGoPowers, [76.43]);

    const manualGoPowers = getMaxPowerOptions('Datsun', 'GO', 'Petrol', 'Manual', 1198);
    assert.deepStrictEqual(manualGoPowers, [67.04]);

    // Never leak powers across incompatible fuel types (1248cc is Diesel only)
    const invalidPetrol1248 = getMaxPowerOptions('Maruti', 'Swift', 'Petrol', 'Manual', 1248);
    assert.deepStrictEqual(invalidPetrol1248, []);
  });

  it('9. Preserves legitimate multiple power outputs across various brands and models', () => {
    // Hyundai i20 1396cc Diesel Manual: duplicate power values (88.73, 88.76, 88.8, 90.0) collapsed to verified canonical 88.76 bhp
    const i20DieselPowers = getMaxPowerOptions('Hyundai', 'i20', 'Diesel', 'Manual', 1396);
    assert.deepStrictEqual(i20DieselPowers, [88.76]);

    // Renault Duster 1461cc Diesel Manual has distinct 85 PS and 110 PS tuning variants
    const dusterPowers = getMaxPowerOptions('Renault', 'Duster', 'Diesel', 'Manual', 1461);
    assert.deepStrictEqual(dusterPowers, [83.8, 108.45]);

    // Volkswagen Polo 999cc Petrol Manual has 1.0 MPI (75 bhp) and 1.0 TSI Turbo (108.62 bhp)
    const poloPowers = getMaxPowerOptions('Volkswagen', 'Polo', 'Petrol', 'Manual', 999);
    assert.deepStrictEqual(poloPowers, [75, 108.62]);

    // Tata Harrier 1956cc Diesel Manual has 140 PS (138.1 bhp) and 170 PS (167.67 bhp)
    const harrierPowers = getMaxPowerOptions('Tata', 'Harrier', 'Diesel', 'Manual', 1956);
    assert.deepStrictEqual(harrierPowers, [138.1, 167.67]);

    // Tata Tigor 1199cc Petrol Manual has Revotron (84.48 bhp) and JTP Turbo (112.44 bhp)
    const tigorPowers = getMaxPowerOptions('Tata', 'Tigor', 'Petrol', 'Manual', 1199);
    assert.deepStrictEqual(tigorPowers, [84.48, 112.44]);

    // Maruti Alto 796cc CNG vs Petrol: CNG mode power verified (38.4, 40.3), erroneous petrol leak (47.3) removed from CNG
    const altoCngPowers = getMaxPowerOptions('Maruti', 'Alto', 'CNG', 'Manual', 796);
    assert.deepStrictEqual(altoCngPowers, [38.4, 40.3]);
    const altoPetrolPowers = getMaxPowerOptions('Maruti', 'Alto', 'Petrol', 'Manual', 796);
    assert.deepStrictEqual(altoPetrolPowers, [47.3]);
  });

  it('10. Validates spec combinations via isValidSpecCombination', () => {
    assert.strictEqual(isValidSpecCombination('Maruti', 'Swift', 'Diesel', 'Manual', 1248, 74), true);
    assert.strictEqual(isValidSpecCombination('Hyundai', 'i20', 'Diesel', 'Manual', 1396, 88.76), true);
    assert.strictEqual(isValidSpecCombination('Renault', 'Duster', 'Diesel', 'Manual', 1461, 83.8), true);
    assert.strictEqual(isValidSpecCombination('Renault', 'Duster', 'Diesel', 'Manual', 1461, 108.45), true);
    assert.strictEqual(isValidSpecCombination('Toyota', 'Fortuner', 'Diesel', 'Automatic', 2755, 174.5), true);

    // Incompatible engine
    assert.strictEqual(isValidSpecCombination('Maruti', 'Swift', 'Diesel', 'Manual', 1999, 74), false);
    // Incompatible fuel
    assert.strictEqual(isValidSpecCombination('Maruti', 'Swift', 'Petrol', 'Manual', 1248, 74), false);
    // Incompatible power
    assert.strictEqual(isValidSpecCombination('Maruti', 'Swift', 'Diesel', 'Manual', 1248, 200), false);
    // Cross-brand mismatch
    assert.strictEqual(isValidSpecCombination('Maruti', 'Fortuner', 'Diesel', 'Automatic', 2755, 174.5), false);
  });

  it('11. Non-destructive cascading preserves valid downstream options', () => {
    // Current: Swift Diesel Manual 1248cc 74bhp
    // Switch transmission to Automatic:
    const autoEngines = getEngineOptions('Maruti', 'Swift', 'Diesel', 'Automatic');
    assert.strictEqual(autoEngines.includes(1248), true, '1248cc should remain valid on Automatic');

    const autoPowers = getMaxPowerOptions('Maruti', 'Swift', 'Diesel', 'Automatic', 1248);
    assert.strictEqual(autoPowers.includes(74), true, '74 bhp should remain valid on Automatic');

    // Switch fuel from Diesel to Petrol on Swift:
    const petrolEngines = getEngineOptions('Maruti', 'Swift', 'Petrol', 'Manual');
    assert.strictEqual(petrolEngines.includes(1248), false, '1248cc must not be valid for Petrol Swift');
    assert.strictEqual(petrolEngines.includes(1197), true, '1197cc is the valid Petrol engine');
  });

  it('12. Existing PDF valuation report generator is functional', async () => {
    const { generatePredictionPDF } = await import('../src/utils/pdfGenerator.js');
    assert.strictEqual(typeof generatePredictionPDF, 'function');
  });
});
