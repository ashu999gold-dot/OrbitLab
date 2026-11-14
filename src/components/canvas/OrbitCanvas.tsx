// ORBITLAB — 3D Three.js WebGL Orbital Mechanics Canvas
// Independent 60/120 FPS rendering loop with smooth OrbitControls,
// dynamic GPU buffer trails, vector helpers, barycenter crosshair, and starfield.

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { PhysicsState, Vector3D } from '../../types/physics';
import { vec3 } from '../../physics/vector3';

export type CameraFocusMode = 'barycenter' | 'body1' | 'body2' | 'free';

interface OrbitCanvasProps {
  physicsState: PhysicsState;
  distanceScale: number; // converts meters to Three.js units
  bodyRadiusScale: number;
  cameraFocus: CameraFocusMode;
  showTrails: boolean;
  showVelocityVectors: boolean;
  showForceVectors: boolean;
  showBarycenter: boolean;
  showGrid: boolean;
  showDistanceLine: boolean;
  trailLength: number;
  onResetCameraView?: () => void;
  resetCameraTrigger?: number;
}

const MAX_TRAIL_POINTS = 3000;

export const OrbitCanvas: React.FC<OrbitCanvasProps> = ({
  physicsState,
  distanceScale,
  bodyRadiusScale,
  cameraFocus,
  showTrails,
  showVelocityVectors,
  showForceVectors,
  showBarycenter,
  showGrid,
  showDistanceLine,
  trailLength,
  resetCameraTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // References for Three.js state across renders
  const stateRef = useRef({
    physicsState,
    distanceScale,
    bodyRadiusScale,
    cameraFocus,
    showTrails,
    showVelocityVectors,
    showForceVectors,
    showBarycenter,
    showGrid,
    showDistanceLine,
    trailLength,
  });

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = {
      physicsState,
      distanceScale,
      bodyRadiusScale,
      cameraFocus,
      showTrails,
      showVelocityVectors,
      showForceVectors,
      showBarycenter,
      showGrid,
      showDistanceLine,
      trailLength,
    };
  }, [
    physicsState,
    distanceScale,
    bodyRadiusScale,
    cameraFocus,
    showTrails,
    showVelocityVectors,
    showForceVectors,
    showBarycenter,
    showGrid,
    showDistanceLine,
    trailLength,
  ]);

  // Trail buffer histories
  const trail1HistoryRef = useRef<THREE.Vector3[]>([]);
  const trail2HistoryRef = useRef<THREE.Vector3[]>([]);

  // Main Three.js setup effect
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814); // Deep Navy Space
    scene.fog = new THREE.FogExp2(0x040814, 0.0006);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    camera.position.set(0, 45, 60);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 1500;
    controls.target.set(0, 0, 0);

    // 4. Subtle Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight1.position.set(100, 150, 100);
    scene.add(sunLight1);

    const sunLight2 = new THREE.DirectionalLight(0x88bbff, 1.0);
    sunLight2.position.set(-100, -100, -100);
    scene.add(sunLight2);

    // 5. Deep Space Starfield
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 600 + Math.random() * 800;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      // Star color variation (blue-white to warm amber)
      const colRand = Math.random();
      if (colRand > 0.8) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
      } else if (colRand > 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 0.6;
      } else {
        const b = 0.6 + Math.random() * 0.4;
        starColors[i * 3] = b; starColors[i * 3 + 1] = b; starColors[i * 3 + 2] = b;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Reference Polar & Cartesian Grid
    const gridGroup = new THREE.Group();
    const polarGrid = new THREE.PolarGridHelper(80, 16, 8, 64, 0x1e3a8a, 0x172554);
    polarGrid.position.y = -0.05;
    gridGroup.add(polarGrid);

    // Subtle axes lines
    const axisMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.35 });
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-100, 0, 0), new THREE.Vector3(100, 0, 0),
      new THREE.Vector3(0, 0, -100), new THREE.Vector3(0, 0, 100),
    ]);
    const axisLines = new THREE.LineSegments(axisGeo, axisMat);
    gridGroup.add(axisLines);
    scene.add(gridGroup);

    // 7. Barycenter Marker
    const barycenterGroup = new THREE.Group();
    // Inner glowing sphere
    const bcCoreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const bcCoreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const bcCore = new THREE.Mesh(bcCoreGeo, bcCoreMat);
    barycenterGroup.add(bcCore);

    // Outer ring
    const ringGeo = new THREE.RingGeometry(0.8, 0.95, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const bcRing = new THREE.Mesh(ringGeo, ringMat);
    barycenterGroup.add(bcRing);

    // Crosshair lines
    const chMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const chGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.4, 0, 0), new THREE.Vector3(1.4, 0, 0),
      new THREE.Vector3(0, -1.4, 0), new THREE.Vector3(0, 1.4, 0),
      new THREE.Vector3(0, 0, -1.4), new THREE.Vector3(0, 0, 1.4),
    ]);
    const chLines = new THREE.LineSegments(chGeo, chMat);
    barycenterGroup.add(chLines);
    scene.add(barycenterGroup);

    // 8. Celestial Body 1 (Blue Primary)
    const body1Group = new THREE.Group();
    const body1Geo = new THREE.SphereGeometry(1, 32, 32);
    const body1Mat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.2,
    });
    const body1Mesh = new THREE.Mesh(body1Geo, body1Mat);
    body1Group.add(body1Mesh);

    // Atmosphere Glow Shell
    const glow1Geo = new THREE.SphereGeometry(1.22, 32, 32);
    const glow1Mat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const glow1Mesh = new THREE.Mesh(glow1Geo, glow1Mat);
    body1Group.add(glow1Mesh);
    scene.add(body1Group);

    // 9. Celestial Body 2 (Orange Secondary)
    const body2Group = new THREE.Group();
    const body2Geo = new THREE.SphereGeometry(1, 32, 32);
    const body2Mat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xc2410c,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.2,
    });
    const body2Mesh = new THREE.Mesh(body2Geo, body2Mat);
    body2Group.add(body2Mesh);

    // Atmosphere Glow Shell
    const glow2Geo = new THREE.SphereGeometry(1.22, 32, 32);
    const glow2Mat = new THREE.MeshBasicMaterial({
      color: 0xfb923c,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const glow2Mesh = new THREE.Mesh(glow2Geo, glow2Mat);
    body2Group.add(glow2Mesh);
    scene.add(body2Group);

    // 10. Trajectory Trails (Dynamic BufferGeometry)
    const trail1Positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const trail1Geo = new THREE.BufferGeometry();
    trail1Geo.setAttribute('position', new THREE.BufferAttribute(trail1Positions, 3));
    const trail1Mat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });
    const trail1Line = new THREE.Line(trail1Geo, trail1Mat);
    scene.add(trail1Line);

    const trail2Positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const trail2Geo = new THREE.BufferGeometry();
    trail2Geo.setAttribute('position', new THREE.BufferAttribute(trail2Positions, 3));
    const trail2Mat = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });
    const trail2Line = new THREE.Line(trail2Geo, trail2Mat);
    scene.add(trail2Line);

    // 11. Mutual Distance Line
    const distLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const distLineMat = new THREE.LineDashedMaterial({
      color: 0x94a3b8,
      dashSize: 0.8,
      gapSize: 0.6,
      transparent: true,
      opacity: 0.45,
    });
    const distanceLine = new THREE.Line(distLineGeo, distLineMat);
    distanceLine.computeLineDistances();
    scene.add(distanceLine);

    // 12. Vector Helpers (Velocity & Force)
    const v1Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0x10b981, 1, 0.5); // Emerald Green
    const v2Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0x10b981, 1, 0.5);
    scene.add(v1Arrow);
    scene.add(v2Arrow);

    const f1Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0xf43f5e, 1, 0.5); // Rose Red
    const f2Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0xf43f5e, 1, 0.5);
    scene.add(f1Arrow);
    scene.add(f2Arrow);

    // 13. Collision Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.6, 32);
    shockwaveGeo.rotateX(Math.PI / 2);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    scene.add(shockwave);
    let shockwaveScale = 1;

    // Helper to map SI position to scene coordinate
    const toSceneCoords = (pos: Vector3D, scale: number): THREE.Vector3 => {
      // OrbitLab coordinates: SI x -> 3D X, SI y -> 3D Z, SI z -> 3D Y (equatorial plane in X-Z)
      return new THREE.Vector3(pos.x * scale, pos.z * scale, pos.y * scale);
    };

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const timeElapsed = clock.getElapsedTime();
      const current = stateRef.current;
      const pState = current.physicsState;
      const dScale = current.distanceScale;
      const rScale = current.bodyRadiusScale;

      const [b1, b2] = pState.bodies;
      const p1 = toSceneCoords(b1.position, dScale);
      const p2 = toSceneCoords(b2.position, dScale);
      const pBary = toSceneCoords(pState.barycenter.position, dScale);

      // Body 1 updates
      body1Group.position.copy(p1);
      const r1Visual = Math.max(0.6, Math.min(6.0, b1.radius * dScale * rScale));
      body1Group.scale.set(r1Visual, r1Visual, r1Visual);
      body1Group.rotation.y += delta * 0.4;

      // Body 2 updates
      body2Group.position.copy(p2);
      const r2Visual = Math.max(0.6, Math.min(6.0, b2.radius * dScale * rScale));
      body2Group.scale.set(r2Visual, r2Visual, r2Visual);
      body2Group.rotation.y += delta * 0.6;

      // Barycenter pulse animation
      barycenterGroup.position.copy(pBary);
      barycenterGroup.visible = current.showBarycenter;
      const pulse = 1 + 0.15 * Math.sin(timeElapsed * 4);
      bcRing.scale.set(pulse, pulse, pulse);

      // Grid toggle
      gridGroup.visible = current.showGrid;

      // Mutual distance line
      if (current.showDistanceLine) {
        distanceLine.visible = true;
        const positions = distLineGeo.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, p1.x, p1.y, p1.z);
        positions.setXYZ(1, p2.x, p2.y, p2.z);
        positions.needsUpdate = true;
        distanceLine.computeLineDistances();
      } else {
        distanceLine.visible = false;
      }

      // Trajectory Trails update
      if (current.showTrails) {
        trail1Line.visible = true;
        trail2Line.visible = true;

        const maxPts = Math.min(current.trailLength, MAX_TRAIL_POINTS);
        const t1 = trail1HistoryRef.current;
        const t2 = trail2HistoryRef.current;

        // Push new point if moved sufficiently
        const last1 = t1.length > 0 ? t1[t1.length - 1] : null;
        if (!last1 || last1.distanceToSquared(p1) > 0.002) {
          t1.push(p1.clone());
          if (t1.length > maxPts) t1.shift();
        }

        const last2 = t2.length > 0 ? t2[t2.length - 1] : null;
        if (!last2 || last2.distanceToSquared(p2) > 0.002) {
          t2.push(p2.clone());
          if (t2.length > maxPts) t2.shift();
        }

        // Update trail 1 buffer
        const posAttr1 = trail1Geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < t1.length; i++) {
          posAttr1.setXYZ(i, t1[i].x, t1[i].y, t1[i].z);
        }
        trail1Geo.setDrawRange(0, t1.length);
        posAttr1.needsUpdate = true;

        // Update trail 2 buffer
        const posAttr2 = trail2Geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < t2.length; i++) {
          posAttr2.setXYZ(i, t2[i].x, t2[i].y, t2[i].z);
        }
        trail2Geo.setDrawRange(0, t2.length);
        posAttr2.needsUpdate = true;
      } else {
        trail1Line.visible = false;
        trail2Line.visible = false;
      }

      // Velocity vectors
      if (current.showVelocityVectors) {
        v1Arrow.visible = true;
        v2Arrow.visible = true;

        const v1Len = vec3.length(b1.velocity);
        const v2Len = vec3.length(b2.velocity);

        // Map velocity direction to scene coords (x -> X, z -> Y, y -> Z)
        if (v1Len > 1e-4) {
          const v1Dir = new THREE.Vector3(b1.velocity.x, b1.velocity.z, b1.velocity.y).normalize();
          v1Arrow.setDirection(v1Dir);
          v1Arrow.position.copy(p1);
          const arrowLen1 = Math.min(14, Math.max(2.5, Math.log10(v1Len + 1) * 2.2));
          v1Arrow.setLength(arrowLen1, arrowLen1 * 0.28, arrowLen1 * 0.16);
        } else {
          v1Arrow.visible = false;
        }

        if (v2Len > 1e-4) {
          const v2Dir = new THREE.Vector3(b2.velocity.x, b2.velocity.z, b2.velocity.y).normalize();
          v2Arrow.setDirection(v2Dir);
          v2Arrow.position.copy(p2);
          const arrowLen2 = Math.min(14, Math.max(2.5, Math.log10(v2Len + 1) * 2.2));
          v2Arrow.setLength(arrowLen2, arrowLen2 * 0.28, arrowLen2 * 0.16);
        } else {
          v2Arrow.visible = false;
        }
      } else {
        v1Arrow.visible = false;
        v2Arrow.visible = false;
      }

      // Gravitational Force vectors (pointing along mutual line of centers)
      if (current.showForceVectors) {
        f1Arrow.visible = true;
        f2Arrow.visible = true;

        // Force on 1 is directed towards 2
        const dir1To2 = new THREE.Vector3().subVectors(p2, p1);
        const dist = dir1To2.length();

        if (dist > 0.01) {
          dir1To2.normalize();
          f1Arrow.setDirection(dir1To2);
          f1Arrow.position.copy(p1);

          const dir2To1 = dir1To2.clone().negate();
          f2Arrow.setDirection(dir2To1);
          f2Arrow.position.copy(p2);

          const fMag = pState.forceMagnitude;
          const arrowLen = Math.min(12, Math.max(2.5, Math.log10(fMag + 1) * 0.45));
          f1Arrow.setLength(arrowLen, arrowLen * 0.28, arrowLen * 0.16);
          f2Arrow.setLength(arrowLen, arrowLen * 0.28, arrowLen * 0.16);
        }
      } else {
        f1Arrow.visible = false;
        f2Arrow.visible = false;
      }

      // Collision animation handling
      if (pState.isColliding) {
        shockwave.visible = true;
        shockwave.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
        shockwaveScale += delta * 6;
        if (shockwaveScale > 15) shockwaveScale = 1;
        shockwave.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        shockwaveMat.opacity = Math.max(0, 1 - shockwaveScale / 15);
      } else {
        shockwave.visible = false;
        shockwaveScale = 1;
      }

      // Camera Focus & Tracking
      if (current.cameraFocus === 'barycenter') {
        controls.target.lerp(pBary, 0.08);
      } else if (current.cameraFocus === 'body1') {
        controls.target.lerp(p1, 0.08);
      } else if (current.cameraFocus === 'body2') {
        controls.target.lerp(p2, 0.08);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Store references on mount element for reset trigger
    (container as any).__orbitCamera = camera;
    (container as any).__orbitControls = controls;
    (container as any).__clearTrails = () => {
      trail1HistoryRef.current = [];
      trail2HistoryRef.current = [];
    };

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      body1Geo.dispose();
      body1Mat.dispose();
      glow1Geo.dispose();
      glow1Mat.dispose();
      body2Geo.dispose();
      body2Mat.dispose();
      glow2Geo.dispose();
      glow2Mat.dispose();
      trail1Geo.dispose();
      trail1Mat.dispose();
      trail2Geo.dispose();
      trail2Mat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle camera reset or trail clear trigger
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const controls = (container as any).__orbitControls as OrbitControls | undefined;
    const camera = (container as any).__orbitCamera as THREE.PerspectiveCamera | undefined;
    const clearTrails = (container as any).__clearTrails as (() => void) | undefined;

    if (resetCameraTrigger && controls && camera) {
      camera.position.set(0, 45, 60);
      controls.target.set(0, 0, 0);
      controls.update();
      if (clearTrails) clearTrails();
    }
  }, [resetCameraTrigger]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
