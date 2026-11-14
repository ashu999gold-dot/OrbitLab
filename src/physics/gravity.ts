// ORBITLAB — Newtonian Universal Gravitational Interaction
// F = G * m1 * m2 / r², a1 = G * m2 * d / r³, a2 = -G * m1 * d / r³

import type { CelestialBody, Vector3D } from './physics-types';
import { G_CONSTANT } from './constants';
import { vec3 } from './vector3';

export interface GravitationalInteractionResult {
  distance: number;
  direction: Vector3D;      // unit vector from body 1 to body 2
  displacement: Vector3D;   // r2 - r1
  forceMagnitude: number;   // Newtons (N)
  forceOn1: Vector3D;       // N (directed towards body 2)
  forceOn2: Vector3D;       // N (directed towards body 1)
  acceleration1: Vector3D;  // m/s²
  acceleration2: Vector3D;  // m/s²
  potentialEnergy: number;  // Joules (J)
}

/**
 * Computes the gravitational interaction between two point-mass bodies.
 * Uses exact vector difference d = r2 - r1 and enforces Newton's 3rd Law.
 */
export function calculateGravitationalInteraction(
  body1: CelestialBody,
  body2: CelestialBody
): GravitationalInteractionResult {
  const d = vec3.sub(body2.position, body1.position);
  const distance = vec3.length(d);

  // Numerical safeguard for physical center superposition
  const effectiveDistance = Math.max(distance, 1e-3);
  const effectiveDistanceCube = effectiveDistance * effectiveDistance * effectiveDistance;

  // Unit vector from body 1 to body 2
  const direction = distance > 0 ? vec3.scale(d, 1 / distance) : vec3.create(1, 0, 0);

  // F = G * m1 * m2 / r²
  const forceMagnitude = (G_CONSTANT * body1.mass * body2.mass) / (effectiveDistance * effectiveDistance);

  // Force vectors: F21 = (G * m1 * m2 / r³) * d, F12 = -F21
  const forceScale = (G_CONSTANT * body1.mass * body2.mass) / effectiveDistanceCube;
  const forceOn1 = vec3.scale(d, forceScale);
  const forceOn2 = vec3.scale(forceOn1, -1);

  // Accelerations: a1 = G * m2 * d / r³, a2 = -G * m1 * d / r³
  const acceleration1 = vec3.scale(d, (G_CONSTANT * body2.mass) / effectiveDistanceCube);
  const acceleration2 = vec3.scale(d, -(G_CONSTANT * body1.mass) / effectiveDistanceCube);

  // Gravitational Potential Energy: U = - G * m1 * m2 / r
  const potentialEnergy = -(G_CONSTANT * body1.mass * body2.mass) / effectiveDistance;

  return {
    distance,
    direction,
    displacement: d,
    forceMagnitude,
    forceOn1,
    forceOn2,
    acceleration1,
    acceleration2,
    potentialEnergy,
  };
}
