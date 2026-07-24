import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

function CarFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full flex flex-col items-center justify-center relative px-4"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-transparent to-brand-accent/10 rounded-3xl blur-2xl -z-10" />
      
      {/* High-tech dashboard wireframe of sports car */}
      <div className="relative w-full max-w-[480px] aspect-[16/10] border border-white/10 rounded-2xl bg-white/5 flex flex-col items-center justify-center p-8 text-center glass-panel overflow-hidden">
        {/* Decorative corner lines */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20" />
        
        {/* Animated Cyber Grid Inside Fallback */}
        <div className="absolute inset-0 bg-grid-cyber opacity-15" />

        {/* Glowing car silhouette using SVG */}
        <div className="relative w-full flex justify-center mb-6">
          <div className="absolute w-28 h-28 rounded-full bg-brand-primary/10 border border-brand-primary/25 animate-ping opacity-40" />
          
          <svg 
            className="w-60 h-28 text-brand-primary drop-shadow-[0_0_20px_rgba(37,99,235,0.7)] hover:drop-shadow-[0_0_35px_rgba(249,115,22,0.8)] transition-all duration-500 hover:text-brand-accent cursor-pointer"
            viewBox="0 0 100 50" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.2"
          >
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              strokeLinecap="round" 
              strokeLinejoin="round"
              d="M10 32 C12 32, 14 32, 16 32 
                 C18 28, 24 28, 26 32 
                 L45 32 
                 C47 28, 53 28, 55 32 
                 L84 32 
                 C86 31, 88 29, 90 26 
                 L92 22 
                 C93 18, 91 16, 88 16 
                 L72 16 
                 C68 12, 60 8, 50 8 
                 L30 8 
                 C24 8, 16 12, 12 16 
                 L8 20 
                 C6 22, 5 24, 5 26 
                 L5 30 
                 C5 31, 7 32, 10 32 Z" 
            />
            <path d="M6 22 L10 23 M92 22 L88 23" stroke="#F97316" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
            <circle cx="21" cy="32" r="5" className="stroke-brand-primary fill-luxury-bg" />
            <circle cx="21" cy="32" r="2.5" className="stroke-white/40" />
            <circle cx="50" cy="32" r="5" className="stroke-brand-primary fill-luxury-bg" />
            <circle cx="50" cy="32" r="2.5" className="stroke-white/40" />
            <path d="M32 10 L48 10 C54 10, 62 14, 66 18 L32 18 Z" className="stroke-white/20 fill-white/5" />
            <line x1="72" y1="22" x2="80" y2="22" stroke="currentColor" strokeDasharray="2 2" className="opacity-40" />
            <line x1="70" y1="26" x2="78" y2="26" stroke="currentColor" strokeDasharray="2 2" className="opacity-40" />
          </svg>
        </div>

        <h3 className="font-display font-bold text-xl text-white mt-2 flex items-center justify-center space-x-2">
          <span>Autopilot ML Active</span>
        </h3>
        <p className="text-secondary-text text-xs mt-2 max-w-sm">
          Interactive 3D model paused. Valuation models and neural networks are fully operational.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-[10px] font-mono px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-md">
            XGBoost v2.1
          </span>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-md">
            CatBoost v1.2
          </span>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
            RandomForest
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function WebGLCar({ onLoad, onError, onProgress }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let animationFrameId;
    let renderer, scene, camera, carGroup;
    let bodyMaterial;
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;
    let isHovered = false;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup - wider view frustum and adjusted position to prevent profile clipping
    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(4.2, 0.9, 5.0);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 4. Car Group
    carGroup = new THREE.Group();
    scene.add(carGroup);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Key Directional Light (Cyan/Blue tint)
    const keyLight = new THREE.DirectionalLight(0x2563EB, 3.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    // Secondary Accent Light (Orange tint)
    const fillLight = new THREE.DirectionalLight(0xF97316, 1.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Soft overhead light
    const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // Subtle moving reflection light (Porsche/Audi showroom style)
    const reflectionLight = new THREE.DirectionalLight(0xffffff, 1.2);
    reflectionLight.position.set(0, 5, 0);
    scene.add(reflectionLight);

    // Front headlights helper spot lights
    const headlightLeft = new THREE.SpotLight(0xffffff, 8, 15, Math.PI / 6, 0.5, 1);
    headlightLeft.position.set(1.2, 0.1, 2.2);
    headlightLeft.target.position.set(2.5, -0.5, 4.5);
    carGroup.add(headlightLeft);
    carGroup.add(headlightLeft.target);

    const headlightRight = new THREE.SpotLight(0xffffff, 8, 15, Math.PI / 6, 0.5, 1);
    headlightRight.position.set(-1.2, 0.1, 2.2);
    headlightRight.target.position.set(-2.5, -0.5, 4.5);
    carGroup.add(headlightRight);
    carGroup.add(headlightRight.target);

    // 6. Ground Shadow Map
    const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    gradient.addColorStop(0, 'rgba(1, 2, 8, 0.85)');
    gradient.addColorStop(0.3, 'rgba(1, 2, 8, 0.6)');
    gradient.addColorStop(1, 'rgba(1, 2, 8, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.57;
    shadowMesh.scale.set(1.08, 1.08, 1.08); // Increased size by 10% (from 0.98 to 1.08)
    scene.add(shadowMesh);

    // 7. Load GLTF model with Draco decoder (fully local)
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    const modelUrl = '/models/ferrari.glb';

    loader.load(
      modelUrl,
      (gltf) => {
        const car = gltf.scene;
        
        car.scale.set(1.08, 1.08, 1.08); // Increased size by 10% (from 0.98 to 1.08)
        car.position.set(0, -0.55, 0);

        bodyMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xe2e8f0, // Liquid Silver / Platinum paint
          metalness: 0.95,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
        });

        const chromeMaterial = new THREE.MeshStandardMaterial({
          color: 0xeeeeee,
          metalness: 1.0,
          roughness: 0.08,
        });

        const carbonMaterial = new THREE.MeshStandardMaterial({
          color: 0x18181b,
          metalness: 0.4,
          roughness: 0.5,
        });

        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x090d16,
          metalness: 0.2,
          roughness: 0.1,
          transmission: 0.6,
          transparent: true,
          opacity: 0.5,
        });

        const interiorMaterial = new THREE.MeshStandardMaterial({
          color: 0x09090b,
          roughness: 0.8,
        });

        car.traverse((child) => {
          if (child.isMesh) {
            const meshName = child.name.toLowerCase();

            if (meshName.includes('body')) {
              child.material = bodyMaterial;
            } else if (meshName.includes('rim') || meshName.includes('wheel') || meshName.includes('brake')) {
              child.material = chromeMaterial;
            } else if (meshName.includes('glass') || meshName.includes('windshield')) {
              child.material = glassMaterial;
            } else if (meshName.includes('carbon')) {
              child.material = carbonMaterial;
            } else if (meshName.includes('interior') || meshName.includes('seat')) {
              child.material = interiorMaterial;
            } else if (meshName.includes('headlight')) {
              child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            }
          }
        });

        carGroup.add(car);
        onLoad();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const progress = Math.min((xhr.loaded / xhr.total) * 100, 100);
          onProgress(Math.floor(progress));
        }
      },
      (err) => {
        console.error('Error loading 3D car:', err);
        onError();
      }
    );

    // 8. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -0.23, 0); // Center the camera target on the car's body
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Prevent hijacking page scroll
    controls.enablePan = false; // Disable panning
    controls.minPolarAngle = Math.PI / 3; // Prevent looking under the floor
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent looking below the floor
    controls.autoRotate = true; // Enable continuous 360° rotation
    controls.autoRotateSpeed = 0.88; // 10% faster than 0.8

    // Resize Handler
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Mouse Interactions
    const onMouseEnter = () => {
      isHovered = true;
    };
    
    const onMouseLeave = () => {
      isHovered = false;
    };

    containerRef.current.addEventListener('mouseenter', onMouseEnter);
    containerRef.current.addEventListener('mouseleave', onMouseLeave);

    // Easing states variables
    let currentHoverScale = 1.0;
    let currentHeadlightIntensity = 8;
    let currentShadowScale = 1.08;
    let currentBodyRoughness = 0.1;

    // Animation Clock
    const clock = new THREE.Clock();
    const tick = () => {
      animationFrameId = requestAnimationFrame(tick);

      const elapsedTime = clock.getElapsedTime();

      // 1. Hover Easing Calculations
      const targetHoverScale = isHovered ? 1.015 : 1.0;
      currentHoverScale += (targetHoverScale - currentHoverScale) * 0.08;

      const targetHeadlight = isHovered ? 10 : 8;
      currentHeadlightIntensity += (targetHeadlight - currentHeadlightIntensity) * 0.08;
      headlightLeft.intensity = currentHeadlightIntensity;
      headlightRight.intensity = currentHeadlightIntensity;

      const targetShadow = isHovered ? 1.095 : 1.08;
      currentShadowScale += (targetShadow - currentShadowScale) * 0.08;
      shadowMesh.scale.set(currentShadowScale, currentShadowScale, currentShadowScale);

      const targetRoughness = isHovered ? 0.07 : 0.1;
      currentBodyRoughness += (targetRoughness - currentBodyRoughness) * 0.08;
      if (bodyMaterial) bodyMaterial.roughness = currentBodyRoughness;

      // 2. Very Subtle Floating Animation (2-3px translation, zero roll/pitch)
      const floatY = Math.sin(elapsedTime * 0.7) * 0.004;

      // 3. Slow Breathing Scale effect (1% scale change over 9 seconds)
      const breathingScale = 1.0 + Math.sin(elapsedTime * 0.7) * 0.005;

      // 4. Very subtle drifting reflections
      reflectionLight.position.x = Math.sin(elapsedTime * 0.1) * 4;
      reflectionLight.position.z = Math.cos(elapsedTime * 0.1) * 4;

      // 5. Apply transforms to Group (car is rotated by OrbitControls camera)
      carGroup.position.y = floatY;
      carGroup.rotation.y = 0;
      carGroup.rotation.x = 0;
      carGroup.rotation.z = 0;

      // Base scale (1.08) combined with breathing and hover scales
      const finalScale = 1.08 * breathingScale * currentHoverScale;
      carGroup.scale.set(finalScale, finalScale, finalScale);

      // Update controls damping and render
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // Cleanups
    return () => {
      window.removeEventListener('resize', onResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseenter', onMouseEnter);
        containerRef.current.removeEventListener('mouseleave', onMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      if (renderer) renderer.dispose();
      dracoLoader.dispose();
    };
  }, [onLoad, onError, onProgress]);

  return (
    <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default function ThreeCar() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleProgress = useCallback((val) => {
    setProgress(val);
  }, []);

  return (
    <div className="relative w-full h-[360px] md:h-[480px] lg:h-[580px] flex items-center justify-center select-none">
      <ErrorBoundary fallback={<CarFallback />}>
        {!hasError && (
          <WebGLCar 
            onLoad={handleLoad} 
            onError={handleError} 
            onProgress={handleProgress} 
          />
        )}
      </ErrorBoundary>

      {/* Manual error fallback display */}
      {hasError && <CarFallback />}

      {/* Elegant Loading overlay */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-luxury-bg/85 backdrop-blur-md rounded-3xl border border-white/5"
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {/* Spinning futuristic progress dial */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="3" 
                  fill="transparent" 
                />
                {/* Active Ring */}
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="#2563EB" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="263.89" 
                  strokeDashoffset={263.89 - (263.89 * progress) / 100}
                  transition={{ ease: "easeOut" }}
                />
              </svg>
              {/* Inner Dial indicator */}
              <div className="absolute text-sm font-mono font-bold text-white">
                {progress}%
              </div>
            </div>

            <motion.h3 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 font-display font-semibold text-white tracking-widest text-xs uppercase"
            >
              INITIALIZING 3D ENGINE
            </motion.h3>
            <p className="text-secondary-text text-[11px] mt-1.5">Loading scene shaders & lighting indices...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating speech bubble message box */}
      {!isLoading && !hasError && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.9, x: '-50%' }}
          animate={{ 
            opacity: 1, 
            y: [0, -6, 0], 
            scale: 1,
            x: '-50%'
          }}
          transition={{ 
            opacity: { delay: 1.2, duration: 0.5 },
            scale: { delay: 1.2, duration: 0.5 },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute top-[-5%] md:top-[-6%] left-1/2 z-20 pointer-events-none flex flex-col items-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
        >
          {/* Glass HUD panel */}
          <div className="glass-panel border border-white/10 rounded-2xl px-6 py-3 bg-[#050816]/90 backdrop-blur-md flex flex-col items-center space-y-1 hover:border-brand-primary/40 transition-colors duration-300">
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] font-bold text-brand-primary font-mono uppercase tracking-widest">
                Sample Prediction
              </span>
            </div>
            <span className="font-display font-extrabold text-lg md:text-xl text-gradient-primary tracking-tight">
              ₹2,15,00,000
            </span>
            <span className="text-[9px] font-mono text-secondary-text/80">
              Ferrari 458 Italia (2018)
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
