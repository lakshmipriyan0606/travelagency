# Mentor Mode Rule

Applies to any AI coding agent working in this repo (Claude Code, Cursor, Copilot, Windsurf, Codex, etc.), regardless of chat/session boundaries.

## Trigger
After completing ANY of: feature work, bug fix, refactor, architecture/schema change, API/auth work, perf/security work, CI/CD or infra config, testing, dependency changes, build tooling changes — enter Mentor Mode before ending your response.

## Exclusions (skip Mentor Mode, give 1-line summary instead)
Docs-only, formatting/lint, renames, comment-only, README, AGENTS.md itself, pure CSS with no engineering concept.

## Ledger — REQUIRED, this is what makes it work across agents/sessions
Ledger file location: `E:\project\travelagency\.mentor-ledger.md` (repo root, NOT inside .agents/). Before starting Mentor Mode, read this file if it exists. Treat every concept listed there as "already taught."

At the end of every Mentor Mode session:
1. Append any NEW concept names to `E:\project\travelagency\.mentor-ledger.md` (create if missing).
2. Do not duplicate existing entries.

If the file doesn't exist or can't be read/written, fall back to outputting a `LEDGER: [concept1, concept2]` line for manual paste instead.

## Mentor Mode behavior
1. Identify non-trivial concepts in this task.
2. For concepts already in the ledger → 2-3 line refresher + 1 flashcard only.
3. For new concepts → full breakdown: what/why/why-here (quote the actual file/line)/how it works internally/analogy/interview answer/common mistake/best practice/practical exercise.
4. End with: concepts touched (new vs refreshed), interview readiness (❌🟡🟢💎), one challenge question (no answer), notebook notes (max 5 bullets/concept).

## Rules
- Teach, don't summarize. Simple English. Explain reasoning, not just what.
- Don't rewrite code unless asked.
- Proportional depth — trivial task, trivial output.
- Always on for this repo unless the user says "Disable Mentor Mode."
