"""
Generates aligned timecoded subtitles (subtitles.srt) for ORBITLAB Demonstration Video.
Total video duration: ~305.5 seconds (5:05.5) across 6 scenes.
"""

def format_time(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        secs += 1
        millis = 0
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

# Scene durations:
# Scene 1: 0.000 -> 23.520
# Scene 2: 23.520 -> 63.020 (39.500s)
# Scene 3: 63.020 -> 117.640 (54.620s)
# Scene 4: 117.640 -> 203.320 (85.680s)
# Scene 5: 203.320 -> 273.640 (70.320s)
# Scene 6: 273.640 -> 305.540 (31.900s)

subtitles = [
    # Scene 1: 0 - 23.52s
    (0.5, 6.8, "How do two objects move when they interact solely through mutual gravitational attraction?"),
    (7.2, 14.5, "Welcome to ORBITLAB, an interactive 3D simulator engineered for the BTech ME 206 course in Statics and Dynamics at IIT Gandhinagar."),
    (15.0, 23.0, "OrbitLab brings the classical two-body problem to life through high-precision numerical physics and modern web rendering."),

    # Scene 2: 23.52 - 63.02s
    (24.0, 28.5, "To model two celestial bodies, we begin with fundamental Newtonian mechanics."),
    (29.0, 34.0, "Consider two masses, m1 and m2, separated by a relative distance r."),
    (34.5, 42.5, "By Newton's Law of Universal Gravitation, each body exerts an equal and opposite force on the other: F equals G m1 m2 over r squared."),
    (43.0, 50.5, "Because Newton's third law guarantees action and reaction are collinear and opposite, the net external force on the system is zero."),
    (51.0, 56.5, "This crucial property means the system's center of mass, or barycenter, remains unaccelerated."),
    (57.0, 62.5, "Neither body is anchored in space. Instead, both bodies accelerate dynamically around their shared center of mass."),

    # Scene 3: 63.02 - 117.64s
    (63.5, 68.2, "In OrbitLab, motion is computed from the exact equations of motion."),
    (68.8, 77.5, "The vector acceleration of body 1 is G m2 over r cubed times r, and for body 2, minus G m1 over r cubed times r."),
    (78.2, 85.8, "To propagate these equations forward in time without artificial energy drift, OrbitLab implements a symplectic Velocity Verlet integrator using a kick-drift-kick sequence."),
    (86.4, 92.2, "First, positions advance by half a timestep of velocity and acceleration."),
    (92.8, 98.5, "Next, gravitational forces and accelerations are re-evaluated at the updated positions."),
    (99.0, 105.8, "Finally, velocities are updated using the average of previous and newly computed accelerations."),
    (106.5, 117.2, "Unlike naive Forward Euler methods which suffer from runaway energy growth, our symplectic scheme preserves phase-space volume and maintains bounded energy oscillations over thousands of orbital revolutions."),

    # Scene 4: 117.64 - 203.32s
    (118.2, 123.5, "Let's now explore the live OrbitLab application interface."),
    (124.0, 129.5, "The workspace is divided into three intuitive panels."),
    (130.0, 139.8, "On the left is the Controls Panel, where users select presets or fine-tune individual masses, separations, velocities, and orbital plane angles."),
    (140.5, 153.2, "In the center is the interactive 3D canvas, powered by Three.js and React Three Fiber, featuring smooth orbit controls, dynamic celestial trails, velocity vectors, and barycenter markers."),
    (154.0, 169.5, "On the right, the Real-Time Telemetry Dashboard displays precise instantaneous values: accelerations, gravitational force, specific orbital energy, angular momentum, and live energy conservation curves."),
    (170.2, 185.0, "At the bottom, a streamlined control strip lets you play, pause, step forward, toggle simulation layers, and scale time from real-time up to hundreds of thousands of times acceleration."),
    (185.8, 202.8, "Notice how the Earth-Moon system reveals the barycenter situated 4,671 kilometers from Earth's center—resting inside Earth's mantle, exactly as predicted by theory."),

    # Scene 5: 203.32 - 273.64s
    (204.0, 211.2, "OrbitLab enables rigorous experimentation across different mass ratios and energetic regimes."),
    (211.8, 222.0, "Selecting the Equal-Mass Binary preset demonstrates two identical stars orbiting their shared midpoint in empty space."),
    (222.6, 233.5, "Notice that both bodies experience identical acceleration magnitudes, and total linear momentum remains precisely zero throughout the orbit."),
    (234.2, 244.5, "Next, we examine an Escape Trajectory by boosting initial orbital speed beyond the local escape velocity."),
    (245.2, 252.0, "As the eccentricity surpasses 1, the trajectory opens into a hyperbola."),
    (252.8, 263.5, "The telemetry dashboard immediately detects that total mechanical energy has become positive, and marks both the apoapsis and orbital period as infinite and unbound."),
    (264.2, 273.0, "This visual and numerical correlation provides immediate physical insight into orbital mechanics."),

    # Scene 6: 273.64 - 305.54s
    (274.2, 282.8, "In summary, ORBITLAB demonstrates that rigorous Newtonian mechanics and symplectic integration can be combined with modern interactive 3D web technology."),
    (283.4, 296.0, "Fully tested with 24 automated unit tests covering energy conservation, Keplerian periods, and center-of-mass invariance, OrbitLab serves as an open-source educational platform for engineering students and educators alike."),
    (296.8, 304.5, "Thank you for watching our ME 206 project demonstration.")
]

def main():
    out_path = "video/subtitles.srt"
    with open(out_path, "w", encoding="utf-8") as f:
        for idx, (start, end, text) in enumerate(subtitles, 1):
            f.write(f"{idx}\n")
            f.write(f"{format_time(start)} --> {format_time(end)}\n")
            f.write(f"{text}\n\n")
    print(f"Subtitles generated successfully at: {out_path} ({len(subtitles)} cues)")

if __name__ == "__main__":
    main()
