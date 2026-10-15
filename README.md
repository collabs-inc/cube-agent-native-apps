# Agent-Native apps for Cube

This repository maintains the shared runtime and reproducible compatibility changes for eleven [Agent-Native apps](https://www.agent-native.com/apps/) packaged as independent Cube applications. Original application source is by [Builder.io and contributors](https://github.com/BuilderIO/agent-native); the standalone source baseline is `@agent-native/core@0.209.0`, commit `6ac757a5ea3181158904e832f7a0a6c47c3694dd`.

## Repositories

Each app has a root `cube.json` and its own persistent data directory. Add a repository URL in Cube to install it.

| App | Repository |
| --- | --- |
| Design | https://github.com/collabs-inc/cube-agent-design |
| Slides | https://github.com/collabs-inc/cube-agent-slides |
| Analytics | https://github.com/collabs-inc/cube-agent-analytics |
| Calendar | https://github.com/collabs-inc/cube-agent-calendar |
| Clips | https://github.com/collabs-inc/cube-agent-clips |
| Mail | https://github.com/collabs-inc/cube-agent-mail |
| Assets | https://github.com/collabs-inc/cube-agent-assets |
| Content | https://github.com/collabs-inc/cube-agent-content |
| Dispatch | https://github.com/collabs-inc/cube-agent-dispatch |
| Forms | https://github.com/collabs-inc/cube-agent-forms |
| Plans | https://github.com/collabs-inc/cube-agent-plans |

## Integration

`shared/cube` implements installation, production builds, and foreground startup on Cube's assigned loopback port. `shared/server` configures Agent-Native as an embedded host, enables a durable local PGlite database, and supplies local public/private blob adapters. Cube's gate owns authentication; raw app ports must never be exposed publicly. `patches` contains app-specific compatibility changes.

Data resides at `$XDG_DATA_HOME/cube-agent-<name>`, defaulting to `~/.local/share/cube-agent-<name>`. Checkout replacement preserves data, uploads, generated files, and the persistent authentication/encryption secret. Stop the app before backing up this complete directory.

## Reproduce and test

Install `@agent-native/core@0.209.0` and check out the upstream source tag `@agent-native/core@0.209.0`. Run `node scripts/scaffold.mjs <upstream-checkout> <installed-core>/dist/cli/create.js <output-directory>`. This uses the pinned CLI's standalone transformations against the pinned source. Run `node scripts/integrate.mjs <app-directories...>`, then `node scripts/document.mjs <app-directories...>` to add Cube support and documentation. The scaffolder deliberately refuses to overwrite existing application trees.

In each app, generate or refresh its lockfile with `npm exec --yes --package=pnpm@10.29.1 -- pnpm install`, then run `node cube/install.mjs` to verify frozen dependency installation and the production build. Launch with `PORT=<free-port> node cube/start.mjs`. A fresh install must use its own data root.

Run `npm test` here to check storage persistence, private/public separation, traversal rejection, invalid ports, checkout replacement, cross-filesystem migration, and Clips' local storage policy. Per-app verification results describe browser and action checks separately from live external-service checks.

## Connection and platform requirements

AI generation requires configuring a supported model provider in the app. Cube CLI sign-ins are not automatically reused by this provider runtime. Mail, Calendar, Analytics data sources, and Dispatch integrations need their respective account connections. No API keys or account credentials ship in these repositories.

Clips' browser recording and uploads use local storage. Native global shortcuts, Fn dictation, system-audio capture, meeting detection, and browser-extension debug logging remain upstream companion-app capabilities. Cube's authenticated gate also protects shared forms, booking pages, and resource URLs; public anonymous sharing requires a separate deployment.
