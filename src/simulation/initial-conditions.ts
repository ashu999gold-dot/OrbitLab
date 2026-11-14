// ORBITLAB — Initial Conditions & Cartesian Solver
// Translates simple intuitive orbital parameters into rigorous 3D state vectors

import type { CelestialBody, Vector3D } from '../physics/physics-types';
import { G_CONSTANT } from '../physics/constants';
import { vec3 } from '../physics/vector3';

export interface SimpleOrbitInput {
  mass1: number;          // kg
  mass2: number;          // kg
  radius1: number;        // m
  radius2: number;        // m
  separation: number;     // m (initial distance)
  speedFactor: number;    // multiplier of circular orbital speed (1.0 = circular, > 1.414 = escape)
  launchAngleDeg?: number;// in-plane angle relative to tangential (0 = tangential, 90 = radial outwards)
  inclinationDeg?: number;// orbital plane tilt about X axis (0 to 90 deg)
  name1?: string;
  name2?: string;
  color1?: string;
  color2?: string;
}

/**
 * Calculates standard circular orbital velocity v_circ = sqrt(G * (m1 + m2) / r)
 */
export function calculateCircularVelocity(m1: number, m2: number, separation: number): number {
  const totalMass = Math.max(1, m1 + m2);
  const r = Math.max(1e-3, separation);
  return Math.sqrt((G_CONSTANT * totalMass) / r);
}

/**
 * Calculates parabolic escape velocity v_esc = sqrt(2 * G * (m1 + m2) / r)
 */
export function calculateEscapeVelocity(m1: number, m2: number, separation: number): number {
  return Math.SQRT2 * calculateCircularVelocity(m1, m2, separation);
}

/**
 * Generates initial state vectors in the zero-momentum Center-of-Mass frame:
 * - Body 1 is placed at -x1 on X axis, Body 2 at +x2 on X axis (x1*m1 = x2*m2).
 * - Relative velocity is vRel.
 * - Velocities are allocated inversely proportional to mass so total momentum P = 0.
 */
export function generateBarycentricInitialState(input: SimpleOrbitInput): [CelestialBody, CelestialBody] {
  const m1 = Math.max(1, input.mass1);
  const m2 = Math.max(1, input.mass2);
  const totalM = m1 + m2;
  const sep = Math.max(1e-3, input.separation);

  // Position offsets along X axis from Barycenter (0,0,0)
  const x1 = (m2 / totalM) * sep;
  const x2 = (m1 / totalM) * sep;

  const pos1: Vector3D = vec3.create(-x1, 0, 0);
  const pos2: Vector3D = vec3.create(x2, 0, 0);

  // Base circular velocity
  const vCirc = calculateCircularVelocity(m1, m2, sep);
  const vRelMag = vCirc * Math.max(0, input.speedFactor);

  // Velocity orientation in orbital plane
  const angleRad = ((input.launchAngleDeg || 0) * Math.PI) / 180;
  // Tangential component along Y, radial component along X
  const vRelX = vRelMag * Math.sin(angleRad);
  const vRelY = vRelMag * Math.cos(angleRad);
  const vRelZ = 0;

  // Apply 3D orbital inclination (tilt about X axis)
  const incRad = ((input.inclinationDeg || 0) * Math.PI) / 180;
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  const vRelRotated: Vector3D = {
    x: vRelX,
    y: vRelY * cosInc - vRelZ * sinInc,
    z: vRelY * sinInc + vRelZ * cosInc,
  };

  // Apportion velocities to ensure total linear momentum P = m1*v1 + m2*v2 = 0
  const v1 = vec3.scale(vRelRotated, -(m2 / totalM));
  const v2 = vec3.scale(vRelRotated, m1 / totalM);

  const body1: CelestialBody = {
    id: 'b1',
    name: input.name1 || 'Primary Body',
    category: 'planet',
    mass: m1,
    radius: Math.max(1, input.radius1),
    position: pos1,
    velocity: v1,
    acceleration: vec3.create(),
    color: input.color1 || '#3B82F6',
  };

  const body2: CelestialBody = {
    id: 'b2',
    name: input.name2 || 'Secondary Body',
    category: 'satellite',
    mass: m2,
    radius: Math.max(1, input.radius2),
    position: pos2,
    velocity: v2,
    acceleration: vec3.create(),
    color: input.color2 || '#F97316',
  };

  return [body1, body2];
}
