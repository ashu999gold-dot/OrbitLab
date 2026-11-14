// ORBITLAB — JSON Configuration Save & Load Utility

import type { CelestialBody } from '../physics/physics-types';
import { validateSimulationConfiguration } from '../simulation/validation';

export interface OrbitLabExportData {
  schemaVersion: string;
  application: 'OrbitLab';
  timestamp: string;
  body1: CelestialBody;
  body2: CelestialBody;
  settings: {
    fixedDt: number;
    timeScale: number;
    substeps: number;
  };
}

/**
 * Serializes and triggers browser download of the simulation configuration as a JSON file.
 */
export function exportConfigurationToJson(
  body1: CelestialBody,
  body2: CelestialBody,
  settings: { fixedDt: number; timeScale: number; substeps: number },
  filename: string = 'orbitlab_configuration.json'
): void {
  const exportPayload: OrbitLabExportData = {
    schemaVersion: '1.0.0',
    application: 'OrbitLab',
    timestamp: new Date().toISOString(),
    body1,
    body2,
    settings,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses raw imported JSON text into a verified OrbitLab configuration.
 */
export function importConfigurationFromJson(jsonString: string): {
  body1: CelestialBody;
  body2: CelestialBody;
  settings?: { fixedDt: number; timeScale: number; substeps: number };
} {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Invalid JSON format: file could not be parsed.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid configuration format: root must be an object.');
  }

  const b1 = parsed.body1;
  const b2 = parsed.body2;

  if (!b1 || !b2) {
    throw new Error('Configuration must contain both "body1" and "body2" definitions.');
  }

  const validation = validateSimulationConfiguration(b1, b2, parsed.settings?.fixedDt);
  if (!validation.isValid) {
    throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
  }

  return {
    body1: {
      id: b1.id || 'b1',
      name: b1.name || 'Body 1',
      category: b1.category || 'planet',
      mass: b1.mass,
      radius: b1.radius,
      position: { x: b1.position.x, y: b1.position.y, z: b1.position.z },
      velocity: { x: b1.velocity.x, y: b1.velocity.y, z: b1.velocity.z },
      acceleration: b1.acceleration || { x: 0, y: 0, z: 0 },
      color: b1.color || '#3B82F6',
    },
    body2: {
      id: b2.id || 'b2',
      name: b2.name || 'Body 2',
      category: b2.category || 'satellite',
      mass: b2.mass,
      radius: b2.radius,
      position: { x: b2.position.x, y: b2.position.y, z: b2.position.z },
      velocity: { x: b2.velocity.x, y: b2.velocity.y, z: b2.velocity.z },
      acceleration: b2.acceleration || { x: 0, y: 0, z: 0 },
      color: b2.color || '#F97316',
    },
    settings: parsed.settings ? {
      fixedDt: Math.max(1e-3, parsed.settings.fixedDt || 900),
      timeScale: Math.max(1e-2, parsed.settings.timeScale || 200000),
      substeps: Math.max(1, parsed.settings.substeps || 8),
    } : undefined,
  };
}
