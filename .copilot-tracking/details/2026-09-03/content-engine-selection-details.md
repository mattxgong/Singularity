<!-- markdownlint-disable-file -->

# SINGULARITY-002 Implementation Details

## Context references

- Plan: `.copilot-tracking/plans/2026-09-03/content-engine-selection-plan.instructions.md`
- Research: `.copilot-tracking/research/2026-09-03/content-engine-selection-research.md`
- Task: `docs/planning/singularity/tasks.md`, SINGULARITY-002

## Phase 1: Shared contract

Each isolated spike defines Blog and Authors collections. The Blog fixture must
include required and optional frontmatter, GFM, math, an image reference, a
titled code fence, three nested headings, and a custom MDX component. Generated
data must expose ISO date, slug, path, source path, reading-time data, table of
contents, structured data, deterministic tag counts, and deterministic search
data.

Success requires a typed import assertion and a failing invalid-frontmatter
case naming both the file and offending field.

## Phase 2: Candidate execution

For each candidate:

1. Install exact package pins in its isolated directory.
2. Run cold generation and validate generated content.
3. Run the invalid fixture and capture sanitized diagnostics.
4. Run watch mode, edit only the synthetic fixture, and measure regeneration.
5. Run normal and `EXPORT=1 UNOPTIMIZED=1` Next.js builds.
6. Record configuration size, package count, warnings, and integration caveats.
7. Remove the candidate directory after its evidence record is complete.

The candidates run serially because concurrent dependency installation and
compilation would make timing evidence misleading.

## Phase 3: Decision gate

Create `docs/planning/singularity/content-engine-selection.md` with the completed
comparison, primary links, recommendation, exact pins, and preview limitation.
Ask the owner to choose Content Collections or Velite. Record owner name, ISO
date, selected engine, and rationale. Do not proceed into SINGULARITY-003 before this
record is complete.
