# ORBITLAB — Project Demonstration Video Narration Script
**Course:** ME 206 Statics and Dynamics  
**Institution:** Indian Institute of Technology Gandhinagar  
**Project:** ORBITLAB — 3D Two-Body Gravitational Simulator  
**Target Duration:** ~5:00 (300 seconds)  
**Voice Model:** Microsoft Edge Neural Voice (`en-US-ChristopherNeural`)  
**Audio Format:** 48 kHz Stereo, 192 kbps AAC  

---

## Scene 1: Opening & Project Introduction
**Timecode:** `0:00 – 0:25` (Duration: 25 seconds)  
**On-Screen:** Title card, project branding, ME 206 context, opening 3D view of Earth–Moon orbit.

> "How do two celestial bodies move when they interact purely through mutual gravitational attraction? Welcome to ORBITLAB, an interactive three-dimensional computational simulator engineered for ME 206: Statics and Dynamics at IIT Gandhinagar. This project explores the foundational mechanics of the classical Newtonian two-body problem through rigorous numerical physics, real-time telemetry, and three-dimensional visualization."

---

## Scene 2: Understanding the Two-Body Problem
**Timecode:** `0:25 – 1:05` (Duration: 40 seconds)  
**On-Screen:** Scientific two-body vector diagram, separation $\vec{r}$, mutual force vectors $\vec{F}_{21}$ and $\vec{F}_{12}$, system barycenter $\vec{R}_{CM}$, Newton's Universal Law of Gravitation.

> "In classical mechanics, the two-body problem considers two point masses, m-one and m-two, isolated in three-dimensional space and governed solely by Newton's law of universal gravitation. The magnitude of the attractive force is directly proportional to the product of their masses and inversely proportional to the square of their separation distance, r.
> 
> Crucially, according to Newton's third law of motion, the force exerted by body one on body two is equal in magnitude and strictly opposite in direction to the force exerted by body two on body one. Consequently, both bodies accelerate toward one another; neither body is artificially fixed in space. Instead, both revolve around their shared centre of mass, also known as the system barycenter."

---

## Scene 3: Physics & Numerical Method
**Timecode:** `1:05 – 1:55` (Duration: 50 seconds)  
**On-Screen:** Equations of motion, acceleration vectors $\vec{a}_1$ and $\vec{a}_2$, step-by-step Velocity Verlet scheme diagram, Euler vs Symplectic comparison chart.

> "To determine the actual motion over time, OrbitLab solves the system's differential equations of motion numerically. Unlike simple educational animations that follow predefined geometric paths, every trajectory in OrbitLab is computed dynamically step-by-step from raw physical laws.
> 
> To integrate these equations, we implemented a second-order, symplectic Velocity Verlet algorithm. Traditional explicit integrators, such as the standard Euler method, continually inject artificial numerical energy, causing orbits to spiral unphysically outward over time.
> 
> In contrast, Velocity Verlet is time-reversible and preserves phase-space volume. At each timestep, positions are updated using current velocities and accelerations, new gravitational forces are evaluated at the updated coordinates, and velocities are advanced using the average acceleration. This symplectic formulation bounds numerical energy drift to less than zero point zero one percent, ensuring long-term orbital stability."

---

## Scene 4: Live Application Demonstration
**Timecode:** `1:55 – 3:20` (Duration: 85 seconds)  
**On-Screen:** High-resolution live capture of the running OrbitLab web application: 3-panel workspace, Earth–Moon orbit in motion, dynamic trails, time-scaling, adjusting body properties and orbit speed in the Setup panel, inspecting live telemetry dashboard.

> "Let us now examine the live running application. OrbitLab features a streamlined, academic three-panel workspace. On the left is the Simulation Setup panel; at the center is our interactive three-dimensional WebGL canvas; on the right is the Live Physics Telemetry dashboard; and docked at the bottom is our floating transport control strip.
> 
> Starting with the Earth-Moon benchmark preset, we see the terrestrial planet and its natural satellite rendered in true three-dimensional coordinates. As we press Play, the numerical integrator begins advancing the physical state. Notice how the Moon leaves a dynamic trajectory trail while Earth executes a subtle counter-orbit. Because Earth is roughly eighty-one times more massive than the Moon, their common barycenter lies approximately four thousand six hundred and seventy-one kilometres from Earth's center—well inside Earth's mantle.
> 
> The right panel provides high-frequency telemetry in strict SI units: real-time separation, mutual gravitational force of approximately two times ten to the twentieth Newtons, relative velocity of one point zero two five kilometres per second, and individual body accelerations.
> 
> Users can also configure entirely custom scenarios. Under the Bodies tab, we can adjust mass and radius in kilograms, Earth masses, or solar units. In the Orbit tab, we can fine-tune initial separation, speed factor, launch angle, and three-dimensional inclination. Clicking Apply Setup instantly initializes both bodies into the zero-momentum center-of-mass frame, guaranteeing that total initial momentum remains zero."

---

## Scene 5: Understanding the Results & Orbital Classification
**Timecode:** `3:20 – 4:25` (Duration: 65 seconds)  
**On-Screen:** Live captures of Equal-Mass Binary Stars, symmetric orbits, zero momentum verification, Escape Trajectory (hyperbolic slingshot, $e = 1.56, E > 0$), Mechanical energy conservation telemetry, Vis-Viva energy exchange.

> "OrbitLab dynamically analyzes the relative orbital state vectors to classify the resulting trajectory into Keplerian conics.
> 
> In the Equal-Mass Binary Star benchmark, both identical stars possess equal gravitational pull. Each star experiences identical instantaneous accelerations, tracing out symmetric circular paths around the central barycenter, with net system momentum remaining exactly zero.
> 
> Next, we observe an Escape Trajectory, where the secondary body is initialized with a speed factor of one point six—well above the parabolic escape threshold of the square root of two. Here, specific orbital energy is strictly positive, and the eccentricity exceeds one. As predicted by classical celestial mechanics, the trajectory forms an open hyperbola: the body makes a close periapsis flyby, deflects under gravity, and escapes to infinity. Notice that OrbitLab intelligently identifies unbound states, displaying infinity for orbital period and apoapsis rather than erroneous values.
> 
> Across all bound simulations, total mechanical energy—the sum of kinetic energy T and gravitational potential energy U—remains conserved within tight numerical tolerances, with energy drift consistently below zero point zero one percent throughout thousands of orbital cycles."

---

## Scene 6: Conclusion & Academic Summary
**Timecode:** `4:25 – 5:00` (Duration: 35 seconds)  
**On-Screen:** Panoramic 3D rotating orbital view, technical highlights summary card, 24/24 unit test badges, course attribution, and live Vercel URL.

> "ORBITLAB brings the classical two-body problem to life through rigorous, interactive simulation. By uniting Newtonian gravitational mechanics, second-order symplectic integration, and modern three-dimensional WebGL visualization, it provides an intuitive yet mathematically uncompromising laboratory for engineering dynamics.
> 
> Every physical law has been independently verified through an automated suite of twenty-four unit tests covering momentum, energy, Keplerian elements, and contact mechanics.
> 
> Thank you for watching this demonstration of OrbitLab for ME 206 Statics and Dynamics."
