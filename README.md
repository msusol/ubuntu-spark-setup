# Ubuntu

Personal Ubuntu desktop customizations for the DGX Spark and other Ubuntu machines. This is one git repo (`ubuntu-spark-setup`, private); each tool lives in its own subfolder with its own README.

## Index

| Item | Kind | Scope | Notes |
|---|---|---|---|
| [`spark-gpu-meter/`](spark-gpu-meter/) | GNOME Shell extension | **DGX Spark only** | GPU and unified-memory bars in the top bar. Needs `nvidia-smi` and GNOME Shell 45-48. See its [README](spark-gpu-meter/README.md). |
| [`mx-keys-macos-layout/`](mx-keys-macos-layout/) | Shell script | Any Ubuntu (X11) | Remaps a Logitech MX Keys for Business to a Mac-style Cmd/Opt/Ctrl layout via GNOME XKB options. |
| [`terminal-prompt/`](terminal-prompt/) | Notes | Any Ubuntu | How the bash and zsh prompts are set up on this machine. |

## Spark-specific vs. generic

- **Spark-specific:** `spark-gpu-meter`. It depends on the GB10's unified memory and `nvidia-smi`.
- **Generic Ubuntu:** everything else. These work on any Ubuntu desktop.

If most future items turn out to be Spark-specific, consider renaming this folder or moving the generic items out.

## Adding an item

1. Give it its own subfolder, kebab-case name.
2. Add a row to the index table above, with its scope (Spark-only or any Ubuntu).
3. Give it a `README.md` with requirements, install and uninstall steps.
