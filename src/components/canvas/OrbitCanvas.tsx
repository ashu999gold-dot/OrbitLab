// ORBITLAB — 3D Three.js WebGL Orbital Mechanics Canvas
// Supports Inertial vs Barycentric reference frames, dynamic GPU trails,
// ghost comparison trajectory overlays, vector helpers, and top/side/fit camera views.

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SystemState, Vector3D } from '../../physics/physics-types';
import { ScaleManager, type ReferenceFrameMode } from '../../visualization/ScaleManager';

export type CameraFocusMode = 'barycenter' | 'body1' | 'body2' | 'free';
export type CameraPresetView = 'isometric' | 'top' | 'side';

interface OrbitCanvasProps {
  systemState: SystemState;
  distanceScale: number;
  bodyRadiusScale: number;
  enableExaggeratedRadius: boolean;
  referenceFrame: ReferenceFrameMode;
  cameraFocus: CameraFocusMode;
  showTrails: boolean;
  showComparisonOverlay: boolean;
  comparisonTrail1?: Vector3D[];
  comparisonTrail2?: Vector3D[];
  showVelocityVectors: boolean;
  showForceVectors: boolean;
  showBarycenter: boolean;
  showGrid: boolean;
  showDistanceLine: boolean;
  trailLength: number;
  resetCameraTrigger?: number;
  cameraViewTrigger?: CameraPresetView;
}

const MAX_TRAIL_POINTS = 3000;

