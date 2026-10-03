# Claude Code in a PyCharm SSH terminal: copy/paste and scrolling

Notes on running Claude Code on the DGX Spark from PyCharm on a Mac, through PyCharm's SSH interpreter terminal.

## Problem

By default Claude Code captures the mouse in the terminal. In PyCharm's SSH terminal that broke normal text selection and copy, so
output could not be copied out of a session.

## Fix (applied 2026-10-03)

Set this in `~/.bashrc` on the Spark, with the comment so the reason is not lost (it is at lines 156-157 there):

```bash
# Claude Code: disable mouse capture so native terminal text selection/copy works (PyCharm SSH terminal)
export CLAUDE_CODE_DISABLE_MOUSE=1
```

Open a new shell (or run `source ~/.bashrc`) and restart Claude Code. Selection and copy then work with the terminal's own behavior.

To undo it, delete the two lines and start a new shell.

## Trade-off: scrolling, and the better setting

`CLAUDE_CODE_DISABLE_MOUSE=1` turns off all mouse handling, including the wheel. Claude Code then shows
`Scroll wheel is sending arrow keys · use PgUp/PgDn to scroll` (observed 2026-10-03). Keyboard scrolling still works: PgUp / PgDn scroll half a
screen, Ctrl+Home jumps to the start, Ctrl+End to the latest message, and Ctrl+o opens a transcript view with more keys.

`CLAUDE_CODE_DISABLE_MOUSE_CLICKS=1` (Claude Code 2.1.195 or later; the Spark has 2.1.288) turns off click, drag and hover handling but keeps wheel
scrolling. Per the Claude Code docs (read by a subagent, not re-read here), `CLAUDE_CODE_DISABLE_MOUSE` wins if both are set.

Confirmed working 2026-10-03 by Mark in the PyCharm SSH terminal (copy and wheel scrolling both work), with these lines in `~/.bashrc` (the comment on the second one is corrected here; the file on the Spark may still carry the older wording, which does not change behavior):

```bash
# Claude Code: stop click/drag capture so native text selection/copy works (PyCharm SSH terminal); the wheel still scrolls
export CLAUDE_CODE_DISABLE_MOUSE_CLICKS=1

# Claude Code: leave mouse tracking at its default (on); copy works because of the line above, not this one
export CLAUDE_CODE_DISABLE_MOUSE=0
```

What each line does: `CLAUDE_CODE_DISABLE_MOUSE_CLICKS=1` is the one that makes copy work (no click or drag capture, wheel still scrolls).
`CLAUDE_CODE_DISABLE_MOUSE=0` reads as "do not disable the mouse", which is the default, so it only states the default explicitly and changes
nothing. Its old comment ("disable mouse capture") was backwards: it was written for the earlier `=1` fix, and is corrected above. Keeping the `=0` line is what was
tested and it works; deleting it, with its comment, should behave the same but was not tested. Open a new shell and restart Claude Code after
changing either.

## Open

- `~/.bashrc` is read by bash only. The Spark's login shell is bash (`SHELL=/bin/bash`) and there is no `~/.zshrc`, so nothing else needs the variable.
- PyCharm's terminal has its own scroll handling; `/scroll-speed` is not available there (per the docs).
