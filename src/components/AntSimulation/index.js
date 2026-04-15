import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Sparkles, Box, Cylinder, Sphere } from '@react-three/drei';
import { AntModel } from './AntModel';
import * as THREE from 'three';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';

/* ─────────────────── CONSTANTS ─────────────────── */
const NUM_ANTS = 20; // Swarm 20 cá thể
const ANT_SCALE = 1000;
const WALK_SPEED = 8.0;
const RUN_SPEED = 20.0;
const BOUNDS = 85;
const WANDER_CHANGE_MIN = 2.0;
const WANDER_CHANGE_MAX = 4.0;
const NEST_POS = new THREE.Vector3(-70, 0, -70);
const GRAVEYARD_POS = new THREE.Vector3(80, 0, -80);

/* ─────────────────── ENVIRONMENT ─────────────────── */
const OBSTACLES = [
  { id: 'lake', x: 60, z: 40, r: 18 },
  { id: 'rock1', x: -40, z: -40, r: 8 },
  { id: 'rock2', x: -60, z: 30, r: 6 },
  { id: 'rock3', x: 20, z: -50, r: 10 }
];

const INFO_BULLETIN = {
  patrolling: {
    title: 'Vệ Binh Tuần Tra',
    desc: 'Kiến thợ di chuyển liên tục theo các quỹ đạo ngẫu nhiên để mở rộng vùng săn mồi. Cặp râu quét liên tục để nhận diện hóa chất.',
  },
  recruit: {
    title: 'Trinh Sát & Tuyển Dụng',
    desc: 'Phát hiện mồi, nếm thử và chạy thục mạng về tổ. Liên tục nhả Pheromone dọc đường để rủ rê đồng bọn đi theo. [Đọc thêm](/docs/giai-cap-xa-hoi#41-tuyến-dufour-và-pheromone-đường-mòn)',
  },
  waiting: {
    title: 'Hội Quân & Đánh Giá',
    desc: 'Các thành viên bám theo mùi đang bao vây miếng mồi để chờ gom đủ quân số (đủ sức kéo). [Đọc thêm](/docs/giai-cap-xa-hoi#21-chuỗi-lắp-ráp-sinh-học-tại-hiện-trường)',
  },
  carrying: {
    title: 'Vận Chuyển Hợp Tác',
    desc: 'Ngay khi đủ người, cả đội khóa chặt vào con mồi, điều phối cùng tịnh tiến nhịp nhàng về tọa độ tổ. [Đọc thêm](/docs/giai-cap-xa-hoi#22-bài-toán-kinh-tế-học-vi-mô-của-năng-lượng)',
  },
  alarmed: {
    title: 'Báo Động Khẩn Cấp',
    desc: 'Lao thẳng vào chảo lửa để bảo vệ hệ sinh thái tổ. [Đọc thêm](/docs/noc-doc-va-trieu-chung#1-động-lực-học-cơ-học-của-cú-chích-nọc-biomechanics-of-the-sting)',
  }
};

const BioExplanations = {
  patrolling: {
    title: "Khám Phá Lãnh Thổ (Patrolling)",
    desc: "Kiến di chuyển ngẫu nhiên, vươn râu để thu thập phân tử mùi trong không khí. Phân tích hydrocarbon trên mặt đất.",
    link: "/docs/giai-cap-xa-hoi#3-thuật-toán-khám-phá-không-gian-và-ra-quyết-định-tập-thể"
  },
  communicating: {
    title: "Giao Tiếp Xúc Giác (Antennation)",
    desc: "Hai cá thể dùng râu gõ vào nhau để quét lớp hydrocarbon trên vỏ kitin, giúp nhận diện đồng loại cùng tổ.",
    link: "/docs/giai-cap-xa-hoi#4-mạng-lưới-giao-tiếp-hóa-học-đa-kênh"
  },
  evaluating: {
    title: "Đánh Giá Mồi (Food Assessment)",
    desc: "Kiến trinh sát dùng hàm và râu để đo lường kích thước, độ ngọt và số lượng nhân lực cần thiết để khiêng mồi.",
    link: "/docs/giai-cap-xa-hoi#2-cơ-sinh-học-của-thuyết-carriers-and-cutters-người-vận-chuyển-và-kẻ-cắt-xé"
  },
  recruit_return: {
    title: "Tuyển Dụng (Pheromone Trail)",
    desc: "Kiến chà chóp bụng xuống đất, tiết ra Pheromone tuyển dụng tạo thành vệt mùi dẫn đường từ mồi về tổ.",
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
    desc: "Phát ra tín hiệu nài nỉ (Greeting) đứng chờ tại vị trí mồi. Nếu chờ quá lâu sẽ tự bỏ chạy về tổ để rải thêm mùi tuyển quân.",
    link: "/docs/giai-cap-xa-hoi#21-chuỗi-lắp-ráp-sinh-học-tại-hiện-trường"
  },
  following_trail: {
    title: "Đánh Hơi (Trail Following)",
    desc: "Kiến bám theo gradient mật độ phân tử Pheromone, tự động xoay góc để tìm tuyến đường đậm mùi nhất.",
    link: "/docs/giai-cap-xa-hoi#41-tuyến-dufour-và-pheromone-đường-mòn"
  },
  attacking: {
    title: "Xẻ Thịt Vây Ráp (Swarming)",
    desc: "Khóa chặt mục tiêu sinh học lạ. Kiến thợ cắn xé bằng hàm, trong khi kiến lính dùng nọc độc chích acid formic.",
    link: "/docs/noc-doc-va-trieu-chung#1-động-lực-học-cơ-học-của-cú-chích-nọc-biomechanics-of-the-sting"
  },
  drinking: {
    title: "Bù Khoáng Ngẫu Nhiên",
    desc: "Thi thoảng kiến sẽ tìm nguồn cung cấp H2O và chắt lọc khoáng chất nếu tình cờ bắt gặp sương mai hay vũng nước.",
    link: "/docs/dac-diem-hinh-thai"
  },
  hiding: {
    title: "Tránh Trú Mưa (Sheltering)",
    desc: "Hoảng loạn bỏ mồi, vứt xác, chạy loạn lên khi có hạt nước vỡ trên đầu. Bản năng sinh tồn để không bị chết nham nhở.",
    link: "/docs/vat-ly-ket-be"
  },
  hidden_inside: {
    title: "Lưu Trú Dưới Lòng Đất",
    desc: "Trú ẩn an toàn sâu bên trong thềm đất.",
    link: "/docs/kien-truc-to-ngam"
  },
  carry_corpse: {
    title: "An Táng Đồng Loại (Necrophoresis)",
    desc: "Kiến phát hiện axit oleic tiết ra từ xác chết đồng loại. Vác thi thể đem đến Bãi mút (Graveyard) để tránh lây nhiễm dịch bệnh cho tổ.",
    link: "/docs/mo-hinh-to-chuc"
  },
  dead: {
    title: "Quy Tiên (Dead)",
    desc: "Đã tử trận. Xác phân hủy tiết ra acid oleic đóng vai trò như 'mùi tử thi' thu hút người thu dọn.",
    link: "/docs/mo-hinh-to-chuc"
  }
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
      pos.x += nx * overlap; pos.z += nz * overlap;
      const dot = dirVector.x * nx + dirVector.z * nz;
      if (dot < 0) {
        dirVector.x -= dot * nx; dirVector.z -= dot * nz;
        dirVector.normalize();
      }
    }
  }
  pos.y = 0;
}

