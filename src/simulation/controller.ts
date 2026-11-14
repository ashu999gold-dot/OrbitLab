// ORBITLAB — Simulation Controller
// High-level orchestration of Physics Engine, Simulation Clock, and playback controls

import type { CelestialBody, SystemState } from '../physics/physics-types';
import { SimulationClock } from './clock';
import { SimulationEngine } from './engine';

export interface ControllerOptions {
  body1: CelestialBody;
  body2: CelestialBody;
  initialDt?: number;
  initialTimeScale?: number;
  maxSubsteps?: number;
}

export type StateListener = (state: SystemState, isFallingBehind: boolean) => void;

export class SimulationController {
  private engine: SimulationEngine;
  private clock: SimulationClock;
  private isPlaying: boolean = false;
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private listeners: Set<StateListener> = new Set();
  private initialBody1: CelestialBody;
  private initialBody2: CelestialBody;

  constructor(options: ControllerOptions) {
    this.initialBody1 = { ...options.body1 };
    this.initialBody2 = { ...options.body2 };
    this.engine = new SimulationEngine(options.body1, options.body2);
    this.clock = new SimulationClock({
      fixedDt: options.initialDt || 900,
      timeScale: options.initialTimeScale || 200000,
      maxSubstepsPerFrame: options.maxSubsteps || 32,
    });
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Emit initial state
    listener(this.engine.getState(), false);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(isFallingBehind: boolean): void {
    const state = this.engine.getState();
    for (const listener of this.listeners) {
      listener(state, isFallingBehind);
    }
  }

  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public step(): SystemState {
    this.pause();
    const dt = this.clock.getFixedDt();
    const state = this.engine.step(dt);
    this.notify(false);
    return state;
  }

  public reset(b1?: CelestialBody, b2?: CelestialBody): void {
    this.pause();
    const target1 = b1 || this.initialBody1;
    const target2 = b2 || this.initialBody2;
    this.initialBody1 = { ...target1 };
    this.initialBody2 = { ...target2 };

    this.engine.reset(target1, target2, 0);
    this.clock.reset(0);
    this.notify(false);
  }

  public setBodies(b1: CelestialBody, b2: CelestialBody): void {
    this.initialBody1 = { ...b1 };
    this.initialBody2 = { ...b2 };
    this.engine.reset(b1, b2, 0);
    this.clock.reset(0);
    this.notify(false);
  }

  public setTimeScale(scale: number): void {
    this.clock.setTimeScale(scale);
  }

  public getTimeScale(): number {
    return this.clock.getTimeScale();
  }

  public setFixedDt(dt: number): void {
    this.clock.setFixedDt(dt);
  }

  public getFixedDt(): number {
    return this.clock.getFixedDt();
  }

  public setMaxSubsteps(substeps: number): void {
    this.clock.setMaxSubsteps(substeps);
  }

  public getState(): SystemState {
    return this.engine.getState();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private loop(timestamp: number): void {
    if (!this.isPlaying) return;

    const deltaMs = Math.min(timestamp - this.lastTimestamp, 100);
    this.lastTimestamp = timestamp;

    const realDeltaSec = deltaMs / 1000;
    const { stepsToExecute, stepDt, fallingBehind } = this.clock.update(realDeltaSec);

    for (let i = 0; i < stepsToExecute; i++) {
      this.engine.step(stepDt);
      if (this.engine.getState().collision.isColliding) {
        this.pause();
        break;
      }
    }

    this.notify(fallingBehind);

    if (this.isPlaying) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public dispose(): void {
    this.pause();
    this.listeners.clear();
  }
}
