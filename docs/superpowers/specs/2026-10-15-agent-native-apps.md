# Agent-Native apps for Cube

Package the eleven public gallery applications as independent public collabs-inc repositories: cube-agent-design, cube-agent-slides, cube-agent-analytics, cube-agent-calendar, cube-agent-clips, cube-agent-mail, cube-agent-assets, cube-agent-content, cube-agent-dispatch, cube-agent-forms, and cube-agent-plans. The user authorized creating these public repositories and getting every app working. Preserve upstream code and attribution, with reviewable Cube compatibility changes. Separate repository identities fit Cube's existing install/update contract without changes to Cube.

## Runtime

Use the published Agent-Native standalone scaffolder, pinned to core 0.209.0. Each app has a root cube.json with deterministic install and foreground start commands. Production Nitro runs on 127.0.0.1 and Cube's PORT. The Cube gate owns authentication; the embedded app uses one stable local owner. Use the framework's embedded host support for PGlite. Generate a persistent random authentication secret. Store database, uploads, exports, and runtime state outside the replaced checkout under XDG_DATA_HOME or ~/.local/share/<repository>. Preserve provider configuration across updates. Do not copy developer credentials into repositories.

## Compatibility

Share the host adapter, launcher, and checks from this integration repository. Keep app-specific fixes under patches. Support local uploads and Clips browser recording without mandatory hosted blob storage. Native desktop/extension capture is separate from the browser application. Provider actions must retain real connection requirements and explicit errors. Do not claim live Google, LLM, Slack, or other service calls passed without credentials and observed responses.

## Verification and publication

Build every app and verify a fresh production start, rendered browser UI, a representative local action, and persistence across restart. Test the launcher's storage and port handling. Record exact results per app, including service-dependent limits. Publish each coherent tested repository with upstream MIT attribution and setup documentation. Add verified app entries to Cube Market with original creator/upstream links. No Cube release or machine restart is needed.
