// ORBITLAB — Celestial System Presets & Initial Conditions
// Scientifically consistent orbital parameters with honest academic approximation labels.

import type { PresetDefinition } from '../types/physics';
import {
  ASTRONOMICAL_UNIT,
  EARTH_MASS,
  EARTH_MOON_DISTANCE,
  EARTH_RADIUS,
  G_CONSTANT,
  MOON_MASS,
  MOON_RADIUS,
  SOLAR_MASS,
  SOLAR_RADIUS,
} from './constants';
import { vec3 } from './vector3';

/**
 * Computes barycentric initial conditions for two masses along the X axis
 * with perpendicular velocity along the Y axis for a specified eccentricity.
 */
export function computeBarycentricInitialConditions(
  m1: number,
  m2: number,
  separation: number,
  eccentricity: number = 0,
  _r1: number = 1e6,
  _r2: number = 1e6,
  inclinationDeg: number = 0
) {
  const totalMass = m1 + m2;
  const mu = G_CONSTANT * totalMass;

  // Center of mass offsets along X axis
  // Body 1 is at -x1, Body 2 is at +x2 such that x1 * m1 = x2 * m2
  const x1 = (m2 / totalMass) * separation;
  const x2 = (m1 / totalMass) * separation;

  // Semi-major axis: if starting at periapsis: r_p = a * (1 - e) => a = separation / (1 - e)
  // For e = 0: a = separation, v_rel = sqrt(mu / a)
  // At periapsis: v_rel = sqrt(mu * (2/separation - 1/a)) = sqrt((mu/separation) * (1 + e))
  const vRel = Math.sqrt((mu / separation) * (1 + eccentricity));

  // Velocities apportioned by mass to ensure zero net linear momentum
  const v1 = (m2 / totalMass) * vRel;
  const v2 = (m1 / totalMass) * vRel;

  // Apply orbital inclination (rotation about X axis)
  const incRad = (inclinationDeg * Math.PI) / 180;
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  return {
    body1: {
      position: vec3.create(-x1, 0, 0),
      velocity: vec3.create(0, -v1 * cosInc, -v1 * sinInc),
    },
    body2: {
      position: vec3.create(x2, 0, 0),
      velocity: vec3.create(0, v2 * cosInc, v2 * sinInc),
    },
  };
}

