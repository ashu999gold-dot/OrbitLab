// ORBITLAB — Two-Body Gravitational Physics Engine
// Implements symplectic Velocity Verlet integration, conservation tracking,
// barycenter kinematics, and analytical orbital metrics.

import type { CelestialBody, PhysicsState, Vector3D } from '../types/physics';
import { G_CONSTANT } from './constants';
import { calculateOrbitalParameters } from './orbitalElements';
import { vec3 } from './vector3';

export interface ComputeAccelerationsResult {
  a1: Vector3D;
  a2: Vector3D;
  forceOn1: Vector3D;
  forceOn2: Vector3D;
  forceMagnitude: number;
  distance: number;
  isColliding: boolean;
}

/**
 * Computes instantaneous Newtonian gravitational forces and accelerations
 * for two celestial bodies in 3D space.
 */
export function computeGravitationalAccelerations(
  body1: CelestialBody,
  body2: CelestialBody
): ComputeAccelerationsResult {
  // r12 points from Body 1 to Body 2
  const r12 = vec3.sub(body2.position, body1.position);
  const distanceSq = vec3.lengthSq(r12);
  const distance = Math.sqrt(distanceSq);

  const contactDistance = body1.radius + body2.radius;
  const isColliding = distance <= contactDistance;

  // Numerical safeguard for extreme singularities: clamp to minimum 1 meter or radius
  const effectiveDistance = Math.max(distance, 1e-3);
  const effectiveDistanceCube = effectiveDistance * effectiveDistance * effectiveDistance;

  // F_mag = G * m1 * m2 / r²
  const forceMagnitude = (G_CONSTANT * body1.mass * body2.mass) / (effectiveDistance * effectiveDistance);

  // Force on Body 1 towards Body 2: F_21 = (G * m1 * m2 / r³) * r12
  const fMultiplier1 = (G_CONSTANT * body1.mass * body2.mass) / effectiveDistanceCube;
  const forceOn1 = vec3.scale(r12, fMultiplier1);

  // Force on Body 2 is equal and opposite (Newton's 3rd Law): F_12 = -F_21
  const forceOn2 = vec3.scale(forceOn1, -1);

  // Acceleration of Body 1: a1 = F_21 / m1 = (G * m2 / r³) * r12
  const a1 = vec3.scale(r12, (G_CONSTANT * body2.mass) / effectiveDistanceCube);

  // Acceleration of Body 2: a2 = F_12 / m2 = -(G * m1 / r³) * r12
  const a2 = vec3.scale(r12, -(G_CONSTANT * body1.mass) / effectiveDistanceCube);

  return {
    a1,
    a2,
    forceOn1,
    forceOn2,
    forceMagnitude,
    distance,
    isColliding,
  };
}

/**
 * Computes all kinematic and thermodynamic conservation quantities:
 * Kinetic Energy, Potential Energy, Total Energy, Linear & Angular Momentum,
 * Center of Mass (Barycenter).
 */
