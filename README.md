# ORBITLAB — UNIVERSAL 3D TWO-BODY GRAVITATIONAL SIMULATOR
### ME 206 Statics and Dynamics | Computational Engineering Dynamics Project

[![Live Demo](https://img.shields.io/badge/Live%20Demo-orbitlab--eight.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://orbitlab-eight.vercel.app/)
![ME 206](https://img.shields.io/badge/ME%20206-Two--Body%20Orbital%20Mechanics-3b82f6?style=for-the-badge)
![Integrator](https://img.shields.io/badge/Integrator-Symplectic%20Velocity%20Verlet-10b981?style=for-the-badge)
![Units](https://img.shields.io/badge/SI%20Units-Pure%20MKS%20Engine-f97316?style=for-the-badge)
![Tests](https://img.shields.io/badge/Vitest-24%2F24%20Passing-emerald?style=for-the-badge)

🌐 **Live Application:** [https://orbitlab-eight.vercel.app/](https://orbitlab-eight.vercel.app/)  
📂 **GitHub Repository:** [https://github.com/ashu999gold-dot/OrbitLab](https://github.com/ashu999gold-dot/OrbitLab)

---

## 1. Executive Summary & Objective

**ORBITLAB** is a high-precision, interactive 3D two-body gravitational mechanics simulation platform engineered for the **ME 206 Statics and Dynamics** curriculum.

The application is deployed live and fully functional at **[https://orbitlab-eight.vercel.app/](https://orbitlab-eight.vercel.app/)**.

The application serves as an interactive computational laboratory: students and engineers can define custom celestial or hypothetical bodies, modify their state vectors in Cartesian or orbital parameters, switch between Inertial and Barycentric reference frames, inspect real-time conservation law metrics, overlay historical ghost comparison trajectories, and execute guided experiments verifying Keplerian orbital mechanics.

---

## 2. Step-by-Step Procedure to Run the Simulator

### Method A: Run Instantly in Browser (Zero Installation)

No software installation or environment configuration is required to run the simulator. Open the live deployment directly in any modern web browser with WebGL support (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari, or Brave):

👉 **[https://orbitlab-eight.vercel.app/](https://orbitlab-eight.vercel.app/)**

---

### Method B: Run Locally from Source Code (Step-by-Step)

Follow these exact steps to clone, set up, and run ORBITLAB locally on your computer:

#### Prerequisites
Ensure the following tools are installed on your machine:
- **Git**: [https://git-scm.com/](https://git-scm.com/)
- **Node.js** (`v18.0.0` or higher; `v20+` recommended): [https://nodejs.org/](https://nodejs.org/)
- **npm** (`v9.0.0` or higher, included automatically with Node.js)

To verify your environment, run in your terminal:
```bash
git --version
node -v
npm -v
```

#### Step 1: Clone the GitHub Repository
Open your terminal (PowerShell, Command Prompt, or bash) and clone the project:
```bash
git clone https://github.com/ashu999gold-dot/OrbitLab.git
cd OrbitLab
```

#### Step 2: Install Project Dependencies
Install the required packages (React, TypeScript, Three.js, React Three Fiber, Tailwind CSS, Lucide React, and Vitest):
```bash
npm install
```

#### Step 3: Start the Local Development Server
Launch the interactive Vite development server:
```bash
npm run dev
```

The terminal will confirm the local address:
```
  VITE v6.x.x  ready in ~350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Open **`http://localhost:5173/`** in your browser. The simulator will load immediately with the Earth–Moon system ready to run.

#### Step 4: (Optional) Build & Preview Production Bundle
To compile the production-optimized static web build and preview it:
```bash
npm run build
npm run preview
```
The preview server will run at **`http://localhost:4173/`**.

#### Step 5: (Optional) Run the Automated Physics Test Suite
To execute the comprehensive 24-test Vitest physics suite (verifying energy invariants, Kepler's 3rd Law, barycentric kinematics, and escape velocities):
```bash
npm test
```
Or for a single non-interactive run:
```bash
npx vitest run
```

---

### Method C: Step-by-Step Operating Guide (How to Use the Simulator)

Once the simulator is open in your browser, follow this workflow to run and analyze orbital scenarios:

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│ 1. Select Scenario      │ ──> │ 2. Start & Scale Time   │ ──> │ 3. Navigate 3D Viewport │
│ (Preset or Custom Body) │     │ (Play, Step, Speed xN)  │     │ (Orbit, Pan, Zoom)      │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
                                                                             │
┌─────────────────────────┐     ┌─────────────────────────┐                  ▼
│ 6. Analyze Telemetry    │ <── │ 5. Customize Parameters │ <── ┌─────────────────────────┐
│ (Energy Drift, Conic)   │     │ (Mass, Orbit, Radius)   │     │ 4. Toggle Overlays      │
└─────────────────────────┘     └─────────────────────────┘     │ (Vectors, Trails, Bary) │
                                                                └─────────────────────────┘
```

1. **Step 1: Choose a Simulation Preset**
   - In the left **Controls Panel**, select the **Presets** tab.
   - Choose from 4 curated physical systems:
     - **Earth–Moon System**: Observe the Moon orbiting Earth with the barycenter inside Earth's mantle ($4,671\text{ km}$ from center).
     - **Sun–Earth System**: Observe extreme mass-ratio Keplerian motion ($333,000:1$) over an annual period ($1\text{ AU}$, $365.25\text{ days}$).
     - **Equal-Mass Binary Stars**: Observe two identical stars orbiting their shared midpoint in empty space with zero total momentum.
     - **Escape Trajectory**: Observe an unbound hyperbolic flyby ($e = 1.56$, $E > 0$, apoapsis and period $\infty$).

2. **Step 2: Control Simulation Playback & Transport**
   - Use the docked **Bottom Control Strip**:
     - **Play / Pause** (or press `Space`): Start or halt numerical time integration.
     - **Step Forward** (or press `S`): Advance the simulation by exactly one numerical timestep ($\Delta t$) for frame-by-frame analysis.
     - **Reset** (or press `R`): Restore both bodies to their exact initial state and clear trajectory trails.

3. **Step 3: Scale Time for the Physical Regime**
   - Real-world astronomical systems operate across vast timescales:
     - Use **1×**, **10×**, or **100×** for close laboratory inspections or high-velocity flybys.
     - Use **180k×** ($180,000\times$ acceleration) to complete Earth–Moon orbits in seconds.
     - Use **1.2M×** or the custom speed slider for annual interplanetary orbits.

4. **Step 4: Navigate the 3D Camera Viewport**
   - **Rotate / Orbit View**: Click and drag with the left mouse button across the canvas.
   - **Pan Camera**: Click and drag with the right mouse button (or two-finger drag on trackpads).
   - **Zoom In / Out**: Scroll the mouse wheel to zoom into planetary surfaces or zoom out to full orbital scale.
   - **Reset View**: Click the camera icon in the bottom control strip to return to default centering.

5. **Step 5: Toggle Visual Physical Overlays**
   - Use the toggle buttons in the bottom control strip:
     - **Trails**: Enable/disable continuous GPU orbital path histories.
     - **Barycenter**: Toggle the glowing red center-of-mass crosshair.
     - **Velocity Vectors**: Display instantaneous velocity vectors ($\vec{v}$) showing tangential speed and direction.
     - **Force Vectors**: Display mutual gravitational attraction vectors ($\vec{F}$) illustrating Newton's 3rd Law.
     - **Distance Line**: Show the direct connecting chord and real-time distance readout.
     - **Coordinate Grid**: Display the 3D spatial reference plane.

6. **Step 6: Configure Custom Physical Bodies & Orbits**
   - Open the **Bodies** tab in the left panel:
     - Customize mass ($m_1, m_2$) with automatic unit conversion between kilograms ($\text{kg}$), Earth masses ($M_\oplus$), and Solar masses ($M_\odot$).
     - Customize physical radii ($R_1, R_2$) and display colors.
   - Open the **Orbit** tab:
     - Adjust initial separation distance ($r$) in $\text{m}$, $\text{km}$, or $\text{AU}$.
     - Adjust the orbital speed factor ($v / v_{\text{circ}}$):
       - Factor $< 1.0$: Tighter eccentric ellipse.
       - Factor $= 1.0$: Pure circular Keplerian orbit.
       - Factor $> 1.0$: Extended eccentric ellipse.
       - Factor $> \sqrt{2} \approx 1.414$: Unbound hyperbolic escape trajectory ($e > 1, E > 0$).
     - Adjust 3D orbital plane inclination angle.
   - Click **"Apply Setup & Initialize COM"**: Automatically initializes both bodies in the zero-momentum center-of-mass frame ($\vec{P} = \vec{0}$).

7. **Step 7: Monitor Real-Time Physics Telemetry**
   - In the right **Physics Dashboard**, inspect:
     - Instantaneous separation distance ($r$) and gravitational attraction force ($F$).
     - Instantaneous acceleration magnitudes ($a_1, a_2$).
     - Kinetic energy ($K$), potential energy ($U$), and total mechanical energy ($E$).
     - **Symplectic Conservation Badge**: A green badge confirms that energy drift $|\Delta E / E| < 0.05\%$ is strictly bounded by the Velocity Verlet integrator.
     - **Conic Classification**: Dynamic eccentricity ($e$), semi-major axis ($a$), and orbital period ($T$) updating every tick.

---

## 3. Fundamental Governing Equations

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

## 4. Conservation Laws & Real-Time Drift Tracking

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

## 5. Numerical Method: Symplectic Velocity Verlet

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

## 6. Architectural Overview

The application follows a clean decoupled architecture:

```
┌──────────────────────────────────────────────────────────┐
│                      User Interface                      │
│   (ControlsPanel, Canvas, PhysicsDashboard, Controls)   │
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
5. **Interactive Controls (`src/components/controls/`)**: Streamlined ControlsPanel with unit conversions, presets library, and floating transport strip.

---

## 7. Built-in Physical Presets

| Preset | Body 1 ($m_1$) | Body 2 ($m_2$) | Initial Separation | Demonstration Key |
| :--- | :--- | :--- | :--- | :--- |
| **Earth–Moon System** | $5.972 \times 10^{24}$ kg | $7.342 \times 10^{22}$ kg | $384,400$ km | Barycenter is ~4,671 km from Earth's center (inside Earth mantle, $R_\oplus = 6,371$ km). Period is ~27.3 sidereal days. |
| **Sun–Earth System** | $1.989 \times 10^{30}$ kg | $5.972 \times 10^{24}$ kg | $1.0$ AU ($1.496 \times 10^{11}$ m) | Extreme mass ratio (333,000:1). Barycenter is ~450 km from solar core. $T = 365.25$ days. |
| **Equal-Mass Binary** | $1.989 \times 10^{30}$ kg ($1.0 M_\odot$) | $1.989 \times 10^{30}$ kg ($1.0 M_\odot$) | $1.0$ AU | Perfect circular symmetry around barycenter at $(0,0,0)$ with $\vec{P}_{total} = \vec{0}$ and identical acceleration magnitudes ($a_1 = a_2$). |
| **Escape Trajectory** | $1.989 \times 10^{30}$ kg ($1.0 M_\odot$) | $5 \times 10^{4}$ kg | $0.4$ AU (periapsis) | Unbound hyperbolic orbit ($e = 1.56, E > 0$). Demonstrates gravitational slingshot, excess velocity at infinity, and infinite apoapsis/period. |

---

## 8. Interactive Feature & Controls Guide

### 8.1 Simulation Setup Panel (`ControlsPanel`)
- **Presets Tab**: Instant one-click selection of calibrated astronomical benchmarks.
- **Bodies Tab**: Customize Body 1 and Body 2:
  - Name and display color palette.
  - Mass with multi-unit selector: kilograms ($\text{kg}$), Earth masses ($M_\oplus$), Solar masses ($M_\odot$).
  - Physical radius with unit selector: meters ($\text{m}$), kilometers ($\text{km}$), Astronomical Units ($\text{AU}$).
- **Orbit Tab**:
  - Initial separation distance ($r$) in $\text{m}$, $\text{km}$, or $\text{AU}$.
  - Orbital speed factor ($v / v_{\text{circ}}$) with circularization indicator.
  - 3D orbital plane inclination angle.
  - **"Apply Setup & Initialize COM"**: Recalculates velocities such that total system momentum is zero ($\vec{P} = \vec{0}$) in the barycentric frame.

### 8.2 Floating Bottom Control Strip (`BottomControlStrip`)
- **Transport Controls**: Play, Pause, Step Forward ($\Delta t$), Reset ($R$).
- **Speed Multipliers**: One-click presets ($1\times, 10\times, 100\times, 10\text{k}\times, 180\text{k}\times, 1.2\text{M}\times$).
- **Overlay Toggles**: Orbital Trails, Barycenter Crosshair, Velocity Vectors, Force Vectors, Distance Line, Coordinate Grid.
- **Camera Centering**: Quick reset to default 3D isometric view.

### 8.3 Real-Time Physics Telemetry Dashboard (`PhysicsDashboard`)
- **Kinematic Readouts**: Instantaneous distance $r$, gravitational force $F$, vector accelerations $a_1, a_2$.
- **Energy Invariants**: Kinetic energy $K$, gravitational potential energy $U$, total mechanical energy $E$.
- **Symplectic Integrity**: Real-time relative energy drift tracking ($|\Delta E / E| < 0.05\%$) displayed on a live 60 FPS CanvasChart.
- **Conic State**: Dynamic eccentricity ($e$), semi-major axis ($a$), orbital period ($T$), periapsis ($r_p$), and apoapsis ($r_a$).

---

## 9. Physical Model Assumptions & Academic Limitations

To maintain scientific integrity for ME 206, the simulator explicitly states its governing scope:

1. **Newtonian Point-Mass Gravitation**: Bodies are treated as spherically symmetric point masses. By Newton's Shell Theorem, gravitational potentials outside their surfaces match point sources.
2. **Strictly Isolated Two-Body System**: Relativistic frame dragging, Schwarzschild precession, gravitational radiation, and third-body gravitational perturbations are omitted.
3. **No Non-Conservative Dissipation**: Tidal dissipation, atmospheric drag, solar radiation pressure, and outgassing are not modeled.
4. **Collision Kinematics**: When center-to-center distance $r \le R_1 + R_2$, contact is flagged, an alert appears, and the integration halts safely without numerical singularities.

---

## 10. Verification & Automated Test Suite

OrbitLab includes a comprehensive test suite powered by **Vitest** covering all mathematical and algorithmic modules:

```bash
# Execute automated test suite
npm test
```

### Test Coverage Highlights (24/24 Tests Passing):
- `src/tests/physics/me206-physics.test.ts`: Complete verification of the 10 core ME 206 physical laws (Newton's law of gravitation, accelerations, COM kinematics, momentum conservation, angular momentum conservation, total mechanical energy, circular orbit $v_{circ}$, elliptical orbit Vis-Viva, hyperbolic escape $v \ge v_{esc}$, and surface collision detection).
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

## 11. Project Demonstration Video & Deliverables

A complete, professionally produced 5-minute academic demonstration video is included in the repository:

- 🎬 **Demonstration Video**: [`video/ORBITLAB_Project_Demonstration.mp4`](video/ORBITLAB_Project_Demonstration.mp4) (1920×1080 Full HD, 30 FPS, H.264, AAC Stereo, 305.6s duration)
- 📝 **Narration Script**: [`video/narration_script.md`](video/narration_script.md) (Complete timed narration across 6 scenes)
- 📐 **Storyboard**: [`video/storyboard.md`](video/storyboard.md) (Scene-by-scene visual cues, camera paths, and telemetry markers)
- 💬 **Subtitles**: [`video/subtitles.srt`](video/subtitles.srt) (33 aligned timecoded subtitle cues)
- 🔬 **Production Notes**: [`video/production_notes.md`](video/production_notes.md) (Technical recording pipeline, WebGL instrumentation, and verification log)

---

## 12. Academic Attribution

**Course:** ME 206 Statics and Dynamics  
**Institution:** Indian Institute of Technology Gandhinagar (IITGN)  
**Assignment:** 3D Two-Body Gravitational Orbital Mechanics Simulator  
**Core Technologies:** React 19, TypeScript, Vite, Three.js, React Three Fiber, Tailwind CSS, Lucide React, Vitest  
**Numerical Formulation:** Kick-drift-kick Symplectic Velocity Verlet ($\mathcal{O}(h^2)$)  
**Standard Constants:** CODATA 2018 ($G = 6.67430 \times 10^{-11} \text{ m}^3\text{kg}^{-1}\text{s}^{-2}$)
