import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

const NOOP = () => null;
const BASE_ANT_SCALE = 1000;
const BAKED_FPS = 30;
const FRAMES_PER_CLIP = 40;

const STATIC_BOUNDING_SPHERE = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 3.0);
const STATIC_BOUNDING_BOX = new THREE.Box3(
  new THREE.Vector3(-3.0, -3.0, -3.0),
  new THREE.Vector3(3.0, 3.0, 3.0)
);

// Cache toàn cục trên GPU cho toàn bộ texture xương, hình học đã lọc tam giác suy biến & vật liệu dùng chung
let cachedAtlasSource = null;
let cachedGPUAtlas = null;

/**
 * Loại bỏ 34.2% tam giác suy biến (degenerate zero-area triangles: a === b || b === c || a === c)
 * sinh ra từ quá trình nối dải TRIANGLE_STRIP của Sketchfab, giữ nguyên InterleavedBuffer trên GPU.
 */
function stripDegenerateTriangles(geo) {
  if (!geo || !geo.index) return geo;
  const clonedGeo = geo.clone();
  // Xóa thuộc tính tangent không cần thiết để giảm băng thông Vertex Shader
  if (clonedGeo.attributes.tangent) {
    clonedGeo.deleteAttribute('tangent');
  }
  const idxArr = geo.index.array;
  const valid = [];
  for (let i = 0; i < idxArr.length; i += 3) {
    const a = idxArr[i];
    const b = idxArr[i + 1];
    const c = idxArr[i + 2];
    if (a !== b && b !== c && a !== c) {
      valid.push(a, b, c);
    }
  }
  const IndexArrayType = idxArr instanceof Uint32Array ? Uint32Array : Uint16Array;
  clonedGeo.setIndex(new THREE.BufferAttribute(new IndexArrayType(valid), 1));
  clonedGeo.boundingSphere = STATIC_BOUNDING_SPHERE;
  clonedGeo.boundingBox = STATIC_BOUNDING_BOX;
  return clonedGeo;
}

/**
 * Nén texture 4K (4096x4096 = 64MB VRAM/texture) xuống 1024x1024 (4MB VRAM) một lần duy nhất
 * và giải phóng hoàn toàn 256MB VRAM của 4 texture 4K gốc (color, normal, rough, spec).
 */
function buildOptimizedSharedMaterial(origMat) {
  let colorMap = origMat?.map || null;
  if (colorMap && typeof document !== 'undefined' && colorMap.image && colorMap.image.width > 1024) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(colorMap.image, 0, 0, 1024, 1024);
      const downscaled = new THREE.CanvasTexture(canvas);
      downscaled.colorSpace = THREE.SRGBColorSpace;
      downscaled.flipY = colorMap.flipY;
      downscaled.wrapS = colorMap.wrapS;
      downscaled.wrapT = colorMap.wrapT;
      downscaled.needsUpdate = true;
      colorMap.dispose();
      colorMap = downscaled;
    } catch {
      // Fallback giữ nguyên map nếu trình duyệt chặn đọc canvas
    }
  }

  // Giải phóng ngay các texture 4K nặng (normalMap, roughnessMap, metalnessMap, clearcoat...) khỏi VRAM
  ['normalMap', 'roughnessMap', 'metalnessMap', 'clearcoatMap', 'clearcoatNormalMap', 'specularIntensityMap', 'specularColorMap'].forEach((prop) => {
    if (origMat && origMat[prop] && origMat[prop].dispose) {
      origMat[prop].dispose();
    }
  });

  return new THREE.MeshStandardMaterial({
    map: colorMap,
    roughness: 0.34,
    metalness: 0.14,
    side: THREE.FrontSide,
  });
}

/**
 * Tiền tính toán (Pre-bake) toàn bộ hoạt ảnh xương GLTF kết hợp Procedural Animation
 * thành các THREE.DataTexture lưu trữ trực tiếp trên VRAM của GPU, đồng thời trích xuất
 * chỉ 2 lưới hình học (Body + Eyes) để loại bỏ hoàn toàn 3 DirectionalLights ẩn trong file GLTF!
 */
