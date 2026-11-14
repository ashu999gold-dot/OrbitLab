import { describe, expect, it } from 'vitest';
import { validateBody, validateSimulationConfiguration } from '../../simulation/validation';
import { vec3 } from '../../physics/vector3';

describe('Physics Validation & Defensive Checks', () => {
  it('validates a physical celestial body correctly', () => {
    const valid = validateBody({
      name: 'Valid Planet',
      mass: 5.972e24,
      radius: 6.371e6,
      position: vec3.create(1e7, 0, 0),
      velocity: vec3.create(0, 1000, 0),
    });

    expect(valid.isValid).toBe(true);
    expect(valid.errors.length).toBe(0);
  });

  it('rejects non-positive or NaN mass and radius', () => {
    const invalid = validateBody({
      name: 'Negative Mass Planet',
      mass: -500,
      radius: 0,
      position: vec3.create(0, 0, 0),
      velocity: vec3.create(0, 0, 0),
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors).toContain('Body mass must be a strictly positive finite number.');
    expect(invalid.errors).toContain('Body radius must be a strictly positive finite number.');
  });

  it('rejects superposed centers of mass (zero distance singularity)', () => {
    const b1 = {
      name: 'A',
      mass: 1e24,
      radius: 1e6,
      position: vec3.create(100, 200, 300),
      velocity: vec3.create(0, 0, 0),
    };
    const b2 = {
      name: 'B',
      mass: 1e24,
      radius: 1e6,
      position: vec3.create(100, 200, 300), // Identical position
      velocity: vec3.create(0, 0, 0),
    };

    const res = validateSimulationConfiguration(b1, b2);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Initial separation cannot be zero (centers of mass superposed).');
  });
});