export const OrbitCanvas: React.FC<OrbitCanvasProps> = ({
  systemState,
  distanceScale,
  bodyRadiusScale,
  enableExaggeratedRadius,
  referenceFrame,
  cameraFocus,
  showTrails,
  showComparisonOverlay,
  comparisonTrail1,
  comparisonTrail2,
  showVelocityVectors,
  showForceVectors,
  showBarycenter,
  showGrid,
  showDistanceLine,
  trailLength,
  resetCameraTrigger,
  cameraViewTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Maintain ScaleManager instance
  const scaleManagerRef = useRef<ScaleManager>(
    new ScaleManager({
      distanceScale,
      radiusScaleMultiplier: bodyRadiusScale,
      enableExaggeratedRadius,
      referenceFrame,
    })
  );

  // Sync scale manager config
  useEffect(() => {
    scaleManagerRef.current.setDistanceScale(distanceScale);
    scaleManagerRef.current.setRadiusMultiplier(bodyRadiusScale);
    scaleManagerRef.current.setExaggeratedRadius(enableExaggeratedRadius);
    scaleManagerRef.current.setReferenceFrame(referenceFrame);
  }, [distanceScale, bodyRadiusScale, enableExaggeratedRadius, referenceFrame]);

  // Current state ref for animation loop
  const stateRef = useRef({
    systemState,
    cameraFocus,
    showTrails,
    showComparisonOverlay,
    comparisonTrail1,
    comparisonTrail2,
    showVelocityVectors,
    showForceVectors,
    showBarycenter,
    showGrid,
    showDistanceLine,
    trailLength,
  });

  useEffect(() => {
    stateRef.current = {
      systemState,
      cameraFocus,
      showTrails,
      showComparisonOverlay,
      comparisonTrail1,
      comparisonTrail2,
      showVelocityVectors,
      showForceVectors,
      showBarycenter,
      showGrid,
      showDistanceLine,
      trailLength,
    };
  }, [
    systemState,
    cameraFocus,
    showTrails,
    showComparisonOverlay,
    comparisonTrail1,
    comparisonTrail2,
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

    // 2. WebGL Renderer
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

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight1.position.set(100, 150, 100);
    scene.add(sunLight1);

    const sunLight2 = new THREE.DirectionalLight(0x88bbff, 1.0);
    sunLight2.position.set(-100, -100, -100);
    scene.add(sunLight2);

    // 5. Starfield
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

    // 6. Polar Grid & Coordinate Axes
    const gridGroup = new THREE.Group();
    const polarGrid = new THREE.PolarGridHelper(80, 16, 8, 64, 0x1e3a8a, 0x172554);
    polarGrid.position.y = -0.05;
    gridGroup.add(polarGrid);

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
    const bcCoreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const bcCoreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const bcCore = new THREE.Mesh(bcCoreGeo, bcCoreMat);
    barycenterGroup.add(bcCore);

    const ringGeo = new THREE.RingGeometry(0.8, 0.95, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const bcRing = new THREE.Mesh(ringGeo, ringMat);
    barycenterGroup.add(bcRing);

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
      opacity: 0.85,
    });
    const trail1Line = new THREE.Line(trail1Geo, trail1Mat);
    scene.add(trail1Line);

    const trail2Positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const trail2Geo = new THREE.BufferGeometry();
    trail2Geo.setAttribute('position', new THREE.BufferAttribute(trail2Positions, 3));
    const trail2Mat = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.85,
    });
    const trail2Line = new THREE.Line(trail2Geo, trail2Mat);
    scene.add(trail2Line);

    // 11. Comparison Ghost Overlay Trails
    const compTrail1Geo = new THREE.BufferGeometry();
    const compTrail1Mat = new THREE.LineDashedMaterial({
      color: 0x60a5fa,
      dashSize: 1.2,
      gapSize: 0.8,
      transparent: true,
      opacity: 0.45,
    });
    const compTrail1Line = new THREE.Line(compTrail1Geo, compTrail1Mat);
    scene.add(compTrail1Line);

    const compTrail2Geo = new THREE.BufferGeometry();
    const compTrail2Mat = new THREE.LineDashedMaterial({
      color: 0xfb923c,
      dashSize: 1.2,
      gapSize: 0.8,
      transparent: true,
      opacity: 0.45,
    });
    const compTrail2Line = new THREE.Line(compTrail2Geo, compTrail2Mat);
    scene.add(compTrail2Line);

    // 12. Mutual Distance Line
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

    // 13. Vector Helpers (Velocity & Force)
    const v1Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0x10b981, 1, 0.5);
    const v2Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0x10b981, 1, 0.5);
    scene.add(v1Arrow);
    scene.add(v2Arrow);

    const f1Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0xf43f5e, 1, 0.5);
    const f2Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0xf43f5e, 1, 0.5);
    scene.add(f1Arrow);
    scene.add(f2Arrow);

    // 14. Collision Shockwave Ring
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

    // Render loop
    let animId: number;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const timeElapsed = (now - startTime) / 1000;
      const current = stateRef.current;
      const sm = scaleManagerRef.current;

      const pState = current.systemState;
      const [b1, b2] = pState.bodies;
      const baryPos = pState.barycenter.position;

      // Transform to Scene Coordinates via ScaleManager
      const p1Raw = sm.toScenePosition(b1.position, baryPos);
      const p2Raw = sm.toScenePosition(b2.position, baryPos);
      const pBaryRaw = sm.toScenePosition(baryPos, baryPos);

      const p1 = new THREE.Vector3(p1Raw.x, p1Raw.y, p1Raw.z);
      const p2 = new THREE.Vector3(p2Raw.x, p2Raw.y, p2Raw.z);
      const pBary = new THREE.Vector3(pBaryRaw.x, pBaryRaw.y, pBaryRaw.z);

      // Reference radius for proportional physical scaling
      const maxPhysicalRadius = Math.max(b1.radius, b2.radius);

      // Body 1 updates
      body1Group.position.copy(p1);
      const r1Visual = sm.toVisualRadius(b1.radius, maxPhysicalRadius);
      body1Group.scale.set(r1Visual, r1Visual, r1Visual);
      body1Group.rotation.y += delta * 0.4;

      // Body 2 updates
      body2Group.position.copy(p2);
      const r2Visual = sm.toVisualRadius(b2.radius, maxPhysicalRadius);
      body2Group.scale.set(r2Visual, r2Visual, r2Visual);
      body2Group.rotation.y += delta * 0.6;

      // Barycenter pulse animation
      barycenterGroup.position.copy(pBary);
      barycenterGroup.visible = current.showBarycenter;
      const pulse = 1 + 0.15 * Math.sin(timeElapsed * 4);
      bcRing.scale.set(pulse, pulse, pulse);

      // Polar grid
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

        const posAttr1 = trail1Geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < t1.length; i++) {
          posAttr1.setXYZ(i, t1[i].x, t1[i].y, t1[i].z);
        }
        trail1Geo.setDrawRange(0, t1.length);
        posAttr1.needsUpdate = true;

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

      // Comparison Ghost Trails Overlay
      if (current.showComparisonOverlay && current.comparisonTrail1 && current.comparisonTrail2) {
        compTrail1Line.visible = true;
        compTrail2Line.visible = true;

        const pts1 = current.comparisonTrail1.map((p) => {
          const sp = sm.toScenePosition(p, baryPos);
          return new THREE.Vector3(sp.x, sp.y, sp.z);
        });
        compTrail1Geo.setFromPoints(pts1);
        compTrail1Line.computeLineDistances();

        const pts2 = current.comparisonTrail2.map((p) => {
          const sp = sm.toScenePosition(p, baryPos);
          return new THREE.Vector3(sp.x, sp.y, sp.z);
        });
        compTrail2Geo.setFromPoints(pts2);
        compTrail2Line.computeLineDistances();
      } else {
        compTrail1Line.visible = false;
        compTrail2Line.visible = false;
      }

      // Velocity vectors (lengths proportional to physical speed ratio)
      if (current.showVelocityVectors) {
        v1Arrow.visible = true;
        v2Arrow.visible = true;

        const v1Len = Math.sqrt(b1.velocity.x ** 2 + b1.velocity.y ** 2 + b1.velocity.z ** 2);
        const v2Len = Math.sqrt(b2.velocity.x ** 2 + b2.velocity.y ** 2 + b2.velocity.z ** 2);
        const vMax = Math.max(v1Len, v2Len, 1e-6);

        if (v1Len > 1e-6) {
          const v1Dir = new THREE.Vector3(b1.velocity.x, b1.velocity.z, b1.velocity.y).normalize();
          v1Arrow.setDirection(v1Dir);
          v1Arrow.position.copy(p1);
          const arrowLen1 = Math.max(1.0, (v1Len / vMax) * 10.0);
          v1Arrow.setLength(arrowLen1, Math.min(arrowLen1 * 0.35, 1.4), Math.min(arrowLen1 * 0.2, 0.7));
        } else {
          v1Arrow.visible = false;
        }

        if (v2Len > 1e-6) {
          const v2Dir = new THREE.Vector3(b2.velocity.x, b2.velocity.z, b2.velocity.y).normalize();
          v2Arrow.setDirection(v2Dir);
          v2Arrow.position.copy(p2);
          const arrowLen2 = Math.max(1.0, (v2Len / vMax) * 10.0);
          v2Arrow.setLength(arrowLen2, Math.min(arrowLen2 * 0.35, 1.4), Math.min(arrowLen2 * 0.2, 0.7));
        } else {
          v2Arrow.visible = false;
        }
      } else {
        v1Arrow.visible = false;
        v2Arrow.visible = false;
      }

      // Force vectors (Newton's 3rd Law: action & reaction have equal magnitude pointing towards each other)
      if (current.showForceVectors) {
        f1Arrow.visible = true;
        f2Arrow.visible = true;

        const dir1To2 = new THREE.Vector3().subVectors(p2, p1);
        const dist = dir1To2.length();

        if (dist > 0.01) {
          dir1To2.normalize();
          f1Arrow.setDirection(dir1To2);
          f1Arrow.position.copy(p1);

          const dir2To1 = dir1To2.clone().negate();
          f2Arrow.setDirection(dir2To1);
          f2Arrow.position.copy(p2);

          // Force arrow length proportional to mutual attraction
          const arrowLen = Math.min(10.0, Math.max(1.8, Math.min(dist * 0.3, 7.5)));
          f1Arrow.setLength(arrowLen, Math.min(arrowLen * 0.35, 1.4), Math.min(arrowLen * 0.2, 0.7));
          f2Arrow.setLength(arrowLen, Math.min(arrowLen * 0.35, 1.4), Math.min(arrowLen * 0.2, 0.7));
        }
      } else {
        f1Arrow.visible = false;
        f2Arrow.visible = false;
      }

      // Collision shockwave
      if (pState.collision.isColliding) {
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

      // Camera Tracking
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

    (container as any).__orbitCamera = camera;
    (container as any).__orbitControls = controls;
    (container as any).__clearTrails = () => {
      trail1HistoryRef.current = [];
      trail2HistoryRef.current = [];
    };

    return () => {
      cancelAnimationFrame(animId);
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
      compTrail1Geo.dispose();
      compTrail1Mat.dispose();
      compTrail2Geo.dispose();
      compTrail2Mat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Camera Reset / Trigger Handler
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

  // Camera Preset View Handler (Isometric, Top, Side)
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !cameraViewTrigger) return;
    const controls = (container as any).__orbitControls as OrbitControls | undefined;
    const camera = (container as any).__orbitCamera as THREE.PerspectiveCamera | undefined;
    if (!controls || !camera) return;

    if (cameraViewTrigger === 'top') {
      camera.position.set(0, 90, 0.001);
      controls.target.set(0, 0, 0);
    } else if (cameraViewTrigger === 'side') {
      camera.position.set(90, 0, 0);
      controls.target.set(0, 0, 0);
    } else {
      camera.position.set(0, 45, 60);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  }, [cameraViewTrigger]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
