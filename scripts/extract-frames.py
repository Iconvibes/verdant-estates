#!/usr/bin/env python3
"""Extract exactly 200 evenly-spaced JPEG frames from housetour1.mp4."""

import cv2
import os
import sys

VIDEO = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "house-tour", "housetour1.mp4")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "house-tour")
NUM_FRAMES = 200

def main():
    cap = cv2.VideoCapture(VIDEO)
    if not cap.isOpened():
        sys.exit(f"ERROR: Cannot open video at {VIDEO}")

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total / fps if fps else 0
    print(f"Video: {total} frames, {fps:.2f} fps, {duration:.2f}s")

    # Calculate the exact frame indices we want (evenly spaced across the whole video)
    # We want 200 frames spanning 0..total-1
    indices = [round(i * (total - 1) / (NUM_FRAMES - 1)) for i in range(NUM_FRAMES)]
    print(f"Frame range: {indices[0]} .. {indices[-1]}  (step ~ {indices[1]-indices[0]})")

    extracted = 0
    for frame_num, target in enumerate(indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, target)
        ok, frame = cap.read()
        if not ok:
            print(f"  WARNING: Could not read frame at index {target}, skipping")
            continue
        fname = f"frame-{frame_num + 1:04d}.jpg"
        out_path = os.path.join(OUT_DIR, fname)
        cv2.imwrite(out_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 92])
        extracted += 1
        if (frame_num + 1) % 50 == 0 or frame_num == 0:
            print(f"  Saved {frame_num + 1}/{NUM_FRAMES}  ({fname})")

    cap.release()
    print(f"\nDone: {extracted} frames saved to {OUT_DIR}")

if __name__ == "__main__":
    main()
