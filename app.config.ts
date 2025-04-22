import { defineConfig } from '@solidjs/start/config';
import { loadConfig } from "./translation-editor-config-manager.ts";

export default defineConfig({
  ssr: false,
  server: {
    baseURL: '/translation-editor/',
  },
});

// Force it to try to load the user-supplied config file here, so that the error occurs in a more noticeable way if the user hasn't made the config:
const _translationEditorConfig = loadConfig();
