# ORBITLAB — 3D Two-Body Orbital Mechanics Simulator
### ME 206 Statics and Dynamics | Computational Dynamics Project

![OrbitLab Banner](https://img.shields.io/badge/ME%20206-Orbital%20Mechanics-3b82f6?style=for-the-badge)
![Integrator](https://img.shields.io/badge/Integrator-Symplectic%20Velocity%20Verlet-10b981?style=for-the-badge)
![Units](https://img.shields.io/badge/SI%20Units-Internal%20MKS-f97316?style=for-the-badge)

---

## 1. Project Objective

**ORBITLAB** is a high-performance, scientifically rigorous 3D two-body orbital mechanics web application built for **ME 206 Statics and Dynamics**.

The application models the mutual gravitational interaction of two celestial bodies in three-dimensional space using pure Newtonian gravitation and symplectic **Velocity Verlet** numerical integration. It visualizes continuous trajectory evolutions, center-of-mass (barycenter) motion, instantaneous velocity and force vectors, and displays a real-time scientific dashboard monitoring conservation laws and Keplerian orbital parameters.

---

## 2. Governing Equations

### 2.1 Newton's Law of Universal Gravitation & Newton's Third Law
For two point masses $m_1$ and $m_2$ at spatial coordinates $\vec{r}_1$ and $\vec{r}_2$, the mutual separation vector $\vec{r}_{12}$ is:

$$\vec{r}_{12} = \vec{r}_2 - \vec{r}_1, \quad r = \|\vec{r}_{12}\| = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

The gravitational attraction exerted on mass $m_1$ by mass $m_2$ is directed along $\vec{r}_{12}$:

$$\vec{F}_{21} = \frac{G m_1 m_2}{r^3} \vec{r}_{12}$$

By **Newton's Third Law** (action and reaction), the gravitational force on mass $m_2$ is equal in magnitude and opposite in direction:

$$\vec{F}_{12} = -\vec{F}_{21} = -\frac{G m_1 m_2}{r^3} \vec{r}_{12}$$

Where $G = 6.67430 \times 10^{-11} \text{ m}^3\text{kg}^{-1}\text{s}^{-2}$ (CODATA recommended value).

The instantaneous accelerations in an inertial frame are:

$$\vec{a}_1 = \frac{\vec{F}_{21}}{m_1} = \frac{G m_2}{r^3} \vec{r}_{12}$$

$$\vec{a}_2 = \frac{\vec{F}_{12}}{m_2} = -\frac{G m_1}{r^3} \vec{r}_{12}$$

---

### 2.2 Centre of Mass (Barycenter) Kinematics
The system total mass is $M = m_1 + m_2$. The position of the center of mass (barycenter) $\vec{R}_{cm}$ and its velocity $\vec{V}_{cm}$ are:

$$\vec{R}_{cm} = \frac{m_1 \vec{r}_1 + m_2 \vec{r}_2}{m_1 + m_2}$$

$$\vec{V}_{cm} = \frac{m_1 \vec{v}_1 + m_2 \vec{v}_2}{m_1 + m_2} = \frac{\vec{P}_{total}}{M}$$

In an isolated two-body system without external forces ($\sum \vec{F}_{ext} = \vec{0}$), $\vec{V}_{cm}$ is constant. In the barycentric rest frame ($\vec{V}_{cm} = \vec{0}$), the barycenter remains fixed at the origin $\vec{R}_{cm} = \vec{0}$.

---

### 2.3 Relative Two-Body Equation of Motion & Reduced Mass
Subtracting $\vec{a}_1$ from $\vec{a}_2$ gives the relative acceleration $\ddot{\vec{r}} = \vec{a}_2 - \vec{a}_1$:

$$\ddot{\vec{r}} = -\frac{G(m_1 + m_2)}{r^3}\vec{r} = -\frac{\mu_{std}}{r^3}\vec{r}$$

where $\mu_{std} = G(m_1 + m_2)$ is the standard gravitational parameter of the system. In terms of reduced mass $\mu = \frac{m_1 m_2}{m_1 + m_2}$, the problem maps equivalently to a single particle of mass $\mu$ orbiting a fixed central attraction of strength $\mu_{std}$.

---

## 3. Conservation Theorems & Numerical Error Tracking

OrbitLab continuously tracks the three fundamental invariants of Hamiltonian central-force dynamics:

| Conservation Law | Mathematical Formulation | Physical Interpretation |
| :--- | :--- | :--- |
| **Linear Momentum** | $\vec{P} = m_1 \vec{v}_1 + m_2 \vec{v}_2 = \text{const}$ | No external forces act on system ($\sum \vec{F}_{ext} = 0$). |
| **Angular Momentum** | $\vec{L} = m_1(\vec{r}_1 \times \vec{v}_1) + m_2(\vec{r}_2 \times \vec{v}_2) = \text{const}$ | Gravitational forces are central; net mutual torque $\vec{\tau} = \vec{r} \times \vec{F} = \vec{0}$. Orbit lies in an invariant plane. |
| **Mechanical Energy** | $E = T + U = \frac{1}{2}m_1 v_1^2 + \frac{1}{2}m_2 v_2^2 - \frac{G m_1 m_2}{r} = \text{const}$ | Gravitation is a conservative potential field ($U = -\frac{G m_1 m_2}{r}$). |

### Relative Conservation Drift
To verify numerical fidelity, OrbitLab monitors relative drift in real-time:

$$\text{Energy Drift} = \frac{|E(t) - E_0|}{|E_0|}$$

$$\text{Angular Momentum Drift} = \frac{\|\vec{L}(t) - \vec{L}_0\|}{\|\vec{L}_0\|}$$

---

## 4. Analytical Orbital Elements & Keplerian Mechanics

1. **Specific Relative Angular Momentum**:
   $$\vec{h} = \vec{r} \times \vec{v}, \quad h = \|\vec{h}\|$$

2. **Specific Orbital Energy**:
   $$\epsilon = \frac{v^2}{2} - \frac{\mu_{std}}{r}$$

3. **Eccentricity Vector**:
   $$\vec{e} = \frac{\vec{v} \times \vec{h}}{\mu_{std}} - \frac{\vec{r}}{r}, \quad e = \|\vec{e}\|$$

4. **Orbit Classification**:
   - $e < 0.01$: **Circular Orbit** ($\epsilon < 0$)
   - $0.01 \le e < 0.999$: **Elliptical Orbit** ($\epsilon < 0$, bound periodic motion)
   - $0.999 \le e \le 1.005$: **Parabolic Trajectory** ($\epsilon \approx 0$, escape threshold)
   - $e > 1.005$: **Hyperbolic Flyby** ($\epsilon > 0$, unbound escape)
   - $r \le R_1 + R_2$: **Physical Surface Contact / Collision**

5. **Semi-Major Axis ($a$) and Orbital Period ($T$)**:
   $$a = -\frac{\mu_{std}}{2\epsilon} \quad (\text{for } \epsilon < 0)$$
   $$T = 2\pi \sqrt{\frac{a^3}{\mu_{std}}}$$
   $$r_p = a(1 - e) \quad (\text{Periapsis}), \quad r_a = a(1 + e) \quad (\text{Apoapsis})$$

6. **Vis-Viva Equation**:
   $$v^2 = \mu_{std} \left(\frac{2}{r} - \frac{1}{a}\right)$$

---

## 5. Numerical Method: Symplectic Velocity Verlet Integrator

Standard explicit integration schemes (such as Forward Euler or Runge-Kutta without symplectic formulation) suffer from secular energy drift; forward Euler causes orbits to artificially spiral outward due to spurious energy growth.

OrbitLab implements the second-order, time-reversible **Velocity Verlet** symplectic integrator:

1. **Half-step velocity kick**:
   $$\vec{v}_i\left(t + \frac{\Delta t}{2}\right) = \vec{v}_i(t) + \frac{1}{2} \vec{a}_i(t) \Delta t$$

2. **Full-step position drift**:
   $$\vec{r}_i(t + \Delta t) = \vec{r}_i(t) + \vec{v}_i\left(t + \frac{\Delta t}{2}\right) \Delta t$$

3. **Acceleration re-evaluation at updated positions**:
   $$\vec{a}_i(t + \Delta t) = \vec{a}_i\left(\vec{r}_1(t + \Delta t), \vec{r}_2(t + \Delta t)\right)$$

4. **Final velocity kick**:
   $$\vec{v}_i(t + \Delta t) = \vec{v}_i\left(t + \frac{\Delta t}{2}\right) + \frac{1}{2} \vec{a}_i(t + \Delta t) \Delta t$$

### Sub-stepping Strategy
For highly eccentric orbits (e.g. comets passing periapsis), rapid gravitational variation demands small timesteps. OrbitLab subdivides each animation frame into $N$ user-selectable substeps ($N \in \{4, 8, 16, 32\}$):

$$\Delta t_{sub} = \frac{\Delta t}{N}$$

This bounds energy drift strictly below $10^{-4}$ (0.01%) over hundreds of completed revolutions.

---

## 6. Model Assumptions & Honest Academic Notes

1. **Point Mass Gravitation**: Both bodies are modeled as spherically symmetric mass distributions. By Newton's Shell Theorem, their external gravitational fields are identical to concentrated point masses at their respective centers.
2. **Isolated Two-Body System**: Third-body perturbations (such as the Sun's tidal influence on the Moon, Jupiter's effect on inner planets, or Galactic tides) are neglected.
3. **Absence of Non-Conservative Dissipation**: Tidal friction, atmospheric drag, solar radiation pressure, and general relativistic frame dragging are omitted.
4. **Collision Handling**: Bodies possess physical radii ($R_1, R_2$). When $r \le R_1 + R_2$, contact is flagged.

---

## 7. Built-in Physical Presets

| Preset Name | Body 1 ($m_1$) | Body 2 ($m_2$) | Initial Separation | Academic Demonstration |
| :--- | :--- | :--- | :--- | :--- |
| **Earth–Moon System** | $5.972 \times 10^{24}$ kg | $7.342 \times 10^{22}$ kg | $384,400$ km | Barycenter lies ~4,671 km from Earth center (inside Earth mantle, $R_\oplus = 6,371$ km). Orbital period is ~27.3 sidereal days. |
| **Symmetric Binary Stars** | $1.989 \times 10^{30}$ kg | $1.989 \times 10^{30}$ kg | $1.496 \times 10^{11}$ m ($1$ AU) | Identical masses orbiting central barycenter at $(0,0,0)$ with circular symmetry. Net linear momentum is exactly $0$. |
| **Sun–Jupiter System** | $1.989 \times 10^{30}$ kg | $1.898 \times 10^{27}$ kg | $5.204$ AU | Extreme mass ratio (1047:1). Barycenter is situated ~742,000 km from solar core, outside the Sun's photosphere. |
| **Highly Eccentric Orbit** | $1.989 \times 10^{30}$ kg | $2.2 \times 10^{14}$ kg | $0.15$ AU (periapsis) | $e = 0.85$. Demonstrates Kepler's 2nd Law and extreme Vis-Viva kinetic-potential energy conversion. |
| **Hyperbolic Flyby** | $1.989 \times 10^{30}$ kg | $5 \times 10^{3}$ kg | $0.3$ AU periapsis | $e = 1.45$, $E > 0$. Unbound gravitational slingshot trajectory. |

---

## 8. Operating Instructions & Controls

### Main Controls
- **Play / Pause**: Starts or stops continuous physics integration.
- **Step**: Advances simulation by one discrete timestep ($\Delta t$).
- **Reset**: Restores initial conditions, clears trails, and resets telemetry.
- **Speed Slider**: Logarithmic simulation speed multiplier from $0.1\times$ to $5,000,000\times$.
- **Substeps Dropdown**: Configures $4$, $8$, $16$, or $32$ sub-steps per frame.

### Input Modes
- **Beginner Mode**: Adjust masses, initial separation, target eccentricity ($e$), and orbital inclination angle in 3D.
- **Advanced Cartesian Mode**: Enter full 3D Cartesian state vectors ($x, y, z, v_x, v_y, v_z$) for both bodies in SI units. Includes a **Zero Barycenter Momentum** auto-balancer.

### Visual Overlays & 3D Camera
- **Camera Focus**: Center tracking on Barycenter (COM), Body 1, Body 2, or Free Orbit.
- **Vector Toggles**: Toggle Velocity vectors ($\vec{v}$) and Gravitational Force vectors ($\vec{F}$).
- **Overlays**: Toggle Trajectory Trails, Barycenter Crosshair, Polar Reference Grid, and Separation line.
- **Orbit Controls**: Left-click + drag to rotate; Right-click + drag to pan; Scroll wheel to zoom.

### Keyboard Shortcuts
- `Space`: Play / Pause toggle
- `R`: Reset to initial conditions
- `S` or `Right Arrow`: Step forward
- `C`: Reset Camera view orientation

---

## 9. Verification & Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone or open workspace
cd ME_206_assignment_2_body_simulator

# Install dependencies
npm install
```

### Run Analytical Physics Verification Suite
```bash
node src/physics/__tests__/verify.mjs
```
*Validates analytical circular orbits, Kepler's Third Law period, Earth-Moon sidereal period, and confirms energy conservation drift $< 10^{-5}$ over full periods.*

### Start Local Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

*Submitted for ME 206 Statics and Dynamics — Orbital Mechanics Assignment.*
