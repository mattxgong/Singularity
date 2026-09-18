<!-- markdownlint-disable-file -->

# SINGULARITY-002 Content Engine Selection Changes

## Related plan

`.copilot-tracking/plans/2026-09-03/content-engine-selection-plan.instructions.md`

## Implementation date

2026-09-03

## Summary

Compared Velite and Content Collections through isolated equivalent spikes,
preserved measured evidence, and recorded Matthew Gong's approval of Content
Collections with exact package pins. Production application files and dependency
metadata were not changed.

## Added

- `docs/planning/singularity/content-engine-selection.md`
- `.copilot-tracking/research/2026-09-03/content-engine-selection-research.md`
- `.copilot-tracking/research/subagents/2026-09-03/content-engine-candidates-research.md`
- `.copilot-tracking/research/subagents/2026-09-03/velite-spike-results.md`
- `.copilot-tracking/research/subagents/2026-09-03/content-collections-spike-results.md`
- `.copilot-tracking/plans/2026-09-03/content-engine-selection-plan.instructions.md`
- `.copilot-tracking/details/2026-09-03/content-engine-selection-details.md`
- `.copilot-tracking/plans/logs/2026-09-03/content-engine-selection-log.md`

## Modified

No production files were modified. The plan and planning log were finalized after
the owner decision.

## Removed

- `.copilot-tracking/spikes/2026-09-03/velite/`
- `.copilot-tracking/spikes/2026-09-03/content-collections/`

The removed paths contained only disposable applications, fixtures, installed
dependencies, build output, and generated candidate artifacts.

## Deviations

The requested Vercel preview could not run because no authenticated and linked
Vercel environment exists. Both candidates passed the equivalent local normal
and degraded static-export builds. A production Vercel preview remains required
before the P0 exit gate closes.

## Release summary

SINGULARITY-002 selects Content Collections for the production migration. SINGULARITY-003
can proceed with core 0.15.2, Next adapter 0.2.11, and MDX integration 0.2.2.
