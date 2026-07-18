# Learnings

Mistakes, gotchas, and surprises from building this project — written down
so we don't repeat them. Add an entry whenever something cost real time or
changed our approach.

## 2026-07-11 — `.gitignore` was silently hiding the docs folder

The starter `.gitignore` contained a `/docs/` line, so everything written
to `docs/` was invisible to git — it would never have reached GitHub, and a
lost laptop would have meant lost docs. Lesson: when a folder never shows
up in `git status`, check `.gitignore` before assuming it's fine (`git
check-ignore -v <path>` tells you exactly which rule is hiding it).
