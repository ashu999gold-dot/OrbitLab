// ORBITLAB — Comprehensive Simulation Controls
// Includes Preset Library, Playback, Timestep & Speed settings, Reference Frame toggle,
// Visual Radius exaggeration toggle, Camera views, and JSON Configuration Import/Export.

import React, { useRef, useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Download,
  FastForward,
  FlaskConical,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  StepForward,
  Upload,
} from 'lucide-react';
import type { CelestialBody } from '../../physics/physics-types';
import { PRESET_LIBRARY, type PresetSystem } from '../../simulation/presets';
import type { CameraFocusMode, CameraPresetView } from '../canvas/OrbitCanvas';
import type { ReferenceFrameMode } from '../../visualization/ScaleManager';

interface ControlsPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStepForward: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  fixedDt: number;
  onFixedDtChange: (dt: number) => void;
  substeps: number;
  onSubstepsChange: (n: number) => void;
  currentPresetId: string;
  onSelectPreset: (preset: PresetSystem) => void;
  bodies: [CelestialBody, CelestialBody];
  referenceFrame: ReferenceFrameMode;
  onReferenceFrameChange: (mode: ReferenceFrameMode) => void;
  enableExaggeratedRadius: boolean;
  onToggleExaggeratedRadius: () => void;
  cameraFocus: CameraFocusMode;
  onCameraFocusChange: (mode: CameraFocusMode) => void;
  onSetCameraView: (view: CameraPresetView) => void;
  showTrails: boolean;
  onToggleTrails: () => void;
  showComparisonOverlay: boolean;
  onToggleComparisonOverlay: () => void;
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
  onExportConfig: () => void;
  onImportConfig: (jsonString: string) => void;
  onOpenExperiments: () => void;
  onOpenObjectEditor: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  onStepForward,
  timeScale,
  onTimeScaleChange,
  fixedDt,
  onFixedDtChange,
  substeps,
  onSubstepsChange,
  currentPresetId,
  onSelectPreset,
  referenceFrame,
  onReferenceFrameChange,
  enableExaggeratedRadius,
  onToggleExaggeratedRadius,
  cameraFocus,
  onCameraFocusChange,
  onSetCameraView,
  showTrails,
  onToggleTrails,
  showComparisonOverlay,
  onToggleComparisonOverlay,
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
  onExportConfig,
  onImportConfig,
  onOpenExperiments,
  onOpenObjectEditor,
}) => {
  const [tab, setTab] = useState<'presets' | 'view' | 'time'>('presets');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportConfig(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const speedPresets = [1, 10, 100, 1000, 100000];

  return (
    <div className="glass-panel rounded-xl p-3.5 border border-white/10 flex flex-col gap-3 shadow-2xl max-w-sm w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold tracking-wide text-slate-100 uppercase">
            Simulation Workspace
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
          {/* Main Playback Bar */}
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
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
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

          {/* Quick Action Pills: Object Editor & Experiments */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenObjectEditor}
              className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Objects</span>
            </button>
            <button
              onClick={onOpenExperiments}
              className="py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Experiments</span>
            </button>
          </div>

          {/* Tab Bar */}
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
              onClick={() => setTab('view')}
              className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all ${
                tab === 'view'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              View & Camera
            </button>
            <button
              onClick={() => setTab('time')}
              className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all ${
                tab === 'time'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Time & Integrator
            </button>
          </div>

          {/* TAB 1: PRESETS & IMPORT/EXPORT */}
          {tab === 'presets' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                {PRESET_LIBRARY.map((p) => {
                  const isSelected = p.id === currentPresetId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPreset(p)}
                      className={`text-left p-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-slate-100 shadow-sm shadow-blue-500/10'
                          : 'bg-space-900/60 border-white/5 text-slate-300 hover:bg-space-850 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-100">{p.name}</span>
                        <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{p.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* JSON Save / Load Section */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Configuration JSON:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 bg-space-850 hover:bg-space-800 text-slate-300 rounded border border-white/10 text-[10px] font-medium flex items-center gap-1 transition-colors"
                    title="Import configuration JSON file"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Import</span>
                  </button>
                  <button
                    onClick={onExportConfig}
                    className="px-2 py-1 bg-space-850 hover:bg-space-800 text-slate-300 rounded border border-white/10 text-[10px] font-medium flex items-center gap-1 transition-colors"
                    title="Export configuration as JSON file"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIEW & CAMERA */}
          {tab === 'view' && (
            <div className="flex flex-col gap-2.5 text-xs">
              {/* Reference Frame Selection */}
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                  Visualization Reference Frame
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onReferenceFrameChange('inertial')}
                    className={`py-1 px-2 rounded text-[11px] font-medium border transition-all ${
                      referenceFrame === 'inertial'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-space-950 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Inertial Frame (Default)
                  </button>
                  <button
                    onClick={() => onReferenceFrameChange('barycentric')}
                    className={`py-1 px-2 rounded text-[11px] font-medium border transition-all ${
                      referenceFrame === 'barycentric'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-space-950 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Barycentric (COM) Frame
                  </button>
                </div>
              </div>

              {/* Camera Presets & Focus Target */}
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    Camera Presets
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      onClick={() => onSetCameraView('isometric')}
                      className="px-1.5 py-0.5 rounded bg-space-950 hover:bg-space-850 text-slate-300 border border-white/5"
                    >
                      3D Iso
                    </button>
                    <button
                      onClick={() => onSetCameraView('top')}
                      className="px-1.5 py-0.5 rounded bg-space-950 hover:bg-space-850 text-slate-300 border border-white/5"
                    >
                      Top
                    </button>
                    <button
                      onClick={() => onSetCameraView('side')}
                      className="px-1.5 py-0.5 rounded bg-space-950 hover:bg-space-850 text-slate-300 border border-white/5"
                    >
                      Side
                    </button>
                    <button
                      onClick={onResetCameraView}
                      className="px-1.5 py-0.5 rounded bg-space-950 hover:bg-space-850 text-slate-300 border border-white/5"
                      title="Reset Camera View Orientation"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(['barycenter', 'body1', 'body2', 'free'] as CameraFocusMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onCameraFocusChange(mode)}
                      className={`py-1 px-1.5 rounded text-[10px] font-medium border transition-all ${
                        cameraFocus === mode
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-space-950 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'barycenter'
                        ? 'Follow Barycenter'
                        : mode === 'body1'
                        ? 'Follow Body 1'
                        : mode === 'body2'
                        ? 'Follow Body 2'
                        : 'Free Camera'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Visual Overlays */}
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Visual Overlays
                </span>
                <div className="flex flex-col gap-1 text-[11px]">
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Show Trajectory Trails</span>
                    <input
                      type="checkbox"
                      checked={showTrails}
                      onChange={onToggleTrails}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Show Ghost Comparison Trail</span>
                    <input
                      type="checkbox"
                      checked={showComparisonOverlay}
                      onChange={onToggleComparisonOverlay}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Velocity Vectors (v)</span>
                    <input
                      type="checkbox"
                      checked={showVelocityVectors}
                      onChange={onToggleVelocityVectors}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Force Vectors (F)</span>
                    <input
                      type="checkbox"
                      checked={showForceVectors}
                      onChange={onToggleForceVectors}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Barycenter Marker</span>
                    <input
                      type="checkbox"
                      checked={showBarycenter}
                      onChange={onToggleBarycenter}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Polar Reference Grid</span>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={onToggleGrid}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Separation Distance Line</span>
                    <input
                      type="checkbox"
                      checked={showDistanceLine}
                      onChange={onToggleDistanceLine}
                      className="rounded bg-space-950 border-white/10 text-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Exaggerated Radius Toggle */}
              <div className="bg-space-900/60 p-2 rounded-lg border border-white/5 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-200 block">Exaggerate Visual Radii</span>
                  <span className="text-[9px] text-slate-400">Purely visual representation; SI physics unaffected</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableExaggeratedRadius}
                  onChange={onToggleExaggeratedRadius}
                  className="rounded bg-space-950 border-white/10 text-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TIME & INTEGRATOR */}
          {tab === 'time' && (
            <div className="flex flex-col gap-2.5 text-xs">
              {/* Speed Slider & Presets */}
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <FastForward className="w-3 h-3 text-blue-400" />
                    Simulation Speed
                  </span>
                  <span className="font-mono text-blue-400 font-semibold">
                    {timeScale >= 1e6
                      ? `${(timeScale / 1e6).toFixed(1)}M×`
                      : timeScale >= 1e3
                      ? `${(timeScale / 1e3).toFixed(1)}k×`
                      : `${timeScale.toFixed(1)}×`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {speedPresets.map((sp) => (
                    <button
                      key={sp}
                      onClick={() => onTimeScaleChange(sp)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all ${
                        Math.abs(timeScale - sp) / sp < 0.1
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-space-950 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sp >= 1000 ? `${sp / 1000}k×` : `${sp}×`}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max="6.5"
                  step="0.05"
                  value={Math.log10(Math.max(1, timeScale))}
                  onChange={(e) => onTimeScaleChange(Math.pow(10, parseFloat(e.target.value)))}
                  className="w-full h-1.5 bg-space-950 rounded cursor-pointer"
                />
              </div>

              {/* Physics Timestep & Warning */}
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono">Physics Timestep (Δt):</span>
                  <span className="font-mono text-slate-200 font-semibold">{fixedDt} s</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={fixedDt}
                  onChange={(e) => onFixedDtChange(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
                />
                <div className="text-[10px] text-amber-300/80 bg-amber-500/5 p-1.5 rounded border border-amber-500/20">
                  Note: Large timesteps (Δt) increase simulation speed but can degrade symplectic energy conservation near periapsis.
                </div>
              </div>

              {/* Substeps per frame */}
              <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Substeps per Frame:</span>
                <select
                  value={substeps}
                  onChange={(e) => onSubstepsChange(parseInt(e.target.value, 10))}
                  className="bg-space-950 text-slate-200 rounded px-2 py-1 border border-white/10 font-mono text-[11px]"
                >
                  <option value={4}>4 (Fast)</option>
                  <option value={8}>8 (Standard)</option>
                  <option value={16}>16 (High Precision)</option>
                  <option value={32}>32 (Extreme / Eccentric)</option>
                  <option value={64}>64 (Ultra Rigorous)</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
