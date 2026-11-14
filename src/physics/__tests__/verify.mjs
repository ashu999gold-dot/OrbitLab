// Standalone Node verification script for Physics Engine

const G_CONSTANT = 6.67430e-11;
const SOLAR_MASS = 1.98847e30;
const ASTRONOMICAL_UNIT = 1.495978707e11;
const EARTH_MASS = 5.9722e24;
const MOON_MASS = 7.342e22;

const vec3 = {
  create: (x = 0, y = 0, z = 0) => ({ x, y, z }),
  clone: (v) => ({ x: v.x, y: v.y, z: v.z }),
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  scale: (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
  addScaled: (a, b, s) => ({ x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s }),
  dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
  cross: (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  lengthSq: (v) => v.x * v.x + v.y * v.y + v.z * v.z,
  length: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  distance: (a, b) => Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2),
};

function computeGravitationalAccelerations(b1, b2) {
  const r12 = vec3.sub(b2.position, b1.position);
  const dist = vec3.length(r12);
  const effDist = Math.max(dist, 1e-3);
  const effCube = effDist * effDist * effDist;
  const a1 = vec3.scale(r12, (G_CONSTANT * b2.mass) / effCube);
  const a2 = vec3.scale(r12, -(G_CONSTANT * b1.mass) / effCube);
  return { a1, a2, distance: dist };
}

function stepVerlet(b1, b2, dt) {
  const acc0 = computeGravitationalAccelerations(b1, b2);
  const halfDt = 0.5 * dt;

  const v1_half = vec3.addScaled(b1.velocity, acc0.a1, halfDt);
  const v2_half = vec3.addScaled(b2.velocity, acc0.a2, halfDt);

  const r1_next = vec3.addScaled(b1.position, v1_half, dt);
  const r2_next = vec3.addScaled(b2.position, v2_half, dt);

  const temp1 = { ...b1, position: r1_next, velocity: v1_half };
  const temp2 = { ...b2, position: r2_next, velocity: v2_half };

  const acc1 = computeGravitationalAccelerations(temp1, temp2);

  const v1_next = vec3.addScaled(v1_half, acc1.a1, halfDt);
  const v2_next = vec3.addScaled(v2_half, acc1.a2, halfDt);

  return {
    body1: { ...b1, position: r1_next, velocity: v1_next },
    body2: { ...b2, position: r2_next, velocity: v2_next },
  };
}

function computeEnergy(b1, b2) {
  const v1Sq = vec3.lengthSq(b1.velocity);
  const v2Sq = vec3.lengthSq(b2.velocity);
  const T = 0.5 * b1.mass * v1Sq + 0.5 * b2.mass * v2Sq;
  const dist = Math.max(vec3.distance(b1.position, b2.position), 1e-3);
  const U = -(G_CONSTANT * b1.mass * b2.mass) / dist;
  return { T, U, E: T + U };
}

function computeAngularMomentum(b1, b2) {
  const L1 = vec3.scale(vec3.cross(b1.position, b1.velocity), b1.mass);
  const L2 = vec3.scale(vec3.cross(b2.position, b2.velocity), b2.mass);
  return vec3.add(L1, L2);
}

let fails = 0;
function test(cond, desc, det = '') {
  if (cond) {
    console.log(`  [PASS] ${desc}`);
  } else {
    console.error(`  [FAIL] ${desc} -- ${det}`);
    fails++;
  }
}

console.log('--- TEST 1: Circular Symmetric Binary Stars ---');
{
  const m = SOLAR_MASS;
  const d = ASTRONOMICAL_UNIT;
  const r_orbit = d / 2;
  const v = Math.sqrt((G_CONSTANT * m) / (2 * d));
  const period = (2 * Math.PI * r_orbit) / v;

  let b1 = { id: 's1', mass: m, radius: 7e8, position: vec3.create(-r_orbit, 0, 0), velocity: vec3.create(0, -v, 0) };
  let b2 = { id: 's2', mass: m, radius: 7e8, position: vec3.create(r_orbit, 0, 0), velocity: vec3.create(0, v, 0) };

  const initE = computeEnergy(b1, b2).E;
  const initL = vec3.length(computeAngularMomentum(b1, b2));

  // Run for 1 orbit
  const dt = 3600;
  const steps = Math.round(period / dt);
  const stepDt = period / steps;
  for (let i = 0; i < steps; i++) {
    const res = stepVerlet(b1, b2, stepDt);
    b1 = res.body1;
    b2 = res.body2;
  }

  const finalE = computeEnergy(b1, b2).E;
  const finalL = vec3.length(computeAngularMomentum(b1, b2));
  const dE = Math.abs((finalE - initE) / initE);
  const dL = Math.abs((finalL - initL) / initL);
  const posError = vec3.distance(b1.position, { x: -r_orbit, y: 0, z: 0 }) / r_orbit;

  test(dE < 1e-5, `Energy conservation over 1 full orbit (< 1e-5)`, `drift = ${dE.toExponential(3)}`);
  test(dL < 1e-12, `Angular momentum conservation (< 1e-12)`, `drift = ${dL.toExponential(3)}`);
  test(posError < 1e-3, `Orbit closure after 1 period (< 0.1%)`, `error = ${(posError*100).toFixed(4)}%`);
}

console.log('\n--- TEST 2: Earth-Moon System Orbit ---');
{
  const d = 3.844e8;
  const totalMass = EARTH_MASS + MOON_MASS;
  const r_earth = (MOON_MASS / totalMass) * d;
  const r_moon = (EARTH_MASS / totalMass) * d;
  const v_rel = Math.sqrt((G_CONSTANT * totalMass) / d);
  const v_earth = (MOON_MASS / totalMass) * v_rel;
  const v_moon = (EARTH_MASS / totalMass) * v_rel;

  let earth = { id: 'e', mass: EARTH_MASS, radius: 6.371e6, position: vec3.create(-r_earth, 0, 0), velocity: vec3.create(0, -v_earth, 0) };
  let moon = { id: 'm', mass: MOON_MASS, radius: 1.737e6, position: vec3.create(r_moon, 0, 0), velocity: vec3.create(0, v_moon, 0) };

  const periodSeconds = 2 * Math.PI * Math.sqrt((d**3) / (G_CONSTANT * totalMass));
  const periodDays = periodSeconds / 86400;

  test(Math.abs(periodDays - 27.32) < 0.1, `Moon sidereal period is ~27.32 days (got ${periodDays.toFixed(2)})`);

  // Integrate for 1 month
  const dt = 600; // 10 minute steps
  const steps = Math.round(periodSeconds / dt);
  const subDt = periodSeconds / steps;
  const initE = computeEnergy(earth, moon).E;

  for (let i = 0; i < steps; i++) {
    const res = stepVerlet(earth, moon, subDt);
    earth = res.body1;
    moon = res.body2;
  }

  const finalE = computeEnergy(earth, moon).E;
  const dE = Math.abs((finalE - initE) / initE);
  test(dE < 1e-5, `Earth-Moon energy drift over complete orbit (< 1e-5)`, `drift = ${dE.toExponential(3)}`);
}

if (fails > 0) {
  process.exit(1);
} else {
  console.log('\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}
