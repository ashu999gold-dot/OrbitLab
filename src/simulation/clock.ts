// ORBITLAB — Simulation Clock & Fixed-Step Accumulator
// Ensures strictly deterministic physics integration decoupled from rendering framerate

export interface ClockOptions {
  fixedDt: number;          // integration step in seconds (h)
  timeScale: number;        // speed multiplier (e.g. 1.0, 10.0, 1000.0)
  maxSubstepsPerFrame: number; // prevent spiral-of-death when framerate drops
}

export class SimulationClock {
  private fixedDt: number;
  private timeScale: number;
  private maxSubstepsPerFrame: number;
  private accumulator: number = 0;
  private totalSimulatedTime: number = 0;
  private isFallingBehind: boolean = false;

  constructor(options: ClockOptions) {
    this.fixedDt = Math.max(1e-4, options.fixedDt);
    this.timeScale = Math.max(1e-2, options.timeScale);
    this.maxSubstepsPerFrame = Math.max(1, options.maxSubstepsPerFrame);
  }

  public setFixedDt(dt: number): void {
    if (dt > 0 && Number.isFinite(dt)) {
      this.fixedDt = dt;
    }
  }

  public getFixedDt(): number {
    return this.fixedDt;
  }

  public setTimeScale(scale: number): void {
    if (scale > 0 && Number.isFinite(scale)) {
      this.timeScale = scale;
    }
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public setMaxSubsteps(substeps: number): void {
    this.maxSubstepsPerFrame = Math.max(1, substeps);
  }

  public getMaxSubsteps(): number {
    return this.maxSubstepsPerFrame;
  }

  public reset(time: number = 0): void {
    this.accumulator = 0;
    this.totalSimulatedTime = time;
    this.isFallingBehind = false;
  }

  /**
   * Given real-world delta time in seconds from requestAnimationFrame,
   * calculates how many fixed integration steps to execute.
   */
  public update(realDeltaSeconds: number): { stepsToExecute: number; stepDt: number; fallingBehind: boolean } {
    // Clamp extreme frame spikes (e.g. tab backgrounded) to 0.1s
    const clampedDelta = Math.min(Math.max(0, realDeltaSeconds), 0.1);
    const targetSimTime = clampedDelta * this.timeScale;

    this.accumulator += targetSimTime;

    const maxSimTimeAllowed = this.maxSubstepsPerFrame * this.fixedDt;
    if (this.accumulator > maxSimTimeAllowed) {
      this.isFallingBehind = true;
      // Clamp accumulator to avoid uncontrolled catch-up loops
      this.accumulator = maxSimTimeAllowed;
    } else {
      this.isFallingBehind = false;
    }

    const stepsToExecute = Math.floor(this.accumulator / this.fixedDt);
    this.accumulator -= stepsToExecute * this.fixedDt;
    this.totalSimulatedTime += stepsToExecute * this.fixedDt;

    return {
      stepsToExecute,
      stepDt: this.fixedDt,
      fallingBehind: this.isFallingBehind,
    };
  }

  public getSimulatedTime(): number {
    return this.totalSimulatedTime;
  }

  public isBehind(): boolean {
    return this.isFallingBehind;
  }
}
