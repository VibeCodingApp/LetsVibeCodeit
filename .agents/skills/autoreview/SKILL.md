---
name: autoreview
description: Run the structured source review before handoff after non-trivial edits.
---

# Autoreview

Use the globally installed helper on native Windows:

PowerShell command:

    $CodexSkills = 'C:\Users\WorkMonitor\.codex\skills'
    $Autoreview = Join-Path $CodexSkills 'autoreview\scripts\autoreview'
    python $Autoreview --mode local

Treat findings as advisory. Verify each finding against the real code path and fix only
actionable findings inside the current task scope. Re-run focused validation after fixes.
If the checkout has no .git metadata, report autoreview as unavailable instead of
initializing Git or creating unrelated commits.
