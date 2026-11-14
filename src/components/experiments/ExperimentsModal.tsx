// ORBITLAB — Guided Dynamics Experiments & Trajectory Comparison Workflow
// Implements the 3 ME 206 guided experiments with baseline comparison snapshotting

import React, { useState } from 'react';
import {
  Bookmark,
  FlaskConical,
  X,
} from 'lucide-react';
import type { CelestialBody } from '../../physics/physics-types';
import { SOLAR_MASS, ASTRONOMICAL_UNIT } from '../../physics/constants';
import { generateBarycentricInitialState } from '../../simulation/initial-conditions';

export interface ExperimentStep {
  label: string;
  speedMultiplier: number;
  massMultiplier?: number;
  separationMultiplier?: number;
  description: string;
}

interface ExperimentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExperimentState: (b1: CelestialBody, b2: CelestialBody, baselineLabel: string) => void;
  onSaveComparisonBaseline: () => void;
  hasActiveBaseline: boolean;
  onClearComparisonBaseline: () => void;
}

export const ExperimentsModal: React.FC<ExperimentsModalProps> = ({
  isOpen,
  onClose,
  onApplyExperimentState,
  onSaveComparisonBaseline,
  hasActiveBaseline,
  onClearComparisonBaseline,
}) => {
  const [activeExp, setActiveExp] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  // Experiment 1: Tangential Velocity Variation
  const runExp1 = (speedFactor: number, label: string) => {
    const bodies = generateBarycentricInitialState({
      mass1: SOLAR_MASS,
      mass2: SOLAR_MASS * 0.1,
      radius1: 7e8,
      radius2: 2e7,
      separation: ASTRONOMICAL_UNIT,
      speedFactor,
      name1: 'Star Primary',
      name2: `Body (${label})`,
      color1: '#3B82F6',
      color2: '#F97316',
    });
    onApplyExperimentState(bodies[0], bodies[1], `Exp 1: ${label}`);
  };

  // Experiment 2: Mass Ratio Variation
  const runExp2 = (m1Multiplier: number, label: string) => {
    const bodies = generateBarycentricInitialState({
      mass1: SOLAR_MASS * m1Multiplier,
      mass2: SOLAR_MASS * 0.1,
      radius1: 7e8 * Math.cbrt(m1Multiplier),
      radius2: 2e7,
      separation: ASTRONOMICAL_UNIT,
      speedFactor: 1.0,
      name1: `Primary (${label})`,
      name2: 'Secondary Body',
      color1: '#3B82F6',
      color2: '#F97316',
    });
    onApplyExperimentState(bodies[0], bodies[1], `Exp 2: ${label}`);
  };

  // Experiment 3: Separation Variation
  const runExp3 = (sepMultiplier: number, label: string) => {
    const bodies = generateBarycentricInitialState({
      mass1: SOLAR_MASS,
      mass2: SOLAR_MASS * 0.2,
      radius1: 7e8,
      radius2: 3e7,
      separation: ASTRONOMICAL_UNIT * sepMultiplier,
      speedFactor: 1.0,
      name1: 'Star Primary',
      name2: `Orbit (${label})`,
      color1: '#3B82F6',
      color2: '#F97316',
    });
    onApplyExperimentState(bodies[0], bodies[1], `Exp 3: ${label}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-space-900/80">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                ME 206 Dynamics Guided Experiments
              </h2>
              <p className="text-xs text-slate-400">
                Observe orbital transitions, barycenter shifts, and compare ghost trajectories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-space-950/60 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveExp(1)}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeExp === 1 ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Velocity Variation
          </button>
          <button
            onClick={() => setActiveExp(2)}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeExp === 2 ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Mass Ratio Effect
          </button>
          <button
            onClick={() => setActiveExp(3)}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeExp === 3 ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Separation & Period
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Comparison Baseline Banner */}
          <div className="bg-space-950 p-3 rounded-lg border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">Ghost Trajectory Comparison</span>
                <span className="text-[11px] text-slate-400">
                  {hasActiveBaseline
                    ? 'Active baseline is loaded! Ghost trails will appear under the new trajectory.'
                    : 'Save current trajectory as baseline to compare when changing parameters.'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {hasActiveBaseline && (
                <button
                  onClick={onClearComparisonBaseline}
                  className="px-2.5 py-1 bg-space-850 hover:bg-space-800 text-slate-400 hover:text-slate-200 rounded text-[11px] border border-white/5"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onSaveComparisonBaseline}
                className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 rounded text-[11px] font-medium border border-blue-500/30"
              >
                Snapshot Baseline
              </button>
            </div>
          </div>

          {/* EXPERIMENT 1 */}
          {activeExp === 1 && (
            <div className="space-y-3">
              <div className="bg-space-900/80 p-3.5 rounded-lg border border-blue-500/20 space-y-2">
                <span className="font-semibold text-blue-300 text-sm block">
                  Experiment 1: What happens when initial tangential velocity increases?
                </span>
                <p>
                  <strong>Academic Objective:</strong> Demonstrate the Vis-Viva equation <code className="text-blue-300">v² = GM(2/r - 1/a)</code>{' '}
                  and specific orbital energy <code className="text-blue-300">ε = v²/2 - GM/r</code>.
                  As initial speed increases from sub-circular to above escape velocity, the orbit transforms from a falling ellipse to a circle, to an elongated ellipse, and finally into an unbound hyperbolic trajectory.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => runExp1(0.7, 'Sub-Circular 0.70x')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-slate-200 block text-xs">A. Sub-Circular (0.70× v_circ)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Periapsis falls closer to primary. Kinetic energy is insufficient to sustain circular orbit.
                  </span>
                </button>

                <button
                  onClick={() => runExp1(1.0, 'Circular 1.00x')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-emerald-300 block text-xs">B. Circular Orbit (1.00× v_circ)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Exact gravitational-centripetal balance. Eccentricity e ≈ 0.
                  </span>
                </button>

                <button
                  onClick={() => runExp1(1.2, 'Elliptical 1.20x')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-blue-300 block text-xs">C. Elliptical Orbit (1.20× v_circ)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Body ascends towards a distant apoapsis (e ≈ 0.44). Bound periodic motion.
                  </span>
                </button>

                <button
                  onClick={() => runExp1(1.5, 'Hyperbolic 1.50x')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-amber-300 block text-xs">D. Hyperbolic Escape (1.50× v_circ)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Exceeds escape threshold √2 ≈ 1.414×. Total mechanical energy E &gt; 0. Body escapes to infinity.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* EXPERIMENT 2 */}
          {activeExp === 2 && (
            <div className="space-y-3">
              <div className="bg-space-900/80 p-3.5 rounded-lg border border-blue-500/20 space-y-2">
                <span className="font-semibold text-blue-300 text-sm block">
                  Experiment 2: What happens when one body’s mass increases?
                </span>
                <p>
                  <strong>Academic Objective:</strong> Investigate center-of-mass (barycenter) kinematics{' '}
                  <code className="text-blue-300">R_cm = (m₁r₁ + m₂r₂)/(m₁+m₂)</code> and Kepler’s Third Law{' '}
                  <code className="text-blue-300">T = 2π√(a³/G(m₁+m₂))</code>. Notice how the barycenter shifts towards the heavier primary, and the orbital period decreases as total mass increases.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => runExp2(0.2, 'Equal Mass 1:1')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-slate-200 block text-xs">1:1 Comparable Mass</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Barycenter sits midway between bodies. Both execute symmetrical concentric loops.
                  </span>
                </button>

                <button
                  onClick={() => runExp2(2.0, 'Moderate 10:1')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-blue-300 block text-xs">10:1 Ratio</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Primary has a visible tight wobble; secondary swings in a wide orbit.
                  </span>
                </button>

                <button
                  onClick={() => runExp2(10.0, 'Extreme 50:1')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-amber-300 block text-xs">50:1 Ratio</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Barycenter is swallowed inside the primary’s physical radius. Orbital period dramatically compressed.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* EXPERIMENT 3 */}
          {activeExp === 3 && (
            <div className="space-y-3">
              <div className="bg-space-900/80 p-3.5 rounded-lg border border-blue-500/20 space-y-2">
                <span className="font-semibold text-blue-300 text-sm block">
                  Experiment 3: How does initial separation affect gravitational attraction & orbital period?
                </span>
                <p>
                  <strong>Academic Objective:</strong> Verify Newton’s inverse-square law <code className="text-blue-300">F ∝ 1/r²</code>{' '}
                  and Kepler’s Harmonic Law <code className="text-blue-300">T² ∝ a³</code>. Doubling the distance drops gravitational force to 25% (1/4th) and increases the orbital period by 2√2 ≈ 2.83×.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => runExp3(0.5, 'Tight 0.50x AU')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-rose-300 block text-xs">Close Orbit (0.50× AU)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Gravitational force is 4× stronger. Orbital period is 0.35× (faster revolution).
                  </span>
                </button>

                <button
                  onClick={() => runExp3(1.0, 'Standard 1.00x AU')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-slate-200 block text-xs">Standard (1.00× AU)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Baseline separation for comparative harmonic analysis.
                  </span>
                </button>

                <button
                  onClick={() => runExp3(2.0, 'Wide 2.00x AU')}
                  className="p-3 bg-space-950 hover:bg-space-900 rounded-lg border border-white/5 text-left transition-all hover:border-blue-500/40"
                >
                  <span className="font-semibold text-blue-300 block text-xs">Wide Orbit (2.00× AU)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Gravitational force drops to 25%. Orbital period expands by 2.83×.
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-space-900/80 text-xs text-slate-400">
          <span>Tip: Click an experiment card to instantly re-initialize initial conditions.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-space-850 hover:bg-space-800 text-slate-200 rounded-md font-medium transition-colors"
          >
            Close Experiments
          </button>
        </div>
      </div>
    </div>
  );
};
