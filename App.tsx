import React, { useRef, useState } from 'react';
import { PolarChart } from './components/PolarChart';
import { ModelBreakdown } from './components/ModelBreakdown';
import { ElectricalSpec, OpticalSpecRow, ProductConfig } from './types';
import { GoogleGenAI } from "@google/genai";

// --- DATA DEFINITIONS ---

// Helper for generating polar data
const createPolarData = (type: 'narrow' | 'wide' | 'flood' | 'asymmetric'): { angle: string; A: number }[] => {
  if (type === 'narrow') { // ~24 deg
    return [
      { angle: '0', A: 100 }, { angle: '10', A: 80 }, { angle: '20', A: 10 }, { angle: '30', A: 2 }, 
      { angle: '60', A: 0 }, { angle: '90', A: 0 }, { angle: '180', A: 0 }, 
      { angle: '270', A: 0 }, { angle: '330', A: 2 }, { angle: '340', A: 10 }, { angle: '350', A: 80 },
    ];
  } else if (type === 'wide') { // ~60-80 deg
    return [
      { angle: '0', A: 100 }, { angle: '30', A: 80 }, { angle: '40', A: 50 }, { angle: '60', A: 10 }, 
      { angle: '90', A: 0 }, { angle: '180', A: 0 }, 
      { angle: '300', A: 10 }, { angle: '320', A: 50 }, { angle: '330', A: 80 },
    ];
  } else if (type === 'asymmetric') { // ~66x24 deg (Showcasing the wide axis)
    return [
      { angle: '0', A: 100 }, { angle: '20', A: 90 }, { angle: '33', A: 50 }, { angle: '45', A: 10 }, 
      { angle: '90', A: 0 }, { angle: '180', A: 0 }, 
      { angle: '315', A: 10 }, { angle: '327', A: 50 }, { angle: '340', A: 90 },
    ];
  } else { // Flood ~105-120 deg
    return [
      { angle: '0', A: 100 }, { angle: '45', A: 85 }, { angle: '60', A: 65 }, { angle: '90', A: 15 },
      { angle: '120', A: 0 }, { angle: '180', A: 0 }, { angle: '240', A: 0 }, 
      { angle: '270', A: 15 }, { angle: '300', A: 65 }, { angle: '315', A: 85 },
    ];
  }
};

