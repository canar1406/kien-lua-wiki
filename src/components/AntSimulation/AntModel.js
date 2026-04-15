import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

/**
 * AntModel — Self-calibrating rotation
 * 
 * Props:
 *   url: GLTF model URL
 *   animationName: Animation clip name
 *   bioState: WANDERING | GREETING | FOOD_RECRUITMENT | ALARMED
 *   scaleFactor: Multiplier cho root scale (1000 → 0.01 * 1000 = 10)
 *   targetDirRef: React ref chứa THREE.Vector3 hướng di chuyển mong muốn
 */
export function AntModel({ url, animationName = 'Insect|idle_A2', bioState = 'WANDERING', scaleFactor = 1000, targetDirRef, ...props }) {
  const { scene, animations } = useGLTF(url);
  const group = useRef();
  const wrapperRef = useRef();
  
  const bones = useRef({
    antennaeL: [],
    antennaeR: [],
    mandibleL: null,
    mandibleR: null,
    head: null,
    abdomen: [],
    feet: { FL: null, FR: null, ML: null, MR: null, HL: null, HR: null }
  });

  const calibrated = useRef(false);
  const autoAlignRef = useRef();
  const frameCount = useRef(0);

  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    
    bones.current = {
      antennaeL: [],
      antennaeR: [],
      mandibleL: null,
      mandibleR: null,
      head: null,
      abdomen: [],
      feet: { FL: null, FR: null, ML: null, MR: null, HL: null, HR: null }
    };

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.isBone) {
        if (child.name.includes('MaxillarypulpL')) bones.current.antennaeL.push(child);
        if (child.name.includes('MaxillarypulpR')) bones.current.antennaeR.push(child);
        if (child.name.includes('MaxillaL')) bones.current.mandibleL = child;
        if (child.name.includes('MaxillaR')) bones.current.mandibleR = child;
        if (child.name.includes('Head001')) bones.current.head = child;
        if (child.name.includes('Abdomen')) bones.current.abdomen.push(child);
        if (child.name.includes('ForelegL010')) bones.current.feet.FL = child;
        if (child.name.includes('ForelegR010')) bones.current.feet.FR = child;
        if (child.name.includes('MidlegL010')) bones.current.feet.ML = child;
        if (child.name.includes('MidlegR010')) bones.current.feet.MR = child;
        if (child.name.includes('HindlegL010')) bones.current.feet.HL = child;
        if (child.name.includes('HindlegR010')) bones.current.feet.HR = child;
      }
    });

    // QUAN TRỌNG: multiplyScalar thay vì set — giữ nguyên tỉ lệ gốc
    if (cloned.children.length > 0) {
      const root = cloned.children[0];
      console.log('🐜 ROOT NODE:', root.name, 
        'scale:', root.scale.toArray().map(v => v.toFixed(4)),
        'rotation:', root.rotation.toArray().map(v => (v * 180 / Math.PI).toFixed(1)),
        'position:', root.position.toArray().map(v => v.toFixed(4)));
      root.scale.multiplyScalar(scaleFactor);
      root.position.set(0, 0, 0);
    }

    // Log tất cả bones để tìm head
    const allBones = [];
    cloned.traverse(child => {
      if (child.isBone) {
        allBones.push({ name: child.name, pos: child.position.toArray().map(v => v.toFixed(3)) });
      }
    });
    console.log('🦴 ALL BONES:', allBones.map(b => b.name + ' @ ' + b.pos.join(',')).join(' | '));

    return cloned;
  }, [scene, scaleFactor]);
  
  // Lọc animation: CHỈ giữ quaternion tracks cho chân
  const inPlaceAnimations = useMemo(() => {
    return animations.map(clip => {
      const newClip = clip.clone();
      newClip.tracks = newClip.tracks.filter(track => {
        const name = track.name;
        if (name.includes('.scale')) return false;
        if (name.includes('.position')) return false;
        // Cho phép 'Center' xoay để kiến không bị chúi về phía trước (không block Center)
        if (name.includes('Maxillarypulp')) return false;
        if (name.includes('Maxilla')) return false;
        if (name.includes('Head001')) return false;
        return true;
      });
      return newClip;
    });
  }, [animations]);

  const { actions } = useAnimations(inPlaceAnimations, group);

  useEffect(() => {
    const action = actions && actions[animationName];
    if (action) {
      action.reset().fadeIn(0.5).play();
      action.paused = bioState === 'DEAD';
      return () => action.fadeOut(0.5);
    }
  }, [animationName, actions, bioState]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const b = bones.current;

    // === APPLY ROTATION: desiredAngle ===
    if (targetDirRef && targetDirRef.current && wrapperRef.current) {
      const dir = targetDirRef.current;
      if (dir.lengthSq() > 0.001) {
        const desiredAngle = Math.atan2(dir.x, dir.z);
        let targetRot = desiredAngle;
        let currentRot = wrapperRef.current.rotation.y;
        
        while (targetRot - currentRot > Math.PI) currentRot += Math.PI * 2;
        while (targetRot - currentRot < -Math.PI) currentRot -= Math.PI * 2;
        
        wrapperRef.current.rotation.y += (targetRot - currentRot) * delta * 8;
      }
    }

    // === TOÁN HỌC 6 CHÂN CHẠM ĐẤT (Tự động tính góc Pitch/Yaw phẳng bằng ma trận 3D) ===
    if (!calibrated.current && frameCount.current === 10 && autoAlignRef.current) {
      const feet = b.feet;
      if (feet.FL && feet.FR && feet.HL && feet.HR) {
        // Lấy toạ độ tuyệt đối của 4 chân góc
        const getPos = (bone) => {
             const v = new THREE.Vector3();
             bone.getWorldPosition(v);
             // Trả về không gian của Wrapper
             const invBody = new THREE.Matrix4().copy(wrapperRef.current.matrixWorld).invert();
             v.applyMatrix4(invBody);
             return v;
        };

        const fl = getPos(feet.FL);
        const fr = getPos(feet.FR);
        const hl = getPos(feet.HL);
        const hr = getPos(feet.HR);

        // Trung điểm 2 chân trước & 2 chân sau
        const frontCenter = new THREE.Vector3().addVectors(fl, fr).multiplyScalar(0.5);
        const hindCenter = new THREE.Vector3().addVectors(hl, hr).multiplyScalar(0.5);

        // Vector hướng Forward (Từ sau ra trước)
        const forwardApprox = new THREE.Vector3().subVectors(frontCenter, hindCenter).normalize();

        // Mặt phẳng đỡ chân (Mặt đất Ground Plane của riêng con kiến)
        // Lấy 3 điểm tạo mặt phẳng: frontCenter, hl, hr
        const v1 = new THREE.Vector3().subVectors(hl, frontCenter);
        const v2 = new THREE.Vector3().subVectors(hr, frontCenter);
        let up = new THREE.Vector3().crossVectors(v1, v2).normalize();
        if (up.y < 0) up.negate(); // Đảm bảo UP luôn hướng lên trên

        // Trực chuẩn hoá ma trận [Right, Up, Forward]
        const right = new THREE.Vector3().crossVectors(up, forwardApprox).normalize();
        const forward = new THREE.Vector3().crossVectors(right, up).normalize();

        const basisMatrix = new THREE.Matrix4().makeBasis(right, up, forward);

        // Ma trận bù trừ giúp lật lại toàn bộ sai lệch của đồ hoạ, bắt đế kiến phẳng lỳ trên trục toạ độ
        const autoQuat = new THREE.Quaternion().setFromRotationMatrix(basisMatrix.clone().invert());
        
        autoAlignRef.current.quaternion.copy(autoQuat);
        console.log('💎 [MATH CALIB] Đã tự động căn phẳng mô hình dựa trên 6 điểm chân!', autoQuat);
        calibrated.current = true;
      }
    }
    frameCount.current++;

    // === PROCEDURAL ANIMATION ===
    let antennaeSpeed = 3;
    let antennaeRange = 0.15;
    let headPitch = 0;
    let mandibleOpen = 0;

    switch(bioState) {
      case 'WANDERING':
        antennaeSpeed = 3;
        antennaeRange = 0.15;
        break;
      case 'GREETING':
        antennaeSpeed = 12;
        antennaeRange = 0.4;
        break;
      case 'FOOD_RECRUITMENT':
        antennaeSpeed = 18;
        antennaeRange = 0.5;
        headPitch = -0.4;
        mandibleOpen = 0.3;
        break;
      case 'ALARMED':
        antennaeSpeed = 10;
        antennaeRange = 0.5;
        headPitch = 0.5;
        mandibleOpen = 0.6;
        break;
      case 'DRINKING':
        antennaeSpeed = 15;
        antennaeRange = 0.3;
        headPitch = -0.6; // Cúi gập đầu xuống
        mandibleOpen = 0.2;
        break;
      case 'DEAD':
        antennaeSpeed = 0;
        antennaeRange = 0;
        headPitch = 0;
        mandibleOpen = 0;
        break;
    }

    if (b.head) {
        b.head.rotation.x += (headPitch - b.head.rotation.x) * delta * 5;
    }
    if (b.mandibleL) b.mandibleL.rotation.y += (mandibleOpen - b.mandibleL.rotation.y) * delta * 5;
    if (b.mandibleR) b.mandibleR.rotation.y += (-mandibleOpen - b.mandibleR.rotation.y) * delta * 5;

    const waveY = Math.sin(t * antennaeSpeed) * antennaeRange;
    const waveZ = Math.cos(t * antennaeSpeed * 2) * (antennaeRange * 0.5);
    
    b.antennaeL.forEach((bone, idx) => {
        const factor = idx * 0.2 + 0.1;
        bone.rotation.y = waveY * factor;
        bone.rotation.z = waveZ * factor;
    });

    b.antennaeR.forEach((bone, idx) => {
        const factor = idx * 0.2 + 0.1;
        bone.rotation.y = -waveY * factor;
        bone.rotation.z = -waveZ * factor;
    });
  });

  return (
    <group ref={wrapperRef}>
      <group ref={autoAlignRef}>
        <group ref={group} {...props} dispose={null}>
          <primitive object={clone} />
        </group>
      </group>
    </group>
  );
}
