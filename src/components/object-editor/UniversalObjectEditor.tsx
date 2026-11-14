// ORBITLAB — Universal Object Editor
// Independent physical configuration of Body A and Body B
// Supports Simple vs Advanced Cartesian modes, multi-unit conversions, and pending change tracking.

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Sliders,
} from 'lucide-react';
import type { BodyCategory, CelestialBody, Vector3D } from '../../physics/physics-types';
import {
  fromSIKilograms,
  fromSIMeters,
  fromSIMetersPerSecond,
  toSIKilograms,
  toSIMeters,
  toSIMetersPerSecond,
  type DistanceUnit,
  type MassUnit,
  type VelocityUnit,
} from '../../utils/units';
import { generateBarycentricInitialState } from '../../simulation/initial-conditions';
import { validateSimulationConfiguration } from '../../simulation/validation';
import { transformToCenterOfMassFrame } from '../../physics/barycenter';

interface UniversalObjectEditorProps {
  bodies: [CelestialBody, CelestialBody];
  onApplyBodies: (b1: CelestialBody, b2: CelestialBody) => void;
  onResetToPreset: () => void;
}

export const UniversalObjectEditor: React.FC<UniversalObjectEditorProps> = ({
  bodies,
  onApplyBodies,
  onResetToPreset,
}) => {
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('simple');
  const [activeBodyTab, setActiveBodyTab] = useState<'body1' | 'body2'>('body1');
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Selected display units
  const [massUnit1, setMassUnit1] = useState<MassUnit>('kg');
  const [radiusUnit1, setRadiusUnit1] = useState<DistanceUnit>('km');
  const [posUnit1, setPosUnit1] = useState<DistanceUnit>('km');
  const [velUnit1, setVelUnit1] = useState<VelocityUnit>('km/s');

  const [massUnit2, setMassUnit2] = useState<MassUnit>('kg');
  const [radiusUnit2, setRadiusUnit2] = useState<DistanceUnit>('km');
  const [posUnit2, setPosUnit2] = useState<DistanceUnit>('km');
  const [velUnit2, setVelUnit2] = useState<VelocityUnit>('km/s');

  // Working state for Body 1
  const [b1State, setB1State] = useState({
    name: bodies[0].name,
    category: bodies[0].category,
    color: bodies[0].color,
    massStr: fromSIKilograms(bodies[0].mass, massUnit1).toExponential(4),
    radiusStr: fromSIMeters(bodies[0].radius, radiusUnit1).toFixed(1),
    xStr: fromSIMeters(bodies[0].position.x, posUnit1).toExponential(4),
    yStr: fromSIMeters(bodies[0].position.y, posUnit1).toExponential(4),
    zStr: fromSIMeters(bodies[0].position.z, posUnit1).toExponential(4),
    vxStr: fromSIMetersPerSecond(bodies[0].velocity.x, velUnit1).toFixed(3),
    vyStr: fromSIMetersPerSecond(bodies[0].velocity.y, velUnit1).toFixed(3),
    vzStr: fromSIMetersPerSecond(bodies[0].velocity.z, velUnit1).toFixed(3),
  });

  // Working state for Body 2
  const [b2State, setB2State] = useState({
    name: bodies[1].name,
    category: bodies[1].category,
    color: bodies[1].color,
    massStr: fromSIKilograms(bodies[1].mass, massUnit2).toExponential(4),
    radiusStr: fromSIMeters(bodies[1].radius, radiusUnit2).toFixed(1),
    xStr: fromSIMeters(bodies[1].position.x, posUnit2).toExponential(4),
    yStr: fromSIMeters(bodies[1].position.y, posUnit2).toExponential(4),
    zStr: fromSIMeters(bodies[1].position.z, posUnit2).toExponential(4),
    vxStr: fromSIMetersPerSecond(bodies[1].velocity.x, velUnit2).toFixed(3),
    vyStr: fromSIMetersPerSecond(bodies[1].velocity.y, velUnit2).toFixed(3),
    vzStr: fromSIMetersPerSecond(bodies[1].velocity.z, velUnit2).toFixed(3),
  });

  // Simple Mode parameters
  const initDistance = Math.sqrt(
    (bodies[1].position.x - bodies[0].position.x) ** 2 +
    (bodies[1].position.y - bodies[0].position.y) ** 2 +
    (bodies[1].position.z - bodies[0].position.z) ** 2
  );
  const [simpleSepStr, setSimpleSepStr] = useState(initDistance.toExponential(4));
  const [simpleSpeedFactor, setSimpleSpeedFactor] = useState<number>(1.0);
  const [simpleAngleDeg, setSimpleAngleDeg] = useState<number>(0);
  const [simpleInclinationDeg, setSimpleInclinationDeg] = useState<number>(0);

  // Sync when bodies change externally (e.g. preset loaded)
  useEffect(() => {
    setB1State({
      name: bodies[0].name,
      category: bodies[0].category,
      color: bodies[0].color,
      massStr: fromSIKilograms(bodies[0].mass, massUnit1).toExponential(4),
      radiusStr: fromSIMeters(bodies[0].radius, radiusUnit1).toFixed(1),
      xStr: fromSIMeters(bodies[0].position.x, posUnit1).toExponential(4),
      yStr: fromSIMeters(bodies[0].position.y, posUnit1).toExponential(4),
      zStr: fromSIMeters(bodies[0].position.z, posUnit1).toExponential(4),
      vxStr: fromSIMetersPerSecond(bodies[0].velocity.x, velUnit1).toFixed(3),
      vyStr: fromSIMetersPerSecond(bodies[0].velocity.y, velUnit1).toFixed(3),
      vzStr: fromSIMetersPerSecond(bodies[0].velocity.z, velUnit1).toFixed(3),
    });

    setB2State({
      name: bodies[1].name,
      category: bodies[1].category,
      color: bodies[1].color,
      massStr: fromSIKilograms(bodies[1].mass, massUnit2).toExponential(4),
      radiusStr: fromSIMeters(bodies[1].radius, radiusUnit2).toFixed(1),
      xStr: fromSIMeters(bodies[1].position.x, posUnit2).toExponential(4),
      yStr: fromSIMeters(bodies[1].position.y, posUnit2).toExponential(4),
      zStr: fromSIMeters(bodies[1].position.z, posUnit2).toExponential(4),
      vxStr: fromSIMetersPerSecond(bodies[1].velocity.x, velUnit2).toFixed(3),
      vyStr: fromSIMetersPerSecond(bodies[1].velocity.y, velUnit2).toFixed(3),
      vzStr: fromSIMetersPerSecond(bodies[1].velocity.z, velUnit2).toFixed(3),
    });

    const dist = Math.sqrt(
      (bodies[1].position.x - bodies[0].position.x) ** 2 +
      (bodies[1].position.y - bodies[0].position.y) ** 2 +
      (bodies[1].position.z - bodies[0].position.z) ** 2
    );
    setSimpleSepStr(dist.toExponential(4));
    setHasPendingChanges(false);
    setValidationErrors([]);
  }, [bodies]);

  // Convert current input fields to SI bodies
  const parseInputsToSIBodies = (): { b1: CelestialBody; b2: CelestialBody } => {
    const m1 = toSIKilograms(parseFloat(b1State.massStr) || 1, massUnit1);
    const r1 = toSIMeters(parseFloat(b1State.radiusStr) || 1, radiusUnit1);
    const p1: Vector3D = {
      x: toSIMeters(parseFloat(b1State.xStr) || 0, posUnit1),
      y: toSIMeters(parseFloat(b1State.yStr) || 0, posUnit1),
      z: toSIMeters(parseFloat(b1State.zStr) || 0, posUnit1),
    };
    const v1: Vector3D = {
      x: toSIMetersPerSecond(parseFloat(b1State.vxStr) || 0, velUnit1),
      y: toSIMetersPerSecond(parseFloat(b1State.vyStr) || 0, velUnit1),
      z: toSIMetersPerSecond(parseFloat(b1State.vzStr) || 0, velUnit1),
    };

    const m2 = toSIKilograms(parseFloat(b2State.massStr) || 1, massUnit2);
    const r2 = toSIMeters(parseFloat(b2State.radiusStr) || 1, radiusUnit2);
    const p2: Vector3D = {
      x: toSIMeters(parseFloat(b2State.xStr) || 0, posUnit2),
      y: toSIMeters(parseFloat(b2State.yStr) || 0, posUnit2),
      z: toSIMeters(parseFloat(b2State.zStr) || 0, posUnit2),
    };
    const v2: Vector3D = {
      x: toSIMetersPerSecond(parseFloat(b2State.vxStr) || 0, velUnit2),
      y: toSIMetersPerSecond(parseFloat(b2State.vyStr) || 0, velUnit2),
      z: toSIMetersPerSecond(parseFloat(b2State.vzStr) || 0, velUnit2),
    };

    return {
      b1: {
        id: bodies[0].id,
        name: b1State.name.trim() || 'Primary Body',
        category: b1State.category,
        mass: m1,
        radius: r1,
        position: p1,
        velocity: v1,
        acceleration: { x: 0, y: 0, z: 0 },
        color: b1State.color,
      },
      b2: {
        id: bodies[1].id,
        name: b2State.name.trim() || 'Secondary Body',
        category: b2State.category,
        mass: m2,
        radius: r2,
        position: p2,
        velocity: v2,
        acceleration: { x: 0, y: 0, z: 0 },
        color: b2State.color,
      },
    };
  };

  // Handle Apply Changes (Advanced Mode)
  const handleApplyAdvanced = () => {
    const { b1, b2 } = parseInputsToSIBodies();
    const validation = validateSimulationConfiguration(b1, b2);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setHasPendingChanges(false);
    onApplyBodies(b1, b2);
  };

  // Handle Apply Changes (Simple Mode)
  const handleApplySimple = (overrideSpeedFactor?: number) => {
    const m1 = toSIKilograms(parseFloat(b1State.massStr) || 1, massUnit1);
    const m2 = toSIKilograms(parseFloat(b2State.massStr) || 1, massUnit2);
    const r1 = toSIMeters(parseFloat(b1State.radiusStr) || 1, radiusUnit1);
    const r2 = toSIMeters(parseFloat(b2State.radiusStr) || 1, radiusUnit2);
    const sep = parseFloat(simpleSepStr) || 1e7;

    const sf = overrideSpeedFactor !== undefined ? overrideSpeedFactor : simpleSpeedFactor;

    const [newB1, newB2] = generateBarycentricInitialState({
      mass1: m1,
      mass2: m2,
      radius1: r1,
      radius2: r2,
      separation: sep,
      speedFactor: sf,
      launchAngleDeg: simpleAngleDeg,
      inclinationDeg: simpleInclinationDeg,
      name1: b1State.name,
      name2: b2State.name,
      color1: b1State.color,
      color2: b2State.color,
    });

    const validation = validateSimulationConfiguration(newB1, newB2);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setHasPendingChanges(false);
    onApplyBodies(newB1, newB2);
  };

  // Zero Center of Mass Momentum
  const handleZeroMomentum = () => {
    const { b1, b2 } = parseInputsToSIBodies();
    const transformed = transformToCenterOfMassFrame(b1, b2);

    onApplyBodies(transformed.body1, transformed.body2);
    setHasPendingChanges(false);
    setValidationErrors([]);
  };

  const categories: BodyCategory[] = ['planet', 'star', 'satellite', 'asteroid', 'artificial', 'custom'];

  return (
    <div className="bg-space-900/90 rounded-xl p-3 border border-white/10 flex flex-col gap-3 shadow-xl">
      {/* Editor Header & Mode Toggle */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-100 uppercase">
            Universal Object Editor
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetToPreset}
            className="px-2 py-0.5 rounded bg-space-950 text-slate-400 hover:text-slate-200 border border-white/10 text-[10px]"
            title="Reset objects to current preset"
          >
            Reset
          </button>
          <div className="flex items-center bg-space-950 rounded-lg p-0.5 border border-white/10 text-[10px]">
            <button
              onClick={() => setEditorMode('simple')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                editorMode === 'simple' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setEditorMode('advanced')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                editorMode === 'advanced' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Pending Changes Indicator */}
      {hasPendingChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 flex items-center justify-between text-xs text-amber-300 animate-pulse">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Unapplied changes pending</span>
          </div>
          <button
            onClick={editorMode === 'simple' ? () => handleApplySimple() : handleApplyAdvanced}
            className="px-2 py-0.5 bg-amber-500 text-black font-semibold rounded text-[10px] hover:bg-amber-400"
          >
            Apply Now
          </button>
        </div>
      )}

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-500/20 border border-rose-500/40 rounded-lg p-2 text-[11px] text-rose-200 space-y-1">
          {validationErrors.map((err, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-rose-400">•</span>
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Body Selector Tabs */}
      <div className="flex border-b border-white/10 text-xs font-medium">
        <button
          onClick={() => setActiveBodyTab('body1')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeBodyTab === 'body1'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b1State.color }} />
          <span>{b1State.name || 'Body 1'}</span>
        </button>
        <button
          onClick={() => setActiveBodyTab('body2')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeBodyTab === 'body2'
              ? 'border-orange-500 text-orange-400 bg-orange-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b2State.color }} />
          <span>{b2State.name || 'Body 2'}</span>
        </button>
      </div>

      {/* ACTIVE BODY IDENTITY & PHYSICAL PROPERTIES */}
      {activeBodyTab === 'body1' ? (
        <div className="space-y-2.5 text-xs">
          {/* Identity */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Object Name</label>
              <input
                type="text"
                value={b1State.name}
                onChange={(e) => {
                  setB1State({ ...b1State, name: e.target.value });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
              <select
                value={b1State.category}
                onChange={(e) => {
                  setB1State({ ...b1State, category: e.target.value as BodyCategory });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 text-slate-200 rounded px-1.5 py-1 border border-white/10 text-[11px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mass & Radius */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Mass</span>
                <select
                  value={massUnit1}
                  onChange={(e) => setMassUnit1(e.target.value as MassUnit)}
                  className="bg-transparent text-blue-400 text-[10px]"
                >
                  <option value="kg">kg</option>
                  <option value="earth">Earths (M⊕)</option>
                  <option value="solar">Suns (M☉)</option>
                </select>
              </div>
              <input
                type="text"
                value={b1State.massStr}
                onChange={(e) => {
                  setB1State({ ...b1State, massStr: e.target.value });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Radius</span>
                <select
                  value={radiusUnit1}
                  onChange={(e) => setRadiusUnit1(e.target.value as DistanceUnit)}
                  className="bg-transparent text-blue-400 text-[10px]"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                  <option value="AU">AU</option>
                </select>
              </div>
              <input
                type="text"
                value={b1State.radiusStr}
                onChange={(e) => {
                  setB1State({ ...b1State, radiusStr: e.target.value });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 text-xs">
          {/* Identity */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Object Name</label>
              <input
                type="text"
                value={b2State.name}
                onChange={(e) => {
                  setB2State({ ...b2State, name: e.target.value });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
              <select
                value={b2State.category}
                onChange={(e) => {
                  setB2State({ ...b2State, category: e.target.value as BodyCategory });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 text-slate-200 rounded px-1.5 py-1 border border-white/10 text-[11px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mass & Radius */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Mass</span>
                <select
                  value={massUnit2}
                  onChange={(e) => setMassUnit2(e.target.value as MassUnit)}
                  className="bg-transparent text-orange-400 text-[10px]"
                >
                  <option value="kg">kg</option>
                  <option value="earth">Earths (M⊕)</option>
                  <option value="solar">Suns (M☉)</option>
                </select>
              </div>
              <input
                type="text"
                value={b2State.massStr}
                onChange={(e) => {
                  setB2State({ ...b2State, massStr: e.target.value });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Radius</span>
                <select
                  value={radiusUnit2}
                  onChange={(e) => setRadiusUnit2(e.target.value as DistanceUnit)}
                  className="bg-transparent text-orange-400 text-[10px]"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                  <option value="AU">AU</option>
                </select>
              </div>
              <input
                type="text"
                value={b2State.radiusStr}
                onChange={(e) => {
                  setB2State({ ...b2State, radiusStr: e.target.value });
                  setHasPendingChanges(true);
                }}
                className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE SPECIFIC CONTROLS */}
      {editorMode === 'simple' ? (
        <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Initial Separation (m)</label>
            <input
              type="text"
              value={simpleSepStr}
              onChange={(e) => {
                setSimpleSepStr(e.target.value);
                setHasPendingChanges(true);
              }}
              className="w-full bg-space-950 rounded px-2 py-1 text-slate-200 border border-white/10 font-mono text-[11px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Orbital Speed Multiplier</span>
              <span className="font-mono text-blue-400">
                {simpleSpeedFactor.toFixed(2)}× v_circ ({simpleSpeedFactor < 1 ? 'Sub-circular' : simpleSpeedFactor === 1 ? 'Circular' : simpleSpeedFactor >= 1.414 ? 'Escape' : 'Elliptical'})
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={simpleSpeedFactor}
              onChange={(e) => {
                setSimpleSpeedFactor(parseFloat(e.target.value));
                setHasPendingChanges(true);
              }}
              className="w-full h-1.5 bg-space-950 rounded cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Launch Angle</span>
                <span className="font-mono">{simpleAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="5"
                value={simpleAngleDeg}
                onChange={(e) => {
                  setSimpleAngleDeg(parseInt(e.target.value, 10));
                  setHasPendingChanges(true);
                }}
                className="w-full h-1.5 bg-space-950 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Inclination (3D)</span>
                <span className="font-mono">{simpleInclinationDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={simpleInclinationDeg}
                onChange={(e) => {
                  setSimpleInclinationDeg(parseInt(e.target.value, 10));
                  setHasPendingChanges(true);
                }}
                className="w-full h-1.5 bg-space-950 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setSimpleSpeedFactor(1.0);
                setSimpleAngleDeg(0);
                handleApplySimple(1.0);
              }}
              className="py-1.5 px-2 bg-space-850 hover:bg-space-800 text-blue-400 rounded border border-blue-500/20 text-[11px] font-medium"
            >
              Circularize (1.0× v_circ)
            </button>
            <button
              onClick={() => handleApplySimple()}
              className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-[11px] shadow-md shadow-blue-600/20"
            >
              Apply Simple Setup
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Independent 3D Cartesian Coordinates</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span>Pos:</span>
                <select
                  value={activeBodyTab === 'body1' ? posUnit1 : posUnit2}
                  onChange={(e) =>
                    activeBodyTab === 'body1'
                      ? setPosUnit1(e.target.value as DistanceUnit)
                      : setPosUnit2(e.target.value as DistanceUnit)
                  }
                  className="bg-transparent text-blue-400 text-[10px]"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                  <option value="AU">AU</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span>Vel:</span>
                <select
                  value={activeBodyTab === 'body1' ? velUnit1 : velUnit2}
                  onChange={(e) =>
                    activeBodyTab === 'body1'
                      ? setVelUnit1(e.target.value as VelocityUnit)
                      : setVelUnit2(e.target.value as VelocityUnit)
                  }
                  className="bg-transparent text-blue-400 text-[10px]"
                >
                  <option value="m/s">m/s</option>
                  <option value="km/s">km/s</option>
                </select>
              </div>
            </div>
          </div>

          {activeBodyTab === 'body1' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400">X ({posUnit1})</label>
                  <input
                    type="text"
                    value={b1State.xStr}
                    onChange={(e) => {
                      setB1State({ ...b1State, xStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Y ({posUnit1})</label>
                  <input
                    type="text"
                    value={b1State.yStr}
                    onChange={(e) => {
                      setB1State({ ...b1State, yStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Z ({posUnit1})</label>
                  <input
                    type="text"
                    value={b1State.zStr}
                    onChange={(e) => {
                      setB1State({ ...b1State, zStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400">Vx ({velUnit1})</label>
                  <input
                    type="text"
                    value={b1State.vxStr}
                    onChange={(e) => {
                      setB1State({ ...b1State, vxStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Vy ({velUnit1})</label>
                  <input
                    type="text"
                    value={b1State.vyStr}
                    onChange={(e) => {
                      setB1State({ ...b1State, vyStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Vz ({velUnit1})</label>
                  <input
                    type="text"
                    value={b1State.vzStr}
                    onChange={(e) => {
                      setB1State({ ...b1State, vzStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400">X ({posUnit2})</label>
                  <input
                    type="text"
                    value={b2State.xStr}
                    onChange={(e) => {
                      setB2State({ ...b2State, xStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Y ({posUnit2})</label>
                  <input
                    type="text"
                    value={b2State.yStr}
                    onChange={(e) => {
                      setB2State({ ...b2State, yStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Z ({posUnit2})</label>
                  <input
                    type="text"
                    value={b2State.zStr}
                    onChange={(e) => {
                      setB2State({ ...b2State, zStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400">Vx ({velUnit2})</label>
                  <input
                    type="text"
                    value={b2State.vxStr}
                    onChange={(e) => {
                      setB2State({ ...b2State, vxStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Vy ({velUnit2})</label>
                  <input
                    type="text"
                    value={b2State.vyStr}
                    onChange={(e) => {
                      setB2State({ ...b2State, vyStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400">Vz ({velUnit2})</label>
                  <input
                    type="text"
                    value={b2State.vzStr}
                    onChange={(e) => {
                      setB2State({ ...b2State, vzStr: e.target.value });
                      setHasPendingChanges(true);
                    }}
                    className="w-full bg-space-950 rounded px-1.5 py-0.5 text-slate-200 border border-white/10 font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleZeroMomentum}
              className="py-1.5 px-2 bg-space-850 hover:bg-space-800 text-slate-200 rounded border border-white/10 text-[11px] font-medium"
              title="Transform system to Center-of-Mass rest frame (P = 0)"
            >
              Zero COM Momentum
            </button>
            <button
              onClick={handleApplyAdvanced}
              className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-[11px] shadow-md shadow-blue-600/20"
            >
              Apply Cartesian State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
