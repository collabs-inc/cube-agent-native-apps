import path from "node:path";

/** Cube is a single-user process with durable storage behind its app gate. */
export function allowsCubeRecordingScratch(
  databaseUrl: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const root = env.CUBE_APP_DATA_DIR?.trim();
  if (!root || !path.isAbsolute(root) || !databaseUrl.startsWith("pglite:")) {
    return false;
  }
  const databasePath = databaseUrl.slice("pglite:".length);
  // Scratch chunks must survive process restarts, just like their recordings.
  return Boolean(databasePath && !/^\/*:?memory(?::|\/|$)/i.test(databasePath));
}
