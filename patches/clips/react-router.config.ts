import type { Config } from "@react-router/dev/config";

import { PRERENDERED_PUBLIC_PAGE_PATHS } from "./shared/prerendered-public-paths";

export default {
  appDirectory: "app",
  ssr: true,
  routeDiscovery: { mode: "initial" },
  // The full desktop bundle can take more than the default 10s to load on
  // small Cube machines while several apps are installing concurrently.
  prerender: { paths: () => [...PRERENDERED_PUBLIC_PAGE_PATHS], timeout: 60_000 },
} satisfies Config;
