# ORBITLAB — UNIVERSAL 3D TWO-BODY GRAVITATIONAL SIMULATOR
### ME 206 Statics and Dynamics | Computational Engineering Dynamics Project

![OrbitLab Banner](https://img.shields.io/badge/ME%20206-Two--Body%20Orbital%20Mechanics-3b82f6?style=for-the-badge)
![Integrator](https://img.shields.io/badge/Integrator-Symplectic%20Velocity%20Verlet-10b981?style=for-the-badge)
![Units](https://img.shields.io/badge/SI%20Units-Pure%20MKS%20Engine-f97316?style=for-the-badge)
![Tests](https://img.shields.io/badge/Vitest-14%2F14%20Passing-emerald?style=for-the-badge)

---

## 1. Executive Summary & Objective

**ORBITLAB** is a high-precision, interactive 3D two-body gravitational mechanics simulation platform engineered for the **ME 206 Statics and Dynamics** curriculum. 

The software models the deterministic physical interaction of two arbitrary spherical masses moving in three-dimensional space under mutual Newtonian gravitation ($F = G \frac{m_1 m_2}{r^2}$). By implementing a second-order symplectic **kick-drift-kick Velocity Verlet** numerical integrator, OrbitLab preserves phase space volume and constrains relative energy drift strictly below $10^{-4}$ (0.01%) over thousands of integration steps, avoiding the unphysical spiral degradation characteristic of standard Euler methods.

The application serves as an interactive computational laboratory: students and engineers can define custom celestial or hypothetical bodies, modify their state vectors in Cartesian or orbital parameters, switch between Inertial and Barycentric reference frames, inspect real-time conservation law metrics, overlay historical ghost comparison trajectories, and execute guided experiments verifying Keplerian orbital mechanics.

---

## 2. Fundamental Governing Equations

All internal physics calculations are executed strictly in SI base units (meters, kilograms, seconds, Newtons, Joules). Conversions to astronomical units (AU, Earth masses, Solar masses, km/s) occur solely at the input/display boundary.

```
       m1 [Body A] •────────────────── r ──────────────────• m2 [Body B]
                   ◄──────── F21        F12 ────────►
                              • [Barycenter R_cm]
```

### 2.1 Newton's Law of Universal Gravitation & Newton's Third Law
Let two point masses $m_1$ and $m_2$ have instantaneous positions $\vec{r}_1, \vec{r}_2 \in \mathbb{R}^3$ and velocities $\vec{v}_1, \vec{v}_2 \in \mathbb{R}^3$. The relative displacement vector directed from Body 1 to Body 2 is:

$$\vec{r}_{12} = \vec{r}_2 - \vec{r}_1, \quad r = \|\vec{r}_{12}\| = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

The attractive gravitational force exerted on mass $m_1$ by mass $m_2$ is:

$$\vec{F}_{21} = G \frac{m_1 m_2}{r^3} \vec{r}_{12}$$

In accordance with **Newton's Third Law** ($\vec{F}_{12} = -\vec{F}_{21}$), the gravitational force exerted on mass $m_2$ by mass $m_1$ is:

$$\vec{F}_{12} = -G \frac{m_1 m_2}{r^3} \vec{r}_{12}$$

where the Newtonian universal gravitational constant is:

$$G = 6.67430 \times 10^{-11} \text{ m}^3\text{kg}^{-1}\text{s}^{-2}$$

Applying Newton's Second Law ($\sum \vec{F} = m \vec{a}$), the instantaneous accelerations in an inertial reference frame are:

$$\vec{a}_1 = \frac{\vec{F}_{21}}{m_1} = \frac{G m_2}{r^3} \vec{r}_{12}$$

$$\vec{a}_2 = \frac{\vec{F}_{12}}{m_2} = -\frac{G m_1}{r^3} \vec{r}_{12}$$

Notice that both bodies accelerate towards one another; neither body is held fixed artificially.

---

### 2.2 Center of Mass (Barycenter) Kinematics
For an isolated two-body system with total mass $M = m_1 + m_2$, the barycenter position vector $\vec{R}_{cm}$ and its linear velocity $\vec{V}_{cm}$ are:

$$\vec{R}_{cm} = \frac{m_1 \vec{r}_1 + m_2 \vec{r}_2}{m_1 + m_2}$$

$$\vec{V}_{cm} = \frac{m_1 \vec{v}_1 + m_2 \vec{v}_2}{m_1 + m_2} = \frac{\vec{P}_{total}}{M}$$

Because the system is isolated ($\sum \vec{F}_{ext} = \vec{0}$), the center-of-mass velocity is an invariant of motion ($\dot{\vec{V}}_{cm} = \vec{0}$). OrbitLab supports transforming coordinates into the **Barycentric Reference Frame**, where:

$$\vec{r}_i' = \vec{r}_i - \vec{R}_{cm}, \quad \vec{v}_i' = \vec{v}_i - \vec{V}_{cm}$$

In this frame, the barycenter remains permanently stationary at the origin $(0, 0, 0)$ and $\vec{P}'_{total} = \vec{0}$.

---

### 2.3 Relative Orbital Mechanics & Keplerian State
Subtracting $\vec{a}_1$ from $\vec{a}_2$ yields the relative equation of motion:

$$\ddot{\vec{r}} = \vec{a}_2 - \vec{a}_1 = -\frac{G(m_1 + m_2)}{r^3} \vec{r} = -\frac{\mu_{std}}{r^3} \vec{r}$$

where $\mu_{std} = G(m_1 + m_2)$ is the standard gravitational parameter of the system.

1. **Specific Relative Angular Momentum**:
   $$\vec{h} = \vec{r} \times \vec{v}, \quad h = \|\vec{h}\|$$
   Because gravity is a central force ($\vec{r} \times \vec{F} = \vec{0}$), $\vec{h}$ is conserved, constraining the orbit to an invariant plane perpendicular to $\vec{h}$.

2. **Specific Orbital Energy**:
   $$\epsilon = \frac{v^2}{2} - \frac{\mu_{std}}{r}$$

3. **Eccentricity Vector ($\vec{e}$)**:
   $$\vec{e} = \frac{\vec{v} \times \vec{h}}{\mu_{std}} - \frac{\vec{r}}{r}, \quad e = \|\vec{e}\|$$
   The vector $\vec{e}$ points directly toward periapsis, and its magnitude $e$ defines the conic section geometry:
   - $e < 0.01$: **Circular Orbit** ($\epsilon < 0$)
   - $0.01 \le e < 0.999$: **Elliptical Orbit** ($\epsilon < 0$, bound periodic motion)
   - $0.999 \le e \le 1.005$: **Parabolic Escape Trajectory** ($\epsilon \approx 0$)
   - $e > 1.005$: **Hyperbolic Escape Trajectory** ($\epsilon > 0$, unbound flyby)
   - $h < 10^{-6}$: **Degenerate Radial Trajectory** (direct head-on collision or ejection along a 1D line)

4. **Semi-Major Axis ($a$) and Orbital Period ($T$)**:
   $$a = -\frac{\mu_{std}}{2\epsilon} \quad (\text{for } \epsilon < 0)$$
   $$T = 2\pi \sqrt{\frac{a^3}{\mu_{std}}} \quad (\text{Kepler's Third Law})$$
   $$r_p = a(1 - e) \quad (\text{Periapsis}), \quad r_a = a(1 + e) \quad (\text{Apoapsis})$$

5. **Vis-Viva Equation**:
   $$v(r) = \sqrt{\mu_{std} \left(\frac{2}{r} - \frac{1}{a}\right)}$$

---

## 3. Conservation Laws & Real-Time Drift Tracking

The application monitors three fundamental invariants of Hamiltonian dynamics at every simulation tick:

| Conserved Invariant | Mathematical Formulation | Physical Significance |
| :--- | :--- | :--- |
| **Total Linear Momentum** ($\vec{P}$) | $\vec{P} = m_1 \vec{v}_1 + m_2 \vec{v}_2$ | System isolation: $\sum \vec{F}_{ext} = \vec{0}$. |
| **Total Angular Momentum** ($\vec{L}$) | $\vec{L} = m_1 (\vec{r}_1 \times \vec{v}_1) + m_2 (\vec{r}_2 \times \vec{v}_2)$ | Central force field: net torque $\vec{\tau}_{net} = \vec{0}$. Invariant orbital plane. |
| **Total Mechanical Energy** ($E$) | $E = K_1 + K_2 + U = \frac{1}{2}m_1 v_1^2 + \frac{1}{2}m_2 v_2^2 - \frac{G m_1 m_2}{r}$ | Conservative potential field ($\nabla \times \vec{F} = \vec{0}$). |

### Relative Numerical Drift Metrics
To verify symplectic preservation, OrbitLab tracks:

$$\text{Energy Drift } \Delta E_{rel}(t) = \frac{|E(t) - E(0)|}{|E(0)|}$$

$$\text{Angular Momentum Drift } \Delta L_{rel}(t) = \frac{\|\vec{L}(t) - \vec{L}(0)\|}{\|\vec{L}(0)\|}$$

Whenever $\Delta E_{rel} < 0.05\%$, a green badge confirms high-fidelity symplectic conservation. If drift exceeds $1.0\%$ (due to selecting an excessively large timestep $h$ near a tight periapsis), the dashboard warns the user to decrease the integration timestep.

---

## 4. Numerical Method: Symplectic Velocity Verlet

Standard explicit schemes (such as Forward Euler) fail drastically in gravitational orbits because they artificially pump energy into the system, causing orbits to spiral outward uncontrollably. Explicit Runge-Kutta 4th order (RK4) produces excellent short-term accuracy but lacks phase-space area preservation (symplecticity), leading to long-term secular drift.

OrbitLab uses the second-order, time-reversible **kick-drift-kick Velocity Verlet** algorithm:

$$\vec{v}_i\left(t + \frac{h}{2}\right) = \vec{v}_i(t) + \frac{1}{2}\vec{a}_i(t) h$$

$$\vec{r}_i(t + h) = \vec{r}_i(t) + \vec{v}_i\left(t + \frac{h}{2}\right) h$$

$$\vec{a}_i(t + h) = \vec{a}_i\left(\vec{r}_1(t + h), \vec{r}_2(t + h)\right)$$

$$\vec{v}_i(t + h) = \vec{v}_i\left(t + \frac{h}{2}\right) + \frac{1}{2}\vec{a}_i(t + h) h$$

### Sub-stepping & Clock Decoupling
To ensure simulation stability across varying frame rates:
- **Independent Simulation Clock**: The integration timestep $h$ is strictly decoupled from the render frame delta $\Delta t_{render}$.
- **Accumulator Architecture**: Frame delta is accumulated ($t_{accum} += \Delta t \times \text{speedMultiplier}$). When $t_{accum} \ge h$, the engine takes a fixed step $h$.
- **Substeps Clamping**: To prevent the "spiral of death" when frame rates drop, substeps per frame are clamped to a safe maximum ($N_{max} = 32$), raising an `isFallingBehind` warning if processing capacity is exceeded.

---

## 5. Architectural Overview

The application follows a clean 5-layer decoupled architecture:

```
┌──────────────────────────────────────────────────────────┐
│                      User Interface                      │
│   (ControlsPanel, UniversalObjectEditor, Dashboard, ...) │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                   Simulation Controller                  │
│       (Playback state, Decoupled Clock, Listeners)       │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                      Physics Engine                      │
│  (Velocity Verlet, Gravity, Energy, Momentum, Keplerian) │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                 3D Graphics (WebGL/Three)                │
│    (OrbitCanvas, ScaleManager, GPU Buffer Trails, ...)   │
└──────────────────────────────────────────────────────────┘
```

1. **Physics Layer (`src/physics/`)**: Zero-dependency pure TypeScript numerical functions operating in SI units.
2. **Simulation Layer (`src/simulation/`)**: State containers, accumulator clocks, initial conditions generators, preset definitions, and validation guards.
3. **Visualization Layer (`src/visualization/` & `src/components/canvas/`)**: Coordinate scaling, camera managers, Three.js WebGL canvas, GPU dynamic buffer geometry trails, vector arrows, and atmospheric glow shaders.
4. **Dashboard Layer (`src/components/dashboard/`)**: Real-time telemetry, 60 FPS 2D Canvas charts, and conservation status badges.
5. **Interactive Controls & Experiments (`src/components/`)**: Object editor with unit conversions, guided experiment workflows with ghost trajectory comparison snapshotting, and JSON export/import.

---

## 6. Built-in Physical Presets

| Preset | Body 1 ($m_1$) | Body 2 ($m_2$) | Initial Separation | Demonstration Key |
| :--- | :--- | :--- | :--- | :--- |
| **Earth–Moon System** | $5.972 \times 10^{24}$ kg | $7.342 \times 10^{22}$ kg | $384,400$ km | Barycenter is ~4,671 km from Earth's center (inside Earth mantle, $R_\oplus = 6,371$ km). Period is ~27.3 sidereal days. |
| **Sun–Earth System** | $1.989 \times 10^{30}$ kg | $5.972 \times 10^{24}$ kg | $1.0$ AU ($1.496 \times 10^{11}$ m) | Extreme mass ratio (333,000:1). Barycenter is ~450 km from solar core. $T = 365.25$ days. |
| **Binary Stars (Unequal)** | $2.984 \times 10^{30}$ kg ($1.5 M_\odot$) | $1.790 \times 10^{30}$ kg ($0.9 M_\odot$) | $0.8$ AU | Unequal circular orbits: lighter star orbits faster at a larger radius. |
| **Equal-Mass Binary** | $1.989 \times 10^{30}$ kg ($1.0 M_\odot$) | $1.989 \times 10^{30}$ kg ($1.0 M_\odot$) | $1.0$ AU | Perfect circular symmetry around barycenter at $(0,0,0)$ with $\vec{P}_{total} = \vec{0}$. |
| **Elliptical Orbit ($e = 0.75$)** | $1.989 \times 10^{30}$ kg | $10^{22}$ kg | $0.25$ AU (periapsis) | Vis-Viva energy exchange: extreme acceleration at periapsis and deceleration at apoapsis. |
| **Hyperbolic Flyby ($e = 1.35$)** | $1.989 \times 10^{30}$ kg | $5 \times 10^{4}$ kg | $0.4$ AU (periapsis) | Unbound orbit ($\epsilon > 0$). Demonstrates gravitational slingshot and excess velocity at infinity. |

---

## 7. Interactive Feature Guide

### 7.1 Universal Object Editor
- **Body A & Body B Independent Configuration**: Customize name, display color, mass, radius, 3D position, and velocity.
- **Input Modes**:
  - **Simple Mode**: Configure initial separation distance, primary/secondary mass, and orbital speed factor (0.5 to 1.8 of circular velocity).
  - **Advanced Cartesian Mode**: Input raw 3D vectors $(x, y, z)$ and $(v_x, v_y, v_z)$.
- **Multi-Unit Selector**:
  - Distance: meters ($\text{m}$), kilometers ($\text{km}$), Astronomical Units ($\text{AU}$).
  - Mass: kilograms ($\text{kg}$), Earth masses ($M_\oplus$), Solar masses ($M_\odot$).
  - Velocity: meters/second ($\text{m/s}$), kilometers/second ($\text{km/s}$).
- **Zero Center-of-Mass Momentum Balancer**: Automatically adjusts Body 2's velocity such that the system's net linear momentum is exactly zero ($\vec{P} = \vec{0}$), ensuring the barycenter remains motionless.
- **Circularize Velocity Button**: Instantly sets the transverse velocity of Body 2 to the exact circular Keplerian orbital speed $v_{circ} = \sqrt{G(m_1+m_2)/r}$.

### 7.2 Guided Scientific Experiments & Ghost Trajectory Snapshotting
Accessible via the **Experiments** button in the header:
1. **Experiment 1: Orbit Shape vs Initial Velocity** — Inspect circular ($v = v_c$), elliptical ($v_c < v < v_{esc}$), and hyperbolic ($v > v_{esc}$) regimes.
2. **Experiment 2: Mass Ratio and Barycenter Motion** — Compare symmetric binaries ($1:1$) against planetary systems ($333,000:1$) to observe barycenter displacement.
3. **Experiment 3: Separation & Orbital Period (Kepler's 3rd Law)** — Verify that $T^2 / a^3 = 4\pi^2 / (G M)$ holds across different orbital separations.
- **Ghost Comparison Baseline**: Click **"Snapshot as Ghost Baseline"** to freeze the current trajectory in the 3D scene as a dashed ghost trail. Modify masses or velocities and replay to observe the differential trajectory evolution side-by-side!

### 7.3 Reference Frames & 3D Overlays
- **Reference Frame Toggle**:
  - `Inertial`: Trajectories rendered relative to the fixed laboratory space coordinates.
  - `Barycentric`: Coordinates dynamically shifted so the barycenter stays at $(0, 0, 0)$.
- **Camera Tracking Modes**: Focus camera on Barycenter (COM), Body 1, Body 2, or Free Orbit.
- **Camera Perspective Presets**: One-click Top-Down, Side-View, and Isometric viewpoints.
- **Physical Overlays**:
  - Velocity vectors ($\vec{v}$) and Gravitational force vectors ($\vec{F}$).
  - Barycenter crosshair marker and mutual separation line.
  - Dynamic GPU buffer geometry orbital trails.
  - Collision contact shockwave alert when $r \le R_1 + R_2$.

### 7.4 Configuration Import & Export
- **Export**: Generates a clean JSON file containing full body parameters, physical constants, simulation settings, and schema metadata.
- **Import**: Validates JSON schema, mass/radius positivity, and coordinates before safely loading into the simulation.

---

## 8. Physical Model Assumptions & Academic Limitations

To maintain scientific integrity for ME 206, the simulator explicitly states its governing scope:

1. **Newtonian Point-Mass Gravitation**: Bodies are treated as spherically symmetric point masses. By Newton's Shell Theorem, gravitational potentials outside their surfaces match point sources.
2. **Strictly Isolated Two-Body System**: Relativistic frame dragging, Schwarzschild precession, gravitational radiation, and third-body gravitational perturbations are omitted.
3. **No Non-Conservative Dissipation**: Tidal dissipation, atmospheric drag, solar radiation pressure, and outgassing are not modeled.
4. **Collision Kinematics**: When center-to-center distance $r \le R_1 + R_2$, contact is flagged, an alert appears, and the integration halts safely without numerical singularities.

---

## 9. Verification & Automated Test Suite

OrbitLab includes a comprehensive test suite powered by **Vitest** covering all mathematical and algorithmic modules:

```bash
# Execute automated test suite
npm test
```

### Test Coverage Highlights:
- `src/tests/physics/gravity.test.ts`: Newton's Third Law action-reaction parity ($\vec{F}_1 = -\vec{F}_2$), inverse-square scaling ($F \propto 1/r^2$), gravitational potential energy.
- `src/tests/physics/integrator.test.ts`: Symplectic phase-space preservation (energy drift $< 10^{-5}$ over full orbital periods), angular momentum invariance ($< 10^{-12}$), center-of-mass momentum invariance.
- `src/tests/physics/orbital-elements.test.ts`: Conic classification thresholds, Vis-Viva velocity consistency, degenerate radial collision cases ($h \approx 0$), semi-major axis, and orbital period verification against Kepler's 3rd Law.
- `src/tests/simulation/validation.test.ts`: Positivity constraints ($m > 0, R > 0$), non-zero separation ($r > 0$), and finite floating-point validation.

### Standalone Analytical Verification Script:
```bash
node src/physics/__tests__/verify.mjs
```
Runs independent analytical tests for circular orbit stability, Earth-Moon sidereal period (~27.32 days), and eccentric orbit energy conservation.

---

## 10. Installation & Local Development

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Setup
```bash
# 1. Clone repository
git clone https://github.com/your-username/me-206-orbital-simulator.git
cd me-206-orbital-simulator

# 2. Install dependencies
npm install

# 3. Run automated tests
npm test

# 4. Start local development server
npm run dev
```

### Production Build & Static Preview
```bash
npm run build
npm run preview
```
The application compiles into a zero-backend, statically deployable bundle in `dist/`, fully compatible with Vercel, Netlify, or GitHub Pages.

---

## 11. Academic Attribution

**Course:** ME 206 Statics and Dynamics  
**Assignment:** 3D Two-Body Gravitational Orbital Mechanics Simulator  
**Core Technologies:** React 19, TypeScript, Vite, Three.js, Tailwind CSS, Lucide React, Vitest  
**Numerical Formulation:** Kick-drift-kick Symplectic Velocity Verlet ($\mathcal{O}(h^2)$)  
**Standard Constants:** CODATA 2018 ($G = 6.67430 \times 10^{-11} \text{ m}^3\text{kg}^{-1}\text{s}^{-2}$)
