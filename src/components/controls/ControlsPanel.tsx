// ORBITLAB — Interactive Physics & Simulation Controls
// Includes Preset Loader, Play/Pause/Step/Reset, Beginner sliders,
// Advanced Cartesian State Vector inputs, and 3D Visual overlay toggles.

import React, { useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  FastForward,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  StepForward,
} from 'lucide-react';
import type { CelestialBody, PresetDefinition } from '../../types/physics';
import { PRESETS, computeBarycentricInitialConditions } from '../../physics/presets';
import type { CameraFocusMode } from '../canvas/OrbitCanvas';

interface ControlsPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStepForward: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  substeps: number;
  onSubstepsChange: (n: number) => void;
  currentPresetId: string;
  onSelectPreset: (preset: PresetDefinition) => void;
  bodies: [CelestialBody, CelestialBody];
  onApplyCustomState: (b1: CelestialBody, b2: CelestialBody) => void;
  cameraFocus: CameraFocusMode;
  onCameraFocusChange: (mode: CameraFocusMode) => void;
  showTrails: boolean;
  onToggleTrails: () => void;
  showVelocityVectors: boolean;
  onToggleVelocityVectors: () => void;
  showForceVectors: boolean;
  onToggleForceVectors: () => void;
  showBarycenter: boolean;
  onToggleBarycenter: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showDistanceLine: boolean;
  onToggleDistanceLine: () => void;
  onResetCameraView: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  onStepForward,
  timeScale,
  onTimeScaleChange,
  substeps,
  onSubstepsChange,
  currentPresetId,
  onSelectPreset,
  bodies,
  onApplyCustomState,
  cameraFocus,
  onCameraFocusChange,
  showTrails,
  onToggleTrails,
  showVelocityVectors,
  onToggleVelocityVectors,
  showForceVectors,
  onToggleForceVectors,
  showBarycenter,
  onToggleBarycenter,
  showGrid,
  onToggleGrid,
  showDistanceLine,
  onToggleDistanceLine,
  onResetCameraView,
}) => {
  const [tab, setTab] = useState<'presets' | 'standard' | 'cartesian' | 'view'>('presets');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Cartesian input fields state
  const [cartesianInputs, setCartesianInputs] = useState({
    m1: bodies[0].mass.toExponential(4),
    x1: bodies[0].position.x.toExponential(4),
    y1: bodies[0].position.y.toExponential(4),
    z1: bodies[0].position.z.toExponential(4),
    vx1: bodies[0].velocity.x.toFixed(2),
    vy1: bodies[0].velocity.y.toFixed(2),
    vz1: bodies[0].velocity.z.toFixed(2),

    m2: bodies[1].mass.toExponential(4),
    x2: bodies[1].position.x.toExponential(4),
    y2: bodies[1].position.y.toExponential(4),
    z2: bodies[1].position.z.toExponential(4),
    vx2: bodies[1].velocity.x.toFixed(2),
    vy2: bodies[1].velocity.y.toFixed(2),
    vz2: bodies[1].velocity.z.toFixed(2),
  });

  // Beginner parameters
  const currentSep = Math.sqrt(
    (bodies[1].position.x - bodies[0].position.x) ** 2 +
    (bodies[1].position.y - bodies[0].position.y) ** 2 +
    (bodies[1].position.z - bodies[0].position.z) ** 2
  );

  const [beginnerSep, setBeginnerSep] = useState(currentSep);
  const [beginnerM1, setBeginnerM1] = useState(bodies[0].mass);
  const [beginnerM2, setBeginnerM2] = useState(bodies[1].mass);
  const [beginnerEccentricity, setBeginnerEccentricity] = useState(0.0);
  const [beginnerInclination, setBeginnerInclination] = useState(0);

  // Sync inputs when bodies change externally
  const syncCartesianFromBodies = (b1: CelestialBody, b2: CelestialBody) => {
    setCartesianInputs({
      m1: b1.mass.toExponential(4),
      x1: b1.position.x.toExponential(4),
      y1: b1.position.y.toExponential(4),
      z1: b1.position.z.toExponential(4),
      vx1: b1.velocity.x.toFixed(2),
      vy1: b1.velocity.y.toFixed(2),
      vz1: b1.velocity.z.toFixed(2),

      m2: b2.mass.toExponential(4),
      x2: b2.position.x.toExponential(4),
      y2: b2.position.y.toExponential(4),
      z2: b2.position.z.toExponential(4),
      vx2: b2.velocity.x.toFixed(2),
      vy2: b2.velocity.y.toFixed(2),
      vz2: b2.velocity.z.toFixed(2),
    });
  };

  const handleApplyCartesian = () => {
    try {
      const b1: CelestialBody = {
        ...bodies[0],
        mass: Math.max(1, parseFloat(cartesianInputs.m1)),
        position: {
          x: parseFloat(cartesianInputs.x1) || 0,
          y: parseFloat(cartesianInputs.y1) || 0,
          z: parseFloat(cartesianInputs.z1) || 0,
        },
        velocity: {
          x: parseFloat(cartesianInputs.vx1) || 0,
          y: parseFloat(cartesianInputs.vy1) || 0,
          z: parseFloat(cartesianInputs.vz1) || 0,
        },
      };

      const b2: CelestialBody = {
        ...bodies[1],
        mass: Math.max(1, parseFloat(cartesianInputs.m2)),
        position: {
          x: parseFloat(cartesianInputs.x2) || 0,
          y: parseFloat(cartesianInputs.y2) || 0,
          z: parseFloat(cartesianInputs.z2) || 0,
        },
        velocity: {
          x: parseFloat(cartesianInputs.vx2) || 0,
          y: parseFloat(cartesianInputs.vy2) || 0,
          z: parseFloat(cartesianInputs.vz2) || 0,
        },
      };

      onApplyCustomState(b1, b2);
    } catch (err) {
      console.error('Invalid Cartesian input numbers', err);
    }
  };

  // Zero Center of Mass Momentum
  const handleZeroBarycenterMomentum = () => {
    const m1 = bodies[0].mass;
    const m2 = bodies[1].mass;
    const totalM = m1 + m2;
    const vcmX = (m1 * bodies[0].velocity.x + m2 * bodies[1].velocity.x) / totalM;
    const vcmY = (m1 * bodies[0].velocity.y + m2 * bodies[1].velocity.y) / totalM;
    const vcmZ = (m1 * bodies[0].velocity.z + m2 * bodies[1].velocity.z) / totalM;

    const b1: CelestialBody = {
      ...bodies[0],
      velocity: {
        x: bodies[0].velocity.x - vcmX,
        y: bodies[0].velocity.y - vcmY,
        z: bodies[0].velocity.z - vcmZ,
      },
    };
    const b2: CelestialBody = {
      ...bodies[1],
      velocity: {
        x: bodies[1].velocity.x - vcmX,
        y: bodies[1].velocity.y - vcmY,
        z: bodies[1].velocity.z - vcmZ,
      },
    };

    onApplyCustomState(b1, b2);
    syncCartesianFromBodies(b1, b2);
  };

  // Apply beginner controls
  const handleApplyBeginner = (eVal: number = beginnerEccentricity) => {
    const init = computeBarycentricInitialConditions(
      beginnerM1,
      beginnerM2,
      beginnerSep,
      eVal,
      bodies[0].radius,
      bodies[1].radius,
      beginnerInclination
    );

    const b1: CelestialBody = {
      ...bodies[0],
      mass: beginnerM1,
      position: init.body1.position,
      velocity: init.body1.velocity,
    };
    const b2: CelestialBody = {
      ...bodies[1],
      mass: beginnerM2,
      position: init.body2.position,
      velocity: init.body2.velocity,
    };

    onApplyCustomState(b1, b2);
    syncCartesianFromBodies(b1, b2);
  };

  return (
    <div className="glass-panel rounded-xl p-3.5 border border-white/10 flex flex-col gap-3 shadow-2xl max-w-md w-full select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Simulation Controls
          </h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Main Playback Action Bar */}
          <div className="grid grid-cols-4 gap-1.5 bg-space-900/90 p-1.5 rounded-lg border border-white/5">
            <button
              onClick={onTogglePlay}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all col-span-2 ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={onStepForward}
              disabled={isPlaying}
              className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-md text-xs font-medium bg-space-850 hover:bg-space-800 text-slate-200 border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Step Forward by 1 Timestep (Δt)"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-md text-xs font-medium bg-space-850 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-white/5 transition-all"
              title="Reset Simulation to Initial Conditions (R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed & Sub-stepping slider */}
          <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FastForward className="w-3.5 h-3.5 text-blue-400" />
                Simulation Speed
              </span>
              <span className="font-mono text-blue-400 font-semibold text-[11px]">
                {timeScale >= 1e6
                  ? `${(timeScale / 1e6).toFixed(1)}M×`
                  : timeScale >= 1e3
                  ? `${(timeScale / 1e3).toFixed(1)}k×`
                  : `${timeScale.toFixed(1)}×`}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.05"
              value={Math.log10(Math.max(0.1, timeScale))}
              onChange={(e) => onTimeScaleChange(Math.pow(10, parseFloat(e.target.value)))}
              className="w-full h-1.5 bg-space-950 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>0.1× Realtime</span>
              <div className="flex items-center gap-1">
                <span>Substeps:</span>
                <select
                  value={substeps}
                  onChange={(e) => onSubstepsChange(parseInt(e.target.value, 10))}
                  className="bg-space-950 text-slate-200 rounded px-1.5 py-0.5 border border-white/10 text-[10px] font-mono"
                >
                  <option value={4}>4 (Fast)</option>
                  <option value={8}>8 (Standard)</option>
                  <option value={16}>16 (High Precision)</option>
                  <option value={32}>32 (Extreme / Eccentric)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 text-xs">
            <button
              onClick={() => setTab('presets')}
              className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all ${
                tab === 'presets'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setTab('standard')}
              className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all ${
                tab === 'standard'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setTab('cartesian')}
              className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all ${
                tab === 'cartesian'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Cartesian
            </button>
            <button
              onClick={() => setTab('view')}
              className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all ${
                tab === 'view'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              View
            </button>
          </div>

          {/* TAB 1: PRESETS */}
          {tab === 'presets' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1.5">
                {PRESETS.map((p) => {
                  const isSelected = p.id === currentPresetId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPreset(p)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-slate-100 shadow-md shadow-blue-500/10'
                          : 'bg-space-900/60 border-white/5 text-slate-300 hover:bg-space-850 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-100">{p.name}</span>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{p.description}</p>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-amber-300/90 bg-amber-500/5 p-1.5 rounded">
                          {p.approximationNotes}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BEGINNER CONTROLS */}
          {tab === 'standard' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-blue-400 uppercase">Mass Settings</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Body 1 (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={beginnerM1}
                      onChange={(e) => setBeginnerM1(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Body 2 (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={beginnerM2}
                      onChange={(e) => setBeginnerM2(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Initial Separation (m)</label>
                  <input
                    type="number"
                    step="any"
                    value={beginnerSep}
                    onChange={(e) => setBeginnerSep(Math.max(1e3, parseFloat(e.target.value) || 1e3))}
                    className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-400 uppercase">Trajectory Geometry</span>
                  <span className="text-[10px] font-mono text-slate-300">
                    e = {beginnerEccentricity.toFixed(2)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Target Orbit Eccentricity</span>
                    <span>{beginnerEccentricity === 0 ? 'Circular' : beginnerEccentricity < 1 ? 'Elliptical' : 'Escape'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={beginnerEccentricity}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setBeginnerEccentricity(v);
                    }}
                    className="w-full h-1.5 bg-space-950 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Orbital Inclination (3D Tilt)</span>
                    <span className="font-mono">{beginnerInclination}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={beginnerInclination}
                    onChange={(e) => setBeginnerInclination(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-space-950 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setBeginnerEccentricity(0);
                      handleApplyBeginner(0);
                    }}
                    className="py-1.5 px-2 bg-space-850 hover:bg-space-800 text-blue-400 rounded border border-blue-500/20 text-[11px] font-medium transition-all"
                  >
                    Force Circular (e = 0)
                  </button>
                  <button
                    onClick={() => handleApplyBeginner()}
                    className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold transition-all shadow-md shadow-blue-600/20"
                  >
                    Apply Parameters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCED CARTESIAN STATE VECTORS */}
          {tab === 'cartesian' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <p className="text-[11px] text-slate-400">
                Direct state vector entry in SI units (m, m/s, kg).
              </p>

              {/* Body 1 Input */}
              <div className="bg-space-900/80 p-2.5 rounded-lg border border-blue-500/30 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-blue-400 uppercase">
                  Body 1 (Primary - Blue)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="col-span-4">
                    <label className="text-[9px] text-slate-400">Mass (kg)</label>
                    <input
                      type="text"
                      value={cartesianInputs.m1}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, m1: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">X (m)</label>
                    <input
                      type="text"
                      value={cartesianInputs.x1}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, x1: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Y (m)</label>
                    <input
                      type="text"
                      value={cartesianInputs.y1}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, y1: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Z (m)</label>
                    <input
                      type="text"
                      value={cartesianInputs.z1}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, z1: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Vx (m/s)</label>
                    <input
                      type="text"
                      value={cartesianInputs.vx1}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, vx1: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* Body 2 Input */}
              <div className="bg-space-900/80 p-2.5 rounded-lg border border-orange-500/30 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-orange-400 uppercase">
                  Body 2 (Secondary - Orange)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="col-span-4">
                    <label className="text-[9px] text-slate-400">Mass (kg)</label>
                    <input
                      type="text"
                      value={cartesianInputs.m2}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, m2: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">X (m)</label>
                    <input
                      type="text"
                      value={cartesianInputs.x2}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, x2: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Y (m)</label>
                    <input
                      type="text"
                      value={cartesianInputs.y2}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, y2: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Z (m)</label>
                    <input
                      type="text"
                      value={cartesianInputs.z2}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, z2: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Vx (m/s)</label>
                    <input
                      type="text"
                      value={cartesianInputs.vx2}
                      onChange={(e) => setCartesianInputs({ ...cartesianInputs, vx2: e.target.value })}
                      className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleZeroBarycenterMomentum}
                  className="py-1.5 px-2 bg-space-850 hover:bg-space-800 text-slate-200 rounded border border-white/10 text-[11px] font-medium transition-all"
                  title="Shift velocities so net momentum P = 0"
                >
                  Zero Barycenter Momentum
                </button>
                <button
                  onClick={handleApplyCartesian}
                  className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold transition-all shadow-md shadow-blue-600/20"
                >
                  Apply Vectors
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: VIEW & OVERLAYS */}
          {tab === 'view' && (
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-blue-400 uppercase flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Camera Target
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['barycenter', 'body1', 'body2', 'free'] as CameraFocusMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onCameraFocusChange(mode)}
                      className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-all ${
                        cameraFocus === mode
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-space-950 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'barycenter'
                        ? 'Barycenter (COM)'
                        : mode === 'body1'
                        ? 'Body 1 (Blue)'
                        : mode === 'body2'
                        ? 'Body 2 (Orange)'
                        : 'Free Orbit'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={onResetCameraView}
                  className="mt-1 py-1.5 px-2 rounded bg-space-850 hover:bg-space-800 text-slate-300 border border-white/10 text-[11px] font-medium transition-all"
                >
                  Reset Camera Orientation
                </button>
              </div>

              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-blue-400 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  3D Visual Overlays
                </span>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Show Trajectory Trails</span>
                    <input
                      type="checkbox"
                      checked={showTrails}
                      onChange={onToggleTrails}
                      className="rounded bg-space-950 border-white/10 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Velocity Vectors (v)</span>
                    <input
                      type="checkbox"
                      checked={showVelocityVectors}
                      onChange={onToggleVelocityVectors}
                      className="rounded bg-space-950 border-white/10 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Gravitational Force Vectors (F)</span>
                    <input
                      type="checkbox"
                      checked={showForceVectors}
                      onChange={onToggleForceVectors}
                      className="rounded bg-space-950 border-white/10 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Barycenter Marker (Crosshair)</span>
                    <input
                      type="checkbox"
                      checked={showBarycenter}
                      onChange={onToggleBarycenter}
                      className="rounded bg-space-950 border-white/10 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Polar Reference Grid</span>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={onToggleGrid}
                      className="rounded bg-space-950 border-white/10 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Separation Line (r)</span>
                    <input
                      type="checkbox"
                      checked={showDistanceLine}
                      onChange={onToggleDistanceLine}
                      className="rounded bg-space-950 border-white/10 text-blue-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
