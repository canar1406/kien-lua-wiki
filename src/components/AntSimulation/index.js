import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Sparkles, Box, Sphere, Cylinder } from '@react-three/drei';
import { AntModel } from './AntModel';
import * as THREE from 'three';
import useBaseUrl from '@docusaurus/useBaseUrl';

/* ─────────────────── CONSTANTS ─────────────────── */
const ANT_SCALE = 1000;        // multiplyScalar → 0.01 * 1000 = scale 10
const TOUCH_DIST = 4.0;        // khoảng cách chạm râu (≈ 0.5 chiều dài kiến)
const CLOSE_FOOD_DIST = 35.0;  // < ngưỡng này = cả 2 cùng đến luôn (5x body)
const WALK_SPEED = 8.0;        // tốc độ đi dạo
const RUN_SPEED = 20.0;        // tốc độ chạy
const FOOD_PICKUP_DIST = 4.0;  // khoảng cách nhặt đường
const NEST_ARRIVE_DIST = 6.0;  // khoảng cách đến tổ
const BOUNDS = 85;              // giới hạn vùng di chuyển (ground 200x200 → ±85 có margin)
const WANDER_CHANGE_MIN = 2.0; // đổi hướng wandering min (giây)
const WANDER_CHANGE_MAX = 4.0; // đổi hướng wandering max (giây)
const AUTO_COMM_INTERVAL = 300; // 5 phút = 300 giây
const NEST_POS = new THREE.Vector3(-70, 0, -70); // vị trí tổ — góc cân đối

const WATER_POS = new THREE.Vector3(60, 0, 40);
const WATER_ARRIVE_DIST = 20.1; // r=18 + margin để đáp ứng vừa chạm mép hồ 20
const AUTO_DRINK_INTERVAL = 150; // 2.5 phút = 150 giây

/* ─────────────────── HELPERS ─────────────────── */
/* ─────────────────── OBSTACLES & ENVIRONMENT ─────────────────── */
const OBSTACLES = [
  { id: 'lake', x: 60, z: 40, r: 18 },
  { id: 'rock1', x: -40, z: -40, r: 8 },
  { id: 'rock2', x: -60, z: 30, r: 6 },
  { id: 'rock3', x: 20, z: -50, r: 10 }
];

const INFO_BULLETIN = {
  wandering: {
    title: 'Khám Phá Lãnh Thổ',
    desc: 'Kiến thợ di chuyển liên tục theo các quỹ đạo ngẫu nhiên để mở rộng vùng săn mồi. Cặp râu của chúng quét liên tục để nhận diện hóa chất trên mặt đất.',
    link: '/docs/dac-diem-hinh-thai'
  },
  communicating: {
    title: 'Giao Tiếp (Antennation)',
    desc: 'Bằng cách chạm râu vào nhau, kiến kiểm tra mã định danh hydrocarbon để chắc chắn đối phương là đồng loại cùng tổ chứ không phải kẻ xâm nhập.',
    link: '/docs/dac-diem-hinh-thai'
  },
  alarmed: {
    title: 'Pheromone Khẩn Cấp',
    desc: 'Tuyến hàm dưới giải phóng đám mây mùi pyrazine bay hơi nhanh, lan truyền hoảng loạn và kích hoạt bản năng tự vệ tấn công của cả đàn.',
    link: '/docs/giai-cap-xa-hoi'
  },
  food_trophallaxis: {
    title: 'Mớm Mồi (Trophallaxis)',
    desc: 'Kiến nôn ra một giọt thức ăn từ "dạ dày xã hội" để truyền cho đồng loại nếm thử. Hành vi này giúp truyền đạt chất lượng mồi và tuyển dụng nhân lực.',
    link: '/docs/giai-cap-xa-hoi'
  },
  food_carry: {
    title: 'Nhịp Nhàng (Cooperative Transport)',
    desc: 'Để tải vật nặng, đàn kiến xếp thẳng hàng trục về tổ: Con đi trước đối mặt với mồi để kéo giật lùi, con đi sau lấy đầu đẩy tới.',
    link: '/docs/vat-ly-ket-be'
  },
  drink_water: {
    title: 'Bổ Sung Nước (Hydration)',
    desc: 'Vì thân hình cực nhỏ, bề mặt cơ thể kiến mất nước rất nhanh. Chúng thường xuyên dò độ ẩm để tìm nguồn nước, bù nước cho cá nhân và mang về làm mát tổ.',
    link: '/docs/vong-doi-va-tuoi-tho'
  }
};
// Fallback states
INFO_BULLETIN['seek_peer'] = INFO_BULLETIN['communicating'];
INFO_BULLETIN['food_finder_approach'] = INFO_BULLETIN['wandering'];
INFO_BULLETIN['food_recruit_return'] = INFO_BULLETIN['wandering'];
INFO_BULLETIN['food_both_approach'] = INFO_BULLETIN['food_trophallaxis'];

