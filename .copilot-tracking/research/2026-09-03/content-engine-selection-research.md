<!-- markdownlint-disable-file -->

# SINGULARITY-002 Content Engine Selection Research

## Scope and success criteria

Compare Velite and Content Collections against the same synthetic representation
of Singularity's current Blog and Authors content contract without changing production
configuration or dependencies.

SINGULARITY-002 succeeds when both candidates demonstrate schema diagnostics, typed
generated data, MDX compilation, computed fields, watch updates, and normal plus
degraded Next.js builds. The final engine remains an explicit owner choice.

## Evidence

- `docs/planning/singularity/tasks.md` defines the owner gate and excludes retaining
  Contentlayer2.
- `contentlayer.config.ts` defines the current schema, computed fields, Unified
  transforms, tag output, and search output.
- `docs/planning/singularity/baseline-metrics.md` records Node.js 24.15.0, Yarn 3.6.1,
  Next.js 15.5.12, and React 19.2.4 as the comparison environment.
- `.copilot-tracking/research/subagents/2026-09-03/content-engine-candidates-research.md`
  verifies current package metadata and maintenance evidence.
- Primary package manifests confirm stable pins: Velite 0.4.0, Content
  Collections core 0.15.2, Next adapter 0.2.11, and MDX 0.2.2.

## Local hypothesis

Both candidates should compile the bounded Blog and Authors fixture under Node 24. Content Collections should require less Next.js integration code because it
has a first-party adapter. Velite may provide simpler schema-level path, date,
reading-time, and table-of-contents transforms but requires explicit startup and
uses function-body MDX evaluation.

The cheapest discriminating check is a cold content generation followed by a
deliberately invalid frontmatter build. A candidate that cannot pass both does
not proceed to watch or Next.js build checks.

## Selected approach

Create two isolated disposable Next.js applications under
`.copilot-tracking/spikes/2026-09-03/`. Give both the same synthetic content
features and assertions. Run them serially, write measured results to separate
subagent research records, then delete the disposable applications. Preserve
only evidence and the final owner decision document.

Vercel preview deployment requires project credentials and is not attempted
with secrets routed through the agent. A local Vercel build may be recorded if
the existing environment is already authenticated and linked; otherwise the
missing preview check remains explicit at the owner gate.
