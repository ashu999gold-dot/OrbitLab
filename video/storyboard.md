# ORBITLAB — Video Demonstration Storyboard
**Course:** ME 206 Statics and Dynamics | BTech Academic Project  
**Institution:** Indian Institute of Technology Gandhinagar (IITGN)  
**Target Video Specs:** 1920×1080 (16:9), 30 FPS, H.264 MP4, Stereo AAC  
**Total Target Duration:** 5:00 (300 seconds)  

---

## Storyboard Timeline & Shot Progression

```
[0:00 - 0:25] Scene 1: Opening & Project Introduction (25s)
  ├── 0:00 - 0:12 : Title Card with modern typography & glowing space aesthetic
  └── 0:12 - 0:25 : Seamless transition to 3D celestial orbit preview

[0:25 - 1:05] Scene 2: Understanding the Two-Body Problem (40s)
  ├── 0:25 - 0:45 : Scientific 2D/3D force diagram (m1, m2, separation r, vectors F21, F12)
  └── 0:45 - 1:05 : Barycenter R_cm derivation & Newton's 3rd Law action-reaction parity

[1:05 - 1:55] Scene 3: Physics & Numerical Method (50s)
  ├── 1:05 - 1:25 : Differential Equations of Motion (a1 = Gm2*r/r^3, a2 = -Gm1*r/r^3)
  ├── 1:25 - 1:40 : Velocity Verlet kick-drift-kick numerical scheme flowchart
  └── 1:40 - 1:55 : Numerical stability: Symplectic phase-space volume vs Euler spiral degradation

[1:55 - 3:20] Scene 4: Live Application Demonstration (85s)
  ├── 1:55 - 2:15 : 3-Panel Workspace architecture (Setup, 3D Canvas, Telemetry, Controls)
  ├── 2:15 - 2:40 : Running Earth–Moon benchmark, trail formation, mantle barycenter
  ├── 2:40 - 3:00 : High-frequency Live Telemetry inspection (r, |F|, v_rel, |a1|, |a2|, E)
  └── 3:00 - 3:20 : Interactive Setup (Bodies tab, Orbit tab, speed factor, Apply Setup COM)

[3:20 - 4:25] Scene 5: Understanding the Results & Orbital Classification (65s)
  ├── 3:20 - 3:45 : Equal-Mass Binary Stars (symmetric orbits, P_total = 0.00 kg·m/s)
  ├── 3:45 - 4:10 : Escape Trajectory (hyperbolic slingshot, e = 1.56, E > 0, unbound telemetry)
  └── 4:10 - 4:25 : Conservation of Mechanical Energy (E = T + U, Virial theorem, drift < 0.01%)

[4:25 - 5:00] Scene 6: Conclusion & Academic Summary (35s)
  ├── 4:25 - 4:45 : 3D rotating panoramic view with key engineering highlights card
  └── 4:45 - 5:00 : Closing Title Card (ME 206 Statics and Dynamics, IIT Gandhinagar, Vercel URL)
```

---

## Detailed Scene Breakdown

### Scene 1: Opening & Project Introduction
* **Timecode:** `0:00 – 0:25` (25 seconds)
* **Shot 1.1 (0:00 – 0:12):** Deep-space dark navy canvas with subtle twinkling stars. Smooth fade-in of glowing title:
  - **ORBITLAB** (bold cyan/blue gradient)
  - *3D Two-Body Gravitational Simulator*
  - *ME 206: Statics and Dynamics | Department of Mechanical Engineering*
  - *Indian Institute of Technology Gandhinagar*
* **Shot 1.2 (0:12 – 0:25):** Camera pans smoothly into a live 3D view of two celestial bodies in mutual orbit, displaying vibrant trajectory trails and the central barycenter marker.
* **Audio:** Opening theme begins with ambient harmonic pad; confident voiceover introduces the project.

---

### Scene 2: Understanding the Two-Body Problem
* **Timecode:** `0:25 – 1:05` (40 seconds)
* **Shot 2.1 (0:25 – 0:45):** Scientific vector diagram:
  - Two spherical masses: $m_1$ (Blue, terrestrial) and $m_2$ (Orange, satellite).
  - Separation vector $\vec{r} = \vec{r}_2 - \vec{r}_1$.
  - Attractive force vectors: $\vec{F}_{21}$ and $\vec{F}_{12}$ directed along the line of centers.
  - Formula overlay:
    $$F = G \frac{m_1 m_2}{r^2}$$
* **Shot 2.2 (0:45 – 1:05):** Focus on the Center of Mass (Barycenter $\vec{R}_{CM}$):
  - Equation:
    $$\vec{R}_{CM} = \frac{m_1 \vec{r}_1 + m_2 \vec{r}_2}{m_1 + m_2}$$
  - Newton's Third Law callout: $\vec{F}_{12} = -\vec{F}_{21}$.
  - Visual demonstrates that both bodies accelerate around the common barycenter; neither body is held fixed artificially.

---

### Scene 3: Physics & Numerical Method
* **Timecode:** `1:05 – 1:55` (50 seconds)
* **Shot 3.1 (1:05 – 1:25):** Differential equations of motion:
  $$\vec{a}_1 = \frac{G m_2}{r^3} \vec{r}, \quad \vec{a}_2 = -\frac{G m_1}{r^3} \vec{r}$$