export function computeConservationQuantities(
  body1: CelestialBody,
  body2: CelestialBody,
  time: number,
  stepCount: number,
  initialEnergy?: number,
  initialAngularMomentum?: number
): PhysicsState {
  const m1 = body1.mass;
  const m2 = body2.mass;
  const totalMass = m1 + m2;

  // Center of Mass (Barycenter)
  const barycenterPos = vec3.scale(
    vec3.add(vec3.scale(body1.position, m1), vec3.scale(body2.position, m2)),
    1 / totalMass
  );
  const barycenterVel = vec3.scale(
    vec3.add(vec3.scale(body1.velocity, m1), vec3.scale(body2.velocity, m2)),
    1 / totalMass
  );

  // Distance & Relative Velocity
  const rVec = vec3.sub(body2.position, body1.position);
  const vVec = vec3.sub(body2.velocity, body1.velocity);
  const distance = vec3.length(rVec);
  const relativeVelocity = vec3.length(vVec);

  // Kinetic Energy: T = 0.5 * m1 * v1² + 0.5 * m2 * v2²
  const v1Sq = vec3.lengthSq(body1.velocity);
  const v2Sq = vec3.lengthSq(body2.velocity);
  const kineticEnergy = 0.5 * m1 * v1Sq + 0.5 * m2 * v2Sq;

  // Potential Energy: U = - G * m1 * m2 / r
  const effectiveR = Math.max(distance, 1e-3);
  const potentialEnergy = -(G_CONSTANT * m1 * m2) / effectiveR;

  // Total Mechanical Energy: E = T + U
  const totalEnergy = kineticEnergy + potentialEnergy;

  // Total Linear Momentum: P = m1 * v1 + m2 * v2
  const p1 = vec3.scale(body1.velocity, m1);
  const p2 = vec3.scale(body2.velocity, m2);
  const totalLinearMomentum = vec3.add(p1, p2);
  const linearMomentumMagnitude = vec3.length(totalLinearMomentum);

  // Total Angular Momentum: L = m1 * (r1 x v1) + m2 * (r2 x v2)
  const r1CrossV1 = vec3.cross(body1.position, body1.velocity);
  const r2CrossV2 = vec3.cross(body2.position, body2.velocity);
  const totalAngularMomentum = vec3.add(
    vec3.scale(r1CrossV1, m1),
    vec3.scale(r2CrossV2, m2)
  );
  const angularMomentumMagnitude = vec3.length(totalAngularMomentum);

  // Force magnitude
  const forceMagnitude = (G_CONSTANT * m1 * m2) / (effectiveR * effectiveR);

  // Collision flag
  const isColliding = distance <= (body1.radius + body2.radius);

  // Conservation errors
  const initE = initialEnergy !== undefined ? initialEnergy : totalEnergy;
  const initL = initialAngularMomentum !== undefined ? initialAngularMomentum : angularMomentumMagnitude;

  const energyConservationError = Math.abs(initE) > 1e-12
    ? Math.abs(totalEnergy - initE) / Math.abs(initE)
    : 0;

  const angularMomentumError = Math.abs(initL) > 1e-12
    ? Math.abs(angularMomentumMagnitude - initL) / Math.abs(initL)
    : 0;

  // Orbit elements
  const orbitParameters = calculateOrbitalParameters(body1, body2);

  return {
    time,
    stepCount,
    bodies: [
      { ...body1, position: vec3.clone(body1.position), velocity: vec3.clone(body1.velocity) },
      { ...body2, position: vec3.clone(body2.position), velocity: vec3.clone(body2.velocity) },
    ],
    barycenter: {
      position: barycenterPos,
      velocity: barycenterVel,
    },
    distance,
    relativeVelocity,
    forceMagnitude,
    kineticEnergy,
    potentialEnergy,
    totalEnergy,
    totalLinearMomentum,
    linearMomentumMagnitude,
    totalAngularMomentum,
    angularMomentumMagnitude,
    initialTotalEnergy: initE,
    initialAngularMomentumMag: initL,
    energyConservationError,
    angularMomentumError,
    isColliding,
    orbitParameters,
  };
}

/**
 * Performs a single symplectic Velocity Verlet step with size dt:
 * 1. v(t + dt/2) = v(t) + 0.5 * a(t) * dt
 * 2. r(t + dt)   = r(t) + v(t + dt/2) * dt
 * 3. compute a(t + dt) using updated positions
 * 4. v(t + dt)   = v(t + dt/2) + 0.5 * a(t + dt) * dt
 */
export function stepVelocityVerlet(
  body1: CelestialBody,
  body2: CelestialBody,
  dt: number,
  cachedA1?: Vector3D,
  cachedA2?: Vector3D
): { body1: CelestialBody; body2: CelestialBody; a1: Vector3D; a2: Vector3D } {
  // Compute initial accelerations if not cached
  let a1_0 = cachedA1;
  let a2_0 = cachedA2;
  if (!a1_0 || !a2_0) {
    const acc0 = computeGravitationalAccelerations(body1, body2);
    a1_0 = acc0.a1;
    a2_0 = acc0.a2;
  }

  const halfDt = 0.5 * dt;

  // 1. Half-step velocities
  const v1_half = vec3.addScaled(body1.velocity, a1_0, halfDt);
  const v2_half = vec3.addScaled(body2.velocity, a2_0, halfDt);

  // 2. Full-step positions
  const r1_next = vec3.addScaled(body1.position, v1_half, dt);
  const r2_next = vec3.addScaled(body2.position, v2_half, dt);

  // Create temporary updated bodies for new acceleration evaluation
  const tempBody1: CelestialBody = {
    ...body1,
    position: r1_next,
    velocity: v1_half,
  };
  const tempBody2: CelestialBody = {
    ...body2,
    position: r2_next,
    velocity: v2_half,
  };

  // 3. New accelerations at r(t + dt)
  const acc1 = computeGravitationalAccelerations(tempBody1, tempBody2);
  const a1_next = acc1.a1;
  const a2_next = acc1.a2;

  // 4. Final velocities: v(t + dt) = v_half + 0.5 * a_next * dt
  const v1_next = vec3.addScaled(v1_half, a1_next, halfDt);
  const v2_next = vec3.addScaled(v2_half, a2_next, halfDt);

  return {
    body1: {
      ...body1,
      position: r1_next,
      velocity: v1_next,
    },
    body2: {
      ...body2,
      position: r2_next,
      velocity: v2_next,
    },
    a1: a1_next,
    a2: a2_next,
  };
}

