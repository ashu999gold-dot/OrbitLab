// ME 206 Statics and Dynamics — Required Physics Unit Test Suite
// Rigorous verification of the 10 core Newtonian two-body physical laws:
// 1. Gravitational force calculation (Newton's Law of Gravitation & 3rd Law)
// 2. Acceleration of both bodies (Newton's 2nd Law, action-reaction)
// 3. Centre-of-mass calculation (Position and Velocity)
// 4. Conservation of total linear momentum (Isolated system, dP/dt = 0)
// 5. Conservation of angular momentum (Central force torque tau = 0, dL/dt = 0)
// 6. Total mechanical energy calculation (E = K + U, Vis-Viva energy)
// 7. Circular-orbit initialization (v_circ = sqrt(mu/r), e ~ 0)
// 8. Elliptical orbit behavior (0 < e < 1, speed faster at periapsis than apoapsis)
// 9. Hyperbolic / escape trajectory (v >= v_esc, e >= 1, separation monotonic growth)
// 10. Collision detection (|r2 - r1| <= R1 + R2)

import { describe, expect, it } from 'vitest';
import { G_CONSTANT } from '../../physics/constants';
import { calculateGravitationalInteraction } from '../../physics/gravity';
import { calculateBarycenter } from '../../physics/barycenter';
import { calculateSystemMomentum } from '../../physics/momentum';
import { calculateMechanicalEnergy } from '../../physics/energy';
import { calculateRelativeOrbitParameters } from '../../physics/orbital-elements';
import { checkCollision } from '../../physics/collision';
import { generateBarycentricInitialState } from '../../simulation/initial-conditions';
import { integrateVelocityVerlet } from '../../physics/integrator';
import { vec3 } from '../../physics/vector3';
import type { CelestialBody } from '../../physics/physics-types';

