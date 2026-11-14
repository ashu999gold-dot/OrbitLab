// ORBITLAB — Master Physics Types & Interfaces
// Strictly SI Units Internally (kg, m, s, N, J, kg·m²/s, m/s, m/s²)

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type BodyCategory = 'planet' | 'star' | 'satellite' | 'asteroid' | 'artificial' | 'custom';

export interface CelestialBody {
  id: string;
  name: string;
  category: BodyCategory;
  mass: number;           // kg (strictly > 0)
  radius: number;         // physical radius in meters (strictly > 0)
  position: Vector3D;     // meters (m)
  velocity: Vector3D;     // m/s
  acceleration: Vector3D; // m/s²
  color: string;          // Hex / CSS color string for rendering
}

export type OrbitType = 'circular' | 'elliptical' | 'parabolic' | 'hyperbolic' | 'radial' | 'colliding';

export interface OrbitParameters {
  semiMajorAxis: number;              // a in meters (m), negative for hyperbolic
  eccentricity: number;                // e dimensionless
  eccentricityVector: Vector3D;        // eccentricity vector pointing towards periapsis
  specificOrbitalEnergy: number;       // epsilon in J/kg (m²/s²)
  specificAngularMomentum: number;     // h = |r x v| in m²/s
  specificAngularMomentumVec: Vector3D;// h_vec
  orbitalPeriod: number;               // seconds (s), Infinity if unbound or radial
  apoapsis: number;                    // meters (m), Infinity if unbound
  periapsis: number;                   // meters (m)
  trueAnomaly: number;                 // radians (0 to 2pi)
  orbitType: OrbitType;
  visVivaExpectedV: number;            // theoretical speed via Vis-Viva equation (m/s)
  isDegenerate: boolean;               // true if angular momentum is near zero (radial collision/escape)
}

export interface CollisionState {
  isColliding: boolean;
  collisionTime: number | null;        // elapsed simulation seconds at collision
  distance: number;                    // separation at collision
  contactDistance: number;             // R1 + R2
  relativeVelocity: number;            // impact relative speed |v2 - v1| in m/s
}

export interface ConservationState {
  initialEnergy: number;
  currentEnergy: number;
  energyError: number;                 // relative error |E - E0| / |E0|
  initialLinearMomentum: Vector3D;
  currentLinearMomentum: Vector3D;
  linearMomentumMagnitude: number;
  initialAngularMomentum: Vector3D;
  currentAngularMomentum: Vector3D;
  angularMomentumMagnitude: number;
  angularMomentumError: number;        // relative error |L - L0| / |L0|
}

export interface SystemState {
  time: number;                        // simulation elapsed time in seconds
  stepCount: number;
  bodies: [CelestialBody, CelestialBody];
  barycenter: {
    position: Vector3D;
    velocity: Vector3D;
  };
  distance: number;                    // r in meters
  relativeVelocity: number;            // |v_rel| in m/s
  forceMagnitude: number;              // |F| in Newtons
  kineticEnergy: {
    k1: number;
    k2: number;
    total: number;
  };
  potentialEnergy: number;             // U in Joules
  totalEnergy: number;                 // E = K + U in Joules
  linearMomentum: {
    vector: Vector3D;
    magnitude: number;
  };
  angularMomentum: {
    vector: Vector3D;
    magnitude: number;
  };
  orbit: OrbitParameters;
  collision: CollisionState;
  conservation: ConservationState;
}
