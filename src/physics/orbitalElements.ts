// Analytical Orbital Mechanics & Keplerian Orbit Elements

import type { CelestialBody, OrbitParameters, OrbitType } from '../types/physics';
import { G_CONSTANT } from './constants';
import { vec3 } from './vector3';

export function calculateOrbitalParameters(
  body1: CelestialBody,
  body2: CelestialBody
): OrbitParameters {
  const m1 = body1.mass;
  const m2 = body2.mass;
  const totalMass = m1 + m2;
  const muStd = G_CONSTANT * totalMass; // Standard gravitational parameter (m³/s²)

  // Relative position and velocity of body 2 relative to body 1
  const rVec = vec3.sub(body2.position, body1.position);
  const vVec = vec3.sub(body2.velocity, body1.velocity);

  const r = vec3.length(rVec);
  const vSq = vec3.lengthSq(vVec);

  // Check physical collision
  const isColliding = r <= (body1.radius + body2.radius);

  // Specific relative angular momentum: h = r x v
  const hVec = vec3.cross(rVec, vVec);
  const h = vec3.length(hVec);

  // Specific orbital energy: epsilon = v²/2 - mu/r
  const epsilon = 0.5 * vSq - (muStd / Math.max(r, 1e-6));

  // Eccentricity vector: e_vec = (v x h) / mu - r_hat
  const vCrossH = vec3.cross(vVec, hVec);
  const rHat = r > 0 ? vec3.scale(rVec, 1 / r) : vec3.create();
  const eVec = vec3.sub(vec3.scale(vCrossH, 1 / muStd), rHat);
  const e = vec3.length(eVec);

  // Semi-major axis: a = -mu / (2 * epsilon)
  let a = 0;
  let orbitalPeriod = Infinity;
  let periapsis = 0;
  let apoapsis = Infinity;
  let orbitType: OrbitType = 'elliptical';

  if (isColliding) {
    orbitType = 'colliding';
  } else if (e < 0.01) {
    orbitType = 'circular';
  } else if (e < 0.999) {
    orbitType = 'elliptical';
  } else if (Math.abs(e - 1.0) <= 0.005) {
    orbitType = 'parabolic';
  } else {
    orbitType = 'hyperbolic';
  }

  if (Math.abs(epsilon) > 1e-12) {
    a = -muStd / (2 * epsilon);
  }

  // Semi-latus rectum: p = h² / mu
  const p = (h * h) / muStd;

  if (e < 1.0) {
    // Bound orbit
    periapsis = a * (1 - e);
    apoapsis = a * (1 + e);
    if (a > 0) {
      orbitalPeriod = 2 * Math.PI * Math.sqrt((a * a * a) / muStd);
    }
  } else {
    // Unbound orbit (hyperbolic or parabolic)
    periapsis = p / (1 + e);
    apoapsis = Infinity;
    orbitalPeriod = Infinity;
  }

  // True Anomaly: angle between periapsis (eVec) and current position (rVec)
  let trueAnomaly = 0;
  if (e > 1e-6 && r > 0) {
    const cosNu = Math.max(-1, Math.min(1, vec3.dot(eVec, rVec) / (e * r)));
    trueAnomaly = Math.acos(cosNu);
    // If r · v < 0, true anomaly is in range (pi, 2pi)
    if (vec3.dot(rVec, vVec) < 0) {
      trueAnomaly = 2 * Math.PI - trueAnomaly;
    }
  }

  // Expected speed via Vis-Viva equation: v² = mu * (2/r - 1/a)
  let visVivaExpectedV = 0;
  if (a !== 0) {
    const term = (2 / Math.max(r, 1e-6)) - (1 / a);
    if (term >= 0) {
      visVivaExpectedV = Math.sqrt(muStd * term);
    }
  }

  return {
    semiMajorAxis: a,
    eccentricity: e,
    eccentricityVector: eVec,
    specificOrbitalEnergy: epsilon,
    specificAngularMomentum: h,
    orbitalPeriod,
    apoapsis,
    periapsis,
    trueAnomaly,
    orbitType,
    visVivaExpectedV,
  };
}
