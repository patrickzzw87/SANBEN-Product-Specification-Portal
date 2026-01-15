import React, { useRef, useState } from 'react';
import { PolarChart } from './components/PolarChart';
import { ModelBreakdown } from './components/ModelBreakdown';
import { ElectricalSpec, OpticalSpecRow, ProductConfig } from './types';
import { GoogleGenAI } from "@google/genai";

// --- DATA DEFINITIONS ---

// Helper for generating polar data
const createPolarData = (type: 'narrow' | 'wide' | 'flood'): { angle: string; A: number }[] => {
  if (type === 'narrow') { // ~24 deg
    return [
      { angle: '0', A: 100 }, { angle: '10', A: 80 }, { angle: '20', A: 10 }, { angle: '30', A: 2 }, 
      { angle: '60', A: 0 }, { angle: '90', A: 0 }, { angle: '180', A: 0 }, 
      { angle: '270', A: 0 }, { angle: '330', A: 2 }, { angle: '340', A: 10 }, { angle: '350', A: 80 },
    ];
  } else if (type === 'wide') { // ~60 deg
    return [
      { angle: '0', A: 100 }, { angle: '30', A: 50 }, { angle: '45', A: 20 }, { angle: '60', A: 5 }, 
      { angle: '90', A: 0 }, { angle: '180', A: 0 }, 
      { angle: '300', A: 5 }, { angle: '315', A: 20 }, { angle: '330', A: 50 },
    ];
  } else { // Flood ~110 deg
    return [
      { angle: '0', A: 100 }, { angle: '45', A: 70 }, { angle: '60', A: 50 }, { angle: '90', A: 10 },
      { angle: '120', A: 0 }, { angle: '180', A: 0 }, { angle: '240', A: 0 }, 
      { angle: '270', A: 10 }, { angle: '300', A: 50 }, { angle: '315', A: 70 },
    ];
  }
};

