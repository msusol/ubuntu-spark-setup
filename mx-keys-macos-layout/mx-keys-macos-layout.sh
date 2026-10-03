#!/usr/bin/env bash
set -euo pipefail

# To restore default GNOME XKB options:
gsettings reset org.gnome.desktop.input-sources xkb-options

# Logitech MX Keys for Business on Ubuntu/X11:
#
# Physical left-side order:
#   Ctrl | Opt/Start | Alt/Cmd | Space
#
# Mac-like behavior on Ubuntu:
#   Physical Alt/Cmd   -> Ctrl
#   Physical Opt/Start -> Alt
#   Physical Ctrl      -> Super
#
# Result: physical Alt/Cmd+C/V/X/Z/A/F/T/W behaves like
# Ctrl+C/V/X/Z/A/F/T/W in Linux GUI applications.
#
# In terminals, physical Alt/Cmd+C is Ctrl+C and interrupts
# the foreground process. Copy/paste terminal selections with
# Alt/Cmd+Shift+C and Alt/Cmd+Shift+V.
#
# PyCharm over SSH from a Mac (remote interpreter / SSH terminal):
#   This script does NOT apply. It only remaps keys in the Spark's own
#   GNOME/X11 session. PyCharm runs on the Mac, so the Mac's keymap
#   (Settings > Keymap > macOS) handles the keys, and the Spark never sees
#   a keycode to remap.
#   - Copy in the PyCharm terminal is Cmd+C (or Cmd+Insert), same as macOS.
#   - Ctrl+C is the normal terminal interrupt (SIGINT), not copy.
#   - Paste is Cmd+V.
#   If Cmd+C does not copy, check Settings > Keymap > Tools > Terminal > Copy
#   on the Mac, and that the selection is made inside the terminal pane.

gsettings set org.gnome.desktop.input-sources xkb-options \
  "['altwin:ctrl_alt_win']"

# Physical Alt/Cmd+Tab sends logical Ctrl+Tab (see mapping above). On macOS,
# Cmd+Tab is the app switcher, so bind logical Ctrl+Tab to GNOME's
# switch-applications (already bound to Super+Tab) to match that muscle
# memory. This is additive — Super+Tab keeps working — but it does take
# Ctrl+Tab away from any app that uses it for in-app tab switching
# (browsers, GNOME Terminal, etc.), since GNOME's global keybinding fires
# before the app sees the key, the same as Alt+Tab today.
gsettings set org.gnome.desktop.wm.keybindings switch-applications \
  "['<Super>Tab', '<Primary>Tab']"
gsettings set org.gnome.desktop.wm.keybindings switch-applications-backward \
  "['<Shift><Super>Tab', '<Shift><Primary>Tab']"

# Physical Alt/Cmd+` sends logical Ctrl+` (see mapping above). On macOS,
# Cmd+` switches between windows of the current app (distinct from Cmd+Tab's
# app switcher above), so bind logical Ctrl+` to GNOME's switch-group to
# match that muscle memory.
gsettings set org.gnome.desktop.wm.keybindings switch-group \
  "['<Primary>grave']"
gsettings set org.gnome.desktop.wm.keybindings switch-group-backward \
  "['<Shift><Primary>grave']"

echo "Applied MX Keys for Business Mac-style mapping:"
echo "  Alt/Cmd   -> Ctrl"
echo "  Opt/Start -> Alt"
echo "  Ctrl      -> Super"
echo "  Ctrl+Tab  -> app switcher (Cmd+Tab), in addition to Super+Tab"
echo "  Ctrl+\`    -> switch windows of current app (Cmd+\`)"
gsettings get org.gnome.desktop.input-sources xkb-options
gsettings get org.gnome.desktop.wm.keybindings switch-applications
gsettings get org.gnome.desktop.wm.keybindings switch-group