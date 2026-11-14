// ORBITLAB — Simulation Engine
// Decoupled from React and Three.js. Manages state, step integration, conservation baselines, and collision logic.

import type { CelestialBody, CollisionState, SystemState, Vector3D } from '../physics/physics-types';
import { calculateBarycenter } from '../physics/barycenter';
import { checkCollision } from '../physics/collision';
import { calculateMechanicalEnergy } from '../physics/energy';
import { calculateGravitationalInteraction } from '../physics/gravity';
import { integrateVelocityVerlet } from '../physics/integrator';
import { calculateSystemMomentum } from '../physics/momentum';
import { calculateRelativeOrbitParameters } from '../physics/orbital-elements';
import { vec3 } from '../physics/vector3';

export class SimulationEngine {
  private body1: CelestialBody;
  private body2: CelestialBody;
  private time: number = 0;
  private stepCount: number = 0;
  private cachedA1?: Vector3D;
  private cachedA2?: Vector3D;
  private initialEnergy: number = 0;
  private initialLinearMomentum: Vector3D = vec3.create();
  private initialAngularMomentum: Vector3D = vec3.create();
  private initialAngularMomentumMag: number = 0;
  private collisionState: CollisionState;

  constructor(body1: CelestialBody, body2: CelestialBody) {
    this.body1 = { ...body1, position: vec3.clone(body1.position), velocity: vec3.clone(body1.velocity) };
    this.body2 = { ...body2, position: vec3.clone(body2.position), velocity: vec3.clone(body2.velocity) };
    this.collisionState = checkCollision(this.body1, this.body2, 0);
    this.resetConservationBaselines();
  }

  public resetConservationBaselines(): void {
    const energy = calculateMechanicalEnergy(this.body1, this.body2);
    const momentum = calculateSystemMomentum(this.body1, this.body2);

    this.initialEnergy = energy.totalMechanical;
    this.initialLinearMomentum = vec3.clone(momentum.linearMomentum);
    this.initialAngularMomentum = vec3.clone(momentum.angularMomentum);
    this.initialAngularMomentumMag = momentum.angularMomentumMagnitude;

    this.cachedA1 = undefined;
    this.cachedA2 = undefined;
    this.collisionState = checkCollision(this.body1, this.body2, this.time);
  }

  public reset(body1: CelestialBody, body2: CelestialBody, time: number = 0): void {
    this.body1 = { ...body1, position: vec3.clone(body1.position), velocity: vec3.clone(body1.velocity) };
    this.body2 = { ...body2, position: vec3.clone(body2.position), velocity: vec3.clone(body2.velocity) };
    this.time = time;
    this.stepCount = 0;
    this.resetConservationBaselines();
  }

  /**
   * Advances the simulation by a fixed timestep h.
   * If bodies collide, integration stops and records collision telemetry.
   */
  public step(h: number): SystemState {
    if (this.collisionState.isColliding) {
      return this.getState();
    }

    const stepResult = integrateVelocityVerlet(this.body1, this.body2, h, this.cachedA1, this.cachedA2);
    this.body1 = stepResult.body1;
    this.body2 = stepResult.body2;
    this.cachedA1 = stepResult.a1;
    this.cachedA2 = stepResult.a2;

    this.time += h;
    this.stepCount++;

    this.collisionState = checkCollision(this.body1, this.body2, this.time, this.collisionState);

    return this.getState();
  }

  /**
   * Advances the simulation by totalDt, subdivided into `substeps` for numerical stability.
   */
  public advance(totalDt: number, substeps: number = 8): SystemState {
    if (this.collisionState.isColliding) {
      return this.getState();
    }

    const n = Math.max(1, Math.floor(substeps));
    const subH = totalDt / n;

    for (let i = 0; i < n; i++) {
      this.step(subH);
      if (this.collisionState.isColliding) {
        break;
      }
    }

    return this.getState();
  }

  public getState(): SystemState {
    const barycenter = calculateBarycenter(this.body1, this.body2);
    const energy = calculateMechanicalEnergy(this.body1, this.body2);
    const momentum = calculateSystemMomentum(this.body1, this.body2);
    const gravity = calculateGravitationalInteraction(this.body1, this.body2);
    const orbit = calculateRelativeOrbitParameters(this.body1, this.body2);

    const vRel = vec3.length(vec3.sub(this.body2.velocity, this.body1.velocity));

    // Conservation errors
    const energyError = Math.abs(this.initialEnergy) > 1e-12
      ? Math.abs(energy.totalMechanical - this.initialEnergy) / Math.abs(this.initialEnergy)
      : 0;

    const angularMomentumError = this.initialAngularMomentumMag > 1e-12
      ? Math.abs(momentum.angularMomentumMagnitude - this.initialAngularMomentumMag) / this.initialAngularMomentumMag
      : 0;

    return {
      time: this.time,
      stepCount: this.stepCount,
      bodies: [
        { ...this.body1, position: vec3.clone(this.body1.position), velocity: vec3.clone(this.body1.velocity) },
        { ...this.body2, position: vec3.clone(this.body2.position), velocity: vec3.clone(this.body2.velocity) },
      ],
      barycenter: {
        position: barycenter.position,
        velocity: barycenter.velocity,
      },
      distance: gravity.distance,
      relativeVelocity: vRel,
      forceMagnitude: gravity.forceMagnitude,
      kineticEnergy: {
        k1: energy.kinetic1,
        k2: energy.kinetic2,
        total: energy.totalKinetic,
      },
      potentialEnergy: energy.potential,
      totalEnergy: energy.totalMechanical,
      linearMomentum: {
        vector: momentum.linearMomentum,
        magnitude: momentum.linearMomentumMagnitude,
      },
      angularMomentum: {
        vector: momentum.angularMomentum,
        magnitude: momentum.angularMomentumMagnitude,
      },
      orbit,
      collision: this.collisionState,
      conservation: {
        initialEnergy: this.initialEnergy,
        currentEnergy: energy.totalMechanical,
        energyError,
        initialLinearMomentum: this.initialLinearMomentum,
        currentLinearMomentum: momentum.linearMomentum,
        linearMomentumMagnitude: momentum.linearMomentumMagnitude,
        initialAngularMomentum: this.initialAngularMomentum,
        currentAngularMomentum: momentum.angularMomentum,
        angularMomentumMagnitude: momentum.angularMomentumMagnitude,
        angularMomentumError,
      },
    };
  }

  public getBodies(): [CelestialBody, CelestialBody] {
    return [this.body1, this.body2];
  }

  public getTime(): number {
    return this.time;
  }

  public getStepCount(): number {
    return this.stepCount;
  }
}
