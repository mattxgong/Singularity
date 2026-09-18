---
title: Singularity Privacy Preflight
description: Execution record for the resume redaction, metadata removal, source relocation, and Git history assessment required before Phase P0
author: Matthew Gong
ms.date: 2026-09-03
ms.topic: reference
keywords:
  - privacy
  - resume
  - redaction
estimated_reading_time: 3
---

## Outcome

`SINGULARITY-032` ran before Phase P0 and before repository initialization. The
workspace was not a Git repository, so the original resume PDF has no Git
history to remediate. No history rewrite is required and the remediation cost
is zero.

The published artifact is
`public/resume/matthew-gong-resume.pdf`. It was sanitized with an applied PDF
redaction that removes the underlying text object, not a visual overlay.
Standard document metadata and XML metadata were removed, and the saved PDF
was rewritten with unreachable objects discarded.

The preferred LaTeX regeneration path was unavailable because the workspace
and nearby document folders contained no resume `.tex` source. The applied
redaction is the recorded fallback. A future source-controlled LaTeX resume
must keep the private contact line outside the public build.

The original PDF was moved outside the repository tree before Git
initialization. The root filename is explicitly ignored to prevent accidental
reintroduction.

## Validation

Install the pinned validator dependency and run the privacy check:

```powershell
python -m pip install -r scripts/requirements.txt
python scripts/check-sensitive-data.py public/resume/matthew-gong-resume.pdf
```

The check extracts text from the saved PDF, rejects generic North American
phone-number patterns, rejects private or toolchain metadata, rejects local
paths in metadata, and enforces the 400 KB size limit. It reports failure
categories only and never prints matched content.

Validation passed on 2026-09-03. A rendered-page inspection also confirmed
that the applied redaction did not damage the remaining layout.
