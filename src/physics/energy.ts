// ORBITLAB — Mechanical Energy Calculations (SI Units: Joules)
// K1 = 0.5*m1*|v1|², K2 = 0.5*m2*|v2|², U = -G*m1*m2/r, E = K + U

import type { CelestialBody } from './physics-types';
import { G_CONSTANT } from './constants';
import { vec3 } from './vector3';

export interface MechanicalEnergyResult {
  kinetic1: number;       // J
  kinetic2: number;       // J
  totalKinetic: number;   // J
  potential: number;      // J
  totalMechanical: number;// J
}

export function calculateMechanicalEnergy(
  body1: CelestialBody,
  body2: CelestialBody,
  distanceOverride?: number
): MechanicalEnergyResult {
  const v1Sq = vec3.lengthSq(body1.velocity);
  const v2Sq = vec3.lengthSq(body2.velocity);

  const k1 = 0.5 * body1.mass * v1Sq;
  const k2 = 0.5 * body2.mass * v2Sq;
  const totalK = k1 + k2;

  const distance = distanceOverride !== undefined
    ? Math.max(distanceOverride, 1e-3)
    : Math.max(vec3.distance(body1.position, body2.position), 1e-3);

  const potential = -(G_CONSTANT * body1.mass * body2.mass) / distance;
  const totalE = totalK + potential;

  return {
    kinetic1: k1,
    kinetic2: k2,
    totalKinetic: totalK,
    potential,
    totalMechanical: totalE,
  };
}
