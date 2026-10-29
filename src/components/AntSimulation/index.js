import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Cylinder } from '@react-three/drei';
import { AntModel } from './AntModel';
import * as THREE from 'three';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';

/* ─────────────────── CONSTANTS ─────────────────── */
const NUM_ANTS = 20; // Swarm 20 cá thể khởi đầu
const ANT_SCALE = 1000;
const WALK_SPEED = 6.0;
const RUN_SPEED = 15.0;
const BOUNDS = 85;
const WANDER_CHANGE_MIN = 2.0;
const WANDER_CHANGE_MAX = 4.0;
const NEST_POS = new THREE.Vector3(-70, 0, -70);
const GRAVEYARD_POS = new THREE.Vector3(80, 0, -80);

/* ─────────────────── MÔ HÌNH NGOẠI SUY SINH THÁI & DỊ TỐC 5 TẦNG (5-LAYER BIOPHYSICAL & ALLOMETRIC EXTRAPOLATION ENGINE) ───────────────────
 * Cơ sở học thuật & Công thức toán học:
 * 1. Tích phân Cực 2D Độ dốc Suy giảm Mật độ Tâm–Biên (2D Polar Radial Integration — Orians & Pearson, 1979; Adams & Tschinkel, 2001):
 *    - Mật độ kiếm ăn D(r) = D_0 * exp(-λ * r) suy giảm theo bán kính r từ gò tổ ra biên lãnh thổ R_terr = sqrt(A_terr / π).
 *    - Hệ số suy giảm không gian chính xác: η(λ, R) = [2 / (λ*R)²] * [1 - (1 + λ*R) * exp(-λ*R)] * exp(λ * r_quadrat).
 *    - Độ dốc λ phụ thuộc động vào cường độ đường mòn Pheromone đang hoạt động và kiểu xã hội (Monogyne vs Polygyne).
 * 2. Ước lượng Nghịch đảo Horvitz–Thompson Phân tầng theo Giai cấp & Vi khí hậu (Porter & Tschinkel, 1987; Tschinkel, 2006):
 *    - Tỷ lệ xuất quân bề mặt f_c(T_soil, W) khác nhau giữa các giai cấp (Minor ~19%, Soldier ~27%, Major ~14% do phần lớn Major ở dưới hầm nghiền hạt/dự trữ)
 *      và biến thiên theo hàm nhiệt độ Gauss quanh T_opt = 30°C kết hợp độ ẩm VPD:
 *      N_colony,c = N_surface,c / f_c(T_soil, W) (Riêng Kiến Chúa Queen không nhân theo diện tích mà xác định theo cấu trúc Monogyne = 1 / Polygyne = 6).
 * 3. Sinh năng lượng học Dị tốc 2 Cấp Kleiber–Hou & Phương trình Arrhenius MTE (Kleiber, 1932; Gillooly et al., 2001 Science; Hou et al., 2010 PNAS):
 *    - Cấp cá thể: B_i ∝ m_i^0.75 (Minor 1.0mg = 1.00 MEU; Soldier 2.2mg = 1.81 MEU; Major 4.0mg = 2.83 MEU; Queen 14.2mg = 7.32 MEU).
 *    - Cấp siêu sinh vật (Whole-Colony Superorganism Allometry): Tổng công suất trao đổi chất toàn tổ tỉ lệ dưới tuyến tính với tổng sinh khối M_colony^0.81
 *      nhân với thừa số nhiệt động học Boltzmann–Arrhenius exp(-E_a / (k_B * T)) với năng lượng hoạt hóa E_a = 0.65 eV.
 * 4. Định luật Lũy thừa Taylor & Khoảng Tin cậy Thống kê 95% (Taylor's Power Law Spatial Variance — Taylor, 1961):
 *    - Phương sai lấy mẫu ô vuông Quadrat của côn trùng quần tụ tuân theo σ² = a * μ^b (với b = 1.44 cho đường mòn kiến lửa),
 *      cho phép tính Sai số chuẩn tương đối (RSE) và Khoảng tin cậy 95% (95% CI) của quy mô quần thể ngoại suy.
 */
const SIM_AREA_M2 = 0.25; // Ô lấy mẫu chuẩn Quadrat 50cm × 50cm (0.25 m²)
const REAL_TERRITORY_M2 = 50.0; // Lãnh thổ kiếm ăn mặc định của 1 tập đoàn S. geminata trưởng thành (50 m²)
const KLEIBER_EXPONENT = 0.75; // Số mũ trao đổi chất cá thể Kleiber (3/4 power law)
const HOU_COLONY_EXPONENT = 0.81; // Số mũ dị tốc cấp siêu sinh vật (Hou et al., 2010 PNAS)
const ARRHENIUS_EA_EV = 0.65; // Năng lượng hoạt hóa trao đổi chất E_a = 0.65 eV (Gillooly et al., 2001)
const BOLTZMANN_KB_EV = 8.617333e-5; // Hằng số Boltzmann (eV/K)
const SOLDIER_METABOLIC_EQ = 1.81; // (2.2 mg / 1.0 mg)^0.75 ≈ 1.81 MEU
const MAJOR_TO_MINOR_MASS_RATIO = 4.0; // Tỷ lệ khối lượng tươi Major (4.0 mg) / Minor (1.0 mg)
const MAJOR_METABOLIC_EQ = Number(Math.pow(MAJOR_TO_MINOR_MASS_RATIO, KLEIBER_EXPONENT).toFixed(2)); // α_major ≈ 2.83 MEU
const QUEEN_METABOLIC_EQ = 7.32; // (14.2 mg / 1.0 mg)^0.75 ≈ 7.32 MEU

// Hằng số Đáp ứng Chức năng Săn mồi Holling Type II
const HOLLING_P_MAX = 0.85; // Tỷ lệ tử vong tối đa do thiên địch ở trạng thái bão hòa
const HOLLING_E_HALF = 6.0; // Hằng số bán bão hòa mật độ thiên địch (Half-saturation constant)
const K_SPACE_MAX_MEU = 65; // Ngưỡng bão hòa mật độ lưu thông đường mòn (Burd et al., 2002)

function calculateMetabolicLoad(minorCount, majorCount, soldierCount = 0) {
  return Number((minorCount + soldierCount * SOLDIER_METABOLIC_EQ + majorCount * MAJOR_METABOLIC_EQ + QUEEN_METABOLIC_EQ).toFixed(1));
}

function computeScientificExtrapolation({
  minorSim = 11,
  soldierSim = 5,
  majorSim = 3,
  queenSim = 1,
  activeTrailAnts = 0,
  territoryAreaM2 = REAL_TERRITORY_M2,
  soilTempC = 29.0,
  waterRate = 3,
  foodRate = 4,
  socialForm = 'monogyne',
}) {
  const workerSimTotal = Math.max(0, minorSim + soldierSim + majorSim);
  const areaRatio = territoryAreaM2 / SIM_AREA_M2;
  const rTerr = Math.sqrt(territoryAreaM2 / Math.PI);

  // 1. Tích phân Cực 2D Central-Place Foraging: D(r) = D_0 * exp(-λ * r)
  const baseLambda = socialForm === 'polygyne' ? 0.29 : 0.41;
  const lambda = Math.max(0.18, baseLambda - 0.007 * foodRate - 0.0035 * Math.min(25, activeTrailAnts));
  const lambdaR = lambda * rTerr;
  const rawPolarIntegral = (2 / (lambdaR * lambdaR)) * (1 - (1 + lambdaR) * Math.exp(-lambdaR));
  // Hiệu chỉnh vị trí đặt ô Quadrat chuẩn ở vùng cận tổ (r_quad = 0.72 m)
  const spatialEta = Math.min(0.88, Math.max(0.22, rawPolarIntegral * Math.exp(lambda * 0.72)));
  const surfaceMultiplier = areaRatio * spatialEta;

  const surfMinor = Math.round(minorSim * surfaceMultiplier);
  const surfSoldier = Math.round(soldierSim * surfaceMultiplier);
  const surfMajor = Math.round(majorSim * surfaceMultiplier);
  const surfaceForagersTotal = surfMinor + surfSoldier + surfMajor;

  // 2. Hàm điều biến Vi khí hậu Nhiệt - Ẩm (Porter & Tschinkel, 1987) & Phân tầng Horvitz–Thompson theo Giai cấp
  const thermalGaussian = Math.exp(-Math.pow(soilTempC - 30.0, 2) / (2 * Math.pow(7.5, 2)));
  const hydricFactor = 0.62 + 0.38 * (waterRate / 10);
  const microclimatePhi = Math.max(0.32, Math.min(1.22, thermalGaussian * hydricFactor));

  const fMinor = Math.min(0.32, Math.max(0.07, 0.19 * microclimatePhi));
  const fSoldier = Math.min(0.42, Math.max(0.10, 0.27 * microclimatePhi));
  const fMajor = Math.min(0.25, Math.max(0.05, 0.14 * microclimatePhi));

  const colMinor = Math.round(surfMinor / fMinor);
  const colSoldier = Math.round(surfSoldier / fSoldier);
  const colMajor = Math.round(surfMajor / fMajor);
  const colQueen = workerSimTotal === 0 && queenSim === 0 ? 0 : (socialForm === 'polygyne' ? 6 : 1);

  const totalColonyAdults = colMinor + colSoldier + colMajor + colQueen;
  const subterraneanAdults = Math.max(0, totalColonyAdults - surfaceForagersTotal);
  const effectiveForagerFraction = totalColonyAdults > 0 ? surfaceForagersTotal / totalColonyAdults : 0.18;
  const effectiveColonyMultiplier = workerSimTotal > 0 ? totalColonyAdults / (workerSimTotal + queenSim) : 500;

  // Ước lượng Quần thể Ấu trùng & Nhộng dưới lòng đất (Subterranean Brood — Markin et al., 1973)
  const broodFactor = (socialForm === 'polygyne' ? 0.76 : 0.65) * thermalGaussian;
  const broodEggs = Math.round(totalColonyAdults * broodFactor * 0.34);
  const broodLarvae = Math.round(totalColonyAdults * broodFactor * 0.42);
  const broodPupae = Math.round(totalColonyAdults * broodFactor * 0.24);
  const totalBrood = broodEggs + broodLarvae + broodPupae;

  // 3. Sinh khối (Biomass) & Trao đổi chất Dị tốc 2 Cấp Kleiber–Hou + Arrhenius MTE
  const adultBiomassGrams = (colMinor * 1.0 + colSoldier * 2.2 + colMajor * 4.0 + colQueen * 14.2) / 1000;
  const broodBiomassGrams = (totalBrood * 0.65) / 1000;
  const totalFreshBiomassGrams = adultBiomassGrams + broodBiomassGrams;
  const totalDryBiomassGrams = totalFreshBiomassGrams * 0.32;

  const tempKelvin = soilTempC + 273.15;
  const arrheniusFactor = Math.exp(-ARRHENIUS_EA_EV / BOLTZMANN_KB_EV * (1 / tempKelvin - 1 / 298.15));
  // Định luật Hou et al. (2010 PNAS): Công suất trao đổi chất siêu sinh vật B_colony ∝ M_fresh^0.81
  const colonyPowerMW = totalFreshBiomassGrams > 0
    ? 3.85 * Math.pow(totalFreshBiomassGrams, HOU_COLONY_EXPONENT) * arrheniusFactor
    : 0;
  const dailyEnergyKJ = colonyPowerMW * 0.0864;
  const dailyFoodEquivalentGrams = dailyEnergyKJ / 16.7; // 1g sinh khối côn trùng/carbohydrate ≈ 16.7 kJ

  // 4. Định luật Lũy thừa Taylor (Taylor, 1961) & Khoảng tin cậy 95% (95% Confidence Interval)
  const taylorB = 1.44;
  const taylorA = 0.62;
  const fpc = Math.max(0.05, 1 - SIM_AREA_M2 / territoryAreaM2);
  const sampleVariance = taylorA * Math.pow(Math.max(1, workerSimTotal), taylorB);
  const rse = workerSimTotal > 0 ? Math.sqrt(sampleVariance * fpc) / workerSimTotal : 0;
  const ci95HalfWidth = Math.round(1.96 * rse * totalColonyAdults);
  const ci95Low = Math.max(surfaceForagersTotal, totalColonyAdults - ci95HalfWidth);
  const ci95High = totalColonyAdults + ci95HalfWidth;

  return {
    areaRatio,
    rTerr,
    lambda,
    spatialEta,
    surfaceMultiplier,
    surfMinor,
    surfSoldier,
    surfMajor,
    surfaceForagersTotal,
    fMinor,
    fSoldier,
    fMajor,
    effectiveForagerFraction,
    effectiveColonyMultiplier,
    colMinor,
    colSoldier,
    colMajor,
    colQueen,
    totalColonyAdults,
    subterraneanAdults,
    broodEggs,
    broodLarvae,
    broodPupae,
    totalBrood,
    adultBiomassGrams,
    broodBiomassGrams,
    totalFreshBiomassGrams,
    totalDryBiomassGrams,
    arrheniusFactor,
    colonyPowerMW,
    dailyEnergyKJ,
    dailyFoodEquivalentGrams,
    rsePercent: rse * 100,
    ci95HalfWidth,
    ci95Low,
    ci95High,
  };
}

/* ─────────────────── SHARED GEOMETRIES & MATERIALS (GPU BATCHING, ZERO PER-INSTANCE ALLOCATION) ─────────────────── */
const HITBOX_GEOMETRY = new THREE.SphereGeometry(2.6, 6, 6);
const HITBOX_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  colorWrite: false,
});
const SUGAR_CRYSTAL_GEO = new THREE.OctahedronGeometry(1.15, 0);
const SUGAR_SUB_GEO = new THREE.DodecahedronGeometry(0.75, 0);
const SUGAR_RING_GEO = new THREE.RingGeometry(0.9, 1.35, 24);
const SUGAR_MAIN_MAT = new THREE.MeshStandardMaterial({
  color: '#fffbeb',
  emissive: '#f59e0b',
  emissiveIntensity: 0.22,
  roughness: 0.15,
  metalness: 0.1,
  transparent: true,
  opacity: 0.92,
});
const SUGAR_CORE_MAT = new THREE.MeshStandardMaterial({
  color: '#fde68a',
  emissive: '#d97706',
  emissiveIntensity: 0.4,
  roughness: 0.2,
});
const CORPSE_CHITIN_MAT = new THREE.MeshStandardMaterial({
  color: '#2b1208',
  emissive: '#450a0a',
  emissiveIntensity: 0.25,
  roughness: 0.65,
});

/* ─────────────────── ENVIRONMENT & CIRCADIAN / CATACLYSM PROFILES ─────────────────── */
const OBSTACLES = [
  { id: 'lake', x: 60, z: 40, r: 18 },
  { id: 'rock1', x: -40, z: -40, r: 8 },
  { id: 'rock2', x: -60, z: 30, r: 6 },
  { id: 'rock3', x: 20, z: -50, r: 10 }
];

// Tọa độ các Bụi Cây & Tảng Đá làm nơi Trú Nắng Điều Nhiệt (Thermal Shade Refuges) vào Buổi Trưa / Nắng Hạn
const SHADE_REFUGES = [
  { x: -30, z: -50 },
  { x: 50, z: -30 },
  { x: 30, z: 60 },
  { x: -70, z: 5 },
  { x: -10, z: -70 },
  { x: 65, z: -15 },
  { x: -20, z: 65 },
  { x: -40, z: -31 },
  { x: 20, z: -39 },
];

// Hồ sơ Sinh học 4 Buổi Trong Ngày (Circadian Rhythm — Porter & Tschinkel, 1987; Cokendolpher & Francke, 1985)
const CIRCADIAN_PROFILES = {
  morning: {
    id: 'morning',
    key: 'morning',
    label: '🌅 Buổi Sáng (06:00 – 11:00)',
    shortLabel: '🌅 Sáng',
    clockText: '07:30 · Bình Minh',
    title: 'Buổi Sáng: Đỉnh Kiếm Ăn Số 1 & Phơi Nắng Điều Nhiệt (Morning Peak & Solar Basking)',
    bioSummary: 'T_soil ≈ 28°C tiệm cận ngưỡng tối ưu 30°C, độ ẩm sương mai cao. Toàn đàn xuất kích (+15% tốc độ), Pheromone bền mùi (bay hơi ×0.75), một nhóm Kiến Thợ phơi nắng ấm trên đỉnh gò tổ.',
    baseTempC: 28,
    speedMult: 1.15,
    energyDecayMult: 0.9,
    hydrationLossMult: 0.65,
    pheroEvapMult: 0.75,
    olfactoryRangeMult: 1.15,
    visualRangeMult: 1.1,
    spiderAggroMult: 0.9,
    bgColor: '#13241d',
    bgHex: '#13241d',
    hemiSky: '#fde68a',
    hemiGround: '#14532d',
    hemiIntensity: 0.82,
    ambientIntensity: 0.48,
    dirColor: '#fef08a',
    dirIntensity: 2.05,
    sunPos: [-65, 32, 30],
  },
  noon: {
    id: 'noon',
    key: 'noon',
    label: '☀️ Buổi Trưa (11:00 – 15:00)',
    shortLabel: '☀️ Trưa',
    clockText: '12:30 · Đứng Bóng',
    title: 'Buổi Trưa: Nắng Gắt Cực Đại & Tránh Sốc Nhiệt CT_max (Midday Thermal Siesta)',
    bioSummary: 'T_soil ≈ 39°C sát ngưỡng tê liệt nhiệt CT_max (43.5°C). ~45% Kiến Thợ nhỏ rút dưới bóng râm bụi cây/tổ ngầm; cá thể ngoài nắng chạy nước rút (+18% tốc) nhưng mất nước ×2.3 và Pheromone bay hơi ×1.8!',
    baseTempC: 39,
    speedMult: 1.18,
    energyDecayMult: 1.45,
    hydrationLossMult: 2.3,
    pheroEvapMult: 1.8,
    olfactoryRangeMult: 0.85,
    visualRangeMult: 1.2,
    spiderAggroMult: 0.8,
    bgColor: '#1e2618',
    bgHex: '#1e2618',
    hemiSky: '#fffbeb',
    hemiGround: '#365314',
    hemiIntensity: 0.95,
    ambientIntensity: 0.62,
    dirColor: '#ffffff',
    dirIntensity: 2.85,
    sunPos: [6, 78, 8],
  },
  afternoon: {
    id: 'afternoon',
    key: 'afternoon',
    label: '🌇 Buổi Chiều (15:00 – 18:30)',
    shortLabel: '🌇 Chiều',
    clockText: '16:45 · Hoàng Hôn',
    title: 'Buổi Chiều: Đỉnh Hội Quân Tích Trữ & Gia Cố Tổ (Afternoon Second Peak & Granary Rush)',
    bioSummary: 'T_soil dịu xuống 31°C. Quân đoàn trú nắng đồng loạt tái xuất kích! Kiến Tướng nghiền hạt nhanh +35%, đội vận chuyển tăng +18% sức kéo và đẩy mạnh dọn xác nghĩa địa trước khi trời tối.',
    baseTempC: 31,
    speedMult: 1.12,
    energyDecayMult: 1.0,
    hydrationLossMult: 1.05,
    pheroEvapMult: 0.95,
    olfactoryRangeMult: 1.25,
    visualRangeMult: 1.0,
    spiderAggroMult: 1.1,
    bgColor: '#231615',
    bgHex: '#231615',
    hemiSky: '#fdba74',
    hemiGround: '#1c3d22',
    hemiIntensity: 0.72,
    ambientIntensity: 0.42,
    dirColor: '#fb923c',
    dirIntensity: 1.95,
    sunPos: [68, 24, -32],
  },
  night: {
    id: 'night',
    key: 'night',
    label: '🌙 Buổi Tối (18:30 – 06:00)',
    shortLabel: '🌙 Tối',
    clockText: '22:15 · Đêm Khuya',
    title: 'Buổi Tối: Giảm Trao Đổi Chất Biến Nhiệt, Định Hướng Hóa Học & Cảnh Giới Đêm (Nocturnal Vigil)',
    bioSummary: 'T_soil hạ còn 21°C khiến trao đổi chất Arrhenius giảm (tốc độ ×0.74, tiết kiệm 40% năng lượng & 65% nước). Thị giác giảm nhưng khứu giác Pheromone tăng +45%; Kiến Lính siết vòng vây quanh tổ chống Nhện Độc săn đêm (+30% tốc độ nhện)!',
    baseTempC: 21,
    speedMult: 0.74,
    energyDecayMult: 0.6,
    hydrationLossMult: 0.35,
    pheroEvapMult: 0.55,
    olfactoryRangeMult: 1.45,
    visualRangeMult: 0.55,
    spiderAggroMult: 1.3,
    bgColor: '#040711',
    bgHex: '#040711',
    hemiSky: '#818cf8',
    hemiGround: '#091510',
    hemiIntensity: 0.36,
    ambientIntensity: 0.22,
    dirColor: '#93c5fd',
    dirIntensity: 0.78,
    sunPos: [-48, 56, -42],
  },
};

// Hồ sơ Thời tiết & Thảm họa Thiên nhiên (God Mode Weather & Cataclysm Engine)
const WEATHER_PROFILES = {
  clear: {
    id: 'clear',
    key: 'clear',
    label: '🌤️ Quang Đãng',
    shortLabel: 'Quang Đãng',
    tempOffset: 0,
    windForce: 1.0,
    pheroEvapMult: 1.0,
    hydrationLossMult: 1.0,
    speedMult: 1.0,
    windDirX: 0,
    windDirZ: 0,
    desc: 'Thời tiết ổn định theo nhịp sinh học 4 buổi tự nhiên.',
  },
  rain: {
    id: 'rain',
    key: 'rain',
    label: '🌧️ Mưa Rào',
    shortLabel: 'Mưa Rào',
    tempOffset: -4,
    windForce: 1.8,
    pheroEvapMult: 18.5,
    hydrationLossMult: 0.2,
    speedMult: 0.85,
    windDirX: 0.2,
    windDirZ: 0.1,
    desc: 'Mưa lớn xóa sạch dấu vết Pheromone (×18.5 bay hơi). Toàn đàn khẩn cấp bỏ mồi rút về hầm ngầm tránh ngập.',
  },
  windstorm: {
    id: 'windstorm',
    key: 'windstorm',
    label: '🌬️ Gió Bão',
    shortLabel: 'Gió Bão',
    tempOffset: -2,
    windForce: 3.2,
    pheroEvapMult: 3.4,
    hydrationLossMult: 1.75,
    speedMult: 0.78,
    windDirX: 1.0,
    windDirZ: 0.35,
    desc: 'Gió giật thổi bay Pheromone và đẩy lệch quỹ đạo. Kiến Thợ nhỏ (1mg) phải ghì chặt hàm bám đất (Anemotactic Anchoring) khi gió rít, còn Kiến Tướng (4mg) làm mỏ neo cản gió.',
  },
  tornado: {
    id: 'tornado',
    key: 'tornado',
    label: '🌪️ Lốc Xoáy',
    shortLabel: 'Lốc Xoáy',
    tempOffset: -3,
    windForce: 4.5,
    pheroEvapMult: 6.0,
    hydrationLossMult: 1.9,
    speedMult: 0.72,
    windDirX: 1.2,
    windDirZ: -0.5,
    desc: 'Siêu vòi rồng cuốn bổng kiến, mồi và nhện trong tâm xoáy lên độ cao 16m! Kiến vùng rìa ghì hàm khóa chân chống lực hút khí áp (Click mặt đất để giáng tâm lốc).',
  },
  heatwave: {
    id: 'heatwave',
    key: 'heatwave',
    label: '🔥 Nắng Hạn',
    shortLabel: 'Nắng Hạn',
    tempOffset: 7,
    windForce: 0.6,
    pheroEvapMult: 2.6,
    hydrationLossMult: 3.8,
    speedMult: 1.12,
    windDirX: 0,
    windDirZ: 0,
    desc: 'Bão nhiệt cực đoan (+7°C, mất nước ×3.8). Kiến Thợ lập tức rút vào bóng râm bụi cây hoặc lập chuỗi tiếp nước khẩn cấp từ Hồ Nước về cứu tổ!',
  },
  flood: {
    id: 'flood',
    key: 'flood',
    label: '🌊 Đại Hồng Thủy',
    shortLabel: 'Lũ Quét',
    tempOffset: -5,
    windForce: 1.5,
    pheroEvapMult: 25.0,
    hydrationLossMult: 0.1,
    speedMult: 0.7,
    windDirX: 0,
    windDirZ: 0,
    desc: 'Nước lũ nhấn chìm toàn lãnh thổ. Toàn bộ quân đoàn móc vuốt chân tạo Bè Kiến Sống kỵ nước Cassie–Baxter bảo vệ Kiến Chúa ở tâm bè.',
  },
};

const INFO_BULLETIN = {
  patrolling: {
    title: 'Vệ Binh Tuần Tra',
    desc: 'Kiến thợ di chuyển liên tục theo các quỹ đạo ngẫu nhiên để mở rộng vùng săn mồi. Cặp râu quét liên tục để nhận diện hóa chất.',
  },
  recruit: {
    title: 'Trinh Sát & Tuyển Dụng',
    desc: 'Phát hiện mồi, nếm thử và chạy thục mạng về tổ. Liên tục nhả Pheromone dọc đường để rủ rê đồng bọn đi theo.',
  },
  waiting: {
    title: 'Hội Quân & Đánh Giá',
    desc: 'Các thành viên bám theo mùi đang bao vây miếng mồi để chờ gom đủ quân số (đủ sức kéo).',
  },
  carrying: {
    title: 'Vận Chuyển Hợp Tác',
    desc: 'Ngay khi đủ người, cả đội khóa chặt vào con mồi, điều phối cùng tịnh tiến nhịp nhàng về tọa độ tổ.',
  },
  alarmed: {
    title: 'Báo Động Khẩn Cấp',
    desc: 'Lao thẳng vào điểm xung đột để bảo vệ hệ sinh thái tổ trước thiên địch.',
  },
  rafting: {
    title: 'Kết Bè Sinh Tồn (Hydrophobic Rafting)',
    desc: 'Khi lũ lụt dâng cao, toàn đàn khóa chặt chân và hàm tạo thành chiếc bè nổi kỵ nước theo hiệu ứng Cassie-Baxter để bảo vệ kiến chúa và ấu trùng.',
  },
  milling: {
    title: 'Nghiền Mồi & Cắt Xé (Cutters → Carriers)',
    desc: 'Kiến Tướng (Major) dùng cặp hàm cùn khổng lồ nghiền vỡ vỏ hạt cứng/kitin tại hiện trường, sau đó nhường cho Kiến Thợ (Minor) vận chuyển về tổ.',
  },
  queen_court: {
    title: 'Triều Đình Kiến Chúa & Nội Tiết QMP',
    desc: 'Kiến Thợ hầu cận mớm sữa dinh dưỡng (Royal Trophallaxis) cho Kiến Chúa, kích hoạt xung Pheromone QMP tăng 25% tốc độ cho toàn quân đoàn.',
  },
  circadian_adapting: {
    title: 'Điều Nhiệt Sinh Học & Ứng Phó Thảm Họa',
    desc: 'Đàn kiến tự động điều chỉnh hành vi sinh lý theo 4 buổi (Phơi nắng sáng, Trú bóng râm buổi trưa, Cảnh giới đêm) và chống chịu thiên tai (Bám hàm chống gió bão, Kết bè vượt lũ, Thoát hiểm vòi rồng).',
  },
};

const BioExplanations = {
  patrolling: {
    title: "Khám Phá Lãnh Thổ (Patrolling)",
    desc: "Kiến di chuyển ngẫu nhiên, vươn râu để thu thập phân tử mùi trong không khí. Phân tích hydrocarbon trên mặt đất.",
    link: "/docs/giai-cap-xa-hoi#3-thuật-toán-khám-phá-không-gian-và-ra-quyết-định-tập-thể"
  },
  communicating: {
    title: "Giao Tiếp Xúc Giác & Trophallaxis (Antennation)",
    desc: "Hai cá thể dùng râu gõ vào nhau để quét lớp hydrocarbon nhận diện đồng loại và san sẻ thức ăn lỏng (Trophallaxis).",
    link: "/docs/giai-cap-xa-hoi#4-mạng-lưới-giao-tiếp-hóa-học-đa-kênh"
  },
  evaluating: {
    title: "Đánh Giá Mồi (Food Assessment)",
    desc: "Kiến trinh sát dùng hàm và râu để đo lường kích thước, độ ngọt và số lượng nhân lực cần thiết để khiêng mồi.",
    link: "/docs/giai-cap-xa-hoi#2-cơ-sinh-học-của-thuyết-carriers-and-cutters-người-vận-chuyển-và-kẻ-cắt-xé"
  },
  recruit_return: {
    title: "Tuyển Dụng (Pheromone Trail)",
    desc: "Kiến chà chóp bụng xuống đất, tiết ra Pheromone Z,E-α-Farnesene từ tuyến Dufour tạo thành vệt mùi dẫn đường từ mồi về tổ.",
    link: "/docs/giai-cap-xa-hoi#41-tuyến-dufour-và-pheromone-đường-mòn"
  },
  carrying: {
    title: "Vận Chuyển Hợp Tác (Coop Transport)",
    desc: "Nhiều cá thể đồng bộ nhịp độ, phân chia lực kéo-đẩy để di chuyển khối lượng lớn hơn trọng lượng cơ thể gấp nhiều lần.",
    link: "/docs/giai-cap-xa-hoi#22-bài-toán-kinh-tế-học-vi-mô-của-năng-lượng"
  },
  emerging: {
    title: "Xuất Kích (Emerging)",
    desc: "Kiến thợ non vừa nở từ kén nhộng hoặc lính thợ mới nhận lệnh, bò ra khỏi tổ để bắt đầu ca làm việc.",
    link: "/docs/vong-doi-va-tuoi-tho"
  },
  waiting_to_carry: {
    title: "Chờ Hỗ Trợ (Recruitment)",
    desc: "Phát ra tín hiệu xúc giác đứng chờ tại vị trí mồi. Nếu chờ quá 20 giây sẽ tự quay về tổ để rải thêm mùi tuyển quân.",
    link: "/docs/giai-cap-xa-hoi#21-chuỗi-lắp-ráp-sinh-học-tại-hiện-trường"
  },
  following_trail: {
    title: "Đánh Hơi (Trail Following)",
    desc: "Kiến bám theo gradient mật độ phân tử Pheromone, tự động xoay góc để tìm tuyến đường đậm mùi nhất.",
    link: "/docs/giai-cap-xa-hoi#41-tuyến-dufour-và-pheromone-đường-mòn"
  },
  attacking: {
    title: "Xẻ Thịt Vây Ráp (Swarming)",
    desc: "Khóa chặt mục tiêu sinh học lạ bằng hàm dưới và liên tục chích nọc alkaloid Solenopsin để tiêu diệt kẻ xâm nhập.",
    link: "/docs/noc-doc-va-trieu-chung#1-động-lực-học-cơ-học-của-cú-chích-nọc-biomechanics-of-the-sting"
  },
  alarmed: {
    title: "Báo Động Chiến Đấu (Alarm Response)",
    desc: "Phát hiện pheromone báo động pyrazine từ tuyến hàm dưới hoặc rung chấn của thiên địch, lập tức lao tới điểm xung đột.",
    link: "/docs/giai-cap-xa-hoi#42-tuyến-hàm-dưới-và-pheromone-báo-động"
  },
  drinking: {
    title: "Cân Bằng Thủy Phân (Hydration)",
    desc: "Di chuyển tới nguồn nước để bù lại lượng H2O thất thoát qua lớp vỏ cutin do áp suất thiếu hụt hơi nước (VPD).",
    link: "/docs/dac-diem-hinh-thai"
  },
  returning_to_eat: {
    title: "Hồi Tổ Tiếp Năng Lượng (Trophallaxis Return)",
    desc: "Dự trữ năng lượng giảm xuống ngưỡng nguy hiểm (< 40%). Kiến rút lui về tổ để nhận dịch dinh dưỡng qua cơ chế mớm mồi Trophallaxis.",
    link: "/docs/mo-hinh-to-chuc"
  },
  hiding: {
    title: "Tránh Trú Mưa Lũ (Sheltering)",
    desc: "Tạm ngừng vận chuyển khi mưa lớn xóa nhòa dấu vết Pheromone, khẩn trương rút quân về hệ thống tổ ngầm.",
    link: "/docs/vat-ly-ket-be"
  },
  hidden_inside: {
    title: "Lưu Trú Dưới Lòng Đất",
    desc: "Trú ẩn an toàn sâu bên trong các buồng điều nhiệt của tổ ngầm và phục hồi năng lượng.",
    link: "/docs/kien-truc-to-ngam"
  },
  carry_corpse: {
    title: "An Táng Đồng Loại (Necrophoresis)",
    desc: "Kiến phát hiện axit oleic tiết ra từ xác chết đồng loại. Vác thi thể đem đến Bãi Tha Ma để ngăn ngừa nấm ký sinh lây lan.",
    link: "/docs/mo-hinh-to-chuc"
  },
  dead: {
    title: "Đã Tử Vong (Deceased)",
    desc: "Cá thể đã ngừng hoạt động sinh học. Lớp vỏ bắt đầu phân hủy lipid tiết ra axit oleic thu hút kiến dọn vệ sinh.",
    link: "/docs/mo-hinh-to-chuc"
  },
  dead_starvation: {
    title: "Chết Đói Khát (Starvation / Desiccation)",
    desc: "Cạn kiệt năng lượng trao đổi chất hoặc mất nước vượt ngưỡng chịu đựng sinh lý. Xác tiết ra axit oleic chờ thu dọn.",
    link: "/docs/mo-hinh-to-chuc"
  },
  dead_old_age: {
    title: "Chết Già (Senescence)",
    desc: "Đạt giới hạn tuổi thọ sinh học tự nhiên của giai cấp kiến thợ. Các mô thần kinh và cơ vận động suy thoái hoàn toàn.",
    link: "/docs/vong-doi-va-tuoi-tho"
  },
  dead_killed: {
    title: "Tử Trận (Killed in Action)",
    desc: "Hi sinh khi chiến đấu chống lại thiên địch bảo vệ lãnh thổ của siêu sinh vật.",
    link: "/docs/mo-hinh-to-chuc"
  },
  dead_drowned: {
    title: "Tử Vong Do Đuối Nước Đại Hồng Thủy (Flood Drowning)",
    desc: "Cá thể kiếm ăn ở quá xa gò tổ khi mực nước lũ dâng nhanh, không kịp bơi về móc chân vào Bè Kiến Sống Cassie–Baxter nên bị nước tràn vào hệ thống khí quản (tracheae) gây ngạt thở.",
    link: "/docs/vat-ly-ket-be"
  },
  dead_tornado: {
    title: "Tử Vong Do Chấn Thương Lốc Xoáy (Vortex Impact Trauma)",
    desc: "Cá thể bị vòi rồng cuốn lên độ cao cực đại và quăng đập mạnh xuống nền đá/chướng ngại vật vượt quá giới hạn chịu lực của bộ khung xương ngoài Kitin.",
    link: "/docs/dac-diem-hinh-thai"
  },
  dead_heatstroke: {
    title: "Sốc Nhiệt & Khô Kiệt Biểu Bì (CT_max Thermal Paralysis)",
    desc: "Tiếp xúc quá lâu với nền đất nắng hạn cực đoan làm biến tính protein nhiệt sốc (HSP) và mất kiệt nước qua lớp sáp cutin trước khi kịp tới bóng râm hoặc hồ nước.",
    link: "/docs/dac-diem-hinh-thai"
  },
  struggling_flood: {
    title: "Chới Với Giữa Dòng Nước Lũ Dâng (Struggling in Rising Flood)",
    desc: "Cá thể đơn lẻ không đủ sức căng bề mặt để tự nổi lâu dài như bè tập thể, đang vùng vẫy bơi ngược dòng lũ về phía đỉnh Gò Tổ để bám vào rìa Bè Kiến Sống trước khi đuối sức.",
    link: "/docs/vat-ly-ket-be"
  },
  rafting: {
    title: "Kết Bè Nổi Kỵ Nước (Cassie–Baxter Rafting)",
    desc: "Các cá thể móc chặt móng vuốt (tarsal claws) và hàm dưới với nhau thành mạng lưới đàn hồi nhớt, giam giữ lớp bọt khí plastron giúp cả đàn nổi trên mặt nước lũ hàng tuần liền (Mlot et al., 2011 PNAS).",
    link: "/docs/vat-ly-ket-be"
  },
  queen_reigning: {
    title: "Trung Tâm Nội Tiết & Sinh Sản (Queen Mandibular Pheromone - QMP)",
    desc: "Kiến Chúa tiết tổ hợp pheromone hàm dưới (QMP) duy trì trật tự xã hội, ức chế buồng trứng kiến thợ và điều hòa tỷ lệ phân hóa giai cấp ấu trùng (Minor / Soldier / Major).",
    link: "/docs/mo-hinh-to-chuc"
  },
  milling: {
    title: "Cối Xay Sinh Học: Nghiền Hạt & Cắt Xé Kitin (Cutters & Millers)",
    desc: "Kiến Tướng (Major, HW ≥ 0.924 mm) dùng cơ khép hàm khổng lồ và cặp hàm cùn (edentate mandible) nghiền nát vỏ hạt cứng hoặc xác nhện thành mảnh nhỏ để Kiến Thợ vận chuyển, tối ưu bài toán kinh tế năng lượng.",
    link: "/docs/giai-cap-xa-hoi#2-cơ-sinh-học-của-thuyết-carriers-and-cutters-người-vận-chuyển-và-kẻ-cắt-xé"
  },
  royal_trophallaxis: {
    title: "Mớm Sữa Hoàng Gia & Chải Chuốt Kiến Chúa (Royal Retinue)",
    desc: "Kiến Thợ nhỏ (Minor) tinh lọc dịch dinh dưỡng và mớm trực tiếp cho Kiến Chúa, đồng thời liếm vỏ kitin của Chúa để thu nhận phân tử QMP phát tán ra toàn bộ quần thể.",
    link: "/docs/giai-cap-xa-hoi#4-mạng-lưới-giao-tiếp-hóa-học-đa-kênh"
  },
  escorting_queen: {
    title: "Đội Hình Khiên Sống Hộ Giá (Royal Phalanx Escort)",
    desc: "Kiến Lính (Soldier) và Kiến Tướng lập tức kết thành vòng tròn phòng vệ xung quanh Kiến Chúa khi Chúa di chuyển hoặc khi xuất hiện tín hiệu báo động Pyrazine.",
    link: "/docs/giai-cap-xa-hoi"
  },
  allogrooming: {
    title: "Cấp Cứu Chiến Trường & Giải Độc (Allogrooming Detox)",
    desc: "Kiến Thợ dùng dịch tiết kháng sinh từ tuyến hậu ngực (metapleural gland) và alkaloid liều thấp chải chuốt vết thương cho Kiến Lính và Kiến Tướng sau giao tranh.",
    link: "/docs/noc-doc-va-trieu-chung"
  },
  basking: {
    title: "Phơi Nắng Điều Nhiệt Đầu Giờ Sáng (Solar Basking & Brood Warming)",
    desc: "Vào buổi sáng sớm, Kiến Thợ tập trung trên sườn đón nắng của gò tổ để hấp thụ bức xạ mặt trời, nâng thân nhiệt dịch huyết (haemolymph) lên ngưỡng tối ưu 30°C và sưởi ấm cho nhộng (Porter & Tschinkel, 1987).",
    link: "/docs/kien-truc-to-ngam"
  },
  shade_seeking: {
    title: "Trú Nắng Dưới Bóng Râm (Midday Thermal Siesta & CT_max Avoidance)",
    desc: "Khi nhiệt độ mặt đất buổi trưa hoặc nắng hạn tiến gần ngưỡng tê liệt nhiệt (CT_max ≈ 43.5°C), Kiến Thợ nhỏ có tỷ lệ diện tích/thể tích lớn chủ động rút vào bóng râm dưới tán bụi cây hoặc hốc đá để giảm 70% tốc độ thoát hơi nước qua vỏ cutin.",
    link: "/docs/dac-diem-hinh-thai"
  },
  nocturnal_guard: {
    title: "Cảnh Giới Đêm & Tụ Đàn Giữ Ấm (Nocturnal Vigil & Thermoregulatory Clustering)",
    desc: "Ban đêm nhiệt độ hạ thấp làm giảm trao đổi chất biến nhiệt. Đàn kiến thu hẹp đội hình quanh miệng gò tổ và Sân Chầu Kiến Chúa để giữ ấm tập thể và lập hàng rào phòng ngự chống các loài nhện ăn đêm.",
    link: "/docs/mo-hinh-to-chuc"
  },
  wind_anchoring: {
    title: "Bám Hàm Chống Gió Bão (Anemotactic Mandibular Anchoring)",
    desc: "Cơ quan Johnston ở đốt chân râu thứ 2 phát hiện luồng gió giật mạnh. Kiến Thợ nhỏ lập tức hạ thấp trọng tâm, móc chặt vuốt chân (tarsal claws) và cắn hàm xuống nền đất để không bị gió cuốn bay.",
    link: "/docs/dac-diem-hinh-thai"
  },
  airborne_vortex: {
    title: "Bị Cuốn Vào Vòi Rồng Lốc Xoáy (Vortex Updraft & Low Terminal Velocity)",
    desc: "Áp suất tâm lốc xoáy cuốn bổng cá thể kiến lên không trung. Tuy nhiên, nhờ khối lượng cực nhỏ (1–4 mg) và bộ khung xương ngoài bằng Kitin đàn hồi cao, vận tốc rơi giới hạn của kiến rất thấp (~1.8 m/s) giúp chúng sống sót khi tiếp đất!",
    link: "/docs/dac-diem-hinh-thai"
  },
};