const PRODUCT_F_TYPE: ProductConfig = {
  id: 'track-f-04',
  name: 'F-Type Track Spotlight Series',
  model: 'SR-LSP-36F 04',
  series: 'F-Type 04 Series',
  appType: 'Commercial Lighting',
  docRev: 'B01',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional, sophisticated product description (approx 100 words) for the "F-Type Track Spotlight Series" from Sanben Lighting.
    Key Features: 36W LED Track Light, High Efficacy (>100lm/W), CRI 90+, Flicker-free driver.
    Specs: 36W, 220-240V, PF>0.9.
    Tone: Technical, architectural.
  `,
  defaultDescription: "The SR-LSP-36F 04 is a high-performance LED track spotlight designed for professional commercial lighting applications. It features a high-efficiency COB light source with a CRI of ≥90, ensuring accurate color rendering. Powered by a flicker-free, isolated constant current driver, it delivers stable illumination with a system efficacy of up to 115 lm/W. The die-cast aluminum housing provides excellent thermal management for a long service life.",
  electrical: {
    inputVoltage: '220-240V AC', // PDF: 220..240
    inputCurrent: 'Max 220 mA',
    ratedPower: '36W',
    powerFactor: '> 0.90', // PDF: >0.90
    thd: '≤ 20%', // PDF: <=20
    driverClass: 'Isolated, Flicker-Free'
  },
  mechanical: {
    material: 'Die-cast Aluminum', // Implied by housing quality
    finish: 'Powder Coat (Black/White)',
    optic: 'Reflector / Lens',
    adjustability: '350° Pan / 90° Tilt',
    ip: 'IP20',
    weight: 'N/A' // Not in PDF
  },
  optical: [
    { cct: '2700K', lumen: '3780', efficacy: '105', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '3000K', lumen: '3960', efficacy: '110', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '3500K', lumen: '4068', efficacy: '113', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '4000K', lumen: '4140', efficacy: '115', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '5000K', lumen: '4140', efficacy: '115', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
  ],
  opticalGraph: {
    beamAngle: '24.88°', // Exact match to PDF Page 3
    polarData: createPolarData('narrow'),
    coneData: [
      // PDF Page 3 Track: 1m -> Emax 14528lx, Dia 44.11cm
      { distance: '1m', lux: '14,528 lx', diameter: 'Ø 0.44m', barWidth: '100%' },
      // PDF Page 3 Track: 2m -> Emax 3632lx (approx derived or read), Dia 88.22cm
      { distance: '2m', lux: '3,632 lx', diameter: 'Ø 0.88m', barWidth: '25%' },
      // PDF Page 3 Track: 3m -> Emax 1614lx, Dia 132.33cm
      { distance: '3m', lux: '1,614 lx', diameter: 'Ø 1.32m', barWidth: '11%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'LSP', label: 'Type', desc: '(LED Spot)', color: 'text-blue-600' },
    { code: '36', label: 'Power', desc: '(36W)', color: 'text-green-600' },
    { code: 'F', label: 'Series', desc: '(F Style)', color: 'text-purple-600' },
  ],
  features: ['CRI ≥ 90', 'Flicker-Free', 'High Efficacy'],
  standards: ['EN 55015', 'EN 61547', 'EN 61347-2-13', 'IP20', 'UL94 V-2']
};

const PRODUCT_LD5: ProductConfig = {
  id: 'recessed-ld5',
  name: 'LED Embedded Spotlight',
  model: 'SR-LD5-36C16',
  series: 'C16 Embedded Series',
  appType: 'Commercial / Hotel / Retail',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "SR-LD5 Series Embedded Spotlight" from Sanben Lighting.
    Key Features: High-power 36W recessed downlight, adjustable (355 degree rotation, 30 degree tilt), die-cast aluminum heatsink, high CRI >90.
    Specs: Cutout 125mm, 36W, 3-step SDCM.
    Tone: Technical, reliable, versatile.
  `,
  defaultDescription: "The SR-LD5 Series is a high-performance LED recessed spotlight designed for flexible commercial lighting. Featuring a robust die-cast aluminum heatsink and a precision optical system, it offers 355° horizontal rotation and 30° vertical tilt for targeted illumination. With a CRI of over 90 and high luminous efficacy, it ensures vibrant and accurate color rendering for merchandise and architectural details.",
  electrical: {
    inputVoltage: '220-240V AC',
    inputCurrent: 'Max 160 mA',
    ratedPower: '36W',
    powerFactor: '> 0.90',
    thd: '≤ 20%',
    driverClass: 'Class II, Isolated'
  },
  mechanical: {
    material: 'Die-cast Aluminum',
    finish: 'Powder Coat (White/Black)',
    optic: 'Reflector + Lens',
    adjustability: '355° Pan / 30° Tilt',
    ip: 'IP20',
    weight: 'N/A', // Not in PDF
    cutout: 'Ø 125mm'
  },
  optical: [
    { cct: '2700K', lumen: '3420', efficacy: '95', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '3000K', lumen: '3528', efficacy: '98', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '3500K', lumen: '3708', efficacy: '103', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '4000K', lumen: '3888', efficacy: '108', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '5000K', lumen: '3888', efficacy: '108', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
  ],
  opticalGraph: {
    beamAngle: '23.72°', // Exact match to PDF Page 3 (Recessed)
    polarData: createPolarData('narrow'),
    coneData: [
      // PDF Page 3 Recessed: 1m -> Emax 11164lx (PDF: 7729, 11164), Dia 41.99cm
      { distance: '1m', lux: '11,164 lx', diameter: 'Ø 0.42m', barWidth: '100%' },
      // PDF Page 3 Recessed: 2m -> Emax 2791lx, Dia 83.99cm
      { distance: '2m', lux: '2,791 lx', diameter: 'Ø 0.84m', barWidth: '25%' },
      // PDF Page 3 Recessed: 3m -> Emax 1240lx, Dia 125.98cm
      { distance: '3m', lux: '1,240 lx', diameter: 'Ø 1.26m', barWidth: '11%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'L', label: 'Source', desc: '(LED)', color: 'text-gray-600' },
    { code: 'D5', label: 'Type', desc: '(Recessed)', color: 'text-blue-600' },
    { code: '36', label: 'Power', desc: '(36W)', color: 'text-green-600' },
    { code: 'C16', label: 'Series', desc: '(C16 Style)', color: 'text-purple-600' },
  ],
  features: ['Adjustable Head', 'High Efficacy', 'Cutout 125mm'],
  standards: ['EN 55015', 'EN 61547', 'EN 61347-2-13', 'UL94 V-2', 'IP20']
};

const PRODUCT_WM_SERIES: ProductConfig = {
  id: 'downlight-wm-08',
  name: 'WM Series Anti-glare Downlight',
  model: 'SR-LD8-50B01',
  series: 'WM Die-cast Series',
  appType: 'Office / Mall / Airport',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "WM Series Anti-glare Die-cast Aluminum Downlight" (Model SR-LD8-50B01) from Sanben Lighting.
    Key Features: 8-inch large aperture, High Power 50W, Die-cast aluminum heatsink for superior thermal management, Low Glare (UGR<22).
    Specs: 4350-4850lm, CRI > 80, Cutout 205mm.
    Tone: Industrial, robust, high-performance.
  `,
  defaultDescription: "The WM Series SR-LD8 is a high-power 8-inch embedded downlight engineered for expansive commercial environments. Constructed with a heavy-duty die-cast aluminum heat sink, it ensures optimal thermal dissipation for its 50W output. The deep anti-glare optical design achieves a UGR of less than 22, providing visual comfort alongside powerful illumination suitable for high-ceiling applications like airports and shopping malls.",
  electrical: {
    inputVoltage: '220V AC',
    inputCurrent: '300 mA',
    ratedPower: '50W ±10%',
    powerFactor: '0.95',
    thd: '≤ 15%', // PDF: <=15 for <=42W, but <=20 for 50W.
    driverClass: 'SELV Isolated, Constant Current'
  },
  mechanical: {
    material: 'Die-cast Aluminum',
    finish: 'Powder Coat (White)',
    optic: 'Anti-glare Reflector',
    adjustability: 'Fixed',
    ip: 'IP20',
    weight: 'N/A', // Not in PDF
    cutout: 'Ø 205mm'
  },
  optical: [
    { cct: '3000K', lumen: '4350', efficacy: '87', sdcm: '-', cri: 'Ra > 80', angle: '60°' },
    { cct: '4000K', lumen: '4850', efficacy: '97', sdcm: '-', cri: 'Ra > 80', angle: '60°' },
    { cct: '5000K', lumen: '4850', efficacy: '97', sdcm: '-', cri: 'Ra > 80', angle: '60°' },
    { cct: '6000K', lumen: '4850', efficacy: '97', sdcm: '-', cri: 'Ra > 80', angle: '60°' },
  ],
  opticalGraph: {
    beamAngle: '60°',
    polarData: createPolarData('wide'),
    coneData: [
      { distance: '1m', lux: '5,300 lx', diameter: 'Ø 1.15m', barWidth: '100%' },
      { distance: '2m', lux: '1,325 lx', diameter: 'Ø 2.30m', barWidth: '25%' },
      { distance: '3m', lux: '590 lx', diameter: 'Ø 3.45m', barWidth: '11%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'LD8', label: 'Series', desc: '(8" Downlight)', color: 'text-blue-600' },
    { code: '50', label: 'Power', desc: '(50W)', color: 'text-green-600' },
    { code: 'B01', label: 'Version', desc: '(Ver. 1)', color: 'text-gray-600' },
  ],
  features: ['UGR < 22', '50W High Power', 'Die-cast Heatsink'],
  standards: ['EN 55015', 'EN 61547', 'EN 61347-2-13', 'UL94 V-2', 'IP20']
};

const PRODUCT_PANEL_SERIES: ProductConfig = {
  id: 'panel-6060',
  name: 'LED Back-lit Panel Light',
  model: 'SR-LPL-6060',
  series: 'LPL Series',
  appType: 'Office / School / Hospital',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "SR-LPL Series LED Panel Light" (Model 6060-36W) from Sanben Lighting.
    Key Features: Back-lit technology, High Efficacy 120lm/W, LIFUD Brand Driver, Flicker-free (Percentage <3%), UGR<22.
    Specs: 36W, 4320lm, 595x595mm size, IP40.
    Tone: Professional, efficient, commercial.
  `,
  defaultDescription: "The SR-LPL Series is a high-efficiency back-lit LED panel designed for modern office and educational environments. Utilizing premium Sanan SMD2835 chips and a high-quality LIFUD driver, it delivers an impressive 120lm/W efficacy with a flicker-free output (<3%). The robust iron backplate and aluminum frame construction ensure effective thermal management, while the PS diffuser provides uniform, glare-reduced illumination (UGR<22).",
  electrical: {
    inputVoltage: '220-240V AC',
    inputCurrent: '900 mA (Output)',
    ratedPower: '36W ±5%',
    powerFactor: '> 0.9',
    thd: '≤ 15%',
    driverClass: 'LIFUD / Flicker-Free'
  },
  mechanical: {
    material: 'Aluminum Frame + Iron Backplate',
    finish: 'Powder Coat (White)',
    optic: 'PS Diffuser + PMMA Lens',
    adjustability: 'None',
    ip: 'IP40',
    weight: '2.0 kg',
    cutout: 'N/A (T-Grid/Surface)'
  },
  optical: [
    { cct: '5000K', lumen: '4320', efficacy: '120', sdcm: '-', cri: 'Ra > 80', angle: '113°' },
  ],
  opticalGraph: {
    beamAngle: '112.92°', // Exact match to PDF Page 6 (595x595)
    polarData: createPolarData('flood'),
    coneData: [
      // PDF Page 6 Panel: 1m -> Emax 1527 lx (approx peak for calculation, table says 434.2/1527 avg/max spread? No, panel lights have lower peak). 
      // Table values: 1m: 434.2, 1527lx. 2m: 108.6, 381.9lx.
      // Let's use the Max values (1527) as is standard for Cone Emax.
      { distance: '1m', lux: '1,527 lx', diameter: 'Ø 3.01m', barWidth: '100%' }, 
      { distance: '2m', lux: '382 lx', diameter: 'Ø 6.03m', barWidth: '25%' },
      { distance: '3m', lux: '170 lx', diameter: 'Ø 9.05m', barWidth: '11%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'LPL', label: 'Type', desc: '(Panel)', color: 'text-blue-600' },
    { code: '6060', label: 'Size', desc: '(60x60cm)', color: 'text-green-600' },
    { code: '36W', label: 'Power', desc: '(36W)', color: 'text-gray-600' },
  ],
  features: ['120lm/W High Efficacy', 'UGR < 22', 'LIFUD Driver'],
  standards: ['CE', 'CB', 'RoHS', 'EN 60598', 'IP40']
};

const PRODUCT_TRACK_RAIL: ProductConfig = {
  id: 'track-rail-01',
  name: '3-Line Power Track System',
  model: 'Three Line 01 Style',
  series: 'Track Accessories',
  appType: 'Retail / Gallery / Showroom',
  docRev: 'A/2',
  imageUrl: '',
  descriptionPrompt: `
    Write a technical product description for the "3-Line Power Track Rail" from Sanben Lighting.
    Key Features: High-quality aluminum alloy extrusion, Copper conductors (3.8mm flat wire), PVC insulation, Fire retardant ABS (V1) connectors.
    Specs: AC100-240V, 15A/10A, 1 Meter standard length.
    Tone: Industrial, technical, safety-focused.
  `,
  defaultDescription: "The Three Line 01 Style is a robust 3-line power track system designed for versatile commercial lighting installations. Constructed from premium aluminum alloy with a flame-retardant PVC insulation strip, it features high-conductivity copper busbars (3.8mm x 0.8mm) to ensure stable power transmission. The system supports a maximum load current of 15A (100V) or 10A (220V) and is compatible with a wide range of track adapters.",
  electrical: {
    inputVoltage: 'AC 100-240V, 50/60Hz',
    inputCurrent: '15A (100V) / 10A (220V)',
    ratedPower: 'N/A',
    powerFactor: 'N/A',
    thd: 'N/A',
    driverClass: 'Passive Conductor'
  },
  mechanical: {
    material: 'Aluminum Alloy + Copper + PVC',
    finish: 'Powder Coat (Black/White)',
    optic: 'PVC Insulation',
    adjustability: 'N/A',
    ip: 'IP20',
    weight: 'N/A',
    cutout: 'Surface / Pendant'
  },
  optical: undefined, // Accessory has no optical data
  opticalGraph: undefined,
  packing: [
    'Standard Length: 1000mm ± 3mm',
    'Carton Qty: 15 Pcs / Carton',
    'Carton Size: 1020mm x 95mm x 185mm',
    'Protection: Heat Shrink Film per Unit'
  ],
  installation: "Compatible with standard 3-wire track adapters. Supports surface mounting or pendant suspension (rod/cable). Maximum mechanical load: 3 fixtures per meter, <1.5kg per fixture.",
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'TRK', label: 'Product', desc: '(Track)', color: 'text-blue-600' },
    { code: '3L', label: 'Type', desc: '(3-Line)', color: 'text-green-600' },
    { code: '1M', label: 'Length', desc: '(1 Meter)', color: 'text-gray-600' },
  ],
  features: ['Pure Copper Conductor', 'Flame Retardant V1', 'Thick Aluminum Profile'],
  standards: ['EN 60570', 'CE', 'RoHS', 'VDE', 'IP20']
};

const PRODUCTS = [PRODUCT_F_TYPE, PRODUCT_LD5, PRODUCT_WM_SERIES, PRODUCT_PANEL_SERIES, PRODUCT_TRACK_RAIL];

// --- BRAND HERITAGE VISUAL COMPONENT ---

const BirdsNestHero = () => (
  <svg viewBox="0 0 800 220" className="w-full h-full rounded-sm shadow-sm border border-gray-100">
    <defs>
      {/* Sophisticated dusk gradient */}
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stopColor="#1a202c" />
         <stop offset="50%" stopColor="#2d3748" />
         <stop offset="100%" stopColor="#4a5568" />
      </linearGradient>
      
      {/* Metallic structure gradient */}
      <linearGradient id="metalGradient" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0%" stopColor="#cbd5e0" />
         <stop offset="50%" stopColor="#a0aec0" />
         <stop offset="100%" stopColor="#718096" />
      </linearGradient>

      {/* Glow filter for text */}
      <filter id="softGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
        <feGaussianBlur in="thicken" stdDeviation="2" result="blurred" />
        <feFlood floodColor="rgba(255,255,255,0.2)" result="glowColor" />
        <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
        <feMerge>
          <feMergeNode in="softGlow_colored"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background */}
    <rect width="800" height="220" fill="url(#skyGradient)" />
    
    {/* Background Grid/City Lights Hints */}
    <g opacity="0.1" fill="#fff">
        {Array.from({length: 50}).map((_, i) => (
             <circle key={i} cx={Math.random() * 800} cy={150 + Math.random() * 70} r={Math.random() * 1.5} />
        ))}
    </g>

    {/* The Bird's Nest Structure - Stylized & Abstract */}
    <g stroke="url(#metalGradient)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round">
       {/* Main arches */}
       <path d="M-50,220 Q400,0 850,220" strokeWidth="4" />
       <path d="M0,220 Q400,50 800,220" strokeWidth="3" />
       <path d="M100,220 Q400,80 700,220" strokeWidth="2" />
       
       {/* Random Lattice Work */}
       {Array.from({length: 20}).map((_, i) => (
          <path key={i} d={`M${100 + i * 30},220 L${150 + i * 30},${100 + Math.random() * 50}`} opacity="0.5" />
       ))}
       {Array.from({length: 20}).map((_, i) => (
          <path key={`c-${i}`} d={`M${100 + i * 30},${120 + Math.random() * 50} L${200 + i * 30},220`} opacity="0.5" />
       ))}
    </g>

    {/* Elegant Typography Overlay - UNIFIED FONTS (Sans-Serif) */}
    <g transform="translate(400, 110)" textAnchor="middle">
        {/* Main Title - Clean, Bold, Modern Sans-Serif */}
        <text y="-15" fill="#ffffff" fontSize="24" fontFamily="'Inter', sans-serif" fontWeight="800" letterSpacing="0.1em" filter="url(#softGlow)">
           OFFICIAL PARTNER
        </text>
        
        {/* Divider Line */}
        <line x1="-60" y1="5" x2="60" y2="5" stroke="#ef4444" strokeWidth="3" />
        
        {/* Subtitle - Elegant Sans-Serif */}
        <text y="35" fill="#e2e8f0" fontSize="16" fontFamily="'Inter', sans-serif" fontWeight="400" letterSpacing="0.05em">
           NATIONAL STADIUM · THE BIRD'S NEST
        </text>
        
        {/* Tagline - Small, spaced out, uppercase */}
        <text y="60" fill="#94a3b8" fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="600" letterSpacing="0.2em">
           SANBEN LIGHTING STRATEGIC ALLIANCE
        </text>
    </g>
    
    {/* Subtle Red Brand Accent */}
    <rect width="6" height="220" fill="#b91c1c" x="0" />
  </svg>
);


// --- TECHNICAL DRAWING SVGS (Section 2.4) ---

const TrackLightSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
        <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>
        {/* Track Driver Box */}
        <rect x="50" y="40" width="200" height="49" fill="#f3f4f6" stroke="#4b5563" strokeWidth="1.5" />
        <line x1="50" y1="40" x2="250" y2="40" stroke="none" /> 
        <line x1="50" y1="25" x2="250" y2="25" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x="150" y="20" fontSize="12" fill="#ef4444" textAnchor="middle">200mm</text>
        <line x1="265" y1="40" x2="265" y2="89" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x="270" y="70" fontSize="12" fill="#ef4444" alignmentBaseline="middle">49mm</text>
        <rect x="135" y="89" width="30" height="20" fill="#e5e7eb" stroke="#4b5563" strokeWidth="1.5" />
        <g transform="translate(150, 110) rotate(-30)">
            <path d="M-47,0 L47,0 L47,150 L-47,150 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
            <path d="M-47,0 L0,40 L47,0" fill="none" stroke="#374151" strokeWidth="1" opacity="0.5"/>
            <path d="M-47,40 L0,80 L47,40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.5"/>
            <path d="M-47,80 L0,120 L47,80" fill="none" stroke="#374151" strokeWidth="1" opacity="0.5"/>
            <path d="M-47,120 L0,150 L47,120" fill="none" stroke="#374151" strokeWidth="1" opacity="0.5"/>
            <line x1="0" y1="0" x2="0" y2="150" stroke="#374151" strokeWidth="1" opacity="0.3" />
            <ellipse cx="0" cy="150" rx="47" ry="10" fill="#fff" stroke="#000" strokeWidth="1.5" />
            <ellipse cx="0" cy="150" rx="35" ry="7" fill="#e5e7eb" opacity="0.3" />
            <line x1="-60" y1="0" x2="-60" y2="150" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="-65" y="75" fontSize="12" fill="#ef4444" textAnchor="end" transform="rotate(90, -65, 75)">150mm</text>
            <line x1="-47" y1="175" x2="47" y2="175" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <line x1="-47" y1="150" x2="-47" y2="170" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="47" y1="150" x2="47" y2="170" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="0" y="190" fontSize="12" fill="#ef4444" textAnchor="middle">Ø 94mm</text>
        </g>
    </svg>
);

const RecessedLightSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>
        
        {/* Main Body Side View */}
        <g transform="translate(75, 50)">
             {/* Heatsink Fins (Stylized) */}
             <path d="M20,0 L130,0 L140,80 L10,80 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
             <line x1="30" y1="0" x2="20" y2="80" stroke="#000" strokeWidth="1" opacity="0.1" />
             <line x1="50" y1="0" x2="40" y2="80" stroke="#000" strokeWidth="1" opacity="0.1" />
             <line x1="75" y1="0" x2="75" y2="80" stroke="#000" strokeWidth="1" opacity="0.1" />
             <line x1="100" y1="0" x2="110" y2="80" stroke="#000" strokeWidth="1" opacity="0.1" />
             <line x1="120" y1="0" x2="130" y2="80" stroke="#000" strokeWidth="1" opacity="0.1" />

             {/* Bezel Ring */}
             <path d="M0,80 L150,80 L150,90 L0,90 Z" fill="#e5e7eb" stroke="#000" strokeWidth="1" />
             
             {/* Inner Gimbal (Tilted) */}
             <path d="M10,90 L140,90 L130,110 L20,110 Z" fill="#fff" stroke="#9ca3af" strokeWidth="1" />
             <ellipse cx="75" cy="110" rx="55" ry="10" fill="#bfdbfe" opacity="0.5" />

             {/* Spring Clips (Schematic) */}
             <path d="M0,85 L-20,70 L-20,100" fill="none" stroke="#22c55e" strokeWidth="3" />
             <path d="M150,85 L170,70 L170,100" fill="none" stroke="#22c55e" strokeWidth="3" />
             
             {/* Dimensions */}
             {/* Height 110mm */}
             <line x1="160" y1="0" x2="160" y2="110" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <text x="165" y="55" fontSize="12" fill="#ef4444" alignmentBaseline="middle">110mm</text>

             {/* Diameter 138mm */}
             <line x1="0" y1="125" x2="150" y2="125" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <line x1="0" y1="90" x2="0" y2="120" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <line x1="150" y1="90" x2="150" y2="120" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <text x="75" y="140" fontSize="12" fill="#ef4444" textAnchor="middle">Ø 138mm</text>
        </g>

        {/* Top View / Cutout */}
        <g transform="translate(190, 240)">
             {/* Cutout Circle */}
             <circle cx="0" cy="0" r="40" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="4 4" />
             <text x="0" y="5" fontSize="14" fill="#333" textAnchor="middle">Ø 125mm</text>
             <text x="0" y="55" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Cutout Size</text>
             
             {/* Arrows indicating rotation */}
             <path d="M-50,0 A50,50 0 0 1 50,0" fill="none" stroke="#9ca3af" strokeWidth="1" markerEnd="url(#arrow)" />
             <text x="0" y="-55" fontSize="10" fill="#9ca3af" textAnchor="middle">355° Rotation</text>

             {/* Tilt icon */}
             <g transform="translate(-100, 0)">
                 <path d="M0,0 L20,-20" stroke="#9ca3af" strokeWidth="1" markerEnd="url(#arrow)"/>
                 <arc />
                 <text x="10" y="10" fontSize="10" fill="#9ca3af">30° Tilt</text>
             </g>
        </g>
    </svg>
);

