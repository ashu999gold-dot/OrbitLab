import { describe, expect, it } from 'vitest';
import { G_CONSTANT, SOLAR_MASS, ASTRONOMICAL_UNIT } from '../../physics/constants';
import { SimulationEngine } from '../../simulation/engine';
import { generateBarycentricInitialState } from '../../simulation/initial-conditions';
import { vec3 } from '../../physics/vector3';

describe('Velocity Verlet Numerical Integrator & Conservation Laws', () => {
  it('conserves energy and angular momentum over a full circular orbit of equal-mass binary stars', () => {
    const bodies = generateBarycentricInitialState({
      mass1: SOLAR_MASS,
      mass2: SOLAR_MASS,
      radius1: 7e8,
      radius2: 7e8,
      separation: ASTRONOMICAL_UNIT,
      speedFactor: 1.0,
    });

    const engine = new SimulationEngine(bodies[0], bodies[1]);
    const initState = engine.getState();

    // Exact theoretical period for equal mass binary at separation d:
    // r_orbit = d/2, v = sqrt(G*M / (2*d))
    // T = 2*pi*(d/2) / v
    const vExact = Math.sqrt((G_CONSTANT * SOLAR_MASS) / (2 * ASTRONOMICAL_UNIT));
    const periodSeconds = (Math.PI * ASTRONOMICAL_UNIT) / vExact;

    // Advance for 1 full orbit with dt = 3600s
    const dt = 3600;
    const steps = Math.round(periodSeconds / dt);
    const subH = periodSeconds / steps;

    for (let s = 0; s < steps; s++) {
      engine.step(subH);
    }

    const finalState = engine.getState();

    // Symplectic Energy drift < 1e-5
    expect(finalState.conservation.energyError).toBeLessThan(1e-5);
    expect(Math.abs((finalState.totalEnergy - initState.totalEnergy) / initState.totalEnergy)).toBeLessThan(1e-5);

    // Angular momentum conservation drift < 1e-12
    expect(finalState.conservation.angularMomentumError).toBeLessThan(1e-12);

    // Orbit closure: position return error < 0.1% of orbital radius
    const rOrbit = ASTRONOMICAL_UNIT / 2;
    const finalDist = vec3.distance(finalState.bodies[0].position, bodies[0].position);
    expect(finalDist / rOrbit).toBeLessThan(0.002);
  });

  it('preserves zero linear momentum in the Centre-of-Mass frame', () => {
    const bodies = generateBarycentricInitialState({
      mass1: SOLAR_MASS * 2,
      mass2: SOLAR_MASS * 0.5,
      radius1: 7e8,
      radius2: 5e8,
      separation: 1.5 * ASTRONOMICAL_UNIT,
      speedFactor: 1.0,
    });

    const engine = new SimulationEngine(bodies[0], bodies[1]);
    const initState = engine.getState();

    expect(initState.linearMomentum.magnitude).toBeLessThan(1e-4);

    // Run 500 steps
    for (let i = 0; i < 500; i++) {
      engine.step(1800);
    }

    const finalState = engine.getState();
    expect(finalState.linearMomentum.magnitude).toBeLessThan(1e-4);
    expect(vec3.length(finalState.barycenter.velocity)).toBeLessThan(1e-6);
  });
});