function resolvePhysics(pos, dirVector) {
  if (!pos || !dirVector) return;
  pos.x = Math.max(-BOUNDS, Math.min(BOUNDS, pos.x));
  pos.z = Math.max(-BOUNDS, Math.min(BOUNDS, pos.z));
  for (const obs of OBSTACLES) {
    const dx = pos.x - obs.x;
    const dz = pos.z - obs.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0 && dist < obs.r + 2) {
      const overlap = (obs.r + 2) - dist;
      const nx = dx / dist; const nz = dz / dist;
      // 1. Phản lực: Dội ngược vật thể ra ngoài tường mượt mà
      pos.x += nx * overlap; pos.z += nz * overlap;
      // 2. Chuyển vị trượt: Tính hướng tiếp tuyến dọc theo rìa vách đá và trượt đi
      const dot = dirVector.x * nx + dirVector.z * nz;
      if (dot < 0) {
        dirVector.x -= dot * nx; dirVector.z -= dot * nz;
        dirVector.normalize();
        // Bù thêm vận tốc trượt vào ngay vị trí, triệt tiêu tình trạng 'giật kinh phong' (cramp/stuck)
        pos.x += dirVector.x * overlap * 1.5;
        pos.z += dirVector.z * overlap * 1.5;
      }
    }
  }
  pos.y = 0;
}