const WMDownlightSVG = () => (
  <svg viewBox="0 0 300 350" className="w-full h-full">
       <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
          </marker>
      </defs>
      
      {/* 
          Based on 2.3 Drawing in PDF 
          Shape: P-style profile. 
          Tall vertical fins on top, wider bezel at bottom.
          a (diameter) = 225
          b (height) = 100
      */}
      <g transform="translate(50, 80)">
           {/* Vertical Fins / Heatsink Block */}
           {/* Main block 100mm wide, 80mm tall approx */}
           <rect x="50" y="0" width="100" height="70" fill="#fff" stroke="#000" strokeWidth="1" rx="2" />
           
           {/* Fin Detail Lines - Vertical */}
           {[60, 70, 80, 90, 100, 110, 120, 130, 140].map(x => (
              <line key={x} x1={x} y1="2" x2={x} y2="68" stroke="#000" strokeWidth="1" />
           ))}

           {/* Cone / Bezel transition */}
           <path d="M20,70 L180,70 L200,90 L0,90 L20,70 Z" fill="#e5e7eb" stroke="#000" strokeWidth="1.5" />
           
           {/* Spring Clips */}
           <path d="M20,75 L-10,50 L-10,90" fill="none" stroke="#f59e0b" strokeWidth="2" />
           <path d="M180,75 L210,50 L210,90" fill="none" stroke="#f59e0b" strokeWidth="2" />

           {/* Dimensions */}
           {/* Height b=100mm */}
           <line x1="220" y1="0" x2="220" y2="90" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
           <text x="225" y="45" fontSize="12" fill="#ef4444" alignmentBaseline="middle">100mm</text>

           {/* Diameter a=225mm */}
           <line x1="0" y1="110" x2="200" y2="110" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
           <line x1="0" y1="90" x2="0" y2="105" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
           <line x1="200" y1="90" x2="200" y2="105" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
           <text x="100" y="125" fontSize="12" fill="#ef4444" textAnchor="middle">Ø 225mm</text>
      </g>

      {/* Cutout View Label */}
      <g transform="translate(150, 250)">
          <text x="0" y="0" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">Cutout Dimension</text>
          <text x="0" y="25" fontSize="18" fill="#ef4444" textAnchor="middle" fontFamily="monospace">Ø 205mm</text>
      </g>
  </svg>
);

const PanelLightSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>

        {/* Back View (showing grid/structure) */}
        <g transform="translate(50, 40)">
            {/* Main Frame */}
            <rect x="0" y="0" width="200" height="200" fill="#fff" stroke="#64748b" strokeWidth="2" />
            
            {/* Grid Pattern on Backplate (as seen in PDF) */}
            <g opacity="0.2" stroke="#64748b" strokeWidth="1">
                {[40, 80, 120, 160].map(p => (
                   <React.Fragment key={p}>
                     <line x1={p} y1="10" x2={p} y2="190" />
                     <line x1="10" y1={p} x2="190" y2={p} />
                   </React.Fragment>
                ))}
            </g>

            {/* Inner structural squares (emboss effect) */}
            <g fill="none" stroke="#cbd5e1" strokeWidth="1">
                {[20, 60, 100, 140, 180].map(xy => (
                     <rect key={xy} x={xy-15} y={xy-15} width="30" height="30" rx="2" opacity="0.5"/>
                ))}
            </g>
            
            {/* Dimension Lines - Width/Length */}
            <line x1="-20" y1="0" x2="-20" y2="200" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="-25" y="100" fontSize="12" fill="#ef4444" textAnchor="end" transform="rotate(-90, -25, 100)">595mm</text>
            
            <line x1="0" y1="-20" x2="200" y2="-20" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="100" y="-25" fontSize="12" fill="#ef4444" textAnchor="middle">595mm</text>
        </g>

        {/* Side Profile View */}
        <g transform="translate(50, 280)">
             {/* The thin profile */}
             <rect x="0" y="0" width="200" height="15" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
             {/* Diffuser layer */}
             <rect x="5" y="15" width="190" height="3" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />
             
             {/* Height Dimension */}
             <line x1="215" y1="0" x2="215" y2="18" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <text x="225" y="12" fontSize="12" fill="#ef4444" alignmentBaseline="middle">26mm</text>
             
             <text x="100" y="45" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">Side Profile</text>
        </g>
    </svg>
);