function getOrBuildGPUBoneAtlas(scene, animations) {
  if (cachedAtlasSource === scene && cachedGPUAtlas) {
    return cachedGPUAtlas;
  }

  // Tắt và gỡ bỏ mọi nguồn sáng ẩn (Light_0, Light_1, Light_2) bên trong scene GLTF gốc nếu có
  scene.traverse((child) => {
    if (child.isLight) {
      child.intensity = 0;
      child.visible = false;
    }
  });

  const bakerClone = SkeletonUtils.clone(scene);
  if (bakerClone.children.length > 0) {
    const root = bakerClone.children[0];
    root.position.set(0, 0, 0);
  }

  const bones = {
    antennaeL: [],
    antennaeR: [],
    mandibleL: null,
    mandibleR: null,
    head: null,
    abdomen: [],
    feet: { FL: null, FR: null, ML: null, MR: null, HL: null, HR: null },
  };

  let primarySkeleton = null;
  let bodyMesh = null;
  let eyesMesh = null;

  bakerClone.traverse((child) => {
    if (child.isSkinnedMesh) {
      if (child.name.includes('body_0') || (!primarySkeleton && !child.name.includes('fur') && !child.name.includes('eyes'))) {
        primarySkeleton = child.skeleton;
        bodyMesh = child;
      } else if (child.name.includes('eyes')) {
        eyesMesh = child;
      }
    }
    if (child.isBone) {
      const n = child.name;
      const isEnd = n.includes('end');
      child.userData.restX = child.rotation.x;
      child.userData.restY = child.rotation.y;
      child.userData.restZ = child.rotation.z;
      child.userData.restQuat = child.quaternion.clone();

      if (!isEnd) {
        if (n.includes('MaxillarypulpL')) bones.antennaeL.push(child);
        else if (n.includes('MaxillarypulpR')) bones.antennaeR.push(child);
        else if (n.includes('MaxillaL')) bones.mandibleL = child;
        else if (n.includes('MaxillaR')) bones.mandibleR = child;
        else if (n.includes('Head001')) bones.head = child;
        else if (
          n.includes('Abdomen002') ||
          n.includes('Abdomen003') ||
          n.includes('Abdomen004') ||
          n.includes('Abdomen005')
        ) {
          bones.abdomen.push(child);
        }
        if (n.includes('ForelegL010')) bones.feet.FL = child;
        else if (n.includes('ForelegR010')) bones.feet.FR = child;
        else if (n.includes('MidlegL010')) bones.feet.ML = child;
        else if (n.includes('MidlegR010')) bones.feet.MR = child;
        else if (n.includes('HindlegL010')) bones.feet.HL = child;
        else if (n.includes('HindlegR010')) bones.feet.HR = child;
      }
    }
  });

  bakerClone.updateMatrixWorld(true);
  const origBindMatrix = bodyMesh ? bodyMesh.bindMatrix.clone() : new THREE.Matrix4();
  const bakerMeshMatrixInverse = bodyMesh ? bodyMesh.matrixWorld.clone().invert() : new THREE.Matrix4();
  const meshQuat = new THREE.Quaternion();
  if (bodyMesh) {
    bodyMesh.matrixWorld.decompose(new THREE.Vector3(), meshQuat, new THREE.Vector3());
  }

  const fastBodyGeo = bodyMesh ? stripDegenerateTriangles(bodyMesh.geometry) : null;
  const fastEyesGeo = eyesMesh ? stripDegenerateTriangles(eyesMesh.geometry) : null;
  const sharedMaterial = buildOptimizedSharedMaterial(bodyMesh?.material);

  // Lọc bỏ các track vị trí/tỷ lệ và các xương điều khiển bằng Procedural
  const usedNames = new Set(['Insect|walk_1', 'Insect|idle_A2', 'Insect|idle_A3']);
  const clipsMap = {};
  animations.forEach((clip) => {
    if (!usedNames.has(clip.name)) return;
    const c = clip.clone();
    c.tracks = c.tracks.filter((track) => {
      const name = track.name;
      if (name.includes('.scale') || name.includes('.position')) return false;
      if (name.includes('Maxillarypulp') || name.includes('Maxilla') || name.includes('Head001')) return false;
      return true;
    });
    clipsMap[clip.name] = c;
  });

  const mixer = new THREE.AnimationMixer(bakerClone);

  // Tính kích thước chuẩn của Bone DataTexture (1 ma trận 4x4 = 4 pixel RGBA Float)
  let texSize = Math.sqrt(primarySkeleton.bones.length * 4);
  texSize = Math.ceil(texSize / 4) * 4;
  texSize = Math.max(texSize, 4);

  // Tự động hiệu chuẩn mặt phẳng 6 chân kiến ngay tại bước khởi tạo
  let autoQuat = new THREE.Quaternion();
  const walkClip = clipsMap['Insect|walk_1'];
  if (walkClip && bones.feet.FL && bones.feet.FR && bones.feet.HL && bones.feet.HR) {
    const act = mixer.clipAction(walkClip);
    act.play();
    mixer.setTime(0.15);
    bakerClone.updateMatrixWorld(true);

    const getPos = (bone) => {
      const v = new THREE.Vector3();
      bone.getWorldPosition(v);
      return v;
    };
    const fl = getPos(bones.feet.FL);
    const fr = getPos(bones.feet.FR);
    const hl = getPos(bones.feet.HL);
    const hr = getPos(bones.feet.HR);

    const frontCenter = new THREE.Vector3().addVectors(fl, fr).multiplyScalar(0.5);
    const hindCenter = new THREE.Vector3().addVectors(hl, hr).multiplyScalar(0.5);
    const forwardApprox = new THREE.Vector3().subVectors(frontCenter, hindCenter).normalize();

    const v1 = new THREE.Vector3().subVectors(hl, frontCenter);
    const v2 = new THREE.Vector3().subVectors(hr, frontCenter);
    const up = new THREE.Vector3().crossVectors(v1, v2).normalize();
    if (up.y < 0) up.negate();

    const right = new THREE.Vector3().crossVectors(up, forwardApprox).normalize();
    const forward = new THREE.Vector3().crossVectors(right, up).normalize();

    const basisMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
    autoQuat.setFromRotationMatrix(basisMatrix.invert());
    mixer.stopAllAction();
  }

  // Hàm nướng (bake) một trạng thái hành vi sinh học thành chuỗi GPU DataTexture
  const tmpBoneMat = new THREE.Matrix4();
  const numBones = primarySkeleton.bones.length;

  const bakeStateFrames = (clipName, numFrames, procConfig) => {
    const clip = clipsMap[clipName] || clipsMap['Insect|idle_A2'];
    mixer.stopAllAction();
    const action = mixer.clipAction(clip);
    action.reset().play();
    const duration = clip.duration || 1.0;
    const textures = [];

    for (let f = 0; f < numFrames; f++) {
      for (let idx = 0; idx < bones.abdomen.length; idx++) {
        if (bones.abdomen[idx].userData.restQuat) {
          bones.abdomen[idx].quaternion.copy(bones.abdomen[idx].userData.restQuat);
        }
      }

      const progress = f / numFrames;
      const phase = progress * Math.PI * 2;
      mixer.setTime(progress * duration);

      const headPitch = procConfig.headPitch + Math.sin(phase * (procConfig.headFreq || 1)) * (procConfig.headAmp || 0);
      const mandibleOpen = procConfig.mandibleOpen + Math.sin(phase * (procConfig.jawFreq || 1)) * (procConfig.jawAmp || 0);
      const abdomenCurl = procConfig.abdomenCurl + Math.sin(phase * (procConfig.abdFreq || 1)) * (procConfig.abdAmp || 0);

      if (bones.head) {
        bones.head.rotation.x = (bones.head.userData.restX || 0) + headPitch;
      }
      if (bones.mandibleL) {
        bones.mandibleL.rotation.y = (bones.mandibleL.userData.restY || 0) + mandibleOpen;
        bones.mandibleL.rotation.z = (bones.mandibleL.userData.restZ || 0) + mandibleOpen * 0.5;
      }
      if (bones.mandibleR) {
        bones.mandibleR.rotation.y = (bones.mandibleR.userData.restY || 0) - mandibleOpen;
        bones.mandibleR.rotation.z = (bones.mandibleR.userData.restZ || 0) - mandibleOpen * 0.5;
      }
      if (bones.abdomen.length > 0 && Math.abs(abdomenCurl) > 0.002) {
        for (let idx = 0; idx < bones.abdomen.length; idx++) {
          bones.abdomen[idx].rotateX(abdomenCurl);
        }
      }

      const waveY = Math.sin(phase * (procConfig.antFreq || 1)) * procConfig.antRange;
      const waveZ = Math.cos(phase * (procConfig.antFreq || 1) * 2) * (procConfig.antRange * 0.5);

      for (let idx = 0; idx < bones.antennaeL.length; idx++) {
        const bone = bones.antennaeL[idx];
        const factor = idx * 0.2 + 0.1;
        bone.rotation.y = (bone.userData.restY || 0) + waveY * factor;
        bone.rotation.z = (bone.userData.restZ || 0) + waveZ * factor;
      }
      for (let idx = 0; idx < bones.antennaeR.length; idx++) {
        const bone = bones.antennaeR[idx];
        const factor = idx * 0.2 + 0.1;
        bone.rotation.y = (bone.userData.restY || 0) - waveY * factor;
        bone.rotation.z = (bone.userData.restZ || 0) - waveZ * factor;
      }

      bakerClone.updateMatrixWorld(true);
      primarySkeleton.update();

      const matrixBuffer = new Float32Array(texSize * texSize * 4);
      for (let b = 0; b < numBones; b++) {
        tmpBoneMat.fromArray(primarySkeleton.boneMatrices, b * 16);
        tmpBoneMat.premultiply(bakerMeshMatrixInverse).multiply(origBindMatrix);
        tmpBoneMat.toArray(matrixBuffer, b * 16);
      }

      const gpuTex = new THREE.DataTexture(matrixBuffer, texSize, texSize, THREE.RGBAFormat, THREE.FloatType);
      gpuTex.needsUpdate = true;
      textures.push(gpuTex);
    }

    return textures;
  };

  const states = {
    walk_WANDERING: bakeStateFrames('Insect|walk_1', FRAMES_PER_CLIP, {
      headPitch: 0,
      mandibleOpen: 0.05,
      abdomenCurl: 0,
      antFreq: 1,
      antRange: 0.18,
    }),
    walk_ALARMED: bakeStateFrames('Insect|walk_1', FRAMES_PER_CLIP, {
      headPitch: 0.38,
      mandibleOpen: 0.65,
      jawFreq: 2,
      jawAmp: 0.12,
      abdomenCurl: 0.16,
      abdFreq: 2,
      abdAmp: 0.05,
      antFreq: 3,
      antRange: 0.55,
    }),
    walk_HUNGRY: bakeStateFrames('Insect|walk_1', FRAMES_PER_CLIP, {
      headPitch: -0.28,
      mandibleOpen: 0.18,
      abdomenCurl: -0.05,
      antFreq: 2,
      antRange: 0.35,
    }),
    idle_GREETING: bakeStateFrames('Insect|idle_A2', FRAMES_PER_CLIP, {
      headPitch: -0.15,
      mandibleOpen: 0.2,
      abdomenCurl: 0,
      antFreq: 3,
      antRange: 0.48,
    }),
    idle_FOOD_RECRUITMENT: bakeStateFrames('Insect|idle_A2', FRAMES_PER_CLIP, {
      headPitch: -0.45,
      mandibleOpen: 0.36,
      jawFreq: 3,
      jawAmp: 0.16,
      abdomenCurl: 0.04,
      antFreq: 4,
      antRange: 0.52,
    }),
    idle_ATTACKING: bakeStateFrames('Insect|idle_A2', FRAMES_PER_CLIP, {
      headPitch: 0.24,
      headFreq: 3,
      headAmp: 0.28,
      mandibleOpen: 0.44,
      jawFreq: 4,
      jawAmp: 0.38,
      abdomenCurl: -0.22,
      abdFreq: 3,
      abdAmp: 0.24,
      antFreq: 4,
      antRange: 0.6,
    }),
    idle_DRINKING: bakeStateFrames('Insect|idle_A2', FRAMES_PER_CLIP, {
      headPitch: -0.6,
      mandibleOpen: 0.22,
      jawFreq: 2,
      jawAmp: 0.08,
      abdomenCurl: 0,
      antFreq: 2,
      antRange: 0.3,
    }),
    idle_DEAD: bakeStateFrames('Insect|idle_A3', 1, {
      headPitch: -0.2,
      mandibleOpen: 0.1,
      abdomenCurl: -0.15,
      antFreq: 1,
      antRange: 0,
    }),
  };

  mixer.uncacheRoot(bakerClone);

  cachedAtlasSource = scene;
  cachedGPUAtlas = {
    autoQuat,
    meshQuat,
    fastBodyGeo,
    fastEyesGeo,
    sharedMaterial,
    states,
  };
  return cachedGPUAtlas;
}

