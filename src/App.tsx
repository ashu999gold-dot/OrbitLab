// ORBITLAB — UNIVERSAL 3D TWO-BODY GRAVITATIONAL SIMULATOR
// ME 206 Statics & Dynamics Master Application

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  BookOpen,
  Camera,
  FlaskConical,
  Maximize2,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  StepForward,
} from 'lucide-react';
import type { CelestialBody, SystemState, Vector3D } from './physics/physics-types';
import { PRESET_LIBRARY, type PresetSystem } from './simulation/presets';
import { SimulationEngine } from './simulation/engine';
import { OrbitCanvas, type CameraFocusMode, type CameraPresetView } from './components/canvas/OrbitCanvas';
import type { ReferenceFrameMode } from './visualization/ScaleManager';
import { ControlsPanel } from './components/controls/ControlsPanel';
import { PhysicsDashboard } from './components/dashboard/PhysicsDashboard';
import { UniversalObjectEditor } from './components/object-editor/UniversalObjectEditor';
import { ExperimentsModal } from './components/experiments/ExperimentsModal';
import { EducationalModal } from './components/educational/EducationalModal';
import { exportConfigurationToJson, importConfigurationFromJson } from './utils/export-import';
import { formatTimeSI } from './utils/formatting';

const DEFAULT_PRESET = PRESET_LIBRARY[0]; // Earth-Moon
const MAX_HISTORY_POINTS = 150;

