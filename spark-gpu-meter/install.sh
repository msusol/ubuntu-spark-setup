#!/usr/bin/env bash
# Run on the DGX Spark from the folder containing these files.
set -euo pipefail
UUID="gpu-meter@losus.ai"
DEST="$HOME/.local/share/gnome-shell/extensions/$UUID"
mkdir -p "$DEST"
cp metadata.json extension.js stylesheet.css "$DEST/"
echo "Installed to $DEST"
echo "Wayland: log out and back in, then run: gnome-extensions enable $UUID"
echo "X11:     press Alt+F2, type r, Enter, then: gnome-extensions enable $UUID"