function resolvePhysics(pos, dirVector) {
  if (!pos || !dirVector) return;
  
  pos.x = Math.max(-BOUNDS, Math.min(BOUNDS, pos.x));
  pos.z = Math.max(-BOUNDS, Math.min(BOUNDS, pos.z));
  
  for (const obs of OBSTACLES) {
    const dx = pos.x - obs.x;
    const dz = pos.z - obs.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0 && dist < obs.r + 2) { // 2 = margin body con kiến
      const overlap = (obs.r + 2) - dist;
      const nx = dx / dist;
      const nz = dz / dist;
      pos.x += nx * overlap;
      pos.z += nz * overlap;
      
      const dot = dirVector.x * nx + dirVector.z * nz;
      if (dot < 0) {
        dirVector.x -= dot * nx;
        dirVector.z -= dot * nz;
        dirVector.normalize();
      }
    }
  }
  pos.y = 0;
}

function Scenery() {
  const bushes = useMemo(() => [
    [-30, -50], [50, -30], [30, 60], [-70, 0], [-10, -70]
  ], []);

  const grasses = useMemo(() => 
    Array.from({ length: 50 }).map(() => ({
      x: -80 + Math.random() * 160,
      z: -80 + Math.random() * 160
    })), 
  []);

  return (
    <group>
      {/* Lake */}
      <mesh position={[60, 0.05, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#3498db" roughness={0.1} metalness={0.6} transparent opacity={0.8} />
      </mesh>

      {/* Rocks */}
      <mesh position={[-40, 3, -40]}>
        <dodecahedronGeometry args={[8]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
      </mesh>
      <mesh position={[-60, 2, 30]} rotation={[0.4, 0.2, 0]}>
        <dodecahedronGeometry args={[6]} />
        <meshStandardMaterial color="#95a5a6" roughness={0.8} />
      </mesh>
      <mesh position={[20, 4, -50]} rotation={[0.1, 0.5, 0.2]}>
        <dodecahedronGeometry args={[10]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
      </mesh>

      {/* Hollow log */}
      <group position={[0, 4, 30]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[5, 5, 20, 16, 1, true]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Bushes */}
      {bushes.map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[3, 7, 7]} />
            <meshStandardMaterial color="#27ae60" roughness={0.8} />
          </mesh>
          <mesh position={[2, 1.5, 1]}>
            <sphereGeometry args={[2.5, 7, 7]} />
            <meshStandardMaterial color="#2ecc71" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Scattered Grass */}
      {grasses.map((pos, i) => (
        <mesh 
          key={`grass-${i}`} 
          position={[pos.x, 0.5, pos.z]}
        >
          <coneGeometry args={[0.5, 2, 4]} />
          <meshStandardMaterial color="#2ecc71" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function randomWanderDir() {
  const angle = Math.random() * Math.PI * 2;
  return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
}

function randomWanderTime() {
  return WANDER_CHANGE_MIN + Math.random() * (WANDER_CHANGE_MAX - WANDER_CHANGE_MIN);
}

function reflectIfOOB(pos, dir) {
  // Nếu sắp ra khỏi bounds, đổi hướng về phía trung tâm + random
  if (Math.abs(pos.x) > BOUNDS - 5 || Math.abs(pos.z) > BOUNDS - 5) {
    const toCenter = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
    dir.copy(toCenter);
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 1.2);
    dir.normalize();
  }
}

/* ─────────────────── GROUND ─────────────────── */
function Ground({ onClick }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow onClick={onClick}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#388E3C" roughness={1} />
    </mesh>
  );
}

/* ─────────────────── NEST MARKER ─────────────────── */
function NestMarker() {
  return (
    <group position={[NEST_POS.x, 0, NEST_POS.z]}>
      {/* Gò đất tổ kiến */}
      <Cylinder args={[3, 5, 1.5, 12]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[1.5, 3, 0.5, 12]} position={[0, 1.75, 0]}>
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </Cylinder>
      {/* Lỗ tổ */}
      <Cylinder args={[0.8, 0.8, 0.3, 8]} position={[0, 2.1, 0]}>
        <meshBasicMaterial color="#1a1a1a" />
      </Cylinder>
      <Html position={[0, 5, 0]} center>
        <div style={{ color: '#D2691E', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap', textShadow: '0 0 4px black' }}>
          🏠 Tổ Kiến
        </div>
      </Html>
    </group>
  );
}

/* ─────────────────── SIMULATION ─────────────────── */
function Simulation({ modelUrl, alarmPos, foodList, onConsumeFood, onFoodDelivered, forceComm, onForceCommDone, forceDrink, onForceDrinkDone, onStateChange }) {
  const antARef = useRef();
  const antBRef = useRef();

  // State machine
  const [state, setState] = useState('wandering');
  const [animA, setAnimA] = useState('Insect|walk_1');
  const [animB, setAnimB] = useState('Insect|walk_1');
  const [bioStateA, setBioStateA] = useState('WANDERING');
  const [bioStateB, setBioStateB] = useState('WANDERING');
  const [statusText, setStatusText] = useState('');

  // Direction refs — AntModel đọc trực tiếp, không qua React state
  const targetDirA = useRef(new THREE.Vector3(1, 0, 0));
  const targetDirB = useRef(new THREE.Vector3(-1, 0, 0));

  // Wander state (per ant)
  const wanderTimerA = useRef(randomWanderTime());
  const wanderTimerB = useRef(randomWanderTime());
  const wanderDirA = useRef(randomWanderDir());
  const wanderDirB = useRef(randomWanderDir());

  // Timer for states
  const stateTimer = useRef(0);
  const autoCommTimer = useRef(0);
  const drinkTimer = useRef(0);

  // Food tracking
  const finderAnt = useRef('A'); // 'A' or 'B'
  const foodPosRef = useRef(null); // world position of food
  const foodIdRef = useRef(null); // world tracking id of target food
  const [isCarrying, setIsCarrying] = useState(false);
  const carriedFoodMeshRef = useRef();

  // Init positions
  useEffect(() => {
    if (antARef.current && antBRef.current) {
      antARef.current.position.set(-30, 0, 10);
      antBRef.current.position.set(30, 0, -10);
    }
  }, []);

  // Update outer UI listener
  useEffect(() => {
    if (onStateChange) onStateChange(state);
  }, [state, onStateChange]);

  // Wander behavior for a single ant
  const doWander = useCallback((ref, dirRef, timerRef, wanderDir, delta) => {
    if (!ref.current) return;
    const pos = ref.current.position;

    timerRef.current -= delta;
    if (timerRef.current <= 0) {
      wanderDir.current = randomWanderDir();
      timerRef.current = randomWanderTime();
    }

    reflectIfOOB(pos, wanderDir.current);
    pos.addScaledVector(wanderDir.current, WALK_SPEED * delta);
    resolvePhysics(pos, wanderDir.current);
    dirRef.current.copy(wanderDir.current);
  }, []);

  // Handle external forced actions safely via useEffect
  useEffect(() => {
    if (forceComm && state !== 'seek_peer' && state !== 'communicating') {
      setState('seek_peer');
      setBioStateA('WANDERING');
      setBioStateB('WANDERING');
    }
  }, [forceComm, state]);

  useEffect(() => {
    if (forceDrink && state !== 'drink_water') {
      setState('drink_water');
      setBioStateA('WANDERING');
      setBioStateB('WANDERING');
      setStatusText('💧 Đang đi uống nước...');
    }
  }, [forceDrink, state]);

  useFrame((_, delta) => {
    if (!antARef.current || !antBRef.current) return;

    const posA = antARef.current.position;
    const posB = antBRef.current.position;
    posA.y = 0; posB.y = 0;

    const dist = posA.distanceTo(posB);

    // Tự động Giao tiếp (5 phút / lần)
    autoCommTimer.current += delta;
    if (autoCommTimer.current > AUTO_COMM_INTERVAL && state === 'wandering') {
      autoCommTimer.current = 0;
      setState('seek_peer');
      setBioStateA('WANDERING');
      setBioStateB('WANDERING');
    }

    // Tự động Uống nước (2.5 phút / lần)
    drinkTimer.current += delta;
    if (drinkTimer.current > AUTO_DRINK_INTERVAL && state === 'wandering') {
      drinkTimer.current = 0;
      setState('drink_water');
      setBioStateA('WANDERING');
      setBioStateB('WANDERING');
      setStatusText('💧 Khát nước, đang đi tìm hồ...');
    }

    // ═══════════════════ ALARM ═══════════════════
    if (alarmPos && state !== 'alarmed') {
      setState('alarmed');
      setBioStateA('ALARMED');
      setBioStateB('ALARMED');
      setAnimA('Insect|walk_1');
      setAnimB('Insect|walk_1');
      stateTimer.current = 0;
      setStatusText('⚠️ BÁO ĐỘNG!');
      // Chạy xa khỏi alarm
      wanderDirA.current.subVectors(posA, alarmPos).setY(0).normalize();
      wanderDirB.current.subVectors(posB, alarmPos).setY(0).normalize();
    }

    // ═══════════════════ FOOD TARGETING ═══════════════════
    let targetFood = null;
    let minD = Infinity;

    if (foodList && foodList.length > 0 && (state === 'wandering' || state === 'food_finder_approach' || state === 'food_both_approach')) {
      for (const food of foodList) {
        const v = new THREE.Vector3(food.x, 0, food.z);
        const d = Math.min(posA.distanceTo(v), posB.distanceTo(v));
        if (d < minD) {
          minD = d;
          targetFood = food;
        }
      }
    }

    if (targetFood && (state === 'wandering' || state === 'food_finder_approach' || state === 'food_both_approach')) {
      const foodVec = new THREE.Vector3(targetFood.x, 0, targetFood.z);
      
      // Khóa mục tiêu mới nhất dẫu đang trên đường đi
      foodPosRef.current = foodVec.clone();
      foodIdRef.current = targetFood.id;
      
      const distA = posA.distanceTo(foodVec);
      const distB = posB.distanceTo(foodVec);

      // Tránh việc revert lại state food_finder_approach nếu đã lỡ vào food_both_approach (hai con cùng đi)
      if (state === 'food_both_approach') {
        // Giữ nguyên, không rớt state
      } else if (distA < CLOSE_FOOD_DIST && distB < CLOSE_FOOD_DIST) {
        setState('food_both_approach');
        setAnimA('Insect|walk_1');
        setAnimB('Insect|walk_1');
        setStatusText('🍬 Cả hai phát hiện đường!');
      } else {
        finderAnt.current = distA < distB ? 'A' : 'B';
        if (state !== 'food_finder_approach') {
          setState('food_finder_approach');
          setAnimA('Insect|walk_1');
          setAnimB('Insect|walk_1');
          setStatusText('🔍 Đang tìm đường...');
        }
      }
    }

    // ═══════════════════ STATE MACHINE ═══════════════════
    switch (state) {

      case 'wandering': {
        doWander(antARef, targetDirA, wanderTimerA, wanderDirA, delta);
        doWander(antBRef, targetDirB, wanderTimerB, wanderDirB, delta);
        setStatusText('');
        break;
      }

      case 'seek_peer': {
        // Cả 2 đi về phía nhau
        const dirAtoB = new THREE.Vector3().subVectors(posB, posA).setY(0).normalize();
        const dirBtoA = new THREE.Vector3().subVectors(posA, posB).setY(0).normalize();
        
        posA.addScaledVector(dirAtoB, WALK_SPEED * 1.5 * delta);
        posB.addScaledVector(dirBtoA, WALK_SPEED * 1.5 * delta);
        resolvePhysics(posA, dirAtoB);
        resolvePhysics(posB, dirBtoA);

        targetDirA.current.copy(dirAtoB);
        targetDirB.current.copy(dirBtoA);

        if (dist < TOUCH_DIST) {
          setState('communicating');
          setBioStateA('GREETING');
          setBioStateB('GREETING');
          setAnimA('Insect|idle_A2');
          setAnimB('Insect|idle_A3');
          stateTimer.current = 0;
          setStatusText('🔬 Nhận Diện Đồng Loại (Antennation)');
        }
        break;
      }

      case 'communicating': {
        stateTimer.current += delta;
        // Đối mặt nhau
        targetDirA.current.subVectors(posB, posA).setY(0).normalize();
        targetDirB.current.subVectors(posA, posB).setY(0).normalize();

        if (stateTimer.current >= 1.5) {
          setState('wandering');
          setBioStateA('WANDERING');
          setBioStateB('WANDERING');
          setAnimA('Insect|walk_1');
          setAnimB('Insect|walk_1');
          setStatusText('');
          if (onForceCommDone) onForceCommDone();
          wanderDirA.current = randomWanderDir();
          wanderDirB.current = randomWanderDir();
        }
        break;
      }

      case 'food_finder_approach': {
        const food = foodPosRef.current;
        if (!food) { setState('wandering'); break; }

        const isFinder = finderAnt.current === 'A';
        const finderRef = isFinder ? antARef : antBRef;
        const otherRef = isFinder ? antBRef : antARef;
        const finderDirRef = isFinder ? targetDirA : targetDirB;
        const otherDirRef = isFinder ? targetDirB : targetDirA;

        // Finder chạy đến đường
        const toFood = new THREE.Vector3().subVectors(food, finderRef.current.position).setY(0).normalize();
        finderRef.current.position.addScaledVector(toFood, RUN_SPEED * delta);
        resolvePhysics(finderRef.current.position, toFood);
        finderDirRef.current.copy(toFood);

        // Other wander
        doWander(otherRef, otherDirRef,
          isFinder ? wanderTimerB : wanderTimerA,
          isFinder ? wanderDirB : wanderDirA, delta);

        if (finderRef.current.position.distanceTo(food) < FOOD_PICKUP_DIST) {
          setState('food_recruit_return');
          setStatusText('📡 Đang quay về báo tin...');
        }
        break;
      }

      case 'food_recruit_return': {
        // Finder quay về tìm other ant
        const isFinder = finderAnt.current === 'A';
        const finderRef = isFinder ? antARef : antBRef;
        const otherRef = isFinder ? antBRef : antARef;
        const finderDirRef = isFinder ? targetDirA : targetDirB;
        const otherDirRef = isFinder ? targetDirB : targetDirA;

        const toOther = new THREE.Vector3().subVectors(otherRef.current.position, finderRef.current.position).setY(0).normalize();
        finderRef.current.position.addScaledVector(toOther, RUN_SPEED * delta);
        resolvePhysics(finderRef.current.position, toOther);
        finderDirRef.current.copy(toOther);

        // Other wander slowly
        doWander(otherRef, otherDirRef,
          isFinder ? wanderTimerB : wanderTimerA,
          isFinder ? wanderDirB : wanderDirA, delta);

        const finderDist = finderRef.current.position.distanceTo(otherRef.current.position);
        if (finderDist < TOUCH_DIST) {
          setState('food_trophallaxis');
          setBioStateA('FOOD_RECRUITMENT');
          setBioStateB('FOOD_RECRUITMENT');
          setAnimA('Insect|idle_A2');
          setAnimB('Insect|idle_A2');
          stateTimer.current = 0;
          setStatusText('🤝 Truyền Tin Thức Ăn (Trophallaxis)');
        }
        break;
      }

      case 'food_trophallaxis': {
        stateTimer.current += delta;
        targetDirA.current.subVectors(posB, posA).setY(0).normalize();
        targetDirB.current.subVectors(posA, posB).setY(0).normalize();

        if (stateTimer.current >= 2.5) {
          setState('food_both_approach');
          setBioStateA('WANDERING');
          setBioStateB('WANDERING');
          setAnimA('Insect|walk_1');
          setAnimB('Insect|walk_1');
          setStatusText('🍬 Cả hai đang đến lấy đường...');
        }
        break;
      }

      case 'food_both_approach': {
        const food = foodPosRef.current;
        if (!food) { setState('wandering'); break; }

        const toFoodA = new THREE.Vector3().subVectors(food, posA).setY(0).normalize();
        const toFoodB = new THREE.Vector3().subVectors(food, posB).setY(0).normalize();

        posA.addScaledVector(toFoodA, RUN_SPEED * delta);
        posB.addScaledVector(toFoodB, RUN_SPEED * delta);
        resolvePhysics(posA, toFoodA);
        resolvePhysics(posB, toFoodB);

        targetDirA.current.copy(toFoodA);
        targetDirB.current.copy(toFoodB);

        const distAFood = posA.distanceTo(food);
        const distBFood = posB.distanceTo(food);

        if (distAFood < FOOD_PICKUP_DIST && distBFood < FOOD_PICKUP_DIST) {
          setState('food_carry');
          setAnimA('Insect|walk_1');
          setAnimB('Insect|walk_1');
          setIsCarrying(true);
          onConsumeFood(foodIdRef.current); // xóa food marker tương ứng trên ground
          setStatusText('🏋️ Đang tha đường về tổ...');
        }
        break;
      }

      case 'food_carry': {
        // Cả 2 vác chung 1 khối đường! Tính toán chuyển động cho Tâm Hệ Tọa Độ (Khối đường)
        const center = new THREE.Vector3().lerpVectors(posA, posB, 0.5);
        const toNest = new THREE.Vector3().subVectors(NEST_POS, center).setY(0).normalize();
        
        const carrySpeed = WALK_SPEED * 0.6;
        center.addScaledVector(toNest, carrySpeed * delta);
        
        // Giải quyết vật lý cho toàn bộ hệ
        resolvePhysics(center, toNest);

        // Thay vì kẹp ngang, kiến tha mồi lớn sẽ xếp dọc: 1 kéo 1 đẩy
        const separation = 3.0;

        // Kẻ Kéo (Đi trước, cắn mồi và lùi lại - quay mặt về khối đường)
        posA.copy(center).addScaledVector(toNest, separation);
        targetDirA.current.copy(toNest).negate(); 

        // Người Đẩy (Đi sau, húc đầu tới - quay mặt cùng hướng di chuyển đâm vào khối đường)
        posB.copy(center).addScaledVector(toNest, -separation);
        targetDirB.current.copy(toNest);

        // Render cục đường ngay chính giữa
        if (carriedFoodMeshRef.current) {
          const visualCenter = center.clone();
          visualCenter.y = 1.5;
          carriedFoodMeshRef.current.position.copy(visualCenter);
        }

        const distNest = center.distanceTo(NEST_POS);

        if (distNest < NEST_ARRIVE_DIST) {
          setState('wandering');
          setBioStateA('WANDERING');
          setBioStateB('WANDERING');
          setIsCarrying(false);
          foodPosRef.current = null;
          foodIdRef.current = null;
          onFoodDelivered();
          setStatusText('✅ Đã đưa đường về tổ!');
          setTimeout(() => setStatusText(''), 3000);
          wanderDirA.current = randomWanderDir();
          wanderDirB.current = randomWanderDir();
        }
        break;
      }

      case 'alarmed': {
        stateTimer.current += delta;
        
        reflectIfOOB(posA, wanderDirA.current);
        reflectIfOOB(posB, wanderDirB.current);
        posA.addScaledVector(wanderDirA.current, RUN_SPEED * 1.5 * delta);
        posB.addScaledVector(wanderDirB.current, RUN_SPEED * 1.5 * delta);
        resolvePhysics(posA, wanderDirA.current);
        resolvePhysics(posB, wanderDirB.current);

        targetDirA.current.copy(wanderDirA.current);
        targetDirB.current.copy(wanderDirB.current);

        if (stateTimer.current >= 5.0) {
          setState('wandering');
          setBioStateA('WANDERING');
          setBioStateB('WANDERING');
          setStatusText('');
          wanderDirA.current = randomWanderDir();
          wanderDirB.current = randomWanderDir();
        }
        break;
      }

      case 'drink_water': {
        const toWaterA = new THREE.Vector3().subVectors(WATER_POS, posA).setY(0).normalize();
        const toWaterB = new THREE.Vector3().subVectors(WATER_POS, posB).setY(0).normalize();
        
        const distWA = posA.distanceTo(WATER_POS);
        const distWB = posB.distanceTo(WATER_POS);
        
        let drinkingA = false, drinkingB = false;

        if (distWA > WATER_ARRIVE_DIST) {
           posA.addScaledVector(toWaterA, WALK_SPEED * delta);
           targetDirA.current.copy(toWaterA);
           resolvePhysics(posA, toWaterA);
           setAnimA('Insect|walk_1');
           setBioStateA('WANDERING');
        } else {
           drinkingA = true;
           setAnimA('Insect|idle_A3'); 
           setBioStateA('DRINKING'); 
        }

        if (distWB > WATER_ARRIVE_DIST) {
           posB.addScaledVector(toWaterB, WALK_SPEED * delta);
           targetDirB.current.copy(toWaterB);
           resolvePhysics(posB, toWaterB);
           setAnimB('Insect|walk_1');
           setBioStateB('WANDERING');
        } else {
           drinkingB = true;
           setAnimB('Insect|idle_A3');
           setBioStateB('DRINKING');
        }

        if (drinkingA && drinkingB) {
           stateTimer.current -= delta;
           if (stateTimer.current <= 0) {
              setState('wandering');
              setBioStateA('WANDERING');
              setBioStateB('WANDERING');
              setAnimA('Insect|walk_1');
              setAnimB('Insect|walk_1');
              setStatusText('');
              if (onForceDrinkDone) onForceDrinkDone();
           }
        } else {
           stateTimer.current = 5.0; // 5s uống nước
        }
        break;
      }

      default:
        setState('wandering');
    }
  });

  return (
    <group>
      {/* ANT A */}
      <group ref={antARef}>
        <AntModel
          url={modelUrl}
          animationName={animA}
          bioState={bioStateA}
          scaleFactor={ANT_SCALE}
          targetDirRef={targetDirA}
        />
      </group>

      {/* ANT B */}
      <group ref={antBRef}>
        <AntModel
          url={modelUrl}
          animationName={animB}
          bioState={bioStateB}
          scaleFactor={ANT_SCALE}
          targetDirRef={targetDirB}
        />
      </group>

      {/* NEST */}
      <NestMarker />

      {/* SCENERY */}
      <Scenery />

      {/* FOOD on ground */}
      {foodList && foodList.map((food) => (
        <group key={food.id} position={[food.x, 0, food.z]}>
          <Box args={[2, 2, 2]}>
            <meshStandardMaterial color="#F5DEB3" />
          </Box>
          <Sparkles count={15} scale={6} size={4} speed={0.2} color="#FFD700" />
          <Html position={[0, 3.5, 0]} center>
            <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap', textShadow: '0 0 4px black' }}>
              🍬 Viên Đường
            </div>
          </Html>
        </group>
      ))}

      {/* FOOD being carried */}
      {isCarrying && (
        <Box ref={carriedFoodMeshRef} args={[1.5, 1.5, 1.5]}>
          <meshStandardMaterial color="#F5DEB3" />
        </Box>
      )}

      {/* ALARM VFX */}
      {state === 'alarmed' && alarmPos && (
        <group position={alarmPos}>
          <Sparkles count={50} scale={15} size={8} speed={0.6} color="red" />
        </group>
      )}

      {/* STATUS TEXT */}
      {statusText && (
        <Html position={[0, 12, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '8px 16px', borderRadius: '8px', whiteSpace: 'nowrap',
            fontSize: '14px', fontWeight: 'bold'
          }}>
            {statusText}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function AntSimulation() {
  const modelUrl = useBaseUrl('/models/fire_ant/fire-ant.gltf');
  const bgUrl = useBaseUrl('/models/fire_ant/background.jpeg');

  const [clickMode, setClickMode] = useState('move');
  const [alarmPos, setAlarmPos] = useState(null);
  const [foodList, setFoodList] = useState([]);
  const [forceComm, setForceComm] = useState(false);
  const [forceDrink, setForceDrink] = useState(false);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [simState, setSimState] = useState('wandering');

  const handleClick = (e) => {
    if (clickMode === 'move' || clickMode === 'rotate') return;
    if (e.point) {
      if (clickMode === 'alarm') {
        setAlarmPos(e.point);
        setTimeout(() => setAlarmPos(null), 5000);
      } else {
        let fx = e.point.x;
        let fz = e.point.z;
        for (const obs of OBSTACLES) {
          const dx = fx - obs.x;
          const dz = fz - obs.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0 && dist < obs.r + 2.5) { // đẩy ra +2.5 an toàn hơn
            const overlap = (obs.r + 2.5) - dist;
            fx += (dx / dist) * overlap;
            fz += (dz / dist) * overlap;
          }
        }
        setFoodList(prev => [...prev, { id: Date.now() + Math.random(), x: fx, z: fz }]);
        setAlarmPos(null);
      }
    }
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] relative text-sm overflow-hidden bg-neutral-900">

      {/* CONTROL PANEL */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:top-5 md:bottom-auto md:left-5 md:-translate-x-0 z-[100] bg-neutral-900/90 p-4 rounded-xl border border-neutral-700 text-white shadow-2xl w-[92%] sm:w-[320px] max-w-full">
        <h4 className="m-0 mb-3 text-base border-b border-neutral-700 pb-2 text-white">
          🔬 Điều Khiển Sinh Học
        </h4>
        <p className="m-0 mb-3 text-[11px] text-neutral-400">
          Click vào mặt đất mô phỏng để tương tác
        </p>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => setClickMode('move')}
              className={`py-2 px-1 text-xs font-bold rounded-lg border-none cursor-pointer transition-colors ${clickMode === 'move' ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-600 text-white'}`}>
              🤚 Kéo Cam
            </button>
            <button
              onClick={() => setClickMode('rotate')}
              className={`py-2 px-1 text-xs font-bold rounded-lg border-none cursor-pointer transition-colors ${clickMode === 'rotate' ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-600 text-white'}`}>
              🔄 Xoay/Nghiêng
            </button>
            <button
              onClick={() => setClickMode('food')}
              className={`py-2 px-1 text-xs font-bold rounded-lg border-none cursor-pointer transition-colors ${clickMode === 'food' ? 'bg-green-600 text-white' : 'bg-neutral-800 hover:bg-neutral-600 text-white'}`}>
              🍬 Thả Đường
            </button>
            <button
              onClick={() => setClickMode('alarm')}
              className={`py-2 px-1 text-xs font-bold rounded-lg border-none cursor-pointer transition-colors ${clickMode === 'alarm' ? 'bg-red-600 text-white' : 'bg-neutral-800 hover:bg-neutral-600 text-white'}`}>
              ⚠️ Báo Động
            </button>
            <button
              onClick={() => setForceComm(true)}
              className="py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg border-none cursor-pointer transition-colors bg-blue-700 hover:bg-blue-600 text-white shadow-md">
              🔄 Ép Giao Tiếp
            </button>
            <button
              onClick={() => setForceDrink(true)}
              className="py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg border-none cursor-pointer transition-colors bg-cyan-600 hover:bg-cyan-500 text-white shadow-md">
              💧 Uống Nước
            </button>
          </div>
        </div>
        
        {deliveryCount > 0 && (
          <div className="mt-3 text-xs text-green-400 border-t border-neutral-700 pt-2 font-medium">
            🏠 Đã đưa về tổ: {deliveryCount} viên
          </div>
        )}
      </div>

      {/* RIGHT INFO PANEL (DYNAMIC) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-5 md:right-5 md:left-auto md:-translate-x-0 z-[100] bg-white/95 p-4 rounded-xl border border-neutral-200 text-neutral-900 shadow-xl w-[92%] sm:w-[280px]">
        <h4 className="m-0 text-orange-600 flex items-center gap-2 text-sm sm:text-[15px] font-bold">
          <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
          {INFO_BULLETIN[simState]?.title || INFO_BULLETIN['wandering'].title}
        </h4>
        <p className="my-2.5 mx-0 text-[12px] sm:text-[13px] leading-relaxed color-neutral-800">
          {INFO_BULLETIN[simState]?.desc || INFO_BULLETIN['wandering'].desc}
        </p>
        <a href={useBaseUrl(INFO_BULLETIN[simState]?.link || INFO_BULLETIN['wandering'].link)}
           target="_blank" rel="noreferrer"
           className="inline-block text-orange-500 font-bold no-underline text-[11px] sm:text-[12px] hover:text-orange-600 transition-colors">
          XEM CHI TIẾT TÀI LIỆU →
        </a>
      </div>

      <Canvas camera={{ position: [0, 60, 80], fov: 50 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[15, 25, 15]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <React.Suspense fallback={null}>
          <Simulation
            modelUrl={modelUrl}
            alarmPos={alarmPos}
            foodList={foodList}
            onConsumeFood={(id) => setFoodList(prev => prev.filter(f => f.id !== id))}
            onFoodDelivered={() => {
              setDeliveryCount(c => c + 1);
            }}
            forceComm={forceComm}
            onForceCommDone={() => setForceComm(false)}
            forceDrink={forceDrink}
            onForceDrinkDone={() => setForceDrink(false)}
            onStateChange={setSimState}
          />
        </React.Suspense>

        <React.Suspense fallback={null}>
          <Ground textureUrl={bgUrl} onClick={handleClick} />
        </React.Suspense>

        <OrbitControls 
          target={[0, 0, 0]} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          mouseButtons={{
            LEFT: clickMode === 'move' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: clickMode === 'move' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN
          }}
        />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={200} blur={2} far={20} />
      </Canvas>
    </div>
  );
}
