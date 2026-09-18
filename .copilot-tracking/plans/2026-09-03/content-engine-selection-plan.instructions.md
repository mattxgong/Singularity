<!-- markdownlint-disable-file -->

# SINGULARITY-002 Content Engine Selection Plan

## User Requests

- Continue prior Suggested Next Work option 1: execute SINGULARITY-002 content-engine
  spikes and present the owner choice.
- Kill all running processes from the earlier work before starting.

## Context Summary

Earlier Singularity Node and browser processes were terminated and ports 3000, 9222,
and 9223 were verified closed. Production files may contain user edits and must
not be overwritten by disposable spike work.

Applicable guidance:

- `docs/planning/singularity/tasks.md`, SINGULARITY-002
- `docs/planning/singularity/roadmap.md`, Phase P0
- `.github/instructions/hve-core/markdown.instructions.md`
- `.github/instructions/hve-core/writing-style.instructions.md`
- `.github/instructions/hve-core/prompt-builder.instructions.md`

## Implementation checklist

- [x] Terminate and verify earlier Singularity processes.
- [x] Reconcile current planning and research artifacts.
- [x] Build and validate the Velite disposable spike. <!-- parallelizable: false -->
- [x] Build and validate the Content Collections disposable spike. <!-- parallelizable: false -->
- [x] Compare measured evidence and remove all throwaway spike files.
- [x] Present the recommendation and record the owner's selected engine.
- [x] Validate the final decision record and registry pins.

## Dependencies

- Research: `.copilot-tracking/research/2026-09-03/content-engine-selection-research.md`
- Candidate research: `.copilot-tracking/research/subagents/2026-09-03/content-engine-candidates-research.md`
- Node.js 24.15.0 and Yarn 3.6.1
- Velite 0.4.0
- Content Collections core 0.15.2, Next 0.2.11, and MDX 0.2.2

## Success criteria

- Both candidates use equivalent fixture semantics and report reproducible
  commands, timings, diagnostics, generated types, and warnings.
- Production application source, package metadata, and lockfile remain unchanged.
- No throwaway fixtures, configurations, generated output, or dependencies remain.
- Contentlayer2 retention and migration deferral are not offered.
- The final decision names one owner-selected engine and exact migration pins.
