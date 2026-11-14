// ORBITLAB — Celestial System Presets Library
// Scientifically consistent initial conditions with explicit academic model notes

import type { CelestialBody } from '../physics/physics-types';
import {
  ASTRONOMICAL_UNIT,
  EARTH_MASS,
  EARTH_MOON_DISTANCE,
  EARTH_RADIUS,
  MOON_MASS,
  MOON_RADIUS,
  SOLAR_MASS,
  SOLAR_RADIUS,
} from '../physics/constants';
import { generateBarycentricInitialState } from './initial-conditions';

export interface PresetSystem {
  id: string;
  name: string;
  category: string;
  description: string;
  academicNotes: string;
  assumptions: string;
  body1: CelestialBody;
  body2: CelestialBody;
  defaultDt: number;          // integration step in seconds
  defaultTimeScale: number;   // simulation speed multiplier
  defaultSubsteps: number;    // substeps per frame
  cameraDistance: number;     // 3D camera distance
  distanceScale: number;      // meters to scene units
  bodyRadiusScale: number;    // visual exaggeration multiplier for radius display
}

// 1. Earth-Moon System
const earthMoonBodies = generateBarycentricInitialState({
  mass1: EARTH_MASS,
  mass2: MOON_MASS,
  radius1: EARTH_RADIUS,
  radius2: MOON_RADIUS,
  separation: EARTH_MOON_DISTANCE,
  speedFactor: 1.0, // circularized equivalent
  name1: 'Earth',
  name2: 'Moon',
  color1: '#3B82F6',
  color2: '#F97316',
});

// 2. Sun-Earth System
const sunEarthBodies = generateBarycentricInitialState({
  mass1: SOLAR_MASS,
  mass2: EARTH_MASS,
  radius1: SOLAR_RADIUS,
  radius2: EARTH_RADIUS,
  separation: ASTRONOMICAL_UNIT,
  speedFactor: 1.0,
  name1: 'Sun',
  name2: 'Earth',
  color1: '#F97316',
  color2: '#3B82F6',
});

// 3. Binary Stars (General unequal mass)
const binaryStarsBodies = generateBarycentricInitialState({
  mass1: SOLAR_MASS * 1.5,
  mass2: SOLAR_MASS * 0.9,
  radius1: SOLAR_RADIUS * 1.2,
  radius2: SOLAR_RADIUS * 0.9,
  separation: 0.8 * ASTRONOMICAL_UNIT,
  speedFactor: 1.0,
  name1: 'Star Primary (1.5 M☉)',
  name2: 'Star Secondary (0.9 M☉)',
  color1: '#3B82F6',
  color2: '#FB923C',
});

// 4. Equal-Mass Binary System
const equalBinaryBodies = generateBarycentricInitialState({
  mass1: SOLAR_MASS,
  mass2: SOLAR_MASS,
  radius1: SOLAR_RADIUS,
  radius2: SOLAR_RADIUS,
  separation: ASTRONOMICAL_UNIT,
  speedFactor: 1.0,
  name1: 'Star Alpha (1.0 M☉)',
  name2: 'Star Beta (1.0 M☉)',
  color1: '#3B82F6',
  color2: '#F97316',
});

// 5. Highly Elliptical Orbit (e = 0.75)
// At periapsis, speed is sqrt((mu/r_p) * (1 + e)) = v_circ * sqrt(1 + e)
const ellipticalBodies = generateBarycentricInitialState({
  mass1: SOLAR_MASS,
  mass2: 1e22, // light dwarf body
  radius1: SOLAR_RADIUS,
  radius2: 1e6,
  separation: 0.25 * ASTRONOMICAL_UNIT, // periapsis distance
  speedFactor: Math.sqrt(1 + 0.75), // produces e = 0.75
  name1: 'Central Star',
  name2: 'Comet (e = 0.75)',
  color1: '#F97316',
  color2: '#60A5FA',
});

// 6. Escape Trajectory / Hyperbolic Slingshot (e = 1.35)
// Specific orbital energy epsilon > 0, speed exceeds sqrt(2) * v_circ
const escapeBodies = generateBarycentricInitialState({
  mass1: SOLAR_MASS,
  mass2: 5e4, // probe
  radius1: SOLAR_RADIUS,
  radius2: 50,
  separation: 0.4 * ASTRONOMICAL_UNIT,
  speedFactor: 1.6, // > sqrt(2) ≈ 1.414, produces hyperbolic escape
  name1: 'Heavy Star',
  name2: 'Escape Probe (e > 1)',
  color1: '#F97316',
  color2: '#3B82F6',
});