function Scenery() {
  const bushes = useMemo(() => [[-30, -50], [50, -30], [30, 60], [-70, 0], [-10, -70]], []);
  const grasses = useMemo(() => Array.from({ length: 50 }).map(() => ({
    x: -80 + Math.random() * 160, z: -80 + Math.random() * 160
  })), []);
  return (
    <group>
      <mesh position={[60, 0.05, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#3498db" roughness={0.1} metalness={0.6} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-40, 3, -40]}><dodecahedronGeometry args={[8]} /><meshStandardMaterial color="#7f8c8d" roughness={0.9} /></mesh>
      <mesh position={[-60, 2, 30]} rotation={[0.4, 0.2, 0]}><dodecahedronGeometry args={[6]} /><meshStandardMaterial color="#95a5a6" roughness={0.8} /></mesh>
      <mesh position={[20, 4, -50]} rotation={[0.1, 0.5, 0.2]}><dodecahedronGeometry args={[10]} /><meshStandardMaterial color="#7f8c8d" roughness={0.9} /></mesh>
      <group position={[0, 4, 30]} rotation={[0, 0, Math.PI / 2]}>
        <mesh><cylinderGeometry args={[5, 5, 20, 16, 1, true]} /><meshStandardMaterial color="#5c4033" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      </group>
      {bushes.map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          <mesh position={[0, 2, 0]}><sphereGeometry args={[3, 7, 7]} /><meshStandardMaterial color="#27ae60" roughness={0.8} /></mesh>
          <mesh position={[2, 1.5, 1]}><sphereGeometry args={[2.5, 7, 7]} /><meshStandardMaterial color="#2ecc71" roughness={0.8} /></mesh>
        </group>
      ))}
      {grasses.map((pos, i) => (
        <mesh key={`grass-${i}`} position={[pos.x, 0.5, pos.z]}><coneGeometry args={[0.5, 2, 4]} /><meshStandardMaterial color="#2ecc71" roughness={0.9} /></mesh>
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
  if (Math.abs(pos.x) > BOUNDS - 5 || Math.abs(pos.z) > BOUNDS - 5) {
    const toCenter = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
    if (dir.dot(toCenter) < 0) { // Chống giật: Chỉ bẻ lái nếu đang thật sự đâm đầu ra ngoài
      dir.copy(toCenter);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 1.2);
      dir.normalize();
    }
  }
}

function Ground({ onClick }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow onClick={onClick}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#388E3C" roughness={1} />
    </mesh>
  );
}

/* ─────────────────── HIỆU ỨNG MƯA THẬT ─────────────────── */
function Rain() {
  const COUNT = 600;
  const meshRef = useRef();
  const drops = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 200,
        y: Math.random() * 80 + 20,
        z: (Math.random() - 0.5) * 200,
        speed: 60 + Math.random() * 40,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    for (let i = 0; i < COUNT; i++) {
      const d = drops[i];
      d.y -= d.speed * delta;
      if (d.y < 0) {
        d.y = 80 + Math.random() * 20;
        d.x = (Math.random() - 0.5) * 200;
        d.z = (Math.random() - 0.5) * 200;
      }
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <capsuleGeometry args={[0.04, 0.6, 2, 4]} />
      <meshBasicMaterial color="#a0c4ff" transparent opacity={0.5} />
    </instancedMesh>
  );
}

function NestMarker() {
  return (
    <group position={[NEST_POS.x, 0, NEST_POS.z]}>
      <Cylinder args={[3, 5, 1.5, 12]} position={[0, 0.75, 0]}><meshStandardMaterial color="#8B4513" roughness={0.9} /></Cylinder>
      <Cylinder args={[1.5, 3, 0.5, 12]} position={[0, 1.75, 0]}><meshStandardMaterial color="#A0522D" roughness={0.8} /></Cylinder>
      <Cylinder args={[0.8, 0.8, 0.3, 8]} position={[0, 2.1, 0]}><meshBasicMaterial color="#1a1a1a" /></Cylinder>
      <Html position={[0, 5, 0]} center>
        <div style={{ color: '#D2691E', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap', textShadow: '0 0 4px black' }}>🏠 Tổ Kiến</div>
      </Html>
    </group>
  );
}

function GraveyardMarker() {
  return (
    <group position={[GRAVEYARD_POS.x, 0, GRAVEYARD_POS.z]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#4a3623" roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, -4]}>
        <boxGeometry args={[4, 3, 1]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
      </mesh>
      <Html position={[0, 4.5, 0]} center>
        <div style={{ color: '#d1d8e0', fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap', textShadow: '0 0 3px black', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>🪦 Bãi Tha Ma</div>
      </Html>
    </group>
  );
}

/* ─────────────────── ANT AGENT WRAPPER ─────────────────── */
const AntAgent = React.memo(function AntAgent({ id, dataRef, modelUrl, groupRef, onAntClick }) {
  const [anim, setAnim] = useState('Insect|walk_1');
  const [bioState, setBioState] = useState('WANDERING');
  const targetDirRef = useRef(new THREE.Vector3(1, 0, 0));
  const innerGroupRef = useRef();

  useFrame(() => {
    const d = dataRef.current[id];
    if (!d || !innerGroupRef.current) return;
    if (d.anim !== anim) setAnim(d.anim);
    if (d.bioState !== bioState) setBioState(d.bioState);
    if (!targetDirRef.current.equals(d.targetDir)) targetDirRef.current.copy(d.targetDir);

    // Áp dụng Visual State lên innerGroup để không bị Engine Simulation bên ngoài đè toạ độ gốc
    if (d.state === 'dead') {
      innerGroupRef.current.rotation.z = Math.PI;
      innerGroupRef.current.position.y = 2.5;
      innerGroupRef.current.visible = true;
    } else if (d.state === 'hidden_inside') {
      innerGroupRef.current.visible = false;
    } else {
      innerGroupRef.current.rotation.z = 0;
      innerGroupRef.current.position.y = 0;
      innerGroupRef.current.visible = true;
    }
  });

  const scale = dataRef.current[id]?.type === 'major' ? ANT_SCALE * 1.4 : ANT_SCALE;

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onAntClick?.(id); }}>
      <group ref={innerGroupRef}>
        <AntModel url={modelUrl} animationName={anim} bioState={bioState} scaleFactor={scale} targetDirRef={targetDirRef} />
      </group>
    </group>
  );
});

/* ─────────────────── FOOD AGENT WRAPPER ─────────────────── */
function FoodAgent({ id, dataRef }) {
  const meshRef = useRef();
  const reqAntsLabel = useRef(0);

  useFrame(() => {
    const d = dataRef.current.find(f => f.id === id);
    if (d && meshRef.current) {
      meshRef.current.position.set(d.x, 0.75, d.z);
      reqAntsLabel.current = d.reqAnts;
    }
  });

  return (
    <group ref={meshRef}>
      <Box args={[1.5, 1.5, 1.5]}><meshStandardMaterial color="#F5DEB3" /></Box>
      <Sparkles count={15} scale={6} size={4} speed={0.2} color="#FFD700" />
    </group>
  );
}

/* ─────────────────── ENEMY AGENT WRAPPER (NHỆN ĐỘC) ─────────────────── */
function EnemyAgent({ id, dataRef }) {
  const meshRef = useRef();
  const textRef = useRef();

  useFrame((_, delta) => {
    const e = dataRef.current.find(x => x.id === id);
    if (e && meshRef.current && !e.killed) {
      const breathe = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
      meshRef.current.scale.set(breathe, breathe, breathe);
      if (textRef.current) {
        const currentHp = Math.max(0, Math.ceil(e.hp));
        textRef.current.innerText = `🕷️ Nhện Độc (${currentHp} HP)`;
        textRef.current.style.opacity = currentHp > 0 ? 1 : 0;
      }
    }
  });

  const ePos = dataRef.current.find(x => x.id === id)?.pos;
  if (!ePos) return null;

  // 8 chân nhện: tính tay tọa độ để đảm bảo hướng đúng
  const legData = [];
  for (let i = 0; i < 4; i++) {
    const zOff = (i - 1.5) * 1.2;
    const fwd = (i - 1.5) * 0.2;
    for (const s of [-1, 1]) {
      legData.push({ zOff, s, fwd, k: `${s}_${i}` });
    }
  }

  return (
    <group position={ePos}>
      <group ref={meshRef}>
        {/* Đầu ngực (Cephalothorax) */}
        <mesh position={[0, 2.0, 1.5]}>
          <sphereGeometry args={[1.0, 10, 8]} />
          <meshStandardMaterial color="#4a2510" roughness={0.7} />
        </mesh>
        {/* Bụng (Abdomen) */}
        <mesh position={[0, 2.2, -1.2]}>
          <sphereGeometry args={[1.6, 10, 8]} />
          <meshStandardMaterial color="#1a0800" roughness={0.6} />
        </mesh>
        {/* Eo nối */}
        <mesh position={[0, 1.9, 0.2]}>
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshStandardMaterial color="#2a1205" roughness={0.8} />
        </mesh>
        {/* Hoa văn đỏ trên bụng */}
        <mesh position={[0, 3.2, -1.5]}>
          <sphereGeometry args={[0.6, 6, 6]} />
          <meshStandardMaterial color="#8B0000" emissive="#330000" roughness={0.5} />
        </mesh>
        {/* Mắt */}
        <mesh position={[0.3, 2.4, 2.2]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[-0.3, 2.4, 2.2]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        {/* Kẹp hàm */}
        <mesh position={[0.25, 1.6, 2.4]} rotation={[0.8, 0.15, 0]}>
          <coneGeometry args={[0.08, 0.7, 4]} />
          <meshStandardMaterial color="#0a0500" />
        </mesh>
        <mesh position={[-0.25, 1.6, 2.4]} rotation={[0.8, -0.15, 0]}>
          <coneGeometry args={[0.08, 0.7, 4]} />
          <meshStandardMaterial color="#0a0500" />
        </mesh>
        {/* 8 chân nhện */}
        {legData.map(({ zOff, s, fwd, k }) => (
          <group key={k} position={[0, 0, zOff]}>
            <mesh position={[s * 1.5, 2.5, fwd * 2]} rotation={[fwd, 0, s * 0.8]}>
              <cylinderGeometry args={[0.07, 0.05, 2.8, 4]} />
              <meshStandardMaterial color="#2c1810" roughness={0.8} />
            </mesh>
            <mesh position={[s * 3.2, 1.0, fwd * 3]} rotation={[fwd * 0.5, 0, s * -0.3]}>
              <cylinderGeometry args={[0.05, 0.02, 2.5, 4]} />
              <meshStandardMaterial color="#1a0f08" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
      <Html position={[0, 5.5, 0]} center>
        <div ref={textRef} className="bg-red-950 border border-red-500 rounded px-2 py-1 text-[11px] text-red-100 font-bold whitespace-nowrap shadow-red-900 shadow-lg pointer-events-none transition-opacity">
          🕷️ Nhện Độc (100 HP)
        </div>
      </Html>
      <Sparkles count={30} scale={5} size={4} speed={0.3} color="#FF4500" />
    </group>
  );
}


/* ─────────────────── MÔ PHỎNG VẬT LÝ & FSM LÕI ─────────────────── */
function Simulation({ modelUrl, enemyList, foodList, clickMode, isRaining, antCount, onConsumeFood, onFoodDelivered, onStatsChange, onEnemyKilled, enemyDataRef, selectedAntId, isTracking, onSelectAnt, onFocusDataChange, controlsRef }) {
  const groupRefs = useRef([]);
  const pheromonesRef = useRef([]); // { pos, strength, toFoodDir, foodId }
  const [forceRender, setForceRender] = useState(0);

  const handleAntClick = (id) => {
    if (clickMode === 'water') {
      const ant = antsDataRef.current[id];
      if (!ant?.state.includes('carry') && ant?.state !== 'dead') {
        ant.state = 'drinking';
        ant.bioState = 'WANDERING';
        ant.anim = 'Insect|walk_1';
        ant.timer = undefined;
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!antsDataRef.current || !onStatsChange) return;
      const newStats = { patrolling: 0, communicating: 0, recruit: 0, waiting: 0, carrying: 0, alarmed: 0, dead: 0, guard: 0, major: 0, minor: 0 };
      antsDataRef.current.forEach(ant => {
        if (ant.role === 'guard' && ant.state !== 'dead') newStats.guard++;
        if (ant.type === 'major' && ant.state !== 'dead') newStats.major++;
        if (ant.type === 'minor' && ant.state !== 'dead') newStats.minor++;

        if (ant.state === 'patrolling' || ant.state === 'following_trail' || ant.state === 'emerging') newStats.patrolling++;
        else if (ant.state === 'recruit_return') newStats.recruit++;
        else if (ant.state === 'waiting_to_carry') newStats.waiting++;
        else if (ant.state === 'carrying' || ant.state === 'carry_corpse') newStats.carrying++;
        else if (ant.state === 'alarmed' || ant.state === 'attacking') newStats.alarmed++;
        else if (ant.state === 'dead') newStats.dead++;
      });
      onStatsChange(prev => ({ ...prev, ...newStats }));

      if (selectedAntId !== null && onFocusDataChange) {
        const fo = antsDataRef.current.find(a => a.id === selectedAntId);
        if (fo) onFocusDataChange({ state: fo.state, bioState: fo.bioState, id: fo.id, type: fo.type, role: fo.role });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [onStatsChange, selectedAntId, onFocusDataChange]);

  const antsDataRef = useRef([]);
  // Tiến hoá quân số
  if (antsDataRef.current.length < antCount) {
    const diff = antCount - antsDataRef.current.length;
    for (let i = 0; i < diff; i++) {
      const id = antsDataRef.current.length;
      groupRefs.current.push(React.createRef()); // Tự động extend Reference Array
      const angle = (Math.PI * 2 / 20) * id;
      const isMajor = Math.random() < 0.15; // 15% xác suất nảy Kiến Tướng
      antsDataRef.current.push({
        id: id,
        position: new THREE.Vector3(NEST_POS.x, 0, NEST_POS.z), // Spawn ngay tâm lỗ hang
        targetDir: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
        wanderDir: randomWanderDir(),
        timer: 1.5 + Math.random() * 1.0, // Thời gian bò ra khỏi hang (1.5-2.5s)
        pheroTimer: 0,
        state: 'emerging', // Trạng thái chui ra từ hang
        bioState: 'WANDERING',
        anim: 'Insect|walk_1',
        priority: isMajor ? 2 : 0,
        targetFoodId: null,
        type: isMajor ? 'major' : 'minor',
        role: id % 4 === 0 ? 'guard' : 'worker', // 25% quân số là lính gác, tự động bù đắp nếu thế hệ trước tử trận
        hp: isMajor ? 40 : 15,
        maxHp: isMajor ? 40 : 15,
      });
    }
  }

  const foodDataRef = useRef([]);

  // Đồng bộ hoá Danh sách rơi kẹo giao diện vào Engine
  useEffect(() => {
    foodList.forEach(f => {
      if (!foodDataRef.current.find(ref => ref.id === f.id)) {
        foodDataRef.current.push({
          id: f.id,
          x: f.x, z: f.z,
          reqAnts: f.reqAnts, // Độ nặng do UI quy định
          waiters: [], // id kiến đang ôm mồi
          hasScout: false,
          isCarried: false,
          delivered: false
        });
      }
    });
  }, [foodList]);


  // Thống kê UI (Chạy tách biệt mỗi 1 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = { patrolling: 0, communicating: 0, recruit: 0, waiting: 0, carrying: 0, alarmed: 0, major: 0, minor: 0, dead: 0 };
      antsDataRef.current.forEach(ant => {
        if (ant.state === 'dead') {
          stats.dead++;
        } else if (ant.state === 'carry_corpse') {
          stats.patrolling++;
        } else if (ant.state === 'carrying') stats.carrying++;
        else if (ant.state === 'waiting_to_carry') stats.waiting++;
        else if (ant.state === 'evaluating' || ant.state === 'recruit_return' || ant.state === 'following_trail') stats.recruit++;
        else if (ant.state === 'communicating') stats.communicating++;
        else if (ant.state === 'alarmed' || ant.state === 'attacking') stats.alarmed++;
        else stats.patrolling++;

        if (ant.type === 'major') stats.major++;
        else stats.minor++;
      });
      if (onStatsChange) onStatsChange(stats);
    }, 1000);
    return () => clearInterval(interval);
  }, [onStatsChange]);

  const doWander = useCallback((ant, delta) => {
    ant.timer -= delta;
    if (ant.timer <= 0) {
      // Chu kì rảnh rỗi: Xác suất 2.5% kiến sẽ tự khát nước (chỉ worker)
      if (ant.state === 'patrolling' && ant.role !== 'guard' && Math.random() < 0.025) {
        ant.state = 'drinking';
        ant.timer = undefined;
        return;
      }
      ant.wanderDir = randomWanderDir();
      ant.timer = randomWanderTime();
    }

    // Lính gác: Nếu đi quá xa tổ (>20m) thì bẻ lái về
    if (ant.role === 'guard') {
      const distToNestSq = ant.position.distanceToSquared(NEST_POS);
      if (distToNestSq > 400.0) { // 20m
        const toNest = new THREE.Vector3().subVectors(NEST_POS, ant.position).setY(0).normalize();
        ant.wanderDir.lerp(toNest, 0.3).normalize();
      }
    }

    reflectIfOOB(ant.position, ant.wanderDir);
    ant.position.addScaledVector(ant.wanderDir, WALK_SPEED * delta);
    resolvePhysics(ant.position, ant.wanderDir);
    ant.targetDir.copy(ant.wanderDir);
    ant.anim = 'Insect|walk_1';
    ant.bioState = 'WANDERING';
  }, []);

  useFrame((state, delta) => {
    const ants = antsDataRef.current;

    // 1. Phân huỷ Pheromones (Decay)
    for (let i = pheromonesRef.current.length - 1; i >= 0; i--) {
      pheromonesRef.current[i].strength -= 0.01 * delta; // Tồn tại 100 giây để tránh mất mùi dẫn đường
      if (pheromonesRef.current[i].strength <= 0) pheromonesRef.current.splice(i, 1);
    }

    // 2. Tác động ngoại vi: Báo động cục bộ (Cắn nhện / Nhện cắn lại chết chùm)
    // Mỗi con kiến tự quét radar 60m để phát hiện kẻ thù, thay vì báo động toàn bầy ngay lập tức
    if (!isRaining) {
      const liveEnemies = enemyDataRef.current.filter(e => !e.killed);
      if (liveEnemies.length > 0) {
        ants.forEach(ant => {
          if (ant.state === 'dead' || ant.state === 'emerging' || ant.state === 'hiding' || ant.state === 'hidden_inside') return;
          if (ant.state.includes('carry') || ant.state === 'drinking' || ant.state === 'alarmed' || ant.state === 'attacking') return;
          // Chỉ báo động nếu kẻ thù nằm trong tầm quét 60 đơn vị
          const nearEnemy = liveEnemies.find(e => ant.position.distanceToSquared(e.pos) < 3600.0);
          if (nearEnemy) {
            ant.state = 'alarmed';
            ant.bioState = 'ALARMED';
            ant.anim = 'Insect|walk_1';
          }
        });
      }
    }

    // Tác động ngoại vi: Phản xạ trời mưa (Panic Run) — VỨT HẾT, CHẠY VỀ TỔ
    if (isRaining) {
      ants.forEach(ant => {
        if (ant.state === 'dead') return;
        // Vứt xác đang khiêng
        if (ant.state === 'carry_corpse') {
          const corpse = antsDataRef.current.find(a => a.id === ant.targetCorpseId);
          if (corpse) corpse.beingCarried = false;
          ant.targetCorpseId = null;
        }
        // Vứt mồi đang khiêng — reset food state
        if (ant.state === 'carrying') {
          const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
          if (food) { food.isCarried = false; food.waiters = []; }
        }
        // Tất cả chạy về tổ
        const distSq = ant.position.distanceToSquared(NEST_POS);
        if (distSq > 4.0) {
          const toNest = new THREE.Vector3().subVectors(NEST_POS, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toNest, RUN_SPEED * 1.5 * delta);
          resolvePhysics(ant.position, toNest);
          ant.targetDir.copy(toNest);
          ant.anim = 'Insect|walk_1';
          ant.bioState = 'ALARMED';
          ant.state = 'hiding';
        } else {
          ant.state = 'hidden_inside';
          ant.bioState = 'WANDERING';
        }
      });
    } else {
      ants.forEach(ant => {
        if (ant.state === 'hiding' || ant.state === 'hidden_inside') {
          ant.state = 'patrolling';
          // Tản nhẹ ra miệng hang để tránh nổ va chạm hất văng nhau lúc tạnh mưa
          if (ant.state === 'hidden_inside') {
            ant.position.x += (Math.random() - 0.5) * 8;
            ant.position.z += (Math.random() - 0.5) * 8;
          }
        }
      });
    }

    // 3. Update Vòng lặp các Thực thế Kiến (Trí tuệ nhân tạo FSM)
    ants.forEach(ant => {
      if (ant.state === 'hiding' || ant.state === 'hidden_inside' || ant.state === 'dead') return; // Không can thiệp nếu chết hoặc đang trốn mưa

      // ----------- EMERGING (Chui ra từ lỗ hang) -----------
      if (ant.state === 'emerging') {
        const outDir = ant.targetDir.clone();
        ant.position.addScaledVector(outDir, WALK_SPEED * 0.6 * delta);
        ant.anim = 'Insect|walk_1';
        ant.timer -= delta;
        if (ant.timer <= 0 || ant.position.distanceToSquared(NEST_POS) > 100.0) {
          ant.state = 'patrolling';
          ant.timer = randomWanderTime();
        }
        return;
      }

      // ----------- BÁO ĐỘNG & TẤN CÔNG -----------
      if (ant.state === 'alarmed' || ant.state === 'attacking') {
        const targetEnemy = enemyDataRef.current.find(e => !e.killed);
        if (targetEnemy) {
          const distSq = ant.position.distanceToSquared(targetEnemy.pos);
          if (distSq > 9.0) { // Lao vào
            ant.state = 'alarmed';
            const toEnemy = new THREE.Vector3().subVectors(targetEnemy.pos, ant.position).setY(0).normalize();
            ant.position.addScaledVector(toEnemy, RUN_SPEED * 1.5 * delta);
            resolvePhysics(ant.position, toEnemy);
            ant.targetDir.copy(toEnemy);
            ant.anim = 'Insect|walk_1';
          } else { // Cắn xé & Bị cắn
            ant.state = 'attacking';
            ant.anim = 'Insect|idle_A2';
            ant.targetDir.subVectors(targetEnemy.pos, ant.position).setY(0).normalize();

            const myDmg = ant.type === 'major' ? 12.0 : 4.0;
            targetEnemy.hp -= myDmg * delta;
            if (targetEnemy.hp <= 0) targetEnemy.killed = true;

            // Trúng AoE độc từ Nhện
            ant.hp -= 2.0 * delta;
            if (ant.hp <= 0) {
              ant.state = 'dead';
              ant.anim = 'Insect|idle_A3';
              ant.bioState = 'DEAD';
              if (ant.priority > 0) ant.priority = 0;
            }
          }
          ant.bioState = ant.state === 'dead' ? 'DEAD' : 'ALARMED';
        } else { // Quét dọn nếu nhện chết
          ant.state = 'patrolling';
          ant.bioState = 'WANDERING';
        }
      }

      // ----------- PATROLLING & NECROPHORESIS & TRAIL FOLLOWING -----------
      else if (ant.state === 'patrolling' || ant.state === 'following_trail') {
        if (ant.commCooldown > 0) ant.commCooldown -= delta;

        let foundFood = false; let foodToApproach = null; let foundCorpse = false;

        // Quét tìm xác đồng đội (Necrophoresis) - Bỏ qua xác đã nằm gọn trong Nghĩa địa (bán kính 20m)
        if (ant.state === 'patrolling') {
          for (const other of antsDataRef.current) {
            if (other.id !== ant.id && other.state === 'dead' && !other.beingCarried && other.position.distanceToSquared(GRAVEYARD_POS) > 400.0) {
              const dSq = ant.position.distanceToSquared(other.position);
              if (dSq < 16.0) { // Chạm xác
                ant.state = 'carry_corpse';
                ant.targetCorpseId = other.id;
                other.beingCarried = true;
                foundCorpse = true;
                break;
              } else if (dSq < 225.0) { // Thấy xác quanh quẩn < 15m
                const toCorpse = new THREE.Vector3().subVectors(other.position, ant.position).setY(0).normalize();
                ant.position.addScaledVector(toCorpse, RUN_SPEED * delta);
                resolvePhysics(ant.position, toCorpse);
                ant.targetDir.copy(toCorpse);
                foundCorpse = true;
                break;
              }
            }
          }
        }

        // Tự động tìm mồi (Lính gác chỉ xét những cục mồi nằm trong vùng bảo vệ 20m)
        if (!foundCorpse) {
          for (const f of foodDataRef.current) {
            if (!f.isCarried) {
              const fPos = new THREE.Vector3(f.x, 0, f.z);

              // Lính gác phớt lờ các cục mồi nằm ngoài bán kính 20m (400) quanh miệng hố
              if (ant.role === 'guard' && fPos.distanceToSquared(NEST_POS) > 400.0) {
                continue;
              }
              const distSq = ant.position.distanceToSquared(fPos);
              if (distSq < 16.0) { // Chạm trúng mồi
                ant.state = 'evaluating';
                ant.targetFoodId = f.id;
                foundFood = true;
                break;
              } else if (distSq < 900.0) { // Đánh hơi thấy mồi trong bán kính 30m
                foodToApproach = fPos;
              }
            }
          }

          if (!foundFood) {
            if (foodToApproach) {
              // Rút ngắn khoảng cách chạy về hướng mồi
              const toFood = new THREE.Vector3().subVectors(foodToApproach, ant.position).setY(0).normalize();
              ant.position.addScaledVector(toFood, RUN_SPEED * delta);
              resolvePhysics(ant.position, toFood);
              ant.targetDir.copy(toFood);
              ant.anim = 'Insect|walk_1';
            } else {
              // Lính gác không rời vị trí để chạy theo đường rải mùi
              if (ant.role === 'guard') {
                if (ant.state === 'following_trail') ant.state = 'patrolling';
                doWander(ant, delta);
              } else {
                // Tra cứu Pheromone - Gộp tất cả mùi gần để tính hướng trung bình có trọng số (khử giật)
                const avgDir = new THREE.Vector3();
                let totalWeight = 0;
                pheromonesRef.current.forEach(p => {
                  const dSq = p.pos.distanceToSquared(ant.position);
                  if (dSq < 625.0 && dSq > 4.0) { // Range nhạy cảm (25 units)
                    // Bỏ giới hạn góc nhìn để tránh hiệu ứng cắt viền (cắt góc) gây giao động mũi tên liên tục
                    const w = p.strength / (1 + dSq * 0.01); // Gần + mạnh = ưu tiên
                    avgDir.addScaledVector(p.toFoodDir, w);
                    totalWeight += w;
                  }
                });

                if (totalWeight > 0.01 && avgDir.lengthSq() > 0.01) {
                  avgDir.normalize();
                  ant.position.addScaledVector(avgDir, RUN_SPEED * 0.8 * delta);
                  resolvePhysics(ant.position, avgDir);
                  // LERP mượt mà theo hướng trung bình
                  ant.targetDir.lerp(avgDir, Math.min(delta * 8, 1.0)).normalize();
                  ant.wanderDir.copy(ant.targetDir);
                  ant.state = 'following_trail';
                  ant.anim = 'Insect|walk_1';
                } else {
                  if (ant.state === 'following_trail') ant.state = 'patrolling'; // Mất dấu hoặc mùi bị nhiễu loạn
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
        const toGrave = new THREE.Vector3().subVectors(GRAVEYARD_POS, ant.position).setY(0).normalize();
        ant.position.addScaledVector(toGrave, WALK_SPEED * 0.8 * delta);
        resolvePhysics(ant.position, toGrave);
        ant.targetDir.copy(toGrave);
        ant.anim = 'Insect|walk_1';

        // Kéo cái xác chạy loẹt xoẹt bám theo đít
        corpse.position.copy(ant.position).addScaledVector(ant.targetDir, -2.5);

        if (ant.position.distanceToSquared(GRAVEYARD_POS) < 36.0) { // Thả ở vạch
          ant.state = 'patrolling';
          corpse.beingCarried = false;
          ant.targetCorpseId = null;
        }
      }

      // ----------- EVALUATING TRINH SÁT -----------
      else if (ant.state === 'evaluating') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        if (!food || food.isCarried) { ant.state = 'patrolling'; return; }

        // Bước nếm mồi 0.5s rồi nhảy việc
        ant.anim = 'Insect|idle_A2'; ant.bioState = 'FOOD_RECRUITMENT';
        ant.targetDir.subVectors(new THREE.Vector3(food.x, 0, food.z), ant.position).normalize();

        if (!food.hasScout) {
          food.hasScout = true;
          ant.state = 'recruit_return'; // Chạy về mách mẹ
        } else {
          if (!food.waiters.includes(ant.id)) {
            food.waiters.push(ant.id);
          }
          ant.state = 'waiting_to_carry'; // Tham gia ôm mồi
          ant.timer = 20.0; // Kiên nhẫn chờ 20 giây, nếu không đủ người sẽ tự chạy về gọi thêm!
        }
      }

      // ----------- RECRUIT RETURN (CHẠY VỀ & NHẢ MÙI) -----------
      else if (ant.state === 'recruit_return') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        // Nhắm hướng tổ chạy thục mạng
        const toNest = new THREE.Vector3().subVectors(NEST_POS, ant.position).setY(0).normalize();
        ant.position.addScaledVector(toNest, RUN_SPEED * delta);
        resolvePhysics(ant.position, toNest); // Giải quyết trượt tường đá
        ant.targetDir.copy(toNest); // Chỉ quay mặt sau khi đã giải quyết vật lý để tránh giật quay vòng
        ant.anim = 'Insect|walk_1';
        ant.bioState = 'WANDERING';

        // Lộ trình Rải mùi: Chỉ rải khi cách tổ ít nhất 15m (tránh nhiễu loạn gần miệng hang)
        ant.pheroTimer -= delta;
        if (ant.pheroTimer <= 0 && food && ant.position.distanceToSquared(NEST_POS) > 225.0) {
          pheromonesRef.current.push({
            pos: ant.position.clone(),
            strength: 1.0,
            toFoodDir: new THREE.Vector3(food.x, 0, food.z).sub(ant.position).normalize(),
            foodId: food.id
          });
          ant.pheroTimer = 0.5; // mỗi nửa giây nhả 1 đốm
        }

        // Chạm tổ, Waggle dance và đi ngược lại
        if (ant.position.distanceToSquared(NEST_POS) < 36.0) {
          ant.state = 'following_trail';
          // Tự quay đầu 180 độ
          ant.targetDir.negate();
        }
      }

      // ----------- WAITING TO CARRY -----------
      else if (ant.state === 'waiting_to_carry') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        if (!food || food.isCarried) return; // Nếu đã bị đứa khác khiêng

        const fPos = new THREE.Vector3(food.x, 0, food.z);
        ant.anim = 'Insect|idle_A2';
        ant.bioState = 'GREETING'; // Vuốt râu làm thân chờ anh em tới
        ant.targetDir.subVectors(fPos, ant.position).normalize();

        // Đợi vòng lặp lưới thức ăn nhấc lên thành 'carrying'

        // Cơ chế Kiên Nhẫn Gọi Thêm (Patience Mechanic)
        ant.timer -= delta;
        if (ant.timer <= 0) {
          // Chờ quá lâu trong vô vọng -> Đích thân chạy về tổ để rải thêm mùi gọi cầu viện!
          ant.state = 'recruit_return';
          // Rút tên khỏi danh sách chờ
          const idx = food.waiters.indexOf(ant.id);
          if (idx > -1) food.waiters.splice(idx, 1);
        }
      }

      else if (ant.state === 'drinking') {
        const lakePos = new THREE.Vector3(60, 0, 40);
        const distSq = ant.position.distanceToSquared(lakePos);
        if (distSq > 441.0) { // Cách tâm hồ 21m (để tránh thọt vào tường vật lý 20m gây kẹt)
          const toLake = new THREE.Vector3().subVectors(lakePos, ant.position).setY(0).normalize();
          ant.position.addScaledVector(toLake, RUN_SPEED * delta);
          resolvePhysics(ant.position, toLake);
          ant.targetDir.copy(toLake);
          ant.anim = 'Insect|walk_1';
        } else {
          ant.anim = 'Insect|idle_A2'; // Cúi đầu ngoạm nước
          ant.bioState = 'FOOD_RECRUITMENT'; // Tương tự liếm nước
          ant.targetDir.subVectors(lakePos, ant.position).setY(0).normalize();

          if (ant.timer === undefined || ant.timer > 15.0) ant.timer = 10.0; // Uống 10 giây đúng yêu cầu
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
          ant.commCooldown = 3.0; // Cooldown 3 giây không chạm râu lại
        }
      }
    });

    // 4. Update Lưới Thức Ăn (Vận Chuyển Hợp Tác)
    foodDataRef.current.forEach(f => {
      // Kiểm tra quân số đã hội tụ đủ yêu cầu chưa
      if (f.waiters.length >= f.reqAnts && !f.isCarried) {
        f.isCarried = true;
        f.waiters.forEach(id => {
          ants[id].state = 'carrying';
          ants[id].priority = 1;
        });
      }

      // Hành vi tịnh tiến tập thể
      if (f.isCarried) {
        const center = new THREE.Vector3(f.x, 0, f.z);
        const toNest = new THREE.Vector3().subVectors(NEST_POS, center).setY(0).normalize();
        center.addScaledVector(toNest, WALK_SPEED * 0.7 * delta);
        resolvePhysics(center, toNest);

        f.x = center.x; f.z = center.z;

        // Keo sơn gắn bó các con kiến theo vệ tinh đồ ăn
        f.waiters.forEach((id, idx) => {
          const angle = (Math.PI * 2 / f.waiters.length) * idx; // Đứng vòng tròn
          const offsetX = Math.cos(angle) * 1.5;
          const offsetZ = Math.sin(angle) * 1.5;
          ants[id].position.set(center.x + offsetX, 0, center.z + offsetZ);
          if (idx === 0) ants[id].targetDir.copy(toNest).negate(); // 1 con đầu bò đi lùi kéo
          else ants[id].targetDir.copy(toNest); // Đám còn lại đi tới đẩy mông
          ants[id].anim = 'Insect|walk_1';
          ants[id].bioState = 'WANDERING';
        });

        // Arrive Nest
        if (center.distanceToSquared(NEST_POS) < 36.0) {
          f.delivered = true;
          f.waiters.forEach(id => {
            ants[id].state = 'patrolling';
            ants[id].priority = 0;
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
        onFoodDelivered();
      });
    }

    const killedEnemies = enemyDataRef.current.filter(e => e.killed);
    if (killedEnemies.length > 0) {
      enemyDataRef.current = enemyDataRef.current.filter(e => !e.killed);
      killedEnemies.forEach(e => onEnemyKilled?.(e.id));
    }

    // 6. Xung Đột & Nhường Đường (Steering Dynamics)
    for (let i = 0; i < ants.length - 1; i++) {
      for (let j = i + 1; j < ants.length; j++) {
        const a1 = ants[i], a2 = ants[j];
        if (a1.state === 'hidden_inside' || a2.state === 'hidden_inside' || a1.state === 'hiding' || a2.state === 'hiding') continue;
        if (a1.position.distanceToSquared(a2.position) < 16.0) {
          // Chạm râu giao tiếp dọc đường ngẫu nhiên
          if (a1.state === 'patrolling' && a2.state === 'patrolling' && !(a1.commCooldown > 0) && !(a2.commCooldown > 0)) {
            a1.state = 'communicating'; a2.state = 'communicating';
            a1.bioState = 'GREETING'; a2.bioState = 'GREETING';
            a1.anim = 'Insect|idle_A2'; a2.anim = 'Insect|idle_A3';
            a1.timer = 0.5; a2.timer = 0.5; // Giao tiếp nhanh 0.5s
            const dir1 = new THREE.Vector3().subVectors(a2.position, a1.position).setY(0);
            if (dir1.lengthSq() < 0.001) dir1.set(1, 0, 0);
            a1.targetDir.copy(dir1).normalize();

            const dir2 = new THREE.Vector3().subVectors(a1.position, a2.position).setY(0);
            if (dir2.lengthSq() < 0.001) dir2.set(-1, 0, 0);
            a2.targetDir.copy(dir2).normalize();
          }
          // Tránh lề cho hội đang khiêng rinh 
          else if (Math.abs(a1.priority - a2.priority) === 1) {
            const pHigh = a1.priority === 1 ? a1 : a2;
            const pLow = a1.priority === 1 ? a2 : a1;
            const pushDir = new THREE.Vector3().subVectors(pLow.position, pHigh.position).setY(0);
            if (pushDir.lengthSq() < 0.001) pushDir.set(Math.random() - 0.5, 0, Math.random() - 0.5);
            pushDir.normalize();
            pLow.position.addScaledVector(pushDir, RUN_SPEED * 1.5 * delta);
          }

          // Lực bật mềm vĩnh viễn chống dính nhân bản (Ngoại trừ nhóm đang khiêng bị ép khung 1.5m)
          if (a1.state !== 'carrying' && a2.state !== 'carrying' && a1.position.distanceToSquared(a2.position) < 4.0) {
            const push = new THREE.Vector3().subVectors(a1.position, a2.position).setY(0);
            if (push.lengthSq() < 0.001) push.set(Math.random() - 0.5, 0, Math.random() - 0.5);
            push.normalize();
            a1.position.addScaledVector(push, WALK_SPEED * 0.5 * delta);
            a2.position.addScaledVector(push, -WALK_SPEED * 0.5 * delta);
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

    // Auto-Tracking Camera
    if (isTracking && selectedAntId !== null && typeof controlsRef !== 'undefined' && controlsRef.current) {
      const targetAnt = ants.find(a => a.id === selectedAntId);
      if (targetAnt) {
        controlsRef.current.target.lerp(targetAnt.position, 0.05);
      }
    }
  });

  return (
    <group>
      {antsDataRef.current.map((ant, idx) => (
        <AntAgent
          key={ant.id}
          id={ant.id}
          dataRef={antsDataRef}
          modelUrl={modelUrl}
          groupRef={groupRefs.current[idx]}
          onAntClick={(id) => {
            if (clickMode === 'water') handleAntClick(id);
            else if (onSelectAnt) onSelectAnt(id);
          }}
        />
      ))}

      {/* Vòng Sáng Highlight Focus Mode */}
      {selectedAntId !== null && antsDataRef.current.find(a => a.id === selectedAntId) && (
        <mesh position={[antsDataRef.current.find(a => a.id === selectedAntId).position.x, 0.2, antsDataRef.current.find(a => a.id === selectedAntId).position.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 3.2, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Visualizer Đường Pheromone Xanh */}
      {pheromonesRef.current.map((p, i) => (
        <mesh key={i} position={[p.pos.x, 0.1, p.pos.z]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial color="#32CD32" transparent opacity={Math.min(1, p.strength) * 0.8} />
        </mesh>
      ))}

      <NestMarker />
      <GraveyardMarker />
      <Scenery />

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
  const bgUrl = useBaseUrl('/models/fire_ant/background.jpeg');

  const [clickMode, setClickMode] = useState('move');
  const [isRaining, setIsRaining] = useState(false);
  const [enemyList, setEnemyList] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [deliveryCount, setDeliveryCount] = useState(0);

  const antCount = 20 + Math.floor(deliveryCount / 3); // Lên cấp
  const foodRemaining = deliveryCount % 3; // Lượng dư sau khi sinh kiến
  const antsBorn = Math.floor(deliveryCount / 3); // Số kiến đã sinh

  const [stats, setStats] = useState({ patrolling: antCount, communicating: 0, recruit: 0, waiting: 0, carrying: 0, alarmed: 0, major: 0, minor: 20, dead: 0 });
  const [selectedAntId, setSelectedAntId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [focusAntData, setFocusAntData] = useState(null);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);
  const [isFocusExpanded, setIsFocusExpanded] = useState(true);
  const controlsRef = useRef(null);

  const handleSelectAnt = useCallback((id) => {
    setSelectedAntId(id);
    setIsTracking(false); // Reset tracking by default
    setFocusAntData(null);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsDashboardExpanded(false);
    }
  }, []);



  const onConsumeFood = useCallback((id) => setFoodList(prev => prev.filter(f => f.id !== id)), []);
  const onEnemyKilled = useCallback((id) => setEnemyList(prev => prev.filter(e => e.id !== id)), []);
  const onFoodDelivered = useCallback(() => setDeliveryCount(c => c + 1), []);
  const enemyDataRef = useRef([]);

  let dominantState = 'patrolling';
  if (stats.alarmed > 0) dominantState = 'alarmed';
  else if (stats.carrying > 0) dominantState = 'carrying';
  else if (stats.waiting > 0) dominantState = 'waiting';
  else if (stats.recruit > 0) dominantState = 'recruit';

  const handleClick = (e) => {
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
          if (dist > 0 && dist < obs.r + 3.0) {
            const lap = (obs.r + 3.0) - dist;
            fx += (dx / dist) * lap; fz += (dz / dist) * lap;
          }
        }
        // Thêm FoodEntity: Khối lượng yêu cầu luôn là 3 hoặc 4 để đội hình chờ đông đảo
        const weight = Math.floor(Math.random() * 2) + 3; // 3 hoặc 4
        setFoodList(prev => [...prev, { id: Date.now() + Math.random(), x: fx, z: fz, reqAnts: weight }]);
      }
    }
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] relative text-sm overflow-hidden bg-neutral-900">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:top-5 md:bottom-auto md:left-5 md:-translate-x-0 z-[100] bg-white/95 dark:bg-neutral-900/90 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shadow-2xl w-[92%] sm:w-[320px] max-w-full">
        <div className="flex justify-between items-center mb-3 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          <h4 className="m-0 text-base text-neutral-800 dark:text-white">🔬 Điều Khiển Sinh Học</h4>
          <Link to="/docs/huong-dan-mo-phong" className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] no-underline transition-colors" title="Hướng dẫn sử dụng">
            i
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button onClick={() => setClickMode('move')} className={`border-none outline-none ring-0 py-2 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'move' ? 'bg-blue-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🤚 Kéo Cam</button>
          <button onClick={() => setClickMode('rotate')} className={`border-none outline-none ring-0 py-2 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'rotate' ? 'bg-blue-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🔄 Xoay</button>
          <button onClick={() => setClickMode('food')} className={`border-none outline-none ring-0 py-2 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'food' ? 'bg-green-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🍬 Thả Đường</button>
          <button onClick={() => setClickMode('alarm')} className={`border-none outline-none ring-0 py-2 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'alarm' ? 'bg-red-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>⚠️ Báo Động</button>
          <button onClick={() => setClickMode('water')} className={`border-none outline-none ring-0 py-2 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${clickMode === 'water' ? 'bg-cyan-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>💧 Uống Nước</button>
          <button onClick={() => setIsRaining(!isRaining)} className={`border-none outline-none ring-0 py-2 px-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${isRaining ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-cyan-200' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'}`}>🌧️ {isRaining ? 'Tạnh Mưa' : 'Đổ Mưa'}</button>
        </div>
        {deliveryCount > 0 && <div className="mt-3 text-xs text-green-600 dark:text-green-400 border-t border-neutral-200 dark:border-neutral-700 pt-2 font-medium">
          🏠 Lương thực dự trữ: {foodRemaining}/3 khối {antsBorn > 0 && <span className="text-amber-600 dark:text-amber-400 ml-1">(🐣 đã sinh {antsBorn} kiến)</span>}
        </div>}
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-5 md:right-5 md:left-auto md:-translate-x-0 z-[100] w-[92%] sm:w-[280px]">
        {selectedAntId === null ? (
          // SWARM DASHBOARD
          <div className="bg-white/95 dark:bg-neutral-900/95 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xl">
            <h4 
              className="m-0 text-orange-600 dark:text-orange-400 flex justify-between items-center text-sm font-bold cursor-pointer"
              onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                {INFO_BULLETIN[dominantState]?.title || 'Hoạt Động Bầy Đàn'}
              </div>
              <span className="text-neutral-400 dark:text-neutral-500 opacity-60 text-xs ml-2">{isDashboardExpanded ? '▲' : '▼'}</span>
            </h4>
            <div className={`transition-all duration-300 overflow-hidden ${isDashboardExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="text-[13px] font-medium list-none pl-0 mt-3 mb-3 space-y-1.5 text-neutral-800 dark:text-neutral-200">
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>👑 Kiến Tướng (Major):</span> <b>{stats.major}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>👷 Kiến Thợ (Minor):</span> <b>{stats.minor}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 pt-2"><span>🔍 Vệ binh tuần tra:</span> <b>{stats.patrolling}/{antCount}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>📡 Nhả mùi Dẫn đường:</span> <b>{stats.recruit}/{antCount}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-purple-700 dark:text-purple-400"><span>⏳ Chờ đội hình:</span> <b>{stats.waiting} kiến</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-green-600 dark:text-green-400"><span>🏋️ Kéo mồi tập thể:</span> <b>{stats.carrying} kiến</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-red-600 dark:text-red-400"><span>⚠️ Chiến binh tự vệ:</span> <b>{stats.alarmed}/{antCount}</b></li>
                <li className="flex justify-between text-neutral-500 dark:text-neutral-400"><span>🪦 Quy Tiên:</span> <b>{stats.dead} kiến</b></li>
              </ul>
              <p className="my-2 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400 italic">
                {INFO_BULLETIN[dominantState]?.desc || ''}
              </p>
            </div>
          </div>
        ) : (
          // FOCUS MODE
          <div className="bg-white/95 dark:bg-neutral-900/95 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 text-neutral-900 dark:text-neutral-100 shadow-xl overflow-hidden focus-panel-anim">
            <div className="flex justify-between items-center mb-2">
              <h4 
                className="m-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 text-sm font-bold cursor-pointer flex-1"
                onClick={() => setIsFocusExpanded(!isFocusExpanded)}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
                Mục Tiêu #{selectedAntId}
                <span className="text-neutral-400 dark:text-neutral-500 opacity-60 text-xs ml-2">{isFocusExpanded ? '▲' : '▼'}</span>
              </h4>
              <button onClick={() => setSelectedAntId(null)} className="border-none bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-red-500 text-lg font-bold p-1 w-8 h-8 flex items-center justify-center transition-colors cursor-pointer ml-2">×</button>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${isFocusExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {focusAntData?.type === 'major' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-[11.5px] p-2 leading-tight rounded mb-3 border border-amber-200 dark:border-amber-800/50">
                  <b className="block mb-0.5">👑 Kiến Tướng (Major Ant):</b> Thể hình to lớn, lực cắn mạnh và mang nọc rát. Đảm nhận phòng thủ và khuân vác các vật thể ngoại cỡ.{' '}
                  <Link to="/docs/giai-cap-xa-hoi#12-giải-phẫu-học-tiến-hóa-ở-kiến-thợ-đại" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Đọc thêm →</Link>
                </div>
              )}
              {focusAntData?.type === 'minor' && (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 text-[11.5px] p-2 leading-tight rounded mb-3 border border-neutral-200 dark:border-neutral-700/50">
                  <b className="block mb-0.5">👷 Kiến Thợ (Minor Ant):</b> Khung xương nhỏ, di chuyển lanh lẹ. Khối lượng công việc chính: thám thính, rải mùi, khuân vác và an táng.{' '}
                  <Link to="/docs/giai-cap-xa-hoi#11-ranh-giới-toán-học-của-giai-cấp" className="text-blue-500 dark:text-blue-400 font-bold hover:underline">Đọc thêm →</Link>
                </div>
              )}

              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded mb-3 border border-blue-100 dark:border-blue-800/50">
                <div className="font-bold text-[13px] text-blue-900 dark:text-blue-300">{focusAntData ? BioExplanations[focusAntData.state]?.title : 'Đang phân tích...'}</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium uppercase mt-1 tracking-wider">Bio. State: {focusAntData?.bioState || 'UKN'}</div>
              </div>

              <p className="my-2 text-[12px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                {focusAntData ? BioExplanations[focusAntData.state]?.desc : ''}
              </p>

              <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => setIsTracking(!isTracking)}
                  className={`border-none outline-none ring-0 w-full py-1.5 px-3 rounded text-xs font-bold transition-colors cursor-pointer ${isTracking ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'}`}
                >
                  {isTracking ? '⏹️ Huỷ Theo Dõi' : '🎥 Theo Dõi Camera'}
                </button>
                <Link to={focusAntData ? BioExplanations[focusAntData.state]?.link : '#'} className="block w-full text-center bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-blue-700 no-underline transition-colors border-none outline-none ring-0">
                  ĐỌC CHI TIẾT TRONG BÁCH KHOA →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Canvas camera={{ position: [0, 60, 80], fov: 50 }} shadows>
        <color attach="background" args={[isRaining ? '#1a2b3c' : '#000000']} />
        <ambientLight intensity={isRaining ? 0.3 : 0.7} />
        {isRaining && <Rain />}
        <directionalLight position={[15, 25, 15]} intensity={isRaining ? 0.8 : 2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <React.Suspense fallback={null}>
          <Simulation
            modelUrl={modelUrl} enemyList={enemyList} foodList={foodList} clickMode={clickMode} isRaining={isRaining} antCount={antCount}
            onConsumeFood={onConsumeFood}
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
          <Ground onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }} />
        </React.Suspense>
        <OrbitControls ref={controlsRef} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2 - 0.05} mouseButtons={{ LEFT: clickMode === 'move' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: clickMode === 'move' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN }} />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={200} blur={2} far={20} />
      </Canvas>
    </div>
  );
}
