import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Car, AlertCircle, FileText, TrendingUp, CheckCircle2, Activity, ChevronDown, Check } from 'lucide-react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import CustomDropdown from '../components/CustomDropdown';
import { generatePredictionPDF } from '../utils/pdfGenerator';
import {
  getBrandOptions,
  getModelOptions,
  getFuelOptions,
  getTransmissionOptions,
  getEngineOptions,
  getMaxPowerOptions,
  getSeatsOptions,
  isBrandExcluded,
  isModelExcluded
} from '../utils/vehicleSpecsLogic';

export default function PredictPage() {
  // Cascading Selection State (Driven by vehicle spec decision logic)
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [engine, setEngine] = useState('');
  const [maxPower, setMaxPower] = useState('');
  const [mileage, setMileage] = useState('');
  const [seats, setSeats] = useState('');

  // Manual Numeric & Attribute Inputs
  const [vehicleAge, setVehicleAge] = useState(5);
  const [kmDriven, setKmDriven] = useState(45000);
  const [sellerType, setSellerType] = useState('Individual');
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const sellerDropdownRef = useRef(null);
  const resultsRef = useRef(null);

  // Close seller dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sellerDropdownRef.current && !sellerDropdownRef.current.contains(event.target)) {
        setIsSellerDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSellerDropdownOpen) {
        setIsSellerDropdownOpen(false);
      }
    };
    if (isSellerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSellerDropdownOpen]);

  // Execution & UI States
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 1. Available Brands: Loaded from shared filtered dataset configuration & synced with backend
  const [brandOptions, setBrandOptions] = useState(() => getBrandOptions());

  useEffect(() => {
    let isMounted = true;
    fetch('/api/specs')
      .then((res) => {
        if (!res.ok) throw new Error('Specs fetch failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.options) && data.options.length > 0) {
          const safeBrands = data.options.filter((b) => !isBrandExcluded(b));
          setBrandOptions(safeBrands);
        }
      })
      .catch(() => {
        // Fallback to shared configuration
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Models for selected Brand: Derived from filtered dataset & synced with backend
  const [modelOptions, setModelOptions] = useState(() => getModelOptions(brand));

  useEffect(() => {
    if (!brand || isBrandExcluded(brand)) {
      setModelOptions([]);
      return;
    }

    // Immediately load from shared dataset specs to ensure instant responsiveness
    const localModels = getModelOptions(brand);
    setModelOptions(localModels);

    let isMounted = true;
    fetch(`/api/specs?brand=${encodeURIComponent(brand)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Model fetch failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.options)) {
          const safeModels = data.options.filter((m) => !isModelExcluded(m));
          setModelOptions(safeModels);
        }
      })
      .catch(() => {
        // Local specs already populated
      });
    return () => {
      isMounted = false;
    };
  }, [brand]);

  // Prevent excluded brands or models or stale model states from persisting
  useEffect(() => {
    if (brand && isBrandExcluded(brand)) {
      setBrand('');
      setModel('');
    } else if (model && isModelExcluded(model)) {
      setModel('');
    }
  }, [brand, model]);

  // 2b. Validate model against available options
  useEffect(() => {
    if (!brand) {
      if (model) setModel('');
      return;
    }
    if (model && modelOptions.length > 0 && !modelOptions.includes(model)) {
      setModel('');
    } else if (!model && modelOptions.length === 1) {
      setModel(modelOptions[0]);
    }
  }, [brand, modelOptions, model]);

  // 3. Fuel Types for selected Brand + Model (optionally narrowed by engine if already selected)
  const fuelOptions = useMemo(() => getFuelOptions(brand, model, engine), [brand, model, engine]);

  // 4. Transmissions for selected Brand + Model + Fuel (optionally narrowed by engine)
  const transmissionOptions = useMemo(
    () => getTransmissionOptions(brand, model, fuelType, engine),
    [brand, model, fuelType, engine]
  );

  // 5. Engines (CC) for selected Brand + Model + Fuel + Transmission
  const engineOptions = useMemo(
    () => getEngineOptions(brand, model, fuelType, transmission),
    [brand, model, fuelType, transmission]
  );

  // 6. Max Power (bhp) for selected Brand + Model + Fuel + Transmission + Engine
  const maxPowerOptions = useMemo(
    () => getMaxPowerOptions(brand, model, fuelType, transmission, engine),
    [brand, model, fuelType, transmission, engine]
  );

  // 7. Seats options from genuine dataset specifications
  const seatsOptions = useMemo(
    () => getSeatsOptions(brand, model, fuelType, transmission, engine, maxPower),
    [brand, model, fuelType, transmission, engine, maxPower]
  );

  // Cascading validity guards: Reset downstream ONLY when current selection is no longer valid
  // If exactly 1 valid option remains for downstream, auto-select it; if multiple, preserve valid or prompt selection.
  useEffect(() => {
    if (!model) {
      if (fuelType) setFuelType('');
      return;
    }
    if (fuelType && fuelOptions.length > 0 && !fuelOptions.includes(fuelType)) {
      setFuelType('');
    } else if (!fuelType && fuelOptions.length === 1) {
      setFuelType(fuelOptions[0]);
    }
  }, [model, fuelOptions, fuelType]);

  useEffect(() => {
    if (!model) {
      if (transmission) setTransmission('');
      return;
    }
    if (transmission && transmissionOptions.length > 0 && !transmissionOptions.includes(transmission)) {
      setTransmission('');
    } else if (!transmission && transmissionOptions.length === 1) {
      setTransmission(transmissionOptions[0]);
    }
  }, [model, transmissionOptions, transmission]);

  useEffect(() => {
    if (!model) {
      if (engine) setEngine('');
      return;
    }
    const engineStrList = engineOptions.map(String);
    if (engine && engineStrList.length > 0 && !engineStrList.includes(String(engine))) {
      setEngine('');
    } else if (!engine && engineOptions.length === 1) {
      setEngine(String(engineOptions[0]));
    }
  }, [model, engineOptions, engine]);

  useEffect(() => {
    if (!engine) {
      if (maxPower) setMaxPower('');
      return;
    }
    const powerStrList = maxPowerOptions.map(String);
    if (maxPower && powerStrList.length > 0 && !powerStrList.includes(String(maxPower))) {
      setMaxPower('');
    } else if (!maxPower && maxPowerOptions.length === 1) {
      setMaxPower(String(maxPowerOptions[0]));
    }
  }, [engine, maxPowerOptions, maxPower]);

  useEffect(() => {
    if (!engine && !maxPower) {
      if (seats) setSeats('');
      return;
    }
    const seatsStrList = seatsOptions.map(String);
    if (seats && seatsStrList.length > 0 && !seatsStrList.includes(String(seats))) {
      setSeats('');
    } else if (!seats && seatsOptions.length === 1) {
      setSeats(String(seatsOptions[0]));
    }
  }, [engine, maxPower, seatsOptions, seats]);

  // Non-destructive Cascading Change Handlers: only update target field, allowing validity guards to preserve compatible selections
  const handleBrandChange = (val) => {
    setBrand(val);
    setResult(null);
    setError('');
  };

  const handleModelChange = (val) => {
    if (isModelExcluded(val)) {
      setModel('');
      return;
    }
    setModel(val);
    setResult(null);
    setError('');
  };

  const handleFuelChange = (val) => {
    setFuelType(val);
    setResult(null);
    setError('');
  };

  const handleTransmissionChange = (val) => {
    setTransmission(val);
    setResult(null);
    setError('');
  };

  const handleEngineChange = (val) => {
    setEngine(val);
    setResult(null);
    setError('');
  };

  const handleMaxPowerChange = (val) => {
    setMaxPower(val);
    setResult(null);
    setError('');
  };

  const validateInputs = () => {
    if (!brand) return 'Please select a vehicle Brand.';
    if (isBrandExcluded(brand)) {
      return `Brand "${brand}" is no longer supported for resale prediction. Please select a valid brand.`;
    }
    if (!brandOptions.includes(brand)) {
      return `Brand "${brand}" is not supported. Please select a valid brand from the list.`;
    }

    if (!model) return 'Please select a vehicle Model.';
    if (isModelExcluded(model)) {
      return `Model "${model}" is no longer supported for resale prediction. Please select a valid model.`;
    }
    if (!modelOptions.includes(model)) {
      return `Model "${model}" is not valid for ${brand}. Please select a valid model.`;
    }

    if (!fuelType) return 'Please select a Fuel Type.';
    if (fuelOptions.length > 0 && !fuelOptions.includes(fuelType)) {
      return `Fuel type "${fuelType}" is not valid for ${brand} ${model}.`;
    }

    if (!transmission) return 'Please select a Transmission.';
    if (transmissionOptions.length > 0 && !transmissionOptions.includes(transmission)) {
      return `Transmission "${transmission}" is not valid for ${brand} ${model} (${fuelType}).`;
    }

    if (!engine) return 'Please select Engine capacity.';
    if (engineOptions.length > 0 && !engineOptions.map(String).includes(String(engine))) {
      return `Engine capacity "${engine} CC" is not valid for the selected vehicle.`;
    }

    if (!maxPower) return 'Please select Max Power.';
    if (maxPowerOptions.length > 0 && !maxPowerOptions.map(String).includes(String(maxPower))) {
      return `Max Power "${maxPower} bhp" is not compatible with ${brand} ${model} ${engine} CC.`;
    }

    if (!seats) return 'Please select Seats count.';
    if (seatsOptions.length > 0 && !seatsOptions.map(String).includes(String(seats))) {
      return `Seats count "${seats}" is not valid for the selected vehicle specification.`;
    }

    const ageNum = Number(vehicleAge);
    if (vehicleAge === '' || isNaN(ageNum) || ageNum < 0) return 'Vehicle Age must be a valid non-negative number.';

    const kmNum = Number(kmDriven);
    if (kmDriven === '' || isNaN(kmNum) || kmNum < 0) return 'KM Driven must be a valid non-negative number.';

    const validSellers = ['Individual', 'Dealer', 'Trustmark Dealer'];
    if (!sellerType || !validSellers.includes(sellerType)) return 'Please select a valid Seller Type (Individual, Dealer, Trustmark Dealer).';

    const mileageNum = Number(mileage);
    if (mileage === '' || isNaN(mileageNum) || mileageNum <= 0) return 'Mileage must be a valid positive number (km/l).';

    return null;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');

    const valError = validateInputs();
    if (valError) {
      setError(valError);
      return;
    }

    setIsCalculating(true);
    setResult(null);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          vehicle_age: Number(vehicleAge),
          km_driven: Number(kmDriven),
          seller_type: sellerType,
          fuel_type: fuelType,
          transmission,
          transmission_type: transmission,
          mileage: Number(mileage),
          engine: Number(engine),
          max_power: Number(maxPower),
          seats: Number(seats)
        }),
      });

      const data = await res.json();
      setIsCalculating(false);

      if (data.success) {
        setResult(data);
        // On mobile viewports, smoothly scroll to the valuation console so the user instantly sees results
        setTimeout(() => {
          if (window.innerWidth < 1024 && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      } else {
        setError(data.message || 'Prediction failed. Please check inputs.');
      }
    } catch (err) {
      console.error('Prediction request error:', err);
      setIsCalculating(false);
      setError('Connection failed. Please check backend server.');
    }
  };

  // Active step calculation for appraisal progress indicator
  const getAppraisalStep = () => {
    if (result) return 3;
    if (brand && model && fuelType && transmission && engine && maxPower && mileage && seats) return 2;
    if (brand || model) return 1;
    return 0;
  };

  const currentStep = getAppraisalStep();

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-luxury-bg font-sans selection:bg-brand-primary/30 selection:text-white">
      <Background />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-24 sm:pt-28 pb-16 space-y-6 sm:space-y-8">
        
        {/* COMPACT HERO SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 text-left">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest font-mono">
                DATASET-BASED VALUATION ENGINE
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Used Car Resale Price Prediction
            </h1>
            <p className="text-secondary-text text-xs sm:text-sm max-w-xl leading-relaxed">
              Enter vehicle details below to generate an estimated resale value based on historical used-car dataset patterns.
            </p>
          </div>
        </div>

        {/* TWO-PART WORKSPACE (45% LEFT / 55% RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT PANEL: VEHICLE PROFILE FORM */}
          <div className="lg:col-span-5">
            <div className="glass-panel-heavy border border-white/10 bg-[#050816]/85 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:p-7 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <form onSubmit={handlePredict} className="space-y-5 sm:space-y-6 text-left" noValidate>
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-white">Vehicle Details</h2>
                    <p className="text-[11px] text-secondary-text font-normal">Specify car features for prediction</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-full">
                    SPECIFICATION FORM
                  </span>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center space-x-2.5 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* GROUP 1: VEHICLE IDENTITY */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-secondary-text/80 uppercase tracking-widest block">
                    VEHICLE IDENTITY
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Brand */}
                    <CustomDropdown
                      label="BRAND"
                      required
                      value={brand}
                      onChange={handleBrandChange}
                      options={brandOptions}
                      placeholder="Select Brand"
                      searchable
                    />

                    {/* Model */}
                    <CustomDropdown
                      label="MODEL"
                      required
                      value={model}
                      onChange={handleModelChange}
                      options={modelOptions}
                      placeholder={!brand ? 'Select Brand first' : 'Select Model'}
                      disabled={!brand}
                      searchable
                    />
                  </div>
                </div>

                {/* GROUP 2: CONDITION & USAGE */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono font-bold text-secondary-text/80 uppercase tracking-widest block">
                    CONDITION & USAGE
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Vehicle Age */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-secondary-text uppercase block">
                        AGE <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={vehicleAge}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (!isNaN(val) && Number(val) >= 0)) {
                              setVehicleAge(val);
                            }
                          }}
                          placeholder="e.g. 5"
                          className="w-full min-h-[44px] py-2.5 pl-3 pr-11 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-semibold text-white font-mono focus:outline-none focus:border-brand-primary"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-secondary-text/60 pointer-events-none">
                          years
                        </span>
                      </div>
                    </div>

                    {/* Kilometres Driven */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-secondary-text uppercase block">
                        KM DRIVEN <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={kmDriven}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (!isNaN(val) && Number(val) >= 0)) {
                              setKmDriven(val);
                            }
                          }}
                          placeholder="e.g. 45000"
                          className="w-full min-h-[44px] py-2.5 pl-3 pr-9 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-semibold text-white font-mono focus:outline-none focus:border-brand-primary"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-secondary-text/60 pointer-events-none">
                          km
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GROUP 3: TECHNICAL SPECIFICATION */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono font-bold text-secondary-text/80 uppercase tracking-widest block">
                    TECHNICAL SPECIFICATION
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Fuel Type */}
                    <CustomDropdown
                      label="FUEL TYPE"
                      required
                      value={fuelType}
                      onChange={handleFuelChange}
                      options={fuelOptions}
                      placeholder={!model ? 'Select Model first' : 'Select Fuel Type'}
                      disabled={!model}
                    />

                    {/* Transmission */}
                    <CustomDropdown
                      label="TRANSMISSION"
                      required
                      value={transmission}
                      onChange={handleTransmissionChange}
                      options={transmissionOptions}
                      placeholder={!model ? 'Select Model first' : (!fuelType ? 'Select Fuel Type first' : 'Select Transmission')}
                      disabled={!model}
                    />

                    {/* Engine Capacity */}
                    <CustomDropdown
                      label="ENGINE CAPACITY"
                      required
                      value={engine}
                      onChange={handleEngineChange}
                      options={engineOptions.map((e) => ({
                        label: `${e} CC`,
                        value: String(e),
                      }))}
                      placeholder={!model ? 'Select Model first' : 'Select Engine'}
                      disabled={!model}
                    />

                    {/* Max Power */}
                    <CustomDropdown
                      label="MAX POWER"
                      required
                      value={maxPower}
                      onChange={handleMaxPowerChange}
                      options={maxPowerOptions.map((p) => ({
                        label: `${p} bhp`,
                        value: String(p),
                      }))}
                      placeholder={!engine ? 'Select Engine first' : 'Select Max Power'}
                      disabled={!engine}
                    />

                    {/* Mileage */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-secondary-text uppercase block">
                        MILEAGE <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={mileage}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (!isNaN(val) && Number(val) >= 0)) {
                              setMileage(val);
                            }
                          }}
                          placeholder="e.g. 18.5"
                          className="w-full min-h-[44px] py-2.5 pl-3 pr-12 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-semibold text-white font-mono focus:outline-none focus:border-brand-primary"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-secondary-text/60 pointer-events-none">
                          km/l
                        </span>
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-secondary-text uppercase block">
                        SEATS <span className="text-rose-400">*</span>
                      </label>
                      {seatsOptions.length > 1 ? (
                        <CustomDropdown
                          value={seats}
                          onChange={(val) => setSeats(String(val))}
                          options={seatsOptions.map((s) => ({
                            label: `${s} Seats`,
                            value: String(s),
                          }))}
                          placeholder={!maxPower ? 'Select Spec first' : 'Select Seats'}
                          disabled={!maxPower}
                        />
                      ) : seatsOptions.length === 1 ? (
                        <div className="w-full min-h-[44px] py-2.5 px-3.5 bg-white/[0.05] border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 font-mono flex items-center justify-between">
                          <span>{seats} Seats</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      ) : (
                        <CustomDropdown
                          disabled
                          value=""
                          onChange={() => {}}
                          options={[]}
                          placeholder="Select Spec first"
                        />
                      )}
                    </div>

                    {/* Seller Type (Standard Dropdown) */}
                    <div className="sm:col-span-2 space-y-1 relative text-left" ref={sellerDropdownRef}>
                      <label className="text-[10px] font-mono font-bold text-secondary-text uppercase block tracking-wider">
                        SELLER TYPE <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSellerDropdownOpen(!isSellerDropdownOpen)}
                        className={`w-full min-h-[44px] py-2.5 px-3.5 bg-white/[0.03] border rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isSellerDropdownOpen
                            ? 'border-brand-primary text-white bg-white/[0.06]'
                            : 'border-white/10 text-white hover:border-white/25 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="truncate">{sellerType || 'Select Seller Type'}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-secondary-text transition-transform duration-200 shrink-0 ml-2 ${
                            isSellerDropdownOpen ? 'rotate-180 text-brand-primary' : ''
                          }`}
                        />
                      </button>

                      {/* Standard Dropdown Menu */}
                      <AnimatePresence>
                        {isSellerDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 z-30 mt-1.5 bg-[#050816] border border-white/15 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] py-1.5 backdrop-blur-2xl overflow-hidden"
                          >
                            {['Individual', 'Dealer', 'Trustmark Dealer'].map((option) => {
                              const isSelected = sellerType === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    setSellerType(option);
                                    setIsSellerDropdownOpen(false);
                                  }}
                                  className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs text-left font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-brand-primary/20 text-white font-bold border-l-2 border-brand-primary'
                                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                                  }`}
                                >
                                  <span>{option}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full min-h-[48px] py-3.5 sm:py-4 mt-4 btn-glow-primary rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center space-x-2 transition-transform active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Resale Value...</span>
                    </>
                  ) : (
                    <>
                      <span>Predict Resale Price</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

          {/* RIGHT PANEL: VALUATION RESULT CONSOLE */}
          <div className="lg:col-span-7" ref={resultsRef}>
            <div className="glass-panel-heavy border border-white/10 bg-[#050816]/85 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:p-8 min-h-[auto] lg:min-h-[540px] flex flex-col justify-between text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col justify-between h-full space-y-6 text-left">
                
                {/* Console Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4.5 h-4.5 text-brand-accent animate-pulse shrink-0" />
                    <h2 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider truncate">
                      PREDICTION CONSOLE
                    </h2>
                  </div>

                  {/* Telemetry Stepper Ribbon */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[9px] sm:text-[10px] font-mono">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${currentStep >= 1 ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30' : 'bg-white/5 text-secondary-text/50'}`}>
                      01 Vehicle
                    </span>
                    <span className="text-secondary-text/30">→</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${currentStep >= 2 ? 'bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30' : 'bg-white/5 text-secondary-text/50'}`}>
                      02 Specs
                    </span>
                    <span className="text-secondary-text/30">→</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${currentStep >= 3 ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-white/5 text-secondary-text/50'}`}>
                      03 Estimate
                    </span>
                  </div>
                </div>

                {/* BEFORE PREDICTION: Idle State */}
                {!result && !isCalculating && (
                  <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-5 sm:space-y-6 flex-1 px-2">
                    
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                      <Car className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary/60" />
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white">
                        Your estimated resale price will appear here
                      </h3>
                      <p className="text-xs text-secondary-text leading-relaxed">
                        Fill out the vehicle specification form on the left and click "Predict Resale Price" to calculate the estimated resale value based on your vehicle details.
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-secondary-text max-w-full truncate">
                        <Activity className="w-3.5 h-3.5 text-brand-primary animate-pulse shrink-0" />
                        <span className="truncate">
                          {brand && model
                            ? `Selected: ${brand} ${model}`
                            : 'Awaiting Vehicle Selection'}
                        </span>
                      </span>
                    </div>

                  </div>
                )}

                {/* DURING CALCULATION: Processing State */}
                {isCalculating && (
                  <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center space-y-4 flex-1">
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">Calculating Resale Value...</h4>
                      <span className="text-xs font-mono text-secondary-text block">Processing vehicle attributes to estimate market resale value</span>
                    </div>
                  </div>
                )}

                {/* AFTER PREDICTION: Valuation Result */}
                <AnimatePresence>
                  {result && !isCalculating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="space-y-5 sm:space-y-6 py-2 flex-1 flex flex-col justify-between"
                    >
                      <div className="space-y-4 sm:space-y-5">
                        
                        {/* Hero Valuation Price Box */}
                        <div className="bg-gradient-to-r from-brand-primary/15 via-white/[0.03] to-transparent border border-brand-primary/30 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
                            <TrendingUp className="w-20 h-20 sm:w-24 sm:h-24 text-brand-primary" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest block">
                            ESTIMATED RESALE VALUE
                          </span>
                          <h3 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-gradient-primary mt-1.5 truncate">
                            ₹{result.predicted_price.toLocaleString('en-IN')}
                          </h3>
                        </div>

                        {/* Vehicle Spec Summary Grid (Reflows smoothly across 320px-1440px) */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-secondary-text/80 uppercase tracking-wider block">
                            CONFIGURED VEHICLE SUMMARY
                          </span>
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 font-mono text-xs">
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                              <span className="text-[9px] text-secondary-text block">Vehicle</span>
                              <span className="text-white font-bold font-sans truncate block">{result.vehicle.brand} {result.vehicle.model}</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                              <span className="text-[9px] text-secondary-text block">Age / KM Driven</span>
                              <span className="text-white font-bold truncate block">{result.vehicle.vehicle_age} yrs • {result.vehicle.km_driven.toLocaleString()} km</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                              <span className="text-[9px] text-secondary-text block">Fuel & Transmission</span>
                              <span className="text-white font-bold truncate block">{result.vehicle.fuel_type} • {result.vehicle.transmission}</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                              <span className="text-[9px] text-secondary-text block">Engine / Power</span>
                              <span className="text-white font-bold truncate block">{result.vehicle.engine} CC • {result.vehicle.max_power} bhp</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                              <span className="text-[9px] text-secondary-text block">Mileage / Seats</span>
                              <span className="text-white font-bold truncate block">{result.vehicle.mileage} km/l • {result.vehicle.seats} seats</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                              <span className="text-[9px] text-secondary-text block">Seller Type</span>
                              <span className="text-white font-bold truncate block">{result.vehicle.seller_type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Immediate PDF Download Banner */}
                        <div className="p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-1 text-left w-full sm:w-auto">
                            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                              <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                              <span>Official PDF Valuation Report</span>
                            </h4>
                            <p className="text-xs text-secondary-text">
                              Download a detailed PDF document containing the vehicle specs and estimated resale price.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => generatePredictionPDF(result)}
                            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl btn-glow-primary text-xs font-bold text-white flex items-center justify-center space-x-2 shrink-0 cursor-pointer active:scale-95"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Download PDF Report</span>
                          </button>
                        </div>

                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