function resolveAtlasKey(animationName, bioState) {
  if (bioState && (bioState === 'DEAD' || bioState.toLowerCase().includes('dead'))) {
    return 'idle_DEAD';
  }
  if (animationName === 'Insect|idle_A3') {
    return 'idle_DEAD';
  }
  // Khi cá thể đang di chuyển (walk_1): BẮT BUỘC dùng bộ frame bước chân 6 chân (tripod gait), tuyệt đối không dùng frame đứng yên khiến kiến bị trượt/lướt!
  if (animationName === 'Insect|walk_1') {
    if (bioState === 'ALARMED' || bioState === 'ESCORTING' || bioState === 'ATTACKING') {
      return 'walk_ALARMED';
    }
    if (bioState === 'HUNGRY') {
      return 'walk_HUNGRY';
    }
    return 'walk_WANDERING';
  }
  // Khi cá thể đang đứng yên làm tương tác tại chỗ (idle_A2):
  if (bioState === 'ATTACKING' || bioState === 'MILLING') return 'idle_ATTACKING';
  if (bioState === 'FOOD_RECRUITMENT' || bioState === 'ROYAL_TROPHALLAXIS') return 'idle_FOOD_RECRUITMENT';
  if (bioState === 'DRINKING') return 'idle_DRINKING';
  if (bioState === 'GREETING' || bioState === 'ALLOGROOMING' || bioState === 'QUEEN_COURT') return 'idle_GREETING';
  if (animationName === 'Insect|idle_A2') {
    return 'idle_GREETING';
  }
  return 'walk_WANDERING';
}

