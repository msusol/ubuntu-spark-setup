# Customizing the terminal prompt (bash + zsh)

Login shell on this machine: `/bin/bash` (confirmed via `$SHELL` and
`/etc/passwd`) — prompt controlled by `PS1` in `~/.bashrc`. A `~/.zshrc` was
also added (2026-09-27) for contexts that explicitly invoke `zsh` (e.g. tools
whose shell tool defaults to zsh); it does **not** apply to normal terminal
logins unless the login shell is also switched (`chsh -s $(which zsh)`).

## Actual current prompt (the one that's really active)

`~/.bashrc` has **two** prompt definitions: the stock Ubuntu block (below,
for reference) and a later `# CUSTOM` override further down the file that
actually wins, since it's assigned last. This second one is what you
actually see day to day — easy to miss if you only skim the file's earlier
section (this doc originally did, before catching it live 2026-09-27).

Current custom override:

```bash
# CUSTOM
# blue PS1='\[\033[34m\]\W\[\033[0m\] \$ '
PS1='\[\033[32m\]${HOSTNAME^^} \W\[\033[0m\] \$ '
#PS1='\[\033[32m\]\W\[\033[0m\] \$ '
```

Renders as: `SPARK-DB62 <dirname> $ ` (green, hostname uppercased via
`${HOSTNAME^^}`). Before 2026-09-27 this was a literal hardcoded `NVIDIA `
instead of `${HOSTNAME^^}` — changed so it reflects the real hostname
instead of a fixed string. The commented-out lines above/below are earlier
variants (blue, no hostname) kept for quick reference/rollback.

## Stock Ubuntu default (not currently active — for reference only)

This is the unmodified block bash ships with, still present earlier in
`~/.bashrc` but **overridden** by the `# CUSTOM` block above:

```bash
# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
        color_prompt=yes
    else
        color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
```

Would render as `user@host:~/some/path$ ` if the `# CUSTOM` override below
it weren't there.

## How to change it

1. Open `~/.bashrc` and find the `PS1=` line(s) above.
2. Replace with your own `PS1` string, or comment out the whole block and set
   a single line instead, e.g.:
   ```bash
   PS1='\u@\h:\w\$ '
   ```
3. Reload without restarting the terminal:
   ```bash
   source ~/.bashrc
   ```

## Common PS1 escape sequences

| Sequence | Meaning |
|---|---|
| `\u` | username |
| `\h` | hostname (short) |
| `\H` | hostname (full) |
| `\w` | current working directory (`~` for home) |
| `\W` | current directory basename only |
| `\d` | date |
| `\t` | time (24h) |
| `\$` | `$` for a normal user, `#` for root |
| `\[\033[01;32m\]...\[\033[00m\]` | wrap text in a color (green here); `\[...\]` marks non-printing sequences so bash doesn't miscount the line width |

Common color codes: `30` black, `31` red, `32` green, `33` yellow, `34` blue,
`35` magenta, `36` cyan, `37` white. Prefix `01;` for bold/bright.

## Adding git branch info to the prompt

```bash
parse_git_branch() {
    git branch 2>/dev/null | sed -n '/\* /s///p'
}
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(parse_git_branch)\[\033[00m\]\$ '
```

## Simpler alternative: a prompt framework

For a much richer prompt (git status, exit codes, timing, etc.) without
hand-writing escape sequences, consider [Starship](https://starship.rs/) —
cross-shell, single binary, works the same in bash and zsh if the shell is
ever switched:

```bash
sudo port install starship   # per this machine's tooling convention
echo 'eval "$(starship init bash)"' >> ~/.bashrc
```

## zsh prompt (`~/.zshrc`)

Current setup — hostname (uppercase) + current directory's last component +
`$`/`#`:

```zsh
# Prompt: hostname (uppercase) + current directory (last component) + $
# e.g. "SPARK-DB62 ollama-server $ "
PROMPT='${(U)HOST} %1~ %(!.#.$) '
```

Test a prompt string without needing to open a new shell:

```zsh
zsh -c 'print -P "${(U)HOST} %1~ %(!.#.$) "'
```

### Common zsh PROMPT escapes

| Sequence | Meaning |
|---|---|
| `%n` | username |
| `%m` | hostname, short (up to first `.`) |
| `%M` | hostname, full |
| `${(U)HOST}` | full hostname, forced uppercase (parameter expansion flag, not a `%`-escape) |
| `%~` | current directory, full path, `~` for home |
| `%1~` | current directory, last component only |
| `%d` / `%/` | current directory, full path, no `~` substitution |
| `%D` | date |
| `%T` | time (24h) |
| `%(!.#.$)` | `#` if root, `$` otherwise (ternary conditional) |
| `%F{green}...%f` | wrap text in a color (green here) — `%f` resets |

Common named colors for `%F{...}`/`%K{...}` (background): `red`, `green`,
`yellow`, `blue`, `magenta`, `cyan`, `white`, `black`, plus numeric 256-color
codes (`%F{208}` for orange, etc.).

### Adding git branch info to the zsh prompt

```zsh
setopt PROMPT_SUBST
parse_git_branch() {
  git branch 2>/dev/null | sed -n '/\* /s///p'
}
PROMPT='%F{green}${(U)HOST}%f %F{blue}%1~%f %F{yellow}$(parse_git_branch)%f%(!.#.$) '
```
`setopt PROMPT_SUBST` is required for `$(...)` command substitution to
re-evaluate on every prompt (zsh doesn't do this by default, unlike bash).

## Related

- [`mx-keys-macos-layout.sh`](mx-keys-macos-layout.sh) — keyboard remap script (unrelated, same directory)