export const PRESET_LIBRARY: PresetSystem[] = [
  {
    id: 'earth-moon',
    name: 'Earth–Moon System',
    category: 'Solar System',
    description: 'The terrestrial planet and its natural satellite in a mutual orbit around their common barycenter.',
    academicNotes: 'Notice that the barycenter is located ~4,671 km from Earth’s center, which is inside Earth’s physical mantle (radius 6,371 km). The Moon completes its orbit in ~27.3 sidereal days.',
    assumptions: 'Idealized isolated 2-body system. Solar tidal perturbations, Moon’s orbital inclination (5.14°), and Earth oblateness (J2) are omitted.',
    body1: earthMoonBodies[0],
    body2: earthMoonBodies[1],
    defaultDt: 900, // 15 min steps
    defaultTimeScale: 200000,
    defaultSubsteps: 8,
    cameraDistance: 60,
    distanceScale: 50 / EARTH_MOON_DISTANCE,
    bodyRadiusScale: 500,
  },
  {
    id: 'sun-earth',
    name: 'Sun–Earth System',
    category: 'Solar System',
    description: 'A 1 Solar-mass star and a 1 Earth-mass planet in a 1 AU annual orbit.',
    academicNotes: 'Due to the 333,000:1 mass ratio, the barycenter lies just ~450 km from the Sun’s core (deep inside the 696,340 km solar radius). Earth completes 1 revolution in 365.25 days.',
    assumptions: 'Modeled as an isolated circularized 2-body system. Other solar system planets are omitted.',
    body1: sunEarthBodies[0],
    body2: sunEarthBodies[1],
    defaultDt: 3600, // 1 hour step
    defaultTimeScale: 5000000,
    defaultSubsteps: 8,
    cameraDistance: 70,
    distanceScale: 50 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 200,
  },
  {
    id: 'binary-stars',
    name: 'Binary Stars (Unequal Mass)',
    category: 'Astrophysics',
    description: 'Two stars (1.5 M☉ and 0.9 M☉) executing mutual Keplerian orbits around their shared barycenter.',
    academicNotes: 'Demonstrates unequal orbital radii: the lighter star travels along a larger circle with higher linear speed, while the heavier star moves along a smaller inner circle.',
    assumptions: 'Point mass gravitational interaction. Stellar mass-loss, tidal friction, and relativistic effects are not modeled.',
    body1: binaryStarsBodies[0],
    body2: binaryStarsBodies[1],
    defaultDt: 3600,
    defaultTimeScale: 5000000,
    defaultSubsteps: 8,
    cameraDistance: 70,
    distanceScale: 50 / (0.8 * ASTRONOMICAL_UNIT),
    bodyRadiusScale: 25,
  },
  {
    id: 'equal-binary',
    name: 'Equal-Mass Binary System',
    category: 'Astrophysics',
    description: 'Two identical solar-mass stars in a symmetric gravitational orbit with zero net momentum.',
    academicNotes: 'Both bodies describe identical circular orbits about the central barycenter at (0, 0, 0). Linear momentum is identically zero in this frame.',
    assumptions: 'Spherical point masses with zero internal deformation.',
    body1: equalBinaryBodies[0],
    body2: equalBinaryBodies[1],
    defaultDt: 3600,
    defaultTimeScale: 5000000,
    defaultSubsteps: 8,
    cameraDistance: 70,
    distanceScale: 50 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 25,
  },
  {
    id: 'elliptical-orbit',
    name: 'Elliptical Orbit (e = 0.75)',
    category: 'Academic Dynamics',
    description: 'An eccentric Keplerian ellipse demonstrating Vis-Viva energy exchange and Kepler’s 2nd Law.',
    academicNotes: 'Demonstrates the conservation of angular momentum (equal areas in equal times). The body accelerates drastically at periapsis and lingers far at apoapsis.',
    assumptions: 'Isolated point-mass gravity with zero non-gravitational outgassing or radiation pressure.',
    body1: ellipticalBodies[0],
    body2: ellipticalBodies[1],
    defaultDt: 600,
    defaultTimeScale: 2500000,
    defaultSubsteps: 16,
    cameraDistance: 85,
    distanceScale: 40 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 100000,
  },
  {
    id: 'escape-trajectory',
    name: 'Escape Trajectory (Hyperbolic)',
    category: 'Orbital Transfers',
    description: 'An unbound hyperbolic flyby (e > 1, E > 0) displaying gravitational slingshot deflection.',
    academicNotes: 'Because total mechanical energy E > 0, the body possesses excess hyperbolic speed at infinity v_inf = sqrt(2 * epsilon). The trajectory is an open hyperbola.',
    assumptions: 'Frame centered at initial system center-of-mass.',
    body1: escapeBodies[0],
    body2: escapeBodies[1],
    defaultDt: 600,
    defaultTimeScale: 1500000,
    defaultSubsteps: 12,
    cameraDistance: 85,
    distanceScale: 40 / ASTRONOMICAL_UNIT,
    bodyRadiusScale: 200000,
  },
];