export const PRESETS: PresetDefinition[] = [
  {
    id: 'earth-moon',
    name: 'Earth–Moon System',
    category: 'Solar System',
    description: 'The terrestrial planet and its natural satellite in a near-circular mutual orbit.',
    academicContext: 'ME 206 Statics & Dynamics: Notice that the barycenter is located ~4,671 km from Earth’s center, meaning it lies inside the Earth’s physical mantle (radius 6,371 km). Earth visibly wobbles as the Moon completes its 27.3-day sidereal period.',
    approximationNotes: 'Approximations: Modeled as an isolated two-body system with point-mass Newtonian gravity. Solar tidal perturbations, lunar orbital inclination (5.14°), and Earth oblateness (J2) are omitted for pedagogical clarity.',
    body1: {
      name: 'Earth',
      mass: EARTH_MASS,
      radius: EARTH_RADIUS,
      position: vec3.create(-(MOON_MASS / (EARTH_MASS + MOON_MASS)) * EARTH_MOON_DISTANCE, 0, 0),
      velocity: vec3.create(0, -(MOON_MASS / (EARTH_MASS + MOON_MASS)) * Math.sqrt((G_CONSTANT * (EARTH_MASS + MOON_MASS)) / EARTH_MOON_DISTANCE), 0),
      color: '#3B82F6', // Blue
    },
    body2: {
      name: 'Moon',
      mass: MOON_MASS,
      radius: MOON_RADIUS,
      position: vec3.create((EARTH_MASS / (EARTH_MASS + MOON_MASS)) * EARTH_MOON_DISTANCE, 0, 0),
      velocity: vec3.create(0, (EARTH_MASS / (EARTH_MASS + MOON_MASS)) * Math.sqrt((G_CONSTANT * (EARTH_MASS + MOON_MASS)) / EARTH_MOON_DISTANCE), 0),
      color: '#F97316', // Orange
    },
    defaultDt: 900, // 15 min steps
    defaultSubsteps: 8,
    defaultTimeScale: 200000, // fast enough to see 27-day orbit in ~10 seconds
    cameraDistance: 60,
    distanceScale: 50 / EARTH_MOON_DISTANCE,
    bodyRadiusScale: 500, // Visual boost so small moon is visible in 384,000 km space
  },
  {
    id: 'binary-stars',
    name: 'Symmetric Binary Stars',
    category: 'Astrophysics',
    description: 'Two stars of equal solar mass performing a synchronized gravitational orbital waltz.',
    academicContext: 'Classical two-body problem where m₁ = m₂. Both bodies describe concentric circular orbits of identical radius around their central barycenter at exactly (0, 0, 0).',
    approximationNotes: 'Approximations: Spherical mass distribution with zero tidal friction, zero mass-loss via stellar wind, and neglecting general relativistic frame dragging.',
    body1: {
      name: 'Alpha Primary',
      mass: SOLAR_MASS,
      radius: SOLAR_RADIUS,
      position: vec3.create(-0.5 * ASTRONOMICAL_UNIT, 0, 0),
      velocity: vec3.create(0, -Math.sqrt((G_CONSTANT * SOLAR_MASS) / (2 * ASTRONOMICAL_UNIT)), 0),
      color: '#3B82F6',
    },
    body2: {
      name: 'Beta Secondary',
      mass: SOLAR_MASS,
      radius: SOLAR_RADIUS,
      position: vec3.create(0.5 * ASTRONOMICAL_UNIT, 0, 0),
      velocity: vec3.create(0, Math.sqrt((G_CONSTANT * SOLAR_MASS) / (2 * ASTRONOMICAL_UNIT)), 0),
      color: '#F97316',
    },
    defaultDt: 3600, // 1 hour step
    defaultSubsteps: 8,
    defaultTimeScale: 5000000,
    cameraDistance: 70,
    distanceScale: 50 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 25,
  },
  {
    id: 'sun-jupiter',
    name: 'Sun–Jupiter System',
    category: 'Solar System',
    description: 'A star with an extreme mass ratio (1047:1) gas giant.',
    academicContext: 'Because Jupiter is so massive (~317.8 Earth masses), the system barycenter is positioned ~742,000 km from the Sun’s core, which is ~46,000 km outside the Sun’s photosphere! This barycenter wobble is the exact mechanism used in radial velocity exoplanet detection.',
    approximationNotes: 'Approximations: Other solar system planets are omitted; orbital eccentricity set to mean 0.0485 circularized equivalent.',
    body1: {
      name: 'Sun',
      mass: SOLAR_MASS,
      radius: SOLAR_RADIUS,
      position: vec3.create(-(1.898e27 / (SOLAR_MASS + 1.898e27)) * (5.204 * ASTRONOMICAL_UNIT), 0, 0),
      velocity: vec3.create(0, -(1.898e27 / (SOLAR_MASS + 1.898e27)) * 13070, 0),
      color: '#F97316',
    },
    body2: {
      name: 'Jupiter',
      mass: 1.898e27,
      radius: 6.9911e7,
      position: vec3.create((SOLAR_MASS / (SOLAR_MASS + 1.898e27)) * (5.204 * ASTRONOMICAL_UNIT), 0, 0),
      velocity: vec3.create(0, (SOLAR_MASS / (SOLAR_MASS + 1.898e27)) * 13070, 0),
      color: '#3B82F6',
    },
    defaultDt: 7200,
    defaultSubsteps: 10,
    defaultTimeScale: 15000000,
    cameraDistance: 80,
    distanceScale: 50 / (5.204 * ASTRONOMICAL_UNIT),
    bodyRadiusScale: 100,
  },
  {
    id: 'eccentric-comet',
    name: 'Highly Eccentric Orbit (e = 0.85)',
    category: 'Academic Dynamics',
    description: 'An elongated Keplerian ellipse demonstrating extreme velocity variation and Kepler’s 2nd Law.',
    academicContext: 'ME 206 Dynamics: Demonstrates the Vis-Viva equation v² = GM(2/r - 1/a). At periapsis, the body accelerates dramatically as gravitational potential energy converts into kinetic energy; at apoapsis, it slows down to a crawl.',
    approximationNotes: 'Approximations: Non-gravitational outgassing jet forces and solar radiation pressure are omitted.',
    body1: {
      name: 'Central Star',
      mass: SOLAR_MASS,
      radius: SOLAR_RADIUS,
      position: vec3.create(0, 0, 0),
      velocity: vec3.create(0, 0, 0),
      color: '#F97316',
    },
    body2: {
      name: 'Comet Halley-type',
      mass: 2.2e14,
      radius: 5.5e3,
      position: vec3.create(0.15 * ASTRONOMICAL_UNIT, 0, 0), // Periapsis for a=1.0 AU, e=0.85
      velocity: vec3.create(0, 54500, 0), // periapsis speed
      color: '#60A5FA',
    },
    defaultDt: 900,
    defaultSubsteps: 16,
    defaultTimeScale: 2500000,
    cameraDistance: 85,
    distanceScale: 40 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 200000,
  },
  {
    id: 'hyperbolic-flyby',
    name: 'Hyperbolic Escape / Gravity Slingshot',
    category: 'Orbital Transfers',
    description: 'An unbound trajectory (e = 1.45, E > 0) bending around a massive primary before escaping.',
    academicContext: 'ME 206 Dynamics: When specific orbital energy ε > 0, the body possesses excess hyperbolic speed v_inf = sqrt(2ε). The trajectory is an open hyperbola with turning angle δ = 2 * arcsin(1/e).',
    approximationNotes: 'Approximations: Frame of reference centered at initial barycenter.',
    body1: {
      name: 'Heavy Primary',
      mass: SOLAR_MASS,
      radius: SOLAR_RADIUS,
      position: vec3.create(0, 0, 0),
      velocity: vec3.create(0, 0, 0),
      color: '#F97316',
    },
    body2: {
      name: 'Interstellar Probe',
      mass: 5e3,
      radius: 10,
      position: vec3.create(0.3 * ASTRONOMICAL_UNIT, -1.2 * ASTRONOMICAL_UNIT, 0),
      velocity: vec3.create(0, 68000, 0),
      color: '#3B82F6',
    },
    defaultDt: 600,
    defaultSubsteps: 12,
    defaultTimeScale: 1500000,
    cameraDistance: 85,
    distanceScale: 40 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 300000,
  },
];
