// ORBITLAB — Physical Input & Configuration Validation

import type { CelestialBody } from '../physics/physics-types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBody(body: Partial<CelestialBody>, label: string = 'Body'): ValidationResult {
  const errors: string[] = [];

  if (!body.name || body.name.trim().length === 0) {
    errors.push(`${label} must have a valid name.`);
  }

  if (typeof body.mass !== 'number' || isNaN(body.mass) || body.mass <= 0) {
    errors.push(`${label} mass must be a strictly positive finite number.`);
  }

  if (typeof body.radius !== 'number' || isNaN(body.radius) || body.radius <= 0) {
    errors.push(`${label} radius must be a strictly positive finite number.`);
  }

  if (!body.position || isNaN(body.position.x) || isNaN(body.position.y) || isNaN(body.position.z)) {
    errors.push(`${label} position coordinates (X, Y, Z) must be finite numbers.`);
  }

  if (!body.velocity || isNaN(body.velocity.x) || isNaN(body.velocity.y) || isNaN(body.velocity.z)) {
    errors.push(`${label} velocity components (Vx, Vy, Vz) must be finite numbers.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSimulationConfiguration(
  b1: Partial<CelestialBody>,
  b2: Partial<CelestialBody>,
  dt?: number
): ValidationResult {
  const errors: string[] = [];

  const res1 = validateBody(b1, 'Body 1 (Primary)');
  if (!res1.isValid) errors.push(...res1.errors);

  const res2 = validateBody(b2, 'Body 2 (Secondary)');
  if (!res2.isValid) errors.push(...res2.errors);

  if (dt !== undefined && (typeof dt !== 'number' || isNaN(dt) || dt <= 0)) {
    errors.push('Physics timestep (dt) must be a strictly positive finite number.');
  }

  if (res1.isValid && res2.isValid && b1.position && b2.position) {
    const dx = (b2.position.x || 0) - (b1.position.x || 0);
    const dy = (b2.position.y || 0) - (b1.position.y || 0);
    const dz = (b2.position.z || 0) - (b1.position.z || 0);
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist <= 0) {
      errors.push('Initial separation cannot be zero (centers of mass superposed).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
