import { describe, expect, it } from 'vitest';
import { G_CONSTANT, SOLAR_MASS, ASTRONOMICAL_UNIT } from '../../physics/constants';
import { calculateGravitationalInteraction } from '../../physics/gravity';
import type { CelestialBody } from '../../physics/physics-types';
import { vec3 } from '../../physics/vector3';

describe('Newtonian Gravitational Interaction', () => {
  const body1: CelestialBody = {
    id: 'b1',
    name: 'Body 1',
    category: 'star',
    mass: SOLAR_MASS,
    radius: 7e8,
    position: vec3.create(0, 0, 0),
    velocity: vec3.create(0, 0, 0),
    acceleration: vec3.create(0, 0, 0),
    color: '#3B82F6',
  };

  const body2: CelestialBody = {
    id: 'b2',
    name: 'Body 2',
    category: 'planet',
    mass: 5.972e24, // Earth mass
    radius: 6.371e6,
    position: vec3.create(ASTRONOMICAL_UNIT, 0, 0),
    velocity: vec3.create(0, 29780, 0),
    acceleration: vec3.create(0, 0, 0),
    color: '#F97316',
  };

  it('calculates the exact inverse-square gravitational force magnitude', () => {
    const result = calculateGravitationalInteraction(body1, body2);
    const expectedF = (G_CONSTANT * body1.mass * body2.mass) / (ASTRONOMICAL_UNIT * ASTRONOMICAL_UNIT);

    expect(Math.abs(result.forceMagnitude - expectedF) / expectedF).toBeLessThan(1e-12);
  });

  it('strictly obeys Newton Third Law (F12 = -F21)', () => {
    const result = calculateGravitationalInteraction(body1, body2);

    expect(Math.abs(result.forceOn1.x + result.forceOn2.x)).toBeLessThan(1e-6);
    expect(Math.abs(result.forceOn1.y + result.forceOn2.y)).toBeLessThan(1e-6);
    expect(Math.abs(result.forceOn1.z + result.forceOn2.z)).toBeLessThan(1e-6);
  });

  it('calculates accelerations inversely proportional to each mass', () => {
    const result = calculateGravitationalInteraction(body1, body2);

    // a1 * m1 must equal a2 * m2 (in magnitude)
    const f1 = vec3.length(result.acceleration1) * body1.mass;
    const f2 = vec3.length(result.acceleration2) * body2.mass;

    expect(Math.abs(f1 - f2) / f1).toBeLessThan(1e-12);
    expect(result.acceleration2.x).toBeLessThan(0); // body 2 is pulled towards 0
    expect(result.acceleration1.x).toBeGreaterThan(0); // body 1 is pulled towards +X
  });

  it('calculates negative gravitational potential energy U = -G*m1*m2/r', () => {
    const result = calculateGravitationalInteraction(body1, body2);
    const expectedU = -(G_CONSTANT * body1.mass * body2.mass) / ASTRONOMICAL_UNIT;

    expect(Math.abs(result.potentialEnergy - expectedU) / Math.abs(expectedU)).toBeLessThan(1e-12);
    expect(result.potentialEnergy).toBeLessThan(0);
  });
});