const TrackRailSVG = () => (
  <svg viewBox="0 0 300 400" className="w-full h-full">
     <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
        </marker>
     </defs>

     {/* 
        Redrawn based on 60x34mm high-profile track rail specification.
        Scale: 3.5x for better visibility in the container.
     */}
     
     <g transform="translate(90, 40) scale(3.5)">
        {/* Main Aluminum Body - Outline */}
        <path d="
          M0,0 L34,0 L34,60 L24.4,60 L24.4,43 L9.6,43 L9.6,60 L0,60 Z
          M2,2 L32,2 L32,41 L2,41 Z
        " fill="none" stroke="#333" strokeWidth="0.5" />
        
        {/* Top Internal Flanges (for suspension/accessories) */}
        <path d="M2,8 L6,8 L6,12 M32,8 L28,8 L28,12" fill="none" stroke="#333" strokeWidth="0.5" />
        
        {/* Internal Divider (separating top chamber from busbars) */}
        <line x1="2" y1="36" x2="32" y2="36" stroke="#333" strokeWidth="0.5" />
        
        {/* Bottom Copper Tracks & Insulation housing */}
        {/* Left Side Insulation */}
        <path d="M3,43 L8.5,43 L8.5,57 L3,57 Z" fill="none" stroke="#333" strokeWidth="0.3" />
        <rect x="4" y="45" width="1.2" height="4" fill="#d97706" /> {/* Copper Line 1 */}
        <rect x="4" y="52" width="1.2" height="4" fill="#d97706" /> {/* Copper Line 2 */}
        
        {/* Right Side Insulation */}
        <path d="M25.5,43 L31,43 L31,57 L25.5,57 Z" fill="none" stroke="#333" strokeWidth="0.3" />
        <rect x="29" y="45" width="1.2" height="4" fill="#d97706" /> {/* Copper Line 3 */}
        <rect x="29" y="52" width="1.2" height="4" fill="#d97706" /> {/* Neutral/Ground optional 4th pos */}

        {/* DIMENSIONS */}
        
        {/* Total Height: 60mm */}
        <line x1="40" y1="0" x2="40" y2="60" stroke="#ef4444" strokeWidth="0.3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="45" y="30" fontSize="4" fill="#ef4444" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>60 mm</text>
        
        {/* Bottom Section Height: 17mm */}
        <line x1="-6" y1="43" x2="-6" y2="60" stroke="#ef4444" strokeWidth="0.3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="-10" y="51.5" fontSize="4" fill="#ef4444" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>17 mm</text>
        
        {/* Total Width: 34mm */}
        <line x1="0" y1="68" x2="34" y2="68" stroke="#ef4444" strokeWidth="0.3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1="0" y1="62" x2="0" y2="70" stroke="#ef4444" strokeWidth="0.1" />
        <line x1="34" y1="62" x2="34" y2="70" stroke="#ef4444" strokeWidth="0.1" />
        <text x="17" y="73" fontSize="4" fill="#ef4444" textAnchor="middle">34 mm</text>
        
        {/* Opening Width: 14.8mm */}
        <line x1="9.6" y1="64" x2="24.4" y2="64" stroke="#ef4444" strokeWidth="0.3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1="9.6" y1="60" x2="9.6" y2="66" stroke="#ef4444" strokeWidth="0.1" />
        <line x1="24.4" y1="60" x2="24.4" y2="66" stroke="#ef4444" strokeWidth="0.1" />
        <text x="17" y="63" fontSize="3" fill="#ef4444" textAnchor="middle">14.8 mm</text>
     </g>
  </svg>
);