/**
 * AntModel — 100% GPU Hardware-Skinned via Pre-baked Bone DataTexture Atlas
 * Không nhân bản (clone) cây 165 node GLTF, loại bỏ hoàn toàn 150 DirectionalLights ẩn & 7.200 Bone nodes!
 */
export const AntModel = React.memo(function AntModel({
  url,
  animationName = 'Insect|idle_A2',
  bioState = 'WANDERING',
  scaleFactor = 1000,
  targetDirRef,
  antDataRef,
  antId,
  staggerIndex = 0,
  ...props
}) {
  const { scene, animations } = useGLTF(url);
  const wrapperRef = useRef();
  const scaleGroupRef = useRef();

  const atlas = useMemo(() => getOrBuildGPUBoneAtlas(scene, animations), [scene, animations]);

  // Skeleton giả lập siêu nhẹ: chỉ trỏ trực tiếp tới DataTexture trên GPU, không tính toán ma trận trên CPU
  const gpuSkeleton = useMemo(
    () => ({
      bones: [],
      boneInverses: [],
      boneMatrices: null,
      boneTexture: atlas.states.walk_WANDERING[0],
      update: NOOP,
      computeBoneTexture: NOOP,
      dispose: NOOP,
    }),
    [atlas]
  );

  // Khởi tạo trực tiếp chỉ 2 SkinnedMesh (Body + Eyes) thay vì SkeletonUtils.clone(scene) (165 nodes + 3 Lights)
  const flatGroup = useMemo(() => {
    const group = new THREE.Group();
    [atlas.fastBodyGeo, atlas.fastEyesGeo].forEach((geo) => {
      if (!geo) return;
      const sm = new THREE.SkinnedMesh(geo, atlas.sharedMaterial);
      sm.raycast = NOOP;
      sm.frustumCulled = false;
      sm.castShadow = false;
      sm.receiveShadow = false;
      sm.bindMode = THREE.DetachedBindMode;
      sm.bindMatrix.identity();
      sm.bindMatrixInverse.identity();
      sm.skeleton = gpuSkeleton;
      sm.boundingSphere = STATIC_BOUNDING_SPHERE;
      sm.boundingBox = STATIC_BOUNDING_BOX;
      sm.computeBoundingSphere = NOOP;
      sm.computeBoundingBox = NOOP;
      sm.quaternion.copy(atlas.meshQuat);
      sm.scale.setScalar(BASE_ANT_SCALE);
      sm.updateMatrix();
      sm.matrixAutoUpdate = false;
      group.add(sm);
    });
    return group;
  }, [atlas, gpuSkeleton]);

  const relScale = scaleFactor / BASE_ANT_SCALE;

  useFrame((state, delta) => {
    const d = antDataRef && antId !== undefined ? antDataRef.current[antId] : null;
    const dir = d ? d.targetDir : targetDirRef?.current;

    // 1. Xoay hướng di chuyển mượt ở mọi khung hình
    if (dir && wrapperRef.current) {
      if (dir.lengthSq() > 0.001) {
        const targetRot = Math.atan2(dir.x, dir.z);
        let currentRot = wrapperRef.current.rotation.y;
        while (targetRot - currentRot > Math.PI) currentRot += Math.PI * 2;
        while (targetRot - currentRot < -Math.PI) currentRot -= Math.PI * 2;
        wrapperRef.current.rotation.y += (targetRot - currentRot) * Math.min(1, delta * 9);
      }
    }

    // 2. Chọn frame DataTexture trên GPU (Zero CPU Matrix Math & Zero React Re-render!)
    const curAnim = d ? d.anim : animationName;
    const curBio = d ? d.bioState : bioState;
    const stateKey = resolveAtlasKey(curAnim, curBio);
    const frames = atlas.states[stateKey] || atlas.states.walk_WANDERING;
    if (frames.length === 1) {
      gpuSkeleton.boneTexture = frames[0];
    } else {
      const speedMult = stateKey === 'walk_ALARMED' || stateKey === 'idle_ATTACKING' ? 1.45 : 1.0;
      const frameIdx =
        Math.floor(state.clock.elapsedTime * BAKED_FPS * speedMult + staggerIndex * 7) % frames.length;
      gpuSkeleton.boneTexture = frames[frameIdx];
    }
  });

  return (
    <group ref={wrapperRef}>
      <group ref={scaleGroupRef} quaternion={atlas.autoQuat} scale={[relScale, relScale, relScale]}>
        <group {...props} dispose={null}>
          <primitive object={flatGroup} />
        </group>
      </group>
    </group>
  );
});
