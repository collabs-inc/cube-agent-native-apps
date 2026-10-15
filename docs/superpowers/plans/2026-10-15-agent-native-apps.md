# Agent-Native Cube apps implementation plan

**Goal:** Deliver all eleven gallery apps as separately installable public Cube applications.

**Architecture:** Standalone upstream apps with a shared embedded-host adapter and persistent launch wrapper. Integration recipes live here; generated application source lives in separate repositories.

**Tech stack:** Node 22+, pnpm 10, Nitro, React, PGlite, Agent-Native 0.209.0.

**Spec:** ../specs/2026-10-15-agent-native-apps.md

## Tasks

- [x] Scaffold all eleven apps using the published standalone transformations; retain upstream source provenance and licenses.
- [x] Test and implement shared launcher: invalid PORT fails, loopback only, persisted random secret, stable external storage, existing data never overwritten, subprocess termination forwarded.
- [x] Implement embedded production database, stable owner, local upload, and private blob support using public framework APIs. Verify fresh database initialization.
- [x] Apply app-specific storage and startup fixes. Build each app and fix actual build failures.
- [x] Run production/browser/core-action/restart checks, recording real service prerequisites separately.
- [x] Commit and publish each passing app and add validated Market entries. Review integration diff and report exact results.

## Review focus

Persistent data must survive checkout replacement. Separate app installations must not share databases. Native-only capture must not be presented as working in a cloud browser. OAuth and model credentials must remain user configuration. Fresh installs must work without the author's environment or dependency cache.
