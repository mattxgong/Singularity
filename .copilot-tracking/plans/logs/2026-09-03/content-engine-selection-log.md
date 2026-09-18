<!-- markdownlint-disable-file -->

# SINGULARITY-002 Planning Log

## Discrepancies

- The repository is not initialized as Git, so disposable branches or worktrees
  are unavailable. Isolated directories under `.copilot-tracking/spikes/` provide
  equivalent production-file isolation and are deleted before task completion.
- Content Collections documentation returned HTTP 429. Primary package
  manifests, source examples, and installed type declarations are used to verify
  exact APIs.
- The task requests a Vercel preview. No credentials will be requested through
  chat. The check runs only if an authenticated, linked local environment already
  exists; otherwise this remains a documented external validation requirement.

## Implementation paths considered

Selected: two minimal isolated Next.js applications sharing one behavioral
contract. This tests candidate ownership boundaries without destabilizing the
production dependency graph.

Rejected: install both candidates into the production application. The task
explicitly excludes production configuration changes and requires throwaway
spikes.

Rejected: compare package metadata only. Metadata cannot prove diagnostics,
generated types, watch behavior, or the two build profiles.

## Suggested follow-on work

- Execute SINGULARITY-003 with the owner-selected engine.
- Run SINGULARITY-004 and SINGULARITY-005 in parallel after this decision record closes.

## Decision

Matthew Gong approved Content Collections on 2026-09-03. SINGULARITY-003 is pinned
to `@content-collections/core@0.15.2`, `@content-collections/next@0.2.11`, and
`@content-collections/mdx@0.2.2`.

The owner accepted slower local generation and a timestamped generated barrel
in exchange for the first-party Next.js adapter and native file-and-field schema
diagnostics. Required publishable artifacts remained deterministic.

## Validation record

- Both disposable spikes passed schema, MDX, computed-field, type, watch,
  normal-build, and degraded static-export checks.
- Prettier and VS Code diagnostics passed for the final decision record.
- Registry checks returned Velite 0.4.0 and the three selected Content
  Collections package versions recorded above.
- The Velite and Content Collections disposable directories were absent after
  cleanup, and port 4317 had no listener.
- Production `package.json` and `yarn.lock` retained their pre-spike SHA-256
  values.
- Vercel preview validation remains external because this workspace has no CLI,
  project link, or credential environment.