/**
 * Advanced Physics Integrator Class
 * Encapsulates state, sub-stepping, pause/step logic, and historical telemetry.
 */
export class TwoBodySimulator {
  private body1: CelestialBody;
  private body2: CelestialBody;
  private time: number = 0;
  private stepCount: number = 0;
  private initialTotalEnergy: number = 0;
  private initialAngularMomentumMag: number = 0;
  private cachedA1?: Vector3D;
  private cachedA2?: Vector3D;
  private isCollided: boolean = false;

  constructor(body1: CelestialBody, body2: CelestialBody) {
    this.body1 = { ...body1, position: vec3.clone(body1.position), velocity: vec3.clone(body1.velocity) };
    this.body2 = { ...body2, position: vec3.clone(body2.position), velocity: vec3.clone(body2.velocity) };
    this.resetConservationBaselines();
  }

  public resetConservationBaselines(): void {
    const state = computeConservationQuantities(this.body1, this.body2, this.time, this.stepCount);
    this.initialTotalEnergy = state.totalEnergy;
    this.initialAngularMomentumMag = state.angularMomentumMagnitude;
    this.isCollided = state.isColliding;
    this.cachedA1 = undefined;
    this.cachedA2 = undefined;
  }

  public reset(body1: CelestialBody, body2: CelestialBody): void {
    this.body1 = { ...body1, position: vec3.clone(body1.position), velocity: vec3.clone(body1.velocity) };
    this.body2 = { ...body2, position: vec3.clone(body2.position), velocity: vec3.clone(body2.velocity) };
    this.time = 0;
    this.stepCount = 0;
    this.resetConservationBaselines();
  }

  /**
   * Advances the simulation by totalDt, subdivided into `substeps` for numerical stability.
   */
  public advance(totalDt: number, substeps: number = 10, stopOnCollision: boolean = true): PhysicsState {
    if (stopOnCollision && this.isCollided) {
      return this.getState();
    }

    const n = Math.max(1, Math.floor(substeps));
    const subDt = totalDt / n;

    for (let i = 0; i < n; i++) {
      const stepResult = stepVelocityVerlet(this.body1, this.body2, subDt, this.cachedA1, this.cachedA2);
      this.body1 = stepResult.body1;
      this.body2 = stepResult.body2;
      this.cachedA1 = stepResult.a1;
      this.cachedA2 = stepResult.a2;

      this.time += subDt;
      this.stepCount++;

      // Check collision
      const dist = vec3.distance(this.body1.position, this.body2.position);
      if (dist <= (this.body1.radius + this.body2.radius)) {
        this.isCollided = true;
        if (stopOnCollision) {
          break;
        }
      }
    }

    return this.getState();
  }

  public getState(): PhysicsState {
    return computeConservationQuantities(
      this.body1,
      this.body2,
      this.time,
      this.stepCount,
      this.initialTotalEnergy,
      this.initialAngularMomentumMag
    );
  }

  public getBodies(): [CelestialBody, CelestialBody] {
    return [this.body1, this.body2];
  }

  public setBodies(b1: CelestialBody, b2: CelestialBody): void {
    this.body1 = { ...b1, position: vec3.clone(b1.position), velocity: vec3.clone(b1.velocity) };
    this.body2 = { ...b2, position: vec3.clone(b2.position), velocity: vec3.clone(b2.velocity) };
    this.cachedA1 = undefined;
    this.cachedA2 = undefined;
    this.resetConservationBaselines();
  }

  public getTime(): number {
    return this.time;
  }
}
