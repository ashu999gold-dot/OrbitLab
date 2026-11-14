// ORBITLAB — Core Physics Types & Data Contracts
// All physical quantities are represented in SI units internally:
// - Position: meters (m)
// - Velocity: meters per second (m/s)
// - Mass: kilograms (kg)
// - Time: seconds (s)
// - Force: Newtons (N)
// - Energy: Joules (J)
// - Angular Momentum: kg·m²/s

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  mass: number;        // kg
  radius: number;      // physical radius in meters (m)
  position: Vector3D;  // meters (m)
  velocity: Vector3D;  // m/s
  color: string;       // Hex or CSS color
}

export type OrbitType = 'circular' | 'elliptical' | 'parabolic' | 'hyperbolic' | 'colliding';

export interface OrbitParameters {
  semiMajorAxis: number;           // a in meters (m), negative for hyperbolic
  eccentricity: number;             // e dimensionless
  eccentricityVector: Vector3D;     // eccentricity vector pointing to periapsis
  specificOrbitalEnergy: number;    // epsilon in J/kg (m²/s²)
  specificAngularMomentum: number;  // h in m²/s
  orbitalPeriod: number;            // seconds (s), Infinity if unbound
  apoapsis: number;                 // meters (m), Infinity if unbound
  periapsis: number;                // meters (m)
  trueAnomaly: number;              // radians (0 to 2pi)
  orbitType: OrbitType;
  visVivaExpectedV: number;         // theoretical speed via Vis-Viva equation (m/s)
}

export interface PhysicsState {
  time: number;                     // simulation elapsed time (s)
  stepCount: number;
  bodies: [CelestialBody, CelestialBody];
  barycenter: {
    position: Vector3D;
    velocity: Vector3D;
  };
  distance: number;                 // r in meters (m)
  relativeVelocity: number;         // |v_rel| in m/s
  forceMagnitude: number;           // |F| in Newtons (N)
  kineticEnergy: number;            // T in Joules (J)
  potentialEnergy: number;          // U in Joules (J)
  totalEnergy: number;              // E = T + U in Joules (J)
  totalLinearMomentum: Vector3D;    // P in kg·m/s
  linearMomentumMagnitude: number;  // |P| in kg·m/s
  totalAngularMomentum: Vector3D;   // L in kg·m²/s
  angularMomentumMagnitude: number; // |L| in kg·m²/s
  initialTotalEnergy: number;       // E_0 in Joules (J)
  initialAngularMomentumMag: number;// |L_0| in kg·m²/s
  energyConservationError: number;  // |E - E_0| / |E_0| (relative error)
  angularMomentumError: number;     // |L - L_0| / |L_0| (relative error)
  isColliding: boolean;
  orbitParameters: OrbitParameters;
}

export interface PresetDefinition {
  id: string;
  name: string;
  category: 'Solar System' | 'Astrophysics' | 'Academic Dynamics' | 'Orbital Transfers';
  description: string;
  academicContext: string;
  approximationNotes: string;
  body1: {
    name: string;
    mass: number;
    radius: number;
    position: Vector3D;
    velocity: Vector3D;
    color: string;
  };
  body2: {
    name: string;
    mass: number;
    radius: number;
    position: Vector3D;
    velocity: Vector3D;
    color: string;
  };
  defaultDt: number;          // physics step in seconds
  defaultSubsteps: number;    // substeps per frame
  defaultTimeScale: number;   // default simulation speed multiplier
  cameraDistance: number;     // visualization scene camera distance
  distanceScale: number;      // scaling factor for 3D world units (meters to three.js scene units)
  bodyRadiusScale: number;    // visual exaggeration multiplier for body radii so they are visible
}
