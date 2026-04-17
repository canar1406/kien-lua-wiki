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
const WALK_SPEED = 6.0;
const RUN_SPEED = 15.0;
const BOUNDS = 85;
const WANDER_CHANGE_MIN = 2.0;
const WANDER_CHANGE_MAX = 4.0;
const NEST_POS = new THREE.Vector3(-70, 0, -70);
const GRAVEYARD_POS = new THREE.Vector3(80, 0, -80);

/* ─────────────────── SPATIAL SCALING CONSTANTS ─────────────────── */
const SIM_AREA_M2 = 0.1; // Diện tích mảng cỏ 3D đang mô phỏng (0.1 m²)
const REAL_TERRITORY_M2 = 50.0; // Diện tích lãnh thổ trung bình của vương quốc kiến lửa (50 m²)
const SCALE_FACTOR = REAL_TERRITORY_M2 / SIM_AREA_M2; // Tỷ lệ phóng đại = 500

/* ─────────────────── SPATIAL SCALING FUNCTION ─────────────────── */
function calculateRealCapacity(k_sim) {
  return Math.round(k_sim * SCALE_FACTOR);
}

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
  dead_starvation: {
    title: "Chết Đói Khát (Starvation)",
    desc: "Cạn kiệt năng lượng hoặc nước. Xác phân hủy tiết ra acid oleic đóng vai trò như 'mùi tử thi' thu hút người thu dọn.",
    link: "/docs/mo-hinh-to-chuc"
  },
  dead_old_age: {
    title: "Chết Già (Old Age)",
    desc: "Đạt giới hạn tuổi thọ tự nhiên. Cơ chế lão hóa làm các mô và hệ thần kinh thoái hóa dẫn đến tim ngừng đập.",
    link: "/docs/vong-doi-va-tuoi-tho"
  },
  dead_killed: {
    title: "Tử Trận (Killed in Action)",
    desc: "Hi sinh khi chiến đấu bảo vệ hệ sinh thái trước kẻ thù thiên địch hoặc do môi trường khắc nghiệt.",
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

/* ─────────────────── PHEROMONE INSTANCED VISUALIZER ─────────────────── */
const PheroVisualizer = React.memo(({ pheromonesRef }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const items = pheromonesRef.current;
    
    // TỐI ƯU HÓA RENDER: Chỉ cấp phát DrawCalls cho đúng số lượng hạt mùi đang tồn tại
    meshRef.current.count = items.length;
    for (let i = 0; i < items.length; i++) {
        const p = items[i];
        dummy.position.set(p.pos.x, 0.1, p.pos.z);
        dummy.rotation.x = -Math.PI / 2;
        const scale = Math.min(1.5, p.strength * 0.5); // Shrink as it fades
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, 3000]}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial color="#32CD32" transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  );
});

/* ─────────────────── MÔ PHỎNG VẬT LÝ & FSM LÕI ─────────────────── */
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
  const groupRef = useRef();
  const meshRef = useRef();
  const textRef = useRef();

  useFrame((_, delta) => {
    const e = dataRef.current.find(x => x.id === id);
    if (e && !e.killed) {
      if (groupRef.current) {
        groupRef.current.position.copy(e.pos);
        if (e.targetDir) {
          const targetRot = Math.atan2(e.targetDir.x, e.targetDir.z);
          groupRef.current.rotation.y = targetRot;
        }
      }
      if (meshRef.current) {
        const breathe = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
        meshRef.current.scale.set(breathe, breathe, breathe);
      }
      if (textRef.current) {
        const currentHp = Math.max(0, Math.ceil(e.hp));
        textRef.current.innerText = `🕷️ Nhện Độc (${currentHp} HP)`;
        textRef.current.style.opacity = currentHp > 0 ? 1 : 0;
      }
    }
  });

  const eInit = dataRef.current.find(x => x.id === id);
  if (!eInit) return null;

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
    <group ref={groupRef} position={eInit.pos}>
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


const _pushVec = new THREE.Vector3(); // Biến dùng chung để tránh rác GC
const _dirVec = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

