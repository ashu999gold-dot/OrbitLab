import asyncio
import os
import edge_tts

VOICE = "en-US-ChristopherNeural"

SCENES = [
    {
        "id": "scene1",
        "name": "Opening & Project Introduction",
        "rate": "+16%",
        "text": (
            "How do two celestial bodies move when they interact purely through mutual gravitational attraction? "
            "Welcome to ORBITLAB, an interactive three-dimensional computational simulator engineered for "
            "ME 206: Statics and Dynamics at IIT Gandhinagar. This project explores the foundational mechanics of "
            "the classical Newtonian two-body problem through rigorous numerical physics, real-time telemetry, "
            "and three-dimensional visualization."
        )
    },
    {
        "id": "scene2",
        "name": "Understanding the Two-Body Problem",
        "rate": "+16%",
        "text": (
            "In classical mechanics, the two-body problem considers two point masses, m-one and m-two, "
            "isolated in three-dimensional space and governed solely by Newton's law of universal gravitation. "
            "The magnitude of the attractive force is directly proportional to the product of their masses "
            "and inversely proportional to the square of their separation distance, r. "
            "Crucially, according to Newton's third law of motion, the force exerted by body one on body two "
            "is equal in magnitude and strictly opposite in direction to the force exerted by body two on body one. "
            "Consequently, both bodies accelerate toward one another; neither body is artificially fixed in space. "
            "Instead, both revolve around their shared centre of mass, also known as the system barycenter."
        )
    },
    {
        "id": "scene3",
        "name": "Physics & Numerical Method",
        "rate": "+16%",
        "text": (
            "To determine the actual motion over time, OrbitLab solves the system's differential equations of motion numerically. "
            "Unlike simple educational animations that follow predefined geometric paths, every trajectory in OrbitLab "
            "is computed dynamically step-by-step from raw physical laws. "
            "To integrate these equations, we implemented a second-order, symplectic Velocity Verlet algorithm. "
            "Traditional explicit integrators, such as the standard Euler method, continually inject artificial numerical energy, "
            "causing orbits to spiral unphysically outward over time. "
            "In contrast, Velocity Verlet is time-reversible and preserves phase-space volume. "
            "At each timestep, positions are updated using current velocities and accelerations, "
            "new gravitational forces are evaluated at the updated coordinates, "
            "and velocities are advanced using the average acceleration. "
            "This symplectic formulation bounds numerical energy drift to less than zero point zero one percent, "
            "ensuring long-term orbital stability."
        )
    },
    {
        "id": "scene4",
        "name": "Live Application Demonstration",
        "rate": "+16%",
        "text": (
            "Let us now examine the live running application. OrbitLab features a streamlined, academic three-panel workspace. "
            "On the left is the Simulation Setup panel; at the center is our interactive three-dimensional WebGL canvas; "
            "on the right is the Live Physics Telemetry dashboard; and docked at the bottom is our floating transport control strip. "
            "Starting with the Earth-Moon benchmark preset, we see the terrestrial planet and its natural satellite rendered "
            "in true three-dimensional coordinates. As we press Play, the numerical integrator begins advancing the physical state. "
            "Notice how the Moon leaves a dynamic trajectory trail while Earth executes a subtle counter-orbit. "
            "Because Earth is roughly eighty-one times more massive than the Moon, their common barycenter lies approximately "
            "four thousand six hundred and seventy-one kilometres from Earth's center—well inside Earth's mantle. "
            "The right panel provides high-frequency telemetry in strict SI units: real-time separation, "
            "mutual gravitational force of approximately two times ten to the twentieth Newtons, "
            "relative velocity of one point zero two five kilometres per second, and individual body accelerations. "
            "Users can also configure entirely custom scenarios. Under the Bodies tab, we can adjust mass and radius in kilograms, "
            "Earth masses, or solar units. In the Orbit tab, we can fine-tune initial separation, speed factor, launch angle, "
            "and three-dimensional inclination. Clicking Apply Setup instantly initializes both bodies into the zero-momentum "
            "center-of-mass frame, guaranteeing that total initial momentum remains zero."
        )
    },
    {
        "id": "scene5",
        "name": "Understanding the Results & Orbital Classification",
        "rate": "+16%",
        "text": (
            "OrbitLab dynamically analyzes the relative orbital state vectors to classify the resulting trajectory into Keplerian conics. "
            "In the Equal-Mass Binary Star benchmark, both identical stars possess equal gravitational pull. "
            "Each star experiences identical instantaneous accelerations, tracing out symmetric circular paths around the central barycenter, "
            "with net system momentum remaining exactly zero. "
            "Next, we observe an Escape Trajectory, where the secondary body is initialized with a speed factor of one point six—"
            "well above the parabolic escape threshold of the square root of two. "
            "Here, specific orbital energy is strictly positive, and the eccentricity exceeds one. "
            "As predicted by classical celestial mechanics, the trajectory forms an open hyperbola: the body makes a close periapsis flyby, "
            "deflects under gravity, and escapes to infinity. "
            "Notice that OrbitLab intelligently identifies unbound states, displaying infinity for orbital period and apoapsis rather than erroneous values. "
            "Across all bound simulations, total mechanical energy—the sum of kinetic energy T and gravitational potential energy U—"
            "remains conserved within tight numerical tolerances, with energy drift consistently below zero point zero one percent throughout thousands of orbital cycles."
        )
    },
    {
        "id": "scene6",
        "name": "Conclusion & Academic Summary",
        "rate": "+16%",
        "text": (
            "ORBITLAB brings the classical two-body problem to life through rigorous, interactive simulation. "
            "By uniting Newtonian gravitational mechanics, second-order symplectic integration, and modern three-dimensional WebGL visualization, "
            "it provides an intuitive yet mathematically uncompromising laboratory for engineering dynamics. "
            "Every physical law has been independently verified through an automated suite of twenty-four unit tests covering momentum, "
            "energy, Keplerian elements, and contact mechanics. "
            "Thank you for watching this demonstration of OrbitLab for ME 206 Statics and Dynamics."
        )
    }
]

async def generate():
    os.makedirs("video/audio", exist_ok=True)
    total_duration = 0.0
    print("Generating voiceovers with voice:", VOICE)
    for s in SCENES:
        mp3_path = f"video/audio/{s['id']}.mp3"
        vtt_path = f"video/audio/{s['id']}.vtt"
        tts = edge_tts.Communicate(s["text"], VOICE, rate=s["rate"])
        await tts.save(mp3_path)
        print(f"Generated {s['id']}: {s['name']}")

if __name__ == "__main__":
    asyncio.run(generate())
