// ORBITLAB — ME 206 Statics & Dynamics Two-Body Orbital Simulator
// Main Application Component

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Camera,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { TwoBodySimulator } from './physics/engine';
import { PRESETS } from './physics/presets';
import type { CelestialBody, PhysicsState, PresetDefinition } from './types/physics';
import { type CameraFocusMode, OrbitCanvas } from './components/canvas/OrbitCanvas';
import { ControlsPanel } from './components/controls/ControlsPanel';
import { PhysicsDashboard } from './components/dashboard/PhysicsDashboard';
import { EducationalModal } from './components/educational/EducationalModal';

const DEFAULT_PRESET = PRESETS[0]; // Earth-Moon
const MAX_HISTORY_POINTS = 150;

export const App: React.FC = () => {
  // Preset & Configuration state
  const [currentPreset, setCurrentPreset] = useState<PresetDefinition>(DEFAULT_PRESET);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(DEFAULT_PRESET.defaultTimeScale);
  const [substeps, setSubsteps] = useState<number>(DEFAULT_PRESET.defaultSubsteps);
  const [cameraFocus, setCameraFocus] = useState<CameraFocusMode>('barycenter');

  // Visual Overlays toggles
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showVelocityVectors, setShowVelocityVectors] = useState<boolean>(true);
  const [showForceVectors, setShowForceVectors] = useState<boolean>(true);
  const [showBarycenter, setShowBarycenter] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDistanceLine, setShowDistanceLine] = useState<boolean>(true);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(1);

  // Panels visibility toggles
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [showEducationModal, setShowEducationModal] = useState<boolean>(false);

  // Simulator instance ref
  const simulatorRef = useRef<TwoBodySimulator>(
    new TwoBodySimulator(
      { id: 'b1', ...DEFAULT_PRESET.body1 },
      { id: 'b2', ...DEFAULT_PRESET.body2 }
    )
  );

  // Live Physics State in React for UI display
  const [physicsState, setPhysicsState] = useState<PhysicsState>(() =>
    simulatorRef.current.getState()
  );

  // Telemetry History for Charts
  const [historyTime, setHistoryTime] = useState<number[]>([0]);
  const [historyDistance, setHistoryDistance] = useState<number[]>([physicsState.distance]);
  const [historyKinetic, setHistoryKinetic] = useState<number[]>([physicsState.kineticEnergy]);
  const [historyPotential, setHistoryPotential] = useState<number[]>([physicsState.potentialEnergy]);
  const [historyTotal, setHistoryTotal] = useState<number[]>([physicsState.totalEnergy]);

  // Telemetry accumulator ref for smooth UI throttling
  const lastUiUpdateRef = useRef<number>(0);

  // Switch preset callback
  const handleSelectPreset = useCallback((preset: PresetDefinition) => {
    setCurrentPreset(preset);
    setTimeScale(preset.defaultTimeScale);
    setSubsteps(preset.defaultSubsteps);

    const b1: CelestialBody = { id: 'b1', ...preset.body1 };
    const b2: CelestialBody = { id: 'b2', ...preset.body2 };

    simulatorRef.current.reset(b1, b2);
    const newState = simulatorRef.current.getState();
    setPhysicsState(newState);

    // Reset history buffers
    setHistoryTime([0]);
    setHistoryDistance([newState.distance]);
    setHistoryKinetic([newState.kineticEnergy]);
    setHistoryPotential([newState.potentialEnergy]);
    setHistoryTotal([newState.totalEnergy]);

    // Trigger camera re-orientation & trail reset
    setResetCameraTrigger((c) => c + 1);
  }, []);

  // Reset simulation to initial conditions of current preset
  const handleReset = useCallback(() => {
    const b1: CelestialBody = { id: 'b1', ...currentPreset.body1 };
    const b2: CelestialBody = { id: 'b2', ...currentPreset.body2 };

    simulatorRef.current.reset(b1, b2);
    const newState = simulatorRef.current.getState();
    setPhysicsState(newState);

    setHistoryTime([0]);
    setHistoryDistance([newState.distance]);
    setHistoryKinetic([newState.kineticEnergy]);
    setHistoryPotential([newState.potentialEnergy]);
    setHistoryTotal([newState.totalEnergy]);

    setResetCameraTrigger((c) => c + 1);
  }, [currentPreset]);

  // Single step forward
  const handleStepForward = useCallback(() => {
    const dt = currentPreset.defaultDt;
    const nextState = simulatorRef.current.advance(dt, substeps);
    setPhysicsState(nextState);

    // Update history
    setHistoryTime((t) => [...t.slice(-MAX_HISTORY_POINTS), nextState.time]);
    setHistoryDistance((d) => [...d.slice(-MAX_HISTORY_POINTS), nextState.distance]);
    setHistoryKinetic((k) => [...k.slice(-MAX_HISTORY_POINTS), nextState.kineticEnergy]);
    setHistoryPotential((p) => [...p.slice(-MAX_HISTORY_POINTS), nextState.potentialEnergy]);
    setHistoryTotal((e) => [...e.slice(-MAX_HISTORY_POINTS), nextState.totalEnergy]);
  }, [currentPreset.defaultDt, substeps]);

  // Apply custom state (from beginner or cartesian inputs)
  const handleApplyCustomState = useCallback(
    (b1: CelestialBody, b2: CelestialBody) => {
      simulatorRef.current.reset(b1, b2);
      const newState = simulatorRef.current.getState();
      setPhysicsState(newState);

      setHistoryTime([0]);
      setHistoryDistance([newState.distance]);
      setHistoryKinetic([newState.kineticEnergy]);
      setHistoryPotential([newState.potentialEnergy]);
      setHistoryTotal([newState.totalEnergy]);

      setResetCameraTrigger((c) => c + 1);
    },
    []
  );

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Main decoupled physics integration loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const deltaMs = Math.min(timestamp - lastTimestamp, 100); // clamp spikes
      lastTimestamp = timestamp;

      if (isPlaying) {
        // Physical time to advance in this animation frame
        const deltaSeconds = deltaMs / 1000;
        const totalPhysicsDt = deltaSeconds * timeScale;

        // Subdivide into optimal chunks for Velocity Verlet
        const stepDt = currentPreset.defaultDt;
        const stepsToRun = Math.max(1, Math.min(50, Math.round(totalPhysicsDt / stepDt)));
        const actualDtPerStep = totalPhysicsDt / stepsToRun;

        for (let s = 0; s < stepsToRun; s++) {
          simulatorRef.current.advance(actualDtPerStep, substeps);
        }

        // Throttle UI React state updates to 30 FPS to preserve 60/120 FPS WebGL rendering
        if (timestamp - lastUiUpdateRef.current > 33) {
          lastUiUpdateRef.current = timestamp;
          const currentState = simulatorRef.current.getState();
          setPhysicsState(currentState);

          // Append telemetry point
          setHistoryTime((t) => [...t.slice(-MAX_HISTORY_POINTS), currentState.time]);
          setHistoryDistance((d) => [...d.slice(-MAX_HISTORY_POINTS), currentState.distance]);
          setHistoryKinetic((k) => [...k.slice(-MAX_HISTORY_POINTS), currentState.kineticEnergy]);
          setHistoryPotential((p) => [...p.slice(-MAX_HISTORY_POINTS), currentState.potentialEnergy]);
          setHistoryTotal((e) => [...e.slice(-MAX_HISTORY_POINTS), currentState.totalEnergy]);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, timeScale, substeps, currentPreset.defaultDt]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'KeyS' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isPlaying) handleStepForward();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setResetCameraTrigger((c) => c + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleReset, handleStepForward, isPlaying]);

  // Format elapsed simulation time
  const formatElapsedTime = (sec: number) => {
    const days = sec / 86400;
    if (days >= 365.25) return `${(days / 365.25).toFixed(2)} years`;
    if (days >= 1) return `${days.toFixed(2)} days (${(sec / 3600).toFixed(1)} hrs)`;
    const hrs = sec / 3600;
    if (hrs >= 1) return `${hrs.toFixed(2)} hours`;
    if (sec >= 60) return `${(sec / 60).toFixed(1)} mins`;
    return `${sec.toFixed(1)} s`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950 text-slate-100 flex flex-col select-none">
      {/* 1. TOP NAVBAR */}
      <header className="h-14 px-4 bg-space-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-base text-white">ORBITLAB</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ME 206
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Two-Body Orbital Mechanics Simulator • Statics & Dynamics
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-space-950/80 p-1 rounded-lg border border-white/5">
          {PRESETS.map((p) => {
            const isSelected = p.id === currentPreset.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Play/Pause Header */}
          <button
            onClick={handleTogglePlay}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30'
            }`}
            title="Spacebar: Toggle Simulation"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-space-850 hover:bg-space-800 text-slate-300 border border-white/10 hover:text-white transition-colors"
            title="R: Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setResetCameraTrigger((c) => c + 1)}
            className="p-2 rounded-lg bg-space-850 hover:bg-space-800 text-slate-300 border border-white/10 hover:text-white transition-colors"
            title="C: Reset Camera View"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowEducationModal(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Open ME 206 Statics & Dynamics Theory Guide"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Theory Guide</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3D WORKSPACE WITH FLOATING OVERLAYS */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Full-screen 3D Three.js WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          <OrbitCanvas
            physicsState={physicsState}
            distanceScale={currentPreset.distanceScale}
            bodyRadiusScale={currentPreset.bodyRadiusScale}
            cameraFocus={cameraFocus}
            showTrails={showTrails}
            showVelocityVectors={showVelocityVectors}
            showForceVectors={showForceVectors}
            showBarycenter={showBarycenter}
            showGrid={showGrid}
            showDistanceLine={showDistanceLine}
            trailLength={2000}
            resetCameraTrigger={resetCameraTrigger}
          />
        </div>

        {/* Floating Left Overlay: Simulation Controls */}
        <div className="absolute top-4 left-4 z-20 max-w-sm w-full">
          {showControls ? (
            <ControlsPanel
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onStepForward={handleStepForward}
              timeScale={timeScale}
              onTimeScaleChange={setTimeScale}
              substeps={substeps}
              onSubstepsChange={setSubsteps}
              currentPresetId={currentPreset.id}
              onSelectPreset={handleSelectPreset}
              bodies={physicsState.bodies}
              onApplyCustomState={handleApplyCustomState}
              cameraFocus={cameraFocus}
              onCameraFocusChange={setCameraFocus}
              showTrails={showTrails}
              onToggleTrails={() => setShowTrails(!showTrails)}
              showVelocityVectors={showVelocityVectors}
              onToggleVelocityVectors={() => setShowVelocityVectors(!showVelocityVectors)}
              showForceVectors={showForceVectors}
              onToggleForceVectors={() => setShowForceVectors(!showForceVectors)}
              showBarycenter={showBarycenter}
              onToggleBarycenter={() => setShowBarycenter(!showBarycenter)}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              showDistanceLine={showDistanceLine}
              onToggleDistanceLine={() => setShowDistanceLine(!showDistanceLine)}
              onResetCameraView={() => setResetCameraTrigger((c) => c + 1)}
            />
          ) : (
            <button
              onClick={() => setShowControls(true)}
              className="glass-panel px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 hover:bg-space-850/80 transition-all border border-white/10"
            >
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Show Controls</span>
            </button>
          )}
        </div>

        {/* Floating Right Overlay: Physics Telemetry & Real-Time Graphs */}
        <div className="absolute top-4 right-4 z-20 max-w-sm w-full">
          <PhysicsDashboard
            physicsState={physicsState}
            historyTime={historyTime}
            historyDistance={historyDistance}
            historyKinetic={historyKinetic}
            historyPotential={historyPotential}
            historyTotal={historyTotal}
            onOpenEducation={() => setShowEducationModal(true)}
            isCollapsed={!showDashboard}
            onToggleCollapse={() => setShowDashboard(!showDashboard)}
          />
        </div>

        {/* Center-Top Quick Status Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-space-900/80 backdrop-blur-md border border-white/10 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Time:</span>
            <span className="text-slate-100 font-semibold">{formatElapsedTime(physicsState.time)}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Orbit:</span>
            <span className="text-blue-400 uppercase font-semibold text-[11px]">
              {physicsState.orbitParameters.orbitType}
            </span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">e:</span>
            <span className="text-slate-100 font-semibold">
              {physicsState.orbitParameters.eccentricity.toFixed(3)}
            </span>
          </div>
        </div>
      </main>

      {/* 3. FOOTER STATUS BAR & KEYBOARD SHORTCUTS */}
      <footer className="h-8 px-4 bg-space-950 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 z-30 shrink-0">
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Integrator:</span>
            <span className="text-emerald-400">Symplectic Velocity Verlet</span>
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">Substeps:</span>
            <span className="text-slate-300">{substeps} / frame</span>
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">Energy Drift:</span>
            <span className="text-slate-300">{(physicsState.energyConservationError * 100).toFixed(4)}%</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-space-850 text-slate-300 border border-white/10 mr-1">Space</kbd>
            Play/Pause
          </span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-space-850 text-slate-300 border border-white/10 mr-1">R</kbd>
            Reset
          </span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-space-850 text-slate-300 border border-white/10 mr-1">S</kbd>
            Step
          </span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-space-850 text-slate-300 border border-white/10 mr-1">C</kbd>
            Camera
          </span>
          <span>ME 206 Orbital Dynamics</span>
        </div>
      </footer>

      {/* 4. EDUCATIONAL MODAL */}
      <EducationalModal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
      />
    </div>
  );
};

export default App;