function Simulation({ modelUrl, enemyList, foodList, clickMode, isRaining, antCount, waterRate, setFoodList, onConsumeFood, onFoodDelivered, onStatsChange, onEnemyKilled, enemyDataRef, selectedAntId, isTracking, onSelectAnt, onFocusDataChange, controlsRef }) {
  const groupRefs = useRef([]);
  const pheromonesRef = useRef([]); // { pos, strength, toFoodDir, foodId }
  const [forceRender, setForceRender] = useState(0);
  const totalBornRef = useRef(20);
  const deathTollRef = useRef(0);
  const spawnTimerRef = useRef(0);

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
      const newStats = { patrolling: 0, communicating: 0, recruit: 0, waiting: 0, carrying: 0, alarmed: 0, dead: 0, guard: 0, major: 0, minor: 0, deathToll: deathTollRef.current || 0 };
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
        if (fo) onFocusDataChange({ state: fo.state, bioState: fo.bioState, id: fo.id, type: fo.type, role: fo.role, energy: fo.energy, hydration: fo.hydration, age: fo.age, maxAge: fo.maxAge });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [onStatsChange, selectedAntId, onFocusDataChange]);

  const antsDataRef = useRef(Array.from({ length: 20 }).map((_, id) => {
    const isMajor = Math.random() < 0.15;
    const spawnOffset = new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4);
    const angle = Math.random() * Math.PI * 2;
    return {
      id: id,
      position: new THREE.Vector3(NEST_POS.x, 0, NEST_POS.z).add(spawnOffset),
      targetDir: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
      wanderDir: randomWanderDir(),
      timer: 1.5 + Math.random() * 1.0,
      pheroTimer: 0,
      state: 'emerging',
      bioState: 'WANDERING',
      anim: 'Insect|walk_1',
      priority: isMajor ? 2 : 0,
      targetFoodId: null,
      targetCorpseId: null,
      beingCarried: false,
      type: isMajor ? 'major' : 'minor',
      role: id % 4 === 0 ? 'guard' : 'worker',
      hp: isMajor ? 60 : 25,
      maxHp: isMajor ? 60 : 25,
      energy: 100,
      hydration: 100,
      age: 0,
      maxAge: 900 + Math.random() * 600,
    };
  }));

  // Khởi tạo nhóm Refs tương ứng cho 20 kiến Base
  if (groupRefs.current.length === 0) {
    for (let i = 0; i < 20; i++) groupRefs.current.push(React.createRef());
  }

  // NOTE: Logic đẻ kiến đã được di chuyển vào trong useFrame để tránh nghẽn luồng render của React

  const foodDataRef = useRef([]);

  // Đồng bộ hoá Danh sách rơi kẹo giao diện vào Engine
  useEffect(() => {
    foodList.forEach(f => {
      if (!foodDataRef.current.find(ref => ref.id === f.id)) {
        foodDataRef.current.push({
          id: f.id,
          x: f.x, z: f.z,
          reqAnts: f.reqAnts, // Độ nặng do UI quy định
          nutrition: f.nutrition || f.reqAnts, // Điểm nở kiến thực thụ
          waiters: [], // id kiến đang ôm mồi
          hasScout: false,
          isCarried: false,
          delivered: false
        });
      }
    });
  }, [foodList]);


  const doWander = useCallback((ant, delta) => {
    ant.timer -= delta;
    if (ant.timer <= 0) {
      // Sinh lý học: Khi lượng nước trong cơ thể xuống dưới 50, kích hoạt nhu cầu tìm khe nước
      if (ant.state === 'patrolling' && ant.role !== 'guard' && ant.hydration < 50) {
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
        _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
        ant.wanderDir.lerp(_v1, 0.3).normalize();
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

    // Sinh sản Kiến trong useFrame (Tránh làm cháy Web/Giật lag khung hình khi spawn số lượng lớn)
    if (totalBornRef.current < antCount) {
      spawnTimerRef.current -= delta;
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = 0.2; // Độ trễ bớt giật 200ms
        
        const isMajor = Math.random() < 0.15;
        const spawnOffset = new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4);
        const angle = Math.random() * Math.PI * 2;

        if (ants.length < 50) {
          const id = ants.length;
          groupRefs.current.push(React.createRef()); // Tự động extend Reference Array
          ants.push({
            id: id,
            position: new THREE.Vector3(NEST_POS.x, 0, NEST_POS.z).add(spawnOffset),
            targetDir: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
            wanderDir: randomWanderDir(),
            timer: 1.5 + Math.random() * 1.0,
            pheroTimer: 0,
            state: 'emerging',
            bioState: 'WANDERING',
            anim: 'Insect|walk_1',
            priority: isMajor ? 2 : 0,
            targetFoodId: null,
            targetCorpseId: null,
            beingCarried: false,
            type: isMajor ? 'major' : 'minor',
            role: id % 4 === 0 ? 'guard' : 'worker',
            hp: isMajor ? 60 : 25,
            maxHp: isMajor ? 60 : 25,
            energy: 100,
            hydration: 100,
            age: 0,
            maxAge: 900 + Math.random() * 600,
          });
          totalBornRef.current++;
          setForceRender(c => c + 1); // Cập nhật DOM rải đều
        } else {
          // Tính năng nhặt xác tái chế
          const deadIndex = ants.findIndex(a => a.state === 'dead' && !a.beingCarried);
          if (deadIndex !== -1) {
            const rAnt = ants[deadIndex];
            rAnt.position.copy(NEST_POS).add(spawnOffset);
            rAnt.targetDir.set(Math.cos(angle), 0, Math.sin(angle));
            rAnt.timer = 1.5 + Math.random() * 1.0;
            rAnt.state = 'emerging';
            rAnt.bioState = 'WANDERING';
            rAnt.priority = isMajor ? 2 : 0;
            rAnt.type = isMajor ? 'major' : 'minor';
            rAnt.hp = isMajor ? 60 : 25;
            rAnt.maxHp = isMajor ? 60 : 25;
            rAnt.energy = 100;
            rAnt.hydration = 100;
            rAnt.age = 0;
            rAnt.maxAge = 900 + Math.random() * 600;
            totalBornRef.current++; // Đã tái chế xong 1 bé
          }
        }
      }
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
        if (distSq > 4.0) {đ
          const toNest = _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
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
      // ẢNH HƯỞNG SINH HỌC THEO THỜI GIAN (Age, Energy, Hydration)
      if (ant.state !== 'dead') {
        ant.age += delta;
        // Trừ hao tĩnh
        let decayRate = ant.type === 'major' ? 1.5 : 1.0;
        if (ant.state === 'carrying' || ant.state === 'carry_corpse' || ant.state === 'attacking') decayRate *= 2.5; // Hao tốn gấp 2.5 khi vận động mạnh

        // Xử lý Hydration (Sinh học thực tiễn: Khả năng nhịn khát cực tốt)
        if (ant.state !== 'drinking') {
          ant.hydration -= 0.2 * decayRate * delta; // Khoảng 500s đi bộ liên tục mới khát khô (Hơn 8 phút)
        } else {
          ant.hydration += 25.0 * delta; // Uống 4s là đầy
          if (ant.hydration > 100) ant.hydration = 100;
        }

        // Xử lý Năng Lượng (Nhịn đói trâu bò)
        ant.energy -= 0.1 * decayRate * delta; // Khoảng 1000s đi bộ liên tục mới đói lả (Hơn 16 phút)

        // Cơ chế Trophallaxis: Khứ hồi về tổ xin ăn khi cạn kiệt năng lượng
        if (ant.state === 'hidden_inside' || ant.position.distanceToSquared(NEST_POS) < 100.0) {
          ant.energy += 25.0 * delta; // Nhận mồi bơm từ đồng loại (Hồi siêu nhanh 4s là đầy)
          ant.hydration += 15.0 * delta; // Chia sẻ nước bọt 
          if (ant.energy > 100) ant.energy = 100;
          if (ant.hydration > 100) ant.hydration = 100;
          if (ant.energy > 50 && ant.hydration > 50 && (ant.state === 'returning_to_eat' || ant.state === 'drinking')) {
            ant.state = 'patrolling';
          }
        } else if ((ant.energy < 25 || ant.hydration < 25) && ant.state !== 'returning_to_eat' && ant.state !== 'drinking') {
          // BẢN NĂNG SINH TỒN TỐI THƯỢNG: Nếu sắp chết đói/khát (dưới 25%), vứt bỏ toàn bộ công việc để đi cứu lấy mạng sống, nới lỏng an toàn để chạy kịp về nhà
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
        } else if ((ant.energy < 40 || ant.hydration < 40) && ant.state === 'patrolling') {
          // Bụng đói cồn cào rên rỉ, rảnh rỗi mới đi ăn hoặc uống
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
            ant.state = 'dead'; ant.anim = 'Insect|idle_A3'; ant.priority = 0;
            if (ant.hp <= 0) ant.bioState = 'dead_killed';
            else if (ant.age > ant.maxAge) ant.bioState = 'dead_old_age';
            else ant.bioState = 'dead_starvation';
          }
        }
      }

      if (ant.state === 'hiding' || ant.state === 'hidden_inside' || ant.state === 'dead') return; // Bỏ qua cập nhật cho thực thể đã chết hoặc trốn mưa

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
            const toEnemy = _v1.subVectors(targetEnemy.pos, ant.position).setY(0).normalize();
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
              ant.bioState = 'dead_killed';
              if (ant.priority > 0) ant.priority = 0;
            }
          }
          ant.bioState = ant.state === 'dead' ? 'dead_killed' : 'ALARMED';
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
                const toCorpse = _v1.subVectors(other.position, ant.position).setY(0).normalize();
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
              const fPos = _v2.set(f.x, 0, f.z);

              // Lính gác phớt lờ các cục mồi nằm ngoài bán kính 20m (400) quanh miệng hố
              if (ant.role === 'guard' && fPos.distanceToSquared(NEST_POS) > 400.0) {
                continue;
              }
              const distSq = ant.position.distanceToSquared(fPos);
              if (distSq < 16.0) { // Chạm trúng mồi
                ant.state = 'evaluating';
                ant.timer = 0.8; // Khựng lại đánh giá 0.8s để chống giật (jitter) và tránh quá tải CPU
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
              const toFood = _v1.subVectors(foodToApproach, ant.position).setY(0).normalize();
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
                const avgDir = _v3.set(0, 0, 0);
                let totalWeight = 0;
                pheromonesRef.current.forEach(p => {
                  const dSq = p.pos.distanceToSquared(ant.position);
                  if (dSq < 144.0 && dSq > 1.0) { // Range 12 units
                    const toNode = _v1.subVectors(p.pos, ant.position).normalize();
                    
                    // Góc mù bẩm sinh: Tránh ngửi lại mùi nằm ở phía sau đít gây giật lắc con lắc
                    if (toNode.dot(ant.targetDir) > -0.2) {
                      const w = p.strength / (1 + dSq * 0.5); // Càng gần càng hút mạnh

                      // Vector: 70% hướng tiến tới mùi, 30% hướng hút vào cục mùi (để kiến 'nhập làn')
                      const combinedDir = p.toFoodDir.clone().multiplyScalar(0.7).add(toNode.multiplyScalar(0.3)).normalize();

                      avgDir.addScaledVector(combinedDir, w);
                      totalWeight += w;
                    }
                  }
                });

                if (totalWeight > 0.001 && avgDir.lengthSq() > 0.001) {
                  avgDir.normalize();

                  // Góc hiện tại và góc mục tiêu
                  const currentAngle = Math.atan2(ant.targetDir.x, ant.targetDir.z); // Drei's forward is Z? Let's use x, z.
                  const targetAngle = Math.atan2(avgDir.x, avgDir.z);

                  let deltaAngle = targetAngle - currentAngle;
                  while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
                  while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

                  // Giới hạn xoay ~170 độ/s (3 rad/s) để khử rung giật tuyệt đối
                  const maxTurn = delta * 3.0;
                  if (Math.abs(deltaAngle) > maxTurn) {
                    deltaAngle = Math.sign(deltaAngle) * maxTurn;
                  }

                  const newAngle = currentAngle + deltaAngle;
                  ant.targetDir.set(Math.sin(newAngle), 0, Math.cos(newAngle));

                  // MOVEMENT: Dùng targetDir đã xoay mượt để di chuyển
                  ant.position.addScaledVector(ant.targetDir, RUN_SPEED * 0.8 * delta);
                  resolvePhysics(ant.position, ant.targetDir);

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
        _v1.subVectors(GRAVEYARD_POS, ant.position).setY(0).normalize();
        ant.position.addScaledVector(_v1, WALK_SPEED * 0.8 * delta);
        resolvePhysics(ant.position, _v1);
        ant.targetDir.copy(_v1);
        ant.anim = 'Insect|walk_1';

        // Kéo cái xác chạy loẹt xoẹt bám theo đít
        corpse.position.copy(ant.position).addScaledVector(ant.targetDir, -2.5);

        if (ant.position.distanceToSquared(GRAVEYARD_POS) < 36.0) { // Thả ở vạch
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
          ant.position.addScaledVector(_v1, WALK_SPEED * 1.5 * delta); // Chạy gấp gáp về tổ xin ăn
          resolvePhysics(ant.position, _v1);
          ant.targetDir.copy(_v1);
        }
        ant.anim = 'Insect|walk_1';
        ant.bioState = 'HUNGRY';
      }

      // ----------- EVALUATING TRINH SÁT -----------
      else if (ant.state === 'evaluating') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        if (!food || food.isCarried) { ant.state = 'patrolling'; return; }

        // Bước nếm mồi 0.5s rồi nhảy việc
        ant.anim = 'Insect|idle_A2'; ant.bioState = 'FOOD_RECRUITMENT';
        _v1.set(food.x, 0, food.z);
        ant.targetDir.subVectors(_v1, ant.position).normalize();
        ant.timer -= delta;
        if (ant.timer <= 0) {
          if (food.reqAnts === 1) {
            // Mồi nhỏ vừa miệng 1 con -> Liếm nhẹ rồi tự động ngoạm đem về, độc lập tác chiến không cần đợi ai!
            if (!food.waiters.includes(ant.id)) food.waiters.push(ant.id);
            food.hasScout = true;
            ant.state = 'waiting_to_carry'; // Đẩy thẳng vào pha khiêng, vòng lặp Food ở cuối sẽ lặp tức nâng thành 'carrying' do đủ KPI
            return;
          }

          // Đối với mồi to (Yêu cầu > 1 người khiêng)
          if (!food.hasScout) {
            food.hasScout = true;
            ant.state = 'recruit_return'; // Người phát hiện đầu tiên (Scout) -> Chạy về gọi hội
          } else {
            if (!food.waiters.includes(ant.id)) {
              food.waiters.push(ant.id);
            }
            ant.state = 'waiting_to_carry'; // Người đến sau -> Tham gia vào nhóm ôm mồi và chờ đủ team
            ant.timer = 20.0; // Kiên nhẫn chờ 20 giây, nếu không đủ người sẽ tự chạy về gọi thêm!
          }
        }
      } // Kết thúc evaluating

      // ----------- RECRUIT RETURN (CHẠY VỀ & NHẢ MÙI) -----------
      else if (ant.state === 'recruit_return') {
        const food = foodDataRef.current.find(f => f.id === ant.targetFoodId);
        // Nhắm hướng tổ chạy thục mạng
        const toNest = _v1.subVectors(NEST_POS, ant.position).setY(0).normalize();
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
            toFoodDir: _v2.set(food.x, 0, food.z).sub(ant.position).normalize(),
            foodId: food.id
          });
          // Giới hạn cứng (Hard Limit): Chỉ cho phép tối đa 1500 hạt mùi tồn tại cùng lúc trên toàn bản đồ.
          // Nếu vượt quá, xóa hạt cũ nhất. Điều này ngăn chặn O(N*M) Loop Overhead làm treo RAM/CPU trình duyệt.
          if (pheromonesRef.current.length > 1500) {
            pheromonesRef.current.shift();
          }
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
        // Mồi đã bị khiêng hoặc không còn tồn tại → thoát ra ngay, không bị kẹt
        if (!food || food.isCarried) {
          // Nếu mình không nằm trong đội chính thức (carrying), giải phóng về patrolling
          if (ant.state !== 'carrying') {
            ant.state = 'patrolling';
            ant.priority = 0;
            ant.targetFoodId = null;
            ant.timer = randomWanderTime();
          }
          return;
        }

        // Nếu đã đủ người nhưng mình không được chọn (surplus) → thoát
        if (food.waiters.length >= food.reqAnts && !food.waiters.includes(ant.id)) {
          ant.state = 'patrolling';
          ant.priority = 0;
          ant.targetFoodId = null;
          ant.timer = randomWanderTime();
          return;
        }

        const fPos = _v2.set(food.x, 0, food.z);
        ant.anim = 'Insect|idle_A2';
        ant.bioState = 'GREETING'; // Vuốt râu làm thân chờ anh em tới
        ant.targetDir.subVectors(fPos, ant.position).normalize();

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
        const lakePos = _v3.set(60, 0, 40);
        const distSq = ant.position.distanceToSquared(lakePos);
        if (distSq > 441.0) { // Cách tâm hồ 21m (để tránh thọt vào tường vật lý 20m gây kẹt)
          const toLake = _v1.subVectors(lakePos, ant.position).setY(0).normalize();
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

    // CẬP NHẬT FSM KẺ SĂN MỒI (SPIDER FSM)
    enemyDataRef.current.forEach(e => {
      if (e.killed) return;
      let nearestAnt = null;
      let minDistSq = Infinity;
      ants.forEach(ant => {
        if (ant.state === 'dead' || ant.state === 'hidden_inside' || ant.state === 'hiding') return;
        const dSq = e.pos.distanceToSquared(ant.position);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          nearestAnt = ant;
        }
      });

      if (nearestAnt) {
        if (minDistSq > 25.0) { // Khoảng cách > 5 -> Chasing
          const toAnt = _v1.subVectors(nearestAnt.position, e.pos).setY(0).normalize();
          e.pos.addScaledVector(toAnt, RUN_SPEED * 0.5 * delta); // Tốc độ chạy của nhện = 50% chạy nhanh của kiến
          resolvePhysics(e.pos, toAnt);
          e.targetDir = toAnt;
        } else { // Cắn xé kiến
          nearestAnt.hp -= 20.0 * delta; // Sát thương cắn 20 DPS
          if (nearestAnt.hp <= 0 && nearestAnt.state !== 'dead') {
            nearestAnt.state = 'dead'; nearestAnt.anim = 'Insect|idle_A3'; nearestAnt.bioState = 'dead_killed'; nearestAnt.priority = 0;
            deathTollRef.current++; // Ghi vào sổ sinh tử
          }
        }
      }
    });

    // 4. Update Lưới Thức Ăn (Vận Chuyển Hợp Tác)
    foodDataRef.current.forEach(f => {
      // Kiểm tra quân số đã hội tụ đủ yêu cầu chưa
      if (f.waiters.length >= f.reqAnts && !f.isCarried) {
        f.isCarried = true;

        // Chỉ lấy đúng reqAnts con đầu tiên vào đội khiêng
        const chosen = f.waiters.slice(0, f.reqAnts);
        const surplus = f.waiters.slice(f.reqAnts); // Số con dư thừa

        // Giải phóng các con dư: đẩy ra xa rồi cho về tuần tra
        surplus.forEach(id => {
          const a = ants[id];
          if (!a) return;
          // Đẩy ra xa khỏi tâm mồi theo hướng ngẫu nhiên để tránh kẹt
          const escapeAngle = Math.random() * Math.PI * 2;
          const escapeDist = f.reqAnts <= 2 ? 8 : (f.reqAnts <= 4 ? 10 : 12);
          a.position.x = f.x + Math.cos(escapeAngle) * escapeDist;
          a.position.z = f.z + Math.sin(escapeAngle) * escapeDist;
          a.targetDir.set(Math.cos(escapeAngle), 0, Math.sin(escapeAngle));
          a.state = 'patrolling';
          a.priority = 0;
          a.targetFoodId = null;
          a.timer = randomWanderTime();
        });

        // Cập nhật danh sách waiters chỉ còn đội chính thức
        f.waiters = chosen;
        chosen.forEach(id => {
          ants[id].state = 'carrying';
          ants[id].priority = 1;
        });
      }

      // Hành vi tịnh tiến tập thể
      if (f.isCarried) {
        const center = _v3.set(f.x, 0, f.z);
        const toNest = _v1.subVectors(NEST_POS, center).setY(0).normalize();
        center.addScaledVector(toNest, WALK_SPEED * 0.7 * delta);
        resolvePhysics(center, toNest);

        f.x = center.x; f.z = center.z;

        // Keo sơn gắn bó các con kiến theo vệ tinh đồ ăn
        f.waiters.forEach((id, idx) => {
          if (f.reqAnts === 1) { // Khuân vác một mình (Đường nhỏ)
            ants[id].position.set(center.x, 0, center.z).addScaledVector(toNest, -2.3); // Đi ngay đằng sau đẩy cục kẹo, lùi xa hơn để tránh cắm đầu vào kẹo
            ants[id].targetDir.copy(toNest);
            ants[id].anim = 'Insect|walk_1';
            ants[id].bioState = 'WANDERING';
          } else { // Khuân vác hợp tác (Xếp vòng tròn quanh mồi)
            const angle = (Math.PI * 2 / f.waiters.length) * idx;
            const carryRadius = f.reqAnts <= 2 ? 3.0 : (f.reqAnts <= 4 ? 4.0 : 4.5);
            const offsetX = Math.cos(angle) * carryRadius;
            const offsetZ = Math.sin(angle) * carryRadius;
            ants[id].position.set(center.x + offsetX, 0, center.z + offsetZ);
            if (idx === 0) ants[id].targetDir.copy(toNest).negate(); // 1 con đầu bò đi lùi kéo
            else ants[id].targetDir.copy(toNest); // Đám còn lại đi tới đẩy mông
            ants[id].anim = 'Insect|walk_1';
            ants[id].bioState = 'WANDERING';
          }
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
        onFoodDelivered(f.nutrition); // BÚP NUTRITION KHỔNG LỒ
      });
    }

    const killedEnemies = enemyDataRef.current.filter(e => e.killed);
    if (killedEnemies.length > 0) {
      enemyDataRef.current = enemyDataRef.current.filter(e => !e.killed);
      killedEnemies.forEach(e => {
        onEnemyKilled?.(e.id);
        // THƯỞNG LỚN TỪ TRẬN CHIẾN: Cần 6 kiến khiênh, nhưng quy đổi ra 20 ĐIỂM (đẻ 10 kiến con)
        if (setFoodList) {
          setFoodList(prev => [...prev, { id: 'corpse_' + e.id, x: e.pos.x, z: e.pos.z, reqAnts: 6, nutrition: 20 }]);
        }
      });
    }

    // 6. Xung Đột & Nhường Đường (Steering Dynamics)
    for (let i = 0; i < ants.length - 1; i++) {
      for (let j = i + 1; j < ants.length; j++) {
        const a1 = ants[i], a2 = ants[j];
        if (a1.state === 'hidden_inside' || a2.state === 'hidden_inside' || a1.state === 'hiding' || a2.state === 'hiding') continue;
        if (a1.state === 'dead' || a2.state === 'dead') continue;
        // Kiến đang chờ khiêng hoặc đang khiêng: bỏ qua collision với nhau để tránh giật
        if (a1.state === 'waiting_to_carry' && a2.state === 'waiting_to_carry') continue;
        if (a1.state === 'waiting_to_carry' && a2.state === 'carrying') continue;
        if (a1.state === 'carrying' && a2.state === 'waiting_to_carry') continue;

        const distSq = a1.position.distanceToSquared(a2.position);
        if (distSq >= 16.0) continue;

        // Chạm râu giao tiếp dọc đường ngẫu nhiên
        if (a1.state === 'patrolling' && a2.state === 'patrolling' && !(a1.commCooldown > 0) && !(a2.commCooldown > 0)) {
          a1.state = 'communicating'; a2.state = 'communicating';
          a1.bioState = 'GREETING'; a2.bioState = 'GREETING';
          a1.anim = 'Insect|idle_A2'; a2.anim = 'Insect|idle_A3';
          a1.timer = 0.5; a2.timer = 0.5;

          // Trophallaxis: chia sẻ năng lượng/nước
          if (Math.abs(a1.energy - a2.energy) > 20) {
            const eDiff = (a1.energy - a2.energy) / 3;
            a1.energy -= eDiff; a2.energy += eDiff;
          }
          if (Math.abs(a1.hydration - a2.hydration) > 20) {
            const hDiff = (a1.hydration - a2.hydration) / 3;
            a1.hydration -= hDiff; a2.hydration += hDiff;
          }

          _dirVec.subVectors(a2.position, a1.position).setY(0);
          if (_dirVec.lengthSq() < 0.001) _dirVec.set(1, 0, 0);
          a1.targetDir.copy(_dirVec).normalize();
          _dirVec.negate();
          a2.targetDir.copy(_dirVec).normalize();
          continue; // Đã xử lý xong cặp này
        }

        // Tránh lề cho hội đang khiêng rinh (priority 1 vs 0)
        if (Math.abs(a1.priority - a2.priority) === 1) {
          const pLow = a1.priority === 1 ? a2 : a1;
          const pHigh = a1.priority === 1 ? a1 : a2;
          _pushVec.subVectors(pLow.position, pHigh.position).setY(0);
          if (_pushVec.lengthSq() < 0.001) {
            // Dùng hướng cố định thay vì random để tránh giật
            _pushVec.set(1, 0, 0);
          } else {
            _pushVec.normalize();
          }
          // Lực đẩy nhẹ hơn, dùng WALK_SPEED thay vì RUN_SPEED để tránh vọt
          pLow.position.addScaledVector(_pushVec, WALK_SPEED * delta);
          continue;
        }

        // Lực bật mềm chống dính nhân bản — chỉ khi thực sự chồng lên nhau (< 2 units)
        if (distSq < 4.0 &&
            a1.state !== 'carrying' && a2.state !== 'carrying') {
          _pushVec.subVectors(a1.position, a2.position).setY(0);
          const len = _pushVec.length();
          if (len < 0.001) {
            // Dùng offset cố định dựa trên id để 2 con luôn tách ra cùng hướng, không giật
            const angle = (a1.id - a2.id) * 1.1;
            _pushVec.set(Math.cos(angle), 0, Math.sin(angle));
          } else {
            _pushVec.divideScalar(len); // normalize thủ công, tránh tạo vector mới
          }
          // Lực đẩy tỉ lệ với mức độ chồng lên nhau → mượt hơn
          const pushStrength = (2.0 - Math.sqrt(distSq)) * WALK_SPEED * 0.4 * delta;
          a1.position.addScaledVector(_pushVec, pushStrength);
          a2.position.addScaledVector(_pushVec, -pushStrength);
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

      {/* Visualizer Đường Pheromone Xanh Siêu Tối Ưu */}
      <PheroVisualizer pheromonesRef={pheromonesRef} />

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

  const [foodRate, setFoodRate] = useState(4); // Mặc định Trù phú
  const [waterRate, setWaterRate] = useState(3);
  const [enemyRate, setEnemyRate] = useState(1);

  const [resetKey, setResetKey] = useState(0);
  const [populationHistory, setPopulationHistory] = useState([20]);
  const [maxKValue, setMaxKValue] = useState(20);

  // Tổng dân số Đích cần sinh trưởng (Không khống chế trần ảo, tuân theo luật Sinh-Tử tự nhiên)
  const targetBornCount = 20 + Math.floor(deliveryCount / 2); // Lên cấp dựa vào Nutrition
  const foodRemaining = deliveryCount % 2; // Lượng dư sau khi sinh kiến
  const antsBorn = Math.floor(deliveryCount / 2); // Số kiến đã sinh

  const [stats, setStats] = useState({ patrolling: 20, communicating: 0, recruit: 0, waiting: 0, carrying: 0, alarmed: 0, major: 0, minor: 20, dead: 0, deathToll: 0 });
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

  // Tracking Lịch sử Dân Số & Tính K (Carrying Capacity)
  useEffect(() => {
    const interval = setInterval(() => {
      setPopulationHistory(prev => {
        const currentTotal = stats.major + stats.minor;
        const newHist = [...prev, currentTotal];
        if (newHist.length > 12) newHist.shift(); // Lưu giữ 60s gần nhất (12 mốc 5s)
        return newHist;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [stats.major, stats.minor]);

  useEffect(() => {
    const currentTotal = stats.major + stats.minor;
    if (currentTotal > maxKValue) setMaxKValue(currentTotal);
  }, [stats.major, stats.minor, maxKValue]);

  const kValue = Math.round(populationHistory.reduce((a, b) => a + b, 0) / populationHistory.length);
  
  // Công thức sức chứa dựa trên mô hình sinh thái học (Resource-Based Carrying Capacity)
  // Nguyên lý: Sức chứa bị giới hạn bởi tài nguyên khan hiếm nhất (Liebig's Law of the Minimum)
  const K_food = foodRate * 15; // Mỗi đơn vị thức ăn nuôi được ~15 kiến (dựa trên tỷ lệ tiêu thụ thực tế)
  const K_water = waterRate * 20; // Nước ít khan hiếm hơn, mỗi đơn vị nuôi được ~20 kiến
  const K_space = 60; // Giới hạn không gian vật lý của mô phỏng (mật độ tối đa)
  
  // Áp lực săn mồi (Predation Pressure) - Giảm sức chứa theo hàm phi tuyến
  const predationPressure = Math.min(0.8, enemyRate * 0.08); // Tối đa giảm 80%
  
  // Sức chứa lý thuyết = min(tài nguyên khan hiếm nhất) × (1 - áp lực săn mồi)
  const theoreticalMaxK = Math.max(5, Math.floor(
    Math.min(K_food, K_water, K_space) * (1 - predationPressure)
  ));
  
  // Tính toán sức chứa thực tế (Spatial Scaling)
  const kValueReal = calculateRealCapacity(kValue);
  const theoreticalMaxKReal = calculateRealCapacity(theoreticalMaxK);
  const maxKValueReal = calculateRealCapacity(maxKValue);

  const totalAlive = stats.major + stats.minor;
  let ecoBadge = { text: '🟢 ỔN ĐỊNH', color: 'text-green-500' };
  if (totalAlive === 0) ecoBadge = { text: '💀 DIỆT VONG', color: 'text-neutral-500' };
  else if (totalAlive < 5 || totalAlive < kValue - 5) ecoBadge = { text: '🔴 NGUY KỊCH', color: 'text-red-500' };
  else if (totalAlive < kValue - 2) ecoBadge = { text: '🟠 SUY THOÁI', color: 'text-orange-500' };
  else if (totalAlive > kValue + 3) ecoBadge = { text: '🔵 BÙNG NỔ', color: 'text-blue-500' };

  const handleResetGame = () => {
    setDeliveryCount(0);
    setFoodList([]);
    setEnemyList([]);
    setStats({ patrolling: 20, communicating: 0, recruit: 0, waiting: 0, carrying: 0, alarmed: 0, major: 0, minor: 20, dead: 0, deathToll: 0 });
    setPopulationHistory([20]);
    setMaxKValue(20);
    setIsRaining(false);
    setResetKey(k => k + 1);
    setResetKey(k => k + 1);
  };

  const popRef = useRef(0);
  useEffect(() => { popRef.current = stats.major + stats.minor; }, [stats]);

  // 🌍 Mẹ Thiên Nhiên: Auto Spawners
  useEffect(() => {
    if (foodRate > 0) {
      const interval = setInterval(() => {
        setFoodList(prev => {
          if (prev.length >= 10 + foodRate) return prev; // Limit max food pieces
          const rand = Math.random();
          let weight = 1; // Hạt nhỏ
          if (rand < 0.2) weight = 4; // 20% Hạt to
          else if (rand < 0.5) weight = 2; // 30% Hạt vừa

          let fx, fz, validSpawn = false, attempts = 0;
          while (!validSpawn && attempts < 10) {
            fx = (Math.random() - 0.5) * 140;
            fz = (Math.random() - 0.5) * 140;
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
  }, [foodRate]);

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
          if (dist > 0 && dist < obs.r + 9.0) { // Đẩy lùi xa mồi rơi ở hồ nước để tránh kiến bị kẹt lag
            const lap = (obs.r + 9.0) - dist;
            fx += (dx / dist) * lap; fz += (dz / dist) * lap;
          }
        }
        // Thêm FoodEntity ở chế độ God Mode: Luôn luôn là đường TO
        const weight = 4;
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
        <div className="mt-3 space-y-2 border-t border-neutral-200 dark:border-neutral-700 pt-3">
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
        {deliveryCount > 0 && <div className="mt-3 text-xs text-green-600 dark:text-green-400 border-t border-neutral-200 dark:border-neutral-700 pt-2 font-medium">
          🏠 Lương thực dự trữ: {foodRemaining}/2 Nutrition {antsBorn > 0 && <span className="text-amber-600 dark:text-amber-400 ml-1">(🐣 đã sinh {antsBorn} kiến)</span>}
        </div>}
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-5 md:right-5 md:left-auto md:-translate-x-0 z-[100] w-[92%] sm:w-[280px]">
        {selectedAntId === null ? (
          // SWARM DASHBOARD
          <div className="bg-white/95 dark:bg-neutral-900/95 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xl">
            <h4
              className="m-0 flex justify-between items-center text-sm font-bold cursor-pointer border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2"
              onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
            >
              <div className="flex flex-col gap-1">
                <span className={ecoBadge.color}>{ecoBadge.text}</span>
                <div className="text-neutral-600 dark:text-neutral-400 font-medium text-[10px] space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span>🐜 Hiện tại: <b className="text-neutral-800 dark:text-neutral-100">{totalAlive} cá thể</b></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊 K trung bình (60s): {kValue} cá thể</span>
                    <span className="cursor-help" title="Trung bình động dân số trong 60 giây gần nhất — dùng để tính sức chứa K theo sinh thái học.">ⓘ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🌍 Thực Tế Ước Tính: {(calculateRealCapacity(totalAlive) / 10000).toFixed(1)} vạn</span>
                    <span className="cursor-help" title="Dựa trên phép nội suy diện tích từ ô lấy mẫu vi mô ra lãnh thổ 50 mét vuông ngoài tự nhiên.">ⓘ</span>
                  </div>
                </div>
              </div>
              <span className="text-neutral-400 dark:text-neutral-500 opacity-60 text-xs ml-2">{isDashboardExpanded ? '▲' : '▼'}</span>
            </h4>
            <div className={`transition-all duration-300 overflow-hidden ${isDashboardExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="text-[13px] font-medium list-none pl-0 mb-3 space-y-1.5 text-neutral-800 dark:text-neutral-200">
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>👑 Kiến Tướng (Major):</span> <b>{stats.major}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>👷 Kiến Thợ (Minor):</span> <b>{stats.minor}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 pt-2"><span>🔍 Vệ binh tuần tra:</span> <b>{stats.patrolling}/{stats.major + stats.minor}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1"><span>📡 Nhả mùi Dẫn đường:</span> <b>{stats.recruit}/{stats.major + stats.minor}</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-purple-700 dark:text-purple-400"><span>⏳ Chờ đội hình:</span> <b>{stats.waiting} kiến</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-green-600 dark:text-green-400"><span>🏋️ Kéo mồi tập thể:</span> <b>{stats.carrying} kiến</b></li>
                <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 text-red-600 dark:text-red-400"><span>⚠️ Chiến binh tự vệ:</span> <b>{stats.alarmed}/{stats.major + stats.minor}</b></li>
                <li className="flex justify-between text-neutral-500 dark:text-neutral-400"><span>🪦 Quy Tiên:</span> <b>{stats.deathToll} kiến</b></li>
              </ul>
              
              {/* Sức chứa lý thuyết tối đa */}
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wide">⚖️ Sức Chứa Lý Thuyết Tối Đa</span>
                  <span className="cursor-help text-amber-600 dark:text-amber-400" title="Dựa trên Định luật Liebig (Law of the Minimum): Sức chứa = min(K_thức_ăn, K_nước, K_không_gian) × (1 - áp_lực_săn_mồi). Nếu vượt quá ngưỡng này, hệ sinh thái sẽ suy thoái do thiếu tài nguyên khan hiếm nhất.">ⓘ</span>
                </div>
                <div className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex justify-between items-center">
                    <span>📊 Vi mô (Mô phỏng):</span>
                    <span className="font-bold">{theoreticalMaxK} cá thể</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🌍 Vĩ mô (Thực tế):</span>
                    <span className="font-bold">{(theoreticalMaxKReal / 10000).toFixed(1)} vạn cá thể</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800/50 text-[10px] text-amber-700 dark:text-amber-400 italic">
                  {totalAlive > theoreticalMaxK ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold">⚠️ Cảnh báo: Vượt ngưỡng! Nguy cơ suy thoái cao.</span>
                  ) : totalAlive > theoreticalMaxK * 0.9 ? (
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">⚡ Gần đạt ngưỡng tối đa.</span>
                  ) : (
                    <span>✓ Hệ sinh thái còn dư địa phát triển.</span>
                  )}
                </div>
              </div>
              
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
                <div className="space-y-1.5 mb-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
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
            key={resetKey}
            modelUrl={modelUrl} enemyList={enemyList} foodList={foodList} clickMode={clickMode} isRaining={isRaining} antCount={targetBornCount}
            waterRate={waterRate}
            onConsumeFood={onConsumeFood}
            setFoodList={setFoodList}
            onEnemyKilled={onEnemyKilled}
            onFoodDelivered={(weight) => setDeliveryCount(c => c + (weight || 1))}
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
              <div className="text-white font-bold text-right">{(maxKValueReal / 10000).toFixed(1)} vạn</div>
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


