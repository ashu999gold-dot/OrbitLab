// ORBITLAB — Scientific Telemetry & Physics Dashboard
// Displays live SI metrics, conservation tolerances, orbital elements, and 60fps canvas graphs.

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Compass,
  Gauge,
  Info,
  Orbit,
  TrendingDown,
  Zap,
} from 'lucide-react';
import type { PhysicsState } from '../../types/physics';
import { CanvasChart, type DataSeries } from './CanvasChart';

interface PhysicsDashboardProps {
  physicsState: PhysicsState;
  historyTime: number[];
  historyDistance: number[];
  historyKinetic: number[];
  historyPotential: number[];
  historyTotal: number[];
  onOpenEducation: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PhysicsDashboard: React.FC<PhysicsDashboardProps> = ({
  physicsState,
  historyTime,
  historyDistance,
  historyKinetic,
  historyPotential,
  historyTotal,
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
    angularMomentumMagnitude,
    linearMomentumMagnitude,
    energyConservationError,
    angularMomentumError,
    isColliding,
    orbitParameters,
  } = physicsState;

  // Format SI units cleanly
  const formatDistance = (m: number) => {
    if (m >= 1.496e11) return `${(m / 1.495978707e11).toFixed(3)} AU`;
    if (m >= 1e6) return `${(m / 1e3).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
    if (m >= 1e3) return `${(m / 1e3).toFixed(2)} km`;
    return `${m.toFixed(1)} m`;
  };

  const formatVelocity = (mps: number) => {
    if (mps >= 1e3) return `${(mps / 1e3).toFixed(3)} km/s`;
    return `${mps.toFixed(1)} m/s`;
  };

  const formatForce = (n: number) => {
    if (n >= 1e24) return `${(n / 1e24).toFixed(3)} YN`;
    if (n >= 1e21) return `${(n / 1e21).toFixed(3)} ZN`;
    if (n >= 1e18) return `${(n / 1e18).toFixed(3)} EN`;
    if (n >= 1e15) return `${(n / 1e15).toFixed(3)} PN`;
    if (n >= 1e12) return `${(n / 1e12).toFixed(3)} TN`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(3)} GN`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(3)} MN`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)} kN`;
    return `${n.toFixed(1)} N`;
  };