const Scenery = React.memo(function Scenery({ windIntensity = 1.0, showShadeRings = false }) {
  const bushes = useMemo(() => [
    { x: -30, z: -50, scale: 1.1 },
    { x: 50, z: -30, scale: 0.95 },
    { x: 30, z: 60, scale: 1.2 },
    { x: -70, z: 5, scale: 1.0 },
    { x: -10, z: -70, scale: 0.9 },
    { x: 65, z: -15, scale: 1.05 },
    { x: -20, z: 65, scale: 1.15 },
  ], []);

  const grasses = useMemo(() => Array.from({ length: 140 }).map((_, idx) => {
    // Phân bố cỏ tự nhiên, chừa vùng lòng hồ (60, 40) và tâm tổ (-70, -70)
    let gx = -84 + Math.random() * 168;
    let gz = -84 + Math.random() * 168;
    if (Math.hypot(gx - 60, gz - 40) < 22) {
      gx -= 30;
    }
    if (Math.hypot(gx + 70, gz + 70) < 12) {
      gx += 16;
    }
    return {
      x: gx,
      z: gz,
      scaleY: 0.7 + (idx % 5) * 0.22,
      scaleXZ: 0.75 + (idx % 3) * 0.2,
      rotY: (idx * 1.7) % (Math.PI * 2),
      tiltX: ((idx % 5) - 2) * 0.06,
    };
  }), []);

  const pebbles = useMemo(() => Array.from({ length: 65 }).map((_, i) => {
    const angle = (i / 65) * Math.PI * 2 * 3.7;
    const isShore = i < 28;
    const r = isShore ? (19.2 + (i % 4) * 0.8) : (12 + (i * 2.3) % 75);
    const cx = isShore ? 60 : 0;
    const cz = isShore ? 40 : 0;
    return {
      x: Math.max(-84, Math.min(84, cx + Math.cos(angle) * r)),
      z: Math.max(-84, Math.min(84, cz + Math.sin(angle) * r)),
      s: isShore ? (0.45 + (i % 3) * 0.25) : (0.3 + (i % 4) * 0.18),
      rot: i * 1.1,
    };
  }), []);

  const grassMeshRef = useRef();
  const pebbleMeshRef = useRef();
  const ripple1Ref = useRef();
  const ripple2Ref = useRef();
  const grassShaderRef = useRef(null);
  const waterShaderRef = useRef(null);

  const handleGrassBeforeCompile = useCallback((shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWind = { value: 1.0 };
    grassShaderRef.current = shader;
    shader.vertexShader = `uniform float uTime;\nuniform float uWind;\n` + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float tipFactor = clamp((position.y + 1.1) / 2.2, 0.0, 1.0);
      float worldPhase = instanceMatrix[3][0] * 0.18 + instanceMatrix[3][2] * 0.18;
      transformed.x += (sin(uTime * 2.6 * uWind + worldPhase) * 0.26 * uWind + (uWind - 1.0) * 0.35) * tipFactor;
      transformed.z += cos(uTime * 2.1 * uWind + worldPhase * 0.85) * 0.18 * uWind * tipFactor;`
    );
  }, []);

  const handleWaterBeforeCompile = useCallback((shader) => {
    shader.uniforms.uTime = { value: 0 };
    waterShaderRef.current = shader;
    shader.vertexShader = `varying vec2 vWaterUv;\n` + shader.vertexShader.replace(
      '#include <uv_vertex>',
      `#include <uv_vertex>\nvWaterUv = position.xy;`
    );
    shader.fragmentShader = `uniform float uTime;\nvarying vec2 vWaterUv;\n` + shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `float dist = length(vWaterUv);
      float caustic = sin(dist * 1.35 - uTime * 2.8) * 0.5 + 0.5;
      float shimmer = sin(vWaterUv.x * 0.9 + uTime * 1.7) * cos(vWaterUv.y * 0.9 - uTime * 1.4);
      gl_FragColor.rgb += vec3(0.06, 0.16, 0.22) * pow(caustic, 3.0) + vec3(0.03, 0.07, 0.1) * shimmer;
      #include <dithering_fragment>`
    );
  }, []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    if (grassMeshRef.current) {
      grasses.forEach((g, i) => {
        dummy.position.set(g.x, g.scaleY * 0.9, g.z);
        dummy.rotation.set(g.tiltX, g.rotY, 0);
        dummy.scale.set(g.scaleXZ, g.scaleY, g.scaleXZ);
        dummy.updateMatrix();
        grassMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      grassMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (pebbleMeshRef.current) {
      pebbles.forEach((p, i) => {
        dummy.position.set(p.x, p.s * 0.35, p.z);
        dummy.rotation.set(p.rot, p.rot * 0.7, 0);
        dummy.scale.set(p.s * 1.3, p.s * 0.65, p.s);
        dummy.updateMatrix();
        pebbleMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      pebbleMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [grasses, pebbles]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (grassShaderRef.current) {
      grassShaderRef.current.uniforms.uTime.value = t;
      grassShaderRef.current.uniforms.uWind.value = windIntensity;
    }
    if (waterShaderRef.current) {
      waterShaderRef.current.uniforms.uTime.value = t;
    }
    if (ripple1Ref.current) {
      const p1 = (t * 0.35 * windIntensity) % 1;
      const s1 = 0.25 + p1 * 0.72;
      ripple1Ref.current.scale.set(s1, s1, 1);
      ripple1Ref.current.material.opacity = (1 - p1) * 0.38;
    }
    if (ripple2Ref.current) {
      const p2 = ((t * 0.35 * windIntensity) + 0.5) % 1;
      const s2 = 0.25 + p2 * 0.72;
      ripple2Ref.current.scale.set(s2, s2, 1);
      ripple2Ref.current.material.opacity = (1 - p2) * 0.38;
    }
  });

  return (
    <group>
      {/* ─── HỒ NƯỚC SINH THÁI (Bờ cát, đá cuội, gợn sóng động & lá súng) ─── */}
      <group position={[60, 0, 40]}>
        {/* Bờ cát ẩm ven hồ */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[22.2, 36]} />
          <meshStandardMaterial color="#a1887f" roughness={0.95} />
        </mesh>
        {/* Lòng hồ sâu */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[20.2, 36]} />
          <meshStandardMaterial color="#0369a1" roughness={0.25} metalness={0.3} />
        </mesh>
        {/* Mặt nước phản chiếu với gợn sóng Caustics bằng GPU Fragment Shader */}
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[19.6, 36]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.18} roughness={0.08} metalness={0.65} transparent opacity={0.86} onBeforeCompile={handleWaterBeforeCompile} />
        </mesh>
        {/* Gợn sóng nước lan tỏa */}
        <mesh ref={ripple1Ref} position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[17.5, 18.3, 32]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh ref={ripple2Ref} position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[17.5, 18.3, 32]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        {/* Cụm lá súng & hoa sen trên mặt hồ */}
        {[[-6, -4, 1.8], [-3.5, -6.5, 1.3], [7, 5, 2.0], [9.5, 2.5, 1.4], [-8, 7, 1.6]].map(([lx, lz, lr], idx) => (
          <group key={idx} position={[lx, 0.12, lz]}>
            <mesh rotation={[-Math.PI / 2, 0, idx * 1.2]}>
              <circleGeometry args={[lr, 14, 0, Math.PI * 1.85]} />
              <meshStandardMaterial color="#15803d" roughness={0.6} />
            </mesh>
            {idx % 2 === 0 && (
              <mesh position={[0, 0.25, 0]}>
                <dodecahedronGeometry args={[0.45, 0]} />
                <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.2} roughness={0.4} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* ─── CỤM TẢNG ĐÁ CỔ THỤ PHỦ RÊU ─── */}
      <group position={[-40, 0, -40]}>
        <mesh position={[0, 3.2, 0]} rotation={[0.2, 0.4, 0.1]} castShadow>
          <dodecahedronGeometry args={[8, 1]} />
          <meshStandardMaterial color="#64748b" roughness={0.88} />
        </mesh>
        <mesh position={[0, 6.2, 0]} scale={[0.85, 0.45, 0.85]}>
          <dodecahedronGeometry args={[6.5, 1]} />
          <meshStandardMaterial color="#3f6212" roughness={0.95} />
        </mesh>
        <mesh position={[5.5, 1.4, 3.5]} rotation={[0.5, 0.2, 0]} castShadow>
          <dodecahedronGeometry args={[3.2, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
      </group>

      <group position={[-60, 0, 30]}>
        <mesh position={[0, 2.4, 0]} rotation={[0.4, 0.2, 0]} castShadow>
          <dodecahedronGeometry args={[6, 1]} />
          <meshStandardMaterial color="#78716c" roughness={0.85} />
        </mesh>
        <mesh position={[0, 4.7, 0]} scale={[0.8, 0.4, 0.8]}>
          <dodecahedronGeometry args={[4.8, 1]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.95} />
        </mesh>
        <mesh position={[-4.2, 1.1, 2.8]} castShadow>
          <dodecahedronGeometry args={[2.5, 0]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
      </group>

      <group position={[20, 0, -50]}>
        <mesh position={[0, 4.0, 0]} rotation={[0.1, 0.5, 0.2]} castShadow>
          <dodecahedronGeometry args={[10, 1]} />
          <meshStandardMaterial color="#6b7280" roughness={0.9} />
        </mesh>
        <mesh position={[0, 7.8, 0]} scale={[0.82, 0.42, 0.82]}>
          <dodecahedronGeometry args={[8.2, 1]} />
          <meshStandardMaterial color="#365314" roughness={0.95} />
        </mesh>
        <mesh position={[-6.8, 1.8, 4.5]} rotation={[0.3, 0.8, 0.2]} castShadow>
          <dodecahedronGeometry args={[4.0, 0]} />
          <meshStandardMaterial color="#4b5563" roughness={0.9} />
        </mesh>
      </group>

      {/* ─── KHÚC GỖ MỤC RỖNG RUỘT & NẤM RỪNG ─── */}
      <group position={[0, 3.6, 30]}>
        <mesh rotation={[0, 0.18, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[4.2, 4.6, 22, 14]} />
          <meshStandardMaterial color="#4a2c18" roughness={0.95} />
        </mesh>
        <mesh rotation={[0, 0.18, Math.PI / 2]} scale={[0.82, 1.01, 0.82]}>
          <cylinderGeometry args={[4.2, 4.6, 22, 12]} />
          <meshStandardMaterial color="#a16207" roughness={0.85} />
        </mesh>
        {/* Rêu xanh trên lưng gỗ mục */}
        <mesh position={[0, 3.6, 0]} rotation={[0, 0.18, 0]} scale={[2.8, 0.4, 0.9]}>
          <sphereGeometry args={[3.2, 8, 6]} />
          <meshStandardMaterial color="#3f6212" roughness={0.95} />
        </mesh>
        {/* Cụm nấm rừng phát sáng nhẹ bên sườn khúc gỗ */}
        {[[-5, 1.2, 4.2], [-3.8, 0.5, 4.4], [4.5, 1.0, -4.0]].map(([mx, my, mz], i) => (
          <group key={i} position={[mx, my - 2.0, mz]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.15, 0.22, 0.8, 6]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color="#ea580c" emissive="#9a3412" emissiveIntensity={0.25} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── CỤM BỤI CÂY NHIỆT ĐỚI ĐA TẦNG & VÙNG BÓNG RÂM TRÚ NẮNG TRƯA ─── */}
      {bushes.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]} scale={[b.scale, b.scale, b.scale]}>
          {showShadeRings && (
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[5.2, 24]} />
              <meshBasicMaterial color="#0d9488" transparent opacity={0.28} depthWrite={false} />
            </mesh>
          )}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.45, 0.7, 1.8, 6]} />
            <meshStandardMaterial color="#5c4033" roughness={0.95} />
          </mesh>
          <mesh position={[0, 2.3, 0]} castShadow>
            <dodecahedronGeometry args={[3.2, 1]} />
            <meshStandardMaterial color="#15803d" roughness={0.82} />
          </mesh>
          <mesh position={[2.1, 1.7, 1.1]} castShadow>
            <dodecahedronGeometry args={[2.4, 1]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
          <mesh position={[-1.8, 1.6, 1.3]} castShadow>
            <dodecahedronGeometry args={[2.1, 1]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
          {/* Hoa rừng điểm xuyết trên tán cây */}
          <mesh position={[0.8, 4.6, 0.6]}>
            <dodecahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#facc15' : '#fb7185'} emissive={i % 2 === 0 ? '#ca8a04' : '#e11d48'} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {/* ─── 140 NHÁNH CỎ ĐUNG ĐƯA TRƯỚC GIÓ BẰNG GPU VERTEX SHADER & 65 SỎI CUỘI (Chỉ 2 Instanced Draw Calls!) ─── */}
      <instancedMesh ref={grassMeshRef} args={[null, null, grasses.length]} frustumCulled={false}>
        <coneGeometry args={[0.48, 2.2, 4]} />
        <meshStandardMaterial color="#22c55e" roughness={0.85} onBeforeCompile={handleGrassBeforeCompile} />
      </instancedMesh>
      <instancedMesh ref={pebbleMeshRef} args={[null, null, pebbles.length]} frustumCulled={false}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </instancedMesh>
    </group>
  );
});

function randomWanderDir() {
  const angle = Math.random() * Math.PI * 2;
  return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
}

function randomWanderTime() {
  return WANDER_CHANGE_MIN + Math.random() * (WANDER_CHANGE_MAX - WANDER_CHANGE_MIN);
}

function reflectIfOOB(pos, dir) {
  if (Math.abs(pos.x) > BOUNDS - 5 || Math.abs(pos.z) > BOUNDS - 5) {
    const toCenter = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
    if (dir.dot(toCenter) < 0) { // Chống giật: Chỉ bẻ lái nếu đang thật sự đâm đầu ra ngoài
      dir.copy(toCenter);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 1.2);
      dir.normalize();
    }
  }
}

const Ground = React.memo(function Ground({ onClick, isXRayMode }) {
  // Tạo Procedural Terrain Texture 1 lần duy nhất trên GPU (thảm cỏ nhiệt đới, đất đỏ quanh tổ, bờ cát ven hồ, đất sẫm nghĩa địa)
  const groundTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Nền thảm cỏ rừng nhiệt đới
    const baseGrad = ctx.createRadialGradient(256, 256, 30, 256, 256, 360);
    baseGrad.addColorStop(0, '#2e6f34');
    baseGrad.addColorStop(0.65, '#255c2b');
    baseGrad.addColorStop(1, '#1b4520');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Các mảng cỏ sáng tối & mùn hữu cơ tự nhiên
    for (let i = 0; i < 450; i++) {
      const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * 512;
      const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * 512;
      const r = 6 + (i % 18);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(74, 140, 60, 0.16)' : i % 3 === 1 ? 'rgba(28, 68, 28, 0.18)' : 'rgba(92, 64, 40, 0.10)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vùng đất đỏ bazan mới đào quanh Tổ Kiến (-70, -70) -> pixel (~77, ~77)
    const nestX = ((NEST_POS.x + 100) / 200) * 512;
    const nestY = ((NEST_POS.z + 100) / 200) * 512;
    const nestGrad = ctx.createRadialGradient(nestX, nestY, 6, nestX, nestY, 68);
    nestGrad.addColorStop(0, 'rgba(124, 58, 26, 0.92)');
    nestGrad.addColorStop(0.5, 'rgba(105, 52, 24, 0.55)');
    nestGrad.addColorStop(1, 'rgba(105, 52, 24, 0)');
    ctx.fillStyle = nestGrad;
    ctx.beginPath();
    ctx.arc(nestX, nestY, 68, 0, Math.PI * 2);
    ctx.fill();

    // Vùng đất ẩm ven Hồ Nước (60, 40)
    const lakeX = ((60 + 100) / 200) * 512;
    const lakeY = ((40 + 100) / 200) * 512;
    const lakeGrad = ctx.createRadialGradient(lakeX, lakeY, 35, lakeX, lakeY, 85);
    lakeGrad.addColorStop(0, 'rgba(140, 118, 98, 0.75)');
    lakeGrad.addColorStop(0.6, 'rgba(62, 105, 65, 0.35)');
    lakeGrad.addColorStop(1, 'rgba(62, 105, 65, 0)');
    ctx.fillStyle = lakeGrad;
    ctx.beginPath();
    ctx.arc(lakeX, lakeY, 85, 0, Math.PI * 2);
    ctx.fill();

    // Vùng đất khô sẫm quanh Bãi Tha Ma (80, -80)
    const graveX = ((GRAVEYARD_POS.x + 100) / 200) * 512;
    const graveY = ((GRAVEYARD_POS.z + 100) / 200) * 512;
    const graveGrad = ctx.createRadialGradient(graveX, graveY, 8, graveX, graveY, 55);
    graveGrad.addColorStop(0, 'rgba(58, 42, 29, 0.85)');
    graveGrad.addColorStop(1, 'rgba(58, 42, 29, 0)');
    ctx.fillStyle = graveGrad;
    ctx.beginPath();
    ctx.arc(graveX, graveY, 55, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          map={groundTexture}
          color={groundTexture ? '#ffffff' : '#2e6f34'}
          roughness={0.95}
          transparent={Boolean(isXRayMode)}
          opacity={isXRayMode ? 0.38 : 1.0}
          depthWrite={!isXRayMode}
        />
      </mesh>
      {/* Viền khung gỗ/đất bao quanh đúng mép ngoài của sa bàn sinh thái 200x200 (100 * sqrt(2) = 141.42) */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.02, 0]}>
        <ringGeometry args={[141.42, 146.5, 4]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>
    </group>
  );
});

/* ─────────────────── MULTI-PHEROMONE INSTANCED VISUALIZER ─────────────────── */
const COLOR_PHERO_TRAIL = new THREE.Color('#4ade80');      // Z,E-α-farnesene (Mùi dẫn đường trinh sát - Xanh ngọc)
const COLOR_PHERO_REINFORCED = new THREE.Color('#a3e635'); // Đường mòn tự xúc tác nồng độ cao (Xanh vàng phát sáng)
const COLOR_PHERO_ALARM = new THREE.Color('#fb7185');      // 2-ethyl-3,6-dimethylpyrazine (Mùi báo động chiến đấu - Đỏ hồng)

const PheroVisualizer = React.memo(({ pheromonesRef }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameTick = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    // Cập nhật ma trận & màu sắc đa tầng Pheromone ở tần suất 20 FPS (mỗi 3 frame)
    frameTick.current++;
    if (frameTick.current % 3 !== 0) return;

    const items = pheromonesRef.current;
    meshRef.current.count = items.length;
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      dummy.position.set(p.pos.x, 0.1, p.pos.z);
      dummy.rotation.x = -Math.PI / 2;
      const scale = Math.max(0.18, Math.min(1.65, p.strength * 0.72));
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(
        i,
        p.type === 'alarm'
          ? COLOR_PHERO_ALARM
          : p.type === 'reinforced'
            ? COLOR_PHERO_REINFORCED
            : COLOR_PHERO_TRAIL
      );
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, 1500]} frustumCulled={false}>
      <circleGeometry args={[0.75, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
});

/* ─────────────────── HỆ THỐNG MƯA RÀO NHIỆT ĐỚI 100% GPU VERTEX SHADER ─────────────────── */
const Rain = React.memo(function Rain() {
  const COUNT = 600;
  const meshRef = useRef();
  const rainShaderRef = useRef(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 200,
        Math.random() * 90,
        (Math.random() - 0.5) * 200
      );
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const handleRainBeforeCompile = useCallback((shader) => {
    shader.uniforms.uTime = { value: 0 };
    rainShaderRef.current = shader;
    shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float dropSeed = fract(sin(instanceMatrix[3][0] * 12.9898 + instanceMatrix[3][2] * 78.233) * 43758.5453);
      float dropSpeed = 62.0 + dropSeed * 36.0;
      float currentY = mod(instanceMatrix[3][1] - uTime * dropSpeed, 90.0);
      transformed.y += (currentY - instanceMatrix[3][1]);`
    );
  }, []);

  useFrame((state) => {
    if (rainShaderRef.current) {
      rainShaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <capsuleGeometry args={[0.04, 0.65, 2, 4]} />
      <meshBasicMaterial color="#bae6fd" transparent opacity={0.55} onBeforeCompile={handleRainBeforeCompile} />
    </instancedMesh>
  );
});

const NestMarker = React.memo(function NestMarker() {
  return (
    <group position={[NEST_POS.x, 0, NEST_POS.z]}>
      {/* Thảm đất tơi xốp đào từ buồng ngầm */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10.5, 24]} />
        <meshStandardMaterial color="#6d3b1e" roughness={1} />
      </mesh>
      {/* Tầng đế gò kiến lửa S. geminata */}
      <Cylinder args={[4.2, 7.8, 1.8, 18]} position={[0, 0.9, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.95} />
      </Cylinder>
      {/* Tầng giữa gò đất */}
      <Cylinder args={[2.4, 4.4, 1.5, 16]} position={[0, 2.2, 0]} castShadow>
        <meshStandardMaterial color="#A0522D" roughness={0.9} />
      </Cylinder>
      {/* Vành miệng núi lửa của tổ */}
      <Cylinder args={[1.4, 2.5, 0.7, 14]} position={[0, 3.1, 0]}>
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </Cylinder>
      {/* Lỗ thông chính dẫn xuống buồng ngầm */}
      <Cylinder args={[1.05, 0.8, 0.4, 12]} position={[0, 3.32, 0]}>
        <meshBasicMaterial color="#0f0702" />
      </Cylinder>
      {/* Các ụ thông khí vệ tinh xung quanh tổ chính */}
      {[[-4.5, 2.2, 1.4], [4.2, -2.5, 1.2], [2.5, 4.5, 1.1], [-3.2, -4.0, 1.3]].map(([sx, sz, sr], idx) => (
        <group key={idx} position={[sx, 0, sz]}>
          <Cylinder args={[sr * 0.45, sr, sr * 0.8, 10]} position={[0, sr * 0.4, 0]}>
            <meshStandardMaterial color="#92400e" roughness={0.95} />
          </Cylinder>
          <Cylinder args={[sr * 0.25, sr * 0.25, 0.2, 8]} position={[0, sr * 0.78, 0]}>
            <meshBasicMaterial color="#140a04" />
          </Cylinder>
        </group>
      ))}
      <Html position={[0, 6.2, 0]} center zIndexRange={[10, 0]}>
        <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap', textShadow: '0 0 6px black', background: 'rgba(69, 26, 3, 0.75)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.5)', pointerEvents: 'none' }}>
          🏠 Tổ Chính (Solenopsis Mound)
        </div>
      </Html>
    </group>
  );
});

const GraveyardMarker = React.memo(function GraveyardMarker() {
  return (
    <group position={[GRAVEYARD_POS.x, 0, GRAVEYARD_POS.z]}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 20]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      {/* Bia đá cổ rêu phong */}
      <group position={[0, 0, -4]} rotation={[0.05, -0.15, 0.04]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[3.8, 3.6, 1.1]} />
          <meshStandardMaterial color="#64748b" roughness={0.92} />
        </mesh>
        <mesh position={[0, 3.6, 0]}>
          <cylinderGeometry args={[1.9, 1.9, 1.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.92} />
        </mesh>
      </group>
      {/* Các cọc gỗ ranh giới bãi tha ma */}
      {[[-6, -5], [6, -5], [-6, 5], [6, 5]].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 1.0, pz]} rotation={[0.08 * (idx % 2 ? 1 : -1), 0, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 2.0, 6]} />
          <meshStandardMaterial color="#4a2c18" roughness={0.95} />
        </mesh>
      ))}
      <Html position={[0, 5.5, 0]} center zIndexRange={[10, 0]}>
        <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap', textShadow: '0 0 4px black', background: 'rgba(15, 23, 42, 0.75)', padding: '2px 7px', borderRadius: '5px', border: '1px solid rgba(148, 163, 184, 0.4)', pointerEvents: 'none' }}>
          🪦 Bãi Tha Ma (Necrophoresis)
        </div>
      </Html>
    </group>
  );
});

/* ─────────────────── FEATURE 1: SUBTERRANEAN NEST X-RAY (SOI LÒNG TỔ NGẦM 3D) ─────────────────── */
const SubterraneanNestXRay = React.memo(function SubterraneanNestXRay({ modelUrl, visible }) {
  const queenDirRef = useRef(new THREE.Vector3(0.7, 0, 0.7).normalize());
  const pulseRef = useRef();

  useFrame((state) => {
    if (!visible) return;
    const t = state.clock.elapsedTime;
    queenDirRef.current.set(Math.cos(t * 0.35), 0, Math.sin(t * 0.35)).normalize();
    if (pulseRef.current) {
      const s = 1.0 + Math.sin(t * 2.5) * 0.08;
      pulseRef.current.scale.set(s, 1, s);
    }
  });

  if (!visible) return null;

  return (
    <group position={[NEST_POS.x, 0, NEST_POS.z]}>
      {/* Vòng cắt địa chất hiển thị mặt cắt X-Ray trên bề mặt tổ */}
      <mesh ref={pulseRef} position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12.5, 13.8, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Trục giao thông đứng chính (Vertical Main Shaft) nối miệng gò xuống Buồng Kiến Chúa */}
      <mesh position={[0, -5.8, 0]}>
        <cylinderGeometry args={[1.35, 1.65, 11.6, 14]} />
        <meshStandardMaterial color="#78350f" emissive="#451a03" emissiveIntensity={0.5} transparent opacity={0.65} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Đường hầm nhánh sang Buồng Ấu Trùng & Nhộng */}
      <mesh position={[5.2, -5.5, 3.2]} rotation={[0.3, -0.5, 1.15]}>
        <cylinderGeometry args={[0.95, 1.05, 11.0, 10]} />
        <meshStandardMaterial color="#92400e" emissive="#451a03" emissiveIntensity={0.4} transparent opacity={0.65} />
      </mesh>

      {/* Đường hầm nhánh sang Kho Dự Trữ Hạt Giống & Đường */}
      <mesh position={[-4.8, -6.2, 3.4]} rotation={[0.35, 0.55, -1.1]}>
        <cylinderGeometry args={[0.95, 1.05, 10.5, 10]} />
        <meshStandardMaterial color="#92400e" emissive="#451a03" emissiveIntensity={0.4} transparent opacity={0.65} />
      </mesh>

      {/* 1. BUỒNG KIẾN CHÚA TRUNG TÂM (ROYAL QUEEN CHAMBER: y = -11.5) */}
      <group position={[0, -11.5, 0]}>
        <pointLight color="#f59e0b" intensity={3.5} distance={24} />
        <mesh scale={[1.35, 0.65, 1.25]}>
          <sphereGeometry args={[6.2, 20, 16]} />
          <meshStandardMaterial color="#451a03" emissive="#b45309" emissiveIntensity={0.35} transparent opacity={0.58} side={THREE.DoubleSide} />
        </mesh>
        {/* Nền sỏi ẩm buồng kiến chúa (Kiến Chúa thực tế #0 sẽ ngự tại đây khi bật chế độ X-Ray) */}
        <mesh position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[6.8, 24]} />
          <meshStandardMaterial color="#78350f" emissive="#92400e" emissiveIntensity={0.25} roughness={0.9} />
        </mesh>
        {/* Cụm trứng kiến trắng ngọc trai (Egg Clusters) */}
        {[[-2.6, -2.9, 1.8], [-2.1, -2.9, 2.4], [-3.0, -2.9, 2.2], [2.5, -2.9, -1.6], [2.9, -2.9, -2.1], [2.1, -2.9, -2.3]].map(([ex, ey, ez], idx) => (
          <mesh key={idx} position={[ex, ey, ez]} scale={[1.2, 0.85, 0.85]}>
            <sphereGeometry args={[0.48, 10, 8]} />
            <meshStandardMaterial color="#fefce8" emissive="#fde047" emissiveIntensity={0.35} roughness={0.2} />
          </mesh>
        ))}
        <Html position={[0, 2.2, 0]} center zIndexRange={[10, 0]}>
          <div className="bg-amber-950/90 border border-amber-400/80 text-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none">
            👑 Buồng Kiến Chúa (-11.5m quy đổi · 82% dân số ngầm)
          </div>
        </Html>
      </group>

      {/* 2. BUỒNG ẤU TRÙNG & NHỘNG ĐIỀU NHIỆT (BROOD CHAMBER: [9.5, -6.5, 5.8]) */}
      <group position={[9.5, -6.5, 5.8]}>
        <mesh scale={[1.2, 0.6, 1.1]}>
          <sphereGeometry args={[4.4, 16, 12]} />
          <meshStandardMaterial color="#3f2305" emissive="#0284c7" emissiveIntensity={0.25} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        {[[-1.4, -1.6, 0.5], [-0.4, -1.6, 1.1], [0.8, -1.6, 0.6], [1.4, -1.6, -0.5], [-0.8, -1.6, -0.9], [0.3, -1.6, -1.2]].map(([bx, by, bz], idx) => (
          <mesh key={idx} position={[bx, by, bz]} rotation={[Math.PI / 2, 0, idx * 0.9]}>
            <capsuleGeometry args={[0.35, 0.65, 4, 8]} />
            <meshStandardMaterial color="#f0fdf4" emissive="#38bdf8" emissiveIntensity={0.3} roughness={0.3} />
          </mesh>
        ))}
        <Html position={[0, 1.8, 0]} center zIndexRange={[10, 0]}>
          <div className="bg-sky-950/90 border border-sky-400/80 text-sky-200 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none">
            🥚 Buồng Ấu Trùng & Nhộng (Điều nhiệt 28–32°C)
          </div>
        </Html>
      </group>

      {/* 3. KHO LƯƠNG THỰC NGẦM (GRANARY CHAMBER: [-9.2, -7.2, 6.2]) */}
      <group position={[-9.2, -7.2, 6.2]}>
        <mesh scale={[1.2, 0.6, 1.1]}>
          <sphereGeometry args={[4.4, 16, 12]} />
          <meshStandardMaterial color="#3f2305" emissive="#16a34a" emissiveIntensity={0.25} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        {[[-1.5, -1.5, 0.4], [-0.3, -1.4, 0.9], [0.9, -1.5, 0.5], [1.2, -1.5, -0.7], [-0.7, -1.5, -0.8]].map(([gx, gy, gz], idx) => (
          <mesh key={idx} geometry={SUGAR_CRYSTAL_GEO} material={SUGAR_MAIN_MAT} position={[gx, gy, gz]} scale={[0.65, 0.65, 0.65]} rotation={[idx, idx * 0.5, 0]} />
        ))}
        <Html position={[0, 1.8, 0]} center zIndexRange={[10, 0]}>
          <div className="bg-emerald-950/90 border border-emerald-400/80 text-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none">
            🌾 Kho Lương Thực & Hạt Giống Ngầm
          </div>
        </Html>
      </group>
    </group>
  );
});

/* ─────────────────── FEATURE 2: GPU CHEMICAL HEATMAP OVERLAY (BẢN ĐỒ NHIỆT PHEROMONE 18x18 BILINEAR) ─────────────────── */
const PheroHeatmapOverlay = React.memo(function PheroHeatmapOverlay({ visible }) {
  const frameCountRef = useRef(0);

  const { heatmapTex, dataArr } = useMemo(() => {
    const arr = new Uint8Array(GRID_DIM * GRID_DIM * 4);
    const tex = new THREE.DataTexture(arr, GRID_DIM, GRID_DIM, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return { heatmapTex: tex, dataArr: arr };
  }, []);

  useFrame(() => {
    if (!visible) return;
    frameCountRef.current++;
    if (frameCountRef.current % 4 !== 0) return;

    for (let c = 0; c < GRID_TOTAL_CELLS; c++) {
      const cell = _pheroGrid[c];
      let trailSum = 0;
      let reinfSum = 0;
      let alarmSum = 0;
      for (let i = 0, len = cell.length; i < len; i++) {
        const p = cell[i];
        if (p.type === 'alarm') alarmSum += p.strength;
        else if (p.type === 'reinforced') reinfSum += p.strength;
        else trailSum += p.strength;
      }
      const total = trailSum + reinfSum * 1.35 + alarmSum * 1.6;
      const idx = c * 4;
      if (total < 0.05) {
        dataArr[idx] = 0;
        dataArr[idx + 1] = 0;
        dataArr[idx + 2] = 0;
        dataArr[idx + 3] = 0;
      } else {
        const r = Math.min(255, Math.round(alarmSum * 180 + reinfSum * 110 + trailSum * 25));
        const g = Math.min(255, Math.round(reinfSum * 165 + trailSum * 150 + alarmSum * 20));
        const b = Math.min(255, Math.round(trailSum * 75 + alarmSum * 55));
        const a = Math.min(210, Math.round(Math.min(1.0, total / 3.2) * 200));
        dataArr[idx] = r;
        dataArr[idx + 1] = g;
        dataArr[idx + 2] = b;
        dataArr[idx + 3] = a;
      }
    }
    heatmapTex.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} scale={[1, -1, 1]}>
      <planeGeometry args={[216, 216]} />
      <meshBasicMaterial map={heatmapTex} transparent opacity={0.82} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
});

/* ─────────────────── FEATURE 4: FLOOD WATER & FIRE ANT RAFTING (MẶT NƯỚC LŨ DÂNG TỪ TỪ TẠI ĐỈNH GÒ TỔ & BÈ KIẾN SỐNG) ─────────────────── */
const RAFT_CENTER = new THREE.Vector3(NEST_POS.x + 3.5, 2.8, NEST_POS.z + 3.5);

const FloodWaterOverlay = React.memo(function FloodWaterOverlay({ visible, floodLevelRef }) {
  const groupRef = useRef();
  const waterMeshRef = useRef();
  const raftRingRef = useRef();

  useFrame((state) => {
    const level = floodLevelRef?.current || 0;
    if (!groupRef.current) return;
    if (level <= 0.02) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    const t = state.clock.elapsedTime;
    const waveAmp = Math.min(0.22, level * 0.08);
    const waveY = level + Math.sin(t * 2.0) * waveAmp;
    if (waterMeshRef.current) {
      waterMeshRef.current.position.y = waveY;
      waterMeshRef.current.material.opacity = Math.min(0.64, 0.18 + (level / 2.8) * 0.46);
    }
    if (raftRingRef.current) {
      raftRingRef.current.visible = level >= 0.75;
      raftRingRef.current.position.y = waveY + 0.08;
      const pulse = 1.0 + Math.sin(t * 3.2) * 0.06;
      raftRingRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Mặt nước lũ dâng dần từ mặt đất (0m -> 2.8m) và rút dần sau lũ */}
      <mesh ref={waterMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.28}
          roughness={0.12}
          metalness={0.55}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {/* Vòng bọt khí kỵ nước Plastron bao quanh Bè Kiến Sống ngay tại Đỉnh Gò Tổ */}
      <group position={[RAFT_CENTER.x, 0, RAFT_CENTER.z]}>
        <mesh ref={raftRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]} visible={false}>
          <ringGeometry args={[6.8, 8.6, 36]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.65} depthWrite={false} />
        </mesh>
        {visible && (
          <Html position={[0, 6.2, 0]} center zIndexRange={[10, 0]}>
            <div className="bg-cyan-950/90 border border-cyan-400/80 text-cyan-100 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow-xl pointer-events-none">
              🛟 Bè Kiến Sống Kỵ Nước Tại Đỉnh Tổ (Cassie–Baxter Hydrophobic Raft)
            </div>
          </Html>
        )}
      </group>
    </group>
  );
});

/* ─────────────────── FEATURE 8: CELESTIAL SKY & NOCTURNAL FIREFLIES (MẶT TRỜI 4 BUỔI, MẶT TRĂNG & ĐOM ĐÓM RỪNG GPU) ─────────────────── */
const CelestialSkyOverlay = React.memo(function CelestialSkyOverlay({ timeOfDay = 'morning', weatherMode = 'clear' }) {
  const FIREFLY_COUNT = 45;
  const fireflyMeshRef = useRef();
  const fireflyShaderRef = useRef(null);
  const haloRef = useRef();

  const profile = CIRCADIAN_PROFILES[timeOfDay] || CIRCADIAN_PROFILES.morning;
  const isNight = timeOfDay === 'night';

  useEffect(() => {
    if (!fireflyMeshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 165,
        1.4 + Math.random() * 7.5,
        (Math.random() - 0.5) * 165
      );
      const s = 0.65 + (i % 4) * 0.25;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      fireflyMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    fireflyMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const handleFireflyBeforeCompile = useCallback((shader) => {
    shader.uniforms.uTime = { value: 0 };
    fireflyShaderRef.current = shader;
    shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float seed = instanceMatrix[3][0] * 0.13 + instanceMatrix[3][2] * 0.19;
      transformed.x += sin(uTime * 1.4 + seed * 6.28) * 2.8;
      transformed.y += cos(uTime * 2.1 + seed * 4.5) * 1.1;
      transformed.z += cos(uTime * 1.2 + seed * 5.1) * 2.8;`
    );
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (fireflyShaderRef.current) {
      fireflyShaderRef.current.uniforms.uTime.value = t;
    }
    if (haloRef.current) {
      const pulse = 1.0 + Math.sin(t * 2.2) * 0.08;
      haloRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const celestialColor = isNight
    ? '#e0e7ff'
    : weatherMode === 'heatwave'
      ? '#ef4444'
      : timeOfDay === 'noon'
        ? '#fef9c3'
        : timeOfDay === 'afternoon'
          ? '#fb923c'
          : '#fde047';

  const haloColor = isNight
    ? '#818cf8'
    : weatherMode === 'heatwave'
      ? '#f97316'
      : timeOfDay === 'afternoon'
        ? '#ea580c'
        : '#facc15';

  return (
    <group>
      {/* Thiên thể Mặt Trời / Mặt Trăng 3D trên bầu trời */}
      <group position={profile.sunPos}>
        <mesh>
          <sphereGeometry args={[isNight ? 4.2 : 5.6, 20, 20]} />
          <meshBasicMaterial color={celestialColor} />
        </mesh>
        <mesh ref={haloRef}>
          <sphereGeometry args={[isNight ? 6.5 : 9.2, 20, 20]} />
          <meshBasicMaterial color={haloColor} transparent opacity={weatherMode === 'rain' ? 0.12 : 0.28} depthWrite={false} />
        </mesh>
      </group>

      {/* Đàn Đom Đóm Rừng phát quang sinh học vào Ban Đêm (Chỉ 1 GPU Instanced Draw Call) */}
      <instancedMesh
        ref={fireflyMeshRef}
        args={[null, null, FIREFLY_COUNT]}
        visible={isNight && weatherMode !== 'rain' && weatherMode !== 'tornado'}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.24, 6, 6]} />
        <meshBasicMaterial color="#bef264" transparent opacity={0.88} onBeforeCompile={handleFireflyBeforeCompile} />
      </instancedMesh>
    </group>
  );
});

/* ─────────────────── FEATURE 9: GPU WINDSTORM STREAKS & FLYING DUST (BÃO GIÓ MÙA & BỤI CÁT GPU) ─────────────────── */
const WindstormOverlay = React.memo(function WindstormOverlay({ visible }) {
  const COUNT = 160;
  const meshRef = useRef();
  const windShaderRef = useRef(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 200,
        0.8 + Math.random() * 24,
        (Math.random() - 0.5) * 200
      );
      dummy.rotation.set(0, 0, Math.PI / 2 - 0.12);
      dummy.scale.set(1, 1 + (i % 3) * 0.6, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const handleWindBeforeCompile = useCallback((shader) => {
    shader.uniforms.uTime = { value: 0 };
    windShaderRef.current = shader;
    shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float seed = fract(sin(instanceMatrix[3][1] * 19.19 + instanceMatrix[3][2] * 47.77) * 43758.5453);
      float speed = 55.0 + seed * 42.0;
      float curX = mod(instanceMatrix[3][0] + 100.0 + uTime * speed, 200.0) - 100.0;
      transformed.y += (curX - instanceMatrix[3][0]);`
    );
  }, []);

  useFrame((state) => {
    if (windShaderRef.current && visible) {
      windShaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!visible) return null;

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <capsuleGeometry args={[0.04, 2.4, 2, 4]} />
      <meshBasicMaterial color="#fde68a" transparent opacity={0.38} depthWrite={false} onBeforeCompile={handleWindBeforeCompile} />
    </instancedMesh>
  );
});

/* ─────────────────── FEATURE 10: 3D TORNADO VORTEX CATACLYSM (SIÊU LỐC XOÁY VÒI RỒNG 3D) ─────────────────── */
const TORNADO_LAYERS = Array.from({ length: 14 }).map((_, i) => ({
  y: 1.2 + i * 3.1,
  rTop: 2.2 + Math.pow(i / 13, 1.35) * 14.5,
  rBot: 1.8 + Math.pow(Math.max(0, i - 1) / 13, 1.35) * 14.5,
  h: 3.3,
  speed: 6.5 - i * 0.22,
}));

const TornadoVortexOverlay = React.memo(function TornadoVortexOverlay({ visible, tornadoPosRef }) {
  const rootRef = useRef();
  const funnelRefs = useRef([]);
  const debrisMeshRef = useRef();
  const outerRingRef = useRef();
  const eyeRingRef = useRef();
  const intensityRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const debrisSeeds = useMemo(
    () =>
      Array.from({ length: 85 }).map((_, i) => ({
        baseY: 0.6 + (i / 85) * 38.0,
        radiusOffset: (i % 5) * 0.9,
        angleOffset: i * 1.7,
        speed: 4.5 + (i % 4) * 1.4,
        scale: 0.28 + (i % 3) * 0.2,
      })),
    []
  );

  useFrame((state, delta) => {
    if (!rootRef.current || !tornadoPosRef.current) return;
    // Chuyển tiếp mượt mà: Phễu lốc xoáy hình thành từ nhỏ đến lớn khi bắt đầu và thu nhỏ tan dần khi kết thúc
    const targetIntensity = visible ? 1.0 : 0.0;
    intensityRef.current += (targetIntensity - intensityRef.current) * Math.min(1, delta * (visible ? 1.8 : 2.5));
    if (intensityRef.current <= 0.02) {
      rootRef.current.visible = false;
      return;
    }
    rootRef.current.visible = true;
    const s = intensityRef.current;
    rootRef.current.scale.set(s, s, s);

    const t = state.clock.elapsedTime;
    rootRef.current.position.set(tornadoPosRef.current.x, 0, tornadoPosRef.current.z);

    for (let i = 0; i < TORNADO_LAYERS.length; i++) {
      const mesh = funnelRefs.current[i];
      if (!mesh) continue;
      const layer = TORNADO_LAYERS[i];
      mesh.rotation.y = t * layer.speed + i * 0.4;
      mesh.position.x = Math.sin(t * 3.5 + i * 0.55) * (0.4 + i * 0.14);
      mesh.position.z = Math.cos(t * 3.1 + i * 0.55) * (0.4 + i * 0.14);
    }

    if (debrisMeshRef.current) {
      for (let i = 0; i < debrisSeeds.length; i++) {
        const d = debrisSeeds[i];
        const curY = ((d.baseY + t * 8.0) % 38.0) + 0.5;
        const funnelR = 2.0 + Math.pow(curY / 38.0, 1.25) * 14.0 + d.radiusOffset;
        const ang = d.angleOffset + t * d.speed;
        dummy.position.set(Math.cos(ang) * funnelR, curY, Math.sin(ang) * funnelR);
        dummy.rotation.set(t * 5.0 + i, t * 4.0, i);
        dummy.scale.set(d.scale, d.scale, d.scale);
        dummy.updateMatrix();
        debrisMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 3.5;
      const rs = 1.0 + Math.sin(t * 6.0) * 0.06;
      outerRingRef.current.scale.set(rs, rs, 1);
    }
    if (eyeRingRef.current) {
      eyeRingRef.current.rotation.z = t * 6.0;
    }
  });

  return (
    <group ref={rootRef} visible={false}>
      {/* Vòng áp suất hút chân không tại mắt lốc (r = 15m) & Vành đai gió giật (r = 30m) */}
      <mesh ref={eyeRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
        <ringGeometry args={[2.5, 15.0, 32]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[15.2, 30.0, 36]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      {/* Cột phễu lốc xoáy đa tầng uốn lượn */}
      {TORNADO_LAYERS.map((layer, idx) => (
        <mesh
          key={idx}
          ref={(el) => { funnelRefs.current[idx] = el; }}
          position={[0, layer.y, 0]}
        >
          <cylinderGeometry args={[layer.rTop, layer.rBot, layer.h, 16, 1, true]} />
          <meshStandardMaterial
            color={idx < 4 ? '#78716c' : '#64748b'}
            emissive="#1e293b"
            emissiveIntensity={0.35}
            transparent
            opacity={0.36 - idx * 0.015}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 85 Mảnh đất đá & lá cây bị cuốn xoáy trong vòi rồng (1 GPU InstancedMesh) */}
      <instancedMesh ref={debrisMeshRef} args={[null, null, debrisSeeds.length]} frustumCulled={false}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} />
      </instancedMesh>

      {visible && (
        <Html position={[0, 26, 0]} center zIndexRange={[10, 0]}>
          <div className="bg-slate-950/90 border border-amber-400/80 text-amber-200 px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap shadow-2xl pointer-events-none">
            🌪️ Vòi Rồng Lốc Xoáy (Bán kính cuốn 15m · Click mặt đất để điều hướng)
          </div>
        </Html>
      )}
    </group>
  );
});

/* ─────────────────── ANT AGENT WRAPPER (HỖ TRỢ 4 PHÂN LỚP + HIỆU ỨNG TƯƠNG TÁC LIÊN GIAI CẤP & THẢM HỌA THỜI TIẾT) ─────────────────── */
const AntAgent = React.memo(function AntAgent({ id, antType: propAntType, dataRef, modelUrl, groupRef, onAntClick }) {
  const innerGroupRef = useRef();
  const casteRingRef = useRef();
  const qmpWaveRef = useRef();
  const actionAuraRef = useRef();

  useFrame((state, delta) => {
    const d = dataRef.current[id];
    if (!d || !innerGroupRef.current) return;

    const t = state.clock.elapsedTime;

    // Áp dụng Visual State & Hoạt ảnh Xung kích Chiến đấu / Nghiền Mồi / Bị Cuốn Vào Lốc Xoáy / Bám Đất Chống Gió
    if (d.state === 'dead') {
      innerGroupRef.current.rotation.set(0, 0, Math.PI);
      innerGroupRef.current.position.set(0, 2.5, 0);
      innerGroupRef.current.visible = true;
    } else if (d.state === 'hidden_inside') {
      // Nếu bật X-Ray Tổ Ngầm thì vẫn nhìn thấy đàn kiến đang trú mưa trong các buồng hầm ngầm!
      innerGroupRef.current.rotation.set(0, 0, 0);
      innerGroupRef.current.position.set(0, 0, 0);
      innerGroupRef.current.visible = Boolean(d.visibleInXRay);
    } else if (d.state === 'struggling_flood') {
      // Vùng vẫy chới với giữa dòng nước lũ đang dâng cao (chưa vào kịp Bè Kiến)
      innerGroupRef.current.rotation.set(
        Math.sin(t * 14 + id) * 0.35,
        Math.cos(t * 9 + id) * 0.25,
        Math.sin(t * 16 + id) * 0.42
      );
      innerGroupRef.current.position.set(0, Math.sin(t * 12 + id) * 0.15, 0);
      innerGroupRef.current.visible = true;
    } else if (d.state === 'airborne_vortex') {
      // Bị cuốn bay lên không trung trong tâm Lốc Xoáy: Xoay tít 3 trục!
      innerGroupRef.current.rotation.set(
        Math.sin(t * 10 + id) * 0.9,
        t * 8.0 + id,
        Math.cos(t * 9 + id) * 0.9
      );
      innerGroupRef.current.position.set(0, 0, 0);
      innerGroupRef.current.visible = true;
    } else if (d.state === 'wind_anchoring') {
      // Hạ thấp trọng tâm và ghì chặt hàm xuống đất chống gió bão
      innerGroupRef.current.rotation.set(0.15, 0, Math.sin(t * 28 + id) * 0.08);
      innerGroupRef.current.position.set(0, -0.18, 0);
      innerGroupRef.current.visible = true;
    } else if (d.state === 'attacking' || d.state === 'milling') {
      const strikeWave = Math.sin(t * (d.state === 'milling' ? 15 : 20) + id * 1.9);
      const lungeDist = Math.max(-0.25, strikeWave) * (d.type === 'major' ? 1.25 : 1.0);
      innerGroupRef.current.rotation.set(0, 0, 0);
      innerGroupRef.current.position.set(
        d.targetDir.x * lungeDist,
        Math.max(0, strikeWave) * 0.45,
        d.targetDir.z * lungeDist
      );
      innerGroupRef.current.visible = true;
    } else {
      innerGroupRef.current.rotation.set(0, 0, 0);
      innerGroupRef.current.position.set(0, 0, 0);
      innerGroupRef.current.visible = true;
    }

    // Sóng nội tiết QMP phát tỏa từ Kiến Chúa khi nhận mớm sữa (Royal Trophallaxis)
    if (qmpWaveRef.current && d.type === 'queen') {
      if (d.qmpWave > 0 && d.qmpWave < 1.0) {
        d.qmpWave = Math.min(1.0, d.qmpWave + delta * 0.65);
        const s = 1.0 + d.qmpWave * 18.0;
        qmpWaveRef.current.visible = true;
        qmpWaveRef.current.scale.set(s, s, 1);
        qmpWaveRef.current.material.opacity = (1.0 - d.qmpWave) * 0.75;
      } else {
        qmpWaveRef.current.visible = false;
      }
    }

    // Vòng hào quang tương tác liên giai cấp & Thích nghi sinh học 4 buổi / Thảm họa
    if (actionAuraRef.current) {
      const showAction =
        d.state === 'milling' ||
        d.state === 'royal_trophallaxis' ||
        d.state === 'allogrooming' ||
        d.state === 'escorting_queen' ||
        d.state === 'basking' ||
        d.state === 'shade_seeking' ||
        d.state === 'nocturnal_guard' ||
        d.state === 'wind_anchoring';
      actionAuraRef.current.visible = showAction;
      if (showAction) {
        const pulse = 1.0 + Math.sin(t * 10) * 0.16;
        actionAuraRef.current.scale.set(pulse, pulse, 1);
      }
    }
  });

  const antObj = dataRef.current[id];
  const antType = propAntType || antObj?.type || 'minor';
  const scale =
    antType === 'queen'
      ? ANT_SCALE * 2.15
      : antType === 'major'
        ? ANT_SCALE * 1.48
        : antType === 'soldier'
          ? ANT_SCALE * 1.22
          : ANT_SCALE * 0.96;

  const badgeColor =
    antType === 'queen'
      ? '#facc15'
      : antType === 'major'
        ? '#f97316'
        : antType === 'soldier'
          ? '#38bdf8'
          : null;

  return (
    <group ref={groupRef}>
      {/* Hitbox hình cầu 36 tam giác tĩnh bắt sự kiện click thay cho 16.912 tam giác SkinnedMesh */}
      <mesh
        geometry={HITBOX_GEOMETRY}
        material={HITBOX_MATERIAL}
        position={[0, 1.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onAntClick?.(id);
        }}
      />
      {/* Vòng nhận diện Giai cấp dưới chân (Queen: Vàng kim, Major: Cam lửa, Soldier: Xanh lam) */}
      {badgeColor && (
        <mesh ref={casteRingRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[antType === 'queen' ? 2.4 : 1.35, antType === 'queen' ? 3.1 : 1.75, 24]} />
          <meshBasicMaterial color={badgeColor} transparent opacity={antType === 'queen' ? 0.75 : 0.45} depthWrite={false} />
        </mesh>
      )}
      {/* Sóng nội tiết QMP lan tỏa từ Kiến Chúa */}
      {antType === 'queen' && (
        <>
          <mesh ref={qmpWaveRef} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
            <ringGeometry args={[1.5, 2.2, 36]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.75} depthWrite={false} />
          </mesh>
          <Html position={[0, 5.2, 0]} center zIndexRange={[10, 0]}>
            <div className="bg-amber-950/90 border border-yellow-400/90 text-yellow-200 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap shadow-lg pointer-events-none">
              👑 {id === 0 ? 'Kiến Chúa #1 (QMP Aura)' : `Chúa Đồng Trị #${id === 9 ? 2 : id === 10 ? 3 : id} (Polygyne)`}
            </div>
          </Html>
        </>
      )}
      {/* Vòng hào quang khi đang thực hiện tương tác liên giai cấp hoặc thích nghi sinh học */}
      <mesh ref={actionAuraRef} position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.8, 2.4, 24]} />
        <meshBasicMaterial
          color={antType === 'major' ? '#fb923c' : antType === 'soldier' ? '#38bdf8' : '#34d399'}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
      <group ref={innerGroupRef}>
        <AntModel
          url={modelUrl}
          scaleFactor={scale}
          antDataRef={dataRef}
          antId={id}
          staggerIndex={id}
        />
      </group>
    </group>
  );
});

/* ─────────────────── FOOD AGENT WRAPPER (TINH THỂ ĐƯỜNG PHÈN & CHIẾN LỢI PHẨM + HIỆU ỨNG RƠI NẢY ĐÀN HỒI) ─────────────────── */
const FoodAgent = React.memo(function FoodAgent({ id, dataRef }) {
  const rootRef = useRef();
  const crystalRef = useRef();
  const shockRingRef = useRef();
  const auraRingRef = useRef();
  const badgeRef = useRef();
  const lastTextRef = useRef('');
  const lastOpacityRef = useRef('0');

  const isCorpse = String(id).startsWith('corpse_');

  useFrame((state, delta) => {
    const d = dataRef.current.find(f => f.id === id);
    if (!d || !rootRef.current) return;

    const t = state.clock.elapsedTime;

    // 1. Vật lý rơi từ trên trời xuống & nảy đàn hồi (Drop & Bounce Physics)
    if (d.dropY === undefined) {
      d.dropY = isCorpse ? 4.5 : 28.0;
      d.vy = 0;
      d.landed = false;
      d.shockwave = 0;
    }

    if (!d.landed) {
      d.vy -= 75.0 * delta;
      d.dropY += d.vy * delta;
      if (d.dropY <= 0) {
        d.dropY = 0;
        if (d.shockwave === 0) d.shockwave = 0.01; // Kích hoạt sóng xung kích chạm đất lần đầu
        if (Math.abs(d.vy) > 5.0) {
          d.vy = -d.vy * 0.36; // Nảy đàn hồi
        } else {
          d.vy = 0;
          d.landed = true;
        }
      }
    }

    rootRef.current.position.set(d.x, 0, d.z);

    // 2. Chuyển động xoay & nhịp rung khi được đàn kiến khiêng (Cooperative Transport Wobble)
    if (crystalRef.current) {
      const baseHeight = isCorpse ? 0.9 : 1.05;
      const carryBob = d.isCarried ? Math.abs(Math.sin(t * 16)) * 0.28 : 0;
      crystalRef.current.position.y = baseHeight + d.dropY + carryBob;

      if (!d.landed) {
        crystalRef.current.rotation.y += delta * 5.0;
        crystalRef.current.rotation.z = Math.sin(t * 12) * 0.25;
      } else if (d.isCarried) {
        crystalRef.current.rotation.y += delta * 1.2;
        crystalRef.current.rotation.z = Math.sin(t * 14) * 0.09;
      } else {
        crystalRef.current.rotation.y += delta * 0.35;
        crystalRef.current.rotation.z = 0;
      }
    }

    // 3. Sóng xung kích hương thơm khi viên đường chạm đất (Impact Aroma Shockwave)
    if (shockRingRef.current) {
      if (d.shockwave > 0 && d.shockwave < 1.0) {
        d.shockwave = Math.min(1.0, d.shockwave + delta * 1.35);
        const s = 1.0 + d.shockwave * 7.5;
        shockRingRef.current.visible = true;
        shockRingRef.current.scale.set(s, s, 1);
        shockRingRef.current.material.opacity = (1.0 - d.shockwave) * 0.75;
      } else {
        shockRingRef.current.visible = false;
      }
    }

    // 4. Vòng hào quang tuyển dụng & Hiển thị số kiến đang hợp sức ôm mồi
    if (auraRingRef.current) {
      const pulse = 1.0 + Math.sin(t * 4.5) * 0.12;
      auraRingRef.current.scale.set(pulse, pulse, 1);
      auraRingRef.current.visible = d.landed;
    }

    if (badgeRef.current) {
      const count = d.waiters ? d.waiters.length : 0;
      let nextText = lastTextRef.current;
      let nextOpacity = '0';

      if (d.requiresMilling && (d.millingProgress || 0) < 100) {
        const pct = Math.min(99, Math.floor(d.millingProgress || 0));
        nextText = pct > 0
          ? `⚙️ Kiến Tướng Đang Nghiền Vỏ (${pct}%)`
          : `🪨 Vỏ Cứng: Chờ Kiến Tướng (Major) Cắt Xé`;
        nextOpacity = '1';
      } else if (d.isCarried) {
        nextText = isCorpse ? `🍖 Khiêng Chiến Lợi Phẩm (${count}/${d.reqAnts})` : `🍬 Kiến Thợ Đang Khiêng (${count}/${d.reqAnts})`;
        nextOpacity = '1';
      } else if (count > 0) {
        nextText = `⏳ Gom quân (${count}/${d.reqAnts}🐜)`;
        nextOpacity = '1';
      } else if (d.wasMilled) {
        nextText = `✨ Đã Sơ Chế: Sẵn Sàng Cho Kiến Thợ Khiêng!`;
        nextOpacity = '0.95';
      } else if (isCorpse) {
        nextText = `🍖 Xác Nhện (+20 Nutrition)`;
        nextOpacity = '0.9';
      }

      if (nextText !== lastTextRef.current) {
        lastTextRef.current = nextText;
        badgeRef.current.textContent = nextText;
      }
      if (nextOpacity !== lastOpacityRef.current) {
        lastOpacityRef.current = nextOpacity;
        badgeRef.current.style.opacity = nextOpacity;
      }
    }
  });

  const dInit = dataRef.current.find(f => f.id === id);
  const reqAnts = dInit?.reqAnts || 2;
  const sizeScale = isCorpse ? 1.15 : (reqAnts === 1 ? 0.72 : reqAnts === 2 ? 1.0 : 1.35);

  return (
    <group ref={rootRef} position={[dInit?.x || 0, 0, dInit?.z || 0]}>
      {/* Vòng sóng xung kích lan tỏa khi thả đường chạm đất */}
      <mesh ref={shockRingRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.85, 1.25, 28]} />
        <meshBasicMaterial color={isCorpse ? '#f97316' : '#fde047'} transparent opacity={0.75} depthWrite={false} />
      </mesh>

      {/* Vòng hào quang dưới chân mồi */}
      <mesh ref={auraRingRef} geometry={SUGAR_RING_GEO} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[sizeScale * 1.4, sizeScale * 1.4, 1]}>
        <meshBasicMaterial color={isCorpse ? '#ef4444' : '#f59e0b'} transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Khối tinh thể đường phèn đa diện hoặc Chiến lợi phẩm Xác Nhện */}
      <group ref={crystalRef} scale={[sizeScale, sizeScale, sizeScale]}>
        {isCorpse ? (
          <group rotation={[Math.PI, 0, 0]} position={[0, 0.4, 0]}>
            <mesh position={[0, 0, 0.9]} material={CORPSE_CHITIN_MAT}>
              <sphereGeometry args={[0.85, 8, 8]} />
            </mesh>
            <mesh position={[0, 0.1, -0.9]} material={CORPSE_CHITIN_MAT}>
              <sphereGeometry args={[1.25, 8, 8]} />
            </mesh>
            {[-1, 1].map(s =>
              [-0.8, -0.2, 0.4, 1.0].map((zOff, i) => (
                <mesh key={`${s}_${i}`} position={[s * 0.9, -0.6, zOff]} rotation={[0.3, 0, s * -0.7]} material={CORPSE_CHITIN_MAT}>
                  <cylinderGeometry args={[0.06, 0.03, 1.6, 4]} />
                </mesh>
              ))
            )}
          </group>
        ) : (
          <group>
            {/* Tinh thể đường trung tâm */}
            <mesh geometry={SUGAR_CRYSTAL_GEO} material={SUGAR_MAIN_MAT} rotation={[0.35, 0.5, 0.2]} castShadow />
            {/* Lõi mật ong phát sáng bên trong */}
            <mesh geometry={SUGAR_SUB_GEO} material={SUGAR_CORE_MAT} scale={[0.68, 0.68, 0.68]} />
            {/* Các nhánh tinh thể đường kết tinh bên cạnh */}
            <mesh geometry={SUGAR_SUB_GEO} material={SUGAR_MAIN_MAT} position={[0.7, -0.2, 0.45]} rotation={[0.8, 0.2, -0.4]} />
            <mesh geometry={SUGAR_SUB_GEO} material={SUGAR_MAIN_MAT} position={[-0.65, -0.25, -0.4]} rotation={[-0.5, 0.9, 0.3]} scale={[0.85, 0.85, 0.85]} />
          </group>
        )}
      </group>

      <Html position={[0, 3.2 * sizeScale, 0]} center zIndexRange={[10, 0]}>
        <div
          ref={badgeRef}
          style={{ opacity: 0 }}
          className="bg-amber-950/90 border border-amber-400/70 rounded-full px-2 py-0.5 text-[10px] text-amber-100 font-bold whitespace-nowrap shadow-md pointer-events-none transition-opacity"
        />
      </Html>
    </group>
  );
});


/* ─────────────────── ENEMY AGENT WRAPPER (NHỆN ĐỘC: RƠI PHỤC KÍCH, 8 CHÂN BƯỚC ĐI & CHỒM CẮN PHUN ĐỘC) ─────────────────── */
const SPIDER_LEG_DATA = (() => {
  const legs = [];
  for (let i = 0; i < 4; i++) {
    const zOff = (i - 1.5) * 1.15;
    const fwd = (i - 1.5) * 0.22;
    for (const s of [-1, 1]) {
      // phase alternating tetrapod gait (nhịp bước chéo 4 chân chuẩn sinh học loài nhện)
      const tetrapodGroup = (i + (s > 0 ? 0 : 1)) % 2;
      legs.push({ zOff, s, fwd, i, tetrapodGroup, k: `${s}_${i}` });
    }
  }
  return legs;
})();

const EnemyAgent = React.memo(function EnemyAgent({ id, dataRef }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const abdomenRef = useRef();
  const fangLRef = useRef();
  const fangRRef = useRef();
  const legRefs = useRef([]);
  const shockwaveRef = useRef();
  const combatAuraRef = useRef();
  const textRef = useRef();
  const hpBarRef = useRef();
  const lastTextRef = useRef('');
  const lastWidthRef = useRef('');

  useFrame((state, delta) => {
    const e = dataRef.current.find(x => x.id === id);
    if (!e || e.killed || !groupRef.current) return;

    const t = state.clock.elapsedTime;

    // 1. Vật lý Nhện Độc nhảy phục kích từ trên cao xuống (Sky-Drop Ambush)
    if (e.dropY === undefined) {
      e.dropY = 36.0;
      e.vy = 0;
      e.landed = false;
      e.impactWave = 0;
      e.squash = 0;
    }

    if (!e.landed) {
      e.vy -= 95.0 * delta;
      e.dropY += e.vy * delta;
      if (e.dropY <= 0) {
        e.dropY = 0;
        e.vy = 0;
        e.landed = true;
        e.impactWave = 0.01;
        e.squash = 1.0; // Nhún sâu chân khi tiếp đất
      }
    }

    if (e.squash > 0) {
      e.squash = Math.max(0, e.squash - delta * 3.5);
    }

    groupRef.current.position.set(e.pos.x, e.dropY, e.pos.z);

    if (e.targetDir && e.targetDir.lengthSq() > 0.001) {
      const targetRot = Math.atan2(e.targetDir.x, e.targetDir.z);
      let curRot = groupRef.current.rotation.y;
      while (targetRot - curRot > Math.PI) curRot += Math.PI * 2;
      while (targetRot - curRot < -Math.PI) curRot -= Math.PI * 2;
      groupRef.current.rotation.y = curRot + (targetRot - curRot) * Math.min(1, delta * 10);
    }

    // 2. Sóng chấn động đỏ rực khi Nhện tiếp đất (Threat Impact Shockwave)
    if (shockwaveRef.current) {
      if (e.impactWave > 0 && e.impactWave < 1.0) {
        e.impactWave = Math.min(1.0, e.impactWave + delta * 1.25);
        const s = 1.2 + e.impactWave * 13.0;
        shockwaveRef.current.visible = true;
        shockwaveRef.current.scale.set(s, s, 1);
        shockwaveRef.current.material.opacity = (1.0 - e.impactWave) * 0.85;
      } else {
        shockwaveRef.current.visible = false;
      }
    }

    // 3. Hoạt ảnh Thân Nhện, Bụng, Cặp Nanh Độc & Vòng Chiến Đấu
    const isAttacking = Boolean(e.isAttacking && e.landed);
    const isMoving = Boolean(e.isMoving && e.landed);

    if (bodyRef.current) {
      const squashY = 1.0 - e.squash * 0.35;
      const squashXZ = 1.0 + e.squash * 0.2;
      // Khi tấn công: Nhện chồm mạnh về phía trước và ngóc đầu đập xuống
      const attackLungeZ = isAttacking ? Math.max(0, Math.sin(t * 16)) * 1.15 : 0;
      const attackPitchX = isAttacking ? Math.sin(t * 16) * 0.24 : 0;
      const walkBobY = isMoving ? Math.abs(Math.sin(t * 22)) * 0.22 : Math.sin(t * 3.5) * 0.06;

      bodyRef.current.position.set(0, walkBobY - e.squash * 0.6, attackLungeZ);
      bodyRef.current.rotation.x = attackPitchX;
      bodyRef.current.scale.set(squashXZ, squashY, squashXZ);
    }

    if (abdomenRef.current) {
      const pulse = 1.0 + Math.sin(t * (isAttacking ? 14 : 4)) * (isAttacking ? 0.1 : 0.04);
      abdomenRef.current.scale.set(pulse, pulse, pulse);
    }

    // Cặp kẹp hàm nọc độc (Chelicerae Fangs) ngoạm liên hồi khi cắn kiến
    if (fangLRef.current && fangRRef.current) {
      const biteAngle = isAttacking ? (0.35 + Math.sin(t * 26) * 0.45) : (0.15 + Math.sin(t * 4) * 0.05);
      fangLRef.current.rotation.y = biteAngle;
      fangRRef.current.rotation.y = -biteAngle;
      fangLRef.current.rotation.x = 0.8 + (isAttacking ? Math.cos(t * 26) * 0.25 : 0);
      fangRRef.current.rotation.x = 0.8 + (isAttacking ? Math.cos(t * 26) * 0.25 : 0);
    }

    // 4. Hoạt ảnh 8 Chân Nhện (Tetrapod Gait khi chạy & Giơ chân trước đập xuống khi tấn công)
    for (let idx = 0; idx < SPIDER_LEG_DATA.length; idx++) {
      const legGroup = legRefs.current[idx];
      if (!legGroup) continue;
      const { s, i, tetrapodGroup } = SPIDER_LEG_DATA[idx];
      const phase = tetrapodGroup * Math.PI + i * 0.35;

      if (!e.landed) {
        // Khi đang rơi từ trên trời xuống: 8 chân giang rộng đón gió
        legGroup.rotation.z = s * 0.35;
        legGroup.rotation.y = 0;
      } else if (isAttacking && i === 3) {
        // Cặp chân tiền đạo (i === 3, gần đầu nhất) giơ cao vồ đập xuống đàn kiến
        const strike = Math.sin(t * 18 + (s > 0 ? 0 : 1.2));
        legGroup.rotation.z = s * (0.35 + Math.max(0, strike) * 0.45);
        legGroup.rotation.y = s * (0.4 + strike * 0.35);
      } else if (isMoving || isAttacking) {
        const speed = isAttacking ? 16 : 22;
        const stride = Math.sin(t * speed + phase);
        const lift = Math.max(0, Math.cos(t * speed + phase));
        legGroup.rotation.y = stride * 0.32;
        legGroup.rotation.z = s * lift * 0.28;
      } else {
        legGroup.rotation.y = Math.sin(t * 2.5 + phase) * 0.04;
        legGroup.rotation.z = 0;
      }
    }

    // 5. Vòng giao tranh nọc độc dưới chân nhện khi đang cắn nhau với kiến
    if (combatAuraRef.current) {
      combatAuraRef.current.visible = isAttacking;
      if (isAttacking) {
        const auraScale = 1.0 + Math.sin(t * 15) * 0.18;
        combatAuraRef.current.scale.set(auraScale, auraScale, 1);
        combatAuraRef.current.rotation.z += delta * 2.5;
      }
    }

    // 6. Cập nhật HUD Máu & Thanh HP trực quan + Trạng thái bị Kiến Lính khóa chân
    const currentHp = Math.max(0, Math.ceil(e.hp));
    const pinnedCount = e.pinnedBySoldiers || 0;
    if (textRef.current) {
      const pinText = pinnedCount > 0 ? ` · 🛡️Bị Lính Khóa -${Math.min(75, pinnedCount * 35)}% Tốc` : '';
      const nextText = isAttacking
        ? `⚔️ Nhện Độc Đang Cắn (${currentHp} HP${pinText})`
        : `🕷️ Nhện Độc (${currentHp} HP${pinText})`;
      if (nextText !== lastTextRef.current) {
        lastTextRef.current = nextText;
        textRef.current.textContent = nextText;
      }
    }
    if (hpBarRef.current) {
      const nextWidth = `${Math.max(0, Math.min(100, currentHp))}%`;
      if (nextWidth !== lastWidthRef.current) {
        lastWidthRef.current = nextWidth;
        hpBarRef.current.style.width = nextWidth;
      }
    }
  });

  const eInit = dataRef.current.find(x => x.id === id);
  if (!eInit) return null;

  return (
    <group ref={groupRef} position={eInit.pos}>
      {/* Sóng xung kích đỏ rực khi Nhện Độc đáp xuống mặt đất */}
      <mesh ref={shockwaveRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.0, 1.55, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* Vòng hào quang giao tranh khi đang cắn xé đàn kiến */}
      <mesh ref={combatAuraRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[3.2, 4.4, 24]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.5} depthWrite={false} />
      </mesh>

      <group ref={bodyRef}>
        {/* Đầu ngực (Cephalothorax) */}
        <mesh position={[0, 2.0, 1.5]} castShadow>
          <sphereGeometry args={[1.05, 12, 10]} />
          <meshStandardMaterial color="#3b1d0b" roughness={0.6} />
        </mesh>
        {/* Bụng (Abdomen) */}
        <mesh ref={abdomenRef} position={[0, 2.3, -1.3]} castShadow>
          <sphereGeometry args={[1.68, 12, 10]} />
          <meshStandardMaterial color="#140602" roughness={0.5} />
        </mesh>
        {/* Eo nối (Pedicel) */}
        <mesh position={[0, 1.9, 0.2]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#2a1205" roughness={0.8} />
        </mesh>
        {/* Hoa văn đồng hồ cát đỏ rực cảnh báo độc tính (Widow Hourglass Marking) */}
        <mesh position={[0, 3.35, -1.4]} scale={[1.0, 0.55, 1.2]}>
          <octahedronGeometry args={[0.78, 0]} />
          <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.6} roughness={0.35} />
        </mesh>
        {/* Cụm 4 mắt đỏ phát sáng */}
        {[[-0.34, 2.42, 2.25, 0.16], [0.34, 2.42, 2.25, 0.16], [-0.14, 2.52, 2.38, 0.11], [0.14, 2.52, 2.38, 0.11]].map(([ex, ey, ez, er], i) => (
          <mesh key={i} position={[ex, ey, ez]}>
            <sphereGeometry args={[er, 6, 6]} />
            <meshBasicMaterial color="#ff1e1e" />
          </mesh>
        ))}
        {/* Cặp Kẹp Hàm Nọc Độc (Chelicerae Fangs) cử động đóng mở */}
        <mesh ref={fangLRef} position={[0.32, 1.58, 2.45]} rotation={[0.8, 0.2, 0]}>
          <coneGeometry args={[0.12, 0.95, 6]} />
          <meshStandardMaterial color="#111827" emissive="#450a0a" emissiveIntensity={0.4} metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh ref={fangRRef} position={[-0.32, 1.58, 2.45]} rotation={[0.8, -0.2, 0]}>
          <coneGeometry args={[0.12, 0.95, 6]} />
          <meshStandardMaterial color="#111827" emissive="#450a0a" emissiveIntensity={0.4} metalness={0.6} roughness={0.2} />
        </mesh>
        {/* 8 Chân Nhện Khớp Động (Articulated 8 Legs) */}
        {SPIDER_LEG_DATA.map(({ zOff, s, fwd, k }, idx) => (
          <group
            key={k}
            ref={(el) => { legRefs.current[idx] = el; }}
            position={[0, 0, zOff]}
          >
            {/* Đốt đùi (Femur) */}
            <mesh position={[s * 1.55, 2.55, fwd * 2]} rotation={[fwd, 0, s * 0.78]} castShadow>
              <cylinderGeometry args={[0.1, 0.07, 2.9, 6]} />
              <meshStandardMaterial color="#2c1609" roughness={0.75} />
            </mesh>
            {/* Khớp gối đỏ sẫm */}
            <mesh position={[s * 2.5, 2.15, fwd * 2.5]}>
              <sphereGeometry args={[0.13, 6, 6]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
            </mesh>
            {/* Đốt cẳng chân (Tibia/Tarsus) */}
            <mesh position={[s * 3.3, 1.0, fwd * 3]} rotation={[fwd * 0.5, 0, s * -0.32]} castShadow>
              <cylinderGeometry args={[0.07, 0.025, 2.65, 6]} />
              <meshStandardMaterial color="#140904" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>
      <Html position={[0, 6.0, 0]} center zIndexRange={[10, 0]}>
        <div className="bg-red-950/95 border border-red-500 rounded-md px-2.5 py-1 text-[11px] text-red-100 font-bold whitespace-nowrap shadow-red-950 shadow-lg pointer-events-none">
          <div ref={textRef}>🕷️ Nhện Độc (100 HP)</div>
          <div className="w-full h-1.5 bg-red-900/80 rounded-full overflow-hidden mt-1">
            <div ref={hpBarRef} className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-150" style={{ width: '100%' }} />
          </div>
        </div>
      </Html>
    </group>
  );
});


const _pushVec = new THREE.Vector3(); // Biến dùng chung để tránh rác GC
const _dirVec = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

/* ─────────────────── 2D SPATIAL HASH GRID O(1) (KHÔNG CẤP PHÁT BỘ NHỚ TRONG FRAME) ─────────────────── */
const GRID_CELL_SIZE = 12.0; // Khớp chính xác với bán kính khứu giác râu kiến (12 đơn vị)
const GRID_DIM = 18;         // 18x18 = 324 ô bao phủ toàn bộ sa bàn [-108, 108]
const GRID_TOTAL_CELLS = GRID_DIM * GRID_DIM;
const _pheroGrid = Array.from({ length: GRID_TOTAL_CELLS }, () => []);
const _antGrid = Array.from({ length: GRID_TOTAL_CELLS }, () => []);

function getGridCoord(val) {
  const c = Math.floor((val + 108.0) / GRID_CELL_SIZE);
  return c < 0 ? 0 : c >= GRID_DIM ? GRID_DIM - 1 : c;
}

// Hàm rải hoặc khuếch đại Pheromone tự xúc tác (Autocatalytic Stigmergy - Deneubourg et al., 1990)
// Nếu đã có hạt mùi cùng loại trong bán kính 2.6 đơn vị, cộng dồn nồng độ thay vì sinh hạt mới trùng lặp
function depositOrReinforcePheromone(pheroList, x, z, dirX, dirZ, foodId, addStrength, type = 'trail') {
  const cx = getGridCoord(x);
  const cz = getGridCoord(z);
  const cell = _pheroGrid[cz * GRID_DIM + cx];
  for (let i = 0; i < cell.length; i++) {
    const p = cell[i];
    if (p.foodId === foodId && p.type === type) {
      const dx = p.pos.x - x;
      const dz = p.pos.z - z;
      if (dx * dx + dz * dz < 6.76) { // < 2.6 units: Khuếch đại nồng độ hóa học tại chỗ
        p.strength = Math.min(2.2, p.strength + addStrength * 0.75);
        p.toFoodDir.set(p.toFoodDir.x * 0.5 + dirX * 0.5, 0, p.toFoodDir.z * 0.5 + dirZ * 0.5).normalize();
        if (type === 'trail' && p.strength > 1.25) p.type = 'reinforced';
        return;
      }
    }
  }
  const newPhero = {
    pos: new THREE.Vector3(x, 0, z),
    strength: addStrength,
    toFoodDir: new THREE.Vector3(dirX, 0, dirZ).normalize(),
    foodId,
    type,
  };
  pheroList.push(newPhero);
  cell.push(newPhero);
  if (pheroList.length > 1500) {
    pheroList.shift();
  }
}

function Simulation({ modelUrl, enemyList, foodList, clickMode, timeOfDay = 'morning', weatherMode = 'clear', territoryAreaM2 = 50, soilTempC = 28, socialForm = 'monogyne', showTerritoryRing = false, tornadoTargetRef, isRaining, isFlooding, isXRayMode, showHeatmap, isAntPOV, isQueenProcession, antCount, waterRate, setFoodList, onConsumeFood, onFoodDelivered, onStatsChange, onEnemyKilled, enemyDataRef, selectedAntId, isTracking, onSelectAnt, onFocusDataChange, controlsRef }) {
  const groupRefs = useRef([]);
  const pheromonesRef = useRef([]); // { pos, strength, toFoodDir, foodId, type }
  const [, setForceRender] = useState(0);
  const totalBornRef = useRef(20);
  const deathTollRef = useRef(0);
  const milledCountRef = useRef(0);
  const qmpPulsesRef = useRef(0);
  const healedCountRef = useRef(0);
  const queenSuccessionRef = useRef(0); // Tiến độ ấp Tân Chúa Kế Vị (0 -> 100%) khi mất tín hiệu ức chế QMP
  const queenSuccessionCountRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const floodLevelRef = useRef(0);
  const tornadoPosRef = useRef(new THREE.Vector3(18, 0, -12));
  const tornadoVelRef = useRef(new THREE.Vector3(11.0, 0, 8.5));

  const timeOfDayRef = useRef(timeOfDay);
  useEffect(() => { timeOfDayRef.current = timeOfDay; }, [timeOfDay]);
  const weatherModeRef = useRef(weatherMode);
  useEffect(() => { weatherModeRef.current = weatherMode; }, [weatherMode]);
  const territoryAreaRef = useRef(territoryAreaM2);
  useEffect(() => { territoryAreaRef.current = territoryAreaM2; }, [territoryAreaM2]);
  const soilTempRef = useRef(soilTempC);
  useEffect(() => { soilTempRef.current = soilTempC; }, [soilTempC]);
  const socialFormRef = useRef(socialForm);
  useEffect(() => { socialFormRef.current = socialForm; }, [socialForm]);

  const clickModeRef = useRef(clickMode);
  useEffect(() => { clickModeRef.current = clickMode; }, [clickMode]);
  const onSelectAntRef = useRef(onSelectAnt);
  useEffect(() => { onSelectAntRef.current = onSelectAnt; }, [onSelectAnt]);

  // Hàm callback ổn định tuyệt đối để không phá vỡ React.memo của 50 AntAgent mỗi 500ms
  const handleAntInteraction = useCallback((id) => {
    if (clickModeRef.current === 'water') {
      const ant = antsDataRef.current[id];
      if (!ant?.state.includes('carry') && ant?.state !== 'dead' && ant?.type !== 'queen') {
        ant.state = 'drinking';
        ant.bioState = 'WANDERING';
        ant.anim = 'Insect|walk_1';
        ant.timer = undefined;
      }
    } else if (onSelectAntRef.current) {
      onSelectAntRef.current(id);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!antsDataRef.current || !onStatsChange) return;
      const newStats = {
        patrolling: 0,
        communicating: 0,
        recruit: 0,
        waiting: 0,
        carrying: 0,
        alarmed: 0,
        dead: 0,
        guard: 0,
        queen: 0,
        major: 0,
        soldier: 0,
        minor: 0,
        milling: 0,
        royalCourt: 0,
        medics: 0,
        circadianActive: 0,
        milledTotal: milledCountRef.current || 0,
        qmpPulses: qmpPulsesRef.current || 0,
        healedTotal: healedCountRef.current || 0,
        queenSuccessionProgress: Math.round(queenSuccessionRef.current || 0),
        queenSuccessions: queenSuccessionCountRef.current || 0,
        bornTotal: Math.max(0, (totalBornRef.current || 20) - 20),
        deathToll: deathTollRef.current || 0,
      };
      antsDataRef.current.forEach(ant => {
        if (ant.state !== 'dead') {
          if (ant.type === 'queen') newStats.queen++;
          else if (ant.type === 'major') newStats.major++;
          else if (ant.type === 'soldier') { newStats.soldier++; newStats.guard++; }
          else newStats.minor++;
        }

        if (ant.state === 'basking' || ant.state === 'shade_seeking' || ant.state === 'nocturnal_guard' || ant.state === 'wind_anchoring' || ant.state === 'airborne_vortex') {
          newStats.circadianActive++;
          newStats.patrolling++;
        } else if (ant.state === 'patrolling' || ant.state === 'following_trail' || ant.state === 'emerging' || ant.state === 'rafting' || ant.state === 'queen_reigning') newStats.patrolling++;
        else if (ant.state === 'recruit_return') newStats.recruit++;
        else if (ant.state === 'waiting_to_carry') newStats.waiting++;
        else if (ant.state === 'carrying' || ant.state === 'carry_corpse') newStats.carrying++;
        else if (ant.state === 'alarmed' || ant.state === 'attacking') newStats.alarmed++;
        else if (ant.state === 'milling') { newStats.milling++; newStats.carrying++; }
        else if (ant.state === 'royal_trophallaxis' || ant.state === 'escorting_queen') { newStats.royalCourt++; newStats.patrolling++; }
        else if (ant.state === 'allogrooming') { newStats.medics++; newStats.communicating++; }
        else if (ant.state === 'dead') newStats.dead++;
      });
      onStatsChange(prev => ({ ...prev, ...newStats }));

      if (selectedAntId !== null && onFocusDataChange) {
        const fo = antsDataRef.current.find(a => a.id === selectedAntId);
        if (fo) onFocusDataChange({
          state: fo.state,
          bioState: fo.bioState,
          id: fo.id,
          type: fo.type,
          role: fo.role,
          hp: fo.hp,
          maxHp: fo.maxHp,
          energy: fo.energy,
          hydration: fo.hydration,
          age: fo.age,
          maxAge: fo.maxAge,
          qmpBuffTimer: fo.qmpBuffTimer || 0,
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [onStatsChange, selectedAntId, onFocusDataChange]);

  const antsDataRef = useRef(Array.from({ length: 20 }).map((_, id) => {
    const isQueen = id === 0;
    const isMajor = !isQueen && (id === 1 || id === 2 || id === 3); // 3 Kiến Tướng khởi đầu
    const isSoldier = !isQueen && !isMajor && (id >= 4 && id <= 8); // 5 Kiến Lính khởi đầu
    const antType = isQueen ? 'queen' : (isMajor ? 'major' : (isSoldier ? 'soldier' : 'minor'));
    const antRole = isQueen ? 'queen' : (isMajor ? 'major' : (isSoldier ? 'guard' : 'worker'));
    const antHp = isQueen ? 250 : (isMajor ? 80 : (isSoldier ? 45 : 25));
    const spawnOffset = isQueen
      ? new THREE.Vector3(6, 0, 6)
      : new THREE.Vector3((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6);
    const angle = Math.random() * Math.PI * 2;
    return {
      id: id,
      position: new THREE.Vector3(NEST_POS.x, 0, NEST_POS.z).add(spawnOffset),
      targetDir: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
      wanderDir: randomWanderDir(),
      timer: 1.5 + Math.random() * 1.0,
      pheroTimer: 0,
      state: isQueen ? 'queen_reigning' : 'emerging',
      bioState: isQueen ? 'QUEEN_COURT' : 'WANDERING',
      anim: isQueen ? 'Insect|idle_A2' : 'Insect|walk_1',
      priority: isQueen ? 3 : (isMajor ? 2 : (isSoldier ? 1 : 0)),
      targetFoodId: null,
      targetCorpseId: null,
      beingCarried: false,
      type: antType,
      role: antRole,
      hp: antHp,
      maxHp: antHp,
      energy: isQueen ? 82 : 100,
      hydration: 100,
      age: 0,
      maxAge: isQueen ? 99999 : (900 + Math.random() * 600),
      qmpWave: 0,
      qmpCooldown: 2.0,
      qmpBuffTimer: 0,
    };
  }));

  // Khởi tạo nhóm Refs tương ứng cho 20 kiến Base
  if (groupRefs.current.length === 0) {
    for (let i = 0; i < 20; i++) groupRefs.current.push(React.createRef());
  }

  const foodDataRef = useRef([]);
  const focusRingRef = useRef();

  // Đồng bộ Cấu trúc Xã hội từ Phòng Lab (Monogyne: 1 Chúa #0 ↔ Polygyne: Đa Chúa #0, #9, #10 cùng trị vì & bổ sung Kiến Lính #11 để đủ 6 Vệ binh chia đều 2 Lính/Chúa)
  useEffect(() => {
    const ants = antsDataRef.current;
    if (!ants) return;
    const auxQueenIds = [9, 10];
    let changed = false;
    auxQueenIds.forEach((qid, idx) => {
      const a = ants[qid];
      if (!a || a.state === 'dead') return;
      if (socialForm === 'polygyne' && a.type !== 'queen') {
        a.type = 'queen';
        a.role = 'queen';
        a.maxHp = 220;
        a.hp = 220;
        a.priority = 3;
        a.state = 'queen_reigning';
        a.bioState = 'QUEEN_COURT';
        a.qmpWave = 0;
        a.qmpCooldown = 1.5 + idx * 1.2;
        changed = true;
      } else if (socialForm !== 'polygyne' && a.type === 'queen') {
        a.type = 'minor';
        a.role = 'worker';
        a.maxHp = 25;
        a.hp = 25;
        a.priority = 0;
        a.position.y = 0;
        a.state = 'patrolling';
        a.bioState = 'WANDERING';
        changed = true;
      }
    });
    // Đảm bảo có đủ 6 Kiến Lính (chia đều 2 Kiến Lính hộ giá cho mỗi Kiến Chúa trong 3 Kiến Chúa khi Tuần Du)
    const sixthGuard = ants[11];
    if (sixthGuard && sixthGuard.state !== 'dead') {
      if (socialForm === 'polygyne' && sixthGuard.type !== 'soldier') {
        sixthGuard.type = 'soldier';
        sixthGuard.role = 'guard';
        sixthGuard.maxHp = 45;
        sixthGuard.hp = 45;
        sixthGuard.priority = 1;
        changed = true;
      } else if (socialForm !== 'polygyne' && sixthGuard.type === 'soldier') {
        sixthGuard.type = 'minor';
        sixthGuard.role = 'worker';
        sixthGuard.maxHp = 25;
        sixthGuard.hp = 25;
        sixthGuard.priority = 0;
        sixthGuard.state = 'patrolling';
        sixthGuard.bioState = 'WANDERING';
        changed = true;
      }
    }
    if (changed) setForceRender(c => c + 1);
  }, [socialForm]);

  // Đồng bộ hoá Danh sách rơi kẹo giao diện vào Engine (Hỗ trợ Dây chuyền Cắt hạt / Nghiền mồi "Cutters & Carriers")
  useEffect(() => {
    foodList.forEach(f => {
      if (!foodDataRef.current.find(ref => ref.id === f.id)) {
        const needsMilling = f.reqAnts >= 4;
        foodDataRef.current.push({
          id: f.id,
          x: f.x, z: f.z,
          reqAnts: f.reqAnts, // Độ nặng do UI quy định
          nutrition: f.nutrition || f.reqAnts, // Điểm nở kiến thực thụ
          requiresMilling: needsMilling, // Mồi to / vỏ Kitin cứng bắt buộc cần Kiến Tướng (Major) tới nghiền trước
          millingProgress: needsMilling ? 0 : 100,
          wasMilled: false,
          waiters: [], // id kiến đang ôm mồi
          hasScout: false,
          isCarried: false,
          delivered: false
        });
      }
    });
  }, [foodList]);

  const doWander = useCallback((ant, delta) => {
    const curPeriod = CIRCADIAN_PROFILES[timeOfDayRef.current] || CIRCADIAN_PROFILES.morning;
    const curWeather = weatherModeRef.current;
    const curTemp = soilTempRef.current ?? 28;
    const curTerrM2 = territoryAreaRef.current ?? 50;

    // Bán kính biên giới lãnh thổ Central-Place Foraging tính từ TỔ CHÍNH (NEST_POS: -45, -45) theo thanh trượt A_terr (15m² -> R=56, 50m² -> R=88, 120m² -> R=152)
    const maxForageRadius = 56 + ((curTerrM2 - 15) / 105) * 96;

    ant.timer -= delta;
    if (ant.timer <= 0) {
      // Sinh lý học: Khi lượng nước trong cơ thể xuống dưới ngưỡng (hoặc nhiệt độ đất T_soil cao), kích hoạt nhu cầu tìm Hồ Nước
      const drinkThreshold = (curWeather === 'heatwave' || curTemp >= 36) ? 68 : (curTemp >= 32 || timeOfDayRef.current === 'noon' ? 58 : 50);
      if (ant.state === 'patrolling' && ant.role !== 'guard' && ant.type !== 'queen' && ant.hydration < drinkThreshold) {
        ant.state = 'drinking';
        ant.timer = undefined;
        return;
      }
      ant.wanderDir = randomWanderDir();
      ant.timer = randomWanderTime();
    }

    // Kiến Lính (Soldier / Guard): Tuần tra vành đai bảo vệ quanh cửa tổ co giãn theo diện tích lãnh thổ A_terr
    if (ant.type === 'soldier' || ant.role === 'guard') {
      const distToNestSq = ant.position.distanceToSquared(NEST_POS);
      const guardRadius = (timeOfDayRef.current === 'night' || curTemp <= 19 ? 15 : 21) * (0.75 + 0.5 * (curTerrM2 / 50));
      const guardPerimeterSq = guardRadius * guardRadius;
      if (distToNestSq > guardPerimeterSq) {
        _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
        ant.wanderDir.lerp(_v1, 0.38).normalize();
      }
    } else if (ant.type !== 'queen') {
      // Kiến Thợ & Kiến Tướng: Tuân thủ biên giới Lãnh thổ Kiếm ăn Central-Place Foraging tính từ TỔ CHÍNH (NEST_POS)
      const distToNestSq = ant.position.distanceToSquared(NEST_POS);
      if (distToNestSq > maxForageRadius * maxForageRadius) {
        _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
        ant.wanderDir.lerp(_v1, 0.42).normalize();
      }
    }

    // Tác động Khí động học của Gió Bão (Anemotactic Drift): Kiến Thợ nhỏ (1mg) bị gió đẩy lệch nhiều hơn Kiến Tướng (4mg)
    if (curWeather === 'windstorm') {
      const massDrift = ant.type === 'major' ? 0.15 : (ant.type === 'soldier' ? 0.55 : 1.35);
      ant.position.x += massDrift * delta;
    }

    // Hệ số tốc độ động học nhiệt Arrhenius từ thanh trượt Nhiệt độ Đất T_soil (15°C tê cóng 0.52x -> 30°C tối ưu 1.15x -> 40°C chạy cuống cuồng 1.28x)
    const tempSpeedFactor = curTemp < 22
      ? 0.50 + ((curTemp - 15) / 7) * 0.35
      : curTemp <= 33
        ? 0.85 + ((curTemp - 22) / 11) * 0.35
        : 1.20 + ((curTemp - 33) / 7) * 0.12;

    const qmpSpeedBoost = (ant.qmpBuffTimer || 0) > 0 ? 1.22 : 1.0;
    const casteSpeedFactor = ant.type === 'major' ? 0.85 : (ant.type === 'soldier' ? 1.05 : 1.12);
    reflectIfOOB(ant.position, ant.wanderDir);
    ant.position.addScaledVector(ant.wanderDir, WALK_SPEED * casteSpeedFactor * qmpSpeedBoost * curPeriod.speedMult * tempSpeedFactor * delta);
    resolvePhysics(ant.position, ant.wanderDir);
    ant.targetDir.copy(ant.wanderDir);
    ant.anim = 'Insect|walk_1';
    ant.bioState = 'WANDERING';
  }, []);

  useFrame((state, delta) => {
    const ants = antsDataRef.current;
    const queenAnt = ants[0];
    const circadian = CIRCADIAN_PROFILES[timeOfDay] || CIRCADIAN_PROFILES.morning;
    const isWindstorm = weatherMode === 'windstorm';
    const isTornado = weatherMode === 'tornado';
    const isHeatwave = weatherMode === 'heatwave';

    // Cập nhật Quỹ đạo Vòi Rồng Lốc Xoáy 3D (Tornado Vortex Trajectory & God Mode Target)
    if (isTornado) {
      const tPos = tornadoPosRef.current;
      const tVel = tornadoVelRef.current;
      if (tornadoTargetRef?.current && tornadoTargetRef.current.timer > 0) {
        tornadoTargetRef.current.timer -= delta;
        const dx = tornadoTargetRef.current.x - tPos.x;
        const dz = tornadoTargetRef.current.z - tPos.z;
        const d = Math.hypot(dx, dz);
        if (d > 1.5) {
          tPos.x += (dx / d) * 28.0 * delta;
          tPos.z += (dz / d) * 28.0 * delta;
        }
      } else {
        tPos.x += tVel.x * delta;
        tPos.z += tVel.z * delta;
        if (Math.abs(tPos.x) > 64) tVel.x *= -1;
        if (Math.abs(tPos.z) > 64) tVel.z *= -1;
        // Tránh ủi thẳng vào tâm gò tổ nơi Kiến Chúa ngự
        if (Math.hypot(tPos.x - NEST_POS.x, tPos.z - NEST_POS.z) < 26) {
          tVel.x = Math.abs(tVel.x);
          tVel.z = Math.abs(tVel.z);
        }
      }

      // Cuốn xoáy cả các viên đường chưa khiêng và Nhện Độc nằm trong mắt lốc (r < 15m)
      foodDataRef.current.forEach(f => {
        if (!f.isCarried && !f.delivered) {
          const dx = f.x - tPos.x;
          const dz = f.z - tPos.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < 225.0 && dSq > 0.2) {
            const d = Math.sqrt(dSq);
            const tangX = -dz / d;
            const tangZ = dx / d;
            f.x = Math.max(-78, Math.min(78, f.x + (tangX * 18.0 - (dx / d) * 4.0) * delta));
            f.z = Math.max(-78, Math.min(78, f.z + (tangZ * 18.0 - (dz / d) * 4.0) * delta));
          }
        }
      });
    }

    // Cơ chế 6: Điều hòa phân hóa giai cấp tự động (Adaptive Caste Morphogenesis - Wheeler, 1991)
    if (totalBornRef.current < antCount) {
      spawnTimerRef.current -= delta;
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = 0.2; // Độ trễ bớt giật 200ms

        const liveEnemiesNow = enemyDataRef.current.some(e => !e.killed);
        const unmilledFoodExists = foodDataRef.current.some(f => f.requiresMilling && f.millingProgress < 100 && !f.delivered);
        let currentMajors = 0;
        let currentSoldiers = 0;
        let currentAlive = 0;
        for (let i = 0; i < ants.length; i++) {
          if (ants[i].state !== 'dead') {
            currentAlive++;
            if (ants[i].type === 'major') currentMajors++;
            else if (ants[i].type === 'soldier') currentSoldiers++;
          }
        }
        const majorRatio = currentAlive > 0 ? currentMajors / currentAlive : 0;
        const soldierRatio = currentAlive > 0 ? currentSoldiers / currentAlive : 0;

        // Điều hòa tỷ lệ giai cấp chuẩn sinh học (Tschinkel, 2006): Luôn giữ tối thiểu ~60-65% Kiến Thợ (Minor) để đảm bảo lực lượng khiêng mồi!
        let majorProb = majorRatio >= 0.18 ? 0 : (liveEnemiesNow || unmilledFoodExists ? 0.20 : 0.12);
        let soldierProb = soldierRatio >= 0.22 ? 0 : (liveEnemiesNow || isWindstorm || isTornado || timeOfDay === 'night' ? 0.22 : 0.16);

        const roll = Math.random();
        const spawnedType = roll < majorProb ? 'major' : (roll < majorProb + soldierProb ? 'soldier' : 'minor');
        const spawnedRole = spawnedType === 'major' ? 'major' : (spawnedType === 'soldier' ? 'guard' : 'worker');
        const spawnedHp = spawnedType === 'major' ? 80 : (spawnedType === 'soldier' ? 45 : 25);
        const spawnedPriority = spawnedType === 'major' ? 2 : (spawnedType === 'soldier' ? 1 : 0);

        const spawnOffset = new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4);
        // Hướng xuất phát từ Tổ Chính (-45, -45) tỏa thẳng ra cánh đồng cỏ (+x, +z) để không bị ứ đọng ở góc tường sau tổ
        const outwardAngle = -0.15 + Math.random() * 1.85;
        const outwardDir = new THREE.Vector3(Math.cos(outwardAngle), 0, Math.sin(outwardAngle)).normalize();

        // Nâng trần cá thể 3D trực tiếp trong ô mẫu Quadrat từ 50 lên 120 cá thể nhờ tối ưu GPU DataTexture Atlas
        if (ants.length < 120) {
          const id = ants.length;
          groupRefs.current.push(React.createRef()); // Tự động extend Reference Array
          ants.push({
            id: id,
            position: new THREE.Vector3(NEST_POS.x, 0, NEST_POS.z).add(spawnOffset),
            targetDir: outwardDir.clone(),
            wanderDir: outwardDir.clone(),
            timer: 2.5 + Math.random() * 2.0,
            commCooldown: 4.5,
            pheroTimer: 0,
            state: 'emerging',
            bioState: 'WANDERING',
            anim: 'Insect|walk_1',
            priority: spawnedPriority,
            targetFoodId: null,
            targetCorpseId: null,
            beingCarried: false,
            type: spawnedType,
            role: spawnedRole,
            hp: spawnedHp,
            maxHp: spawnedHp,
            energy: 100,
            hydration: 100,
            age: 0,
            maxAge: 900 + Math.random() * 600,
            qmpBuffTimer: 6.0,
          });
          totalBornRef.current++;
          setForceRender(c => c + 1); // Cập nhật DOM rải đều
        } else {
          // Tính năng nhặt xác tái chế (Không bao giờ ghi đè lên các slot Kiến Chúa #0, #9, #10)
          const deadIndex = ants.findIndex(a => a.id !== 0 && a.id !== 9 && a.id !== 10 && a.state === 'dead' && !a.beingCarried);
          if (deadIndex !== -1) {
            const rAnt = ants[deadIndex];
            rAnt.position.copy(NEST_POS).add(spawnOffset);
            rAnt.targetDir.copy(outwardDir);
            rAnt.wanderDir.copy(outwardDir);
            rAnt.timer = 2.5 + Math.random() * 2.0;
            rAnt.commCooldown = 4.5;
            rAnt.state = 'emerging';
            rAnt.bioState = 'WANDERING';
            rAnt.priority = spawnedPriority;
            rAnt.type = spawnedType;
            rAnt.role = spawnedRole;
            rAnt.hp = spawnedHp;
            rAnt.maxHp = spawnedHp;
            rAnt.energy = 100;
            rAnt.hydration = 100;
            rAnt.age = 0;
            rAnt.maxAge = 900 + Math.random() * 600;
            rAnt.qmpBuffTimer = 6.0;
            totalBornRef.current++; // Đã tái chế xong 1 bé
          }
        }
      }
    }

    // 2. Tác động ngoại vi: Báo động cục bộ & Điều phối Học thuyết Tác chiến Phân tầng
    const liveEnemies = enemyDataRef.current.filter(e => !e.killed);
    liveEnemies.forEach(e => {
      e.pinnedBySoldiers = 0;
      e.tankedByMajors = 0;
    });
    ants.forEach(a => {
      if (a.state === 'attacking') {
        const te = liveEnemies[0];
        if (te) {
          if (a.type === 'soldier') te.pinnedBySoldiers = (te.pinnedBySoldiers || 0) + 1;
          else if (a.type === 'major') te.tankedByMajors = (te.tankedByMajors || 0) + 1;
        }
      }
    });

    const liveQueens = ants.filter(a => a.type === 'queen' && a.state !== 'dead');
    const targetQueenCount = socialFormRef.current === 'polygyne' ? 3 : 1;

    // CƠ CHẾ KẾ VỊ HOÀNG GIA (QUEEN SUCCESSION & EMERGENCY ROYAL BROOD REARING — FLETCHER & BLUM, 1983):
    // Khi Kiến Chúa tử vong -> Mất pheromone ức chế QMP (9-ODA) -> Kiến Thợ Y Tá lập tức bồi dưỡng Sữa Chúa (Trophallaxis giàu protein/lipid)
    // cho Ấu trùng Lưỡng bội (Diploid Female Larva) trong Buồng Ấp Ngầm để ấp nở Tân Kiến Chúa Kế Vị, giữ cho vương quốc không bị tan rã!
    const aliveNonQueenCount = ants.filter(a => a.type !== 'queen' && a.state !== 'dead').length;
    if (liveQueens.length < targetQueenCount && aliveNonQueenCount > 0) {
      // Tốc độ ấp cơ sở 5.8%/giây (~17s), tăng tốc thêm nếu có nhiều Kiến Thợ ở gần tổ chăm sóc buồng ấp
      const nursesNearNest = ants.filter(
        a => a.type === 'minor' && a.state !== 'dead' && a.position.distanceToSquared(NEST_POS) < 400.0
      ).length;
      const nurseBoost = 1.0 + Math.min(0.8, nursesNearNest * 0.15);
      queenSuccessionRef.current = Math.min(100, (queenSuccessionRef.current || 0) + 5.8 * nurseBoost * delta);

      if (queenSuccessionRef.current >= 100) {
        queenSuccessionRef.current = 0;
        queenSuccessionCountRef.current++;
        // Tìm slot Chúa đã tử vong (#0 ưu tiên trước, hoặc #9, #10 trong cấu trúc Đa Chúa) để đăng cơ Tân Kiến Chúa!
        const candidateSlots = socialFormRef.current === 'polygyne' ? [0, 9, 10] : [0];
        let rebornQueen = null;
        for (const qSlot of candidateSlots) {
          if (ants[qSlot] && (ants[qSlot].state === 'dead' || ants[qSlot].type !== 'queen')) {
            rebornQueen = ants[qSlot];
            break;
          }
        }
        if (rebornQueen) {
          rebornQueen.type = 'queen';
          rebornQueen.role = 'queen';
          rebornQueen.maxHp = rebornQueen.id === 0 ? 250 : 220;
          rebornQueen.hp = rebornQueen.maxHp;
          rebornQueen.energy = 100;
          rebornQueen.hydration = 100;
          rebornQueen.age = 0;
          rebornQueen.priority = 3;
          rebornQueen.position.set(NEST_POS.x + 3.5, isXRayMode ? -14.5 : 0, NEST_POS.z + 3.5);
          rebornQueen.state = 'queen_reigning';
          rebornQueen.bioState = 'QUEEN_COURT';
          rebornQueen.anim = 'Insect|walk_1';
          rebornQueen.vortexImmunity = 8.0;
          rebornQueen.qmpWave = 0.01; // Phát xung QMP Đăng Cơ lan tỏa khắp tổ!
          rebornQueen.qmpCooldown = 4.0;
          qmpPulsesRef.current++;
          ants.forEach(other => {
            if (other.state !== 'dead') other.qmpBuffTimer = 16.0;
          });
          liveQueens.push(rebornQueen);
          setForceRender(c => c + 1);
        }
      }
    } else {
      queenSuccessionRef.current = 0;
    }

    const queenThreatened = liveQueens.some(q => liveEnemies.some(e => e.pos.distanceToSquared(q.position) < 3600.0));

    if (!isRaining && !isFlooding) {
      if (liveEnemies.length > 0) {
        ants.forEach(ant => {
          if (ant.type === 'queen') return; // Kiến Chúa được hộ tống, không tự lao vào cắn nhện
          if (ant.state === 'dead' || ant.state === 'emerging' || ant.state === 'hiding' || ant.state === 'hidden_inside' || ant.state === 'airborne_vortex') return;
          if (ant.state.includes('carry') || ant.state === 'milling' || ant.state === 'drinking' || ant.state === 'alarmed' || ant.state === 'attacking') return;
          // Kiến Lính (Soldier) và Kiến Tướng (Major) có tầm radar cảnh giới rộng hơn (75m vs 60m)
          const radarRangeSq = (ant.type === 'soldier' || ant.type === 'major') ? 5625.0 : 3600.0;
          const nearEnemy = liveEnemies.find(e => ant.position.distanceToSquared(e.pos) < radarRangeSq);
          if (nearEnemy) {
            // Giữ lại đội hình Kiến Lính hộ giá từng Kiến Chúa nếu Chúa đang tuần du hoặc bị đe dọa xa
            if (ant.state === 'escorting_queen' && ant.position.distanceToSquared(nearEnemy.pos) > 900.0) return;
            ant.state = 'alarmed';
            ant.bioState = 'ALARMED';
            ant.anim = 'Insect|walk_1';
          }
        });
      }

      // Cơ chế 3: Đội hình Vệ binh Hộ giá Kiến Chúa (Phân bổ đều tối thiểu 2 Kiến Lính kèm sát MỖI Kiến Chúa trong chế độ Đa Chúa Polygyne!)
      if (liveQueens.length > 0 && (isQueenProcession || queenThreatened || timeOfDay === 'night' || isTornado)) {
        const guardsPerQueen = liveQueens.length > 1 ? 2 : 4;
        // Nếu có Vệ binh đang hộ giá một Chúa đã chết hoặc Chúa dư thừa > guardsPerQueen, thu hồi để chia đều cho Chúa thiếu lính
        liveQueens.forEach(q => {
          const currentGuards = ants.filter(a => a.state === 'escorting_queen' && a.escortQueenId === q.id && a.state !== 'dead');
          currentGuards.forEach((g, idx) => {
            g.escortSlot = idx;
            if (idx >= guardsPerQueen && liveQueens.length > 1) {
              g.escortQueenId = null;
            }
          });
        });

        liveQueens.forEach(q => {
          let qGuardCount = ants.filter(a => a.state === 'escorting_queen' && a.escortQueenId === q.id && a.state !== 'dead').length;
          for (let i = 1; i < ants.length && qGuardCount < guardsPerQueen; i++) {
            const a = ants[i];
            if (
              a.type === 'soldier' &&
              a.state !== 'dead' &&
              (a.state === 'patrolling' || a.state === 'following_trail' || a.state === 'nocturnal_guard' || (a.state === 'escorting_queen' && !a.escortQueenId))
            ) {
              a.state = 'escorting_queen';
              a.bioState = 'ESCORTING';
              a.escortQueenId = q.id;
              a.escortSlot = qGuardCount;
              qGuardCount++;
            }
          }
        });
      } else {
        ants.forEach(a => {
          if (a.state === 'escorting_queen') {
            a.state = 'patrolling';
            a.bioState = 'WANDERING';
            a.escortQueenId = null;
          }
        });
      }
    }

    // 2.5 Bay hơi tự nhiên theo Nhiệt độ 4 Buổi / Gió Bão / Mưa Rào + Lập chỉ mục Spatial Hash Grid O(1)
    for (let c = 0; c < GRID_TOTAL_CELLS; c++) {
      _pheroGrid[c].length = 0;
      _antGrid[c].length = 0;
    }

    const pheros = pheromonesRef.current;
    if (pheros.length > 0) {
      const weatherEvapMult = isRaining ? 18.5 : (isTornado ? 3.5 : (isWindstorm ? 2.4 : (isHeatwave ? 2.2 : 1.0)));
      const tempEvapMult = Math.exp(((soilTempRef.current ?? 28) - 28) * 0.065);
      const baseEvapRate = 0.035 * circadian.pheroEvapMult * weatherEvapMult * tempEvapMult;
      const liveEnemiesExist = liveEnemies.length > 0;
      let writeIdx = 0;
      for (let i = 0, len = pheros.length; i < len; i++) {
        const p = pheros[i];
        let evapRate = baseEvapRate;
        if (p.type === 'alarm') {
          evapRate = liveEnemiesExist ? baseEvapRate * 2.5 : baseEvapRate * 8.0;
        } else {
          const foodStillActive = foodDataRef.current.some(f => f.id === p.foodId && !f.isCarried && !f.delivered);
          evapRate = foodStillActive ? baseEvapRate : baseEvapRate * 3.5;
        }
        // Khi có Gió Bão, các phân tử mùi Pheromone bị thổi trôi nhẹ theo chiều gió Đông
        if (isWindstorm) {
          p.pos.x = Math.min(BOUNDS, p.pos.x + 1.15 * delta);
        }
        p.strength -= evapRate * delta;
        if (p.strength > 0.08) {
          pheros[writeIdx++] = p;
          const cx = getGridCoord(p.pos.x);
          const cz = getGridCoord(p.pos.z);
          _pheroGrid[cz * GRID_DIM + cx].push(p);
        }
      }
      pheros.length = writeIdx;
    }

    // Tác động ngoại vi: Chuỗi chuyển pha Mưa Lớn -> Nước Dâng Từ Từ -> Kết Bè Tại Đỉnh Tổ (Có kiến chết đuối nếu ở xa) -> Nước Rút Dần
    if (isFlooding) {
      floodLevelRef.current = Math.min(2.85, floodLevelRef.current + delta * 0.38); // Nước dâng dần trong ~7.5s
    } else if (floodLevelRef.current > 0) {
      floodLevelRef.current = Math.max(0, floodLevelRef.current - delta * 0.55); // Nước rút dần sau khi tắt Đại Hồng Thủy
    }
    const curFloodLevel = floodLevelRef.current;

    if (isFlooding || curFloodLevel > 0.12) {
      const waveAmp = Math.min(0.22, curFloodLevel * 0.08);
      const waveY = curFloodLevel + Math.sin(state.clock.elapsedTime * 2.0) * waveAmp;
      const raftOuterRadius = 7.8;

      ants.forEach((ant, idx) => {
        if (ant.state === 'dead') {
          // Xác kiến chết đuối nổi trập trùng trên mặt nước lũ, khi nước rút thì nằm lại trên mặt đất
          ant.position.y = curFloodLevel > 0.4 ? Math.max(0, waveY - 0.35) : 0;
          return;
        }
        if (ant.state === 'carry_corpse') {
          const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
          if (corpse) corpse.beingCarried = false;
          ant.targetCorpseId = null;
        }
        if (ant.state === 'carrying' || ant.state === 'waiting_to_carry') {
          const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
          if (food) { food.isCarried = false; food.waiters = []; }
        }

        // Vị trí mục tiêu của cá thể trên Bè Kiến Sống ngay tại Đỉnh Gò Tổ (Kiến Chúa ở chính giữa tâm bè r = 0)
        const isQueenAnt = ant.type === 'queen';
        const ringLayer = isQueenAnt ? 0 : Math.floor(Math.sqrt(idx));
        const angle = idx * 2.39996 + state.clock.elapsedTime * 0.25;
        const slotRadius = isQueenAnt ? (ant.id === 0 ? 0 : 1.8) : ringLayer * 1.25;
        const targetX = RAFT_CENTER.x + Math.cos(angle) * slotRadius;
        const targetZ = RAFT_CENTER.z + Math.sin(angle) * slotRadius;
        const dx = targetX - ant.position.x;
        const dz = targetZ - ant.position.z;
        const distToSlotSq = dx * dx + dz * dz;
        const distToRaftCenter = Math.hypot(ant.position.x - RAFT_CENTER.x, ant.position.z - RAFT_CENTER.z);

        // GIAI ĐOẠN 1 (curFloodLevel < 0.75): Nước mới bắt đầu dâng lấp xấp mặt đất -> Kiến chạy TRÊN MẶT ĐẤT (y = 0) về đỉnh Gò Tổ, tuyệt đối KHÔNG đi bộ trên mặt nước!
        if (curFloodLevel < 0.75 && ant.state !== 'rafting') {
          ant.position.y = 0;
          if (distToSlotSq > 1.2) {
            const toMound = _v1.set(dx, 0, dz).normalize();
            const runSpd = isQueenAnt ? WALK_SPEED * 0.85 : RUN_SPEED * 1.35;
            ant.position.addScaledVector(toMound, runSpd * delta);
            resolvePhysics(ant.position, toMound);
            ant.targetDir.copy(toMound);
            ant.anim = 'Insect|walk_1';
            ant.state = isQueenAnt ? 'queen_reigning' : 'hiding';
            ant.bioState = 'ALARMED';
          } else {
            // Đã lên tới đỉnh Gò Tổ -> Bám chặt vào nhau chuẩn bị nổi lên khi nước dâng tới đỉnh gò!
            ant.position.x += dx * Math.min(1, delta * 5.0);
            ant.position.z += dz * Math.min(1, delta * 5.0);
            ant.anim = 'Insect|idle_A2';
            ant.state = 'rafting';
            ant.bioState = 'RAFTING';
          }
          return;
        }

        // GIAI ĐOẠN 2 (curFloodLevel >= 0.75): Nước lũ đã dâng ngập mặt đất và chạm tới đỉnh Gò Tổ!
        if (ant.state === 'rafting' || isQueenAnt || distToRaftCenter <= raftOuterRadius + 4.2) {
          // Những cá thể đã ở trên Gò Tổ hoặc vừa bơi chạm tới rìa bè -> Được đồng đội ngoắc vuốt chân kéo vào Bè Kiến Sống!
          if (distToSlotSq > 0.4) {
            const toSlot = _v1.set(dx, 0, dz).normalize();
            ant.position.addScaledVector(toSlot, WALK_SPEED * 0.95 * delta);
            ant.targetDir.copy(toSlot);
            ant.anim = 'Insect|walk_1';
          } else {
            ant.position.x += dx * Math.min(1, delta * 5.0);
            ant.position.z += dz * Math.min(1, delta * 5.0);
            ant.targetDir.set(Math.cos(angle + Math.PI / 2), 0, Math.sin(angle + Math.PI / 2));
            ant.anim = 'Insect|idle_A2';
          }
          ant.position.y = waveY + (isQueenAnt ? 0.35 : (idx % 3) * 0.14);
          ant.state = 'rafting';
          ant.bioState = 'RAFTING';
        } else {
          // Những cá thể ở quá xa tổ không kịp về trước khi nước dâng cao -> Chới với vùng vẫy giữa dòng nước lũ và có nguy cơ CHẾT ĐUỐI!
          ant.state = 'struggling_flood';
          ant.bioState = 'STRUGGLING_FLOOD';
          ant.anim = 'Insect|walk_1';
          const toRaft = _v1.set(RAFT_CENTER.x - ant.position.x, 0, RAFT_CENTER.z - ant.position.z).normalize();
          // Bị lực cản của nước làm bơi rất chậm (0.32x) và bị dòng lũ đẩy trôi nhẹ
          ant.position.addScaledVector(toRaft, WALK_SPEED * 0.32 * delta);
          ant.position.x += Math.sin(state.clock.elapsedTime * 2.5 + idx) * 1.1 * delta;
          ant.position.y = Math.max(0, waveY - 0.52);
          ant.targetDir.copy(toRaft);

          // Ngạt nước qua khí môn (spiracles) khiến máu & năng lượng tụt nhanh -> một số cá thể ở xa sẽ chết đuối!
          ant.hp -= (4.8 + (idx % 3) * 1.6) * delta;
          ant.energy -= 7.5 * delta;
          if (ant.hp <= 0 || ant.energy <= 0) {
            ant.hp = 0;
            ant.state = 'dead';
            ant.bioState = 'dead_drowned';
            ant.anim = 'Insect|idle_A3';
            ant.priority = 0;
            deathTollRef.current++;
          }
        }
      });
    } else if (isRaining) {
      ants.forEach(ant => {
        if (ant.state === 'dead') return;
        // Vứt xác đang khiêng
        if (ant.state === 'carry_corpse') {
          const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
          if (corpse) corpse.beingCarried = false;
          ant.targetCorpseId = null;
        }
        // Vứt mồi đang khiêng — reset food state
        if (ant.state === 'carrying' || ant.state === 'waiting_to_carry') {
          const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
          if (food) { food.isCarried = false; food.waiters = []; }
        }
        // Tất cả chạy về miệng Gò Tổ rồi bò tụt xuống các buồng hầm ngầm dưới lòng đất!
        const distSq = (ant.position.x - NEST_POS.x) ** 2 + (ant.position.z - NEST_POS.z) ** 2;
        if (distSq > 6.25 && ant.state !== 'hidden_inside') {
          ant.position.y = 0;
          const toNest = _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toNest, RUN_SPEED * 1.45 * delta);
          resolvePhysics(ant.position, toNest);
          ant.targetDir.copy(toNest);
          ant.anim = 'Insect|walk_1';
          ant.bioState = 'ALARMED';
          ant.state = 'hiding';
        } else {
          // Đã tới miệng hố đỉnh gò tổ -> Bò tụt xuống hầm ngầm (y = -6.5 tới -14.2) để trú mưa!
          ant.state = 'hidden_inside';
          ant.bioState = 'WANDERING';
          ant.visibleInXRay = Boolean(isXRayMode);
          const chamberOffsetAngle = ant.id * 1.37;
          const targetChamberX = NEST_POS.x + Math.cos(chamberOffsetAngle) * (ant.type === 'queen' ? 1.5 : 3.8);
          const targetChamberZ = NEST_POS.z + Math.sin(chamberOffsetAngle) * (ant.type === 'queen' ? 1.5 : 3.8);
          const targetChamberY = ant.type === 'queen' ? -14.5 : (ant.id % 2 === 0 ? -7.2 : -11.8);
          ant.position.x += (targetChamberX - ant.position.x) * Math.min(1, delta * 4.5);
          ant.position.z += (targetChamberZ - ant.position.z) * Math.min(1, delta * 4.5);
          ant.position.y += (targetChamberY - (ant.position.y || 0)) * Math.min(1, delta * 4.5);
          ant.anim = 'Insect|idle_A2';
        }
      });
    } else {
      ants.forEach(ant => {
        if (ant.state === 'hiding' || ant.state === 'hidden_inside' || ant.state === 'rafting' || ant.state === 'struggling_flood') {
          // Khi tạnh mưa hoặc nước lũ đã rút cạn: Đàn kiến bò từ hầm ngầm lên mặt đất (y -> 0) rồi tỏa ra kiếm ăn
          if ((ant.position.y || 0) < -0.4 && ant.type !== 'queen') {
            ant.visibleInXRay = true;
            ant.position.y = Math.min(0, (ant.position.y || 0) + 12.0 * delta);
            ant.anim = 'Insect|walk_1';
            return;
          }
          const wasHiddenInside = ant.state === 'hidden_inside' || ant.state === 'rafting';
          ant.state = ant.type === 'queen' ? 'queen_reigning' : 'patrolling';
          ant.bioState = ant.type === 'queen' ? 'QUEEN_COURT' : 'WANDERING';
          ant.position.y = 0;
          ant.visibleInXRay = false;
          if (wasHiddenInside && ant.type !== 'queen') {
            ant.wanderDir = randomWanderDir();
            ant.targetDir.copy(ant.wanderDir);
            ant.anim = 'Insect|walk_1';
            ant.timer = randomWanderTime();
          }
        }
      });
    }

    // Sóng gió giật theo chu kỳ trong chế độ Gió Bão (Wind Gust Wave)
    const windGustStrength = isWindstorm
      ? Math.sin(state.clock.elapsedTime * 2.1) + 0.4 * Math.cos(state.clock.elapsedTime * 4.7)
      : 0;

    // 3. Update Vòng lặp các Thực thể Kiến (Trí tuệ nhân tạo FSM Đa Giai Cấp + Nhịp Sinh Học 4 Buổi & Ứng Phó Thảm Họa)
    ants.forEach(ant => {
      // Cập nhật bộ đếm QMP Buff & Sóng QMP của Kiến Chúa
      if (ant.qmpBuffTimer > 0) ant.qmpBuffTimer = Math.max(0, ant.qmpBuffTimer - delta);
      if (ant.type === 'queen') {
        if (ant.qmpCooldown > 0) ant.qmpCooldown = Math.max(0, ant.qmpCooldown - delta);
        if (ant.qmpWave > 0) {
          ant.qmpWave += delta * 14.0;
          if (ant.qmpWave > 16.0) ant.qmpWave = 0;
        }
      }

      // ẢNH HƯỞNG SINH HỌC THEO THỜI GIAN & 4 BUỔI TRONG NGÀY (Age, Energy, Hydration)
      if (ant.state !== 'dead') {
        ant.age += delta;
        // Trừ hao tĩnh theo giai cấp Kleiber (giảm 30% nếu hưởng QMP, giảm 50% khi trú bóng râm / tụ đàn giữ ấm đêm)
        let decayRate = ant.type === 'queen' ? 1.8 : (ant.type === 'major' ? 1.5 : (ant.type === 'soldier' ? 1.25 : 1.0));
        decayRate *= circadian.energyDecayMult;
        if (ant.qmpBuffTimer > 0) decayRate *= 0.7;
        if (ant.state === 'shade_seeking' || ant.state === 'nocturnal_guard' || ant.state === 'basking') decayRate *= 0.45;
        if (ant.state === 'carrying' || ant.state === 'carry_corpse' || ant.state === 'attacking' || ant.state === 'milling') decayRate *= 2.2;

        // Hệ số khô hạn kết hợp Buổi Trưa / Thảm họa Nắng Hạn / Thanh trượt Nhiệt độ đất T_soil trong Lab
        const curSoilTemp = soilTempRef.current ?? 28;
        const tempHydricMult = curSoilTemp >= 35 ? 1.4 + (curSoilTemp - 34) * 0.25 : (curSoilTemp <= 20 ? 0.55 : 1.0);
        const heatwaveHydricMult = (isHeatwave ? 3.8 : circadian.hydrationLossMult) * tempHydricMult;
        const droughtFactor = ((11 - waterRate) / 5.5) * heatwaveHydricMult;

        // Xử lý Hydration (Kiến Chúa được đoàn tùy tùng mớm nước liên tục nên không tự đi uống nước)
        if (ant.type === 'queen') {
          ant.hydration = Math.max(65, ant.hydration - 0.05 * delta);
          ant.energy = Math.max(30, ant.energy - 0.35 * delta);
        } else {
          if (ant.state === 'drinking') {
            ant.hydration = Math.min(100, ant.hydration + 28.0 * delta);
          } else if (ant.state === 'shade_seeking') {
            // Trú dưới bóng râm bụi cây/hốc đá giúp làm mát cơ thể và phục hồi độ ẩm nhẹ
            ant.hydration = Math.min(100, ant.hydration + 5.5 * delta);
            ant.energy = Math.min(100, ant.energy + 6.5 * delta);
          } else if (ant.state === 'basking') {
            // Phơi nắng ban mai giúp tăng nhiệt năng trao đổi chất
            ant.energy = Math.min(100, ant.energy + 14.0 * delta);
          } else {
            ant.hydration -= 0.2 * decayRate * droughtFactor * delta;
          }
          ant.energy -= 0.1 * decayRate * delta;
        }

        // Cơ chế Trophallaxis tại cửa tổ: Khứ hồi về tổ xin ăn khi cạn kiệt năng lượng
        if (ant.type !== 'queen' && (ant.state === 'hidden_inside' || ant.position.distanceToSquared(NEST_POS) < 100.0)) {
          ant.energy += 25.0 * delta;
          ant.hydration += 15.0 * delta;
          if (ant.energy > 100) ant.energy = 100;
          if (ant.hydration > 100) ant.hydration = 100;
          if (ant.energy > 50 && ant.hydration > 50 && (ant.state === 'returning_to_eat' || ant.state === 'drinking')) {
            ant.state = 'patrolling';
          }
        } else if (ant.type !== 'queen' && (ant.energy < 25 || ant.hydration < 25) && ant.state !== 'returning_to_eat' && ant.state !== 'drinking' && ant.state !== 'airborne_vortex') {
          if (ant.state === 'carrying' || ant.state === 'waiting_to_carry') {
            const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
            if (food) food.waiters = food.waiters.filter(id => id !== ant.id);
          } else if (ant.state === 'carry_corpse') {
            const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
            if (corpse) corpse.beingCarried = false;
          }

          if (ant.hydration < 25) ant.state = 'drinking';
          else ant.state = 'returning_to_eat';
          ant.timer = undefined;
        } else if (ant.type !== 'queen' && (ant.energy < 40 || ant.hydration < 40) && ant.state === 'patrolling') {
          if (ant.hydration < 40) ant.state = 'drinking';
          else ant.state = 'returning_to_eat';
          ant.timer = undefined;
        }

        // Trigger Tử Vong Sinh Lão Bệnh Tử
        if (ant.hp <= 0 || ant.energy <= 0 || ant.hydration <= 0 || ant.age > ant.maxAge) {
          if (ant.state !== 'dead') {
            if (ant.state === 'carrying' || ant.state === 'waiting_to_carry') {
              const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
              if (food) food.waiters = food.waiters.filter(id => id !== ant.id);
            } else if (ant.state === 'carry_corpse') {
              const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
              if (corpse) corpse.beingCarried = false;
            }
            ant.position.y = 0;
            ant.state = 'dead'; ant.anim = 'Insect|idle_A3'; ant.priority = 0;
            if (ant.hp <= 0) ant.bioState = 'dead_killed';
            else if (ant.age > ant.maxAge) ant.bioState = 'dead_old_age';
            else if (ant.hydration <= 0 && (isHeatwave || (soilTempRef.current ?? 28) >= 35)) ant.bioState = 'dead_heatstroke';
            else ant.bioState = 'dead_starvation';
            deathTollRef.current++; // Ghi vào sổ sinh tử
          }
        }
      }

      if (ant.state === 'hiding' || ant.state === 'hidden_inside' || ant.state === 'dead' || ant.state === 'rafting' || ant.state === 'struggling_flood') return;

      // ----------- CƠ CHẾ THẢM HỌA 1: BỊ CUỐN VÀO VÒI RỒNG LỐC XOÁY 3D (TORNADO VORTEX UPDRAFT & SURVIVAL — KỂ CẢ KIẾN CHÚA TRÊN MẶT ĐẤT) -----------
      const isShelteredDeepUnderground = ant.type === 'queen' && isXRayMode && !isQueenProcession && (ant.position.y || 0) < -5.0;
      if (isTornado && !isShelteredDeepUnderground) {
        const tPos = tornadoPosRef.current;
        const dx = ant.position.x - tPos.x;
        const dz = ant.position.z - tPos.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < 225.0 && ant.state !== 'airborne_vortex' && !ant.vortexImmunity) {
          // Bị hút vào mắt lốc xoáy (r < 15m): buông mồi/xác chết và bay xoắn ốc lên không trung (kể cả Kiến Chúa nếu đang ở trên mặt đất)!
          if (ant.state === 'carrying' || ant.state === 'waiting_to_carry') {
            const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
            if (food) {
              food.waiters = food.waiters.filter(id => id !== ant.id);
              if (food.waiters.length < food.reqAnts) food.isCarried = false;
            }
          } else if (ant.state === 'carry_corpse') {
            const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
            if (corpse) corpse.beingCarried = false;
            ant.targetCorpseId = null;
          }
          ant.state = 'airborne_vortex';
          ant.bioState = 'AIRBORNE_VORTEX';
          ant.vortexAngle = Math.atan2(dz, dx);
          ant.vortexTimer = ant.type === 'queen' ? 2.4 : (2.8 + Math.random() * 1.4);
          ant.vortexFlung = false;
        } else if (distSq >= 225.0 && distSq < 961.0 && (ant.state === 'patrolling' || ant.state === 'following_trail')) {
          // Vành đai gió giật ngoài mắt lốc (15m <= r < 31m): Kiến Thợ nhỏ ghì chặt hàm bám đất chống lực hút!
          if (ant.type === 'minor') {
            ant.state = 'wind_anchoring';
            ant.bioState = 'WIND_ANCHORING';
            ant.timer = 1.4;
          }
        }
      }

      if (ant.vortexImmunity > 0) {
        ant.vortexImmunity = Math.max(0, ant.vortexImmunity - delta);
      }

      if (ant.state === 'airborne_vortex') {
        const tPos = tornadoPosRef.current;
        ant.vortexTimer = (ant.vortexTimer || 0) - delta;
        const maxLiftY = ant.type === 'queen' ? 13.5 : 16.0;
        const liftSpeed = ant.type === 'queen' ? 8.2 : 10.5;
        if (isTornado && ant.vortexTimer > 0 && !ant.vortexFlung) {
          ant.vortexAngle = (ant.vortexAngle || 0) + delta * (ant.type === 'queen' ? 6.5 : 8.5);
          ant.position.y = Math.min(maxLiftY, (ant.position.y || 0) + liftSpeed * delta);
          const funnelRadius = 2.2 + (ant.position.y / 16.0) * 10.5;
          ant.position.x = Math.max(-BOUNDS, Math.min(BOUNDS, tPos.x + Math.cos(ant.vortexAngle) * funnelRadius));
          ant.position.z = Math.max(-BOUNDS, Math.min(BOUNDS, tPos.z + Math.sin(ant.vortexAngle) * funnelRadius));
          ant.targetDir.set(-Math.sin(ant.vortexAngle), 0, Math.cos(ant.vortexAngle));
          ant.anim = 'Insect|idle_A3';
          if (ant.position.y >= maxLiftY - 0.5) ant.vortexFlung = true;
        } else {
          // Văng ra khỏi phễu lốc & rơi xuống theo vận tốc giới hạn côn trùng (Terminal Velocity thấp nhờ bộ vỏ Kitin)
          const flingDirX = Math.cos(ant.vortexAngle || 0);
          const flingDirZ = Math.sin(ant.vortexAngle || 0);
          ant.position.x = Math.max(-BOUNDS, Math.min(BOUNDS, ant.position.x + flingDirX * 14.0 * delta));
          ant.position.z = Math.max(-BOUNDS, Math.min(BOUNDS, ant.position.z + flingDirZ * 14.0 * delta));
          ant.position.y = (ant.position.y || 0) - 13.5 * delta;
          if (ant.position.y <= 0) {
            ant.position.y = 0;
            resolvePhysics(ant.position, ant.targetDir);
            if (ant.type === 'queen') {
              // Kiến Chúa mang bụng trứng căng phồng (Physogastric, 14.2mg) bị vòi rồng cuốn lên cao 13.5m đập xuống đất -> VỠ BỤNG TRỨNG TỬ VONG NGAY LẬP TỨC!
              ant.hp = 0;
              ant.state = 'dead';
              ant.bioState = 'dead_tornado';
              ant.anim = 'Insect|idle_A3';
              ant.priority = 0;
              deathTollRef.current++;
            } else {
              // Kiến Thợ/Lính/Tướng bị quăng đập xuống đất chịu chấn thương va đập nặng (14 - 22 HP), cá thể yếu hoặc mảnh mai sẽ tử vong tại chỗ!
              const impactDmg = ant.type === 'minor' ? (15 + Math.random() * 12) : (12 + Math.random() * 10);
              ant.hp -= impactDmg;
              if (ant.hp <= 0) {
                ant.hp = 0;
                ant.state = 'dead';
                ant.bioState = 'dead_tornado';
                ant.anim = 'Insect|idle_A3';
                ant.priority = 0;
                deathTollRef.current++;
              } else {
                ant.vortexImmunity = 5.0; // Miễn nhiễm hút lại trong 5s để kịp bò thoát hiểm
                ant.state = 'patrolling';
                ant.bioState = 'WANDERING';
                ant.timer = randomWanderTime();
              }
            }
          }
        }
        return;
      }

      // ----------- CƠ CHẾ THẢM HỌA 2: BÁM HÀM CHỐNG GIÓ BÃO (ANEMOTACTIC MANDIBULAR ANCHORING) -----------
      if (isWindstorm && windGustStrength > 0.72 && ant.type === 'minor' && ant.state === 'patrolling') {
        // Kiểm tra xem có Kiến Tướng (Major 4.0mg) nào đứng gần che chắn gió cho không
        const shieldedByMajor = ants.some(m => m.type === 'major' && m.state !== 'dead' && m.position.distanceToSquared(ant.position) < 64.0);
        if (!shieldedByMajor) {
          ant.state = 'wind_anchoring';
          ant.bioState = 'WIND_ANCHORING';
          ant.timer = 1.15;
        }
      }

      if (ant.state === 'wind_anchoring') {
        if (!isWindstorm && !isTornado) {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          return;
        }
        ant.anim = 'Insect|idle_A2';
        ant.bioState = 'WIND_ANCHORING';
        ant.timer = (ant.timer || 1.0) - delta;
        if (ant.timer <= 0) {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          ant.timer = randomWanderTime();
        }
        return;
      }

      // ----------- CƠ CHẾ SINH HỌC 4 BUỔI (SÁNG PHƠI NẮNG · TRƯA TRÚ BÓNG RÂM · CHIỀU TỔNG LỰC · TỐI CẢNH GIỚI) -----------
      if (ant.state === 'basking') {
        if (timeOfDay !== 'morning' || weatherMode !== 'clear') {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          return;
        }
        const baskAngle = (ant.id * 1.1) % (Math.PI * 2);
        const baskTarget = _v2.set(NEST_POS.x + Math.cos(baskAngle) * 7.5, 0, NEST_POS.z + Math.sin(baskAngle) * 7.5);
        const distSq = ant.position.distanceToSquared(baskTarget);
        if (distSq > 6.25) {
          const toBask = _v1.subVectors(baskTarget, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toBask, WALK_SPEED * 1.1 * delta);
          resolvePhysics(ant.position, toBask);
          ant.targetDir.copy(toBask);
          ant.anim = 'Insect|walk_1';
        } else {
          ant.anim = 'Insect|idle_A2';
          ant.timer = (ant.timer || 3.5) - delta;
          if (ant.timer <= 0) {
            ant.qmpBuffTimer = Math.max(ant.qmpBuffTimer || 0, 10.0); // Đủ nhiệt lượng ban mai -> tăng tốc xuất kích!
            ant.baskCooldown = 22.0;
            ant.state = 'patrolling';
            ant.bioState = 'WANDERING';
            ant.timer = randomWanderTime();
          }
        }
        return;
      }

      if (ant.state === 'shade_seeking') {
        if (timeOfDay !== 'noon' && !isHeatwave && (soilTempRef.current ?? 28) < 35) {
          // Khi sang Buổi Chiều mát mẻ, hết Nắng Hạn và nhiệt độ đất T_soil < 35°C -> Lập tức tái xuất kích!
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          ant.timer = randomWanderTime();
          return;
        }
        const refuge = SHADE_REFUGES[ant.id % SHADE_REFUGES.length];
        const rPos = _v2.set(refuge.x, 0, refuge.z);
        const distSq = ant.position.distanceToSquared(rPos);
        if (distSq > 14.0) {
          const toShade = _v1.subVectors(rPos, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toShade, RUN_SPEED * 1.15 * delta);
          resolvePhysics(ant.position, toShade);
          ant.targetDir.copy(toShade);
          ant.anim = 'Insect|walk_1';
          ant.bioState = 'SHADE_SEEKING';
        } else {
          ant.anim = 'Insect|idle_A2';
          ant.bioState = 'SHADE_SEEKING';
          ant.timer = (ant.timer || 5.0) - delta;
          if (ant.timer <= 0 && ant.hydration > 88 && !isHeatwave) {
            ant.shadeCooldown = 14.0;
            ant.state = 'patrolling';
            ant.bioState = 'WANDERING';
            ant.timer = randomWanderTime();
          }
        }
        return;
      }

      if (ant.state === 'nocturnal_guard') {
        if (timeOfDay !== 'night' && (soilTempRef.current ?? 28) > 19) {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          ant.timer = randomWanderTime();
          return;
        }
        const guardAngle = ant.id * 0.95 + state.clock.elapsedTime * 0.25;
        const guardRadius = ant.type === 'minor' ? 8.5 : 13.5;
        const gPos = _v2.set(NEST_POS.x + Math.cos(guardAngle) * guardRadius, 0, NEST_POS.z + Math.sin(guardAngle) * guardRadius);
        const distSq = ant.position.distanceToSquared(gPos);
        if (distSq > 4.0) {
          const toGuard = _v1.subVectors(gPos, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toGuard, WALK_SPEED * 0.85 * delta);
          resolvePhysics(ant.position, toGuard);
          ant.targetDir.copy(toGuard);
          ant.anim = 'Insect|walk_1';
        } else {
          ant.targetDir.set(Math.cos(guardAngle), 0, Math.sin(guardAngle));
          ant.anim = 'Insect|idle_A2';
          ant.timer = (ant.timer || 6.0) - delta;
          if (ant.timer <= 0) {
            ant.nocturnalCooldown = 12.0;
            ant.state = 'patrolling';
            ant.bioState = 'WANDERING';
            ant.timer = randomWanderTime();
          }
        }
        return;
      }

      if (ant.baskCooldown > 0) ant.baskCooldown -= delta;
      if (ant.shadeCooldown > 0) ant.shadeCooldown -= delta;
      if (ant.nocturnalCooldown > 0) ant.nocturnalCooldown -= delta;

      // Kích hoạt tự động hành vi sinh học 4 buổi & phản ứng trực tiếp theo Nhiệt độ đất T_soil trong Phòng Lab:
      if (ant.state === 'patrolling' && ant.type === 'minor') {
        const curSoilTemp = soilTempRef.current ?? 28;
        if (timeOfDay === 'morning' && weatherMode === 'clear' && curSoilTemp >= 22 && curSoilTemp <= 31 && ant.id % 5 === 1 && !(ant.baskCooldown > 0) && ant.position.distanceToSquared(NEST_POS) < 625.0) {
          ant.state = 'basking';
          ant.bioState = 'BASKING';
          ant.timer = 3.5;
          return;
        }
        if ((timeOfDay === 'noon' || isHeatwave || curSoilTemp >= 35) && (ant.id % 2 === 0 || ant.hydration < 72 || curSoilTemp >= 38) && !(ant.shadeCooldown > 0)) {
          ant.state = 'shade_seeking';
          ant.bioState = 'SHADE_SEEKING';
          ant.timer = 5.5;
          return;
        }
        if ((timeOfDay === 'night' || curSoilTemp <= 19) && ant.id % 2 === 0 && !(ant.nocturnalCooldown > 0)) {
          ant.state = 'nocturnal_guard';
          ant.bioState = 'NOCTURNAL_GUARD';
          ant.timer = 6.5;
          return;
        }
      }

      // ----------- CƠ CHẾ 2: KIẾN CHÚA TRỊ VÌ & TUẦN DU (HỖ TRỢ ĐƠN CHÚA MONOGYNE & ĐA CHÚA POLYGYNE) -----------
      if (ant.type === 'queen' || ant.state === 'queen_reigning') {
        ant.state = 'queen_reigning';
        ant.bioState = 'QUEEN_COURT';
        const queenSlotIdx = ant.id === 0 ? 0 : (ant.id === 9 ? 1 : 2);
        const slotAngle = queenSlotIdx * 2.094; // 0°, 120°, 240°
        if (isQueenProcession) {
          // Khi bật chế độ Chúa Tuần Du: Các Kiến Chúa ngoi lên mặt đất (y = 0) diễu hành cùng đội Vệ binh Hộ giá
          ant.position.y = 0;
          ant.timer -= delta;
          if (ant.timer <= 0) {
            ant.wanderDir = randomWanderDir();
            ant.timer = 4.0 + Math.random() * 3.0;
          }
          reflectIfOOB(ant.position, ant.wanderDir);
          ant.position.addScaledVector(ant.wanderDir, WALK_SPEED * 0.42 * delta);
          resolvePhysics(ant.position, ant.wanderDir);
          ant.targetDir.copy(ant.wanderDir);
          ant.anim = 'Insect|walk_1';
        } else if (isXRayMode) {
          // Khi bật X-Ray Tổ Ngầm: Các Kiến Chúa bò xuống ngự dưới Buồng Kiến Chúa Trung Tâm (y = -14.5) cạnh các cụm trứng
          const targetChamberX = NEST_POS.x + (queenSlotIdx === 0 ? 0 : Math.cos(slotAngle) * 3.2);
          const targetChamberZ = NEST_POS.z + (queenSlotIdx === 0 ? 0 : Math.sin(slotAngle) * 3.2);
          const dxC = targetChamberX - ant.position.x;
          const dzC = targetChamberZ - ant.position.z;
          const dyC = -14.5 - (ant.position.y || 0);
          ant.position.x += dxC * Math.min(1, delta * 6.0);
          ant.position.z += dzC * Math.min(1, delta * 6.0);
          ant.position.y = (ant.position.y || 0) + dyC * Math.min(1, delta * 6.0);
          if (dxC * dxC + dzC * dzC + dyC * dyC > 0.25) {
            ant.anim = 'Insect|walk_1';
          } else {
            ant.anim = 'Insect|idle_A2';
          }
          const slowTurn = state.clock.elapsedTime * 0.3 + slotAngle;
          ant.targetDir.set(Math.cos(slowTurn), 0, Math.sin(slowTurn));
        } else {
          // Mặc định trên bề mặt: Các Kiến Chúa ngự tại Sân Chầu Hoàng Gia sát cửa tổ (y = 0) để Đoàn Tùy Tùng hầu hạ
          if ((ant.position.y || 0) < -0.15) {
            ant.position.y = Math.min(0, (ant.position.y || 0) + 18.0 * delta);
            ant.anim = 'Insect|walk_1';
          } else {
            ant.position.y = 0;
          }
          const courtOffsetR = queenSlotIdx === 0 ? 0 : 4.2;
          const royalCourtPos = _v2.set(
            NEST_POS.x + 6 + Math.cos(slotAngle) * courtOffsetR,
            0,
            NEST_POS.z + 6 + Math.sin(slotAngle) * courtOffsetR
          );
          const distToCourtSq = ant.position.distanceToSquared(royalCourtPos);
          if (distToCourtSq > 6.0) {
            const toCourt = _v1.subVectors(royalCourtPos, ant.position).setY(0).normalize();
            ant.position.addScaledVector(toCourt, WALK_SPEED * 0.45 * delta);
            resolvePhysics(ant.position, toCourt);
            ant.targetDir.copy(toCourt);
            ant.anim = 'Insect|walk_1';
          } else {
            ant.anim = 'Insect|idle_A2';
            const slowTurn = state.clock.elapsedTime * 0.3 + slotAngle;
            ant.targetDir.set(Math.cos(slowTurn), 0, Math.sin(slowTurn));
          }
        }
        return;
      }

      // ----------- CƠ CHẾ 2B: KIẾN THỢ HẦU HẠ & MỚM MỒI CHO CÁC KIẾN CHÚA (ROYAL TROPHALLAXIS) -----------
      if (ant.state === 'royal_trophallaxis') {
        const targetQ = ants.find(q => q.id === ant.targetQueenId && q.type === 'queen' && q.state !== 'dead') || liveQueens[0];
        if (!targetQ || targetQ.state === 'dead') {
          ant.state = 'patrolling';
          return;
        }
        const qx = targetQ.position.x - ant.position.x;
        const qz = targetQ.position.z - ant.position.z;
        const distSq = qx * qx + qz * qz;
        if (distSq > 6.25) {
          const toQueen = _v1.set(qx, 0, qz).normalize();
          ant.position.addScaledVector(toQueen, RUN_SPEED * delta);
          resolvePhysics(ant.position, toQueen);
          ant.targetDir.copy(toQueen);
          ant.anim = 'Insect|walk_1';
          ant.bioState = 'ROYAL_TROPHALLAXIS';
        } else {
          ant.anim = 'Insect|idle_A2';
          ant.bioState = 'ROYAL_TROPHALLAXIS';
          ant.targetDir.set(qx, 0, qz).normalize();
          ant.timer = (ant.timer === undefined || ant.timer > 2.0) ? 1.1 : ant.timer - delta;
          targetQ.energy = Math.min(100, targetQ.energy + 22.0 * delta);
          targetQ.hydration = Math.min(100, targetQ.hydration + 18.0 * delta);
          targetQ.hp = Math.min(targetQ.maxHp, targetQ.hp + 10.0 * delta);
          ant.energy = Math.max(30, ant.energy - 8.0 * delta);

          if (ant.timer <= 0) {
            // Kích hoạt Sóng Pheromone Hoàng Gia (QMP Pulse) từ vị trí Kiến Chúa vừa được hầu hạ!
            if (targetQ.qmpCooldown <= 0) {
              targetQ.qmpWave = 0.01;
              targetQ.qmpCooldown = 6.0;
              qmpPulsesRef.current++;
              ants.forEach(other => {
                if (other.state !== 'dead' && other.position.distanceToSquared(targetQ.position) < 1444.0) {
                  other.qmpBuffTimer = 14.0;
                }
              });
            }
            ant.qmpBuffTimer = 14.0;
            ant.commCooldown = 5.0;
            ant.state = 'patrolling';
            ant.timer = randomWanderTime();
          }
        }
        return;
      }

      // ----------- CƠ CHẾ 3: KIẾN LÍNH HỘ GIÁ TỪNG KIẾN CHÚA (ROYAL PHALANX ESCORT) -----------
      if (ant.state === 'escorting_queen') {
        const guardedQueen =
          ants.find(q => q.id === ant.escortQueenId && q.type === 'queen' && q.state !== 'dead') ||
          liveQueens[ant.id % Math.max(1, liveQueens.length)];
        if (!guardedQueen || guardedQueen.state === 'dead' || (!isQueenProcession && !queenThreatened && timeOfDay !== 'night' && !isTornado)) {
          ant.state = 'patrolling';
          ant.escortQueenId = null;
          return;
        }
        const slotIdx = ant.escortSlot ?? (ant.id % 2);
        const totalSlots = liveQueens.length > 1 ? 2 : 4;
        const escortAngle = (slotIdx * ((Math.PI * 2) / totalSlots)) + (guardedQueen.id * 0.7) + state.clock.elapsedTime * 0.85;
        const escortRadius = 4.2;
        const targetX = guardedQueen.position.x + Math.cos(escortAngle) * escortRadius;
        const targetZ = guardedQueen.position.z + Math.sin(escortAngle) * escortRadius;
        const dx = targetX - ant.position.x;
        const dz = targetZ - ant.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq > 0.6) {
          const toSlot = _v1.set(dx, 0, dz).normalize();
          ant.position.addScaledVector(toSlot, RUN_SPEED * 1.15 * delta);
          resolvePhysics(ant.position, toSlot);
          ant.targetDir.copy(toSlot);
          ant.anim = 'Insect|walk_1';
        } else {
          ant.position.x += dx * Math.min(1, delta * 5.0);
          ant.position.z += dz * Math.min(1, delta * 5.0);
          // Quay mặt hướng ra ngoài vòng tròn để cảnh giới thiên địch
          ant.targetDir.set(Math.cos(escortAngle), 0, Math.sin(escortAngle));
          ant.anim = 'Insect|idle_A2';
        }
        ant.bioState = 'ESCORTING';
        return;
      }

      // ----------- CƠ CHẾ 1: KIẾN TƯỚNG NGHIỀN HẠT / XẺ VỎ KITIN ("CUTTERS & CARRIERS" MILLING) -----------
      if (ant.state === 'milling') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        if (!food || food.delivered || food.isCarried || !food.requiresMilling || food.millingProgress >= 100) {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          ant.targetFoodId = null;
          ant.timer = randomWanderTime();
          return;
        }
        const fPos = _v2.set(food.x, 0, food.z);
        const distSq = ant.position.distanceToSquared(fPos);
        if (distSq > 16.0) {
          const toFood = _v1.subVectors(fPos, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toFood, RUN_SPEED * circadian.speedMult * delta);
          resolvePhysics(ant.position, toFood);
          ant.targetDir.copy(toFood);
          ant.anim = 'Insect|walk_1';
          ant.bioState = 'MILLING';
        } else {
          ant.anim = 'Insect|idle_A2';
          ant.bioState = 'MILLING';
          ant.targetDir.subVectors(fPos, ant.position).setY(0).normalize();
          // Buổi Chiều (afternoon): Kiến Tướng tăng +35% công suất nghiền hạt chuẩn bị tích trữ qua đêm
          const afternoonMillingBoost = timeOfDay === 'afternoon' ? 1.35 : 1.0;
          food.millingProgress = Math.min(100, (food.millingProgress || 0) + 42.0 * afternoonMillingBoost * delta);
          if (food.millingProgress >= 100) {
            food.requiresMilling = false;
            food.wasMilled = true;
            food.reqAnts = 2; // Đã được Kiến Tướng cắt nhỏ: chỉ cần 2 Kiến Thợ Nhỏ (Minor) là khiêng chạy băng băng!
            milledCountRef.current++;
            // Kiến Tướng hoàn tất nhiệm vụ cơ học, nhường phần khuân vác cho Kiến Thợ để tiết kiệm 2.83 MEU
            ant.state = 'patrolling';
            ant.bioState = 'WANDERING';
            ant.targetFoodId = null;
            ant.timer = randomWanderTime();
          }
        }
        return;
      }

      // ----------- CƠ CHẾ 5: KIẾN THỢ Y TÁ LIẾM VẾT THƯƠNG & KHỬ ĐỘC (ALLOGROOMING MEDIC) -----------
      if (ant.state === 'allogrooming') {
        ant.anim = 'Insect|idle_A2';
        ant.bioState = 'ALLOGROOMING';
        ant.timer -= delta;
        if (ant.timer <= 0) {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          ant.commCooldown = 4.0;
        }
        return;
      }

      // ----------- EMERGING (Chui ra từ lỗ hang) -----------
      if (ant.state === 'emerging') {
        ant.position.addScaledVector(ant.targetDir, WALK_SPEED * 0.6 * delta);
        ant.anim = 'Insect|walk_1';
        ant.timer -= delta;
        if (ant.timer <= 0 || ant.position.distanceToSquared(NEST_POS) > 100.0) {
          ant.state = 'patrolling';
          ant.timer = randomWanderTime();
        }
        return;
      }

      // ----------- CƠ CHẾ 4: HỌC THUYẾT TÁC CHIẾN PHÂN TẦNG (MAJOR TANK + SOLDIER LEG-PIN + MINOR SWARM) -----------
      if (ant.state === 'alarmed' || ant.state === 'attacking') {
        const targetEnemy = enemyDataRef.current.find(e => !e.killed);
        if (targetEnemy) {
          // Tiết Pheromone Báo Động (2-ethyl-3,6-dimethylpyrazine) từ tuyến hàm dưới để dẫn đường cho đồng đội ứng cứu
          ant.pheroTimer = (ant.pheroTimer || 0) - delta;
          if (ant.pheroTimer <= 0) {
            depositOrReinforcePheromone(
              pheromonesRef.current,
              ant.position.x,
              ant.position.z,
              targetEnemy.pos.x - ant.position.x,
              targetEnemy.pos.z - ant.position.z,
              'alarm_' + targetEnemy.id,
              1.35,
              'alarm'
            );
            ant.pheroTimer = 0.65;
          }

          const distSq = ant.position.distanceToSquared(targetEnemy.pos);
          if (distSq > 16.0) { // Lao vào bao vây với bụng vểnh cao (Gaster Flagging)
            ant.state = 'alarmed';
            const toEnemy = _v1.subVectors(targetEnemy.pos, ant.position).setY(0).normalize();
            ant.position.addScaledVector(toEnemy, RUN_SPEED * 1.5 * circadian.speedMult * delta);
            resolvePhysics(ant.position, toEnemy);
            ant.targetDir.copy(toEnemy);
            ant.anim = 'Insect|walk_1';
            ant.bioState = 'ALARMED';
          } else {
            // Bao vây theo 3 vòng chiến thuật đồng tâm:
            // Vòng trong (r=2.4): Kiến Tướng (Major) làm lá chắn Kitin chịu đòn & nghiền khớp
            // Vòng giữa (r=3.2): Kiến Lính (Soldier) cắn khóa 8 chân nhện (làm chậm nhện tới 75%)
            // Vòng ngoài (r=4.0): Kiến Thợ (Minor) cong bụng chích nọc Solenopsin hội đồng
            ant.state = 'attacking';
            ant.anim = 'Insect|idle_A2';
            const tacticalRadius = ant.type === 'major' ? 2.4 : (ant.type === 'soldier' ? 3.2 : 4.0);
            const ringAngle = ant.id * 1.37 + state.clock.elapsedTime * (ant.id % 2 === 0 ? 0.7 : -0.7);
            const idealX = targetEnemy.pos.x + Math.cos(ringAngle) * tacticalRadius;
            const idealZ = targetEnemy.pos.z + Math.sin(ringAngle) * tacticalRadius;
            ant.position.x += (idealX - ant.position.x) * Math.min(1, delta * 5.0);
            ant.position.z += (idealZ - ant.position.z) * Math.min(1, delta * 5.0);
            ant.targetDir.subVectors(targetEnemy.pos, ant.position).setY(0).normalize();

            const myDmg = ant.type === 'major' ? 16.0 : (ant.type === 'soldier' ? 8.5 : 4.0);
            targetEnemy.hp -= myDmg * delta;
            if (targetEnemy.hp <= 0) targetEnemy.killed = true;

            // Hiệu ứng Lá Chắn Kitin của Kiến Tướng (Major Armor Shield):
            // Nếu có Kiến Tướng đang đứng vòng trong chịu đòn, Kiến Lính và Kiến Thợ được giảm 60% sát thương AoE từ nhện!
            const hasMajorShield = (targetEnemy.tankedByMajors || 0) > 0;
            const aoeDamageTaken = ant.type === 'major'
              ? 1.8
              : (hasMajorShield ? 0.8 : 2.0);
            ant.hp -= aoeDamageTaken * circadian.spiderAggroMult * delta;
            if (ant.hp <= 0) {
              ant.state = 'dead';
              ant.anim = 'Insect|idle_A3';
              ant.bioState = 'dead_killed';
              if (ant.priority > 0) ant.priority = 0;
              deathTollRef.current++; // Ghi vào sổ sinh tử
            } else {
              ant.bioState = 'ATTACKING';
            }
          }
        } else { // Quét dọn nếu nhện chết
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
        }
      }

      // ----------- PATROLLING & NECROPHORESIS & TRAIL FOLLOWING (TRA CỨU SPATIAL HASH GRID O(1)) -----------
      else if (ant.state === 'patrolling' || ant.state === 'following_trail') {
        if (ant.commCooldown > 0) ant.commCooldown -= delta;

        // Cơ chế 2: Nếu là Kiến Thợ Nhỏ (Minor) no bụng đứng gần bất kỳ Kiến Chúa nào đang đói -> Vào hầu hạ mớm mồi (Royal Retinue)
        if (ant.type === 'minor' && ant.energy > 55 && !(ant.commCooldown > 0) && liveQueens.length > 0) {
          for (let qi = 0; qi < liveQueens.length; qi++) {
            const q = liveQueens[qi];
            if (q.energy < 88 || q.qmpCooldown <= 0) {
              const qdx = ant.position.x - q.position.x;
              const qdz = ant.position.z - q.position.z;
              const distToQueenSq = qdx * qdx + qdz * qdz;
              if (distToQueenSq < 324.0) { // Trong bán kính ngang 18m quanh Kiến Chúa đó
                ant.state = 'royal_trophallaxis';
                ant.bioState = 'ROYAL_TROPHALLAXIS';
                ant.targetQueenId = q.id;
                ant.timer = 1.1;
                return;
              }
            }
          }
        }

        let foundFood = false; let foodToApproach = null; let foundCorpse = false;

        // Quét tìm xác đồng đội (Necrophoresis - do Kiến Thợ đảm nhận) - Buổi Chiều tăng +45% tầm phát hiện axit oleic từ xác chết
        const corpseDetectSq = timeOfDay === 'afternoon' ? 470.0 : 225.0;
        if (ant.state === 'patrolling' && ant.type === 'minor') {
          for (const other of antsDataRef.current) {
            if (other.id !== ant.id && other.state === 'dead' && !other.beingCarried && other.position.distanceToSquared(GRAVEYARD_POS) > 400.0) {
              const dSq = ant.position.distanceToSquared(other.position);
              if (dSq < 16.0) { // Chạm xác
                ant.state = 'carry_corpse';
                ant.targetCorpseId = other.id;
                other.beingCarried = true;
                foundCorpse = true;
                break;
              } else if (dSq < corpseDetectSq) { // Thấy xác quanh quẩn (< 15m thường, < 21.7m buổi chiều)
                const toCorpse = _v1.subVectors(other.position, ant.position).setY(0).normalize();
                ant.position.addScaledVector(toCorpse, RUN_SPEED * circadian.speedMult * delta);
                resolvePhysics(ant.position, toCorpse);
                ant.targetDir.copy(toCorpse);
                foundCorpse = true;
                break;
              }
            }
          }
        }

        // Tự động tìm mồi (Phân công "Cutters & Carriers" giữa Kiến Tướng và Kiến Thợ, điều biến thị giác theo Buổi Sáng/Trưa/Chiều/Tối)
        const visMultSq = circadian.visualRangeMult * circadian.visualRangeMult;
        const hasAnyUnmilledFood = foodDataRef.current.some(uf => !uf.isCarried && uf.requiresMilling && uf.millingProgress < 100);
        if (!foundCorpse) {
          for (const f of foodDataRef.current) {
            if (!f.isCarried) {
              const fPos = _v2.set(f.x, 0, f.z);

              // Kiến Lính (Soldier) phớt lờ các cục mồi nằm ngoài bán kính bảo vệ 28m quanh cửa tổ
              if ((ant.type === 'soldier' || ant.role === 'guard') && fPos.distanceToSquared(NEST_POS) > 784.0) {
                continue;
              }
              // Kiến Tướng (Major) ưu tiên tìm tới các tảng mồi to/cứng cần nghiền vỏ (nhưng nếu trên sân đã nghiền xong hết thì phụ Kiến Thợ khiêng luôn!)
              if (ant.type === 'major' && hasAnyUnmilledFood && !f.requiresMilling && f.reqAnts <= 2) {
                continue;
              }

              const distSq = ant.position.distanceToSquared(fPos);
              if (distSq < 16.0) { // Chạm trúng mồi
                if (f.requiresMilling && f.millingProgress < 100 && ant.type === 'major') {
                  ant.state = 'milling';
                  ant.bioState = 'MILLING';
                  ant.targetFoodId = f.id;
                } else {
                  ant.state = 'evaluating';
                  ant.timer = 0.6;
                  ant.targetFoodId = f.id;
                }
                foundFood = true;
                break;
              } else if (distSq < (ant.type === 'major' && f.requiresMilling ? 2025.0 : 900.0) * visMultSq) {
                // Tầm nhìn quang học ommatidia suy giảm vào Buổi Tối (0.55x) và sắc bén vào Buổi Sáng (1.15x)
                foodToApproach = fPos;
              }
            }
          }

          if (!foundFood) {
            if (foodToApproach) {
              const toFood = _v1.subVectors(foodToApproach, ant.position).setY(0).normalize();
              ant.position.addScaledVector(toFood, RUN_SPEED * circadian.speedMult * delta);
              resolvePhysics(ant.position, toFood);
              ant.targetDir.copy(toFood);
              ant.anim = 'Insect|walk_1';
            } else {
              // Kiến Lính (Soldier) giữ vị trí tuần tra vành đai, trừ khi ngửi thấy Alarm Pheromone
              if (ant.type === 'soldier' || ant.role === 'guard') {
                if (ant.state === 'following_trail') ant.state = 'patrolling';
                doWander(ant, delta);
              } else {
                // Tra cứu Pheromone O(1) qua 9 ô lân cận (3x3 Spatial Hash Grid)
                // Buổi Tối: Độ nhạy khứu giác râu (olfactoryRangeMult = 1.45x) tăng mạnh bù đắp cho thị giác!
                const pheroRangeSq = 144.0 * circadian.olfactoryRangeMult * circadian.olfactoryRangeMult;
                const avgDir = _v3.set(0, 0, 0);
                let totalWeight = 0;
                let triggeredAlarm = false;
                const ax = ant.position.x;
                const az = ant.position.z;
                const cx = getGridCoord(ax);
                const cz = getGridCoord(az);

                const minGX = cx > 0 ? cx - 1 : 0;
                const maxGX = cx < GRID_DIM - 1 ? cx + 1 : GRID_DIM - 1;
                const minGZ = cz > 0 ? cz - 1 : 0;
                const maxGZ = cz < GRID_DIM - 1 ? cz + 1 : GRID_DIM - 1;

                for (let gz = minGZ; gz <= maxGZ && !triggeredAlarm; gz++) {
                  const rowOffset = gz * GRID_DIM;
                  for (let gx = minGX; gx <= maxGX; gx++) {
                    const cell = _pheroGrid[rowOffset + gx];
                    for (let pi = 0, cLen = cell.length; pi < cLen; pi++) {
                      const p = cell[pi];
                      const dx = p.pos.x - ax;
                      const dz = p.pos.z - az;
                      const dSq = dx * dx + dz * dz;
                      if (dSq < pheroRangeSq && dSq > 1.0) { // Tầm ngửi Pheromone biến thiên theo nhịp sinh học
                        if (p.type === 'alarm' && p.strength > 0.35 && enemyDataRef.current.some(e => !e.killed)) {
                          ant.state = 'alarmed';
                          ant.bioState = 'ALARMED';
                          ant.anim = 'Insect|walk_1';
                          triggeredAlarm = true;
                          break;
                        }

                        const invDist = 1.0 / Math.sqrt(dSq);
                        const toNodeX = dx * invDist;
                        const toNodeZ = dz * invDist;

                        if (toNodeX * ant.targetDir.x + toNodeZ * ant.targetDir.z > -0.2) {
                          const typeBoost = p.type === 'reinforced' ? 1.45 : 1.0;
                          const w = (p.strength * typeBoost) / (1 + dSq * 0.45);

                          let combX = p.toFoodDir.x * 0.7 + toNodeX * 0.3;
                          let combZ = p.toFoodDir.z * 0.7 + toNodeZ * 0.3;
                          const combLen = Math.hypot(combX, combZ);
                          if (combLen > 0.0001) {
                            combX /= combLen;
                            combZ /= combLen;
                            avgDir.x += combX * w;
                            avgDir.z += combZ * w;
                            totalWeight += w;
                          }
                        }
                      }
                    }
                  }
                }

                if (triggeredAlarm) {
                  return;
                } else if (totalWeight > 0.001 && avgDir.lengthSq() > 0.001) {
                  avgDir.normalize();

                  const currentAngle = Math.atan2(ant.targetDir.x, ant.targetDir.z);
                  const targetAngle = Math.atan2(avgDir.x, avgDir.z);

                  let deltaAngle = targetAngle - currentAngle;
                  while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
                  while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

                  const maxTurn = delta * 3.0;
                  if (Math.abs(deltaAngle) > maxTurn) {
                    deltaAngle = Math.sign(deltaAngle) * maxTurn;
                  }

                  const newAngle = currentAngle + deltaAngle;
                  ant.targetDir.set(Math.sin(newAngle), 0, Math.cos(newAngle));

                  const qmpBoost = (ant.qmpBuffTimer || 0) > 0 ? 1.22 : 1.0;
                  ant.position.addScaledVector(ant.targetDir, RUN_SPEED * 0.8 * circadian.speedMult * qmpBoost * delta);
                  resolvePhysics(ant.position, ant.targetDir);

                  ant.wanderDir.copy(ant.targetDir);
                  ant.state = 'following_trail';
                  ant.anim = 'Insect|walk_1';
                } else {
                  if (ant.state === 'following_trail') ant.state = 'patrolling';
                  doWander(ant, delta);
                }
              }
            }
          }
        }
      }

      // ----------- CARRY CORPSE (Vác xác tha vào nghĩa địa) -----------
      else if (ant.state === 'carry_corpse') {
        const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
        if (!corpse) { ant.state = 'patrolling'; return; }
        _v1.subVectors(GRAVEYARD_POS, ant.position).setY(0).normalize();
        ant.position.addScaledVector(_v1, WALK_SPEED * 0.8 * circadian.speedMult * delta);
        resolvePhysics(ant.position, _v1);
        ant.targetDir.copy(_v1);
        ant.anim = 'Insect|walk_1';

        corpse.position.copy(ant.position).addScaledVector(ant.targetDir, -2.5);

        if (ant.position.distanceToSquared(GRAVEYARD_POS) < 36.0) {
          ant.state = 'patrolling';
          corpse.beingCarried = false;
          ant.targetCorpseId = null;
        }
      }

      // ----------- TROPHALLAXIS (CHẠY VỀ TỔ XIN ĂN VÌ ĐÓI) -----------
      else if (ant.state === 'returning_to_eat') {
        _v1.subVectors(NEST_POS, ant.position).setY(0);
        if (_v1.lengthSq() > 100.0) {
          _v1.normalize();
          ant.position.addScaledVector(_v1, WALK_SPEED * 1.5 * circadian.speedMult * delta);
          resolvePhysics(ant.position, _v1);
          ant.targetDir.copy(_v1);
        }
        ant.anim = 'Insect|walk_1';
        ant.bioState = 'HUNGRY';
      }

      // ----------- EVALUATING TRINH SÁT & PHÂN CÔNG "CUTTERS & CARRIERS" -----------
      else if (ant.state === 'evaluating') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        if (!food || food.isCarried) { ant.state = 'patrolling'; return; }

        ant.anim = 'Insect|idle_A2'; ant.bioState = 'FOOD_RECRUITMENT';
        _v1.set(food.x, 0, food.z);
        ant.targetDir.subVectors(_v1, ant.position).normalize();
        ant.timer -= delta;
        if (ant.timer <= 0) {
          // Cơ chế 1: Nếu mồi có lớp vỏ Kitin/vỏ hạt cứng chưa được sơ chế (requiresMilling)
          if (food.requiresMilling && food.millingProgress < 100) {
            if (ant.type === 'major') {
              // Kiến Tướng (Major) dùng cặp hàm Edentate cối xay nghiền vỡ vỏ cứng ngay tại chỗ!
              ant.state = 'milling';
              ant.bioState = 'MILLING';
              return;
            } else {
              // Kiến Thợ Nhỏ (Minor) không thể cắn vỡ vỏ cứng -> Lập tức chạy về tổ rải Pheromone đậm đặc gọi Kiến Tướng (Major) ra tiếp ứng!
              food.hasScout = true;
              ant.state = 'recruit_return';
              return;
            }
          }

          if (food.reqAnts === 1) {
            if (!food.waiters.includes(ant.id)) food.waiters.push(ant.id);
            food.hasScout = true;
            ant.state = 'waiting_to_carry';
            return;
          }

          if (!food.hasScout) {
            food.hasScout = true;
            ant.state = 'recruit_return';
          } else {
            if (!food.waiters.includes(ant.id)) {
              food.waiters.push(ant.id);
            }
            ant.state = 'waiting_to_carry';
            ant.timer = 20.0;
          }
        }
      }

      // ----------- RECRUIT RETURN (CHẠY VỀ & NHẢ MÙI TỰ XÚC TÁC THEO CHẤT LƯỢNG MỒI) -----------
      else if (ant.state === 'recruit_return') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        const toNest = _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
        ant.position.addScaledVector(toNest, RUN_SPEED * circadian.speedMult * delta);
        resolvePhysics(ant.position, toNest);
        ant.targetDir.copy(toNest);
        ant.anim = 'Insect|walk_1';
        ant.bioState = 'WANDERING';

        ant.pheroTimer -= delta;
        if (ant.pheroTimer <= 0 && food && ant.position.distanceToSquared(NEST_POS) > 225.0) {
          const isCallingMajor = food.requiresMilling && food.millingProgress < 100;
          const qualityStrength = Math.min(1.6, (isCallingMajor ? 1.25 : 0.9) + (food.nutrition || food.reqAnts) * 0.05);
          depositOrReinforcePheromone(
            pheromonesRef.current,
            ant.position.x,
            ant.position.z,
            food.x - ant.position.x,
            food.z - ant.position.z,
            food.id,
            qualityStrength,
            isCallingMajor ? 'reinforced' : 'trail'
          );
          ant.pheroTimer = 0.45;
        }

        if (ant.position.distanceToSquared(NEST_POS) < 36.0) {
          ant.state = 'following_trail';
          ant.targetDir.negate();
        }
      }

      // ----------- WAITING TO CARRY -----------
      else if (ant.state === 'waiting_to_carry') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        if (!food || food.isCarried) {
          if (ant.state !== 'carrying') {
            ant.state = 'patrolling';
            ant.priority = ant.type === 'major' ? 2 : (ant.type === 'soldier' ? 1 : 0);
            ant.targetFoodId = null;
            ant.timer = randomWanderTime();
          }
          return;
        }

        if (food.waiters.length >= food.reqAnts && !food.waiters.includes(ant.id)) {
          ant.state = 'patrolling';
          ant.priority = ant.type === 'major' ? 2 : (ant.type === 'soldier' ? 1 : 0);
          ant.targetFoodId = null;
          ant.timer = randomWanderTime();
          return;
        }

        const fPos = _v2.set(food.x, 0, food.z);
        ant.anim = 'Insect|idle_A2';
        ant.bioState = 'GREETING';
        ant.targetDir.subVectors(fPos, ant.position).normalize();

        ant.timer -= delta;
        if (ant.timer <= 0) {
          ant.state = 'recruit_return';
          const idx = food.waiters.indexOf(ant.id);
          if (idx > -1) food.waiters.splice(idx, 1);
        }
      }

      else if (ant.state === 'drinking') {
        const lakePos = _v3.set(60, 0, 40);
        const distSq = ant.position.distanceToSquared(lakePos);
        if (distSq > 441.0) {
          const toLake = _v1.subVectors(lakePos, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toLake, RUN_SPEED * circadian.speedMult * delta);
          resolvePhysics(ant.position, toLake);
          ant.targetDir.copy(toLake);
          ant.anim = 'Insect|walk_1';
        } else {
          ant.anim = 'Insect|idle_A2';
          ant.bioState = 'FOOD_RECRUITMENT';
          ant.targetDir.subVectors(lakePos, ant.position).setY(0).normalize();

          if (ant.timer === undefined || ant.timer > 15.0) ant.timer = 10.0;
          ant.timer -= delta;
          if (ant.timer <= 0) {
            ant.state = 'patrolling';
          }
        }
      }

      else if (ant.state === 'communicating') {
        ant.timer -= delta;
        if (ant.timer <= 0) {
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
          ant.commCooldown = 3.0;
        }
      }
    });

    // CẬP NHẬT FSM KẺ SĂN MỒI (SPIDER FSM - CÓ HIỆU ỨNG BỊ KIẾN LÍNH KHÓA KHỚP CHÂN & SĂN ĐÊM +30%)
    enemyDataRef.current.forEach(e => {
      if (e.killed) return;
      if (e.landed === false) {
        e.isMoving = false;
        e.isAttacking = false;
        return;
      }
      // Nếu Lốc Xoáy quét qua nhện -> Nhện cũng bị cuốn xoay và mất máu
      if (weatherMode === 'tornado') {
        const tdx = e.pos.x - tornadoPosRef.current.x;
        const tdz = e.pos.z - tornadoPosRef.current.z;
        const tDist = Math.hypot(tdx, tdz);
        if (tDist < 15.0 && tDist > 0.1) {
          const swirlAngle = Math.atan2(tdz, tdx) + delta * 5.5;
          e.pos.x = tornadoPosRef.current.x + Math.cos(swirlAngle) * Math.max(2.0, tDist - delta * 4.0);
          e.pos.z = tornadoPosRef.current.z + Math.sin(swirlAngle) * Math.max(2.0, tDist - delta * 4.0);
          e.hp -= 14.0 * delta;
          if (e.hp <= 0) e.killed = true;
          return;
        }
      }
      let nearestAnt = null;
      let minDistSq = Infinity;
      ants.forEach(ant => {
        if (ant.state === 'dead' || ant.state === 'hidden_inside' || ant.state === 'hiding' || ant.state === 'airborne_vortex') return;
        const dSq = e.pos.distanceToSquared(ant.position);
        // Ưu tiên hút đòn vào Kiến Tướng (Major) đang đứng sát làm lá chắn
        const effectiveDistSq = ant.type === 'major' ? dSq * 0.55 : dSq;
        if (effectiveDistSq < minDistSq) {
          minDistSq = effectiveDistSq;
          nearestAnt = ant;
        }
      });

      if (nearestAnt) {
        if (!e.targetDir) e.targetDir = new THREE.Vector3(0, 0, 1);
        // Cơ chế 4: Mỗi Kiến Lính (Soldier) cắn khóa khớp chân làm chậm nhện 35% (tối đa làm chậm 75%)
        const pinSlowFactor = Math.max(0.25, 1.0 - (e.pinnedBySoldiers || 0) * 0.35);
        if (minDistSq > 25.0) {
          const toAnt = _v1.subVectors(nearestAnt.position, e.pos).setY(0).normalize();
          e.pos.addScaledVector(toAnt, RUN_SPEED * 0.5 * pinSlowFactor * circadian.spiderAggroMult * delta);
          resolvePhysics(e.pos, toAnt);
          e.targetDir.copy(toAnt);
          e.isMoving = true;
          e.isAttacking = false;
        } else {
          e.targetDir.subVectors(nearestAnt.position, e.pos).setY(0).normalize();
          e.isMoving = false;
          e.isAttacking = true;
          // Khi bị Kiến Lính khóa chân, lực cắn của nhện cũng giảm từ 20 DPS xuống 12 DPS (tăng +30% vào ban đêm)
          const spiderBiteDps = ((e.pinnedBySoldiers || 0) > 0 ? 12.0 : 20.0) * circadian.spiderAggroMult;
          nearestAnt.hp -= spiderBiteDps * delta;
          if (nearestAnt.hp <= 0 && nearestAnt.state !== 'dead') {
            nearestAnt.state = 'dead'; nearestAnt.anim = 'Insect|idle_A3'; nearestAnt.bioState = 'dead_killed'; nearestAnt.priority = 0;
            deathTollRef.current++;
          }
        }
      } else {
        e.isMoving = false;
        e.isAttacking = false;
      }
    });

    // 4. Update Lưới Thức Ăn (Vận Chuyển Hợp Tác Đa Giai Cấp - McCreery & Breed, 2014)
    foodDataRef.current.forEach(f => {
      // Mồi chưa nghiền xong vỏ cứng thì chưa thể khiêng
      if (f.requiresMilling && f.millingProgress < 100) return;

      if (f.waiters.length >= f.reqAnts && !f.isCarried) {
        f.isCarried = true;
        f.originX = f.x;
        f.originZ = f.z;
        f.trailTimer = 0;

        const chosen = f.waiters.slice(0, f.reqAnts);
        const surplus = f.waiters.slice(f.reqAnts);

        surplus.forEach(id => {
          const a = ants[id];
          if (!a) return;
          const escapeAngle = Math.random() * Math.PI * 2;
          const escapeDist = f.reqAnts <= 2 ? 8 : (f.reqAnts <= 4 ? 10 : 12);
          a.position.x = f.x + Math.cos(escapeAngle) * escapeDist;
          a.position.z = f.z + Math.sin(escapeAngle) * escapeDist;
          a.targetDir.set(Math.cos(escapeAngle), 0, Math.sin(escapeAngle));
          a.state = 'patrolling';
          a.priority = a.type === 'major' ? 2 : (a.type === 'soldier' ? 1 : 0);
          a.targetFoodId = null;
          a.timer = randomWanderTime();
        });

        f.waiters = chosen;
        chosen.forEach(id => {
          ants[id].state = 'carrying';
          ants[id].priority = 1;
        });
      }

      if (f.isCarried) {
        let majorCount = 0;
        let soldierCount = 0;
        for (let wIdx = 0; wIdx < f.waiters.length; wIdx++) {
          const wType = ants[f.waiters[wIdx]]?.type;
          if (wType === 'major') majorCount++;
          else if (wType === 'soldier') soldierCount++;
        }
        // Nếu mồi đã được Kiến Tướng nghiền nhỏ (wasMilled), đội Kiến Thợ Nhỏ khiêng chạy nhanh thêm +20%
        // Buổi Chiều (afternoon): tăng thêm +18% tốc độ hợp tác vận chuyển để tích trữ trước hoàng hôn
        const milledSpeedBonus = f.wasMilled ? 1.2 : 1.0;
        const afternoonTransportBonus = timeOfDay === 'afternoon' ? 1.18 : 1.0;
        const casteForceMultiplier = Math.min(1.95, (1.0 + majorCount * 0.25 + soldierCount * 0.12) * milledSpeedBonus * afternoonTransportBonus);

        const center = _v3.set(f.x, 0, f.z);
        const toNest = _v1.subVectors(NEST_POS, center).setY(0).normalize();
        center.addScaledVector(toNest, WALK_SPEED * 0.7 * casteForceMultiplier * circadian.speedMult * delta);
        resolvePhysics(center, toNest);

        f.x = center.x; f.z = center.z;

        f.trailTimer = (f.trailTimer || 0) - delta;
        if (f.trailTimer <= 0 && center.distanceToSquared(NEST_POS) > 225.0) {
          depositOrReinforcePheromone(
            pheromonesRef.current,
            center.x,
            center.z,
            (f.originX ?? center.x) - center.x,
            (f.originZ ?? center.z) - center.z,
            f.id,
            1.25,
            'reinforced'
          );
          f.trailTimer = 0.7;
        }

        f.waiters.forEach((id, idx) => {
          if (!ants[id]) return;
          if (f.reqAnts === 1) {
            ants[id].position.set(center.x, 0, center.z).addScaledVector(toNest, -2.3);
            ants[id].targetDir.copy(toNest);
            ants[id].anim = 'Insect|walk_1';
            ants[id].bioState = 'WANDERING';
          } else {
            const angle = (Math.PI * 2 / f.waiters.length) * idx;
            const carryRadius = f.reqAnts <= 2 ? 3.0 : (f.reqAnts <= 4 ? 4.0 : 4.5);
            const offsetX = Math.cos(angle) * carryRadius;
            const offsetZ = Math.sin(angle) * carryRadius;
            ants[id].position.set(center.x + offsetX, 0, center.z + offsetZ);
            if (idx === 0) ants[id].targetDir.copy(toNest).negate();
            else ants[id].targetDir.copy(toNest);
            ants[id].anim = 'Insect|walk_1';
            ants[id].bioState = 'WANDERING';
          }
        });

        if (center.distanceToSquared(NEST_POS) < 36.0) {
          f.delivered = true;
          f.waiters.forEach(id => {
            if (!ants[id]) return;
            const outAngle = -0.15 + Math.random() * 1.85;
            ants[id].wanderDir.set(Math.cos(outAngle), 0, Math.sin(outAngle)).normalize();
            ants[id].targetDir.copy(ants[id].wanderDir);
            ants[id].timer = 2.5 + Math.random() * 2.0;
            ants[id].commCooldown = 4.5;
            ants[id].state = 'patrolling';
            ants[id].priority = ants[id].type === 'major' ? 2 : (ants[id].type === 'soldier' ? 1 : 0);
            ants[id].targetFoodId = null;
          });
        }
      }
    });

    // 5. Giải phóng rác thực phẩm & xác kẻ thù (Cleanup)
    const deliveredFoods = foodDataRef.current.filter(f => f.delivered);
    if (deliveredFoods.length > 0) {
      foodDataRef.current = foodDataRef.current.filter(f => !f.delivered);
      deliveredFoods.forEach(f => {
        onConsumeFood(f.id);
        onFoodDelivered(f.nutrition);
        // Nếu tổ đang thiếu Kiến Chúa (đang ấp Tân Chúa Kế Vị): Nguồn dinh dưỡng đưa về tổ đẩy nhanh +25% tiến độ hóa nhộng Chúa!
        if (queenSuccessionRef.current > 0) {
          queenSuccessionRef.current = Math.min(100, queenSuccessionRef.current + 18 + (f.nutrition || 1) * 4);
        }
      });
    }

    const killedEnemies = enemyDataRef.current.filter(e => e.killed);
    if (killedEnemies.length > 0) {
      enemyDataRef.current = enemyDataRef.current.filter(e => !e.killed);
      killedEnemies.forEach(e => {
        onEnemyKilled?.(e.id);
        // Xác nhện chiến lợi phẩm có vỏ Kitin dày (reqAnts: 6) -> Cần Kiến Tướng (Major) tới phanh thây trước khi Kiến Thợ khiêng về!
        if (setFoodList) {
          setFoodList(prev => [...prev, { id: 'corpse_' + e.id, x: e.pos.x, z: e.pos.z, reqAnts: 6, nutrition: 20 }]);
        }
      });
    }

    // 6. Xung Đột, Nhường Đường, Giao Tiếp Chạm Râu & Y Tá Chiến Trường (Allogrooming) Qua Spatial Hash Grid O(N)
    for (let i = 0, len = ants.length; i < len; i++) {
      const a = ants[i];
      if (a.state === 'hidden_inside' || a.state === 'hiding' || a.state === 'dead' || a.state === 'airborne_vortex') continue;
      const cx = getGridCoord(a.position.x);
      const cz = getGridCoord(a.position.z);
      _antGrid[cz * GRID_DIM + cx].push(a);
    }

    for (let i = 0, len = ants.length; i < len; i++) {
      const a1 = ants[i];
      if (a1.state === 'hidden_inside' || a1.state === 'hiding' || a1.state === 'dead' || a1.state === 'airborne_vortex') continue;

      const cx = getGridCoord(a1.position.x);
      const cz = getGridCoord(a1.position.z);
      const minGX = cx > 0 ? cx - 1 : 0;
      const maxGX = cx < GRID_DIM - 1 ? cx + 1 : GRID_DIM - 1;
      const minGZ = cz > 0 ? cz - 1 : 0;
      const maxGZ = cz < GRID_DIM - 1 ? cz + 1 : GRID_DIM - 1;

      for (let gz = minGZ; gz <= maxGZ; gz++) {
        const rowOffset = gz * GRID_DIM;
        for (let gx = minGX; gx <= maxGX; gx++) {
          const cell = _antGrid[rowOffset + gx];
          for (let k = 0, cLen = cell.length; k < cLen; k++) {
            const a2 = cell[k];
            if (a2.id <= a1.id) continue;

            if (a1.state === 'waiting_to_carry' && a2.state === 'waiting_to_carry') continue;
            if (a1.state === 'waiting_to_carry' && a2.state === 'carrying') continue;
            if (a1.state === 'carrying' && a2.state === 'waiting_to_carry') continue;

            const distSq = a1.position.distanceToSquared(a2.position);
            if (distSq >= 16.0) continue;

            // Cơ chế 5: Y Tá Chiến Trường (Allogrooming) — Kiến Thợ (Minor) liếm vết thương & khử độc cho Kiến Tướng / Kiến Lính bị thương
            const a1IsMedic = a1.type === 'minor' && a1.state === 'patrolling' && !(a1.commCooldown > 0);
            const a2IsMedic = a2.type === 'minor' && a2.state === 'patrolling' && !(a2.commCooldown > 0);
            const a1WoundedWarrior = (a1.type === 'major' || a1.type === 'soldier') && a1.state === 'patrolling' && a1.hp < a1.maxHp * 0.85;
            const a2WoundedWarrior = (a2.type === 'major' || a2.type === 'soldier') && a2.state === 'patrolling' && a2.hp < a2.maxHp * 0.85;

            if ((a1IsMedic && a2WoundedWarrior) || (a2IsMedic && a1WoundedWarrior)) {
              const medic = a1IsMedic ? a1 : a2;
              const warrior = a1IsMedic ? a2 : a1;
              medic.state = 'allogrooming'; warrior.state = 'allogrooming';
              medic.bioState = 'ALLOGROOMING'; warrior.bioState = 'ALLOGROOMING';
              medic.anim = 'Insect|idle_A2'; warrior.anim = 'Insect|idle_A3';
              medic.timer = 0.85; warrior.timer = 0.85;
              warrior.hp = Math.min(warrior.maxHp, warrior.hp + 18);
              warrior.energy = Math.min(100, warrior.energy + 12);
              healedCountRef.current++;

              _dirVec.subVectors(warrior.position, medic.position).setY(0);
              if (_dirVec.lengthSq() < 0.001) _dirVec.set(1, 0, 0);
              medic.targetDir.copy(_dirVec).normalize();
              _dirVec.negate();
              warrior.targetDir.copy(_dirVec).normalize();
              continue;
            }

            // Chạm râu giao tiếp dọc đường ngẫu nhiên (Antennation + Trophallaxis + Truyền trí nhớ nguồn mồi)
            if (a1.state === 'patrolling' && a2.state === 'patrolling' && !(a1.commCooldown > 0) && !(a2.commCooldown > 0)) {
              a1.state = 'communicating'; a2.state = 'communicating';
              a1.bioState = 'GREETING'; a2.bioState = 'GREETING';
              a1.anim = 'Insect|idle_A2'; a2.anim = 'Insect|idle_A3';
              a1.timer = 0.5; a2.timer = 0.5;

              // Trophallaxis: chia sẻ năng lượng/nước qua miệng (Ưu tiên bơm năng lượng cho Kiến Tướng & Kiến Lính)
              if (Math.abs(a1.energy - a2.energy) > 15) {
                const eDiff = (a1.energy - a2.energy) / 3;
                a1.energy -= eDiff; a2.energy += eDiff;
              }
              if (Math.abs(a1.hydration - a2.hydration) > 15) {
                const hDiff = (a1.hydration - a2.hydration) / 3;
                a1.hydration -= hDiff; a2.hydration += hDiff;
              }
              // Truyền thông tin vị trí mồi qua chạm râu (Tandem Information Transfer)
              if (a1.targetFoodId && !a2.targetFoodId) a2.targetFoodId = a1.targetFoodId;
              else if (a2.targetFoodId && !a1.targetFoodId) a1.targetFoodId = a2.targetFoodId;

              _dirVec.subVectors(a2.position, a1.position).setY(0);
              if (_dirVec.lengthSq() < 0.001) _dirVec.set(1, 0, 0);
              a1.targetDir.copy(_dirVec).normalize();
              _dirVec.negate();
              a2.targetDir.copy(_dirVec).normalize();
              continue;
            }

            // Tránh lề theo tôn ti giai cấp (Kiến Chúa priority 3 > Kiến Tướng 2 > Đang khiêng / Kiến Lính 1 > Kiến Thợ 0)
            if (a1.priority !== a2.priority) {
              const pLow = a1.priority < a2.priority ? a1 : a2;
              const pHigh = a1.priority < a2.priority ? a2 : a1;
              _pushVec.subVectors(pLow.position, pHigh.position).setY(0);
              if (_pushVec.lengthSq() < 0.001) {
                _pushVec.set(1, 0, 0);
              } else {
                _pushVec.normalize();
              }
              pLow.position.addScaledVector(_pushVec, WALK_SPEED * delta);
              continue;
            }

            // Lực bật mềm chống dính nhân bản — chỉ khi thực sự chồng lên nhau (< 2 units)
            if (distSq < 4.0 &&
                a1.state !== 'carrying' && a2.state !== 'carrying') {
              _pushVec.subVectors(a1.position, a2.position).setY(0);
              const len = _pushVec.length();
              if (len < 0.001) {
                const angle = (a1.id - a2.id) * 1.1;
                _pushVec.set(Math.cos(angle), 0, Math.sin(angle));
              } else {
                _pushVec.divideScalar(len);
              }
              const pushStrength = (2.0 - Math.sqrt(distSq)) * WALK_SPEED * 0.4 * delta;
              a1.position.addScaledVector(_pushVec, pushStrength);
              a2.position.addScaledVector(_pushVec, -pushStrength);
            }
          }
        }
      }
    }

    // Apply Real Coordinates
    ants.forEach((ant, i) => {
      if (groupRefs.current[i].current) {
        groupRefs.current[i].current.position.copy(ant.position);
      }
    });

    // Auto-Tracking Camera, Focus Ring & Feature 6: Ant-Eye First-Person POV Camera
    if (selectedAntId !== null) {
      const targetAnt = ants.find(a => a.id === selectedAntId);
      if (targetAnt) {
        if (focusRingRef.current) {
          focusRingRef.current.visible = true;
          focusRingRef.current.position.set(
            targetAnt.position.x,
            (targetAnt.position.y || 0) + 0.2,
            targetAnt.position.z
          );
        }
        if (typeof controlsRef !== 'undefined' && controlsRef.current) {
          if (isAntPOV) {
            const t = state.clock.elapsedTime;
            const headBob = targetAnt.state === 'dead' ? 0 : Math.sin(t * 18) * 0.08;
            const camX = targetAnt.position.x + targetAnt.targetDir.x * 1.1;
            const camY = (targetAnt.position.y || 0) + (targetAnt.type === 'queen' ? 3.5 : 2.35) + headBob;
            const camZ = targetAnt.position.z + targetAnt.targetDir.z * 1.1;
            state.camera.position.lerp(_v1.set(camX, camY, camZ), 0.22);
            const lookX = targetAnt.position.x + targetAnt.targetDir.x * 18.0;
            const lookY = (targetAnt.position.y || 0) + 1.45;
            const lookZ = targetAnt.position.z + targetAnt.targetDir.z * 18.0;
            controlsRef.current.target.lerp(_v2.set(lookX, lookY, lookZ), 0.25);
            controlsRef.current.update();
          } else if (isTracking) {
            controlsRef.current.target.lerp(targetAnt.position, 0.08);
          }
        }
      } else if (focusRingRef.current) {
        focusRingRef.current.visible = false;
      }
    } else if (focusRingRef.current) {
      focusRingRef.current.visible = false;
    }
  });

  const activeWeather = WEATHER_PROFILES[weatherMode] || WEATHER_PROFILES.clear;
  const territoryRadius3D = 56 + ((territoryAreaM2 - 15) / 105) * 96;

  // Vành đai biên giới Lãnh thổ Kiếm ăn Central-Place Foraging lấy TỔ CHÍNH (NEST_POS) làm tâm, giới hạn gọn trong mặt cỏ [-79, 79]
  const territoryPerimeterGeo = useMemo(() => {
    const segs = 96;
    const rOut = territoryRadius3D;
    const rIn = territoryRadius3D - 1.05;
    const positions = new Float32Array((segs + 1) * 2 * 3);
    const indices = [];
    const clampBound = (v) => Math.max(-79.0, Math.min(79.0, v));

    for (let i = 0; i <= segs; i++) {
      const theta = (i / segs) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const inX = clampBound(NEST_POS.x + cosT * rIn);
      const inZ = clampBound(NEST_POS.z + sinT * rIn);
      const outX = clampBound(NEST_POS.x + cosT * rOut);
      const outZ = clampBound(NEST_POS.z + sinT * rOut);

      const base = i * 6;
      positions[base] = inX;
      positions[base + 1] = 0.09;
      positions[base + 2] = inZ;
      positions[base + 3] = outX;
      positions[base + 4] = 0.09;
      positions[base + 5] = outZ;

      if (i < segs) {
        const v0 = i * 2;
        const v1 = v0 + 1;
        const v2 = v0 + 2;
        const v3 = v0 + 3;
        indices.push(v0, v2, v1, v1, v2, v3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex(indices);
    return geo;
  }, [territoryRadius3D]);

  return (
    <group>
      {antsDataRef.current.map((ant, idx) => (
        <AntAgent
          key={ant.id}
          id={ant.id}
          antType={ant.type}
          dataRef={antsDataRef}
          modelUrl={modelUrl}
          groupRef={groupRefs.current[idx]}
          onAntClick={handleAntInteraction}
        />
      ))}

      {/* Vành Đai Biên Giới Lãnh Thổ Kiếm Ăn Central-Place Foraging (Tâm đặt tại Tổ Chính NEST_POS, tỏa ra ngoài theo thanh trượt A_terr) */}
      <mesh geometry={territoryPerimeterGeo}>
        <meshBasicMaterial
          color={socialForm === 'polygyne' ? '#f59e0b' : '#6366f1'}
          transparent
          opacity={showTerritoryRing ? 0.65 : 0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Vòng Sáng Highlight Focus Mode (Cập nhật trực tiếp qua Ref ở 60 FPS, không gây re-render React) */}
      <mesh ref={focusRingRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.2, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Visualizer Đường Pheromone Xanh Siêu Tối Ưu */}
      <PheroVisualizer pheromonesRef={pheromonesRef} />

      {/* Feature 2: Bản đồ nhiệt hóa sinh Pheromone 18x18 nội suy Bilinear trên GPU */}
      <PheroHeatmapOverlay visible={showHeatmap} />

      {/* Feature 1: Soi lòng tổ ngầm 3D (Subterranean X-Ray Mode) */}
      <SubterraneanNestXRay modelUrl={modelUrl} visible={isXRayMode} />

      {/* Feature 4: Mặt nước lũ dâng dần từ mặt đất & Bè kiến sống kỵ nước tại đỉnh tổ (Cassie-Baxter Rafting) */}
      <FloodWaterOverlay visible={isFlooding} floodLevelRef={floodLevelRef} />

      {/* Bầu trời Thiên văn 4 Buổi (Mặt Trời / Mặt Trăng & Đom Đóm Đêm GPU Instanced) */}
      <CelestialSkyOverlay timeOfDay={timeOfDay} weatherMode={weatherMode} />

      {/* Luồng Gió Bão Cát GPU Instanced Streaks */}
      <WindstormOverlay visible={weatherMode === 'windstorm' || weatherMode === 'tornado'} />

      {/* Cột Lốc Xoáy 3D Đa Tầng & Mảnh Vỡ Xoáy Trôn Ốc GPU */}
      <TornadoVortexOverlay visible={weatherMode === 'tornado'} tornadoPosRef={tornadoPosRef} />

      <NestMarker />
      <GraveyardMarker />
      <Scenery
        windIntensity={activeWeather.windForce}
        showShadeRings={(timeOfDay === 'noon' && weatherMode === 'clear') || weatherMode === 'heatwave' || soilTempC >= 35}
      />

      {/* Rendering mảng Đồ ăn Động */}
      {foodList.map(food => (
        <FoodAgent key={food.id} id={food.id} dataRef={foodDataRef} />
      ))}

      {/* Rendering mảng Kẻ Thù Xâm Nhập */}
      {enemyList.map(e => (
        <EnemyAgent key={e.id} id={e.id} dataRef={enemyDataRef} />
      ))}
    </group>
  );
}

/* ─────────────────── GIAO DIỆN KIỂM SOÁT ─────────────────── */
export default function AntSimulation() {
  const modelUrl = useBaseUrl('/models/fire_ant/fire-ant.gltf');

  const [clickMode, setClickMode] = useState('move');
  const [timeOfDay, setTimeOfDay] = useState('morning'); // 'morning' | 'noon' | 'afternoon' | 'night'
  const [autoCycleDay, setAutoCycleDay] = useState(true);
  const [weatherMode, setWeatherMode] = useState('clear'); // 'clear' | 'rain' | 'windstorm' | 'tornado' | 'heatwave' | 'flood'
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isAntPOV, setIsAntPOV] = useState(false);
  const [isQueenProcession, setIsQueenProcession] = useState(false);
  const [showScalingLab, setShowScalingLab] = useState(false);
  const [isLabCompact, setIsLabCompact] = useState(false);
  const [territoryAreaM2, setTerritoryAreaM2] = useState(50);
  const [soilTempC, setSoilTempC] = useState(28);
  const [socialForm, setSocialForm] = useState('monogyne');
  const [enemyList, setEnemyList] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [deliveryCount, setDeliveryCount] = useState(0);

  const [foodRate, setFoodRate] = useState(4); // Mặc định Trù phú
  const [waterRate, setWaterRate] = useState(3);
  const [enemyRate, setEnemyRate] = useState(1);

  const [resetKey, setResetKey] = useState(0);
  const [populationHistory, setPopulationHistory] = useState([20]);
  const [maxKValue, setMaxKValue] = useState(20);
  const telemetryLogRef = useRef([]);
  const tornadoTargetRef = useRef(null);

  // Đồng bộ cờ mưa & lũ lụt từ weatherMode (Khi Đại Hồng Thủy thì trời BẮT BUỘC phải đổ mưa lớn liên tục để dâng nước!)
  const isFlooding = weatherMode === 'flood';
  const isRaining = weatherMode === 'rain' || weatherMode === 'flood';
  const activeCircadian = CIRCADIAN_PROFILES[timeOfDay] || CIRCADIAN_PROFILES.morning;
  const activeWeather = WEATHER_PROFILES[weatherMode] || WEATHER_PROFILES.clear;

  // Đồng bộ nhiệt độ đất bề mặt T_soil theo Buổi Sinh Học + Thời Tiết (vẫn cho phép chỉnh tay trong Lab)
  useEffect(() => {
    const targetTemp = Math.max(15, Math.min(43, activeCircadian.baseTempC + activeWeather.tempOffset));
    setSoilTempC(targetTemp);
  }, [timeOfDay, weatherMode, activeCircadian.baseTempC, activeWeather.tempOffset]);

  // Chu kỳ tự động 4 Buổi Sáng -> Trưa -> Chiều -> Tối (45s mỗi buổi nếu bật Tự chuyển)
  useEffect(() => {
    if (!autoCycleDay) return;
    const order = ['morning', 'noon', 'afternoon', 'night'];
    const timer = setInterval(() => {
      setTimeOfDay((prev) => {
        const idx = order.indexOf(prev);
        return order[(idx + 1) % order.length];
      });
    }, 45000);
    return () => clearInterval(timer);
  }, [autoCycleDay]);

  // Tổng dân số Đích cần sinh trưởng (Hỗ trợ tăng tốc sinh sản 1.5x khi ở cấu trúc Đa Chúa Polygyne)
  const polygyneReproductiveMult = socialForm === 'polygyne' ? 1.5 : 1.0;
  const antsBorn = Math.floor((deliveryCount * polygyneReproductiveMult) / 2); // Số kiến đã sinh
  const targetBornCount = 20 + antsBorn + (socialForm === 'polygyne' ? 2 : 0); // Lên cấp dựa vào Nutrition + Chúa Đồng Trị
  const foodRemaining = deliveryCount % 2; // Lượng dư sau khi sinh kiến

  const [stats, setStats] = useState({
    patrolling: 20,
    communicating: 0,
    recruit: 0,
    waiting: 0,
    carrying: 0,
    alarmed: 0,
    queen: 1,
    major: 3,
    soldier: 5,
    minor: 11,
    milling: 0,
    royalCourt: 0,
    medics: 0,
    basking: 0,
    shadeSeeking: 0,
    nocturnalGuard: 0,
    windAnchored: 0,
    airborneVortex: 0,
    milledTotal: 0,
    qmpPulses: 0,
    healedTotal: 0,
    dead: 0,
    deathToll: 0,
  });
  const [selectedAntId, setSelectedAntId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [focusAntData, setFocusAntData] = useState(null);
  const [isControlsExpanded, setIsControlsExpanded] = useState(true);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);
  const [isFocusExpanded, setIsFocusExpanded] = useState(true);
  const controlsRef = useRef(null);

  const handleSelectAnt = useCallback((id) => {
    setSelectedAntId(id);
    setIsTracking(false);
    setIsAntPOV(false);
    setFocusAntData(null);
  }, []);

  // Cưỡng chế chọn Buổi Sinh Học (Quyền năng Thượng Đế)
  const handleForceTimeOfDay = (periodKey) => {
    setTimeOfDay(periodKey);
    setAutoCycleDay(false); // Khi Thượng Đế cưỡng chế chọn buổi, khóa buổi đó lại cho tới khi bật lại Tự động
  };

  // Cưỡng chế chọn Thời Tiết / Thảm Họa Tự Nhiên (Quyền năng Thượng Đế)
  const handleSelectWeather = (mode) => {
    const nextMode = weatherMode === mode && mode !== 'clear' ? 'clear' : mode;
    setWeatherMode(nextMode);
    if (nextMode === 'flood' && controlsRef.current) {
      setIsXRayMode(false);
      controlsRef.current.target.set(RAFT_CENTER.x, 2.8, RAFT_CENTER.z);
      controlsRef.current.object.position.set(RAFT_CENTER.x + 25, 24, RAFT_CENTER.z + 28);
      controlsRef.current.update();
    }
  };

  // Điều hướng camera tự động khi bật chế độ Soi Lòng Tổ Ngầm X-Ray
  const handleToggleXRay = () => {
    const next = !isXRayMode;
    setIsXRayMode(next);
    if (next && controlsRef.current) {
      setSelectedAntId(null);
      setIsAntPOV(false);
      controlsRef.current.target.set(NEST_POS.x, -6.5, NEST_POS.z);
      controlsRef.current.object.position.set(NEST_POS.x + 28, 12, NEST_POS.z + 28);
      controlsRef.current.update();
    } else if (!next && controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 60, 80);
      controlsRef.current.update();
    }
  };

  const handleToggleQueenProcession = () => {
    const next = !isQueenProcession;
    setIsQueenProcession(next);
    if (next) {
      setSelectedAntId(0);
      setIsTracking(true);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsDashboardExpanded(false);
    }
  }, []);

  // Tracking Lịch sử Dân Số & Tính K (Carrying Capacity)
  useEffect(() => {
    const interval = setInterval(() => {
      setPopulationHistory(prev => {
        const currentTotal = (stats.queen || 0) + stats.major + (stats.soldier || 0) + stats.minor;
        const newHist = [...prev, currentTotal];
        if (newHist.length > 16) newHist.shift(); // Lưu giữ 80s gần nhất (16 mốc 5s)
        return newHist;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [stats.queen, stats.major, stats.soldier, stats.minor]);

  useEffect(() => {
    const currentTotal = (stats.queen || 0) + stats.major + (stats.soldier || 0) + stats.minor;
    if (currentTotal > maxKValue) setMaxKValue(currentTotal);
  }, [stats.queen, stats.major, stats.soldier, stats.minor, maxKValue]);

  const totalAlive = (stats.queen || 0) + stats.major + (stats.soldier || 0) + stats.minor;
  const kValue = Math.round(populationHistory.reduce((a, b) => a + b, 0) / populationHistory.length);

  /* ─────────────────── TÍNH TOÁN SINH NĂNG LƯỢNG DỊ TỐC & SỨC CHỨA 3 TẦNG ─────────────────── */
  // 1. Tải trọng trao đổi chất tương đương theo Định luật Kleiber (B ∝ M^0.75 → Minor=1.0, Soldier=1.81, Major=2.83, Queen=7.32 MEU)
  const metabolicLoad = calculateMetabolicLoad(stats.minor, stats.major, stats.soldier || 0);
  const avgMetabolicFactor = totalAlive > 0
    ? (metabolicLoad / totalAlive)
    : (0.60 + 0.25 * SOLDIER_METABOLIC_EQ + 0.15 * MAJOR_METABOLIC_EQ);

  // 2. Sức chứa thành phần theo Đơn vị Trao đổi chất Tương đương (MEU) — K_space co giãn trực tiếp theo thanh trượt Lãnh thổ A_terr & Cấu trúc Đa Chúa trong Lab
  const K_food_MEU = Math.floor(6 + 14.5 * Math.pow(foodRate, 0.95)); // Trophic capacity (có nền hạt giống/mùn hữu cơ cơ sở)
  const K_water_MEU = Math.floor(8 + 18.0 * Math.pow(waterRate, 0.90)); // Hydrological / VPD desiccation resistance capacity
  const K_space_MEU = Math.round((24 + 0.82 * territoryAreaM2) * (socialForm === 'polygyne' ? 1.3 : 1.0)); // Ngưỡng không gian lãnh thổ thực tế (15m² -> 36 MEU, 50m² -> 65 MEU, 120m² -> 122 MEU)

  // 3. Định luật Tối thiểu Liebig (Liebig's Law of the Minimum)
  const minResourceMEU = Math.min(K_food_MEU, K_water_MEU, K_space_MEU);
  let limitingFactor = 'Không gian lãnh thổ (Spatial)';
  if (minResourceMEU === K_food_MEU) limitingFactor = 'Nguồn thức ăn (Trophic)';
  else if (minResourceMEU === K_water_MEU) limitingFactor = 'Độ ẩm / VPD (Hydro)';

  // 4. Đáp ứng chức năng săn mồi Holling Type II (Holling, 1959): P(E) = (P_max * E) / (E_half + E)
  const predationPressure = (HOLLING_P_MAX * enemyRate) / (HOLLING_E_HALF + enemyRate);

  // 5. Sức chứa cực đại lý thuyết (quy đổi từ MEU sang số lượng cá thể theo cấu trúc giai cấp hiện tại)
  const theoreticalMaxK_MEU = Math.max(6, Math.round(minResourceMEU * (1 - predationPressure)));
  const theoreticalMaxK = Math.max(5, Math.round(theoreticalMaxK_MEU / avgMetabolicFactor));

  // 6. Ngoại suy Không gian & Dị tốc 5 Tầng sang Quy mô Tự nhiên (Tích phân cực 2D + Horvitz–Thompson theo Giai cấp + Hou PNAS 2010 + Taylor CI 95%)
  const extrapolation = useMemo(
    () =>
      computeScientificExtrapolation({
        minorSim: stats.minor,
        soldierSim: stats.soldier || 0,
        majorSim: stats.major,
        queenSim: stats.queen || 1,
        activeTrailAnts: (stats.recruit || 0) + (stats.carrying || 0),
        territoryAreaM2,
        soilTempC,
        waterRate,
        foodRate,
        socialForm,
      }),
    [stats.minor, stats.soldier, stats.major, stats.queen, stats.recruit, stats.carrying, territoryAreaM2, soilTempC, waterRate, foodRate, socialForm]
  );

  const surfaceForagersReal = extrapolation.surfaceForagersTotal;
  const totalColonyReal = extrapolation.totalColonyAdults;
  const kValueReal = Math.round(kValue * extrapolation.effectiveColonyMultiplier);
  const theoreticalMaxKReal = Math.round(theoreticalMaxK * extrapolation.effectiveColonyMultiplier);
  const maxKValueReal = Math.round(maxKValue * extrapolation.effectiveColonyMultiplier);

  // Ghi nhận nhật ký Telemetry phục vụ xuất báo cáo CSV thực nghiệm
  useEffect(() => {
    const entry = {
      timestamp: new Date().toISOString(),
      nSimTotal: totalAlive,
      nQueen: stats.queen || 1,
      nMajor: stats.major,
      nSoldier: stats.soldier || 0,
      nMinor: stats.minor,
      metabolicLoadMEU: metabolicLoad,
      kAvgSim: kValue,
      kMaxTheorySim: theoreticalMaxK,
      socialForm,
      territoryAreaM2,
      soilTempC,
      spatialEta: Number(extrapolation.spatialEta.toFixed(3)),
      surfaceFractionEff: Number((extrapolation.effectiveForagerFraction * 100).toFixed(1)),
      surfaceForagers50m2: surfaceForagersReal,
      totalColonyReal,
      ci95HalfWidth: extrapolation.ci95HalfWidth,
      totalFreshBiomassGrams: Number(extrapolation.totalFreshBiomassGrams.toFixed(2)),
      dailyEnergyKJ: Number(extrapolation.dailyEnergyKJ.toFixed(2)),
      foodDelivered: deliveryCount,
      milledItems: stats.milledTotal || 0,
      qmpPulses: stats.qmpPulses || 0,
      healedAnts: stats.healedTotal || 0,
      deathToll: stats.deathToll,
      limitingFactor,
    };
    telemetryLogRef.current.push(entry);
    if (telemetryLogRef.current.length > 300) telemetryLogRef.current.shift();
  }, [populationHistory.length]);

  const handleExportCSV = () => {
    if (typeof window === 'undefined') return;
    const rows = telemetryLogRef.current.length > 0 ? telemetryLogRef.current : [{
      timestamp: new Date().toISOString(),
      nSimTotal: totalAlive,
      nQueen: stats.queen || 1,
      nMajor: stats.major,
      nSoldier: stats.soldier || 0,
      nMinor: stats.minor,
      metabolicLoadMEU: metabolicLoad,
      kAvgSim: kValue,
      kMaxTheorySim: theoreticalMaxK,
      socialForm,
      territoryAreaM2,
      soilTempC,
      spatialEta: Number(extrapolation.spatialEta.toFixed(3)),
      surfaceFractionEff: Number((extrapolation.effectiveForagerFraction * 100).toFixed(1)),
      surfaceForagers50m2: surfaceForagersReal,
      totalColonyReal,
      ci95HalfWidth: extrapolation.ci95HalfWidth,
      totalFreshBiomassGrams: Number(extrapolation.totalFreshBiomassGrams.toFixed(2)),
      dailyEnergyKJ: Number(extrapolation.dailyEnergyKJ.toFixed(2)),
      foodDelivered: deliveryCount,
      milledItems: stats.milledTotal || 0,
      qmpPulses: stats.qmpPulses || 0,
      healedAnts: stats.healedTotal || 0,
      deathToll: stats.deathToll,
      limitingFactor,
    }];
    const headers = [
      'Timestamp_ISO',
      'N_Sim_0.25m2',
      'Queen_Count',
      'Major_Juggernauts',
      'Soldier_Guards',
      'Minor_Workers',
      'Metabolic_Load_MEU',
      'K_Avg_60s',
      'K_Max_Liebig_Holling',
      'Social_Form',
      'Territory_Area_m2',
      'Soil_Temp_C',
      'Spatial_Decay_Eta',
      'Surface_Forager_Pct',
      'N_Surface_Extrapolated',
      'N_Colony_Adults_Total',
      'N_Colony_CI95_HalfWidth',
      'Total_Fresh_Biomass_g',
      'Colony_Metabolism_kJ_day',
      'Nutrition_Delivered',
      'Milled_Hard_Seeds',
      'Queen_QMP_Pulses',
      'Medic_Allogroom_Heals',
      'Mortality_Count',
      'Limiting_Factor',
    ];
    const csvContent =
      '\uFEFF' +
      headers.join(',') +
      '\n' +
      rows
        .map((r) =>
          [
            r.timestamp,
            r.nSimTotal,
            r.nQueen ?? 1,
            r.nMajor,
            r.nSoldier ?? 0,
            r.nMinor,
            r.metabolicLoadMEU,
            r.kAvgSim,
            r.kMaxTheorySim,
            r.socialForm ?? socialForm,
            r.territoryAreaM2 ?? territoryAreaM2,
            r.soilTempC ?? soilTempC,
            r.spatialEta ?? Number(extrapolation.spatialEta.toFixed(3)),
            r.surfaceFractionEff ?? Number((extrapolation.effectiveForagerFraction * 100).toFixed(1)),
            r.surfaceForagers50m2,
            r.totalColonyReal,
            r.ci95HalfWidth ?? extrapolation.ci95HalfWidth,
            r.totalFreshBiomassGrams ?? Number(extrapolation.totalFreshBiomassGrams.toFixed(2)),
            r.dailyEnergyKJ ?? Number(extrapolation.dailyEnergyKJ.toFixed(2)),
            r.foodDelivered,
            r.milledItems ?? 0,
            r.qmpPulses ?? 0,
            r.healedAnts ?? 0,
            r.deathToll,
            `"${r.limitingFactor}"`,
          ].join(',')
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solenopsis_geminata_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tra cứu giải thích sinh học cho Focus Mode (hỗ trợ cả trạng thái tử vong cụ thể trong bioState)
  const focusExplainKey = focusAntData
    ? (focusAntData.state === 'dead' ? (focusAntData.bioState || 'dead') : focusAntData.state)
    : null;
  const focusExplain = focusExplainKey ? (BioExplanations[focusExplainKey] || BioExplanations.dead) : null;

  let ecoBadge = { text: '🟢 ỔN ĐỊNH', color: 'text-green-500' };
  if (totalAlive === 0) ecoBadge = { text: '💀 DIỆT VONG', color: 'text-neutral-500' };
  else if ((stats.queen || 0) === 0) ecoBadge = { text: `👑🥚 ẤP TÂN CHÚA KẾ VỊ (${stats.queenSuccessionProgress || 0}%)`, color: 'text-amber-500' };
  else if (weatherMode === 'tornado') ecoBadge = { text: '🌪️ SIÊU LỐC XOÁY CÀN QUÉT', color: 'text-purple-400' };
  else if (weatherMode === 'windstorm') ecoBadge = { text: '🌬️ GIÓ BÃO CÁT & CẮN CỎ NEO TRỤ', color: 'text-amber-400' };
  else if (weatherMode === 'heatwave') ecoBadge = { text: '🔥 NẮNG HẠN CỰC ĐOAN (TRÚ RÂM)', color: 'text-orange-500' };
  else if (isFlooding) ecoBadge = { text: '🛟 KẾT BÈ CHỐNG LŨ', color: 'text-cyan-400' };
  else if (isRaining) ecoBadge = { text: '🌧️ MƯA RÀO TRÚ ẨN', color: 'text-blue-400' };
  else if (isQueenProcession) ecoBadge = { text: '👑 CHÚA TUẦN DU & HỘ GIÁ', color: 'text-amber-500' };
  else if (totalAlive < 5 || totalAlive < kValue - 5) ecoBadge = { text: '🔴 NGUY KỊCH', color: 'text-red-500' };
  else if (totalAlive < kValue - 2) ecoBadge = { text: '🟠 SUY THOÁI', color: 'text-orange-500' };
  else if (totalAlive > kValue + 3) ecoBadge = { text: '🔵 BÙNG NỔ', color: 'text-blue-500' };

  const handleResetGame = () => {
    setDeliveryCount(0);
    setFoodList([]);
    setEnemyList([]);
    setStats({
      patrolling: 20,
      communicating: 0,
      recruit: 0,
      waiting: 0,
      carrying: 0,
      alarmed: 0,
      queen: 1,
      major: 3,
      soldier: 5,
      minor: 11,
      milling: 0,
      royalCourt: 0,
      medics: 0,
      basking: 0,
      shadeSeeking: 0,
      nocturnalGuard: 0,
      windAnchored: 0,
      airborneVortex: 0,
      milledTotal: 0,
      qmpPulses: 0,
      healedTotal: 0,
      dead: 0,
      deathToll: 0,
    });
    setPopulationHistory([20]);
    setMaxKValue(20);
    setWeatherMode('clear');
    setTimeOfDay('morning');
    setAutoCycleDay(true);
    setIsXRayMode(false);
    setShowHeatmap(false);
    setIsAntPOV(false);
    setIsQueenProcession(false);
    tornadoTargetRef.current = null;
    telemetryLogRef.current = [];
    setResetKey(k => k + 1);
  };

  const popRef = useRef(0);
  useEffect(() => { popRef.current = (stats.queen || 0) + stats.major + (stats.soldier || 0) + stats.minor; }, [stats]);

  // 🌍 Mẹ Thiên Nhiên: Auto Spawners (Phạm vi rơi mồi tỏa ra từ TỔ CHÍNH theo bán kính Lãnh thổ Kiếm ăn A_terr trong Phòng Lab)
  useEffect(() => {
    if (foodRate > 0) {
      const maxForageR = 56 + ((territoryAreaM2 - 15) / 105) * 96;
      const interval = setInterval(() => {
        setFoodList(prev => {
          if (prev.length >= 10 + foodRate) return prev; // Limit max food pieces
          const rand = Math.random();
          let weight = 1; // Hạt nhỏ
          if (rand < 0.25) weight = 4; // 25% Hạt vỏ cứng cần Kiến Tướng (Major) nghiền
          else if (rand < 0.55) weight = 2; // 30% Hạt vừa

          let fx, fz, validSpawn = false, attempts = 0;
          while (!validSpawn && attempts < 12) {
            const r = (14 + Math.sqrt(Math.random()) * (maxForageR - 14));
            const theta = Math.random() * Math.PI * 2;
            fx = Math.max(-72, Math.min(72, NEST_POS.x + Math.cos(theta) * r));
            fz = Math.max(-72, Math.min(72, NEST_POS.z + Math.sin(theta) * r));
            validSpawn = true;
            for (const obs of OBSTACLES) {
              if (Math.hypot(fx - obs.x, fz - obs.z) < obs.r + 4) {
                validSpawn = false; break;
              }
            }
            attempts++;
          }
          if (!validSpawn) return prev; // Bỏ qua nếu thả trúng ngay giữa tảng đá

          return [...prev, { id: Date.now() + Math.random(), x: fx, z: fz, reqAnts: weight }];
        });
      }, (11 - foodRate) * 4000); // Tăng giãn cách thả mồi để tránh lạm phát hạt đường và gây treo máy
      return () => clearInterval(interval);
    }
  }, [foodRate, territoryAreaM2]);

  useEffect(() => {
    if (enemyRate > 0) {
      const interval = setInterval(() => {
        setEnemyList(prev => {
          if (prev.length >= Math.ceil(enemyRate / 4)) return prev; // Giảm Tối đa Nhện (Max 2-3 con ở cấp độ cao nhất)
          if (popRef.current < 30) return prev; // Quy luật Bảo hộ Tân Bình: Dưới 30 quân cấm không cho rớt Nhện

          let fx, fz, validSpawn = false, attempts = 0;
          while (!validSpawn && attempts < 10) {
            fx = (Math.random() - 0.5) * 160;
            fz = (Math.random() - 0.5) * 160;
            validSpawn = true;
            for (const obs of OBSTACLES) {
              if (Math.hypot(fx - obs.x, fz - obs.z) < obs.r + 4) {
                validSpawn = false; break;
              }
            }
            attempts++;
          }
          if (!validSpawn) return prev;

          const enemyData = { id: Date.now() + Math.random(), pos: new THREE.Vector3(fx, 0, fz), hp: 100, killed: false };
          enemyDataRef.current.push(enemyData);
          return [...prev, { id: enemyData.id, pos: enemyData.pos }];
        });
      }, (11 - enemyRate) * 6000); // Tăng gấp đôi khoảng thời gian drop nhện để kiến có thời gian phục hồi sinh thái
      return () => clearInterval(interval);
    }
  }, [enemyRate]);

  const onConsumeFood = useCallback((id) => setFoodList(prev => prev.filter(f => f.id !== id)), []);
  const onEnemyKilled = useCallback((id) => setEnemyList(prev => prev.filter(e => e.id !== id)), []);
  const onFoodDelivered = useCallback((weight) => setDeliveryCount(c => c + (weight || 1)), []);
  const enemyDataRef = useRef([]);

  let dominantState = 'patrolling';
  if (weatherMode === 'tornado') dominantState = 'tornado';
  else if (weatherMode === 'windstorm') dominantState = 'windstorm';
  else if (weatherMode === 'heatwave') dominantState = 'heatwave';
  else if (isFlooding) dominantState = 'rafting';
  else if (stats.alarmed > 0) dominantState = 'alarmed';
  else if (stats.milling > 0) dominantState = 'milling';
  else if (stats.basking > 0) dominantState = 'morning_basking';
  else if (stats.shadeSeeking > 0) dominantState = 'noon_siesta';
  else if (stats.nocturnalGuard > 0) dominantState = 'night_guard';
  else if (stats.royalCourt > 0) dominantState = 'queen_court';
  else if (stats.carrying > 0) dominantState = 'carrying';
  else if (stats.waiting > 0) dominantState = 'waiting';
  else if (stats.recruit > 0) dominantState = 'recruit';
  else if (timeOfDay === 'afternoon') dominantState = 'afternoon_peak';

  // Dựng đường gấp khúc SVG Sparkline cho Biểu đồ Động lực học Quần thể
  const chartPoints = useMemo(() => {
    const maxVal = Math.max(55, theoreticalMaxK + 5, ...populationHistory);
    const w = 240;
    const h = 46;
    const pts = populationHistory.map((val, idx) => {
      const x = populationHistory.length === 1 ? w / 2 : (idx / (populationHistory.length - 1)) * w;
      const y = h - Math.min(h - 4, Math.max(4, (val / maxVal) * (h - 8)));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const kLineY = h - Math.min(h - 4, Math.max(4, (theoreticalMaxK / maxVal) * (h - 8)));
    return { polyline: pts.join(' '), kLineY: kLineY.toFixed(1) };
  }, [populationHistory, theoreticalMaxK]);

  const handleClick = (e) => {
    // Nếu đang ở chế độ Lốc Xoáy và người dùng nhấp mặt đất -> Chỉ huy tâm Lốc Xoáy di chuyển tới điểm nhấp!
    if (weatherMode === 'tornado' && e.point && clickMode !== 'food' && clickMode !== 'alarm') {
      tornadoTargetRef.current = { x: e.point.x, z: e.point.z, timer: 9.0 };
      return;
    }
    if (clickMode === 'move' || clickMode === 'rotate' || clickMode === 'water') return;
    if (e.point) {
      if (clickMode === 'alarm') {
        let fx = e.point.x, fz = e.point.z;
        for (const obs of OBSTACLES) {
          const dx = fx - obs.x; const dz = fz - obs.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0 && dist < obs.r + 3.0) {
            const lap = (obs.r + 3.0) - dist;
            fx += (dx / dist) * lap; fz += (dz / dist) * lap;
          }
        }
        const enemyData = { id: Date.now() + Math.random(), pos: new THREE.Vector3(fx, 0, fz), hp: 100, killed: false };
        enemyDataRef.current.push(enemyData); // Inject trực tiếp vào engine để kiến phát hiện cùng lúc với rendering
        setEnemyList(prev => [...prev, { id: enemyData.id, pos: enemyData.pos }]);
      } else if (clickMode === 'food') {
        let fx = e.point.x, fz = e.point.z;
        for (const obs of OBSTACLES) {
          const dx = fx - obs.x; const dz = fz - obs.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0 && dist < obs.r + 9.0) { // Đẩy lùi xa mồi rơi ở hồ nước để tránh kiến bị kẹt lag
            const lap = (obs.r + 9.0) - dist;
            fx += (dx / dist) * lap; fz += (dz / dist) * lap;
          }
        }
        // Thêm FoodEntity ở chế độ God Mode: Mồi hạt to cần Kiến Tướng (Major) nghiền trước khi Kiến Thợ khiêng
        const weight = 4;
        setFoodList(prev => [...prev, { id: Date.now() + Math.random(), x: fx, z: fz, reqAnts: weight }]);
      }
    }
  };

  return (
    <div className={`w-full h-[calc(100vh-60px)] relative text-sm overflow-hidden bg-neutral-900 ${showScalingLab && !isLabCompact ? 'ant-sim-lab-open' : ''}`}>
      {/* HUD Góc Nhìn Thứ Nhất Của Kiến (Ant-Eye Compound Vision Overlay) */}
      {isAntPOV && selectedAntId !== null && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[120] bg-black/80 backdrop-blur-md border border-cyan-500/60 text-cyan-200 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-extrabold tracking-wide">
            👁️ GÓC NHÌN KIẾN #{selectedAntId} ({focusAntData?.type === 'queen' ? 'Kiến Chúa Queen' : focusAntData?.type === 'major' ? 'Kiến Tướng Major' : focusAntData?.type === 'soldier' ? 'Kiến Lính Soldier' : 'Kiến Thợ Minor'}) · {focusExplain?.title || 'Đang hành quân'}
          </span>
          <button
            onClick={() => setIsAntPOV(false)}
            className="px-2 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold border-none cursor-pointer"
          >
            Thoát POV
          </button>
        </div>
      )}

      {/* PHÒNG THÍ NGHIỆM NGOẠI SUY & ÁNH XẠ SINH THÁI 5 TẦNG (SCIENTIFIC SCALING & ALLOMETRIC EXTRAPOLATION LAB MODAL) */}
      {showScalingLab && (
        <div
          className={
            isLabCompact
              ? 'absolute top-3 left-1/2 -translate-x-1/2 z-[250] w-[95%] max-w-3xl pointer-events-auto'
              : 'absolute inset-0 z-[250] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto'
          }
          style={{ zIndex: 250 }}
        >
          <div className={`bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl w-full text-neutral-900 dark:text-neutral-100 ${isLabCompact ? 'p-3 sm:p-4' : 'max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'}`}>
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2.5 mb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                  📐 Scientific Allometric & Spatial Extrapolation Lab (Đồng bộ Thế giới 3D Thời gian thực)
                </div>
                <h3 className="m-0 text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
                  Mô Hình Ngoại Suy Bầy Đàn 5 Tầng Sang Quy Mô Thực Địa (Quadrat 0.25m² → Toàn Vương Quốc)
                </h3>
                {!isLabCompact && (
                  <p className="m-0 mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    Mọi thay đổi ở 3 thanh điều khiển dưới đây đều tác động trực tiếp ngay lập tức lên Thế giới Kiến 3D bên ngoài (Số lượng Kiến Chúa trị vì, Vành đai biên giới kiếm ăn & Sức chứa K_max, Tốc độ chạy nhiệt động học Arrhenius & Trú nắng/Tụ đàn).
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setIsLabCompact(!isLabCompact)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-sm"
                  title="Thu gọn bảng số liệu để vừa kéo thanh trượt vừa quan sát đàn kiến 3D phản ứng trực tiếp"
                >
                  {isLabCompact ? '📊 Mở Bảng Đầy Đủ' : '👁️ Thu Gọn Xem 3D'}
                </button>
                <button
                  onClick={() => setShowScalingLab(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-rose-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-rose-600 text-neutral-700 dark:text-neutral-200 font-bold text-xs border-none cursor-pointer transition-colors"
                >
                  ✕ Đóng Lab
                </button>
              </div>
            </div>

            {/* Bộ tham số thực địa tương tác (Tác động trực tiếp lên thế giới 3D) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/70">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                  1. Cấu trúc Xã hội (Social Form — Vargo & Fletcher, 1989)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSocialForm('monogyne')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      socialForm === 'monogyne'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    👑 Đơn Chúa (Monogyne: 1 Chúa)
                  </button>
                  <button
                    onClick={() => setSocialForm('polygyne')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      socialForm === 'polygyne'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    👑👑 Đa Chúa (Polygyne: 6 Chúa)
                  </button>
                </div>
                <div className="mt-1 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                  {socialForm === 'polygyne'
                    ? '⚡ 3 Kiến Chúa (#1, #2, #3) đồng trị vì trong sân 3D, tốc độ nở kiến ×1.5, K_space +30%'
                    : '✓ 1 Kiến Chúa (#1) duy nhất độc tôn trị vì tại Sân Chầu / Buồng Ngầm'}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>2. Lãnh thổ Kiếm ăn (A<sub>terr</sub>):</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{territoryAreaM2} m² (R = {extrapolation.rTerr.toFixed(2)} m)</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={territoryAreaM2}
                  onChange={(e) => setTerritoryAreaM2(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>15 m² (Tổ non)</span>
                  <span>50 m² (Chuẩn)</span>
                  <span>120 m² (Đại lãnh thổ)</span>
                </div>
                <div className="mt-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
                  🌐 Co giãn vòng biên giới 3D, bán kính tuần tra & K_space = {K_space_MEU} MEU
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>3. Nhiệt độ Đất Bề mặt (T<sub>soil</sub>):</span>
                  <span className="text-rose-600 dark:text-rose-400">{soilTempC}°C (Arrhenius ×{extrapolation.arrheniusFactor.toFixed(2)})</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  value={soilTempC}
                  onChange={(e) => {
                    const nextT = Number(e.target.value);
                    setSoilTempC(nextT);
                    setAutoCycleDay(false);
                  }}
                  className="w-full accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>15°C (Lạnh)</span>
                  <span>30°C (T<sub>opt</sub> Tối ưu)</span>
                  <span>40°C (Nắng gắt)</span>
                </div>
                <div className="mt-1 text-[10px] text-rose-700 dark:text-rose-300 font-medium">
                  {soilTempC <= 19
                    ? '❄️ Đất lạnh ≤19°C: Kiến đi chậm 0.5x & co cụm quanh tổ giữ ấm'
                    : soilTempC >= 35
                    ? '🔥 Đất nóng ≥35°C: Kiến chạy tìm bóng râm bụi cây & uống nước liên tục'
                    : '☀️ Dải nhiệt tối ưu: Đàn kiến chạy nhanh & khai thác mồi hiệu suất cực đại'}
                </div>
              </div>
            </div>

            {!isLabCompact && (
              <>
            {/* 4 Thẻ Chỉ số Khoa học Tổng hợp */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Tích phân Bề mặt (A<sub>terr</sub> = {territoryAreaM2}m²)</div>
                <div className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {surfaceForagersReal.toLocaleString('vi-VN')} <span className="text-xs font-semibold">kiến</span>
                </div>
                <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
                  λ = {extrapolation.lambda.toFixed(3)} m⁻¹ · η<sub>spatial</sub> = {extrapolation.spatialEta.toFixed(3)} (×{extrapolation.surfaceMultiplier.toFixed(1)})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Quần thể Trưởng thành (95% CI)</div>
                <div className="text-lg font-extrabold text-amber-900 dark:text-amber-100 mt-0.5">
                  {totalColonyReal.toLocaleString('vi-VN')} <span className="text-xs font-semibold">± {extrapolation.ci95HalfWidth.toLocaleString('vi-VN')}</span>
                </div>
                <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                  Khoảng tin cậy 95%: [{(extrapolation.ci95Low / 10000).toFixed(2)} – {(extrapolation.ci95High / 10000).toFixed(2)} vạn] (RSE {extrapolation.rsePercent.toFixed(1)}%)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
                <div className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300">Tổng Sinh khối Tươi & Khô</div>
                <div className="text-lg font-extrabold text-sky-900 dark:text-sky-100 mt-0.5">
                  {extrapolation.totalFreshBiomassGrams.toFixed(2)} g <span className="text-xs font-semibold">({extrapolation.totalDryBiomassGrams.toFixed(2)}g khô)</span>
                </div>
                <div className="text-[10px] text-sky-700/80 dark:text-sky-300/80">
                  Trưởng thành: {extrapolation.adultBiomassGrams.toFixed(2)}g + Ấu trùng: {extrapolation.broodBiomassGrams.toFixed(2)}g
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <div className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300">Trao đổi chất Siêu sinh vật (M<sup>0.81</sup>)</div>
                <div className="text-lg font-extrabold text-rose-900 dark:text-rose-100 mt-0.5">
                  {extrapolation.dailyEnergyKJ.toFixed(2)} kJ/ngày <span className="text-xs font-semibold">({extrapolation.colonyPowerMW.toFixed(1)} mW)</span>
                </div>
                <div className="text-[10px] text-rose-700/80 dark:text-rose-300/80">
                  Tiêu thụ tương đương ~{extrapolation.dailyFoodEquivalentGrams.toFixed(2)}g côn trùng/ngày (Hou et al., 2010)
                </div>
              </div>
            </div>

            {/* Bảng Ma trận Nghịch đảo Horvitz–Thompson theo Giai cấp & Ấu trùng Ngầm */}
            <div className="mb-4 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200">
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Phân lớp Sinh học (Caste / Stage)</th>
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Mẫu Quadrat (0.25 m²)</th>
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Kiếm ăn Bề mặt (A<sub>terr</sub>)</th>
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Tỷ lệ Xuất quân f<sub>c</sub>(T,W)</th>
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Dân số Buồng ngầm (1−f<sub>c</sub>)</th>
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Tổng Toàn Tổ (N<sub>col,c</sub>)</th>
                    <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-700">Sinh khối Tươi (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  <tr>
                    <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">👑 Kiến Chúa (Queen, 14.2 mg)</td>
                    <td className="p-2.5">{stats.queen || 1} (Không nhân diện tích)</td>
                    <td className="p-2.5">0 (Ngự cung ngầm/Sân chầu)</td>
                    <td className="p-2.5">Cấu trúc {socialForm === 'polygyne' ? 'Đa chúa (6)' : 'Đơn chúa (1)'}</td>
                    <td className="p-2.5">{extrapolation.colQueen}</td>
                    <td className="p-2.5 font-bold">{extrapolation.colQueen}</td>
                    <td className="p-2.5">{((extrapolation.colQueen * 14.2) / 1000).toFixed(3)} g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-orange-600 dark:text-orange-400">⚔️ Kiến Tướng (Major, 4.0 mg)</td>
                    <td className="p-2.5">{stats.major}</td>
                    <td className="p-2.5">{extrapolation.surfMajor.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{(extrapolation.fMajor * 100).toFixed(1)}% (86% ở kho hạt ngầm)</td>
                    <td className="p-2.5">{(extrapolation.colMajor - extrapolation.surfMajor).toLocaleString('vi-VN')}</td>
                    <td className="p-2.5 font-bold">{extrapolation.colMajor.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{((extrapolation.colMajor * 4.0) / 1000).toFixed(2)} g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-sky-600 dark:text-sky-400">🛡️ Kiến Lính (Soldier, 2.2 mg)</td>
                    <td className="p-2.5">{stats.soldier || 0}</td>
                    <td className="p-2.5">{extrapolation.surfSoldier.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{(extrapolation.fSoldier * 100).toFixed(1)}% (Canh gác cửa tổ)</td>
                    <td className="p-2.5">{(extrapolation.colSoldier - extrapolation.surfSoldier).toLocaleString('vi-VN')}</td>
                    <td className="p-2.5 font-bold">{extrapolation.colSoldier.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{((extrapolation.colSoldier * 2.2) / 1000).toFixed(2)} g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-800 dark:text-neutral-200">👷 Kiến Thợ (Minor, 1.0 mg)</td>
                    <td className="p-2.5">{stats.minor}</td>
                    <td className="p-2.5">{extrapolation.surfMinor.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{(extrapolation.fMinor * 100).toFixed(1)}% (81% chăm ấu trùng)</td>
                    <td className="p-2.5">{(extrapolation.colMinor - extrapolation.surfMinor).toLocaleString('vi-VN')}</td>
                    <td className="p-2.5 font-bold">{extrapolation.colMinor.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{((extrapolation.colMinor * 1.0) / 1000).toFixed(2)} g</td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                    <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">🥚 Ấu trùng & Nhộng ngầm (Brood, ~0.65 mg)</td>
                    <td className="p-2.5">— (100% ở buồng ấp ngầm)</td>
                    <td className="p-2.5">0</td>
                    <td className="p-2.5">0.0% (Trứng: {extrapolation.broodEggs.toLocaleString('vi-VN')} · Ấu trùng: {extrapolation.broodLarvae.toLocaleString('vi-VN')} · Nhộng: {extrapolation.broodPupae.toLocaleString('vi-VN')})</td>
                    <td className="p-2.5">{extrapolation.totalBrood.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5 font-bold">{extrapolation.totalBrood.toLocaleString('vi-VN')}</td>
                    <td className="p-2.5">{extrapolation.broodBiomassGrams.toFixed(2)} g</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Đồ thị Đường cong Suy giảm Mật độ Cực 2D & Giải trình Công thức Toán Sinh Thái */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
                  📉 Đồ Thị Suy Giảm Mật Độ Tâm–Biên D(r) = D₀ · e<sup>−λr</sup> (r ∈ [0, {extrapolation.rTerr.toFixed(1)} m])
                </div>
                <svg viewBox="0 0 280 90" className="w-full h-24 overflow-visible">
                  <line x1="24" y1="74" x2="270" y2="74" stroke="#64748b" strokeWidth="1" />
                  <line x1="24" y1="10" x2="24" y2="74" stroke="#64748b" strokeWidth="1" />
                  {/* Vùng diện tích tích phân dưới đường cong */}
                  <polygon
                    fill="rgba(16, 185, 129, 0.18)"
                    points={
                      `24,74 ` +
                      Array.from({ length: 25 })
                        .map((_, i) => {
                          const r = (i / 24) * extrapolation.rTerr;
                          const ratio = Math.exp(-extrapolation.lambda * r);
                          const x = 24 + (i / 24) * 240;
                          const y = 74 - ratio * 58;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ') +
                      ` 264,74`
                    }
                  />
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.4"
                    points={Array.from({ length: 25 })
                      .map((_, i) => {
                        const r = (i / 24) * extrapolation.rTerr;
                        const ratio = Math.exp(-extrapolation.lambda * r);
                        const x = 24 + (i / 24) * 240;
                        const y = 74 - ratio * 58;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                  <text x="26" y="18" fill="#10b981" fontSize="8" fontWeight="bold">Tâm Gò Tổ D₀ (r=0m)</text>
                  <text x="185" y="68" fill="#94a3b8" fontSize="8">Biên R={extrapolation.rTerr.toFixed(1)}m ({Math.round(Math.exp(-extrapolation.lambda * extrapolation.rTerr) * 100)}% D₀)</text>
                </svg>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Hệ số hiệu chỉnh tích phân cực 2D: η<sub>spatial</sub>(λ, R) = [2 / (λR)²] · [1 − (1+λR)e<sup>−λR</sup>] · e<sup>λr<sub>quad</sub></sup> = <b>{extrapolation.spatialEta.toFixed(3)}</b>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11.5px] space-y-1.5 text-neutral-700 dark:text-neutral-300">
                <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                  📚 Cơ Sở Học Thuật Của Mô Hình 5 Tầng:
                </div>
                <div>
                  <b>1. Loại trừ Kiến Chúa khỏi Phép Nhân Diện Tích:</b> Kiến Chúa (#0) là thực thể đơn nhất tại tâm tổ, chỉ ngoại suy theo cấu trúc xã hội (<i>Monogyne</i> = 1 Chúa vs <i>Polygyne</i> = 6 Chúa — Vargo & Fletcher, 1989).
                </div>
                <div>
                  <b>2. Bất đối xứng Phân tầng Giai cấp (Tschinkel, 2006):</b> Kiến Tướng (Major) có tới 86% quân số ở dưới hầm ngầm nghiền hạt và tích trữ lipid (f<sub>major</sub> ≈ 14%), trong khi Kiến Lính (Soldier) tập trung ở cửa tổ (f<sub>soldier</sub> ≈ 27%).
                </div>
                <div>
                  <b>3. Định luật Dị tốc Siêu sinh vật (Hou et al., 2010 PNAS):</b> Công suất trao đổi chất toàn tổ tuân theo B<sub>col</sub> ∝ M<sub>col</sub><sup>0.81</sup> · e<sup>−E<sub>a</sub>/(k<sub>B</sub>T)</sup> thay vì cộng tuyến tính từng cá thể.
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:top-5 md:bottom-auto md:left-5 md:-translate-x-0 z-[100] bg-white/95 dark:bg-neutral-900/90 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shadow-2xl w-[92%] sm:w-[335px] max-w-full max-h-[82vh] overflow-y-auto transition-all duration-200">
        <div
          onClick={() => setIsControlsExpanded(!isControlsExpanded)}
          className={`flex justify-between items-center cursor-pointer select-none ${isControlsExpanded ? 'mb-2.5 border-b border-neutral-200 dark:border-neutral-700 pb-2' : ''}`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="m-0 text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-white truncate">
              🔬 Điều Khiển & Quyền Năng
            </h4>
            {!isControlsExpanded && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30 whitespace-nowrap">
                {activeCircadian.shortLabel} · {activeWeather.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              to="/docs/huong-dan-mo-phong"
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] no-underline transition-colors"
              title="Hướng dẫn sử dụng"
            >
              i
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsControlsExpanded(!isControlsExpanded);
              }}
              className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[10px] font-bold border border-neutral-300 dark:border-neutral-600 cursor-pointer transition-colors"
              title={isControlsExpanded ? 'Thu gọn bảng điều khiển' : 'Mở rộng bảng điều khiển'}
            >
              {isControlsExpanded ? 'Thu gọn ▲' : 'Mở ▼'}
            </button>
          </div>
        </div>

        {isControlsExpanded && (
          <>
        {/* QUYỀN NĂNG THƯỢNG ĐẾ 1: CƯỠNG CHẾ CHU KỲ 4 BUỔI SINH HỌC (SÁNG - TRƯA - CHIỀU - TỐI) */}
        <div className="mb-2.5 p-2 rounded-lg bg-amber-50/80 dark:bg-neutral-800/80 border border-amber-200/80 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              ⏳ Chu Kỳ 4 Buổi ({soilTempC}°C)
            </span>
            <button
              onClick={() => setAutoCycleDay(!autoCycleDay)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition-colors ${
                autoCycleDay
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-rose-600 text-white border-rose-500'
              }`}
              title="Bật Tự động xoay vòng 24h hoặc Khóa Cưỡng chế Buổi hiện tại"
            >
              {autoCycleDay ? '🔄 Tự chuyển 24h' : '🔒 Đang cưỡng chế'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {Object.values(CIRCADIAN_PROFILES).map((p) => {
              const active = timeOfDay === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => handleForceTimeOfDay(p.key)}
                  className={`py-1.5 px-1 rounded-md text-[11px] font-bold border cursor-pointer transition-all ${
                    active
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm scale-[1.02]'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-amber-100 dark:hover:bg-neutral-700'
                  }`}
                  title={p.bioSummary}
                >
                  {p.shortLabel}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 text-[10.5px] leading-snug text-neutral-700 dark:text-neutral-300">
            <b className="text-amber-700 dark:text-amber-400">{activeCircadian.label}:</b> {activeCircadian.bioSummary}
          </div>
        </div>

        {/* QUYỀN NĂNG THƯỢNG ĐẾ 2: CƯỠNG CHẾ 6 THỜI TIẾT & THẢM HỌA TỰ NHIÊN */}
        <div className="mb-2.5 p-2 rounded-lg bg-sky-50/80 dark:bg-neutral-800/80 border border-sky-200/80 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              🌪️ Thời Tiết & Thảm Họa Thượng Đế
            </span>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
              {activeWeather.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {Object.values(WEATHER_PROFILES).map((w) => {
              const active = weatherMode === w.key;
              return (
                <button
                  key={w.key}
                  onClick={() => handleSelectWeather(w.key)}
                  className={`py-1.5 px-1 rounded-md text-[10.5px] font-bold border cursor-pointer transition-all ${
                    active
                      ? w.key === 'tornado'
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : w.key === 'heatwave'
                        ? 'bg-orange-600 text-white border-orange-400 shadow-md'
                        : w.key === 'windstorm'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                        : 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-sky-100 dark:hover:bg-neutral-700'
                  }`}
                  title={w.desc}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
          {weatherMode !== 'clear' && (
            <div className="mt-1.5 text-[10.5px] leading-snug text-sky-900 dark:text-sky-200">
              {activeWeather.desc}
              {weatherMode === 'tornado' && (
                <span className="block mt-0.5 font-bold text-purple-600 dark:text-purple-300">
                  👉 Mẹo Thượng Đế: Nhấp chuột lên mặt đất 3D để dẫn đường cho vòi rồng Lốc Xoáy!
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => setClickMode('move')} className={`border-none outline-none ring-0 py-1.5 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'move' ? 'bg-blue-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🤚 Kéo Cam</button>
          <button onClick={() => setClickMode('rotate')} className={`border-none outline-none ring-0 py-1.5 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'rotate' ? 'bg-blue-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🔄 Xoay</button>
          <button onClick={() => setClickMode('food')} className={`border-none outline-none ring-0 py-1.5 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'food' ? 'bg-green-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🍬 Thả Đường</button>
          <button onClick={() => setClickMode('alarm')} className={`border-none outline-none ring-0 py-1.5 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'alarm' ? 'bg-red-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>⚠️ Báo Động</button>
          <button onClick={handleToggleXRay} className={`border-none outline-none ring-0 py-1.5 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${isXRayMode ? 'bg-amber-600 text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🔍 {isXRayMode ? 'Tắt X-Ray' : 'Tổ Ngầm X-Ray'}</button>
          <button onClick={() => setShowHeatmap(!showHeatmap)} className={`border-none outline-none ring-0 py-1.5 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${showHeatmap ? 'bg-emerald-600 text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🌡️ {showHeatmap ? 'Tắt Nhiệt Đồ' : 'Bản Đồ Nhiệt'}</button>
          <button onClick={handleToggleQueenProcession} className={`col-span-2 border-none outline-none ring-0 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${isQueenProcession ? 'bg-amber-500 text-neutral-950 shadow-md' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'}`}>👑 {isQueenProcession ? 'Dừng Tuần Du (Chúa Về Sân Chầu)' : 'Chúa Tuần Du & Đội Hình Lính Hộ Giá'}</button>
          <button onClick={() => setShowScalingLab(true)} className="col-span-2 border border-indigo-400/60 dark:border-indigo-500/60 outline-none ring-0 py-1.5 px-2 text-xs font-extrabold rounded-lg transition-colors cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">📐 Phòng Lab Ánh Xạ & Ngoại Suy Thực Địa (5 Tầng)</button>
        </div>
        <div className="mt-2.5 space-y-1.5 border-t border-neutral-200 dark:border-neutral-700 pt-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span>🍬 Tốc độ Mồi:</span>
            <input type="range" min="0" max="10" value={foodRate} onChange={(e) => setFoodRate(Number(e.target.value))} className="w-24 accent-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span>💧 Độ Khô/Ẩm:</span>
            <input type="range" min="0" max="10" value={waterRate} onChange={(e) => setWaterRate(Number(e.target.value))} className="w-24 accent-blue-500" />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span>🕷️ Sinh Kẻ Thù:</span>
            <input type="range" min="0" max="10" value={enemyRate} onChange={(e) => setEnemyRate(Number(e.target.value))} className="w-24 accent-red-500" />
          </div>
        </div>
        {deliveryCount > 0 && (
          <div className="mt-2 text-xs text-green-600 dark:text-green-400 border-t border-neutral-200 dark:border-neutral-700 pt-2 font-medium">
            🏠 Kho lương thực: <b>{deliveryCount} Nutrition</b>
            {(stats.bornTotal ?? 0) > 0 && (
              <span className="text-amber-600 dark:text-amber-400 ml-1">
                (🐣 đã nở {stats.bornTotal} kiến 3D{totalAlive >= 120 ? ' · Đạt trần 120 cá thể Quadrat' : ''})
              </span>
            )}
          </div>
        )}
          </>
        )}
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-5 md:right-5 md:left-auto md:-translate-x-0 z-[100] w-[92%] sm:w-[310px]">
        {selectedAntId === null ? (
          // SWARM DASHBOARD
          <div className="bg-white/95 dark:bg-neutral-900/95 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xl transition-all duration-200">
            <div
              className={`flex justify-between items-center cursor-pointer select-none ${isDashboardExpanded ? 'border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2' : ''}`}
              onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-xs sm:text-sm font-extrabold truncate ${ecoBadge.color}`}>{ecoBadge.text}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/30 whitespace-nowrap">
                  { isDashboardExpanded ? `${activeCircadian.shortLabel} · ${activeWeather.label}` : `🐜 ${totalAlive} kiến` }
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDashboardExpanded(!isDashboardExpanded);
                }}
                className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[10px] font-bold border border-neutral-300 dark:border-neutral-600 cursor-pointer transition-colors flex-shrink-0 ml-2"
                title={isDashboardExpanded ? 'Thu gọn bảng thông số' : 'Mở rộng bảng thông số'}
              >
                {isDashboardExpanded ? 'Thu gọn ▲' : 'Mở ▼'}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isDashboardExpanded ? 'max-h-[720px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium text-[10px] space-y-0.5 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2">
                <div className="flex items-center gap-1">
                  <span>🐜 Vi mô (Ô 0.25m²): <b className="text-neutral-800 dark:text-neutral-100">{totalAlive} kiến ({metabolicLoad} MEU)</b></span>
                  <span className="cursor-help inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-neutral-400 dark:bg-neutral-500 text-white text-[9px] font-bold leading-none flex-shrink-0" title="Định luật Dị tốc Kleiber (B ∝ M^0.75): Minor = 1.0 MEU, Kiến Lính Soldier = 1.81 MEU, Kiến Tướng Major = 2.83 MEU, Kiến Chúa Queen = 7.32 MEU.">i</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🌿 Bề mặt ({territoryAreaM2}m², η={extrapolation.spatialEta.toFixed(2)}): <b className="text-neutral-800 dark:text-neutral-100">{surfaceForagersReal.toLocaleString('vi-VN')} kiến</b></span>
                  <span className="cursor-help inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-neutral-400 dark:bg-neutral-500 text-white text-[9px] font-bold leading-none flex-shrink-0" title="Tích phân cực 2D độ dốc suy giảm mật độ Central-Place Foraging D(r) = D0·exp(-λr) trên bán kính R_terr (loại trừ Kiến Chúa khỏi phép nhân diện tích).">i</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🌍 Toàn Tổ (95% CI): <b className="text-amber-600 dark:text-amber-400">{(totalColonyReal / 10000).toFixed(2)} ± {(extrapolation.ci95HalfWidth / 10000).toFixed(2)} vạn</b></span>
                  <span className="cursor-help inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-neutral-400 dark:bg-neutral-500 text-white text-[9px] font-bold leading-none flex-shrink-0" title="Ước lượng nghịch đảo Horvitz–Thompson phân tầng theo từng giai cấp f_c(T_soil, W) kết hợp phương sai không gian Taylor (b = 1.44).">i</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⚡ Sinh khối & Dị tốc (M<sup>0.81</sup>): <b className="text-indigo-600 dark:text-indigo-400">{extrapolation.totalFreshBiomassGrams.toFixed(1)}g · {extrapolation.dailyEnergyKJ.toFixed(1)} kJ/ngày</b></span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowScalingLab(true); }}
                    className="ml-1 px-1.5 py-0.2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold border-none cursor-pointer"
                    title="Mở Phòng Lab Ngoại suy & Ánh xạ Sinh thái 5 Tầng"
                  >
                    📐 Chi tiết
                  </button>
                </div>
              </div>
              <ul className="text-[12px] font-medium list-none pl-0 mb-2.5 space-y-1 text-neutral-800 dark:text-neutral-200">
                <li
                  onClick={() => {
                    if (socialForm === 'polygyne') {
                      const nextQ = selectedAntId === 0 ? 9 : selectedAntId === 9 ? 10 : 0;
                      handleSelectAnt(nextQ);
                    } else {
                      handleSelectAnt(0);
                    }
                  }}
                  className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-amber-600 dark:text-amber-400 cursor-pointer hover:underline"
                  title="Nhấp để soi trực tiếp Kiến Chúa (Khi mất Chúa, Kiến Thợ Y Tá tự động bồi dưỡng ấu trùng lưỡng bội để ấp nở Tân Chúa Kế Vị)"
                >
                  <span>👑 Kiến Chúa (Queen, 7.32 MEU):</span>{' '}
                  <b>
                    {stats.queenSuccessionProgress > 0
                      ? `${stats.queen ?? 0} (🥚 Ấp Tân Chúa ${stats.queenSuccessionProgress}%)`
                      : `${stats.queen ?? 1} (Nhấp soi)`}
                  </b>
                </li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-orange-600 dark:text-orange-400"><span>⚔️ Kiến Tướng (Major, 2.83 MEU):</span> <b>{stats.major}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-sky-600 dark:text-sky-400"><span>🛡️ Kiến Lính (Soldier, 1.81 MEU):</span> <b>{stats.soldier || 0}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>👷 Kiến Thợ (Minor, 1.00 MEU):</span> <b>{stats.minor}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 pt-0.5 text-[11.5px]"><span>⚙️ Tương tác Liên giai cấp:</span> <b className="text-amber-600 dark:text-amber-400">Nghiền {stats.milledTotal || 0} · QMP {stats.qmpPulses || 0} · Cứu {stats.healedTotal || 0}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-[11.5px] text-emerald-700 dark:text-emerald-300">
                  <span>⏳ Nhịp Sinh Học & Thời Tiết:</span>
                  <b>
                    {stats.airborneVortex > 0
                      ? `🌪️ Cuốn lốc: ${stats.airborneVortex}`
                      : stats.windAnchored > 0
                      ? `🌬️ Neo gió: ${stats.windAnchored}`
                      : stats.shadeSeeking > 0
                      ? `🌿 Trú râm: ${stats.shadeSeeking}`
                      : stats.basking > 0
                      ? `🌅 Phơi nắng: ${stats.basking}`
                      : stats.nocturnalGuard > 0
                      ? `🌙 Cụm đêm: ${stats.nocturnalGuard}`
                      : `${activeCircadian.shortLabel} (${soilTempC}°C)`}
                  </b>
                </li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-green-600 dark:text-green-400"><span>🏋️ Nghiền & Khiêng mồi:</span> <b>{stats.carrying} kiến</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-red-600 dark:text-red-400"><span>⚠️ Tác chiến 3 vòng:</span> <b>{stats.alarmed}/{totalAlive}</b></li>
                <li className="flex justify-between text-neutral-500 dark:text-neutral-400"><span>🪦 Quy Tiên:</span> <b>{stats.deathToll} kiến</b></li>
              </ul>

              {/* Sức chứa lý thuyết tối đa theo Mô hình Sinh thái 3 Tầng */}
              <div className="mb-2.5 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-[11px] uppercase tracking-wide">⚖️ Sức Chứa Cực Đại (Liebig – Holling)</span>
                  <span className="cursor-help text-amber-600 dark:text-amber-400 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 dark:bg-amber-600 text-white text-[9px] font-bold leading-none flex-shrink-0" title="K_max(MEU) = min(K_trophic, K_hydro, K_space) × [1 - (P_max·E)/(E_half + E)], sau đó quy đổi theo định luật dị tốc Kleiber sang số lượng cá thể.">i</span>
                </div>
                <div className="space-y-1 text-[11.5px] text-amber-800 dark:text-amber-200">
                  <div className="flex justify-between items-center">
                    <span>📊 Ngưỡng Vi mô (K_max):</span>
                    <span className="font-bold">{theoreticalMaxK} kiến ({theoreticalMaxK_MEU} MEU)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🌍 Ngưỡng Vương quốc:</span>
                    <span className="font-bold">{(theoreticalMaxKReal / 10000).toFixed(2)} vạn cá thể</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] text-amber-700/90 dark:text-amber-300/90 pt-0.5">
                    <span>🔒 Nhân tố giới hạn Liebig:</span>
                    <span className="font-semibold">{limitingFactor}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] text-amber-700/90 dark:text-amber-300/90">
                    <span>🕷️ Hao hụt Holling Type II:</span>
                    <span className="font-semibold">-{(predationPressure * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-amber-200 dark:border-amber-800/50 text-[10px] text-amber-700 dark:text-amber-400 italic">
                  {metabolicLoad > theoreticalMaxK_MEU ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold">⚠️ Vượt tải sinh năng lượng ({metabolicLoad}/{theoreticalMaxK_MEU} MEU)! Suy thoái tất yếu.</span>
                  ) : metabolicLoad > theoreticalMaxK_MEU * 0.9 ? (
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">⚡ Tiệm cận biên độ cân bằng sinh thái.</span>
                  ) : (
                    <span>✓ Dư địa tài nguyên còn đáp ứng tăng trưởng.</span>
                  )}
                </div>
              </div>

              <p className="my-1.5 text-[11.5px] leading-relaxed text-neutral-600 dark:text-neutral-400 italic">
                {INFO_BULLETIN[dominantState]?.desc || ''}
              </p>

              {/* Feature 3: Biểu đồ Động lực học Quần thể thời gian thực & Xuất báo cáo CSV */}
              <div className="mt-2.5 pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                    📈 Biểu Đồ Quần Thể N(t) & K_max
                  </span>
                  <button
                    onClick={handleExportCSV}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold border-none cursor-pointer transition-colors shadow-sm"
                    title="Tải xuống dữ liệu thực nghiệm dạng bảng CSV"
                  >
                    📥 Xuất CSV
                  </button>
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-950/90 rounded-lg p-1.5 border border-neutral-200 dark:border-neutral-800">
                  <svg viewBox="0 0 240 46" className="w-full h-11 overflow-visible">
                    <line
                      x1="0"
                      y1={chartPoints.kLineY}
                      x2="240"
                      y2={chartPoints.kLineY}
                      stroke="#f43f5e"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartPoints.polyline}
                    />
                  </svg>
                  <div className="flex justify-between text-[9px] text-neutral-500 dark:text-neutral-400 px-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">— Quần thể N(t): {totalAlive}</span>
                    <span className="text-rose-500 font-bold">-- Ngưỡng K_max: {theoreticalMaxK}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // FOCUS MODE
          <div className="bg-white/95 dark:bg-neutral-900/95 p-3 sm:p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 text-neutral-900 dark:text-neutral-100 shadow-xl overflow-hidden focus-panel-anim">
            <div className={`flex justify-between items-center ${isFocusExpanded ? 'mb-2 border-b border-neutral-200 dark:border-neutral-800 pb-2' : ''}`}>
              <h4
                className="m-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 text-sm font-bold cursor-pointer flex-1 select-none"
                onClick={() => setIsFocusExpanded(!isFocusExpanded)}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
                {focusAntData?.type === 'queen'
                  ? `👑 Kiến Chúa #${selectedAntId === 0 ? 1 : selectedAntId === 9 ? 2 : 3}`
                  : `Mục Tiêu #${selectedAntId}`}
              </h4>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => setIsFocusExpanded(!isFocusExpanded)}
                  className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[10px] font-bold border border-neutral-300 dark:border-neutral-600 cursor-pointer transition-colors"
                >
                  {isFocusExpanded ? 'Thu gọn ▲' : 'Mở ▼'}
                </button>
                <button onClick={() => setSelectedAntId(null)} className="border-none bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-red-500 text-base font-bold p-1 w-6 h-6 flex items-center justify-center transition-colors cursor-pointer" title="Thoát soi cá thể">×</button>
              </div>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${isFocusExpanded ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {focusAntData?.type === 'queen' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/25 text-yellow-900 dark:text-yellow-200 text-[11.5px] p-2 leading-tight rounded mb-3 border border-yellow-300 dark:border-yellow-700/60">
                  <b className="block mb-0.5">👑 Kiến Chúa (Colony Queen — 7.32 MEU):</b> Trung tâm sinh sản & nội tiết của vương quốc (~14.2 mg). Được Kiến Thợ (Minor) mớm thức ăn qua Trophallaxis và được Đội hình Kiến Lính (Soldier) hộ giá khi tuần du. Phát xung Pheromone QMP giúp tăng +22% tốc độ và giảm 30% tiêu hao năng lượng cho bầy!{' '}
                  <Link to="/docs/giai-cap-xa-hoi#2-kiến-chúa-queen--cỗ-máy-sinh-sản-vĩnh-cửu" className="text-yellow-700 dark:text-yellow-400 font-bold hover:underline">Đọc thêm →</Link>
                </div>
              )}
              {focusAntData?.type === 'major' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-[11.5px] p-2 leading-tight rounded mb-3 border border-amber-200 dark:border-amber-800/50">
                  <b className="block mb-0.5">⚔️ Kiến Tướng (Major Juggernaut — 2.83 MEU):</b> Đầu khổng lồ chứa cơ khép hàm phát triển và hàm dưới không răng (Edentate) chuyên nghiền hạt/vỏ Kitin cứng cho Kiến Thợ khiêng, đồng thời làm lá chắn giảm 60% sát thương AoE cho đồng đội khi đánh nhện.{' '}
                  <Link to="/docs/giai-cap-xa-hoi#12-giải-phẫu-học-tiến-hóa-ở-kiến-thợ-đại" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Đọc thêm →</Link>
                </div>
              )}
              {focusAntData?.type === 'soldier' && (
                <div className="bg-sky-50 dark:bg-sky-900/20 text-sky-900 dark:text-sky-200 text-[11.5px] p-2 leading-tight rounded mb-3 border border-sky-200 dark:border-sky-800/50">
                  <b className="block mb-0.5">🛡️ Kiến Lính (Media Soldier — 1.81 MEU):</b> Tầng lớp trung gian cơ động (~2.2 mg) tuần tra vành đai 24m quanh tổ, lập đội hình Phalanx hộ giá Kiến Chúa và chuyên cắn khóa khớp chân làm chậm thiên địch tới 75%.{' '}
                  <Link to="/docs/giai-cap-xa-hoi#11-ranh-giới-toán-học-của-giai-cấp" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">Đọc thêm →</Link>
                </div>
              )}
              {focusAntData?.type === 'minor' && (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 text-[11.5px] p-2 leading-tight rounded mb-3 border border-neutral-200 dark:border-neutral-700/50">
                  <b className="block mb-0.5">👷 Kiến Thợ (Minor Worker — 1.00 MEU):</b> Khung xương nhỏ (~1.0 mg), di chuyển lanh lẹ. Đảm nhận trinh sát, gọi Kiến Tướng tới nghiền mồi cứng, khiêng mồi đã sơ chế, hầu hạ Kiến Chúa và làm Y tá Allogrooming chữa thương cho Kiến Lính/Tướng!{' '}
                  <Link to="/docs/giai-cap-xa-hoi#11-ranh-giới-toán-học-của-giai-cấp" className="text-blue-500 dark:text-blue-400 font-bold hover:underline">Đọc thêm →</Link>
                </div>
              )}

              {focusAntData?.qmpBuffTimer > 0 && (
                <div className="mb-2 px-2.5 py-1 rounded bg-yellow-500/15 border border-yellow-500/40 text-yellow-700 dark:text-yellow-300 text-[11px] font-bold flex items-center justify-between">
                  <span>✨ Hào quang QMP Hoàng Gia (+22% Tốc, -30% Đói)</span>
                  <span>{focusAntData.qmpBuffTimer.toFixed(0)}s</span>
                </div>
              )}

              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded mb-3 border border-blue-100 dark:border-blue-800/50">
                <div className="font-bold text-[13px] text-blue-900 dark:text-blue-300">{focusExplain ? focusExplain.title : 'Đang phân tích...'}</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium uppercase mt-1 tracking-wider">Bio. State: {focusAntData?.bioState || 'UKN'}</div>
              </div>

              <p className="my-2 text-[12px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                {focusExplain ? focusExplain.desc : ''}
              </p>

              <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="space-y-1.5 mb-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 font-bold text-neutral-600 dark:text-neutral-400">SINH LỰC</span>
                    <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, ((focusAntData?.hp || 0) / (focusAntData?.maxHp || 25)) * 100))}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 font-bold text-neutral-600 dark:text-neutral-400">NĂNG LƯỢNG</span>
                    <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${Math.max(0, focusAntData?.energy || 0)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 font-bold text-neutral-600 dark:text-neutral-400">NƯỚC</span>
                    <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.max(0, focusAntData?.hydration || 0)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 font-bold text-neutral-600 dark:text-neutral-400">TUỔI ĐỜI</span>
                    <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, (focusAntData?.age / (focusAntData?.maxAge || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => { setIsTracking(!isTracking); if (isAntPOV) setIsAntPOV(false); }}
                    className={`border-none outline-none ring-0 w-full py-1.5 px-2 rounded text-xs font-bold transition-colors cursor-pointer ${isTracking && !isAntPOV ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'}`}
                  >
                    {isTracking && !isAntPOV ? '⏹️ Huỷ Bám' : '🎥 Bám Theo'}
                  </button>
                  <button
                    onClick={() => { setIsAntPOV(!isAntPOV); setIsTracking(false); }}
                    className={`border-none outline-none ring-0 w-full py-1.5 px-2 rounded text-xs font-bold transition-colors cursor-pointer ${isAntPOV ? 'bg-cyan-600 text-white shadow-md' : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-800'}`}
                  >
                    {isAntPOV ? '👁️ Thoát POV' : '👁️ Góc Nhìn Kiến'}
                  </button>
                </div>
                <Link to={focusExplain ? focusExplain.link : '/docs/gioi-thieu'} className="block w-full text-center bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-blue-700 no-underline transition-colors border-none outline-none ring-0">
                  ĐỌC CHI TIẾT TRONG BÁCH KHOA →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ant-sim-canvas-stage relative w-full h-full z-0 isolate">
        <Canvas
          camera={{ position: [0, 60, 80], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'high-performance', antialias: false }}
          shadows
        >
        <color
          attach="background"
          args={[
            weatherMode === 'tornado'
              ? '#111827'
              : weatherMode === 'rain'
              ? '#0f172a'
              : weatherMode === 'heatwave' || soilTempC >= 37
              ? '#271709'
              : soilTempC <= 18
              ? '#0f172a'
              : weatherMode === 'windstorm'
              ? '#1c1917'
              : activeCircadian.bgHex,
          ]}
        />
        <hemisphereLight
          args={[
            weatherMode === 'rain' || weatherMode === 'tornado' || soilTempC <= 18
              ? '#93c5fd'
              : weatherMode === 'heatwave' || soilTempC >= 37
              ? '#fdba74'
              : activeCircadian.hemiSky,
            activeCircadian.hemiGround,
            weatherMode === 'rain' || weatherMode === 'tornado' ? 0.42 : activeCircadian.hemiIntensity,
          ]}
        />
        <ambientLight
          intensity={
            weatherMode === 'rain' || weatherMode === 'tornado'
              ? 0.25
              : weatherMode === 'heatwave' || soilTempC >= 37
              ? 0.65
              : activeCircadian.ambientIntensity
          }
        />
        {isRaining && <Rain />}
        <directionalLight
          position={activeCircadian.sunPos}
          color={weatherMode === 'heatwave' || soilTempC >= 37 ? '#ffedd5' : (soilTempC <= 18 ? '#bfdbfe' : activeCircadian.dirColor)}
          intensity={
            weatherMode === 'rain' || weatherMode === 'tornado'
              ? 0.75
              : weatherMode === 'heatwave' || soilTempC >= 37
              ? 3.1
              : activeCircadian.dirIntensity
          }
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <React.Suspense fallback={null}>
          <Simulation
            key={resetKey}
            modelUrl={modelUrl}
            enemyList={enemyList}
            foodList={foodList}
            clickMode={clickMode}
            isRaining={isRaining}
            isFlooding={isFlooding}
            timeOfDay={timeOfDay}
            weatherMode={weatherMode}
            territoryAreaM2={territoryAreaM2}
            soilTempC={soilTempC}
            socialForm={socialForm}
            showTerritoryRing={showScalingLab}
            tornadoTargetRef={tornadoTargetRef}
            isXRayMode={isXRayMode}
            showHeatmap={showHeatmap}
            isAntPOV={isAntPOV}
            isQueenProcession={isQueenProcession}
            antCount={targetBornCount}
            waterRate={waterRate}
            onConsumeFood={onConsumeFood}
            setFoodList={setFoodList}
            onEnemyKilled={onEnemyKilled}
            onFoodDelivered={onFoodDelivered}
            onStatsChange={setStats}
            enemyDataRef={enemyDataRef}
            selectedAntId={selectedAntId}
            isTracking={isTracking}
            onSelectAnt={handleSelectAnt}
            onFocusDataChange={setFocusAntData}
            controlsRef={controlsRef}
          />
        </React.Suspense>
        <React.Suspense fallback={null}>
          <Ground
            isXRayMode={isXRayMode}
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
          />
        </React.Suspense>
          <OrbitControls
            ref={controlsRef}
            target={[0, 0, 0]}
            maxPolarAngle={isXRayMode ? Math.PI * 0.62 : Math.PI / 2 - 0.05}
            mouseButtons={{
              LEFT: clickMode === 'move' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: clickMode === 'move' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
            }}
          />
        </Canvas>
      </div>

      {/* EXTINCTION OVERLAY */}
      {totalAlive === 0 && deliveryCount > 0 && (
        <div className="absolute inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-neutral-900 border border-red-900/50 p-8 rounded-2xl max-w-md text-center shadow-2xl shadow-red-900/20">
            <div className="text-6xl mb-4">🪦</div>
            <h2 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-wider">Hệ Sinh Thái Sụp Đổ</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Quần thể kiến đã bị diệt vong hoàn toàn. Nguyên nhân có thể do đói khát, tuổi tác hoặc bị thiên địch quét sạch.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6 text-left bg-black/50 p-4 rounded-xl border border-neutral-800 text-sm">
              <div className="text-neutral-400">Thời gian sinh tồn:</div>
              <div className="text-white font-bold text-right">{populationHistory.length * 5}s</div>
              <div className="text-neutral-400">Kiến đã sinh:</div>
              <div className="text-white font-bold text-right">{antsBorn} cá thể</div>
              <div className="text-neutral-400">Sức chứa K Max (Vi mô):</div>
              <div className="text-white font-bold text-right">{maxKValue} kiến</div>
              <div className="text-neutral-400">Sức chứa K Max (Vĩ mô):</div>
              <div className="text-white font-bold text-right">{(maxKValueReal / 10000).toFixed(2)} vạn</div>
            </div>
            <button
              onClick={handleResetGame}
              className="w-full py-3 px-4 border-none bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-900/50 cursor-pointer"
            >
              🔄 CHUẨN BỊ THẾ HỆ MỚI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