* **Shot 3.2 (1:25 – 1:40):** The Kick-Drift-Kick Velocity Verlet Numerical Scheme:
  1. Position update: $\vec{r}(t + \Delta t) = \vec{r}(t) + \vec{v}(t)\Delta t + \frac{1}{2}\vec{a}(t)\Delta t^2$
  2. Acceleration evaluation: $\vec{a}(t + \Delta t) = \text{evaluateGravity}(\vec{r}(t + \Delta t))$
  3. Velocity update: $\vec{v}(t + \Delta t) = \vec{v}(t) + \frac{1}{2}[\vec{a}(t) + \vec{a}(t + \Delta t)]\Delta t$
* **Shot 3.3 (1:40 – 1:55):** Comparison graphic:
  - Standard Euler Method: Artificial energy gain causes unphysical outward spiral degradation.
  - Symplectic Velocity Verlet: Conserves phase-space volume; bounds energy drift strictly below $0.01\%$.

---

### Scene 4: Live Application Demonstration
* **Timecode:** `1:55 – 3:20` (85 seconds)
* **Shot 4.1 (1:55 – 2:15):** High-definition screen capture showing OrbitLab's 3-panel workspace:
  - Left: Simulation Setup panel
  - Center: 3D Three.js interactive WebGL viewport
  - Right: Live Physics Telemetry dashboard
  - Bottom: Floating transport control strip
* **Shot 4.2 (2:15 – 2:40):** Earth–Moon benchmark in action:
  - Pressing Play (<kbd>Space</kbd>); bodies begin revolving in real time.
  - Smooth dynamic trails form behind both Earth and Moon.
  - Demonstrating time-scale adjustment ($1\times \to 100\times \to 180,000\times$).
  - Zooming in to show the barycenter marker at $4,671\text{ km}$ from Earth's core—inside Earth's physical mantle.
* **Shot 4.3 (2:40 – 3:00):** Real-time Physics Telemetry inspection:
  - Instantaneous separation ($384,400\text{ km}$), gravitational force ($1.98 \times 10^{20}\text{ N}$), relative velocity ($1.025\text{ km/s}$).
  - Individual body accelerations: $|\vec{a}_1| = 3.32 \times 10^{-5}\text{ m/s}^2$ (Earth), $|\vec{a}_2| = 2.70 \times 10^{-3}\text{ m/s}^2$ (Moon).
  - Mechanical Energy breakdown: $T = 3.81 \times 10^{28}\text{ J}$, $U = -7.61 \times 10^{28}\text{ J}$, $E = -3.81 \times 10^{28}\text{ J}$.
  - Real-time Canvas telemetry chart ($r(t)$).
* **Shot 4.4 (3:00 – 3:20):** Interactive customization:
  - Modifying mass in the Bodies tab.
  - In the Orbit tab: sliding the speed factor and launch angle.
  - Clicking "Apply Setup & Initialize COM" to reset both bodies into the zero net-momentum center-of-mass frame ($m_1 v_1 + m_2 v_2 = 0$).

---

### Scene 5: Understanding the Results & Orbital Classification
* **Timecode:** `3:20 – 4:25` (65 seconds)
* **Shot 5.1 (3:20 – 3:45):** Equal-Mass Binary Stars benchmark:
  - Selecting "Equal-Mass Binary Stars" preset.
  - Observing two identical solar-mass stars in symmetric circular orbits around the origin.
  - Telemetry highlights: identical accelerations $|\vec{a}_1| = |\vec{a}_2| = 5.93 \times 10^{-3}\text{ m/s}^2$, linear momentum $|\vec{P}| = 0.00\text{ kg}\cdot\text{m/s}$.
* **Shot 5.2 (3:45 – 4:10):** Escape Trajectory (Hyperbolic Slingshot):
  - Selecting "Escape Trajectory" preset ($v = 1.6 \times v_{circ} > \sqrt{2} v_{circ}$).
  - Probe executes close periapsis flyby and deflects outward along an open hyperbola.
  - Telemetry highlights: Classification `Hyperbolic Escape (e > 1)`, $e = 1.56$, Period: `∞ (Unbound)`, Apoapsis: `∞ (Unbound)`, Total Energy $E > 0$ ($+3.11 \times 10^{13}\text{ J}$).
* **Shot 5.3 (4:10 – 4:25):** Conservation Analysis:
  - Total mechanical energy $E = T + U$ conservation drift $< 0.01\%$.
  - Virial Theorem verification ($2\langle T \rangle + \langle U \rangle = 0$ for circular orbits).
  - Explicit academic acknowledgment of finite numerical integration error.

---

### Scene 6: Conclusion & Academic Summary
* **Timecode:** `4:25 – 5:00` (35 seconds)
* **Shot 6.1 (4:25 – 4:45):** Panoramic 3D rotating orbital view with vector overlays active. Technical highlights summary:
  - Newtonian Gravitational Mechanics ($F = G m_1 m_2 / r^2$)
  - Symplectic Velocity Verlet Scheme ($\mathcal{O}(\Delta t^2)$, $< 0.01\%$ drift)
  - Full 3D Interactive WebGL Graphics & Canvas Telemetry
  - 24/24 Automated Vitest Unit Tests
  - Live Deployment: `https://orbitlab-eight.vercel.app/`
* **Shot 6.2 (4:45 – 5:00):** Closing Title Card:
  - **ORBITLAB — 3D Two-Body Gravitational Simulator**
  - **BTech ME 206 | Statics and Dynamics**
  - **Indian Institute of Technology Gandhinagar**
  - Smooth fade out to black.
