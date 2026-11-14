// ORBITLAB — Relative Orbital Mechanics & Conic Classification
// Handles non-degenerate Keplerian orbits and degenerate radial trajectories

import type { CelestialBody, OrbitParameters, OrbitType } from './physics-types';
import { G_CONSTANT } from './constants';
import { vec3 } from './vector3';

export function calculateRelativeOrbitParameters(
  body1: CelestialBody,
  body2: CelestialBody
): OrbitParameters {
  const m1 = body1.mass;
  const m2 = body2.mass;
  const totalMass = m1 + m2;
  const mu = G_CONSTANT * totalMass; // Standard gravitational parameter (m³/s²)

  // Relative state: Body 2 with respect to Body 1
  const rRel = vec3.sub(body2.position, body1.position);
  const vRel = vec3.sub(body2.velocity, body1.velocity);

  const r = vec3.length(rRel);
  const vSq = vec3.lengthSq(vRel);

  // Physical collision check
  const isColliding = r <= (body1.radius + body2.radius);

  // Specific relative angular momentum: h = r x v
  const hVec = vec3.cross(rRel, vRel);
  const h = vec3.length(hVec);

  // Specific orbital energy: epsilon = v²/2 - mu/r
  const epsilon = 0.5 * vSq - (mu / Math.max(r, 1e-3));

  // Check for degenerate radial trajectory:
  // If h is negligible compared to characteristic angular momentum sqrt(mu * r)
  const characteristicH = Math.sqrt(mu * Math.max(r, 1e-3));
  const isDegenerate = h < 1e-5 * characteristicH || h < 1e-8;

  let semiMajorAxis = 0;
  let eccentricity = 0;
  let eccentricityVector = vec3.create();
  let orbitalPeriod = Infinity;
  let periapsis = 0;
  let apoapsis = Infinity;
  let trueAnomaly = 0;
  let orbitType: OrbitType = 'elliptical';
  let visVivaExpectedV = 0;

  if (isColliding) {
    orbitType = 'colliding';
  } else if (isDegenerate) {
    // Pure radial motion (head-on collision course or straight-line radial escape)
    orbitType = 'radial';
    eccentricity = 1.0;
    eccentricityVector = r > 0 ? vec3.normalize(rRel) : vec3.create(1, 0, 0);
    periapsis = 0;
    apoapsis = epsilon < 0 ? -mu / (2 * epsilon) : Infinity;
    semiMajorAxis = epsilon !== 0 ? -mu / (2 * epsilon) : Infinity;
    orbitalPeriod = (epsilon < 0 && semiMajorAxis > 0)
      ? Math.PI * Math.sqrt((semiMajorAxis * semiMajorAxis * semiMajorAxis) / mu)
      : Infinity;
  } else {
    // Standard non-degenerate Keplerian conic section
    // Eccentricity vector: e_vec = (v x h) / mu - r_hat
    const vCrossH = vec3.cross(vRel, hVec);
    const rHat = r > 0 ? vec3.scale(rRel, 1 / r) : vec3.create();
    eccentricityVector = vec3.sub(vec3.scale(vCrossH, 1 / mu), rHat);
    eccentricity = vec3.length(eccentricityVector);

    // Semi-major axis: a = -mu / (2 * epsilon)
    if (Math.abs(epsilon) > 1e-14) {
      semiMajorAxis = -mu / (2 * epsilon);
    }

    // Semi-latus rectum: p = h² / mu
    const p = (h * h) / mu;

    // Orbit classification based on energy and eccentricity
    if (eccentricity < 0.01) {
      orbitType = 'circular';
    } else if (eccentricity < 0.999 && epsilon < 0) {
      orbitType = 'elliptical';
    } else if (Math.abs(eccentricity - 1.0) <= 0.005 || Math.abs(epsilon) < 1e-12) {
      orbitType = 'parabolic';
    } else {
      orbitType = 'hyperbolic';
    }

    if (eccentricity < 1.0) {
      // Bound elliptical orbit
      periapsis = semiMajorAxis * (1 - eccentricity);
      apoapsis = semiMajorAxis * (1 + eccentricity);
      if (semiMajorAxis > 0) {
        orbitalPeriod = 2 * Math.PI * Math.sqrt((semiMajorAxis * semiMajorAxis * semiMajorAxis) / mu);
      }
    } else {
      // Unbound parabolic or hyperbolic orbit
      periapsis = p / (1 + eccentricity);
      apoapsis = Infinity;
      orbitalPeriod = Infinity;
    }

    // True anomaly
    if (eccentricity > 1e-6 && r > 0) {
      const cosNu = Math.max(-1, Math.min(1, vec3.dot(eccentricityVector, rRel) / (eccentricity * r)));
      trueAnomaly = Math.acos(cosNu);
      if (vec3.dot(rRel, vRel) < 0) {
        trueAnomaly = 2 * Math.PI - trueAnomaly;
      }
    }

    // Expected speed via Vis-Viva equation: v² = mu * (2/r - 1/a)
    if (semiMajorAxis !== 0) {
      const term = (2 / Math.max(r, 1e-3)) - (1 / semiMajorAxis);
      if (term >= 0) {
        visVivaExpectedV = Math.sqrt(mu * term);
      }
    }
  }

  return {
    semiMajorAxis,
    eccentricity,
    eccentricityVector,
    specificOrbitalEnergy: epsilon,
    specificAngularMomentum: h,
    specificAngularMomentumVec: hVec,
    orbitalPeriod,
    apoapsis,
    periapsis,
    trueAnomaly,
    orbitType,
    visVivaExpectedV,
    isDegenerate,
  };
}
