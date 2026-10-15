# Verification results

All eleven apps pass production builds, startup health checks, browser checks,
and local-state persistence across restarts on Linux with Node 22.23.3 and
pnpm 10.29.1. These checks use synthetic data. They do not send email, contact
external recipients, or consume paid model APIs.

## App workflows

The following checks exercise each app's local functionality.

| App | Verified workflow |
| --- | --- |
| Design | Create project and HTML screen; render canvas; click interactive prototype; retain project and file after restart; export uploaded images and CSS backgrounds into SVG. |
| Slides | Create deck and slide; reload editor; upload PNG and export PPTX containing identical image bytes; validate generated-image local URLs. |
| Analytics | Create dashboard folder; render dashboard navigation; retain folder after restart. |
| Calendar | Save timezone and inactive booking link; render settings; retain settings after restart. |
| Clips | Create recording; upload and finalize WebM; play video; retain recording; serve canonical video URL and byte ranges. |
| Mail | Save snippet and unsent compose draft; restore compose tab; resolve local uploads into MIME attachments. |
| Assets | Create library; upload PNG; render image; retrieve identical image bytes after restart. |
| Content | Create document; render editor and body; retain document after restart. |
| Dispatch | Create and edit user group; render navigation; retain group after restart. |
| Forms | Create, edit, and publish form; submit response; render form; retain form and response after restart. |
| Plans | Create structured plan with steps; render plan; retain plan after restart. |

## Shared integration

All eleven manifests pass Cube's manifest parser. Frozen lockfiles validate for
all apps. The shared test suite passes nine tests covering port validation,
persistent secrets, checkout replacement, generated configuration refresh,
cross-filesystem migration, blob persistence, private/public separation, path
validation, and Clips' local storage policy.

Runtime checks exercise Cube's shutdown sequence: SIGHUP, SIGTERM after 250 ms,
and a SIGKILL deadline at 2,250 ms. Tested applications exit normally before
that deadline and reopen their persistent database. The loaded Analytics case
exits in approximately 2.17 seconds; other measured cases take roughly 1.5–1.7
seconds. Startup binds to loopback on Cube's assigned port.

The final review found and fixed local media consumers in Mail, Slides, Clips,
and Design. Mail's 26 focused tests cover MIME attachments, oversized uploads,
and invalid blob paths. Slides' 109 focused tests include real storage bytes
inside the exported PPTX archive. Clips' 23 route tests include full, prefix,
suffix, and unsatisfied range responses after authorization checks. Design's
135 focused tests include real Chromium rendering and embedded PNG bytes for
both image elements and CSS backgrounds. Its installer provisions the pinned
Playwright Chromium build needed by the exporter.

## Scope of verification

AI generation requires a configured provider. Gmail, Google Calendar, external
analytics sources, and Dispatch integrations require account connections. No
live provider credentials were available for these checks, so those connected
workflows are not verified end to end.

Clips' native shortcuts, Fn dictation, system audio, meeting detection, and
browser-extension logging require upstream companion applications. Uploaded
video playback is verified; browser screen capture depends on browser support
and permissions. Cube's authenticated gate protects form, booking, and shared
resource URLs; anonymous public sharing requires a separate deployment.

The manifests support Linux and macOS, but this verification runs on Linux.
Upstream doctor findings remain, including Content and Mail baseline findings;
the inherited configuration does not fail builds on doctor findings. Passing
build and integration checks does not mean every upstream feature or test suite
has passed.

## Publication audit

On October 15, 2026, a fresh audit confirmed that all eleven public Market
revisions match the clean local and remote repositories. Each published app
started from its production build, reported healthy configuration, served its
root page with HTTP 200, and exited successfully under Cube's shutdown
sequence. The shared tests and Mail, Slides, Clips, and Design regression
suites passed again.
