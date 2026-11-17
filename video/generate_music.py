"""
Generates a warm, subtle, professional ambient background soundtrack for ORBITLAB video.
Key: D minor / F / A (55 Hz, 110 Hz, 164.8 Hz, 220 Hz, 261.6 Hz, 293.7 Hz)
Low-volume (-26 dB normalized), smooth attack and decay, gentle stereo chorus.
Duration: 315 seconds (5 minutes 15 seconds) to cover the full demonstration.
Zero external dependencies (uses standard library wave, struct, math).
"""

import math
import struct
import wave
import os

def generate_ambient_track(output_path="video/audio/ambient_background.wav", duration=315.0, sample_rate=44100):
    print(f"Synthesizing ambient background track ({duration}s at {sample_rate}Hz)...")
    n_samples = int(duration * sample_rate)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Chords frequencies (D minor / F / C / Bb ambient progression, 16s per chord)
    # Chord 1: Dm (D2=73.42, A2=110, F3=174.61, A3=220)
    # Chord 2: Bb (Bb1=58.27, F2=87.31, D3=146.83, F3=174.61)
    # Chord 3: F (F1=43.65, C2=65.41, A2=110, C3=130.81)
    # Chord 4: C (C2=65.41, G2=98.0, E3=164.81, G3=196.0)

    chords = [
        [73.42, 110.0, 174.61, 220.0, 349.23],   # Dm
        [58.27, 87.31, 146.83, 174.61, 233.08],  # Bb
        [43.65, 65.41, 110.0, 130.81, 261.63],   # F
        [65.41, 98.0, 164.81, 196.0, 329.63]     # C
    ]
    chord_len = 18.0 # seconds per chord cycle

    with wave.open(output_path, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        # Buffer write in 1-second chunks for speed
        chunk_size = sample_rate
        total_chunks = int(math.ceil(duration))

        for c_idx in range(total_chunks):
            frames = bytearray()
            for s in range(chunk_size):
                global_sample = c_idx * chunk_size + s
                if global_sample >= n_samples:
                    break
                t = global_sample / sample_rate

                # Envelope: Fade in 4s, Fade out 6s
                fade = 1.0
                if t < 4.0:
                    fade = t / 4.0
                elif t > duration - 6.0:
                    fade = max(0.0, (duration - t) / 6.0)

                # Determine active chord
                cycle_t = t % (chord_len * 4)
                chord_idx = int(cycle_t // chord_len)
                next_chord_idx = (chord_idx + 1) % 4
                blend = (cycle_t % chord_len) / chord_len
                # Smooth cosine transition
                w1 = 0.5 * (1 + math.cos(blend * math.pi))
                w2 = 1.0 - w1

                freqs1 = chords[chord_idx]
                freqs2 = chords[next_chord_idx]

                # Synthesize warm detuned sine waves
                sig_left = 0.0
                sig_right = 0.0

                # Chord 1 components
                for i, f in enumerate(freqs1):
                    # Slight detuning for warmth
                    s_a = math.sin(2 * math.pi * f * t)
                    s_b = math.sin(2 * math.pi * (f * 1.002) * t + 0.3)
                    amp = (0.20 / (1.0 + i * 0.4)) * w1
                    pan = 0.3 * math.sin(t * 0.15 + i)
                    sig_left += (s_a * (0.5 - pan) + s_b * (0.5 + pan)) * amp
                    sig_right += (s_a * (0.5 + pan) + s_b * (0.5 - pan)) * amp

                # Chord 2 components
                for i, f in enumerate(freqs2):
                    s_a = math.sin(2 * math.pi * f * t)
                    s_b = math.sin(2 * math.pi * (f * 1.002) * t + 0.3)
                    amp = (0.20 / (1.0 + i * 0.4)) * w2
                    pan = 0.3 * math.sin(t * 0.15 + i)
                    sig_left += (s_a * (0.5 - pan) + s_b * (0.5 + pan)) * amp
                    sig_right += (s_a * (0.5 + pan) + s_b * (0.5 - pan)) * amp

                # Slow low-frequency shimmer
                lfo = 0.85 + 0.15 * math.sin(2 * math.pi * 0.18 * t)
                sig_left *= lfo * fade * 0.18 # master volume factor (-26 dB range)
                sig_right *= lfo * fade * 0.18

                # Clamp 16-bit PCM
                l_int = int(max(-32767, min(32767, sig_left * 32767)))
                r_int = int(max(-32767, min(32767, sig_right * 32767)))
                frames.extend(struct.pack('<hh', l_int, r_int))

            wf.writeframes(frames)

    print(f"Ambient track synthesized successfully: {output_path}")

if __name__ == "__main__":
    generate_ambient_track()
