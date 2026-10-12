import vehicleSpecs from '../data/vehicle_specs.json' with { type: 'json' };

/**
 * Full authoritative list of 16 excluded brands removed from the training dataset.
 * Must not appear as selectable options and must be rejected on submission.
 */
export const EXCLUDED_BRANDS = [
  'Ferrari',
  'Rolls-Royce',
  'Bentley',
  'Mercedes-Benz',
  'Porsche',
  'Land Rover',
  'BMW',
  'Lexus',
  'Maserati',
  'Mercedes-AMG',
  'Mini',
  'Isuzu',
  'ISUZU',
  'Nissan',
  'Force',
  'MG'
];

const EXCLUDED_BRANDS_LOWER = new Set(
  EXCLUDED_BRANDS.map((b) => b.trim().toLowerCase())
);

/**
 * Check if a brand is in the excluded brands list (case-insensitive).
 */
export function isBrandExcluded(brand) {
  if (!brand) return false;
  return EXCLUDED_BRANDS_LOWER.has(String(brand).trim().toLowerCase());
}

/**
 * Valid brands derived from the filtered training dataset.
 */
export function getBrandOptions() {
  const brandsSet = new Set();
  for (const item of vehicleSpecs) {
    const b = item.brand && String(item.brand).trim();
    if (b && !isBrandExcluded(b)) {
      brandsSet.add(b);
    }
  }
  return Array.from(brandsSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Models supported for a given brand in the filtered dataset.
 */
export function getModelOptions(brand) {
  if (!brand || isBrandExcluded(brand)) return [];
  const bLower = String(brand).trim().toLowerCase();
  const modelsSet = new Set();

  for (const item of vehicleSpecs) {
    if (item.brand && item.brand.trim().toLowerCase() === bLower) {
      if (item.model) {
        modelsSet.add(String(item.model).trim());
      }
    }
  }
  return Array.from(modelsSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Matching specs filtered down by provided attributes.
 */
function getMatchingSpecs(brand, model, filters = {}) {
  if (!brand || !model || isBrandExcluded(brand)) return [];
  const bLower = String(brand).trim().toLowerCase();
  const mLower = String(model).trim().toLowerCase();

  return vehicleSpecs.filter((item) => {
    if (!item.brand || item.brand.trim().toLowerCase() !== bLower) return false;
    if (!item.model || item.model.trim().toLowerCase() !== mLower) return false;

    if (filters.fuelType && item.fuel_type && item.fuel_type.trim().toLowerCase() !== String(filters.fuelType).trim().toLowerCase()) {
      return false;
    }
    if (filters.transmission && item.transmission && item.transmission.trim().toLowerCase() !== String(filters.transmission).trim().toLowerCase()) {
      return false;
    }
    if (filters.engine !== undefined && filters.engine !== '' && item.engine !== undefined) {
      if (Number(item.engine) !== Number(filters.engine)) return false;
    }
    if (filters.maxPower !== undefined && filters.maxPower !== '' && item.max_power !== undefined) {
      if (Number(item.max_power) !== Number(filters.maxPower)) return false;
    }
    return true;
  });
}

/**
 * Fuel options for the selected brand and model.
 */
export function getFuelOptions(brand, model) {
  const matches = getMatchingSpecs(brand, model);
  const fuelsSet = new Set();
  for (const item of matches) {
    if (item.fuel_type) fuelsSet.add(String(item.fuel_type).trim());
  }
  return Array.from(fuelsSet).sort();
}

/**
 * Transmission options for the selected brand, model, and fuel type.
 */
export function getTransmissionOptions(brand, model, fuelType) {
  const matches = getMatchingSpecs(brand, model, { fuelType });
  const transSet = new Set();
  for (const item of matches) {
    if (item.transmission) transSet.add(String(item.transmission).trim());
  }
  return Array.from(transSet).sort();
}

/**
 * Engine options (CC) for selected brand, model, fuel type, transmission.
 */
export function getEngineOptions(brand, model, fuelType, transmission) {
  const matches = getMatchingSpecs(brand, model, { fuelType, transmission });
  const enginesSet = new Set();
  for (const item of matches) {
    if (item.engine) enginesSet.add(Number(item.engine));
  }
  return Array.from(enginesSet).sort((a, b) => a - b);
}

/**
 * Max power options (bhp) for selected brand, model, fuel type, transmission, and engine.
 */
export function getMaxPowerOptions(brand, model, fuelType, transmission, engine) {
  // Support both 3-arg legacy signature (brand, model, engine) and full signature
  let filters;
  if (arguments.length === 3) {
    filters = { engine: fuelType };
  } else {
    filters = { fuelType, transmission, engine };
  }

  let matches = getMatchingSpecs(brand, model, filters);
  if (matches.length === 0 && filters.engine) {
    // If strict match on fuel/transmission is empty, match on engine for model
    matches = getMatchingSpecs(brand, model, { engine: filters.engine });
  }

  const powersSet = new Set();
  for (const item of matches) {
    if (item.max_power) powersSet.add(Number(item.max_power));
  }
  return Array.from(powersSet).sort((a, b) => a - b);
}

/**
 * Mileage options (km/l) from reliable existing specification data.
 */
export function getMileageOptions(brand, model, fuelType, transmission, engine, maxPower) {
  let matches = getMatchingSpecs(brand, model, { fuelType, transmission, engine, maxPower });
  if (matches.length === 0 && engine) {
    matches = getMatchingSpecs(brand, model, { engine });
  }

  const mileageSet = new Set();
  for (const item of matches) {
    if (item.mileage) mileageSet.add(Number(item.mileage));
  }
  return Array.from(mileageSet).sort((a, b) => a - b);
}

/**
 * Seat count options for selected brand, model, and engine/variant.
 */
export function getSeatsOptions(brand, model, fuelType, transmission, engine, maxPower) {
  let matches = getMatchingSpecs(brand, model, { fuelType, transmission, engine, maxPower });
  if (matches.length === 0) {
    matches = getMatchingSpecs(brand, model);
  }

  const seatsSet = new Set();
  for (const item of matches) {
    if (item.seats) seatsSet.add(Number(item.seats));
  }
  const seats = Array.from(seatsSet).sort((a, b) => a - b);
  return seats.length > 0 ? seats : [5];
}

/**
 * Fallback helper for default mileage based on existing reliable dataset specifications.
 */
export function getMileageValue(brand, model, engine, fuelType) {
  const options = getMileageOptions(brand, model, fuelType, undefined, engine);
  if (options.length > 0) return options[0];
  return 18.5;
}

/**
 * Validates that brand and model combination exists in filtered dataset.
 */
export function isValidBrandModel(brand, model) {
  if (!brand || !model) return false;
  if (isBrandExcluded(brand)) return false;
  const validModels = getModelOptions(brand);
  return validModels.includes(model);
}
