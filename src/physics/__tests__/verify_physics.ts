// ORBITLAB — Scientific & Numerical Verification Suite
// Validates Newtonian mechanics, symplectic Velocity Verlet integration,
// Kepler's Third Law, Vis-Viva equation, and conservation laws.

import { G_CONSTANT, EARTH_MASS, MOON_MASS, SOLAR_MASS, ASTRONOMICAL_UNIT } from '../constants';
import { TwoBodySimulator } from '../engine';
import { vec3 } from '../vector3';

let failures = 0;
function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}: ${details || 'Condition failed'}`);
    failures++;
  }
}

console.log('====================================================');
console.log('ORBITLAB ME 206 — Physics Engine Verification Suite');
console.log('====================================================\n');

// ----------------------------------------------------------------------------
// Test 1: Analytical Circular Orbit & Kepler's 3rd Law (Equal Binary Stars)
// ----------------------------------------------------------------------------
console.log('Test 1: Symmetric Binary Star Orbit');
{
  const m = SOLAR_MASS;
  const d = ASTRONOMICAL_UNIT; // Separation 1 AU
  const r_orbit = d / 2; // Distance of each star from barycenter
  // For equal masses m separated by d:
  // Gravitational force: F = G * m² / d²
  // Centripetal acceleration: a = v² / (d / 2) = 2 v² / d
  // m * a = F => 2 m v² / d = G m² / d² => v² = G m / (2 d)
  const v_exact = Math.sqrt((G_CONSTANT * m) / (2 * d));
  const period_exact = (2 * Math.PI * r_orbit) / v_exact;

  const star1 = {
    id: 's1',
    name: 'Star Alpha',
    mass: m,
    radius: 7e8,
    position: vec3.create(-r_orbit, 0, 0),
    velocity: vec3.create(0, -v_exact, 0),
    color: '#3b82f6',
  };
  const star2 = {
    id: 's2',
    name: 'Star Beta',
    mass: m,
    radius: 7e8,
    position: vec3.create(r_orbit, 0, 0),
    velocity: vec3.create(0, v_exact, 0),
    color: '#f97316',
  };

  const sim = new TwoBodySimulator(star1, star2);
  const initialState = sim.getState();

  assert(
    Math.abs(initialState.orbitParameters.eccentricity) < 1e-3,
    'Eccentricity is approximately 0 for circular binary',
    `e = ${initialState.orbitParameters.eccentricity}`
  );

  assert(
    vec3.length(initialState.barycenter.position) < 1e-3,
    'Barycenter is at origin (0,0,0)',
    `barycenter = ${JSON.stringify(initialState.barycenter.position)}`
  );

  assert(
    vec3.length(initialState.totalLinearMomentum) < 1e-3,
    'Total initial linear momentum is zero',
    `P = ${vec3.length(initialState.totalLinearMomentum)}`
  );

  // Integrate for 1 full orbital period (~182.6 days)
  const dt = 3600; // 1 hour step
  const totalSteps = Math.round(period_exact / dt);
  const simDt = period_exact / totalSteps;

  for (let s = 0; s < totalSteps; s++) {
    sim.advance(simDt, 10);
  }

  const finalState = sim.getState();
  const relEnergyDrift = Math.abs((finalState.totalEnergy - initialState.totalEnergy) / initialState.totalEnergy);
  const relAngularDrift = Math.abs((finalState.angularMomentumMagnitude - initialState.angularMomentumMagnitude) / initialState.initialAngularMomentumMag);

  assert(
    relEnergyDrift < 1e-5,
    `Symplectic energy conservation after 1 full orbit (< 1e-5)`,
    `Drift = ${relEnergyDrift.toExponential(3)}`
  );

  assert(
    relAngularDrift < 1e-10,
    `Angular momentum conservation after 1 full orbit (< 1e-10)`,
    `Drift = ${relAngularDrift.toExponential(3)}`
  );

  // Check position return after 1 full period
  const finalDistFromInit1 = vec3.distance(finalState.bodies[0].position, star1.position);
  const relClosureError = finalDistFromInit1 / r_orbit;
  assert(
    relClosureError < 1e-3,
    `Orbit closure after exactly 1 period (< 0.1% of orbital radius)`,
    `Closure error = ${(relClosureError * 100).toFixed(4)}%`
  );
}

// ----------------------------------------------------------------------------
// Test 2: Highly Eccentric Orbit (e = 0.7) - Conservation Through Periapsis
// ----------------------------------------------------------------------------
console.log('\nTest 2: Highly Eccentric Orbit (e = 0.7)');
{
  const m1 = SOLAR_MASS;
  const m2 = 1e20; // light test body
  const a = ASTRONOMICAL_UNIT;
  const e = 0.7;
  const r_periapsis = a * (1 - e);
  const mu = G_CONSTANT * (m1 + m2);
  const v_periapsis = Math.sqrt(mu * (2 / r_periapsis - 1 / a));

  const sun = {
    id: 'sun',
    name: 'Sun',
    mass: m1,
    radius: 7e8,
    position: vec3.create(0, 0, 0),
    velocity: vec3.create(0, 0, 0),
    color: '#f97316',
  };
  const comet = {
    id: 'comet',
    name: 'Comet',
    mass: m2,
    radius: 1e5,
    position: vec3.create(r_periapsis, 0, 0),
    velocity: vec3.create(0, v_periapsis, 0),
    color: '#3b82f6',
  };

  const sim = new TwoBodySimulator(sun, comet);
  const initState = sim.getState();

  assert(
    Math.abs(initState.orbitParameters.eccentricity - 0.7) < 1e-3,
    'Calculated eccentricity matches input e = 0.7',
    `e = ${initState.orbitParameters.eccentricity.toFixed(4)}`
  );

  const period = initState.orbitParameters.orbitalPeriod;
  const steps = 5000;
  const dt = period / steps;

  for (let s = 0; s < steps; s++) {
    sim.advance(dt, 8);
  }

  const finalState = sim.getState();
  const eDrift = Math.abs((finalState.totalEnergy - initState.totalEnergy) / initState.totalEnergy);
  assert(
    eDrift < 1e-4,
    `Energy conservation over eccentric orbit with sub-stepping (< 1e-4)`,
    `Drift = ${eDrift.toExponential(3)}`
  );
}

// ----------------------------------------------------------------------------
// Test 3: Earth-Moon Physical System
// ----------------------------------------------------------------------------
console.log('\nTest 3: Earth-Moon System');
{
  const d = 3.844e8; // meters
  const totalMass = EARTH_MASS + MOON_MASS;
  // Center of mass offsets
  const r_earth = (MOON_MASS / totalMass) * d;
  const r_moon = (EARTH_MASS / totalMass) * d;

  const v_rel = Math.sqrt((G_CONSTANT * totalMass) / d);
  const v_earth = (MOON_MASS / totalMass) * v_rel;
  const v_moon = (EARTH_MASS / totalMass) * v_rel;

  const earth = {
    id: 'earth',
    name: 'Earth',
    mass: EARTH_MASS,
    radius: 6.371e6,
    position: vec3.create(-r_earth, 0, 0),
    velocity: vec3.create(0, -v_earth, 0),
    color: '#3b82f6',
  };
  const moon = {
    id: 'moon',
    name: 'Moon',
    mass: MOON_MASS,
    radius: 1.737e6,
    position: vec3.create(r_moon, 0, 0),
    velocity: vec3.create(0, v_moon, 0),
    color: '#e2e8f0',
  };

  const sim = new TwoBodySimulator(earth, moon);
  const state = sim.getState();

  const periodDays = state.orbitParameters.orbitalPeriod / (24 * 3600);
  assert(
    Math.abs(periodDays - 27.3) < 0.2,
    `Moon orbital period is ~27.3 sidereal days`,
    `Period = ${periodDays.toFixed(2)} days`
  );

  assert(
    r_earth < earth.radius,
    `Earth-Moon barycenter lies inside Earth's physical radius`,
    `Barycenter offset = ${(r_earth / 1e3).toFixed(1)} km, Earth radius = ${(earth.radius / 1e3).toFixed(1)} km`
  );
}

