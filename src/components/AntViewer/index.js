import React, { useState, useRef, useEffect } from 'react';
import Link from '@docusaurus/Link';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Head from '@docusaurus/Head';

const HOTSPOT_GROUPS = [
  {
    id: 'head', label: 'Đầu & Hàm Răng Cưa',
    desc: 'Phần đầu lớn chứa não bộ, cơ hàm mạnh mẽ và cặp hàm răng cưa (mandible). Kiến thợ đại có đầu to bất thường với lực cắn cực mạnh để nghiền nát hạt cứng.',
    link: '/docs/dac-diem-hinh-thai', linkText: 'Đặc điểm hình thái',
    glowColor: 'rgba(239,68,68,1)', activeClass: 'bg-red-500', idleClass: 'bg-red-500/70', textColor: 'text-red-400',
    points: [{ position: '-0.0010 0.0005 -0.0518', normal: '-0.3447 0.4877 0.8021' }],
  },
  {
    id: 'eye', label: 'Mắt Kép',
    desc: 'Mắt kép phát triển rõ rệt, hỗ trợ mạnh nhận thức thị giác không gian. S. geminata có thị lực tương đối tốt, khác với nhiều loài kiến sống ngầm bị thoái hóa thị giác.',
    link: '/docs/dac-diem-hinh-thai', linkText: 'Đặc điểm hình thái',
    glowColor: 'rgba(34,197,94,1)', activeClass: 'bg-green-500', idleClass: 'bg-green-500/70', textColor: 'text-green-400',
    points: [
      { position: '-0.0012 0.0005 -0.0523', normal: '-0.6719 0.3407 -0.6576' },
      { position: '-0.0006 0.0001 -0.0517', normal: '0.6313 -0.5089 0.5852' },
    ],
  },
  {
    id: 'antenna', label: 'Cơ Quan Cảm Giác (Râu)',
    desc: 'Gồm 10 đốt với đốt cuối phình to thành hình chùy. Dùng để "ngửi" pheromone, nhận diện đồng loại và dò tìm dấu vết thức ăn từ khoảng cách xa.',
    link: '/docs/dac-diem-hinh-thai', linkText: 'Đặc điểm hình thái',
    glowColor: 'rgba(59,130,246,1)', activeClass: 'bg-blue-500', idleClass: 'bg-blue-500/70', textColor: 'text-blue-400',
    points: [
      { position: '-0.0018 0.0005 -0.0519', normal: '-0.3527 -0.8958 0.2705' },
      { position: '-0.0010 0.0001 -0.0512', normal: '-0.8252 -0.5644 -0.0215' },
    ],
  },
  {
    id: 'thorax', label: 'Ngực (Thorax)',
    desc: 'Trung tâm vận động. Không có gai ngực — đặc điểm phân biệt loài. Nơi gắn kết 3 cặp chân và cánh (ở kiến chúa), chứa cơ hô hấp mạnh mẽ.',
    link: '/docs/dac-diem-hinh-thai', linkText: 'Đặc điểm hình thái',
    glowColor: 'rgba(249,115,22,1)', activeClass: 'bg-orange-500', idleClass: 'bg-orange-500/70', textColor: 'text-orange-400',
    points: [{ position: '0.000 0.000 -0.053', normal: '0.609 -0.360 0.707' }],
  },
  {
    id: 'legs', label: '3 Cặp Chân',
    desc: 'Ba cặp chân khỏe giúp kiến di chuyển với tốc độ và độ linh hoạt cao. Cuối chân có móc bám và đệm nhớt giúp leo tường dựng đứng dễ dàng.',
    link: '/docs/dac-diem-hinh-thai', linkText: 'Đặc điểm hình thái',
    glowColor: 'rgba(234,179,8,1)', activeClass: 'bg-yellow-500', idleClass: 'bg-yellow-500/70', textColor: 'text-yellow-400',
    points: [
      { position: '0.0012 0.0007 -0.0527', normal: '-0.6569 -0.7538 0.0176' },
      { position: '0.0003 0.0004 -0.0525', normal: '-0.1564 -0.7126 0.6839' },
      { position: '-0.0001 -0.0000 -0.0522', normal: '-0.3044 -0.9336 0.1891' },
      { position: '0.0011 0.0009 -0.0545', normal: '-0.4552 -0.8883 -0.0607' },
      { position: '-0.0005 0.0008 -0.0535', normal: '0.8538 -0.5079 0.1141' },
      { position: '-0.0015 0.0000 -0.0531', normal: '0.5592 -0.7846 0.2679' },
    ],
  },
  {
    id: 'stinger', label: 'Bụng & Nọc Độc Solenopsin',
    desc: 'Nơi chứa túi nọc và kim chích với alkaloid piperidine (Solenopsin). Vết chích gây bỏng rát như lửa đốt và hình thành mụn mủ trắng đặc trưng.',
    link: '/docs/noc-doc-va-trieu-chung', linkText: 'Nọc độc & Triệu chứng',
    glowColor: 'rgba(168,85,247,1)', activeClass: 'bg-purple-500', idleClass: 'bg-purple-500/70', textColor: 'text-purple-400',
    points: [{ position: '0.0009 0.0006 -0.0536', normal: '-0.2525 -0.9334 -0.2551' }],
  },
];

