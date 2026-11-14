import { describe, expect, it } from 'vitest';
import { G_CONSTANT, SOLAR_MASS, ASTRONOMICAL_UNIT } from '../../physics/constants';
import { calculateRelativeOrbitParameters } from '../../physics/orbital-elements';
import { checkCollision } from '../../physics/collision';
import type { CelestialBody } from '../../physics/physics-types';
import { vec3 } from '../../physics/vector3';

describe('Orbital Elements & Keplerian Conic Classification', () => {
  const primary: CelestialBody = {
    id: 'sun',
    name: 'Sun',
    category: 'star',
    mass: SOLAR_MASS,
    radius: 6.96e8,
    position: vec3.create(0, 0, 0),
    velocity: vec3.create(0, 0, 0),
    acceleration: vec3.create(0, 0, 0),
    color: '#F97316',
  };

  it('classifies a circular orbit when tangential velocity equals circular velocity', () => {
    const r = ASTRONOMICAL_UNIT;
    const vCirc = Math.sqrt((G_CONSTANT * SOLAR_MASS) / r);

    const planet: CelestialBody = {
      id: 'planet',
      name: 'Circular Planet',
      category: 'planet',
      mass: 1e20,
      radius: 1e6,
      position: vec3.create(r, 0, 0),
      velocity: vec3.create(0, vCirc, 0),
      acceleration: vec3.create(0, 0, 0),
      color: '#3B82F6',
    };

    const orbit = calculateRelativeOrbitParameters(primary, planet);

    expect(orbit.orbitType).toBe('circular');
    expect(orbit.eccentricity).toBeLessThan(0.005);
    expect(orbit.semiMajorAxis).toBeCloseTo(r, -5);
    expect(orbit.periapsis).toBeCloseTo(r, -5);
    expect(orbit.apoapsis).toBeCloseTo(r, -5);
    expect(orbit.specificOrbitalEnergy).toBeLessThan(0);
    expect(orbit.isDegenerate).toBe(false);
  });

  it('correctly calculates semi-major axis, periapsis, and period for an elliptical orbit', () => {
    const a = ASTRONOMICAL_UNIT;
    const e = 0.5;
    const rPeriapsis = a * (1 - e);
    const mu = G_CONSTANT * (SOLAR_MASS + 1e20);
    const vPeriapsis = Math.sqrt(mu * (2 / rPeriapsis - 1 / a));

    const comet: CelestialBody = {
      id: 'comet',
      name: 'Comet',
      category: 'asteroid',
      mass: 1e20,
      radius: 1e5,
      position: vec3.create(rPeriapsis, 0, 0),
      velocity: vec3.create(0, vPeriapsis, 0),
      acceleration: vec3.create(0, 0, 0),
      color: '#3B82F6',
    };

    const orbit = calculateRelativeOrbitParameters(primary, comet);

    expect(orbit.orbitType).toBe('elliptical');
    expect(orbit.eccentricity).toBeCloseTo(0.5, 3);
    expect(orbit.semiMajorAxis).toBeCloseTo(a, -4);
    expect(orbit.periapsis).toBeCloseTo(rPeriapsis, -4);
    expect(orbit.apoapsis).toBeCloseTo(a * (1 + e), -4);
    expect(orbit.visVivaExpectedV).toBeCloseTo(vPeriapsis, 1);
  });

  it('classifies a hyperbolic flyby when specific orbital energy is strictly positive', () => {
    const r = 0.5 * ASTRONOMICAL_UNIT;
    const vEscape = Math.sqrt((2 * G_CONSTANT * SOLAR_MASS) / r);
    const vHyperbolic = vEscape * 1.3;

    const probe: CelestialBody = {
      id: 'probe',
      name: 'Interstellar Probe',
      category: 'artificial',
      mass: 1000,
      radius: 10,
      position: vec3.create(r, 0, 0),
      velocity: vec3.create(0, vHyperbolic, 0),
      acceleration: vec3.create(0, 0, 0),
      color: '#3B82F6',
    };

    const orbit = calculateRelativeOrbitParameters(primary, probe);

    expect(orbit.orbitType).toBe('hyperbolic');
    expect(orbit.eccentricity).toBeGreaterThan(1.0);
    expect(orbit.specificOrbitalEnergy).toBeGreaterThan(0);
    expect(orbit.apoapsis).toBe(Infinity);
    expect(orbit.orbitalPeriod).toBe(Infinity);
  });

  it('handles degenerate radial motion when relative angular momentum is zero', () => {
    // Both bodies on X axis with velocities directed along X axis (head-on collision)
    const headOnBody: CelestialBody = {
      id: 'target',
      name: 'Falling Body',
      category: 'asteroid',
      mass: 1e18,
      radius: 1e5,
      position: vec3.create(1e9, 0, 0),
      velocity: vec3.create(-1000, 0, 0), // radial velocity directly towards primary
      acceleration: vec3.create(0, 0, 0),
      color: '#3B82F6',
    };

    const orbit = calculateRelativeOrbitParameters(primary, headOnBody);

    expect(orbit.isDegenerate).toBe(true);
    expect(orbit.orbitType).toBe('radial');
    expect(orbit.specificAngularMomentum).toBeCloseTo(0, 5);
  });

  it('detects physical surface contact and flags collision status', () => {
    const b1: CelestialBody = {
      ...primary,
      position: vec3.create(0, 0, 0),
      radius: 1e7,
    };
    const b2: CelestialBody = {
      ...primary,
      position: vec3.create(1.5e7, 0, 0), // distance = 1.5e7 <= 1e7 + 1e7 = 2e7
      radius: 1e7,
    };

    const col = checkCollision(b1, b2, 42.5);
    expect(col.isColliding).toBe(true);
    expect(col.collisionTime).toBe(42.5);
    expect(col.contactDistance).toBe(2e7);
  });
});
