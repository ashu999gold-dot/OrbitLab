// ORBITLAB — Live Scientific Telemetry & Physics Dashboard
// Displays live SI metrics, conservation tolerances, degenerate radial warnings, and 60fps canvas graphs.

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Compass,
  Gauge,
  Info,
  Orbit,
  TrendingDown,
  Trash2,
  Zap,
} from 'lucide-react';
import type { SystemState } from '../../physics/physics-types';
import { CanvasChart, type DataSeries } from './CanvasChart';
import {
  formatDistanceSI,
  formatEnergySI,
  formatForceSI,
  formatTimeSI,
  formatVelocitySI,
} from '../../utils/formatting';

interface PhysicsDashboardProps {
  systemState: SystemState;
  isFallingBehind: boolean;
  historyTime: number[];
  historyDistance: number[];
  historyKinetic: number[];
  historyPotential: number[];
  historyTotal: number[];
  onClearHistory: () => void;
  onOpenEducation: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PhysicsDashboard: React.FC<PhysicsDashboardProps> = ({
  systemState,
  isFallingBehind,
  historyTime,
  historyDistance,
  historyKinetic,
  historyPotential,
  historyTotal,
  onClearHistory,
  onOpenEducation,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    distance,
    forceMagnitude,
    relativeVelocity,
    kineticEnergy,
    potentialEnergy,
    totalEnergy,
    angularMomentum,
    linearMomentum,
    orbit,
    collision,
    conservation,
  } = systemState;

  // Format orbital period
  const formatPeriod = (sec: number) => {
    if (!Number.isFinite(sec)) return '∞ (Unbound / Radial)';
    return formatTimeSI(sec);
  };

  // Conservation error badges
  const getBadgeStyle = (err: number) => {
    const pct = err * 100;
    if (pct < 0.01) {
      return { text: `< 0.01%`, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    if (pct < 0.1) {
      return { text: `${pct.toFixed(3)}%`, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    if (pct < 1.0) {
      return { text: `${pct.toFixed(2)}%`, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    return { text: `${pct.toFixed(1)}%`, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  };

  const energyErrBadge = getBadgeStyle(conservation.energyError);
  const angMomBadge = getBadgeStyle(conservation.angularMomentumError);

  // Orbit classification badge
  const getOrbitBadge = (type: string, isDegenerate: boolean) => {
    if (isDegenerate) {
      return { label: 'RADIAL (Degenerate h ≈ 0)', color: 'bg-purple-600/30 text-purple-300 border-purple-500' };
    }
    switch (type) {
      case 'circular':
        return { label: 'Circular (e ≈ 0)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'elliptical':
        return { label: 'Elliptical (0 < e < 1)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'parabolic':
        return { label: 'Parabolic (e = 1)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'hyperbolic':
        return { label: 'Hyperbolic Escape (e > 1)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'colliding':
        return { label: 'PHYSICAL CONTACT', color: 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse' };
      default:
        return { label: type, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const orbitBadge = getOrbitBadge(orbit.orbitType, orbit.isDegenerate);

  // Series for Charts
  const energySeries: DataSeries[] = [
    { id: 'total', label: 'E_total', color: '#38bdf8', data: historyTotal },
    { id: 'kinetic', label: 'T', color: '#34d399', data: historyKinetic, dashed: true },
    { id: 'potential', label: 'U', color: '#f43f5e', data: historyPotential, dashed: true },
  ];

  const separationSeries: DataSeries[] = [
    { id: 'dist', label: 'Separation r', color: '#60a5fa', data: historyDistance, unit: 'm' },
  ];

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="glass-panel px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 hover:bg-space-850/80 transition-all border border-white/10"
      >
        <Activity className="w-4 h-4 text-blue-400" />
        <span>Show Physics Dashboard</span>
      </button>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-col gap-2.5 shadow-2xl w-full overflow-y-auto max-h-[calc(100vh-100px)] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold tracking-wide text-slate-100 uppercase">
            Physics Telemetry
          </h2>
          {isFallingBehind && (
            <span
              className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1"
              title="Simulation speed throttled to max substeps per frame to preserve symplectic numerical accuracy."
            >
              <Clock className="w-2.5 h-2.5" />
              Accuracy Clamp
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenEducation}
            className="p-1 rounded text-slate-400 hover:text-blue-300 hover:bg-white/5 transition-colors"
            title="ME 206 Statics & Dynamics Theory Guide"
          >
            <Info className="w-4 h-4" />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Minimize Dashboard"
            >
              <TrendingDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collision Warning */}
      {collision.isColliding && (
        <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-2.5 flex items-start gap-2.5 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block">Physical Surface Contact!</span>
            <span>Distance (r = {formatDistanceSI(collision.distance)}) is less than combined physical radii (R₁ + R₂ = {formatDistanceSI(collision.contactDistance)}). Simulation stopped.</span>
          </div>
        </div>
      )}

      {/* Orbit Classification & Elements */}
      <div className="bg-space-900/90 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Orbit Classification</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${orbitBadge.color}`}>
            {orbitBadge.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[9px] block">Eccentricity (e)</span>
            <span className="text-slate-100 font-semibold">{orbit.eccentricity.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block">Period (T)</span>
            <span className="text-slate-100 font-semibold">{formatPeriod(orbit.orbitalPeriod)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block">Periapsis (r_p)</span>
            <span className="text-slate-100">{formatDistanceSI(orbit.periapsis)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block">Apoapsis (r_a)</span>
            <span className="text-slate-100">
              {Number.isFinite(orbit.apoapsis) ? formatDistanceSI(orbit.apoapsis) : '∞ (Unbound)'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Observables Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-space-900/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-mono">
            <span>Separation (r)</span>
            <Orbit className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-xs font-semibold font-mono text-slate-100 mt-0.5">
            {formatDistanceSI(distance)}
          </div>
        </div>

        <div className="bg-space-900/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-mono">
            <span>Rel Velocity</span>
            <Gauge className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xs font-semibold font-mono text-emerald-400 mt-0.5">
            {formatVelocitySI(relativeVelocity)}
          </div>
        </div>

        <div className="bg-space-900/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-mono">
            <span>Grav Force (|F|)</span>
            <Zap className="w-3 h-3 text-rose-400" />
          </div>
          <div className="text-xs font-semibold font-mono text-rose-400 mt-0.5">
            {formatForceSI(forceMagnitude)}
          </div>
        </div>

        <div className="bg-space-900/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-mono">
            <span>Angular Mom (|L|)</span>
            <Compass className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xs font-semibold font-mono text-amber-400 mt-0.5">
            {angularMomentum.magnitude.toExponential(3)}
          </div>
        </div>
      </div>

      {/* Mechanical Energy Breakdown */}
      <div className="bg-space-900/80 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1.5">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Mechanical Energy (SI Joules)</span>
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center">
          <div className="bg-space-950/60 p-1.5 rounded">
            <span className="text-emerald-400 block text-[9px]">T (Kinetic)</span>
            <span className="text-slate-100 font-medium truncate block" title={formatEnergySI(kineticEnergy.total)}>
              {formatEnergySI(kineticEnergy.total)}
            </span>
          </div>
          <div className="bg-space-950/60 p-1.5 rounded">
            <span className="text-rose-400 block text-[9px]">U (Potential)</span>
            <span className="text-slate-100 font-medium truncate block" title={formatEnergySI(potentialEnergy)}>
              {formatEnergySI(potentialEnergy)}
            </span>
          </div>
          <div className="bg-space-950/60 p-1.5 rounded">
            <span className="text-sky-400 block text-[9px]">E (Total)</span>
            <span className="text-slate-100 font-semibold truncate block" title={formatEnergySI(totalEnergy)}>
              {formatEnergySI(totalEnergy)}
            </span>
          </div>
        </div>
      </div>

      {/* Conservation Badges */}
      <div className="bg-space-900/60 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Energy Drift (ΔE/|E₀|):</span>
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${energyErrBadge.color}`}>
            {energyErrBadge.text}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Angular Momentum Drift:</span>
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${angMomBadge.color}`}>
            {angMomBadge.text}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Linear Momentum (|P|):</span>
          <span className="font-mono text-[10px] text-slate-300">
            {linearMomentum.magnitude < 1e-4 ? '0.00 kg·m/s (COM Frame)' : `${linearMomentum.magnitude.toExponential(2)} kg·m/s`}
          </span>
        </div>
      </div>

      {/* Real-Time Telemetry Graphs */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Live Telemetry Graphs</span>
          <button
            onClick={onClearHistory}
            className="text-[9px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            title="Clear chart history buffers"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>Clear History</span>
          </button>
        </div>

        <CanvasChart
          title="Separation vs Time"
          subtitle="r(t)"
          timeData={historyTime}
          series={separationSeries}
          height={95}
          yFormat={formatDistanceSI}
        />

        <CanvasChart
          title="Mechanical Energy vs Time"
          subtitle="E = T + U"
          timeData={historyTime}
          series={energySeries}
          height={100}
          yFormat={formatEnergySI}
        />
      </div>
    </div>
  );
};
