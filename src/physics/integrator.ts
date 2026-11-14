// ORBITLAB — Kick-Drift-Kick Velocity Verlet Numerical Integrator
// Second-order, time-reversible, symplectic integration scheme

import type { CelestialBody, Vector3D } from './physics-types';
import { calculateGravitationalInteraction } from './gravity';
import { vec3 } from './vector3';

export interface VerletStepResult {
  body1: CelestialBody;
  body2: CelestialBody;
  a1: Vector3D;
  a2: Vector3D;
  forceMagnitude: number;
  distance: number;
  potentialEnergy: number;
}

/**
 * Advances both bodies by a fixed timestep h using the Velocity Verlet algorithm.
 *
 * r(t + h) = r(t) + v(t)*h + 0.5*a(t)*h²
 * v(t + h/2) = v(t) + 0.5*a(t)*h
 * a(t + h) = evaluateGravity(r(t + h))
 * v(t + h) = v(t + h/2) + 0.5*a(t + h)*h
 */
export function integrateVelocityVerlet(
  body1: CelestialBody,
  body2: CelestialBody,
  h: number,
  cachedA1?: Vector3D,
  cachedA2?: Vector3D
): VerletStepResult {
  // If accelerations are not cached, calculate them at current positions
  let a1_curr = cachedA1;
  let a2_curr = cachedA2;
  if (!a1_curr || !a2_curr) {
    const currentGravity = calculateGravitationalInteraction(body1, body2);
    a1_curr = currentGravity.acceleration1;
    a2_curr = currentGravity.acceleration2;
  }

  const halfH = 0.5 * h;
  const halfHSq = 0.5 * h * h;

  // 1. Update positions: r_new = r + v*h + 0.5*a*h²
  const r1_next = vec3.add(
    vec3.add(body1.position, vec3.scale(body1.velocity, h)),
    vec3.scale(a1_curr, halfHSq)
  );
  const r2_next = vec3.add(
    vec3.add(body2.position, vec3.scale(body2.velocity, h)),
    vec3.scale(a2_curr, halfHSq)
  );

  // Half-step velocities: v_half = v + 0.5*a*h
  const v1_half = vec3.addScaled(body1.velocity, a1_curr, halfH);
  const v2_half = vec3.addScaled(body2.velocity, a2_curr, halfH);

  // 2. Evaluate accelerations at new positions r_next
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

  const nextGravity = calculateGravitationalInteraction(tempBody1, tempBody2);
  const a1_next = nextGravity.acceleration1;
  const a2_next = nextGravity.acceleration2;

  // 3. Final velocity update: v_next = v_half + 0.5*a_next*h
  const v1_next = vec3.addScaled(v1_half, a1_next, halfH);
  const v2_next = vec3.addScaled(v2_half, a2_next, halfH);

  return {
    body1: {
      ...body1,
      position: r1_next,
      velocity: v1_next,
      acceleration: a1_next,
    },
    body2: {
      ...body2,
      position: r2_next,
      velocity: v2_next,
      acceleration: a2_next,
    },
    a1: a1_next,
    a2: a2_next,
    forceMagnitude: nextGravity.forceMagnitude,
    distance: nextGravity.distance,
    potentialEnergy: nextGravity.potentialEnergy,
  };
}