export const App: React.FC = () => {
  // Preset & Configuration
  const [currentPreset, setCurrentPreset] = useState<PresetSystem>(DEFAULT_PRESET);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(DEFAULT_PRESET.defaultTimeScale);
  const [fixedDt, setFixedDt] = useState<number>(DEFAULT_PRESET.defaultDt);
  const [substeps, setSubsteps] = useState<number>(DEFAULT_PRESET.defaultSubsteps);

  // Visualization & Reference Frames
  const [referenceFrame, setReferenceFrame] = useState<ReferenceFrameMode>('inertial');
  const [enableExaggeratedRadius, setEnableExaggeratedRadius] = useState<boolean>(true);
  const [cameraFocus, setCameraFocus] = useState<CameraFocusMode>('barycenter');
  const [cameraViewTrigger, setCameraViewTrigger] = useState<CameraPresetView>('isometric');
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(1);

  // Visual Overlays
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showComparisonOverlay, setShowComparisonOverlay] = useState<boolean>(false);
  const [showVelocityVectors, setShowVelocityVectors] = useState<boolean>(true);
  const [showForceVectors, setShowForceVectors] = useState<boolean>(true);
  const [showBarycenter, setShowBarycenter] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDistanceLine, setShowDistanceLine] = useState<boolean>(true);

  // Modals & Drawers
  const [showObjectEditor, setShowObjectEditor] = useState<boolean>(false);
  const [showExperimentsModal, setShowExperimentsModal] = useState<boolean>(false);
  const [showEducationModal, setShowEducationModal] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showDashboard, setShowDashboard] = useState<boolean>(true);

  // Trajectory Comparison Baseline
  const [baselineTrail1, setBaselineTrail1] = useState<Vector3D[] | undefined>(undefined);
  const [baselineTrail2, setBaselineTrail2] = useState<Vector3D[] | undefined>(undefined);
  const [hasActiveBaseline, setHasActiveBaseline] = useState<boolean>(false);

  // Decoupled Simulation Engine Reference
  const engineRef = useRef<SimulationEngine>(
    new SimulationEngine(DEFAULT_PRESET.body1, DEFAULT_PRESET.body2)
  );

  // System State in React for UI display
  const [systemState, setSystemState] = useState<SystemState>(() =>
    engineRef.current.getState()
  );
  const [isFallingBehind, setIsFallingBehind] = useState<boolean>(false);

  // Real-Time Telemetry History for Graphs
  const [historyTime, setHistoryTime] = useState<number[]>([0]);
  const [historyDistance, setHistoryDistance] = useState<number[]>([systemState.distance]);
  const [historyKinetic, setHistoryKinetic] = useState<number[]>([systemState.kineticEnergy.total]);
  const [historyPotential, setHistoryPotential] = useState<number[]>([systemState.potentialEnergy]);
  const [historyTotal, setHistoryTotal] = useState<number[]>([systemState.totalEnergy]);

  // Current active trajectory buffer accumulator for snapshotting
  const activeTrail1Ref = useRef<Vector3D[]>([]);
  const activeTrail2Ref = useRef<Vector3D[]>([]);
  const lastUiUpdateRef = useRef<number>(0);

  // Switch Preset
  const handleSelectPreset = useCallback((preset: PresetSystem) => {
    setCurrentPreset(preset);
    setTimeScale(preset.defaultTimeScale);
    setFixedDt(preset.defaultDt);
    setSubsteps(preset.defaultSubsteps);

    engineRef.current.reset(preset.body1, preset.body2, 0);
    const newState = engineRef.current.getState();
    setSystemState(newState);

    setHistoryTime([0]);
    setHistoryDistance([newState.distance]);
    setHistoryKinetic([newState.kineticEnergy.total]);
    setHistoryPotential([newState.potentialEnergy]);
    setHistoryTotal([newState.totalEnergy]);

    activeTrail1Ref.current = [{ ...preset.body1.position }];
    activeTrail2Ref.current = [{ ...preset.body2.position }];

    setResetCameraTrigger((c) => c + 1);
  }, []);

  // Reset to initial conditions of current preset
  const handleReset = useCallback(() => {
    engineRef.current.reset(currentPreset.body1, currentPreset.body2, 0);
    const newState = engineRef.current.getState();
    setSystemState(newState);

    setHistoryTime([0]);
    setHistoryDistance([newState.distance]);
    setHistoryKinetic([newState.kineticEnergy.total]);
    setHistoryPotential([newState.potentialEnergy]);
    setHistoryTotal([newState.totalEnergy]);

    activeTrail1Ref.current = [{ ...currentPreset.body1.position }];
    activeTrail2Ref.current = [{ ...currentPreset.body2.position }];

    setResetCameraTrigger((c) => c + 1);
  }, [currentPreset]);

  // Single Step Forward
  const handleStepForward = useCallback(() => {
    const nextState = engineRef.current.step(fixedDt);
    setSystemState(nextState);

    setHistoryTime((t) => [...t.slice(-MAX_HISTORY_POINTS), nextState.time]);
    setHistoryDistance((d) => [...d.slice(-MAX_HISTORY_POINTS), nextState.distance]);
    setHistoryKinetic((k) => [...k.slice(-MAX_HISTORY_POINTS), nextState.kineticEnergy.total]);
    setHistoryPotential((p) => [...p.slice(-MAX_HISTORY_POINTS), nextState.potentialEnergy]);
    setHistoryTotal((e) => [...e.slice(-MAX_HISTORY_POINTS), nextState.totalEnergy]);

    activeTrail1Ref.current.push({ ...nextState.bodies[0].position });
    activeTrail2Ref.current.push({ ...nextState.bodies[1].position });
  }, [fixedDt]);

  // Play / Pause Toggle
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Apply custom bodies from Object Editor
  const handleApplyCustomBodies = useCallback((b1: CelestialBody, b2: CelestialBody) => {
    engineRef.current.reset(b1, b2, 0);
    const newState = engineRef.current.getState();
    setSystemState(newState);

    setHistoryTime([0]);
    setHistoryDistance([newState.distance]);
    setHistoryKinetic([newState.kineticEnergy.total]);
    setHistoryPotential([newState.potentialEnergy]);
    setHistoryTotal([newState.totalEnergy]);

    activeTrail1Ref.current = [{ ...b1.position }];
    activeTrail2Ref.current = [{ ...b2.position }];

    setResetCameraTrigger((c) => c + 1);
    setShowObjectEditor(false);
  }, []);

  // Apply state from Guided Experiment
  const handleApplyExperimentState = useCallback(
    (b1: CelestialBody, b2: CelestialBody, _baselineLabel: string) => {
      // Auto snapshot current trajectory as comparison baseline if not already set
      if (!hasActiveBaseline && activeTrail1Ref.current.length > 5) {
        setBaselineTrail1([...activeTrail1Ref.current]);
        setBaselineTrail2([...activeTrail2Ref.current]);
        setHasActiveBaseline(true);
        setShowComparisonOverlay(true);
      }

      engineRef.current.reset(b1, b2, 0);
      const newState = engineRef.current.getState();
      setSystemState(newState);

      setHistoryTime([0]);
      setHistoryDistance([newState.distance]);
      setHistoryKinetic([newState.kineticEnergy.total]);
      setHistoryPotential([newState.potentialEnergy]);
      setHistoryTotal([newState.totalEnergy]);

      activeTrail1Ref.current = [{ ...b1.position }];
      activeTrail2Ref.current = [{ ...b2.position }];

      setResetCameraTrigger((c) => c + 1);
      setShowExperimentsModal(false);
    },
    [hasActiveBaseline]
  );

  // Baseline Comparison Snapshot Actions
  const handleSaveComparisonBaseline = useCallback(() => {
    setBaselineTrail1([...activeTrail1Ref.current]);
    setBaselineTrail2([...activeTrail2Ref.current]);
    setHasActiveBaseline(true);
    setShowComparisonOverlay(true);
  }, []);

  const handleClearComparisonBaseline = useCallback(() => {
    setBaselineTrail1(undefined);
    setBaselineTrail2(undefined);
    setHasActiveBaseline(false);
    setShowComparisonOverlay(false);
  }, []);

  // Clear Graph History
  const handleClearHistory = useCallback(() => {
    setHistoryTime([systemState.time]);
    setHistoryDistance([systemState.distance]);
    setHistoryKinetic([systemState.kineticEnergy.total]);
    setHistoryPotential([systemState.potentialEnergy]);
    setHistoryTotal([systemState.totalEnergy]);
  }, [systemState]);

  // Export & Import Handlers
  const handleExportConfig = useCallback(() => {
    exportConfigurationToJson(
      systemState.bodies[0],
      systemState.bodies[1],
      { fixedDt, timeScale, substeps }
    );
  }, [systemState.bodies, fixedDt, timeScale, substeps]);

  const handleImportConfig = useCallback((jsonString: string) => {
    try {
      const config = importConfigurationFromJson(jsonString);
      if (config.settings) {
        setFixedDt(config.settings.fixedDt);
        setTimeScale(config.settings.timeScale);
        setSubsteps(config.settings.substeps);
      }
      handleApplyCustomBodies(config.body1, config.body2);
    } catch (err: any) {
      alert(`Import Error: ${err.message}`);
    }
  }, [handleApplyCustomBodies]);

  // Main Decoupled Physics Loop (Runs on requestAnimationFrame with fixed integration dt)
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();
    let accumulator = 0;

    const loop = (timestamp: number) => {
      const deltaMs = Math.min(timestamp - lastTimestamp, 100);
      lastTimestamp = timestamp;

      if (isPlaying) {
        const deltaSeconds = deltaMs / 1000;
        const targetSimTime = deltaSeconds * timeScale;
        accumulator += targetSimTime;

        // Limit accumulator to max allowed substeps per frame
        const maxSimTime = substeps * fixedDt;
        let fallingBehind = false;
        if (accumulator > maxSimTime) {
          fallingBehind = true;
          accumulator = maxSimTime;
        }
        setIsFallingBehind(fallingBehind);

        const steps = Math.floor(accumulator / fixedDt);
        accumulator -= steps * fixedDt;

        for (let s = 0; s < steps; s++) {
          engineRef.current.step(fixedDt);
          const st = engineRef.current.getState();

          // Store trail history points (sampled)
          if (s % 2 === 0) {
            activeTrail1Ref.current.push({ ...st.bodies[0].position });
            activeTrail2Ref.current.push({ ...st.bodies[1].position });
            if (activeTrail1Ref.current.length > 2500) activeTrail1Ref.current.shift();
            if (activeTrail2Ref.current.length > 2500) activeTrail2Ref.current.shift();
          }

          if (st.collision.isColliding) {
            setIsPlaying(false);
            break;
          }
        }

        // Throttle React UI State updates to ~30 FPS
        if (timestamp - lastUiUpdateRef.current > 33) {
          lastUiUpdateRef.current = timestamp;
          const currentState = engineRef.current.getState();
          setSystemState(currentState);

          setHistoryTime((t) => [...t.slice(-MAX_HISTORY_POINTS), currentState.time]);
          setHistoryDistance((d) => [...d.slice(-MAX_HISTORY_POINTS), currentState.distance]);
          setHistoryKinetic((k) => [...k.slice(-MAX_HISTORY_POINTS), currentState.kineticEnergy.total]);
          setHistoryPotential((p) => [...p.slice(-MAX_HISTORY_POINTS), currentState.potentialEnergy]);
          setHistoryTotal((e) => [...e.slice(-MAX_HISTORY_POINTS), currentState.totalEnergy]);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, timeScale, fixedDt, substeps]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
                Universal Two-Body Gravitational Simulator • Statics & Dynamics
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-space-950/80 p-1 rounded-lg border border-white/5">
          {PRESET_LIBRARY.map((p) => {
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
        <div className="flex items-center gap-1.5">
          {/* Unified Transport Controls */}
          <div className="flex items-center bg-space-950/80 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={handleTogglePlay}
              className={`py-1 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30'
              }`}
              title="Spacebar: Play/Pause"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={isPlaying}
              className="p-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="S: Step Forward by 1 Timestep (Δt)"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-rose-300 transition-colors"
              title="R: Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setResetCameraTrigger((c) => c + 1)}
              className="p-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
              title="C: Reset Camera View Orientation"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Tools */}
          <button
            onClick={() => setShowObjectEditor(true)}
            className="px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Edit Celestial Body Masses, Radii, Positions & Velocities"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Edit Bodies</span>
          </button>

          <button
            onClick={() => setShowExperimentsModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-purple-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Open Guided Experiments & Comparison"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Experiments</span>
          </button>

          <button
            onClick={() => setShowEducationModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-blue-400 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Open ME 206 Statics & Dynamics Theory Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">Theory Guide</span>
          </button>

          <div className="w-px h-5 bg-white/10 mx-0.5 hidden sm:block" />

          {/* Sidebars & Zen View Toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-space-950/80 p-0.5 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setShowControls(!showControls)}
              className={`p-1.5 rounded-md transition-all ${
                showControls ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={showControls ? 'Hide Controls Panel' : 'Show Controls Panel'}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`p-1.5 rounded-md transition-all ${
                showDashboard ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={showDashboard ? 'Hide Telemetry Dashboard' : 'Show Telemetry Dashboard'}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (showControls || showDashboard) {
                  setShowControls(false);
                  setShowDashboard(false);
                } else {
                  setShowControls(true);
                  setShowDashboard(true);
                }
              }}
              className={`p-1.5 rounded-md transition-all ${
                !showControls && !showDashboard ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={!showControls && !showDashboard ? 'Exit Zen View (Show Panels)' : 'Zen View: Full 3D Focus'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN 3D WORKSPACE WITH FLOATING OVERLAYS */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Full-screen 3D WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          <OrbitCanvas
            systemState={systemState}
            distanceScale={currentPreset.distanceScale}
            bodyRadiusScale={currentPreset.bodyRadiusScale}
            enableExaggeratedRadius={enableExaggeratedRadius}
            referenceFrame={referenceFrame}
            cameraFocus={cameraFocus}
            showTrails={showTrails}
            showComparisonOverlay={showComparisonOverlay}
            comparisonTrail1={baselineTrail1}
            comparisonTrail2={baselineTrail2}
            showVelocityVectors={showVelocityVectors}
            showForceVectors={showForceVectors}
            showBarycenter={showBarycenter}
            showGrid={showGrid}
            showDistanceLine={showDistanceLine}
            trailLength={2500}
            resetCameraTrigger={resetCameraTrigger}
            cameraViewTrigger={cameraViewTrigger}
          />
        </div>

        {/* Floating Left Overlay: Simulation Controls & Presets */}
        <div className="absolute top-4 left-4 z-20 w-80">
          {showControls ? (
            <ControlsPanel
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onStepForward={handleStepForward}
              timeScale={timeScale}
              onTimeScaleChange={setTimeScale}
              fixedDt={fixedDt}
              onFixedDtChange={setFixedDt}
              substeps={substeps}
              onSubstepsChange={setSubsteps}
              currentPresetId={currentPreset.id}
              onSelectPreset={handleSelectPreset}
              bodies={systemState.bodies}
              referenceFrame={referenceFrame}
              onReferenceFrameChange={setReferenceFrame}
              enableExaggeratedRadius={enableExaggeratedRadius}
              onToggleExaggeratedRadius={() => setEnableExaggeratedRadius(!enableExaggeratedRadius)}
              cameraFocus={cameraFocus}
              onCameraFocusChange={setCameraFocus}
              onSetCameraView={setCameraViewTrigger}
              showTrails={showTrails}
              onToggleTrails={() => setShowTrails(!showTrails)}
              showComparisonOverlay={showComparisonOverlay}
              onToggleComparisonOverlay={() => setShowComparisonOverlay(!showComparisonOverlay)}
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
              onExportConfig={handleExportConfig}
              onImportConfig={handleImportConfig}
              onOpenExperiments={() => setShowExperimentsModal(true)}
              onOpenObjectEditor={() => setShowObjectEditor(true)}
            />
          ) : (
            <button
              onClick={() => setShowControls(true)}
              className="glass-panel px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 hover:bg-space-850/80 transition-all border border-white/10 shadow-lg"
            >
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Show Controls</span>
            </button>
          )}
        </div>

        {/* Floating Right Overlay: Live Physics Dashboard & Graphs */}
        <div className="absolute top-4 right-4 z-20 w-80">
          <PhysicsDashboard
            systemState={systemState}
            isFallingBehind={isFallingBehind}
            historyTime={historyTime}
            historyDistance={historyDistance}
            historyKinetic={historyKinetic}
            historyPotential={historyPotential}
            historyTotal={historyTotal}
            onClearHistory={handleClearHistory}
            onOpenEducation={() => setShowEducationModal(true)}
            isCollapsed={!showDashboard}
            onToggleCollapse={() => setShowDashboard(!showDashboard)}
          />
        </div>

        {/* Center-Top Quick Status Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-space-900/80 backdrop-blur-md border border-white/10 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Time:</span>
            <span className="text-slate-100 font-semibold">{formatTimeSI(systemState.time)}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Orbit:</span>
            <span className="text-blue-400 uppercase font-semibold text-[11px]">
              {systemState.orbit.orbitType}
            </span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">e:</span>
            <span className="text-slate-100 font-semibold">
              {systemState.orbit.eccentricity.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Centered Modal: Universal Object Editor */}
        {showObjectEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <UniversalObjectEditor
                bodies={systemState.bodies}
                onApplyBodies={handleApplyCustomBodies}
                onResetToPreset={handleReset}
                onClose={() => setShowObjectEditor(false)}
              />
            </div>
          </div>
        )}
      </main>

      {/* 3. FOOTER STATUS BAR */}
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
            <span className="text-slate-300">{(systemState.conservation.energyError * 100).toFixed(4)}%</span>
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden lg:flex items-center gap-1.5">
            <span className="text-slate-500">Frame:</span>
            <span className="text-blue-400 capitalize">{referenceFrame}</span>
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

      {/* 4. GUIDED EXPERIMENTS MODAL */}
      <ExperimentsModal
        isOpen={showExperimentsModal}
        onClose={() => setShowExperimentsModal(false)}
        onApplyExperimentState={handleApplyExperimentState}
        onSaveComparisonBaseline={handleSaveComparisonBaseline}
        hasActiveBaseline={hasActiveBaseline}
        onClearComparisonBaseline={handleClearComparisonBaseline}
      />

      {/* 5. EDUCATIONAL THEORY GUIDE MODAL */}
      <EducationalModal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
      />
    </div>
  );
};

export default App;
