// ORBITLAB — Physical to Visual Scale Manager
// Bridges SI astronomical units to 3D Three.js scene coordinates
// Supports Inertial vs Barycenter-centered reference frames and exaggerated visual radii

import type { Vector3D } from '../physics/physics-types';

export type ReferenceFrameMode = 'inertial' | 'barycentric';

export interface ScaleConfig {
  distanceScale: number;      // Multiplier converting meters to Three.js world units
  radiusScaleMultiplier: number; // Visual magnification factor for physical radii
  enableExaggeratedRadius: boolean;
  referenceFrame: ReferenceFrameMode;
}

export class ScaleManager {
  private config: ScaleConfig;

  constructor(initialConfig?: Partial<ScaleConfig>) {
    this.config = {
      distanceScale: initialConfig?.distanceScale ?? 1e-7,
      radiusScaleMultiplier: initialConfig?.radiusScaleMultiplier ?? 100,
      enableExaggeratedRadius: initialConfig?.enableExaggeratedRadius ?? true,
      referenceFrame: initialConfig?.referenceFrame ?? 'inertial',
    };
  }

  public setDistanceScale(scale: number): void {
    if (scale > 0 && Number.isFinite(scale)) {
      this.config.distanceScale = scale;
    }
  }

  public getDistanceScale(): number {
    return this.config.distanceScale;
  }

  public setRadiusMultiplier(mult: number): void {
    if (mult > 0 && Number.isFinite(mult)) {
      this.config.radiusScaleMultiplier = mult;
    }
  }

  public getRadiusMultiplier(): number {
    return this.config.radiusScaleMultiplier;
  }

  public setExaggeratedRadius(enabled: boolean): void {
    this.config.enableExaggeratedRadius = enabled;
  }

  public isExaggeratedRadius(): boolean {
    return this.config.enableExaggeratedRadius;
  }

  public setReferenceFrame(frame: ReferenceFrameMode): void {
    this.config.referenceFrame = frame;
  }

  public getReferenceFrame(): ReferenceFrameMode {
    return this.config.referenceFrame;
  }

  /**
   * Automatically computes the optimal scene distance scale so the system fits comfortably in the viewport.
   * Target characteristic separation in Three.js units is ~50 units.
   */
  public autoComputeDistanceScale(characteristicSeparationMeters: number): number {
    const safeSep = Math.max(1e3, characteristicSeparationMeters);
    const scale = 50 / safeSep;
    this.config.distanceScale = scale;
    return scale;
  }

  /**
   * Maps an SI position vector in meters to Three.js coordinate space (X, Y, Z).
   * In OrbitLab, equatorial orbital plane is X-Z, vertical elevation is Y:
   * Scene X = SI x * scale
   * Scene Y = SI z * scale
   * Scene Z = SI y * scale
   *
   * If referenceFrame is 'barycentric', subtracts barycenter position from SI coords.
   */
  public toScenePosition(
    siPosition: Vector3D,
    barycenterPosition?: Vector3D
  ): { x: number; y: number; z: number } {
    let effectiveX = siPosition.x;
    let effectiveY = siPosition.y;
    let effectiveZ = siPosition.z;

    if (this.config.referenceFrame === 'barycentric' && barycenterPosition) {
      effectiveX -= barycenterPosition.x;
      effectiveY -= barycenterPosition.y;
      effectiveZ -= barycenterPosition.z;
    }

    const s = this.config.distanceScale;
    return {
      x: effectiveX * s,
      y: effectiveZ * s,
      z: effectiveY * s,
    };
  }

  /**
   * Computes the rendered visual mesh radius in Three.js units.
   * Clamped between a visible minimum (0.5 units) and maximum (7.0 units).
   */
  public toVisualRadius(physicalRadiusMeters: number): number {
    const naturalVisualRadius = physicalRadiusMeters * this.config.distanceScale;
    if (!this.config.enableExaggeratedRadius) {
      return Math.max(0.1, naturalVisualRadius);
    }
    const exaggerated = naturalVisualRadius * this.config.radiusScaleMultiplier;
    return Math.max(0.6, Math.min(6.5, exaggerated));
  }
}
