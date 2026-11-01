#!/bin/bash
# scripts/ig-slide.sh <src.jpeg> <out.jpg>
# Instagram carousel slide: 1440x1080 (4:3), logo bottom-right.
# Logo colour picks itself from the brightness of the corner it sits on:
# charcoal wordmark on light corners, off-white wordmark on dark ones.
set -euo pipefail
R=/Users/collinbottrell/Projects/edmonton-refreshed
src="$1"; out="$2"
W=1440; H=1080; LW=380; M=44
tmp=$(mktemp -d)
# Landscape photos fill the frame; portrait photos sit centred on a blurred,
# darkened copy of themselves so nothing is cropped.
magick "$src" -auto-orient -resize ${W}x${H}^ -gravity center -extent ${W}x${H} -blur 0x30 -modulate 70 "$tmp/bg.png"
magick "$src" -auto-orient -resize ${W}x${H} "$tmp/fg.png"
magick "$tmp/bg.png" "$tmp/fg.png" -gravity center -composite "$tmp/base.png"
lum=$(magick "$tmp/base.png" -gravity southeast -crop ${LW}x140+${M}+${M} +repage -colorspace Gray -format "%[fx:mean]" info:)
if awk "BEGIN{exit !($lum > 0.55)}"; then logo="$R/brand/er-logo-horizontal-light.png"; sh="white"; else logo="$R/brand/er-logo-horizontal-dark.png"; sh="black"; fi
magick "$logo" -resize ${LW}x "$tmp/logo.png"
# soft halo behind the logo so it holds on busy corners
magick "$tmp/logo.png" -alpha extract -morphology Dilate Disk:6 -blur 0x10 -background $sh -alpha shape -channel A -evaluate multiply 0.55 +channel "$tmp/halo.png"
magick "$tmp/base.png" "$tmp/halo.png" -gravity southeast -geometry +${M}+${M} -composite \
  "$tmp/logo.png" -gravity southeast -geometry +${M}+${M} -composite \
  -strip -sampling-factor 4:2:0 -quality 84 "$out"
rm -rf "$tmp"
