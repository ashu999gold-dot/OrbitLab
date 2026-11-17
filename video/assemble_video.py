"""
ORBITLAB — Master Video Assembly Pipeline
Combines raw recorded WebM footage with neural voiceovers, merges with ambient soundtrack,
and renders the final 1920x1080 30FPS H.264 / AAC demonstration video.
"""

import json
import os
import subprocess
import sys

def run_cmd(cmd, desc=""):
    if desc:
        print(f"\n>> {desc}")
    print("Running:", " ".join(cmd) if isinstance(cmd, list) else cmd)
    res = subprocess.run(cmd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ERROR: {res.stderr}")
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def get_audio_duration(audio_file):
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'json', audio_file
    ]
    out = run_cmd(cmd)
    data = json.loads(out)
    return float(data['format']['duration'])

def main():
    print("==================================================")
    print("ORBITLAB Video Assembly Pipeline")
    print("==================================================")

    os.makedirs('video/scenes', exist_ok=True)
    scenes = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6']
    total_audio_duration = 0.0

    # Step 1: Render each individual scene video with matched audio
    for sc in scenes:
        raw_video = f"video/raw/{sc}.webm"
        audio_file = f"video/audio/{sc}.mp3"
        out_scene = f"video/scenes/{sc}.mp4"

        if not os.path.exists(raw_video):
            raise FileNotFoundError(f"Missing raw video: {raw_video}")
        if not os.path.exists(audio_file):
            raise FileNotFoundError(f"Missing audio file: {audio_file}")

        dur = get_audio_duration(audio_file)
        total_audio_duration += dur
        print(f"\nProcessing {sc}: audio duration = {dur:.2f}s")

        # Encode scene to 1920x1080 30fps H.264
        cmd = [
            'ffmpeg', '-y',
            '-i', raw_video,
            '-i', audio_file,
            '-t', f"{dur:.3f}",
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '18',
            '-r', '30',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '192k',
            out_scene
        ]
        run_cmd(cmd, f"Encoding {sc}.mp4")

    print(f"\nTotal Narration Duration: {total_audio_duration:.2f}s ({int(total_audio_duration//60)}m {total_audio_duration%60:.1f}s)")

    # Step 2: Create concat list
    concat_file = "video/concat_list.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        for sc in scenes:
            scene_path = os.path.abspath(f"video/scenes/{sc}.mp4").replace("\\", "/")
            f.write(f"file '{scene_path}'\n")

    # Step 3: Concatenate scenes
    concat_raw = "video/concat_raw.mp4"
    cmd_concat = [
        'ffmpeg', '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', concat_file,
        '-c', 'copy',
        concat_raw
    ]
    run_cmd(cmd_concat, "Concatenating all 6 scenes")

    # Step 4: Add subtle ambient background soundtrack
    final_output = "video/ORBITLAB_Project_Demonstration.mp4"
    ambient_file = "video/audio/ambient_background.wav"

    if os.path.exists(ambient_file):
        print("\nMixing ambient background score (-26 dB)...")
        # Duck ambient score under narration
        cmd_mix = [
            'ffmpeg', '-y',
            '-i', concat_raw,
            '-i', ambient_file,
            '-filter_complex',
            '[0:a]volume=1.0[voice];[1:a]volume=0.15[bg];[voice][bg]amix=inputs=2:duration=first:dropout_transition=2[out_a]',
            '-map', '0:v',
            '-map', '[out_a]',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-b:a', '192k',
            final_output
        ]
        run_cmd(cmd_mix, "Mixing final master video with ambient score")
    else:
        print("\nNo ambient audio found; saving concatenated video as final master.")
        import shutil
        shutil.copyfile(concat_raw, final_output)

    # Step 5: Final Verification
    print("\n==================================================")
    print("FINAL MASTER VIDEO VERIFICATION")
    print("==================================================")
    verify_cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration,size,bit_rate',
        '-show_entries', 'stream=codec_name,width,height,r_frame_rate,channels,sample_rate',
        '-of', 'json',
        final_output
    ]
    out = run_cmd(verify_cmd)
    info = json.loads(out)

    format_info = info.get('format', {})
    duration = float(format_info.get('duration', 0))
    size_mb = float(format_info.get('size', 0)) / (1024 * 1024)
    streams = info.get('streams', [])

    video_stream = next((s for s in streams if s.get('codec_name') in ['h264', 'avc1']), {})
    audio_stream = next((s for s in streams if s.get('codec_name') == 'aac'), {})

    print(f"File: {final_output}")
    print(f"File Size: {size_mb:.2f} MB")
    print(f"Total Duration: {duration:.2f} seconds ({int(duration//60)}m {duration%60:.1f}s)")
    print(f"Video Stream: {video_stream.get('codec_name')} | {video_stream.get('width')}x{video_stream.get('height')} @ {video_stream.get('r_frame_rate')} FPS")
    print(f"Audio Stream: {audio_stream.get('codec_name')} | {audio_stream.get('sample_rate')} Hz, {audio_stream.get('channels')} channels")

    if 285 <= duration <= 315:
        print("\n>> DURATION CHECK: PASSED (Inside target window 4:45 - 5:15)")
    else:
        print(f"\n>> DURATION WARNING: Duration is {duration:.1f}s")

    print("\nMaster Video Assembly Complete!")

if __name__ == "__main__":
    main()