// ----------------------------------------------------------------------------
// Test 4: Hyperbolic Unbound Orbit (e > 1)
// ----------------------------------------------------------------------------
console.log('\nTest 4: Hyperbolic Flyby Escape Trajectory (e > 1)');
{
  const m1 = SOLAR_MASS;
  const m2 = 1e15;
  const r_periapsis = 0.5 * ASTRONOMICAL_UNIT;
  const v_escape = Math.sqrt((2 * G_CONSTANT * m1) / r_periapsis);
  const v_hyperbolic = v_escape * 1.3; // Excess kinetic energy

  const primary = {
    id: 'p1',
    name: 'Sun',
    mass: m1,
    radius: 7e8,
    position: vec3.create(0, 0, 0),
    velocity: vec3.create(0, 0, 0),
    color: '#f97316',
  };
  const voyager = {
    id: 'v1',
    name: 'Interstellar Probe',
    mass: m2,
    radius: 100,
    position: vec3.create(r_periapsis, 0, 0),
    velocity: vec3.create(0, v_hyperbolic, 0),
    color: '#3b82f6',
  };

  const sim = new TwoBodySimulator(primary, voyager);
  const state = sim.getState();

  assert(
    state.orbitParameters.eccentricity > 1.0,
    `Trajectory is classified as hyperbolic (e > 1)`,
    `e = ${state.orbitParameters.eccentricity.toFixed(3)}`
  );

  assert(
    state.orbitParameters.orbitType === 'hyperbolic',
    `Orbit type is explicitly 'hyperbolic'`,
    `type = ${state.orbitParameters.orbitType}`
  );

  assert(
    state.totalEnergy > 0,
    `Total mechanical energy is strictly positive (unbound system)`,
    `E = ${state.totalEnergy.toExponential(3)} J`
  );
}

console.log('\n====================================================');
if (failures === 0) {
  console.log('ALL PHYSICS ENGINE TESTS PASSED! (0 failures)');
} else {
  console.error(`TEST SUITE FINISHED WITH ${failures} FAILURE(S).`);
  process.exit(1);
}
console.log('====================================================\n');