const ANIM_BUTTONS = [
  { key: 'freeze', label: 'Đứng yên',  anim: null,             activeColor: 'bg-neutral-500' },
  { key: 'stop',   label: 'Đứng nghỉ', anim: 'Insect|idle_A3', activeColor: 'bg-orange-500',
    title: 'Đứng nghỉ / Vệ sinh cơ thể', textColor: 'text-orange-400',
    desc: 'Trong trạng thái nghỉ, kiến thường cọ xát, làm sạch râu và chân bằng miệng. Việc giữ sạch cơ quan cảm giác rất quan trọng để duy trì độ nhạy bén với pheromone.',
    link: '/docs/dac-diem-hinh-thai', linkText: 'Đặc điểm hình thái' },
  { key: 'walk',   label: 'Đi bộ',     anim: 'Insect|walk_1',  activeColor: 'bg-rose-500',
    title: 'Di chuyển / Tuần tra', textColor: 'text-rose-400',
    desc: 'Kiến thợ liên tục tuần tra quanh tổ theo các tọng phái hoá học đã thiết lập. Khi phát hiện thức ăn, chúng tiết pheromone từ bụng xuống đất để dẫn đường cho đồng loại.',
    link: '/docs/mo-hinh-to-chuc', linkText: 'Mô hình tổ chức' },
  { key: 'attack', label: 'Cảnh giác', anim: 'Insect|idle_A2',  activeColor: 'bg-red-600',
    title: 'Cảnh giác / Sẵn sàng tấn công', textColor: 'text-red-400',
    desc: 'Khi tổ bị đe dọa, kiến thợ vươn cao đầu, mở rộng hàm và gập bụng lại chuẩn bị chích nọc. Một con kiến có thể chích liên tục nhiều lần mà không mất nọc độc.',
    link: '/docs/soc-phan-ve-va-so-cuu', linkText: 'Sốc phản vệ' },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function AntViewer() {
  const [animKey, setAnimKey] = useState('stop');
  const currentAnim = ANIM_BUTTONS.find(b => b.key === animKey);
  const [activeGroup, setActiveGroup] = useState(null);
  const orbitRef = useRef({ theta: 45, phi: 75 });
  const [orbit, setOrbit] = useState(orbitRef.current);
  const modelRef = useRef(null);
  const pointerDownPos = useRef(null);
  const modelSrc = useBaseUrl('/models/fire_ant/fire-ant.gltf');

  const applyOrbit = (patch) => {
    const o = { ...orbitRef.current, ...patch };
    o.phi = clamp(o.phi, 5, 160);
    orbitRef.current = o;
    setOrbit({ ...o });
    if (modelRef.current) {
      const mv = modelRef.current;
      const cur = typeof mv.getCameraOrbit === 'function' ? mv.getCameraOrbit() : null;
      const r = cur ? cur.radius : 'auto';
      mv.cameraOrbit = `${o.theta}deg ${o.phi}deg ${r}m`;
    }
  };



  useEffect(() => {
    if (!modelRef.current) return;
    if (animKey === 'freeze') {
      const doPause = () => modelRef.current?.pause();
      typeof modelRef.current.pause === 'function'
        ? doPause()
        : modelRef.current.addEventListener('load', doPause, { once: true });
    } else {
      typeof modelRef.current.play === 'function' && modelRef.current.play();
    }
  }, [animKey]);

  // Sync D-pad angles from camera-change
  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;
    let raf, attached = false, removeHandler = () => {};
    const tryAttach = () => {
      const mv = modelRef.current;
      if (mv && typeof mv.getCameraOrbit === 'function' && !attached) {
        attached = true;
        const handler = () => {
          const o = mv.getCameraOrbit();
          const updated = {
            theta: Math.round(o.theta * 180 / Math.PI),
            phi:   Math.round(o.phi   * 180 / Math.PI),
          };
          orbitRef.current = { ...orbitRef.current, ...updated };
          setOrbit(p => ({ ...p, ...updated }));
        };
        mv.addEventListener('camera-change', handler);
        removeHandler = () => mv.removeEventListener('camera-change', handler);
      } else if (!attached) raf = requestAnimationFrame(tryAttach);
    };
    raf = requestAnimationFrame(tryAttach);
    return () => { cancelAnimationFrame(raf); removeHandler(); };
  }, []);

  const handlePointerDown = (e) => { pointerDownPos.current = { x: e.clientX, y: e.clientY }; };
  const handlePointerUp   = (e) => {
    if (!pointerDownPos.current) return;
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    if (dx < 6 && dy < 6 && modelRef.current?.positionAndNormalFromPoint) {
      const hit = modelRef.current.positionAndNormalFromPoint(e.clientX, e.clientY);
      if (hit) {
        console.log(`data-position="${hit.position.x.toFixed(4)} ${hit.position.y.toFixed(4)} ${hit.position.z.toFixed(4)}"`);
        console.log(`data-normal="${hit.normal.x.toFixed(4)} ${hit.normal.y.toFixed(4)} ${hit.normal.z.toFixed(4)}"`);
      }
    }
    if (dx < 6 && dy < 6 && e.target === modelRef.current) setActiveGroup(null);
    pointerDownPos.current = null;
  };

  const activeInfo = activeGroup ? HOTSPOT_GROUPS.find(g => g.id === activeGroup) : null;

  return (
    <>
      <Head>
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
      </Head>
      <div className="w-full flex flex-col lg:flex-row gap-4">

      {/* ── Model Viewer ── */}
      <div className="relative flex-1 rounded-2xl overflow-hidden bg-rose-50/50 dark:bg-black/30 border border-rose-100 dark:border-transparent transition-colors duration-500"
        style={{ minHeight: 'min(55vw, 520px)' }}>

        {/* Toolbar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1
          bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-full px-2 py-1 border border-rose-200 dark:border-white/10 shadow-xl whitespace-nowrap transition-colors duration-300">
          <span className="text-neutral-500 dark:text-white/40 text-[10px] font-medium px-1 hidden sm:block">Kéo để xoay · Cuộn để zoom</span>
          <button
            onClick={() => {
              if (modelRef.current) {
                modelRef.current.cameraOrbit = '45deg 75deg auto';
                modelRef.current.fieldOfView = 'auto';
              }
              orbitRef.current = { theta: 45, phi: 75 };
              setOrbit({ theta: 45, phi: 75 });
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold
              text-neutral-700 dark:text-white/60 hover:text-rose-600 dark:hover:text-white hover:bg-rose-100 dark:hover:bg-white/10 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            Reset
          </button>
        </div>

        {/* D-pad – bottom-left, smaller on mobile */}
        <div className="absolute bottom-3 left-3 z-20 select-none">
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {[
              [null, { phi: orbit.phi - 15 }, <svg key="u" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>],
              [{ theta: orbit.theta - 20 }, null, <svg key="l" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>],
              [null, null, null],
              [{ theta: orbit.theta + 20 }, null, <svg key="r" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>],
              [null, { phi: orbit.phi + 15 }, <svg key="d" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>],
            ].reduce((rows, item, i) => {
              // Build 3×3 grid: [0]=empty,[1]=up,[2]=empty,[3]=left,[4]=center,[5]=right,[6]=empty,[7]=down,[8]=empty
              return rows;
            }, null)}
            {/* Row 1 */}
            <div />
            <button onClick={() => applyOrbit({ phi: orbit.phi - 15 })}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-rose-200 dark:border-white/10
                text-neutral-600 dark:text-white/70 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-black/80 flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
            </button>
            <div />
            {/* Row 2 */}
            <button onClick={() => applyOrbit({ theta: orbit.theta - 20 })}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-rose-200 dark:border-white/10
                text-neutral-600 dark:text-white/70 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-black/80 flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={() => { if(modelRef.current) modelRef.current.cameraOrbit='45deg 75deg auto'; orbitRef.current={theta:45,phi:75}; setOrbit({theta:45,phi:75}); }}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-rose-200 dark:border-white/10
                text-neutral-400 dark:text-white/30 hover:text-rose-600 dark:hover:text-white hover:bg-rose-100 dark:hover:bg-rose-600/60 flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button onClick={() => applyOrbit({ theta: orbit.theta + 20 })}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-rose-200 dark:border-white/10
                text-neutral-600 dark:text-white/70 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-black/80 flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            {/* Row 3 */}
            <div />
            <button onClick={() => applyOrbit({ phi: orbit.phi + 15 })}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-rose-200 dark:border-white/10
                text-neutral-600 dark:text-white/70 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-black/80 flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div />
          </div>
        </div>

        {ExecutionEnvironment.canUseDOM && (
          <model-viewer
            ref={modelRef}
            src={modelSrc}
            alt="Solenopsis Geminata Worker Ant"
            camera-controls
            touch-action="pan-y"
            {...(currentAnim?.anim ? { autoplay: true, 'animation-name': currentAnim.anim } : {})}
            shadow-intensity="1.5"
            shadow-softness="0.5"
            exposure="1"
            environment-image="neutral"
            camera-orbit="45deg 75deg auto"
            interaction-prompt="none"
            style={{ width: '100%', height: '100%', minHeight: 'inherit', outline: 'none', cursor: 'grab', display: 'block' }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {HOTSPOT_GROUPS.map((group) =>
              group.points.map((pt, ptIdx) => (
                <button
                  key={`${group.id}-${ptIdx}`}
                  slot={`hotspot-${group.id}-${ptIdx}`}
                  data-position={pt.position}
                  data-normal={pt.normal}
                  onClick={(e) => { e.stopPropagation(); setActiveGroup(activeGroup === group.id ? null : group.id); }}
                  style={{ boxShadow: `0 0 8px 2px ${group.glowColor}` }}
                  className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white cursor-pointer transition-all duration-300
                    ${activeGroup === group.id ? `${group.activeClass} scale-150` : `${group.idleClass} hover:scale-125`}`}
                >
                  <span className={`absolute inset-0 rounded-full animate-ping opacity-50 ${group.activeClass}`}
                    style={{ animationDuration: '2s' }} />
                </button>
              ))
            )}
          </model-viewer>
        )}
      </div>

      {/* ── Side Panel ── */}
      <div className="lg:w-[280px] flex flex-col gap-3">

        {/* Info panel */}
        <div className={`transition-all duration-300 rounded-2xl border backdrop-blur-md p-4 shadow-xl
          ${(activeInfo || currentAnim?.title)
            ? 'bg-white/95 dark:bg-neutral-900 border-rose-200 dark:border-neutral-700'
            : 'bg-white/50 dark:bg-neutral-900/50 border-white/20 dark:border-neutral-800'}`}
        >
          {activeInfo ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeInfo.activeClass} shadow-lg shrink-0`} />
                <h4 className={`font-black text-sm m-0 tracking-tight ${activeInfo.textColor}`}>{activeInfo.label}</h4>
              </div>
              <p className="text-[12px] text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 m-0">{activeInfo.desc}</p>
              <Link to={activeInfo.link} className={`inline-flex items-center gap-1 font-bold text-[11px] tracking-wide hover:underline uppercase ${activeInfo.textColor}`}>
                {activeInfo.linkText} →
              </Link>
            </>
          ) : currentAnim?.title ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentAnim.activeColor} shadow-lg shrink-0`} />
                <h4 className={`font-black text-sm m-0 tracking-tight ${currentAnim.textColor}`}>{currentAnim.title}</h4>
              </div>
              <p className="text-[12px] text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 m-0">{currentAnim.desc}</p>
              <Link to={currentAnim.link} className={`inline-flex items-center gap-1 font-bold text-[11px] tracking-wide hover:underline uppercase ${currentAnim.textColor}`}>
                {currentAnim.linkText} →
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 py-1">
              <span className="text-2xl opacity-30">🐜</span>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-500 font-medium m-0">
                Nhấn vào điểm sáng để xem thông tin bộ phận
              </p>
            </div>
          )}
        </div>

        {/* Danh sách bộ phận — horizontal scroll trên mobile */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/30 dark:border-neutral-800 p-3 shadow-xl">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2 m-0">Bộ phận</p>
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {HOTSPOT_GROUPS.map((g) => (
              <button key={g.id}
                onClick={() => setActiveGroup(activeGroup === g.id ? null : g.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left whitespace-nowrap lg:whitespace-normal text-[12px] font-semibold transition-all duration-200 shrink-0 lg:shrink
                  ${activeGroup === g.id
                    ? `${g.activeClass} text-white shadow-md`
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${activeGroup === g.id ? 'bg-white' : g.activeClass}`} />
                {g.label}
                {g.points.length > 1 && <span className="text-[9px] opacity-50 font-normal ml-auto hidden lg:block">×{g.points.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Hoạt ảnh */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/30 dark:border-neutral-800 p-3 shadow-xl">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2 m-0">Hoạt ảnh</p>
          <div className="grid grid-cols-4 gap-1.5">
            {ANIM_BUTTONS.map((btn) => (
              <button key={btn.key}
                onClick={() => setAnimKey(btn.key)}
                className={`py-1.5 rounded-lg font-bold text-[10px] transition-all duration-200
                  ${animKey === btn.key
                    ? `${btn.activeColor} text-white shadow-md`
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
