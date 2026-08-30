#!/usr/bin/env bash
# Renders docs/reel.html one frame per headless Chrome process, then encodes an
# mp4 and a gif. One process per frame is slow but it is the only way to get a
# deterministic frame without a CDP client, and the seeded run makes every
# frame reproducible.
#
#   npm run dev
#   scripts/capture-reel.sh [base-url] [seed] [seconds] [fps]
set -euo pipefail

BASE="${1:-http://localhost:5173}"
SEED="${2:-7}"
SECONDS_LONG="${3:-16.7}"
FPS="${4:-10}"
JOBS="${JOBS:-4}"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found"; exit 1; }

OUT="$(cd "$(dirname "$0")/.." && pwd)/docs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

TOTAL=$(python3 -c "print(int(float('$SECONDS_LONG') * $FPS))")
echo "capturing $TOTAL frames at ${FPS}fps, $JOBS at a time"

shoot() {
  local i="$1"
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --user-data-dir="$WORK/profile-$i" --window-size=1080,1080 \
    --virtual-time-budget=4000 \
    --screenshot="$WORK/$(printf '%04d' "$i").png" \
    "$BASE/docs/reel.html?frame=$i&seed=$SEED&fps=$FPS" >/dev/null 2>&1
}
export -f shoot
export CHROME WORK BASE SEED FPS

seq 0 $((TOTAL - 1)) | xargs -P "$JOBS" -I{} bash -c 'shoot {}'

COUNT=$(ls "$WORK"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "captured $COUNT frames"
[ "$COUNT" -eq "$TOTAL" ] || echo "warning: expected $TOTAL"

ffmpeg -y -loglevel error -framerate "$FPS" -i "$WORK/%04d.png" \
  -vf "scale=1080:1080:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 20 \
  -movflags +faststart "$OUT/reel.mp4"

# Two-pass palette, or the flat blues band badly.
ffmpeg -y -loglevel error -framerate "$FPS" -i "$WORK/%04d.png" \
  -vf "fps=$FPS,scale=540:-1:flags=lanczos,palettegen=stats_mode=diff" "$WORK/palette.png"
ffmpeg -y -loglevel error -framerate "$FPS" -i "$WORK/%04d.png" -i "$WORK/palette.png" \
  -lavfi "fps=$FPS,scale=540:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  "$OUT/reel.gif"

ls -lh "$OUT/reel.mp4" "$OUT/reel.gif"
