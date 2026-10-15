import { configureAgentNativeEmbeddedEnvironment } from "@agent-native/core/server";
import { registerFileUploadProvider } from "@agent-native/core/file-upload";
import { registerPrivateBlobProvider } from "@agent-native/core/private-blob";
import { createCubeStorage, cubeDataDirectory } from "../lib/cube-storage";

// Claim the documented desktop-host exemption before Nitro runs DB plugins.
// NODE_ENV does not disable the production bundle's PGlite refusal.
const root = cubeDataDirectory();
configureAgentNativeEmbeddedEnvironment({ databaseUrl: `pglite:${root}/pglite` });
const storage = createCubeStorage(root);
registerFileUploadProvider(storage.publicProvider);
registerPrivateBlobProvider(storage.privateProvider);

export default () => {};
