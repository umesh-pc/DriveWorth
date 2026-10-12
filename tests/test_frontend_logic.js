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
  isValidBrandModel
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

    // Diesel Manual 1248cc power options
    const powers = getMaxPowerOptions('Maruti', 'Swift', 'Diesel', 'Manual', 1248);
    assert.deepStrictEqual(powers, [74, 75]);

    // Diesel Manual 1248cc 74bhp mileage options (multiple variants in dataset)
    const mileages = getMileageOptions('Maruti', 'Swift', 'Diesel', 'Manual', 1248, 74);
    assert.ok(mileages.length >= 2, 'Should provide multiple mileage choices for Swift diesel variants');
    assert.deepStrictEqual(mileages, [22.9, 25.2, 28.4]);

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
});
