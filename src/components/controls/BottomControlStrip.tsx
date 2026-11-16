// ORBITLAB — Bottom Control Strip
// Docked floating control bar for simulation transport, playback speed, and visual layer toggles.

import React from 'react';
import {
  Camera,
  Compass,
  Grid,
  Maximize2,
  Minimize2,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  Sliders,
  StepForward,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface BottomControlStripProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  showTrails: boolean;
  onToggleTrails: () => void;
  showBarycenter: boolean;
  onToggleBarycenter: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showDistanceLine: boolean;
  onToggleDistanceLine: () => void;
  showVelocityVectors: boolean;
  onToggleVelocityVectors: () => void;
  showForceVectors: boolean;
  onToggleForceVectors: () => void;
  onResetCameraView: () => void;
  showControls: boolean;
  onToggleControls: () => void;
  showDashboard: boolean;
  onToggleDashboard: () => void;
}

export const BottomControlStrip: React.FC<BottomControlStripProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onReset,
  timeScale,
  onTimeScaleChange,
  showTrails,
  onToggleTrails,
  showBarycenter,
  onToggleBarycenter,
  showGrid,
  onToggleGrid,
  showDistanceLine,
  onToggleDistanceLine,
  showVelocityVectors,
  onToggleVelocityVectors,
  showForceVectors,
  onToggleForceVectors,
  onResetCameraView,
  showControls,
  onToggleControls,
  showDashboard,
  onToggleDashboard,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-space-900/85 backdrop-blur-xl border border-white/10 shadow-2xl max-w-[96vw] select-none">
      {/* 1. Main Transport Controls */}
      <div className="flex items-center gap-1 bg-space-950/70 p-1 rounded-xl border border-white/5">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 shadow-amber-500/10'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
          }`}
          title="Space: Play / Pause"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onStepForward}
          disabled={isPlaying}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="S: Step forward 1 integration timestep (Δt)"
        >
          <StepForward className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
          title="R: Reset simulation to initial conditions"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-0.5 hidden sm:block" />

      {/* 2. Playback Speed Selector */}
      <div className="flex items-center gap-1 bg-space-950/70 p-1 rounded-xl border border-white/5 text-xs font-mono">
        <span className="text-[10px] text-slate-400 font-sans px-1 hidden md:inline">Speed:</span>
        {[1, 10, 100].map((multiplier) => {
          // Normalize baseline speed presets
          const isSelected = Math.abs(timeScale - multiplier) < 0.1;
          return (
            <button
              key={multiplier}
              onClick={() => onTimeScaleChange(multiplier)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {multiplier}x
            </button>
          );
        })}
        {/* Rapid presets for large-scale orbits */}
        {[10000, 180000, 1200000].map((largeSpeed) => {
          const isSelected = Math.abs(timeScale - largeSpeed) < 1;
          const label = largeSpeed >= 1e6 ? `${(largeSpeed / 1e6).toFixed(1)}M×` : `${(largeSpeed / 1e3).toFixed(0)}k×`;
          return (
            <button
              key={largeSpeed}
              onClick={() => onTimeScaleChange(largeSpeed)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all hidden xl:inline-block ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-white/10 mx-0.5 hidden sm:block" />

      {/* 3. Visual Overlays Toggles */}
      <div className="flex items-center gap-1 bg-space-950/70 p-1 rounded-xl border border-white/5">
        <button
          onClick={onToggleTrails}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
            showTrails ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={showTrails ? 'Hide Trajectory Trails' : 'Show Trajectory Trails'}
        >
          <Orbit className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleBarycenter}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
            showBarycenter ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={showBarycenter ? 'Hide Centre of Mass (Barycenter)' : 'Show Centre of Mass (Barycenter)'}
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
            showGrid ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={showGrid ? 'Hide Coordinate Grid' : 'Show Coordinate Grid'}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleDistanceLine}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
            showDistanceLine ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={showDistanceLine ? 'Hide Distance Line' : 'Show Distance Line'}
        >
          <Ruler className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleVelocityVectors}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all hidden sm:inline-block ${
            showVelocityVectors ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={showVelocityVectors ? 'Hide Velocity Vectors (v)' : 'Show Velocity Vectors (v)'}
        >
          <TrendingUp className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleForceVectors}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all hidden sm:inline-block ${
            showForceVectors ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title={showForceVectors ? 'Hide Gravitational Force Vectors (F)' : 'Show Gravitational Force Vectors (F)'}
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-0.5 hidden sm:block" />

      {/* 4. Camera & View Helpers */}
      <div className="flex items-center gap-1 bg-space-950/70 p-1 rounded-xl border border-white/5">
        <button
          onClick={onResetCameraView}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="C: Reset Camera to Center"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleControls}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
            showControls ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
          title={showControls ? 'Minimize Setup Panel' : 'Open Setup Panel'}
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const bothVisible = showControls && showDashboard;
            if (bothVisible) {
              onToggleControls();
              onToggleDashboard();
            } else {
              if (!showControls) onToggleControls();
              if (!showDashboard) onToggleDashboard();
            }
          }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title={showControls && showDashboard ? 'Zen Mode (Hide Sidebars)' : 'Show All Sidebars'}
        >
          {showControls && showDashboard ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