describe('ME 206 Two-Body Orbital Mechanics Required Test Suite', () => {
  // Helpers
  const createBody = (id: string, name: string, mass: number, radius: number, pos = [0, 0, 0], vel = [0, 0, 0]): CelestialBody => ({
    id,
    name,
    category: 'custom',
    mass,
    radius,
    position: vec3.create(pos[0], pos[1], pos[2]),
    velocity: vec3.create(vel[0], vel[1], vel[2]),
    acceleration: vec3.create(0, 0, 0),
    color: '#3B82F6',
  });

  // TEST 1: Gravitational Force Calculation
  it('1. Gravitational force calculation: F = G * m1 * m2 / r^2 and Newton third law', () => {
    const m1 = 5.972e24; // Earth mass (kg)
    const m2 = 7.342e22; // Moon mass (kg)
    const r = 3.844e8;   // Separation (m)
    const b1 = createBody('1', 'Earth', m1, 6.371e6, [0, 0, 0]);
    const b2 = createBody('2', 'Moon', m2, 1.737e6, [r, 0, 0]);

    const result = calculateGravitationalInteraction(b1, b2);
    const expectedF = (G_CONSTANT * m1 * m2) / (r * r);

    // Verify scalar force magnitude within < 1e-6 relative error
    expect(Math.abs(result.forceMagnitude - expectedF) / expectedF).toBeLessThan(1e-6);

    // Verify Newton's Third Law: F12 = -F21
    expect(result.forceOn1.x).toBeCloseTo(-result.forceOn2.x, 2);
    expect(result.forceOn1.y).toBeCloseTo(-result.forceOn2.y, 2);
    expect(result.forceOn1.z).toBeCloseTo(-result.forceOn2.z, 2);

    // Body 1 is pulled towards +x, Body 2 is pulled towards -x
    expect(result.forceOn1.x).toBeGreaterThan(0);
    expect(result.forceOn2.x).toBeLessThan(0);
  });

  // TEST 2: Acceleration of Both Bodies
  it('2. Acceleration of both bodies: a1 = F / m1 and a2 = -F / m2 (Newton second law)', () => {
    const m1 = 1.989e30; // Sun mass
    const m2 = 5.972e24; // Earth mass
    const r = 1.496e11;  // 1 AU
    const b1 = createBody('1', 'Sun', m1, 6.96e8, [0, 0, 0]);
    const b2 = createBody('2', 'Earth', m2, 6.371e6, [r, 0, 0]);

    const result = calculateGravitationalInteraction(b1, b2);

    const a1_expected = (G_CONSTANT * m2) / (r * r);
    const a2_expected = (G_CONSTANT * m1) / (r * r);

    expect(vec3.length(result.acceleration1)).toBeCloseTo(a1_expected, 8);
    expect(vec3.length(result.acceleration2)).toBeCloseTo(a2_expected, 5);

    // Newton's 2nd Law sum: m1 * a1 + m2 * a2 = 0 (Internal forces cancel)
    const netForceX = m1 * result.acceleration1.x + m2 * result.acceleration2.x;
    expect(Math.abs(netForceX) / result.forceMagnitude).toBeLessThan(1e-12);
  });

  // TEST 3: Centre-of-mass Calculation
  it('3. Centre-of-mass calculation: R_cm and V_cm for symmetric and asymmetric systems', () => {
    // Asymmetric system (Earth-Moon)
    const m1 = 6e24;
    const m2 = 2e24;
    const b1 = createBody('1', 'A', m1, 1e6, [-1000, 0, 0], [0, 10, 0]);
    const b2 = createBody('2', 'B', m2, 1e6, [3000, 0, 0], [0, -30, 0]);

    const com = calculateBarycenter(b1, b2);

    // R_cm = (6e24 * -1000 + 2e24 * 3000) / 8e24 = (-6000 + 6000) / 8 = 0
    expect(com.position.x).toBeCloseTo(0, 5);
    expect(com.position.y).toBeCloseTo(0, 5);

    // V_cm = (6e24 * 10 + 2e24 * -30) / 8e24 = (60 - 60) / 8 = 0
    expect(com.velocity.y).toBeCloseTo(0, 5);
  });

  // TEST 4: Conservation of Total Linear Momentum
  it('4. Conservation of total linear momentum: dP/dt = 0 across integration steps', () => {
    const bodies = generateBarycentricInitialState({
      mass1: 1e25,
      mass2: 1e25,
      radius1: 1e6,
      radius2: 1e6,
      separation: 1e8,
      speedFactor: 1.0,
      name1: 'Star 1',
      name2: 'Star 2',
      color1: '#fff',
      color2: '#fff',
    });

    let b1 = bodies[0];
    let b2 = bodies[1];
    const initialMomentum = calculateSystemMomentum(b1, b2);
    expect(initialMomentum.linearMomentumMagnitude).toBeLessThan(1e-6); // zero in COM frame

    // Integrate for 200 steps
    const dt = 100;
    for (let step = 0; step < 200; step++) {
      const next = integrateVelocityVerlet(b1, b2, dt);
      b1 = next.body1;
      b2 = next.body2;
    }

    const finalMomentum = calculateSystemMomentum(b1, b2);
    // Linear momentum must remain strictly conserved
    expect(finalMomentum.linearMomentumMagnitude).toBeLessThan(1e-5);
  });

  // TEST 5: Conservation of Angular Momentum
  it('5. Conservation of angular momentum: dL/dt = 0 in central gravitational force field', () => {
    const bodies = generateBarycentricInitialState({
      mass1: 2e30,
      mass2: 6e24,
      radius1: 7e8,
      radius2: 6e6,
      separation: 1.5e11,
      speedFactor: 1.2, // eccentric orbit
      name1: 'Sun',
      name2: 'Planet',
      color1: '#f90',
      color2: '#09f',
    });

    let b1 = bodies[0];
    let b2 = bodies[1];
    const L0 = calculateSystemMomentum(b1, b2).angularMomentumMagnitude;

    // Integrate over multiple orbital segments
    const dt = 1000;
    for (let step = 0; step < 500; step++) {
      const next = integrateVelocityVerlet(b1, b2, dt);
      b1 = next.body1;
      b2 = next.body2;
    }

    const L_final = calculateSystemMomentum(b1, b2).angularMomentumMagnitude;
    const relError = Math.abs(L_final - L0) / L0;

    // Symplectic Velocity Verlet preserves angular momentum to very high precision
    expect(relError).toBeLessThan(1e-5);
  });

  // TEST 6: Total Mechanical Energy Calculation
  it('6. Total mechanical energy calculation: E = K + U and Vis-Viva energy consistency', () => {
    const m1 = 1e30;
    const m2 = 1e26;
    const r = 1e11;
    const mu = G_CONSTANT * (m1 + m2);
    const v_circ = Math.sqrt(mu / r);

    const b1 = createBody('1', 'Primary', m1, 1e7, [0, 0, 0], [0, 0, 0]);
    const b2 = createBody('2', 'Secondary', m2, 1e6, [r, 0, 0], [0, v_circ, 0]);

    const energy = calculateMechanicalEnergy(b1, b2);
    const K = energy.totalKinetic;
    const U = energy.potential;
    const E = energy.totalMechanical;

    expect(E).toBeCloseTo(K + U, 5);

    // For circular orbit, Virial theorem states: 2K + U = 0 => E = U / 2 = -K
    // Since m1 >> m2, K ~ 0.5 * m2 * v_circ^2 = 0.5 * G * m1 * m2 / r = -U / 2
    expect(Math.abs(K - (-U / 2)) / Math.abs(U)).toBeLessThan(1e-3);
    expect(E).toBeLessThan(0); // Bound system
  });

  // TEST 7: Circular-Orbit Initialization
  it('7. Circular-orbit initialization: v_circ = sqrt(mu/r) produces eccentricity e ~ 0', () => {
    const bodies = generateBarycentricInitialState({
      mass1: 1.989e30,
      mass2: 5.972e24,
      radius1: 6.96e8,
      radius2: 6.371e6,
      separation: 1.496e11,
      speedFactor: 1.0, // exactly circular
      name1: 'Sun',
      name2: 'Earth',
      color1: '#f90',
      color2: '#09f',
    });

    const orbit = calculateRelativeOrbitParameters(bodies[0], bodies[1]);
    expect(orbit.orbitType).toBe('circular');
    expect(orbit.eccentricity).toBeLessThan(1e-3);

    // Over multiple steps, distance should remain constant within 0.01%
    let b1 = bodies[0];
    let b2 = bodies[1];
    const initialR = vec3.distance(b1.position, b2.position);

    for (let step = 0; step < 100; step++) {
      const next = integrateVelocityVerlet(b1, b2, 3600);
      b1 = next.body1;
      b2 = next.body2;
    }
    const currentR = vec3.distance(b1.position, b2.position);
    expect(Math.abs(currentR - initialR) / initialR).toBeLessThan(1e-4);
  });

  // TEST 8: Elliptical Orbit Behavior
  it('8. Elliptical orbit behavior: 0 < e < 1, speed faster at periapsis than apoapsis (Vis-Viva)', () => {
    // Initialized at periapsis with speedFactor = 1.2 > 1 (e = 1.2^2 - 1 = 0.44)
    const bodies = generateBarycentricInitialState({
      mass1: 1.989e30,
      mass2: 1e24,
      radius1: 6.96e8,
      radius2: 6e6,
      separation: 1e11,
      speedFactor: 1.2,
      name1: 'Sun',
      name2: 'Planet',
      color1: '#f90',
      color2: '#09f',
    });

    const orbit = calculateRelativeOrbitParameters(bodies[0], bodies[1]);
    expect(orbit.orbitType).toBe('elliptical');
    expect(orbit.eccentricity).toBeGreaterThan(0.1);
    expect(orbit.eccentricity).toBeLessThan(1.0);
    expect(orbit.specificOrbitalEnergy).toBeLessThan(0); // Bound

    const speedPeriapsis = vec3.length(vec3.sub(bodies[1].velocity, bodies[0].velocity));

    // Integrate to find apoapsis where separation is max and speed is min
    let b1 = bodies[0];
    let b2 = bodies[1];
    let maxSeparation = 0;
    let speedAtApoapsis = speedPeriapsis;

    for (let step = 0; step < 1500; step++) {
      const next = integrateVelocityVerlet(b1, b2, 1000);
      b1 = next.body1;
      b2 = next.body2;
      const sep = vec3.distance(b1.position, b2.position);
      if (sep > maxSeparation) {
        maxSeparation = sep;
        speedAtApoapsis = vec3.length(vec3.sub(b2.velocity, b1.velocity));
      }
    }

    // Kepler's 2nd Law & Vis-Viva: Periapsis speed must exceed apoapsis speed
    expect(speedPeriapsis).toBeGreaterThan(speedAtApoapsis);
    expect(maxSeparation).toBeGreaterThan(1e11);
  });

  // TEST 9: Hyperbolic / Escape Trajectory
  it('9. Hyperbolic / escape trajectory: v >= v_escape produces e >= 1 and monotonic escape', () => {
    // Escape speed is sqrt(2) * v_circ ~= 1.414 * v_circ
    const bodies = generateBarycentricInitialState({
      mass1: 1.989e30,
      mass2: 1000,
      radius1: 6.96e8,
      radius2: 10,
      separation: 1e11,
      speedFactor: 1.6, // Exceeds escape speed
      name1: 'Sun',
      name2: 'Spacecraft',
      color1: '#f90',
      color2: '#09f',
    });

    const orbit = calculateRelativeOrbitParameters(bodies[0], bodies[1]);
    expect(orbit.orbitType).toBe('hyperbolic');
    expect(orbit.eccentricity).toBeGreaterThan(1.0);
    expect(orbit.specificOrbitalEnergy).toBeGreaterThan(0); // Unbound

    // Monotonically increasing distance
    let b1 = bodies[0];
    let b2 = bodies[1];
    let lastR = vec3.distance(b1.position, b2.position);

    for (let step = 0; step < 100; step++) {
      const next = integrateVelocityVerlet(b1, b2, 3600);
      b1 = next.body1;
      b2 = next.body2;
      const currentR = vec3.distance(b1.position, b2.position);
      expect(currentR).toBeGreaterThan(lastR);
      lastR = currentR;
    }
  });

  // TEST 10: Collision Detection
  it('10. Collision detection: flags isColliding when distance <= R1 + R2', () => {
    const R1 = 6.371e6;
    const R2 = 1.737e6;
    const contactDistance = R1 + R2; // 8.108e6 m

    // Case A: Separated
    const separated1 = createBody('1', 'Earth', 6e24, R1, [0, 0, 0]);
    const separated2 = createBody('2', 'Moon', 7e22, R2, [contactDistance + 1000, 0, 0]);
    const resA = checkCollision(separated1, separated2, 0);
    expect(resA.isColliding).toBe(false);

    // Case B: In Contact
    const colliding1 = createBody('1', 'Earth', 6e24, R1, [0, 0, 0]);
    const colliding2 = createBody('2', 'Moon', 7e22, R2, [contactDistance - 100, 0, 0]);
    const resB = checkCollision(colliding1, colliding2, 120);
    expect(resB.isColliding).toBe(true);
    expect(resB.collisionTime).toBe(120);
    expect(resB.contactDistance).toBe(contactDistance);
  });
});
