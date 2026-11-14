// ORBITLAB — Centre of Mass and Barycenter Kinematics
// R_cm = (m1*r1 + m2*r2) / (m1 + m2)
// V_cm = (m1*v1 + m2*v2) / (m1 + m2)

import type { CelestialBody, Vector3D } from './physics-types';
import { vec3 } from './vector3';

export interface BarycenterResult {
  position: Vector3D;
  velocity: Vector3D;
  totalMass: number;
}

export function calculateBarycenter(
  body1: CelestialBody,
  body2: CelestialBody
): BarycenterResult {
  const totalMass = body1.mass + body2.mass;

  const m1r1 = vec3.scale(body1.position, body1.mass);
  const m2r2 = vec3.scale(body2.position, body2.mass);
  const position = vec3.scale(vec3.add(m1r1, m2r2), 1 / totalMass);

  const m1v1 = vec3.scale(body1.velocity, body1.mass);
  const m2v2 = vec3.scale(body2.velocity, body2.mass);
  const velocity = vec3.scale(vec3.add(m1v1, m2v2), 1 / totalMass);

  return {
    position,
    velocity,
    totalMass,
  };
}

/**
 * Transforms bodies into the zero-momentum Centre-of-Mass rest frame.
 * Positions are shifted relative to R_cm and velocities relative to V_cm.
 */
export function transformToCenterOfMassFrame(
  body1: CelestialBody,
  body2: CelestialBody
): { body1: CelestialBody; body2: CelestialBody } {
  const bc = calculateBarycenter(body1, body2);

  return {
    body1: {
      ...body1,
      position: vec3.sub(body1.position, bc.position),
      velocity: vec3.sub(body1.velocity, bc.velocity),
    },
    body2: {
      ...body2,
      position: vec3.sub(body2.position, bc.position),
      velocity: vec3.sub(body2.velocity, bc.velocity),
    },
  };
}