// --- SPEC SHEET COMPONENT ---

const SpecSheet: React.FC<{ product: ProductConfig; customDescription?: string; isBatch?: boolean }> = ({ product, customDescription, isBatch }) => {
  // Helper to render the correct SVG based on product for Technical Drawing
  const getProductTechnicalDrawing = (product: ProductConfig) => {
    if (product.id.includes('ld5')) return <RecessedLightSVG />;
    if (product.id.includes('wm-08')) return <WMDownlightSVG />;
    if (product.id.includes('panel-6060')) return <PanelLightSVG />;
    if (product.id.includes('track-rail')) return <TrackRailSVG />;
    return <TrackLightSVG />;
  };

  return (
    <div className={`w-full max-w-[210mm] bg-white shadow-xl p-[15mm] text-sm leading-relaxed text-slate-700 print:max-w-none print:shadow-none print:p-0 mx-auto ${isBatch ? '' : 'mb-12 print:mb-0'}`}>
      {/* --- PAGE 1: COVER --- */}
      <section className="mb-12 border-b-2 border-brand-900 pb-8 min-h-[285mm] relative flex flex-col">
        <header className="flex justify-between items-start border-b-2 border-gray-100 pb-4 mb-12">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                  {/* Text Logo */}
                  <div className="text-4xl font-black text-brand-600 tracking-tighter italic" style={{fontFamily: 'Arial, sans-serif'}}>SANBEN</div>
                  <div className="text-xs font-bold text-gray-400 self-start mt-1">®</div>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">China Leading Retail Lighting Brand</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Focusing on Commercial Lighting for 20 Years</div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>Doc: {product.model}-SPEC</div>
              <div>Rev: {product.docRev}</div>
            </div>
        </header>

        <div className="flex-grow">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight leading-tight">
            {product.name}<br/>
          </h1>
            <div className="text-2xl text-gray-500 font-sans font-normal mb-6">{product.series}</div>
          
          <div className="my-12 max-w-3xl mx-auto">
              
                  <div className="space-y-6 mb-12 border-b border-gray-100 pb-8">
                      <div className="grid grid-cols-2 gap-8">
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Model</div>
                            <div className="font-semibold text-2xl text-slate-800">{product.model}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Application</div>
                            <div className="font-semibold text-xl text-slate-800">{product.appType}</div>
                          </div>
                      </div>
                      <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Spec</div>
                          <div className="font-semibold text-lg text-slate-800">
                              {product.electrical.ratedPower} 
                              {product.optical && ` | CRI90+`}
                          </div>
                      </div>
                  </div>
                  
                  <div className="mb-12">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Product Description</div>
                      <div className="text-base text-gray-600 leading-relaxed italic border-l-4 border-brand-600 pl-6 py-2">
                          {customDescription || product.defaultDescription}
                      </div>
                  </div>
                  
                  {/* Brand Heritage Section with new Visual */}
                  <div className="mt-12">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand Heritage</div>
                      <div className="h-48 w-full overflow-hidden rounded-lg border border-gray-200 shadow-md">
                          <BirdsNestHero />
                      </div>
                  </div>

          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-8 text-xs text-gray-500">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Sanben Lighting</span>
                  No.1588, Jiamei Road,<br/>
                  Nanxiang Lantian Industrial Park,<br/>
                  Jiading District, Shanghai
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Contact</span>
                  M: +86-13801754875<br/>
                  WA: +1-949-996-0001<br/>
                  E: patrick@sanbenlighting.com
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700 block mb-1">Approvals</span>
                  Prepared / Reviewed / Approved
                </div>
          </div>
        </div>
      </section>

      <div className="page-break"></div>

      {/* --- PAGE 2: TECH PARAMETERS --- */}
      <section className="mb-12 min-h-[285mm]">
        <div className="flex items-center gap-4 mb-8 border-b-2 border-brand-100 pb-2">
          <div className="h-8 w-1 bg-brand-600"></div>
          <h2 className="text-xl font-bold text-slate-900">1. Technical Specifications</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-12">
            <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
                  {product.optical ? '1.1 Electrical Data' : '1.1 System Parameters'}
                </h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-500">{product.optical ? 'Input Voltage' : 'Rated Voltage'}</td>
                      <td className="py-2 font-mono text-right">{product.electrical.inputVoltage}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-500">{product.optical ? 'Input Current' : 'Max Current'}</td>
                      <td className="py-2 font-mono text-right">{product.electrical.inputCurrent}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-500">{product.optical ? 'Rated Power' : 'Max Load'}</td>
                      <td className="py-2 font-mono text-right">{product.electrical.ratedPower}</td>
                    </tr>
                    {product.electrical.powerFactor !== 'N/A' && (
                      <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-500">Power Factor</td>
                          <td className="py-2 font-mono text-right">{product.electrical.powerFactor}</td>
                      </tr>
                    )}
                    {product.electrical.thd !== 'N/A' && (
                      <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-500">THD</td>
                          <td className="py-2 font-mono text-right">{product.electrical.thd}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2 text-gray-500">Driver Class</td>
                      <td className="py-2 font-mono text-right">{product.electrical.driverClass}</td>
                    </tr>
                  </tbody>
                </table>
            </div>

            <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
                    {product.optical ? '1.2 Mechanical Data' : '1.2 Physical Specifications'}
                </h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Housing Material</td><td className="py-2 text-right">{product.mechanical.material}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Finish</td><td className="py-2 text-right">{product.mechanical.finish}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">{product.optical ? 'Optic Material' : 'Insulation Material'}</td><td className="py-2 text-right">{product.mechanical.optic}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Adjustability</td><td className="py-2 text-right">{product.mechanical.adjustability}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Ingress Protection</td><td className="py-2 text-right">{product.mechanical.ip}</td></tr>
                    {product.mechanical.cutout && <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Cutout Size</td><td className="py-2 text-right font-bold text-red-500">{product.mechanical.cutout}</td></tr>}
                    <tr><td className="py-2 text-gray-500">Net Weight</td><td className="py-2 text-right">{product.mechanical.weight}</td></tr>
                  </tbody>
                </table>
            </div>
        </div>

        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
            {product.optical ? '1.3 Optical Performance' : '1.3 Installation & Packing'}
        </h3>
        
        {product.optical && product.opticalGraph ? (
          <>
              <div className="overflow-hidden rounded border border-gray-200 mb-8">
                  <table className="w-full text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-semibold">
                      <tr>
                          <th className="p-3 text-left">CCT</th>
                          <th className="p-3 text-right">Luminous Flux</th>
                          <th className="p-3 text-right">System Efficacy</th>
                          <th className="p-3 text-center">CRI</th>
                          <th className="p-3 text-center">SDCM</th>
                          <th className="p-3 text-center">Beam Angles</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                      {product.optical.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium">{row.cct}</td>
                          <td className="p-3 text-right font-mono">{row.lumen} lm</td>
                          <td className="p-3 text-right font-mono">{row.efficacy} lm/W</td>
                          <td className="p-3 text-center">{row.cri}</td>
                          <td className="p-3 text-center">{row.sdcm}</td>
                          <td className="p-3 text-center text-gray-500">{row.angle}</td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>

              <div className="grid grid-cols-2 gap-8 items-start mb-8">
                  <div className="bg-white rounded p-4 border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Luminous Intensity Distribution ({product.opticalGraph.beamAngle})</h4>
                      <PolarChart data={product.opticalGraph.polarData} beamAngle={product.opticalGraph.beamAngle} />
                  </div>
                  <div className="bg-white rounded p-4 border border-gray-200 h-full flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Cone Illuminance Diagram</h4>
                      <div className="space-y-4 px-4">
                          {product.opticalGraph.coneData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-xs">
                                  <div className="w-12 text-right font-bold">{item.distance}</div>
                                  <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                                      <div className="h-full bg-brand-400" style={{ width: item.barWidth }}></div>
                                  </div>
                                  <div className="w-20 font-mono text-right">{item.lux}</div>
                                  <div className="w-16 text-gray-400 text-right">{item.diameter}</div>
                              </div>
                          ))}
                      </div>
                      <div className="mt-6 text-center text-xs text-gray-400">
                          Average Beam Angle (50%): {product.opticalGraph.beamAngle}
                      </div>
                  </div>
              </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded border border-gray-200 text-xs text-gray-600">
                  <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wide">Installation Instructions</h4>
                  <p className="leading-relaxed mb-4">
                      {product.installation || "Standard installation applies. Please refer to local regulations."}
                  </p>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                      <strong className="block mb-1">Safety Alert:</strong>
                      <ul className="list-disc pl-4 space-y-1">
                            <li>Disconnect power before installation or maintenance.</li>
                            <li>Ensure all connections are tight and secure.</li>
                            <li>Do not touch live parts or conductive tracks when powered.</li>
                            <li>Indoor use only. Avoid corrosive environments.</li>
                      </ul>
                  </div>
              </div>
              
              {product.packing && (
                    <div className="bg-white p-6 rounded border border-gray-200 text-xs">
                      <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wide">Packing Configuration</h4>
                      <ul className="space-y-3">
                            {product.packing.map((line, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                    <span>{line}</span>
                                </li>
                            ))}
                      </ul>
                      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded text-yellow-800">
                            <strong>Note:</strong> Packing materials are recyclable. Please dispose of responsibly.
                      </div>
                    </div>
              )}
          </div>
        )}
      </section>

        <div className="page-break"></div>

      {/* --- PAGE 3: ADDITIONAL INFO --- */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-8 border-b-2 border-brand-100 pb-2">
          <div className="h-8 w-1 bg-brand-600"></div>
          <h2 className="text-xl font-bold text-slate-900">2. Reliability & Safety</h2>
        </div>

        <div className="mb-10">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">2.1 Testing Parameters</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Dielectric Strength</div>
                    <div className="font-bold text-slate-800">1.5kV AC</div>
                    <div className="text-[10px] text-gray-400 mt-1">&lt;3.5mA leakage, 60s</div>
                </div>
                <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Surge Immunity</div>
                    <div className="font-bold text-slate-800">1kV (L-N)</div>
                    <div className="text-[10px] text-gray-400 mt-1">2kV (L/N-PE)</div>
                </div>
                <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Lifetime (L70B50)</div>
                    <div className="font-bold text-slate-800">50,000 hrs</div>
                    <div className="text-[10px] text-gray-400 mt-1">@ Ta=25°C</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">2.2 Operating Conditions</h3>
                <ul className="text-xs space-y-3">
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Operating Temperature</span>
                      <span className="font-medium">-20°C to +45°C</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Storage Temperature</span>
                      <span className="font-medium">-40°C to +80°C</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Humidity</span>
                      <span className="font-medium">10% - 90% RH</span>
                  </li>
                </ul>
          </div>
          <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">2.3 Standards Compliance</h3>
                <div className="flex flex-wrap gap-2">
                  {product.standards.map((std, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-xs font-semibold text-gray-600 rounded">{std}</span>
                  ))}
                </div>
          </div>
        </div>

          <div className="mb-12">
              <ModelBreakdown parts={product.naming} />
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">2.4 Dimensional Drawing</h3>
            <div className="flex justify-center items-center border border-gray-200 rounded p-8 bg-white">
              <div className="relative w-96 h-80">
                  {getProductTechnicalDrawing(product)}
              </div>
            </div>
          </div>

      </section>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeProduct, setActiveProduct] = useState<ProductConfig | null>(null);
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleProductSelect = (product: ProductConfig) => {
      setActiveProduct(product);
      setDescription(""); // Reset description
      setIsBatchMode(false);
  };

  const handleBack = () => {
      setActiveProduct(null);
      setIsBatchMode(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateDescription = async () => {
    if (!activeProduct) return;
    if (!process.env.API_KEY) {
      alert("API Key not found. Please set process.env.API_KEY.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model: model,
        contents: activeProduct.descriptionPrompt,
      });

      if (response.text) {
        setDescription(response.text);
      }
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate description. Please check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- BATCH MODE VIEW ---
  if (isBatchMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 font-sans">
         <div className="fixed bottom-8 right-8 no-print z-50 flex gap-4">
            <button 
              onClick={handleBack}
              className="bg-gray-600 hover:bg-gray-500 text-white shadow-lg font-semibold py-3 px-6 rounded-full transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              Back to Dashboard
            </button>
            <button 
              onClick={handlePrint}
              className="bg-brand-600 hover:bg-brand-500 text-white shadow-lg font-semibold py-3 px-6 rounded-full transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print All (5 Docs)
            </button>
         </div>

         <div className="flex flex-col items-center">
            {PRODUCTS.map((product, index) => (
              <React.Fragment key={product.id}>
                <SpecSheet product={product} isBatch={true} />
                {/* Print Page Break between products */}
                <div className="page-break" />
                {/* Visual spacing for screen view only */}
                <div className="h-12 no-print" /> 
              </React.Fragment>
            ))}
         </div>
      </div>
    )
  }

  // --- SELECTION SCREEN ---
  if (!activeProduct) {
      return (
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 font-sans">
              <div className="max-w-5xl w-full">
                  <header className="mb-12 text-center relative">
                       <h1 className="text-4xl font-black text-brand-600 tracking-tighter italic mb-4" style={{fontFamily: 'Arial, sans-serif'}}>SANBEN<span className="text-lg text-gray-400 not-italic align-top">®</span></h1>
                       <h2 className="text-2xl font-bold text-slate-800">Product Specification Portal</h2>
                       <p className="text-slate-500 mt-2">Select a product to view or print its specification sheet.</p>
                       
                       <button 
                          onClick={() => setIsBatchMode(true)}
                          className="absolute top-0 right-0 bg-white border border-gray-200 text-slate-600 hover:text-brand-600 hover:border-brand-500 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          View All / Batch Print
                       </button>
                  </header>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {PRODUCTS.map(product => (
                          <button 
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className="bg-white p-0 rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-200 hover:border-brand-500 text-left group flex flex-col h-full overflow-hidden"
                          >
                              {/* Top Banner / Series */}
                              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center w-full">
                                 <div className="font-bold text-xs uppercase tracking-widest text-brand-600 truncate max-w-[150px]">
                                     {product.series}
                                 </div>
                                 <div className="text-gray-300 group-hover:text-brand-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                                 </div>
                              </div>

                              {/* Main Content */}
                              <div className="p-8 flex flex-col flex-grow w-full">
                                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight min-h-[3.5rem] flex items-center">{product.name}</h3>
                                  <div className="font-mono text-sm text-gray-500 mb-6">{product.model}</div>
                                  
                                  <div className="space-y-3 mb-8">
                                     <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Application</span>
                                        <span className="text-sm text-gray-700 block truncate">{product.appType}</span>
                                     </div>
                                  </div>

                                  <div className="mt-auto pt-6 border-t border-gray-100 w-full">
                                     <div className="flex gap-2 flex-wrap">
                                          {product.features.slice(0, 3).map((f, i) => (
                                              <span key={i} className="text-[10px] font-bold uppercase bg-brand-50 text-brand-700 px-2 py-1 rounded whitespace-nowrap">
                                                {f}
                                              </span>
                                          ))}
                                     </div>
                                  </div>
                              </div>
                          </button>
                      ))}
                  </div>
                  
                  <footer className="mt-12 text-center text-xs text-gray-400">
                      © 2024 Sanben Lighting | Internal System
                  </footer>
              </div>
          </div>
      )
  }

  // --- SINGLE SPECIFICATION SHEET VIEW ---
  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-8 font-sans">
      
      {/* Floating Action Bar */}
      <div className="fixed bottom-8 right-8 no-print z-50 flex gap-4">
        <button 
          onClick={handleBack}
          className="bg-gray-600 hover:bg-gray-500 text-white shadow-lg font-semibold py-3 px-6 rounded-full transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          All Products
        </button>

        <button 
          onClick={handleGenerateDescription}
          disabled={isGenerating}
          className={`bg-purple-600 hover:bg-purple-500 text-white shadow-lg font-semibold py-3 px-6 rounded-full transition-all flex items-center gap-2 ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isGenerating ? (
            <>
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enhance
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              AI Enhance
            </>
          )}
        </button>

        <button 
          onClick={handlePrint}
          className="bg-brand-600 hover:bg-brand-500 text-white shadow-lg font-semibold py-3 px-6 rounded-full transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print PDF
        </button>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div ref={printRef}>
        <SpecSheet product={activeProduct} customDescription={description} />
      </div>
      
      <div className="text-xs text-gray-400 no-print pb-8">
        Specification generated via Application. | © 2024 Sanben Lighting
      </div>
    </div>
  );
};

export default App;