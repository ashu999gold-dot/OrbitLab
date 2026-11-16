// ORBITLAB — Simulation Setup Panel
// Direct inline configuration of Body 1, Body 2, Separation, Orbital Speed, and Presets.
// Initializes physical bodies in zero-momentum Center-of-Mass frame.

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronUp,
  Download,
  Orbit,
  RotateCcw,
  Settings2,
  Sliders,
  Upload,
} from 'lucide-react';
import type { CelestialBody } from '../../physics/physics-types';
import { PRESET_LIBRARY, type PresetSystem } from '../../simulation/presets';
import type { ReferenceFrameMode } from '../../visualization/ScaleManager';
import {
  fromSIKilograms,
  fromSIMeters,
  toSIKilograms,
  toSIMeters,
  type DistanceUnit,
  type MassUnit,
} from '../../utils/units';
import {
  calculateCircularVelocity,
  calculateEscapeVelocity,
  generateBarycentricInitialState,
} from '../../simulation/initial-conditions';
import { formatDistanceSI, formatVelocitySI } from '../../utils/formatting';

interface ControlsPanelProps {
  currentPresetId: string;
  onSelectPreset: (preset: PresetSystem) => void;
  bodies: [CelestialBody, CelestialBody];
  onApplyCustomBodies: (b1: CelestialBody, b2: CelestialBody) => void;
  onReset: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  fixedDt: number;
  onFixedDtChange: (dt: number) => void;
  substeps: number;
  onSubstepsChange: (n: number) => void;
  referenceFrame: ReferenceFrameMode;
  onReferenceFrameChange: (mode: ReferenceFrameMode) => void;
  onExportConfig: () => void;
  onImportConfig: (jsonString: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#FBBF24', // Amber
  '#10B981', // Emerald
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#E2E8F0', // White/Silver
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  currentPresetId,
  onSelectPreset,
  bodies,
  onApplyCustomBodies,
  onReset,
  timeScale: _timeScale,
  onTimeScaleChange: _onTimeScaleChange,
  fixedDt,
  onFixedDtChange,
  substeps,
  onSubstepsChange,
  referenceFrame,
  onReferenceFrameChange,
  onExportConfig,
  onImportConfig,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'bodies' | 'orbit'>('presets');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Body 1 working state
  const [b1Name, setB1Name] = useState(bodies[0].name);
  const [b1Color, setB1Color] = useState(bodies[0].color);
  const [b1MassUnit, setB1MassUnit] = useState<MassUnit>(
    bodies[0].mass >= 1e29 ? 'solar' : bodies[0].mass >= 1e23 ? 'earth' : 'kg'
  );
  const [b1MassVal, setB1MassVal] = useState<number>(
    parseFloat(fromSIKilograms(bodies[0].mass, bodies[0].mass >= 1e29 ? 'solar' : bodies[0].mass >= 1e23 ? 'earth' : 'kg').toFixed(4))
  );
  const [b1RadiusUnit, setB1RadiusUnit] = useState<DistanceUnit>('km');
  const [b1RadiusVal, setB1RadiusVal] = useState<number>(
    parseFloat(fromSIMeters(bodies[0].radius, 'km').toFixed(1))
  );

  // Body 2 working state
  const [b2Name, setB2Name] = useState(bodies[1].name);
  const [b2Color, setB2Color] = useState(bodies[1].color);
  const [b2MassUnit, setB2MassUnit] = useState<MassUnit>(
    bodies[1].mass >= 1e29 ? 'solar' : bodies[1].mass >= 1e23 ? 'earth' : 'kg'
  );
  const [b2MassVal, setB2MassVal] = useState<number>(
    parseFloat(fromSIKilograms(bodies[1].mass, bodies[1].mass >= 1e29 ? 'solar' : bodies[1].mass >= 1e23 ? 'earth' : 'kg').toFixed(4))
  );
  const [b2RadiusUnit, setB2RadiusUnit] = useState<DistanceUnit>('km');
  const [b2RadiusVal, setB2RadiusVal] = useState<number>(
    parseFloat(fromSIMeters(bodies[1].radius, 'km').toFixed(1))
  );

  // Orbital state
  const initialDistSI = Math.sqrt(
    (bodies[1].position.x - bodies[0].position.x) ** 2 +
    (bodies[1].position.y - bodies[0].position.y) ** 2 +
    (bodies[1].position.z - bodies[0].position.z) ** 2
  );
  const [sepUnit, setSepUnit] = useState<DistanceUnit>(initialDistSI >= 1e10 ? 'AU' : 'km');
  const [sepVal, setSepVal] = useState<number>(
    parseFloat(fromSIMeters(initialDistSI, initialDistSI >= 1e10 ? 'AU' : 'km').toFixed(4))
  );
  const [speedFactor, setSpeedFactor] = useState<number>(1.0);
  const [launchAngleDeg, setLaunchAngleDeg] = useState<number>(0);
  const [inclinationDeg, setInclinationDeg] = useState<number>(0);

  // Sync state when external preset loaded
  useEffect(() => {
    const m1Unit: MassUnit = bodies[0].mass >= 1e29 ? 'solar' : bodies[0].mass >= 1e23 ? 'earth' : 'kg';
    setB1Name(bodies[0].name);
    setB1Color(bodies[0].color);
    setB1MassUnit(m1Unit);
    setB1MassVal(parseFloat(fromSIKilograms(bodies[0].mass, m1Unit).toFixed(4)));
    setB1RadiusUnit('km');
    setB1RadiusVal(parseFloat(fromSIMeters(bodies[0].radius, 'km').toFixed(1)));

    const m2Unit: MassUnit = bodies[1].mass >= 1e29 ? 'solar' : bodies[1].mass >= 1e23 ? 'earth' : 'kg';
    setB2Name(bodies[1].name);
    setB2Color(bodies[1].color);
    setB2MassUnit(m2Unit);
    setB2MassVal(parseFloat(fromSIKilograms(bodies[1].mass, m2Unit).toFixed(4)));
    setB2RadiusUnit('km');
    setB2RadiusVal(parseFloat(fromSIMeters(bodies[1].radius, 'km').toFixed(1)));

    const distSI = Math.sqrt(
      (bodies[1].position.x - bodies[0].position.x) ** 2 +
      (bodies[1].position.y - bodies[0].position.y) ** 2 +
      (bodies[1].position.z - bodies[0].position.z) ** 2
    );
    const sUnit: DistanceUnit = distSI >= 1e10 ? 'AU' : 'km';
    setSepUnit(sUnit);
    setSepVal(parseFloat(fromSIMeters(distSI, sUnit).toFixed(4)));
    setLaunchAngleDeg(0);
    setInclinationDeg(0);
  }, [bodies]);

  // Derived current physical numbers
  const m1SI = toSIKilograms(Math.max(1e-6, b1MassVal || 1), b1MassUnit);
  const m2SI = toSIKilograms(Math.max(1e-6, b2MassVal || 1), b2MassUnit);
  const r1SI = toSIMeters(Math.max(1, b1RadiusVal || 1), b1RadiusUnit);
  const r2SI = toSIMeters(Math.max(1, b2RadiusVal || 1), b2RadiusUnit);
  const separationSI = toSIMeters(Math.max(1, sepVal || 1), sepUnit);

  const circularSpeed = calculateCircularVelocity(m1SI, m2SI, separationSI);
  const escapeSpeed = calculateEscapeVelocity(m1SI, m2SI, separationSI);
  const actualSpeed = circularSpeed * speedFactor;

  // Apply changes to simulation
  const handleApply = () => {
    const [newB1, newB2] = generateBarycentricInitialState({
      mass1: m1SI,
      mass2: m2SI,
      radius1: r1SI,
      radius2: r2SI,
      separation: separationSI,
      speedFactor,
      launchAngleDeg,
      inclinationDeg,
      name1: b1Name,
      name2: b2Name,
      color1: b1Color,
      color2: b2Color,
    });
    onApplyCustomBodies(newB1, newB2);
  };

  // Import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) onImportConfig(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="glass-panel px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 hover:bg-space-850/80 transition-all border border-white/10 shadow-lg"
      >
        <Sliders className="w-4 h-4 text-blue-400" />
        <span>Show Simulation Setup</span>
      </button>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-col gap-2.5 shadow-2xl w-full max-h-[calc(100vh-100px)] overflow-y-auto select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold tracking-wide text-slate-100 uppercase">
            Simulation Setup
          </h2>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Minimize Setup Panel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs font-medium">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 text-center border-b-2 transition-all ${
            activeTab === 'presets'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Presets (4)
        </button>
        <button
          onClick={() => setActiveTab('bodies')}
          className={`flex-1 py-1.5 text-center border-b-2 transition-all ${
            activeTab === 'bodies'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Bodies
        </button>
        <button
          onClick={() => setActiveTab('orbit')}
          className={`flex-1 py-1.5 text-center border-b-2 transition-all ${
            activeTab === 'orbit'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Orbit
        </button>
      </div>

      {/* TAB 1: PRESETS */}
      {activeTab === 'presets' && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-slate-400 leading-tight">
            Select one of the 4 standard astrophysical benchmarks:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {PRESET_LIBRARY.map((preset) => {
              const isSelected = preset.id === currentPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-space-900/60 border-white/5 text-slate-300 hover:bg-space-850 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{preset.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-950/60 text-slate-400">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BODIES CONFIGURATION */}
      {activeTab === 'bodies' && (
        <div className="flex flex-col gap-3">
          {/* Body 1 */}
          <div className="bg-space-900/80 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: b1Color }} />
                Body 1 (Primary)
              </span>
              {/* Color Picker */}
              <div className="flex items-center gap-1">
                {COLOR_OPTIONS.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    onClick={() => setB1Color(c)}
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${
                      b1Color === c ? 'scale-125 ring-1 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <input
              type="text"
              value={b1Name}
              onChange={(e) => setB1Name(e.target.value)}
              placeholder="Primary Body Name"
              className="bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />

            {/* Mass */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Mass</label>
                <input
                  type="number"
                  step="any"
                  value={b1MassVal}
                  onChange={(e) => setB1MassVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Unit</label>
                <select
                  value={b1MassUnit}
                  onChange={(e) => setB1MassUnit(e.target.value as MassUnit)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="earth">Earth Masses (M⊕)</option>
                  <option value="solar">Solar Masses (M☉)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
            </div>

            {/* Radius */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Radius</label>
                <input
                  type="number"
                  step="any"
                  value={b1RadiusVal}
                  onChange={(e) => setB1RadiusVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Unit</label>
                <select
                  value={b1RadiusUnit}
                  onChange={(e) => setB1RadiusUnit(e.target.value as DistanceUnit)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="m">Meters (m)</option>
                  <option value="earth_radius">Earth Radii (R⊕)</option>
                  <option value="solar_radius">Solar Radii (R☉)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Body 2 */}
          <div className="bg-space-900/80 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: b2Color }} />
                Body 2 (Secondary)
              </span>
              {/* Color Picker */}
              <div className="flex items-center gap-1">
                {COLOR_OPTIONS.slice(2, 6).map((c) => (
                  <button
                    key={c}
                    onClick={() => setB2Color(c)}
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${
                      b2Color === c ? 'scale-125 ring-1 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <input
              type="text"
              value={b2Name}
              onChange={(e) => setB2Name(e.target.value)}
              placeholder="Secondary Body Name"
              className="bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />

            {/* Mass */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Mass</label>
                <input
                  type="number"
                  step="any"
                  value={b2MassVal}
                  onChange={(e) => setB2MassVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Unit</label>
                <select
                  value={b2MassUnit}
                  onChange={(e) => setB2MassUnit(e.target.value as MassUnit)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="earth">Earth Masses (M⊕)</option>
                  <option value="solar">Solar Masses (M☉)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
            </div>

            {/* Radius */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Radius</label>
                <input
                  type="number"
                  step="any"
                  value={b2RadiusVal}
                  onChange={(e) => setB2RadiusVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Unit</label>
                <select
                  value={b2RadiusUnit}
                  onChange={(e) => setB2RadiusUnit(e.target.value as DistanceUnit)}
                  className="w-full bg-space-950/80 border border-white/10 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="m">Meters (m)</option>
                  <option value="earth_radius">Earth Radii (R⊕)</option>
                  <option value="solar_radius">Solar Radii (R☉)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORBIT CONFIGURATION */}
      {activeTab === 'orbit' && (
        <div className="flex flex-col gap-3">
          {/* Separation */}
          <div className="bg-space-900/80 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">Initial Separation (r)</span>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                step="any"
                value={sepVal}
                onChange={(e) => setSepVal(parseFloat(e.target.value) || 0)}
                className="bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
              <select
                value={sepUnit}
                onChange={(e) => setSepUnit(e.target.value as DistanceUnit)}
                className="bg-space-950/80 border border-white/10 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="km">Kilometers (km)</option>
                <option value="AU">Astronomical Units (AU)</option>
                <option value="m">Meters (m)</option>
              </select>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              SI Distance: {formatDistanceSI(separationSI)}
            </div>
          </div>

          {/* Speed Factor */}
          <div className="bg-space-900/80 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">
                Orbital Speed Factor (v / v_circ)
              </span>
              <span className="text-xs font-mono font-semibold text-blue-400">
                {speedFactor.toFixed(3)}×
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="2.5"
              step="0.01"
              value={speedFactor}
              onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />

            {/* Quick Speed Shortcuts */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
              <button
                onClick={() => setSpeedFactor(0)}
                className={`py-1 rounded border transition-colors ${
                  speedFactor === 0 ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-space-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title="Radial fall (h = 0)"
              >
                Radial
              </button>
              <button
                onClick={() => setSpeedFactor(1.0)}
                className={`py-1 rounded border transition-colors ${
                  speedFactor === 1.0 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-space-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title="Circular Orbit (e = 0)"
              >
                1.0 (Circ)
              </button>
              <button
                onClick={() => setSpeedFactor(1.2)}
                className={`py-1 rounded border transition-colors ${
                  speedFactor === 1.2 ? 'bg-blue-600/30 border-blue-500 text-blue-300' : 'bg-space-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title="Elliptical Orbit (0 < e < 1)"
              >
                1.2 (Ellipse)
              </button>
              <button
                onClick={() => setSpeedFactor(1.414)}
                className={`py-1 rounded border transition-colors ${
                  speedFactor >= 1.414 ? 'bg-amber-600/30 border-amber-500 text-amber-300' : 'bg-space-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title="Parabolic Escape (e = 1)"
              >
                √2 (Escape)
              </button>
            </div>

            <div className="pt-1 text-[10px] font-mono text-slate-400 flex flex-wrap justify-between gap-1">
              <span>v_circ: {formatVelocitySI(circularSpeed)}</span>
              <span>v_esc: {formatVelocitySI(escapeSpeed)}</span>
              <span className="text-emerald-400 font-semibold">v_rel: {formatVelocitySI(actualSpeed)}</span>
            </div>
          </div>

          {/* Launch Angle & Inclination */}
          <div className="bg-space-900/80 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                <span>Velocity Angle Offset:</span>
                <span className="font-mono text-blue-400 font-semibold">{launchAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={launchAngleDeg}
                onChange={(e) => setLaunchAngleDeg(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block">0° = strictly tangential / perpendicular</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                <span>Orbital 3D Inclination:</span>
                <span className="font-mono text-blue-400 font-semibold">{inclinationDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={inclinationDeg}
                onChange={(e) => setInclinationDeg(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleApply}
          className="col-span-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all"
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>Apply Setup & Initialize COM</span>
        </button>

        <button
          onClick={onReset}
          className="py-1.5 px-2 rounded-lg bg-space-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Preset</span>
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`py-1.5 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            showAdvanced
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-space-900 border-white/10 text-slate-300 hover:text-white hover:bg-space-850'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Advanced Accordion */}
      {showAdvanced && (
        <div className="bg-space-900/90 rounded-lg p-2.5 border border-white/5 flex flex-col gap-2 text-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Integrator & Coordinates
          </span>

          {/* Timestep */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-400 block mb-0.5">Integrator Δt (s)</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={fixedDt}
                onChange={(e) => onFixedDtChange(Math.max(0.001, parseFloat(e.target.value) || 1))}
                className="w-full bg-space-950/80 border border-white/10 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block mb-0.5">Substeps / frame</label>
              <select
                value={substeps}
                onChange={(e) => onSubstepsChange(parseInt(e.target.value, 10))}
                className="w-full bg-space-950/80 border border-white/10 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="4">4 substeps</option>
                <option value="8">8 substeps</option>
                <option value="16">16 substeps</option>
                <option value="32">32 substeps</option>
                <option value="64">64 substeps</option>
              </select>
            </div>
          </div>

          {/* Reference Frame */}
          <div>
            <label className="text-[9px] text-slate-400 block mb-0.5">Reference Frame</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onReferenceFrameChange('inertial')}
                className={`py-1 px-2 rounded text-[11px] font-medium border transition-all ${
                  referenceFrame === 'inertial'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-space-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                Inertial
              </button>
              <button
                onClick={() => onReferenceFrameChange('barycentric')}
                className={`py-1 px-2 rounded text-[11px] font-medium border transition-all ${
                  referenceFrame === 'barycentric'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-space-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                Barycentric
              </button>
            </div>
          </div>

          {/* JSON Export / Import */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5">
            <button
              onClick={onExportConfig}
              className="py-1 px-2 rounded bg-space-950/80 hover:bg-space-850 text-slate-300 hover:text-white border border-white/10 text-[10px] flex items-center justify-center gap-1 transition-all"
            >
              <Download className="w-3 h-3 text-blue-400" />
              <span>Export JSON</span>
            </button>
            <label className="py-1 px-2 rounded bg-space-950/80 hover:bg-space-850 text-slate-300 hover:text-white border border-white/10 text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all">
              <Upload className="w-3 h-3 text-emerald-400" />
              <span>Import JSON</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
