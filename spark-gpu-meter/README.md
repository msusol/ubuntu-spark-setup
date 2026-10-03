# Spark GPU Meter

A GNOME Shell extension that puts two live bars in the top bar of the DGX Spark:

- **GPU**: utilization, 0-100%
- **MEM**: system (unified) memory used, 0-128 GB

Bars turn yellow at 70% and red at 90%. Click the indicator for a dropdown with GPU name, utilization, memory in GB, temperature and power draw. It polls every 2 seconds.

## Requirements

- GNOME Shell 45, 46, 47 or 48 (the DGX OS default desktop)
- `nvidia-smi` on the PATH

## Install

From this folder, on the Spark:

```bash
bash install.sh
```

This copies the files to `~/.local/share/gnome-shell/extensions/gpu-meter@losus.ai/`.

Then reload GNOME Shell and enable the extension:

- **Wayland (default):** log out and back in.
- **X11:** press `Alt+F2`, type `r`, press Enter.

```bash
gnome-extensions enable gpu-meter@losus.ai
```

## Update

After editing any file, run `bash install.sh` again and reload the shell (log out and in on Wayland). If the extension is already enabled, the reload is all that's needed.

## Uninstall

```bash
gnome-extensions disable gpu-meter@losus.ai
rm -rf ~/.local/share/gnome-shell/extensions/gpu-meter@losus.ai
```

## Configuration

Constants at the top of `extension.js`:

| Constant | Default | Meaning |
|---|---|---|
| `POLL_SECONDS` | 2 | Refresh interval |
| `BAR_WIDTH` | 88 | Bar width in px |
| `BAR_HEIGHT` | 8 | Bar height in px |
| `WARN_AT` | 70 | Percent at which the bar turns yellow |
| `CRIT_AT` | 90 | Percent at which the bar turns red |
| `MEM_MAX_GB` | 128 | Full-scale value of the memory bar |

Colors and spacing are in `stylesheet.css`.

## Notes

- The GB10 shares memory between CPU and GPU, so `nvidia-smi` usually can't report GPU memory. The MEM bar reads system memory from `/proc/meminfo` instead.
- Linux reports slightly under 128 GB usable, so the MEM bar will not quite reach full even when memory is exhausted.

## Troubleshooting

- **Bars stay empty (`--`):** `nvidia-smi` isn't reachable from the shell session. Confirm it runs in a normal terminal.
- **Extension not listed after install:** reload the shell (see Install), then check `gnome-extensions list`.
- **Errors on load:** run `journalctl -f -o cat /usr/bin/gnome-shell` and enable the extension to see them.

## Files

- `metadata.json`: extension ID, name, supported shell versions
- `extension.js`: the indicator and polling logic
- `stylesheet.css`: bar styling
- `install.sh`: copies the files into the extensions directory