const PRODUCT_F_TYPE: ProductConfig = {
  id: 'track-f-04',
  name: 'F-Type Track Spotlight Series',
  model: 'SR-LSP-36F 04',
  series: 'Track Spotlight Series',
  appType: 'Commercial / Retail / Gallery (商业/零售/画廊)',
  docRev: 'B01',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional, sophisticated product description (approx 100 words) for the "F-Type Track Spotlight Series" from Sanben Lighting.
    Key Features: 36W LED Track Light, High Efficacy (>100lm/W), CRI 90+, Flicker-free driver.
    Specs: 36W, 110-240V, PF>0.9.
    Tone: Technical, architectural.
  `,
  defaultDescription: "The SR-LSP-36F 04 is a high-performance LED track spotlight designed for professional commercial lighting applications. It features a high-efficiency COB light source with a CRI of ≥90, ensuring accurate color rendering. Powered by a flicker-free, isolated constant current driver, it delivers stable illumination with a system efficacy of up to 115 lm/W. The die-cast aluminum housing provides excellent thermal management for a long service life.\n\nSR-LSP-36F 04 是一款专为专业商业照明设计的高性能LED导轨射灯。采用高光效COB光源（CRI≥90），确保精准的色彩还原。搭载无频闪隔离恒流驱动，提供稳定的照明输出，系统光效高达115 lm/W。压铸铝外壳提供卓越的散热性能，确保超长使用寿命。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '36W',
    powerFactor: '> 0.90',
    thd: '≤ 20%',
    driverClass: 'Isolated, Flicker-Free / 隔离无频闪'
  },
  mechanical: {
    material: 'Die-cast Aluminum / 压铸铝',
    finish: 'Powder Coat (Black/White) / 粉末喷涂',
    optic: 'Reflector / Lens / 反光杯/透镜',
    adjustability: '350° Pan / 90° Tilt',
    ip: 'IP20',
    weight: 'N/A'
  },
  optical: [
    { cct: '2700K', lumen: '3780', efficacy: '105', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '3000K', lumen: '3960', efficacy: '110', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '3500K', lumen: '4068', efficacy: '113', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '4000K', lumen: '4140', efficacy: '115', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
    { cct: '5000K', lumen: '4140', efficacy: '115', sdcm: '3-Step', cri: 'Ra ≥ 90', angle: '15° / 24° / 36°' },
  ],
  opticalGraph: {
    beamAngle: '24.88°',
    polarData: createPolarData('narrow'),
    coneData: [
      { distance: '1m', lux: '14,528 lx', diameter: 'Ø 0.44m', barWidth: '100%' },
      { distance: '2m', lux: '3,632 lx', diameter: 'Ø 0.88m', barWidth: '25%' },
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
  series: 'Recessed Downlight Series',
  appType: 'Office / Commercial / Retail / Hotel (办公/商业/零售/酒店)',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "SR-LD5 Series Embedded Spotlight" from Sanben Lighting.
    Key Features: High-power 36W recessed downlight, adjustable (355 degree rotation, 30 degree tilt), die-cast aluminum heatsink, high CRI >90.
    Specs: Cutout 125mm, 36W, 3-step SDCM.
    Tone: Technical, reliable, versatile.
  `,
  defaultDescription: "The SR-LD5 Series is a high-performance LED recessed spotlight designed for flexible commercial lighting. Featuring a robust die-cast aluminum heatsink and a precision optical system, it offers 355° horizontal rotation and 30° vertical tilt for targeted illumination. With a CRI of over 90 and high luminous efficacy, it ensures vibrant and accurate color rendering for merchandise and architectural details.\n\nSR-LD5系列是一款专为灵活商业照明设计的高性能LED嵌入式射灯。具备坚固的压铸铝散热器和精密光学系统，支持355°水平旋转和30°垂直调节。CRI超过90且光效极高，确保商品和建筑细节的色彩生动还原。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '36W',
    powerFactor: '> 0.90',
    thd: '≤ 20%',
    driverClass: 'Class II, Isolated / 隔离'
  },
  mechanical: {
    material: 'Die-cast Aluminum / 压铸铝',
    finish: 'Powder Coat (White/Black) / 粉末喷涂',
    optic: 'Reflector + Lens / 反光杯+透镜',
    adjustability: '355° Pan / 30° Tilt',
    ip: 'IP20',
    weight: 'N/A',
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
    beamAngle: '23.72°',
    polarData: createPolarData('narrow'),
    coneData: [
      { distance: '1m', lux: '11,164 lx', diameter: 'Ø 0.42m', barWidth: '100%' },
      { distance: '2m', lux: '2,791 lx', diameter: 'Ø 0.84m', barWidth: '25%' },
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
  name: 'WM Anti-glare Recessed Ceiling Light',
  model: 'SR-LD8-50B01',
  series: 'Recessed Ceiling Light Series',
  appType: 'Office / Commercial / Retail / Hotel (办公/商业/零售/酒店)',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "WM Series Anti-glare Die-cast Aluminum Downlight" (Model SR-LD8-50B01) from Sanben Lighting.
    Key Features: 8-inch large aperture, High Power 50W, Die-cast aluminum heatsink for superior thermal management, Low Glare (UGR<22).
    Specs: 4350-4850lm, CRI > 80, Cutout 205mm.
    Tone: Industrial, robust, high-performance.
  `,
  defaultDescription: "The WM Series SR-LD8 is a high-power 8-inch embedded downlight engineered for expansive commercial environments. Constructed with a heavy-duty die-cast aluminum heat sink, it ensures optimal thermal dissipation for its 50W output. The deep anti-glare optical design achieves a UGR of less than 22, providing visual comfort alongside powerful illumination suitable for high-ceiling applications like airports and shopping malls.\n\nWM系列 SR-LD8 是一款专为大型商业环境设计的高功率8英寸嵌入式筒灯。采用重型压铸铝散热器，确保50W输出的最佳散热。深度防眩光光学设计（UGR<22）在提供强劲照明的同时保证视觉舒适，适用于机场和商场等高天花板应用。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '50W ±10%',
    powerFactor: '0.95',
    thd: '≤ 15%',
    driverClass: 'SELV Isolated / 隔离恒流'
  },
  mechanical: {
    material: 'Die-cast Aluminum / 压铸铝',
    finish: 'Powder Coat (White) / 粉末喷涂(白)',
    optic: 'Anti-glare Reflector / 防眩反光杯',
    adjustability: 'Fixed / 固定',
    ip: 'IP20',
    weight: 'N/A',
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
  name: 'Recessed LED Panel Light',
  model: 'SR-LPL-6060',
  series: 'Recessed LED Panel Light Series',
  appType: 'Office / Commercial / Retail / School / Hospital (办公/商业/零售/学校/医院)',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "SR-LPL Series LED Panel Light" (Model 6060-36W) from Sanben Lighting.
    Key Features: Back-lit technology, High Efficacy 120lm/W, LIFUD Brand Driver, Flicker-free (Percentage <3%), UGR<22.
    Specs: 36W, 4320lm, 595x595mm size, IP40.
    Tone: Professional, efficient, commercial.
  `,
  defaultDescription: "The SR-LPL Series is a high-efficiency back-lit LED panel designed for modern office and educational environments. Utilizing premium Sanan SMD2835 chips and a high-quality LIFUD driver, it delivers an impressive 120lm/W efficacy with a flicker-free output (<3%). The robust iron backplate and aluminum frame construction ensure effective thermal management, while the PS diffuser provides uniform, glare-reduced illumination (UGR<22).\n\nSR-LPL系列是专为现代办公和教育环境设计的高效直下式LED面板灯。采用优质三安SMD2835芯片和高品质LIFUD驱动，光效高达120lm/W且无频闪（<3%）。坚固的铁背板和铝框结构确保有效散热，PS扩散板提供均匀、低眩光（UGR<22）的照明。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '36W ±5%',
    powerFactor: '> 0.9',
    thd: '≤ 15%',
    driverClass: 'LIFUD / Flicker-Free / 无频闪'
  },
  mechanical: {
    material: 'Aluminum Frame + Iron Backplate / 铝框+铁底板',
    finish: 'Powder Coat (White) / 粉末喷涂(白)',
    optic: 'PS Diffuser + PMMA Lens / PS扩散+PMMA透镜',
    adjustability: 'None / 无',
    ip: 'IP40',
    weight: '2.0 kg',
    cutout: 'N/A (T-Grid/Surface)'
  },
  optical: [
    { cct: '5000K', lumen: '4320', efficacy: '120', sdcm: '-', cri: 'Ra > 80', angle: '113°' },
  ],
  opticalGraph: {
    beamAngle: '112.92°',
    polarData: createPolarData('flood'),
    coneData: [
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
  name: '3-Line Power Track',
  model: 'SR-TRK-3L-1M',
  series: '3-Line Track Accessories',
  appType: 'Retail / Commercial Track Systems (商业导轨系统)',
  docRev: 'A/2',
  imageUrl: '',
  descriptionPrompt: `
    Write a technical product description for the "3-Line Power Track Rail" from Sanben Lighting.
    Key Features: High-quality aluminum alloy extrusion, Copper conductors (3.8mm flat wire), PVC insulation, Fire retardant ABS (V1) connectors.
    Specs: AC100-240V, 15A/10A, 1 Meter standard length.
    Tone: Industrial, technical, safety-focused.
  `,
  defaultDescription: "The Three Line 01 Style is a robust 3-line power track system designed for versatile commercial lighting installations. Constructed from premium aluminum alloy with a flame-retardant PVC insulation strip, it features high-conductivity copper busbars (3.8mm x 0.8mm) to ensure stable power transmission. The system supports a maximum load current of 15A (100V) or 10A (220V) and is compatible with a wide range of track adapters.\n\n三线01款是一款坚固的3线电源导轨系统，专为多功能商业照明安装设计。由优质铝合金和阻燃PVC绝缘条制成，配有高导电铜汇流排（3.8mm x 0.8mm）以确保稳定的电力传输。支持最大负载电流15A（100V）或10A（220V），兼容多种导轨适配器。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: '15A (100V) / 10A (220V)',
    ratedPower: 'N/A',
    powerFactor: 'N/A',
    thd: 'N/A',
    driverClass: 'Passive Conductor'
  },
  mechanical: {
    material: 'Aluminum Alloy + Copper + PVC / 铝合金+铜+PVC',
    finish: 'Powder Coat (Black/White) / 粉末喷涂',
    optic: 'PVC Insulation / PVC绝缘',
    adjustability: 'N/A',
    ip: 'IP20',
    weight: 'N/A',
    cutout: 'Surface / Pendant'
  },
  optical: undefined,
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

const PRODUCT_TRACK_CONNECTORS: ProductConfig = {
  id: 'track-connectors-01',
  name: '3-Line Power Track Connectors',
  model: 'SR-TRK-CON Series',
  series: '3-Line Track Accessories',
  appType: 'Retail / Commercial Track Systems (商业导轨系统)',
  docRev: 'A/1',
  imageUrl: '',
  descriptionPrompt: `
    Write a technical product description for the "3-Wire Track Connectors" (Feed, L-Connector, T-Connector, X-Connector, I-Joiner) from Sanben Lighting.
    Key Features: Live End Feed, L/T/X Shapes, Flame Retardant PC, Copper Contacts, 15A Max.
    Specs: AC110-240V, Black/White finish.
    Tone: Industrial, technical, versatile.
  `,
  defaultDescription: "The SR-TRK-CON Series offers a comprehensive range of power feeds and joiners designed for the 3-circuit track system. This series includes Live End Feeds for power input, along with L-Connectors, T-Connectors, and X-Connectors to enable flexible and complex track layout configurations. Also available are straight I-Joiners and flexible couplers. Constructed from flame-retardant PC material with high-conductivity copper contacts, these accessories ensure safe and reliable power continuity across the entire track network.\n\nSR-TRK-CON系列提供专为3回路导轨系统设计的全套电源接头和连接器。该系列包括用于电源输入的带电端接头，以及L型、T型和X型连接器，以支持灵活复杂的导轨布局配置。还提供直通I型连接器和软连接器。采用阻燃PC材料和高导电铜触点制成，确保整个导轨网络的安全可靠的电力连续性。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 15A',
    ratedPower: 'N/A',
    powerFactor: 'N/A',
    thd: 'N/A',
    driverClass: 'Passive Component'
  },
  mechanical: {
    material: 'Flame Retardant PC + Copper / 阻燃PC+铜',
    finish: 'Black / White / 黑/白',
    optic: 'N/A',
    adjustability: 'Fixed / 固定',
    ip: 'IP20',
    weight: 'N/A',
    cutout: 'Surface / Track Mounted'
  },
  optical: undefined,
  opticalGraph: undefined,
  packing: [
    'Unit Pack: Individual Polybag',
    'Carton Qty: 100 Pcs / Carton (Varies by type)',
    'Compatibility: Fits Standard 3-Wire Tracks'
  ],
  installation: "Push-fit installation into track ends. Secure with locking screws where applicable. Ensure polarity matching (Ground/Neutral/Line) when connecting L/T/X junctions.",
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'TRK', label: 'Product', desc: '(Track)', color: 'text-blue-600' },
    { code: 'CON', label: 'Type', desc: '(Connector)', color: 'text-green-600' },
    { code: 'X', label: 'Shape', desc: '(L/T/X/I)', color: 'text-gray-600' },
  ],
  features: ['Flame Retardant PC', 'Copper Contacts', 'L/T/X/I Shapes'],
  standards: ['EN 60570', 'CE', 'RoHS', 'VDE', 'IP20']
};

