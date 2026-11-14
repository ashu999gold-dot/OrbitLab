// ORBITLAB — ME 206 Statics & Dynamics Academic Theory Guide
// Interactive modal providing rigorous governing equations, derivations,
// orbit classification reference, and numerical methods documentation.

import React, { useState } from 'react';
import { BookOpen, Orbit, ShieldCheck, X } from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'equations' | 'orbits' | 'kepler' | 'verlet' | 'barycenter'>('equations');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-space-900/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h1 className="text-base font-semibold tracking-wide text-white">
                ME 206 Orbital Mechanics & Dynamics Guide
              </h1>
              <p className="text-xs text-slate-400">
                Governing Equations, Symplectic Conservation & Keplerian Theory
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-space-950/60 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveSection('equations')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeSection === 'equations'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Governing Equations
          </button>
          <button
            onClick={() => setActiveSection('barycenter')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeSection === 'barycenter'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Barycenter & Momentum
          </button>
          <button
            onClick={() => setActiveSection('orbits')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeSection === 'orbits'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Orbit Classifications
          </button>
          <button
            onClick={() => setActiveSection('kepler')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeSection === 'kepler'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Kepler's Laws & Vis-Viva
          </button>
          <button
            onClick={() => setActiveSection('verlet')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeSection === 'verlet'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Velocity Verlet Integrator
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-300">
          {activeSection === 'equations' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Orbit className="w-4 h-4 text-blue-400" />
                Newton's Law of Universal Gravitation
              </h3>
              <p>
                In a classical two-body system consisting of masses <code className="text-blue-300">m₁</code> and{' '}
                <code className="text-orange-300">m₂</code> located at position vectors{' '}
                <code className="text-slate-200">r₁</code> and <code className="text-slate-200">r₂</code>, the mutual
                gravitational attraction obeys Newton's inverse-square law:
              </p>
              <div className="bg-space-950 p-3 rounded-lg border border-white/5 font-mono text-center text-blue-300 text-sm">
                F₂₁ = (G · m₁ · m₂ / r³) · (r₂ - r₁)
              </div>
              <p>
                By <strong>Newton's Third Law of Motion</strong> (action and reaction), the force exerted on body 2 by body 1
                is equal in magnitude and strictly opposite in direction:
              </p>
              <div className="bg-space-950 p-3 rounded-lg border border-white/5 font-mono text-center text-slate-200 text-sm">
                F₁₂ = - F₂₁
              </div>
              <p>
                The resulting instantaneous accelerations are:
              </p>
              <div className="bg-space-950 p-3 rounded-lg border border-white/5 font-mono text-center text-slate-200 text-xs space-y-1">
                <div>a₁ = (G · m₂ / r³) · (r₂ - r₁)</div>
                <div>a₂ = - (G · m₁ / r³) · (r₂ - r₁)</div>
              </div>
              <p className="text-xs text-slate-400">
                Where <code className="text-slate-300">G = 6.67430 × 10⁻¹¹ m³·kg⁻¹·s⁻²</code> (CODATA recommended constant) and{' '}
                <code className="text-slate-300">r = ‖r₂ - r₁‖</code>.
              </p>
            </div>
          )}

          {activeSection === 'barycenter' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Centre of Mass (Barycenter) & Conservation</h3>
              <p>
                The center of mass (or <em>barycenter</em>) of the isolated two-body system is given by:
              </p>
              <div className="bg-space-950 p-3 rounded-lg border border-white/5 font-mono text-center text-blue-300 text-sm">
                R_cm = (m₁ · r₁ + m₂ · r₂) / (m₁ + m₂)
              </div>
              <p>
                Differentiating with respect to time yields the barycenter drift velocity:
              </p>
              <div className="bg-space-950 p-3 rounded-lg border border-white/5 font-mono text-center text-slate-200 text-sm">
                V_cm = (m₁ · v₁ + m₂ · v₂) / (m₁ + m₂) = P_total / M
              </div>
              <div className="bg-space-900/80 p-3 rounded-lg border border-blue-500/20 text-xs space-y-2">
                <div className="font-semibold text-blue-400">Conservation Theorems (ME 206 Dynamics):</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>
                    <strong>Conservation of Linear Momentum:</strong> Since no external forces act on the isolated two-body system (Σ F_ext = 0),{' '}
                    <code className="text-slate-200">P_total = m₁v₁ + m₂v₂ = const</code>. In the barycentric rest frame,{' '}
                    <code className="text-slate-200">P_total = 0</code>.
                  </li>
                  <li>
                    <strong>Conservation of Angular Momentum:</strong> Gravitational forces are purely central (collinear with r), meaning the mutual torque{' '}
                    <code className="text-slate-200">τ = r × F = 0</code>. Therefore, total angular momentum{' '}
                    <code className="text-slate-200">L = m₁(r₁ × v₁) + m₂(r₂ × v₂)</code> is rigorously conserved in both magnitude and orientation.
                  </li>
                  <li>
                    <strong>Conservation of Mechanical Energy:</strong> Gravity is a conservative potential field. Total energy{' '}
                    <code className="text-slate-200">E = T + U = 0.5(m₁v₁² + m₂v₂²) - (G m₁ m₂ / r)</code> remains invariant over time.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'orbits' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Keplerian Conic Sections & Eccentricity</h3>
              <p>
                The geometry of a two-body orbit is determined by the <strong>eccentricity vector</strong> <code className="text-blue-300">e</code>:
              </p>
              <div className="bg-space-950 p-3 rounded-lg border border-white/5 font-mono text-center text-blue-300 text-sm">
                e = (v × h) / μ - (r / ‖r‖)
              </div>
              <p>
                where <code className="text-slate-200">h = r × v</code> is specific angular momentum and{' '}
                <code className="text-slate-200">μ = G(m₁ + m₂)</code> is the standard gravitational parameter.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-space-950 p-3 rounded-lg border border-emerald-500/30">
                  <span className="font-semibold text-emerald-400 block mb-1">Circular Orbit (e = 0)</span>
                  <p className="text-slate-300">
                    Energy <code className="text-slate-200">E &lt; 0</code>. Distance remains strictly constant{' '}
                    <code className="text-slate-200">r = a</code>. Circular orbital speed is{' '}
                    <code className="text-slate-200">v_circ = √(μ / r)</code>.
                  </p>
                </div>

                <div className="bg-space-950 p-3 rounded-lg border border-blue-500/30">
                  <span className="font-semibold text-blue-400 block mb-1">Elliptical Orbit (0 &lt; e &lt; 1)</span>
                  <p className="text-slate-300">
                    Energy <code className="text-slate-200">E &lt; 0</code>. Closed periodic trajectory with semi-major axis{' '}
                    <code className="text-slate-200">a &gt; 0</code>. Periapsis <code className="text-slate-200">r_p = a(1-e)</code>,
                    Apoapsis <code className="text-slate-200">r_a = a(1+e)</code>.
                  </p>
                </div>

                <div className="bg-space-950 p-3 rounded-lg border border-purple-500/30">
                  <span className="font-semibold text-purple-400 block mb-1">Parabolic Trajectory (e = 1)</span>
                  <p className="text-slate-300">
                    Energy <code className="text-slate-200">E = 0</code>. Exact boundary between bound and unbound motion. Escape velocity{' '}
                    <code className="text-slate-200">v_esc = √(2μ / r)</code>.
                  </p>
                </div>

                <div className="bg-space-950 p-3 rounded-lg border border-amber-500/30">
                  <span className="font-semibold text-amber-400 block mb-1">Hyperbolic Flyby (e &gt; 1)</span>
                  <p className="text-slate-300">
                    Energy <code className="text-slate-200">E &gt; 0</code>. Open, unbound trajectory with hyperbolic excess velocity{' '}
                    <code className="text-slate-200">v_∞ = √(2ε)</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'kepler' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Kepler's Laws of Planetary Motion & Vis-Viva</h3>
              <div className="space-y-3 text-xs">
                <div className="bg-space-950 p-3 rounded-lg border border-white/5">
                  <span className="font-semibold text-blue-400 block mb-1">1. First Law (Law of Ellipses)</span>
                  <p>
                    The orbit of each body relative to the other is an ellipse with the center of attraction at one focus.
                  </p>
                </div>
                <div className="bg-space-950 p-3 rounded-lg border border-white/5">
                  <span className="font-semibold text-blue-400 block mb-1">2. Second Law (Law of Equal Areas)</span>
                  <p>
                    A line segment joining two bodies sweeps out equal areas during equal intervals of time:{' '}
                    <code className="text-slate-200">dA/dt = 0.5 ‖h‖ = constant</code>. This is a direct geometric consequence of angular momentum conservation!
                  </p>
                </div>
                <div className="bg-space-950 p-3 rounded-lg border border-white/5">
                  <span className="font-semibold text-blue-400 block mb-1">3. Third Law (Harmonic Law)</span>
                  <p>
                    The square of the orbital period <code className="text-slate-200">T</code> is proportional to the cube of the semi-major axis{' '}
                    <code className="text-slate-200">a</code>:
                  </p>
                  <div className="font-mono text-center text-blue-300 py-1">
                    T² = [4π² / (G(m₁ + m₂))] · a³
                  </div>
                </div>
                <div className="bg-space-950 p-3 rounded-lg border border-amber-500/20">
                  <span className="font-semibold text-amber-400 block mb-1">The Vis-Viva Equation</span>
                  <p>
                    Relates instantaneous relative velocity <code className="text-slate-200">v</code> directly to mutual separation{' '}
                    <code className="text-slate-200">r</code> and semi-major axis <code className="text-slate-200">a</code>:
                  </p>
                  <div className="font-mono text-center text-amber-300 text-sm py-1.5">
                    v² = G(m₁ + m₂) · (2/r - 1/a)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'verlet' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Velocity Verlet Symplectic Numerical Integration
              </h3>
              <p>
                Unlike standard explicit Euler integration (which introduces artificial energy growth and spirals outward over time),
                OrbitLab implements the <strong>Velocity Verlet</strong> symplectic algorithm:
              </p>
              <div className="bg-space-950 p-4 rounded-lg border border-white/10 font-mono text-xs space-y-2 text-slate-200">
                <div className="text-emerald-400 font-bold">// 1. Half-step velocity kick:</div>
                <div>v(t + Δt/2) = v(t) + 0.5 · a(t) · Δt</div>
                <div className="text-emerald-400 font-bold">// 2. Full-step position drift:</div>
                <div>r(t + Δt) = r(t) + v(t + Δt/2) · Δt</div>
                <div className="text-emerald-400 font-bold">// 3. Evaluate gravitational accelerations at r(t + Δt):</div>
                <div>a(t + Δt) = computeAccelerations(r(t + Δt))</div>
                <div className="text-emerald-400 font-bold">// 4. Final velocity kick:</div>
                <div>v(t + Δt) = v(t + Δt/2) + 0.5 · a(t + Δt) · Δt</div>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 text-xs text-emerald-200">
                <strong>Why Symplectic?</strong> The Velocity Verlet algorithm exactly preserves the symplectic 2-form of Hamiltonian dynamics (Poincaré invariants).
                Energy does not drift monotonically over thousands of orbital revolutions, guaranteeing scientific accuracy for ME 206 dynamics studies.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-space-900/80 text-xs text-slate-400">
          <span>ME 206: Statics and Dynamics — Two-Body Orbital Simulator</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
