// ORBITLAB — Unit Conversions Utility
// Maps between human scientific units (AU, km, Earth mass, Solar mass, etc.) and internal SI units

import { ASTRONOMICAL_UNIT, EARTH_MASS, EARTH_RADIUS, SOLAR_MASS, SOLAR_RADIUS } from '../physics/constants';

// Distance
export type DistanceUnit = 'm' | 'km' | 'AU' | 'earth_radius' | 'solar_radius';
export const DISTANCE_CONVERSIONS: Record<DistanceUnit, number> = {
  m: 1,
  km: 1e3,
  AU: ASTRONOMICAL_UNIT,
  earth_radius: EARTH_RADIUS,
  solar_radius: SOLAR_RADIUS,
};

export function toSIMeters(value: number, unit: DistanceUnit): number {
  return value * DISTANCE_CONVERSIONS[unit];
}

export function fromSIMeters(meters: number, unit: DistanceUnit): number {
  return meters / DISTANCE_CONVERSIONS[unit];
}

// Mass
export type MassUnit = 'kg' | 'earth' | 'solar';
export const MASS_CONVERSIONS: Record<MassUnit, number> = {
  kg: 1,
  earth: EARTH_MASS,
  solar: SOLAR_MASS,
};

export function toSIKilograms(value: number, unit: MassUnit): number {
  return value * MASS_CONVERSIONS[unit];
}

export function fromSIKilograms(kg: number, unit: MassUnit): number {
  return kg / MASS_CONVERSIONS[unit];
}

// Velocity
export type VelocityUnit = 'm/s' | 'km/s';
export const VELOCITY_CONVERSIONS: Record<VelocityUnit, number> = {
  'm/s': 1,
  'km/s': 1e3,
};

export function toSIMetersPerSecond(value: number, unit: VelocityUnit): number {
  return value * VELOCITY_CONVERSIONS[unit];
}

export function fromSIMetersPerSecond(mps: number, unit: VelocityUnit): number {
  return mps / VELOCITY_CONVERSIONS[unit];
}

// Time
export type TimeUnit = 's' | 'min' | 'h' | 'days' | 'years';
export const TIME_CONVERSIONS: Record<TimeUnit, number> = {
  s: 1,
  min: 60,
  h: 3600,
  days: 86400,
  years: 31557600, // 365.25 days
};

export function toSISeconds(value: number, unit: TimeUnit): number {
  return value * TIME_CONVERSIONS[unit];
}

export function fromSISeconds(seconds: number, unit: TimeUnit): number {
  return seconds / TIME_CONVERSIONS[unit];
}