const PRODUCT_TRIPROOF: ProductConfig = {
  id: 'triproof-01',
  name: 'IP65 LED Tri-Proof Light',
  model: 'SR-TPL-Series',
  series: 'Tri-Proof Series',
  appType: 'Garage / Industrial / Warehouse / Tunnel (车库/工业/仓库/隧道)',
  docRev: 'C01',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "IP65 LED Tri-proof Light" from Sanben Lighting.
    Key Features: High efficacy >130lm/W, IP65 Waterproof, IK08 Impact Resistance, Philips LEDs, Flicker-free.
    Specs: 30W/50W/80W, 120 degree beam angle, 3 year warranty.
    Tone: Industrial, durable, efficient.
  `,
  defaultDescription: "The SR-TPL Series is a rugged IP65-rated LED Tri-proof light engineered for harsh industrial environments such as garages, warehouses, and tunnels. Utilizing high-efficiency Philips SMD2835 LEDs, it achieves a system efficacy of >130lm/W. The housing utilizes extruded Al6063 aluminum for superior heat dissipation and an anti-UV PC cover for impact resistance (IK08). It features a flicker-free driver with low harmonic distortion (THD<15%) and supports emergency lighting options (>90min).\n\nSR-TPL系列是一款专为车库、仓库和隧道等恶劣工业环境设计的坚固IP65级LED三防灯。采用高效飞利浦SMD2835 LED，系统光效>130lm/W。外壳采用挤压Al6063铝材散热，配以抗紫外线PC罩提供抗冲击保护（IK08）。具备无频闪驱动（THD<15%），并支持应急照明功能（>90分钟）。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '30W / 50W / 80W',
    powerFactor: '> 0.95',
    thd: '< 15%',
    driverClass: 'Isolated, Flicker-Free / 隔离无频闪'
  },
  mechanical: {
    material: 'Al6063 Aluminum + PC Cover / 铝合金+PC罩',
    finish: 'Anodized / 阳极氧化',
    optic: 'Diffuser / 扩散罩',
    adjustability: 'Surface / Suspended',
    ip: 'IP65, IK08',
    weight: '0.8kg / 1.4kg / 1.8kg',
    cutout: 'N/A'
  },
  optical: [
    { cct: '4000K', lumen: '3900 / 6500 / 10400', efficacy: '>130', sdcm: '<5', cri: '>80Ra', angle: '120°' },
    { cct: '5000K', lumen: '3900 / 6500 / 10400', efficacy: '>130', sdcm: '<5', cri: '>80Ra', angle: '120°' },
    { cct: '6500K', lumen: '3900 / 6500 / 10400', efficacy: '>130', sdcm: '<5', cri: '>80Ra', angle: '120°' },
  ],
  opticalGraph: {
    beamAngle: '120°',
    polarData: createPolarData('flood'),
    coneData: [
      { distance: '2m', lux: '975 lx', diameter: 'Ø 6.9m', barWidth: '100%' }, 
      { distance: '4m', lux: '243 lx', diameter: 'Ø 13.8m', barWidth: '25%' },
      { distance: '6m', lux: '108 lx', diameter: 'Ø 20.7m', barWidth: '11%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'TPL', label: 'Type', desc: '(Tri-proof)', color: 'text-blue-600' },
    { code: '120', label: 'Size', desc: '(1.2m)', color: 'text-green-600' },
    { code: '50W', label: 'Power', desc: '(50W)', color: 'text-gray-600' },
  ],
  features: ['IP65 Waterproof', 'Philips LEDs', 'Efficacy > 130lm/W'],
  standards: ['CE', 'CCC', 'SAA', 'IP65', 'IK08'],
  packing: [
      '0.6m: 700x260x220mm (8pcs/ctn, 10.4kg)',
      '1.2m: 1300x260x220mm (8pcs/ctn, 15.9kg)',
      '1.5m: 1600x260x220mm (8pcs/ctn, 16.4kg)'
  ]
};

const PRODUCT_HIGHBAY_SERIES: ProductConfig = {
  id: 'highbay-series',
  name: 'LED High Bay Light Series (80W / 220W)',
  model: 'SR-LP1150R / SR-LP1151R',
  series: 'Industrial High Bay Series',
  appType: 'Commercial / Retail / Industrial / Warehouse (商业/零售/工业/仓库)',
  docRev: 'A01',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "LED High Bay Light Series" (Models LP1150R and LP1151R) from Sanben Lighting.
    Key Features: Available in 80W (8800lm) and 220W (24200lm), Sanan Chip, MOSO Driver, Die-cast Aluminum, IP54.
    Specs: 5000K, 80 degree beam, White finish.
    Tone: Industrial, reliable, high-performance.
  `,
  defaultDescription: "The Industrial High Bay Series offers a versatile range of high-performance LED luminaires available in 80W (LP1150R) and 220W (LP1151R) configurations. Engineered for demanding industrial environments, these fixtures are powered by premium MOSO drivers and Sanan LED chips, delivering exceptional luminous flux up to 24,200lm at 5000K. The robust die-cast aluminum housing features a white finish and optimized thermal design. Rated IP54, this series ensures reliability and longevity in warehouses, factories, and high-ceiling applications.\n\n工业天棚灯系列提供80W (LP1150R) 和 220W (LP1151R) 两种高性能LED灯具配置。专为苛刻的工业环境设计，这些灯具由优质茂硕驱动和三安LED芯片供电，在5000K色温下提供高达24,200lm的卓越光通量。坚固的白色压铸铝外壳具有优化的散热设计。IP54防护等级确保在仓库、工厂和高天花板应用中的可靠性和长寿命。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '80W / 220W',
    powerFactor: '> 0.95',
    thd: 'N/A',
    driverClass: 'MOSO Driver / 茂硕驱动'
  },
  mechanical: {
    material: 'Die-cast Aluminum / 压铸铝',
    finish: 'White / 白色',
    optic: 'PC Diffuser / PC灯罩',
    adjustability: 'Not-Adjustable / 不可调',
    ip: 'IP54',
    weight: 'N/A',
    cutout: 'N/A'
  },
  optical: [
    { cct: '5000K (80W)', lumen: '8800', efficacy: '110', sdcm: '≤5', cri: 'Ra≥85', angle: '80°' },
    { cct: '5000K (220W)', lumen: '24200', efficacy: '110', sdcm: '≤5', cri: 'Ra≥85', angle: '80°' },
  ],
  opticalGraph: {
    beamAngle: '80°',
    polarData: createPolarData('wide'),
    coneData: [
      { distance: '8m', lux: '137 / 472 lx', diameter: 'Ø 13.4m', barWidth: '100%' },
      { distance: '10m', lux: '88 / 302 lx', diameter: 'Ø 16.8m', barWidth: '64%' },
      { distance: '12m', lux: '61 / 210 lx', diameter: 'Ø 20.1m', barWidth: '44%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'LP', label: 'Series', desc: '(Lamp)', color: 'text-blue-600' },
    { code: '115X', label: 'Model', desc: '(0:80W, 1:220W)', color: 'text-green-600' },
    { code: 'R', label: 'Type', desc: '(Round)', color: 'text-purple-600' },
  ],
  features: ['80W / 220W Options', 'MOSO Driver', 'Sanan Chips'],
  standards: ['IP54', '50,000hrs Life'],
  packing: [
      '80W: 310x175x148mm (D1xH1xH2)',
      '220W: 562x274x185mm (D1xH1xH2)',
      'Lifetime: 50,000 hrs'
  ]
};

const PRODUCT_LINEAR_SEAMLESS: ProductConfig = {
  id: 'linear-seamless-01',
  name: 'LED Seamless Connection Linear Light',
  model: 'SR-CL1 Series',
  series: 'LED Linear Light Series',
  appType: 'Office / Commercial / Retail (办公/商业/零售)',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "SR-CL1 LED Seamless Connection Linear Light Series" from Sanben Lighting.
    Key Features: Seamless connection, up to 1200mm length, High CRI > 80, Available in 20W and 28W.
    Specs: 110-240V, 105 degree beam angle, Black housing.
    Tone: Modern, sleek, architectural.
  `,
  defaultDescription: "The SR-CL1 Series is a premium LED linear lighting system designed for modern architectural applications requiring seamless, continuous illumination. Available in 20W and 28W configurations, it features a sleek 1200mm aluminum profile with a black finish that integrates effortlessly into contemporary office and retail environments. With a wide 105° beam angle and high color rendering (CRI ≥80), it provides uniform, comfortable lighting. The system supports seamless interconnection, allowing for the creation of extended light lines without visible dark spots.\n\nSR-CL1系列是一款专为需要无缝连续照明的现代建筑应用设计的高级LED线条灯系统。提供20W和28W配置，采用时尚的1200mm铝型材和黑色饰面，轻松融入现代办公和零售环境。具备105°宽光束角和高显色性（CRI ≥80），提供均匀舒适的照明。系统支持无缝互连，可创建没有可见暗斑的延伸光带。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '20W / 28W',
    powerFactor: '0.9',
    thd: '≤ 15%',
    driverClass: 'Isolated Constant Voltage / 隔离恒压'
  },
  mechanical: {
    material: 'Aluminum Profile / 铝型材',
    finish: 'Black / 黑色',
    optic: 'PC Diffuser / PC扩散罩',
    adjustability: 'Suspended / Surface',
    ip: 'IP20',
    weight: 'N/A',
    cutout: 'N/A'
  },
  optical: [
    { cct: '2700K', lumen: '1800 (20W) / 2520 (28W)', efficacy: '90', sdcm: '5-Step', cri: '≥80', angle: '105°' },
    { cct: '3000K', lumen: '1900 (20W) / 2660 (28W)', efficacy: '95', sdcm: '5-Step', cri: '≥80', angle: '105°' },
    { cct: '3500K', lumen: '1940 (20W) / 2716 (28W)', efficacy: '97', sdcm: '5-Step', cri: '≥80', angle: '105°' },
    { cct: '4000K', lumen: '2000 (20W) / 2800 (28W)', efficacy: '100', sdcm: '5-Step', cri: '≥80', angle: '105°' },
    { cct: '5000K', lumen: '2000 (20W) / 2800 (28W)', efficacy: '100', sdcm: '5-Step', cri: '≥80', angle: '105°' },
    { cct: '6000K', lumen: '2000 (20W) / 2800 (28W)', efficacy: '100', sdcm: '5-Step', cri: '≥80', angle: '105°' },
  ],
  opticalGraph: {
    beamAngle: '105°',
    polarData: createPolarData('flood'),
    coneData: [
      { distance: '2m', lux: '250 / 350 lx', diameter: 'Ø 5.2m', barWidth: '100%' },
      { distance: '3m', lux: '111 / 155 lx', diameter: 'Ø 7.8m', barWidth: '44%' },
      { distance: '4m', lux: '62 / 87 lx', diameter: 'Ø 10.4m', barWidth: '25%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'CL1', label: 'Series', desc: '(Linear)', color: 'text-blue-600' },
    { code: '20', label: 'Power', desc: '(20W)', color: 'text-green-600' },
    { code: '8XX', label: 'CRI/CCT', desc: '(80+ / CCT)', color: 'text-gray-600' },
  ],
  features: ['Seamless Connection', '105° Beam Angle', 'Available in 20W/28W'],
  standards: ['EN 55015', 'EN 61547', 'EN 61347-2-13', 'IP20', 'UL94 V-2'],
  packing: [
      'Outer Carton: 9 pcs / carton',
      'Unit Size: 1200mm x 80mm x 76mm',
      'Lifetime: 50,000 hrs (L70/B50)'
  ]
};

const PRODUCT_K_TYPE: ProductConfig = {
  id: 'track-k2',
  name: 'K-Type Ultra Wide Track Light',
  model: 'SR-LSP-42-K2',
  series: 'Ultra Wide-Angle Spotlight Series',
  appType: 'Commercial / Retail / Gallery (商业/零售/画廊)',
  docRev: 'A0',
  imageUrl: '',
  descriptionPrompt: `
    Write a professional product description for the "K-Type Ultra Wide Angle Track Light" (Model SR-LSP-42-K2) from Sanben Lighting.
    Key Features: 42W, Unique 66x24 degree asymmetric beam angle, High CRI > 90, Flicker-free driver.
    Specs: 110-240V, 4100-4600lm output, Rectangular housing design.
    Tone: Technical, innovative, specialized.
  `,
  defaultDescription: "The SR-LSP-42-K2 is a specialized LED track luminaire featuring an ultra-wide, asymmetric beam angle (66° x 24°), making it an exceptional choice for wall washing and aisle lighting in retail and gallery environments. Delivering a powerful 42W output with high efficacy (up to 110lm/W) and superior color rendering (CRI ≥90), it ensures merchandise and artwork are displayed with vibrancy and depth. The unique rectangular housing design incorporates effective thermal management, while the flicker-free driver guarantees visual comfort.\n\nSR-LSP-42-K2 是一款专业的LED导轨灯具，具有超宽非对称光束角 (66° x 24°)，是零售和画廊环境中洗墙和过道照明的绝佳选择。提供强劲的42W输出，具有高光效 (高达110lm/W) 和卓越的显色性 (CRI ≥90)，确商品和艺术品以生动和深度的色彩展示。独特的矩形外壳设计结合了有效的热管理，而无频闪驱动器则保证了视觉舒适度。",
  electrical: {
    inputVoltage: '110-240V AC',
    inputCurrent: 'Max 900 mA',
    ratedPower: '42W',
    powerFactor: '0.90',
    thd: '≤ 20%',
    driverClass: 'Isolated, Flicker-Free / 隔离无频闪'
  },
  mechanical: {
    material: 'Die-cast Aluminum / 压铸铝',
    finish: 'Black / White / 黑/白',
    optic: 'Asymmetric Lens / 非对称透镜',
    adjustability: '350° Rotation / 350° 旋转',
    ip: 'IP20',
    weight: 'N/A',
    cutout: 'N/A'
  },
  optical: [
    { cct: '2700K', lumen: '4116', efficacy: '98', sdcm: '3-Step', cri: '≥90', angle: '66° x 24°' },
    { cct: '3000K', lumen: '4326', efficacy: '103', sdcm: '3-Step', cri: '≥90', angle: '66° x 24°' },
    { cct: '3500K', lumen: '4452', efficacy: '106', sdcm: '3-Step', cri: '≥90', angle: '66° x 24°' },
    { cct: '4000K', lumen: '4620', efficacy: '110', sdcm: '3-Step', cri: '≥90', angle: '66° x 24°' },
    { cct: '5000K', lumen: '4620', efficacy: '110', sdcm: '5-Step', cri: '≥90', angle: '66° x 24°' },
  ],
  opticalGraph: {
    beamAngle: '66° x 24°',
    polarData: createPolarData('asymmetric'),
    coneData: [
      { distance: '1m', lux: '9,498 lx (Max)', diameter: '0.44m x 1.3m', barWidth: '100%' },
      { distance: '2m', lux: '2,375 lx (Max)', diameter: '0.88m x 2.6m', barWidth: '25%' },
      { distance: '3m', lux: '1,055 lx (Max)', diameter: '1.32m x 3.9m', barWidth: '11%' },
    ]
  },
  naming: [
    { code: 'SR', label: 'Company', desc: '(Sanben)', color: 'text-red-600' },
    { code: 'LSP', label: 'Series', desc: '(Spot)', color: 'text-blue-600' },
    { code: '42', label: 'Power', desc: '(42W)', color: 'text-green-600' },
    { code: 'K2', label: 'Type', desc: '(K-Type)', color: 'text-gray-600' },
  ],
  features: ['Asymmetric Beam 66°x24°', 'CRI ≥ 90', 'Wall Washer'],
  standards: ['EN 55015', 'EN 61547', 'EN 61347-2-13', 'IP20', 'UL94 V-2'],
  packing: [
      'Unit Box: 1 pc / box',
      'Carton: 20 pcs / carton',
      'Lifetime: 50,000 hrs (L70/B50)'
  ]
};

const PRODUCTS = [
  PRODUCT_LINEAR_SEAMLESS,
  PRODUCT_K_TYPE,
  PRODUCT_F_TYPE,
  PRODUCT_LD5,
  PRODUCT_WM_SERIES,
  PRODUCT_PANEL_SERIES,
  PRODUCT_TRIPROOF,
  PRODUCT_HIGHBAY_SERIES,
  PRODUCT_TRACK_RAIL,
  PRODUCT_TRACK_CONNECTORS
];

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

const TriProofLightSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>

        {/* Cross Section (Front View) */}
        <g transform="translate(40, 60)">
             {/* Base / Heatsink (Trapezoidal bottom) */}
             <path d="M20,54.5 L200,54.5 L220,40 L0,40 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
             
             {/* PC Cover (Rounded Top) */}
             <path d="M0,40 L220,40 L220,20 C220,0 180,0 110,0 C40,0 0,0 0,20 Z" fill="#fff" stroke="#334155" strokeWidth="1.5" opacity="0.9" />
             
             {/* Internal Components hint */}
             <circle cx="110" cy="27" r="12" fill="none" stroke="#94a3b8" strokeWidth="1" />
             <rect x="100" y="20" width="20" height="15" fill="#e2e8f0" />

             {/* Dimensions: Width 93.5mm */}
             <line x1="0" y1="-15" x2="220" y2="-15" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <line x1="0" y1="0" x2="0" y2="-20" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <line x1="220" y1="0" x2="220" y2="-20" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <text x="110" y="-20" fontSize="12" fill="#ef4444" textAnchor="middle">93.5mm</text>

             {/* Dimensions: Height 54.5mm */}
             <line x1="240" y1="0" x2="240" y2="54.5" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <line x1="220" y1="0" x2="245" y2="0" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <line x1="200" y1="54.5" x2="245" y2="54.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <text x="245" y="27" fontSize="12" fill="#ef4444" alignmentBaseline="middle">54.5mm</text>
        </g>

        {/* Side View (Length) */}
        <g transform="translate(40, 180)">
             {/* Long body */}
             <rect x="0" y="0" width="200" height="40" fill="#fff" stroke="#334155" strokeWidth="1.5" />
             {/* End caps */}
             <rect x="-10" y="-2" width="10" height="44" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
             <rect x="200" y="-2" width="10" height="44" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
             
             {/* Mounting clips */}
             <rect x="40" y="40" width="20" height="5" fill="#64748b" />
             <rect x="140" y="40" width="20" height="5" fill="#64748b" />
             
             {/* Length Dimension */}
             <line x1="0" y1="-15" x2="200" y2="-15" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <text x="100" y="-20" fontSize="12" fill="#ef4444" textAnchor="middle">600 / 1200 / 1500mm</text>
        </g>
    </svg>
);

const HighBaySVG = ({ size }: { size: 'small' | 'large' }) => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>

        {/* Both models now displayed at the same visual scale per user request */}
        <g transform="translate(65, 60)">
            {/* Suspension Hook */}
            <path d="M85,0 C70,0 70,-15 85,-15 C100,-15 100,0 85,0" fill="none" stroke="#333" strokeWidth="2" />
            <rect x="80" y="0" width="10" height="15" fill="#333" />

            {/* Driver Box / Heatsink Housing */}
            <path d="M50,15 L120,15 L130,70 L40,70 Z" fill="#1f2937" stroke="#000" strokeWidth="1" />
            {/* Fins */}
            {[60, 70, 80, 90, 100, 110].map(x => (
                <line key={x} x1={x} y1="18" x2={x} y2="68" stroke="#374151" strokeWidth="1" />
            ))}

            {/* Reflector / Diffuser (Prismatic) */}
            <path d="M40,70 L130,70 L170,140 L0,140 Z" fill="url(#prismaticGradient)" stroke="#9ca3af" strokeWidth="1" opacity="0.8" />
            
            {/* Gradient definition for prismatic effect */}
            <linearGradient id="prismaticGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="20%" stopColor="#fff" />
                <stop offset="40%" stopColor="#cbd5e1" />
                <stop offset="60%" stopColor="#fff" />
                <stop offset="80%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Vertical striations on diffuser */}
             {[10, 30, 50, 70, 90, 110, 130, 150].map((x, i) => (
                <line key={i} x1={15 + x} y1="70" x2={5 + x} y2="140" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />
             ))}

             {/* DIMENSIONS */}
             {/* Diameter */}
             <line x1="0" y1="160" x2="170" y2="160" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <line x1="0" y1="140" x2="0" y2="165" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <line x1="170" y1="140" x2="170" y2="165" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <text x="85" y="175" fontSize="14" fill="#ef4444" textAnchor="middle" fontWeight="bold">{size === 'large' ? 'Ø 562mm' : 'Ø 310mm'}</text>

             {/* Height */}
             <line x1="190" y1="-15" x2="190" y2="140" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <line x1="85" y1="-15" x2="195" y2="-15" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <line x1="170" y1="140" x2="195" y2="140" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <text x="200" y="60" fontSize="14" fill="#ef4444" fontWeight="bold" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>{size === 'large' ? '274mm' : '175mm'}</text>
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

const LinearLightSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>

        {/* Cross Section (Top Left) */}
        <g transform="translate(60, 50)">
             <text x="40" y="-20" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Cross Section</text>
             {/* Housing Square */}
             <rect x="0" y="0" width="80" height="76" fill="#1f2937" stroke="#000" strokeWidth="1" />
             {/* Diffuser */}
             <rect x="2" y="70" width="76" height="6" fill="#fff" opacity="0.8" />
             
             {/* Width Dim */}
             <line x1="0" y1="-10" x2="80" y2="-10" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <text x="40" y="-15" fontSize="10" fill="#ef4444" textAnchor="middle">80mm</text>

             {/* Height Dim */}
             <line x1="-10" y1="0" x2="-10" y2="76" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <text x="-15" y="38" fontSize="10" fill="#ef4444" textAnchor="end" alignmentBaseline="middle">76mm</text>
        </g>

        {/* Long Side View (Bottom) */}
        <g transform="translate(20, 200)">
             <text x="130" y="-30" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Side View</text>
             
             {/* Suspension Wires */}
             <line x1="60" y1="-20" x2="60" y2="0" stroke="#9ca3af" strokeWidth="1" />
             <line x1="200" y1="-20" x2="200" y2="0" stroke="#9ca3af" strokeWidth="1" />
             <circle cx="60" cy="-20" r="2" fill="#9ca3af" />
             <circle cx="200" cy="-20" r="2" fill="#9ca3af" />

             {/* Main Body */}
             <rect x="0" y="0" width="260" height="20" fill="#1f2937" stroke="#000" strokeWidth="1" />
             {/* Diffuser line */}
             <line x1="0" y1="20" x2="260" y2="20" stroke="#fff" strokeWidth="2" opacity="0.8" />

             {/* Length Dim */}
             <line x1="0" y1="35" x2="260" y2="35" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
             <line x1="0" y1="22" x2="0" y2="40" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <line x1="260" y1="22" x2="260" y2="40" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
             <text x="130" y="45" fontSize="12" fill="#ef4444" textAnchor="middle">1200mm</text>
        </g>
    </svg>
);

const KTypeTrackSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>

        <g transform="translate(60, 60)">
            {/* Track Adapter */}
            <rect x="70" y="0" width="60" height="20" fill="#e5e7eb" stroke="#374151" strokeWidth="1" />
            <line x1="80" y1="0" x2="80" y2="5" stroke="#374151" />
            <line x1="120" y1="0" x2="120" y2="5" stroke="#374151" />

            {/* Arm */}
            <rect x="90" y="20" width="20" height="20" fill="#d1d5db" stroke="#374151" strokeWidth="1" />

            {/* Main Body - Rectangular Box */}
            {/* Top plate */}
            <path d="M20,40 L180,40 L190,50 L30,50 Z" fill="#f3f4f6" stroke="#374151" strokeWidth="1" />
            
            {/* Front Face (angled slightly) */}
            <rect x="30" y="50" width="160" height="100" fill="#fff" stroke="#374151" strokeWidth="1.5" />
            
            {/* Decorative/Functional Lines on face */}
            <line x1="30" y1="75" x2="190" y2="75" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="30" y1="100" x2="190" y2="100" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="30" y1="125" x2="190" y2="125" stroke="#e5e7eb" strokeWidth="1" />

            {/* Side visible */}
            <path d="M190,50 L190,150 L180,140 L180,40 Z" fill="#d1d5db" stroke="#374151" strokeWidth="1" />

            {/* Bottom/Lens area */}
            <path d="M30,150 L190,150 L180,140 L40,140 Z" fill="#1f2937" />

            {/* Dimensions */}
            {/* Length 186mm */}
            <line x1="30" y1="165" x2="190" y2="165" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="110" y="178" fontSize="12" fill="#ef4444" textAnchor="middle">186mm</text>

            {/* Height 173mm */}
            <line x1="210" y1="0" x2="210" y2="150" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <line x1="130" y1="0" x2="215" y2="0" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="190" y1="150" x2="215" y2="150" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="225" y="75" fontSize="12" fill="#ef4444" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>173mm</text>

            {/* Width 71mm (Perspective hint) */}
            <line x1="190" y1="50" x2="205" y2="40" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="210" y="35" fontSize="12" fill="#ef4444">71mm</text>
        </g>
    </svg>
);

const TrackConnectorSVG = () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
         <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
        </defs>

        <g transform="translate(60, 60)">
            {/* L-Connector Top View */}
            
            {/* Horizontal Leg */}
            <rect x="0" y="60" width="120" height="34" fill="#fff" stroke="#333" strokeWidth="1.5" />
            {/* Vertical Leg */}
            <rect x="0" y="0" width="34" height="60" fill="#fff" stroke="#333" strokeWidth="1.5" />
            {/* Join */}
            <rect x="0" y="60" width="34" height="34" fill="#fff" stroke="none" /> 
            <line x1="0" y1="60" x2="34" y2="60" stroke="none" /> 
            
            {/* Outline Correction */}
            <path d="M0,0 L34,0 L34,60 L120,60 L120,94 L0,94 Z" fill="none" stroke="#333" strokeWidth="1.5" />

            {/* Contacts hint */}
            <line x1="10" y1="10" x2="10" y2="84" stroke="#d97706" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="24" y1="10" x2="24" y2="84" stroke="#d97706" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="10" y1="84" x2="110" y2="84" stroke="#d97706" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="24" y1="70" x2="110" y2="70" stroke="#d97706" strokeWidth="1" strokeDasharray="4 4" />

            {/* Locking Screws */}
            <circle cx="17" cy="47" r="3" fill="#ccc" stroke="#333" />
            <circle cx="70" cy="77" r="3" fill="#ccc" stroke="#333" />

            {/* DIMENSIONS */}
            {/* Width 34mm */}
            <line x1="0" y1="-10" x2="34" y2="-10" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="17" y="-15" fontSize="12" fill="#ef4444" textAnchor="middle">34mm</text>

            {/* Length A (Vertical) */}
            <line x1="-10" y1="0" x2="-10" y2="94" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="-15" y="47" fontSize="12" fill="#ef4444" textAnchor="end" alignmentBaseline="middle">109mm</text>

            {/* Length B (Horizontal) */}
            <line x1="0" y1="105" x2="120" y2="105" stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="60" y="120" fontSize="12" fill="#ef4444" textAnchor="middle">109mm</text>
        </g>

        {/* Feed Connector (Side View Schematic) */}
        <g transform="translate(180, 50)">
             <text x="40" y="-10" fontSize="10" fill="#333" textAnchor="middle" fontWeight="bold">Power Feed</text>
             <rect x="0" y="0" width="80" height="34" fill="#fff" stroke="#333" strokeWidth="1.5" />
             <rect x="80" y="5" width="20" height="24" fill="#ccc" stroke="#333" /> {/* Insertion part */}
             
             {/* Terminal Block */}
             <rect x="10" y="5" width="60" height="24" fill="#eee" />
             <circle cx="20" cy="17" r="3" fill="#333" />
             <circle cx="40" cy="17" r="3" fill="#333" />
             <circle cx="60" cy="17" r="3" fill="#333" />
             
             <text x="40" y="45" fontSize="10" fill="#ef4444" textAnchor="middle">107mm</text>
             <line x1="0" y1="38" x2="80" y2="38" stroke="#ef4444" strokeWidth="1" />
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
    if (product.id.includes('triproof')) return <TriProofLightSVG />;
    if (product.id.includes('highbay-series')) {
        return (
            <div className="flex gap-8 justify-center w-full h-full">
                <div className="flex-1 flex flex-col items-center">
                    <div className="h-full w-full relative"><HighBaySVG size="small" /></div>
                    <div className="text-xs text-gray-500 font-mono mt-2 text-center w-full">80W Model</div>
                </div>
                <div className="w-px bg-gray-200 self-stretch my-4"></div>
                <div className="flex-1 flex flex-col items-center">
                    <div className="h-full w-full relative"><HighBaySVG size="large" /></div>
                    <div className="text-xs text-gray-500 font-mono mt-2 text-center w-full">220W Model</div>
                </div>
            </div>
        );
    }
    if (product.id.includes('linear-seamless')) return <LinearLightSVG />;
    if (product.id.includes('track-k2')) return <KTypeTrackSVG />;
    if (product.id.includes('track-connectors')) return <TrackConnectorSVG />;
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
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">China Leading Retail Lighting Brand <span className="text-gray-400 font-normal">中国领先商业照明品牌</span></div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Focusing on Commercial Lighting for 20 Years <span className="text-gray-300">专注商业照明20年</span></div>
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
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Model <span className="font-normal text-gray-300">产品型号</span></div>
                            <div className="font-semibold text-2xl text-slate-800">{product.model}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Application <span className="font-normal text-gray-300">应用场景</span></div>
                            <div className="font-semibold text-xl text-slate-800">{product.appType}</div>
                          </div>
                      </div>
                      <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Spec <span className="font-normal text-gray-300">主要参数</span></div>
                          <div className="font-semibold text-lg text-slate-800">
                              {product.electrical.ratedPower} 
                              {product.optical && ` | CRI90+`}
                          </div>
                      </div>
                  </div>
                  
                  <div className="mb-12">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Product Description <span className="font-normal text-gray-300">产品描述</span></div>
                      <div className="text-base text-gray-600 leading-relaxed italic border-l-4 border-brand-600 pl-6 py-2 whitespace-pre-line">
                          {customDescription || product.defaultDescription}
                      </div>
                  </div>
                  
                  {/* Brand Heritage Section with new Visual */}
                  <div className="mt-12">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand Heritage <span className="font-normal text-gray-300">品牌传承</span></div>
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
          <h2 className="text-xl font-bold text-slate-900">1. Technical Specifications <span className="text-base font-normal text-gray-400 ml-2">技术参数</span></h2>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-12">
            <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
                  {product.optical ? '1.1 Electrical Data' : '1.1 System Parameters'}
                  <span className="block text-[10px] font-normal text-gray-400 capitalize">{product.optical ? '电气参数' : '系统参数'}</span>
                </h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-500">{product.optical ? 'Input Voltage' : 'Rated Voltage'} <span className="text-[10px] text-gray-300 block">输入电压</span></td>
                      <td className="py-2 font-mono text-right align-top">{product.electrical.inputVoltage}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-500">{product.optical ? 'Input Current' : 'Max Current'} <span className="text-[10px] text-gray-300 block">输入电流</span></td>
                      <td className="py-2 font-mono text-right align-top">{product.electrical.inputCurrent}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-500">{product.optical ? 'Rated Power' : 'Max Load'} <span className="text-[10px] text-gray-300 block">额定功率</span></td>
                      <td className="py-2 font-mono text-right align-top">{product.electrical.ratedPower}</td>
                    </tr>
                    {product.electrical.powerFactor !== 'N/A' && (
                      <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-500">Power Factor <span className="text-[10px] text-gray-300 block">功率因数</span></td>
                          <td className="py-2 font-mono text-right align-top">{product.electrical.powerFactor}</td>
                      </tr>
                    )}
                    {product.electrical.thd !== 'N/A' && (
                      <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-500">THD <span className="text-[10px] text-gray-300 block">总谐波失真</span></td>
                          <td className="py-2 font-mono text-right align-top">{product.electrical.thd}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2 text-gray-500">Driver Class <span className="text-[10px] text-gray-300 block">驱动类别</span></td>
                      <td className="py-2 font-mono text-right align-top">{product.electrical.driverClass}</td>
                    </tr>
                  </tbody>
                </table>
            </div>

            <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
                    {product.optical ? '1.2 Mechanical Data' : '1.2 Physical Specifications'}
                    <span className="block text-[10px] font-normal text-gray-400 capitalize">{product.optical ? '机械参数' : '物理规格'}</span>
                </h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Housing Material <span className="text-[10px] text-gray-300 block">灯体材质</span></td><td className="py-2 text-right align-top">{product.mechanical.material}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Finish <span className="text-[10px] text-gray-300 block">表面处理</span></td><td className="py-2 text-right align-top">{product.mechanical.finish}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">{product.optical ? 'Optic Material' : 'Insulation Material'} <span className="text-[10px] text-gray-300 block">{product.optical ? '光学材质' : '绝缘材质'}</span></td><td className="py-2 text-right align-top">{product.mechanical.optic}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Adjustability <span className="text-[10px] text-gray-300 block">调节角度</span></td><td className="py-2 text-right align-top">{product.mechanical.adjustability}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Ingress Protection <span className="text-[10px] text-gray-300 block">防护等级</span></td><td className="py-2 text-right align-top">{product.mechanical.ip}</td></tr>
                    {product.mechanical.cutout && <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Cutout Size <span className="text-[10px] text-gray-300 block">开孔尺寸</span></td><td className="py-2 text-right font-bold text-red-500 align-top">{product.mechanical.cutout}</td></tr>}
                    <tr><td className="py-2 text-gray-500">Net Weight <span className="text-[10px] text-gray-300 block">净重</span></td><td className="py-2 text-right align-top">{product.mechanical.weight}</td></tr>
                  </tbody>
                </table>
            </div>
        </div>

        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
            {product.optical ? '1.3 Optical Performance' : '1.3 Installation & Packing'}
            <span className="block text-[10px] font-normal text-gray-400 capitalize">{product.optical ? '光学性能' : '安装与包装'}</span>
        </h3>
        
        {product.optical && product.opticalGraph ? (
          <>
              <div className="overflow-hidden rounded border border-gray-200 mb-8">
                  <table className="w-full text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-semibold">
                      <tr>
                          <th className="p-3 text-left">CCT <span className="block text-[9px] font-normal text-gray-300">色温</span></th>
                          <th className="p-3 text-right">Luminous Flux <span className="block text-[9px] font-normal text-gray-300">光通量</span></th>
                          <th className="p-3 text-right">System Efficacy <span className="block text-[9px] font-normal text-gray-300">系统光效</span></th>
                          <th className="p-3 text-center">CRI <span className="block text-[9px] font-normal text-gray-300">显色指数</span></th>
                          <th className="p-3 text-center">SDCM <span className="block text-[9px] font-normal text-gray-300">色容差</span></th>
                          <th className="p-3 text-center">Beam Angles <span className="block text-[9px] font-normal text-gray-300">光束角</span></th>
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
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Luminous Intensity Distribution ({product.opticalGraph.beamAngle}) <span className="block font-normal mt-0.5">配光曲线</span></h4>
                      <PolarChart data={product.opticalGraph.polarData} beamAngle={product.opticalGraph.beamAngle} />
                  </div>
                  <div className="bg-white rounded p-4 border border-gray-200 h-full flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Cone Illuminance Diagram <span className="block font-normal mt-0.5">照度图</span></h4>
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
                  <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wide">Installation Instructions <span className="block text-[10px] font-normal text-gray-400">安装说明</span></h4>
                  <p className="leading-relaxed mb-4">
                      {product.installation || "Standard installation applies. Please refer to local regulations."}
                  </p>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                      <strong className="block mb-1">Safety Alert <span className="font-normal text-gray-400 ml-1">安全警告</span>:</strong>
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
                      <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wide">Packing Configuration <span className="block text-[10px] font-normal text-gray-400">包装配置</span></h4>
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
          <h2 className="text-xl font-bold text-slate-900">2. Reliability & Safety <span className="text-base font-normal text-gray-400 ml-2">可靠性与安全</span></h2>
        </div>

        <div className="mb-10">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                2.1 Testing Parameters
                <span className="block text-[10px] font-normal text-gray-400 capitalize">测试参数</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Dielectric Strength <span className="block text-[9px] text-gray-300">介电强度</span></div>
                    <div className="font-bold text-slate-800">1.5kV AC</div>
                    <div className="text-[10px] text-gray-400 mt-1">&lt;3.5mA leakage, 60s</div>
                </div>
                <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Surge Immunity <span className="block text-[9px] text-gray-300">浪涌免疫</span></div>
                    <div className="font-bold text-slate-800">1kV (L-N)</div>
                    <div className="text-[10px] text-gray-400 mt-1">2kV (L/N-PE)</div>
                </div>
                <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Lifetime (L70B50) <span className="block text-[9px] text-gray-300">使用寿命</span></div>
                    <div className="font-bold text-slate-800">50,000 hrs</div>
                    <div className="text-[10px] text-gray-400 mt-1">@ Ta=25°C</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                    2.2 Operating Conditions
                    <span className="block text-[10px] font-normal text-gray-400 capitalize">工作环境</span>
                </h3>
                <ul className="text-xs space-y-3">
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Operating Temperature <span className="block text-[9px] text-gray-300">工作温度</span></span>
                      <span className="font-medium">-20°C to +45°C</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Storage Temperature <span className="block text-[9px] text-gray-300">存储温度</span></span>
                      <span className="font-medium">-40°C to +80°C</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Humidity <span className="block text-[9px] text-gray-300">湿度</span></span>
                      <span className="font-medium">10% - 90% RH</span>
                  </li>
                </ul>
          </div>
          <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                    2.3 Standards Compliance
                    <span className="block text-[10px] font-normal text-gray-400 capitalize">符合标准</span>
                </h3>
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
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                2.4 Dimensional Drawing
                <span className="block text-[10px] font-normal text-gray-400 capitalize">产品尺寸图</span>
            </h3>
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
  const [activeProduct, setActiveProduct] = useState<ProductConfig>(PRODUCTS[0]);
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleProductSelect = (product: ProductConfig) => {
      setActiveProduct(product);
      setDescription(""); // Reset description on product change
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
              onClick={() => setIsBatchMode(false)}
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
              Print All (10 Docs)
            </button>
         </div>

         <div className="flex flex-col items-center">
            {PRODUCTS.map((product, index) => (
              <React.Fragment key={product.id}>
                <SpecSheet product={product} isBatch={true} />
                <div className="page-break" />
                <div className="h-12 no-print" /> 
              </React.Fragment>
            ))}
         </div>
      </div>
    )
  }

  // --- SPLIT LAYOUT (SIDEBAR + MAIN) ---
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans print:bg-white">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex-shrink-0 h-screen overflow-y-auto sticky top-0 print:hidden shadow-xl z-10">
         <div className="p-6 border-b border-slate-800">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-black italic tracking-tighter text-white">SANBEN<span className="text-brand-500">SPEC</span></span>
             </div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Product Specification Portal</div>
         </div>

         <div className="p-4 space-y-2">
            {PRODUCTS.map(product => (
                <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all group border border-transparent ${activeProduct.id === product.id ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className="font-bold truncate">{product.model}</div>
                    <div className={`text-xs truncate mt-1 ${activeProduct.id === product.id ? 'text-brand-200' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {product.name}
                    </div>
                </button>
            ))}
         </div>

         <div className="p-4 mt-auto border-t border-slate-800">
             <button 
                onClick={() => setIsBatchMode(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Batch Print Mode
             </button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto relative print:h-auto print:overflow-visible bg-gray-100">
          {/* TOOLBAR (STICKY) */}
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden shadow-sm">
             <div>
                 <h2 className="text-lg font-bold text-slate-800">{activeProduct.model}</h2>
                 <p className="text-xs text-gray-500">{activeProduct.series}</p>
             </div>
             <div className="flex gap-3">
                 <button 
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all shadow-sm ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                 >
                    {isGenerating ? (
                        <>
                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                        </>
                    ) : (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        AI Re-write
                        </>
                    )}
                 </button>
                 <button 
                    onClick={handlePrint}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all shadow-sm"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print PDF
                 </button>
             </div>
          </div>

          {/* SPEC SHEET DISPLAY */}
          <div className="p-8 print:p-0 flex justify-center pb-24">
             <div ref={printRef} className="print:w-full">
                <SpecSheet product={activeProduct} customDescription={description} />
             </div>
          </div>
          
          <div className="text-center text-[10px] text-gray-400 pb-4 print:hidden">
              System v2.4 | © 2024 Sanben Lighting
          </div>
      </main>
    </div>
  );
};

export default App;