  const formatEnergy = (j: number) => {
    const sign = j < 0 ? '-' : '';
    const abs = Math.abs(j);
    if (abs >= 1e33) return `${sign}${(abs / 1e33).toFixed(3)}×10³³ J`;
    if (abs >= 1e30) return `${sign}${(abs / 1e30).toFixed(3)}×10³⁰ J`;
    if (abs >= 1e27) return `${sign}${(abs / 1e27).toFixed(3)}×10²⁷ J`;
    if (abs >= 1e24) return `${sign}${(abs / 1e24).toFixed(3)} YJ`;
    if (abs >= 1e21) return `${sign}${(abs / 1e21).toFixed(3)} ZJ`;
    if (abs >= 1e18) return `${sign}${(abs / 1e18).toFixed(3)} EJ`;
    if (abs >= 1e15) return `${sign}${(abs / 1e15).toFixed(3)} PJ`;
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(3)} TJ`;
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(3)} GJ`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(3)} MJ`;
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)} kJ`;
    return `${sign}${abs.toFixed(1)} J`;
  };

  const formatPeriod = (sec: number) => {
    if (!Number.isFinite(sec)) return '∞ (Unbound)';
    const days = sec / 86400;
    if (days >= 365.25) return `${(days / 365.25).toFixed(2)} yrs (${days.toFixed(1)} d)`;
    if (days >= 1) return `${days.toFixed(2)} days`;
    const hours = sec / 3600;
    if (hours >= 1) return `${hours.toFixed(2)} hours`;
    return `${(sec / 60).toFixed(1)} mins`;
  };

  // Error badge color
  const getConservationBadge = (err: number) => {
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

  const energyErrBadge = getConservationBadge(energyConservationError);
  const angMomBadge = getConservationBadge(angularMomentumError);

  // Orbit classification pill
  const getOrbitTypeBadge = (type: string) => {
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
        return { label: 'PHYSICAL COLLISION', color: 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse' };
      default:
        return { label: type, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const orbitBadge = getOrbitTypeBadge(orbitParameters.orbitType);

  // Energy series data for Chart
  const energySeries: DataSeries[] = [
    { id: 'total', label: 'E_total', color: '#38bdf8', data: historyTotal },
    { id: 'kinetic', label: 'T (Kinetic)', color: '#34d399', data: historyKinetic, dashed: true },
    { id: 'potential', label: 'U (Potential)', color: '#f43f5e', data: historyPotential, dashed: true },
  ];

  // Separation series
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
    <div className="glass-panel rounded-xl p-3.5 border border-white/10 flex flex-col gap-3 shadow-2xl max-w-md w-full overflow-y-auto max-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Physics Dashboard
          </h2>
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

      {/* Collision Warning Banner */}
      {isColliding && (
        <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-2.5 flex items-start gap-2.5 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block">Bodies in Physical Contact!</span>
            <span>Distance (r = {formatDistance(distance)}) is less than combined physical radii (R₁ + R₂).</span>
          </div>
        </div>
      )}

      {/* Orbit Classification & Regime */}
      <div className="bg-space-900/90 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Orbit Regime</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${orbitBadge.color}`}>
            {orbitBadge.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">Eccentricity (e)</span>
            <span className="text-slate-100 font-semibold">{orbitParameters.eccentricity.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Orbital Period (T)</span>
            <span className="text-slate-100 font-semibold">{formatPeriod(orbitParameters.orbitalPeriod)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Periapsis (r_p)</span>
            <span className="text-slate-100">{formatDistance(orbitParameters.periapsis)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Apoapsis (r_a)</span>
            <span className="text-slate-100">
              {Number.isFinite(orbitParameters.apoapsis) ? formatDistance(orbitParameters.apoapsis) : '∞ (Escape)'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Observables Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Separation (r)</span>
            <Orbit className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-sm font-semibold font-mono text-slate-100 mt-0.5">
            {formatDistance(distance)}
          </div>
        </div>

        <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Rel Velocity (v_rel)</span>
            <Gauge className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">
            {formatVelocity(relativeVelocity)}
          </div>
        </div>

        <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Grav Force (|F|)</span>
            <Zap className="w-3 h-3 text-rose-400" />
          </div>
          <div className="text-sm font-semibold font-mono text-rose-400 mt-0.5">
            {formatForce(forceMagnitude)}
          </div>
        </div>

        <div className="bg-space-900/70 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Angular Mom (|L|)</span>
            <Compass className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-sm font-semibold font-mono text-amber-400 mt-0.5">
            {angularMomentumMagnitude.toExponential(3)} <span className="text-[9px] text-slate-400">kg·m²/s</span>
          </div>
        </div>
      </div>

      {/* Energy Breakdown */}
      <div className="bg-space-900/80 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mechanical Energy</span>
        <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-center">
          <div className="bg-space-950/60 p-1.5 rounded">
            <span className="text-emerald-400 block text-[10px]">T (Kinetic)</span>
            <span className="text-slate-100 font-medium truncate block" title={formatEnergy(kineticEnergy)}>
              {formatEnergy(kineticEnergy)}
            </span>
          </div>
          <div className="bg-space-950/60 p-1.5 rounded">
            <span className="text-rose-400 block text-[10px]">U (Potential)</span>
            <span className="text-slate-100 font-medium truncate block" title={formatEnergy(potentialEnergy)}>
              {formatEnergy(potentialEnergy)}
            </span>
          </div>
          <div className="bg-space-950/60 p-1.5 rounded">
            <span className="text-sky-400 block text-[10px]">E (Total)</span>
            <span className="text-slate-100 font-semibold truncate block" title={formatEnergy(totalEnergy)}>
              {formatEnergy(totalEnergy)}
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Conservation Tolerance Badges */}
      <div className="bg-space-900/60 rounded-lg p-2.5 border border-white/5 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Energy Drift (ΔE/|E₀|):</span>
          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${energyErrBadge.color}`}>
            {energyErrBadge.text}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Angular Momentum Drift (ΔL/|L₀|):</span>
          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${angMomBadge.color}`}>
            {angMomBadge.text}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Net Linear Momentum (|P|):</span>
          <span className="font-mono text-[10px] text-slate-300">
            {linearMomentumMagnitude < 1e-4 ? '0.00 kg·m/s (COM Frame)' : `${linearMomentumMagnitude.toExponential(2)} kg·m/s`}
          </span>
        </div>
      </div>

      {/* Real-Time Telemetry Graphs */}
      <div className="flex flex-col gap-2 pt-1">
        <CanvasChart
          title="Separation vs Time"
          subtitle="r(t)"
          timeData={historyTime}
          series={separationSeries}
          height={100}
          yFormat={formatDistance}
        />

        <CanvasChart
          title="Total Mechanical Energy vs Time"
          subtitle="E(t) = T + U"
          timeData={historyTime}
          series={energySeries}
          height={110}
          yFormat={formatEnergy}
        />
      </div>
    </div>
  );
};
