import { TranslationEditorConfig } from './translation-editor-config-manager.ts';

export const TRANSLATION_EDITOR_CONFIG: Required<TranslationEditorConfig> = {
  apiUrl: 'http://localhost:8000/create-pr',
  appIdentifier: 'com.axhxrx.app.translation-editor',

  authConfig: {
    authenticate: async () =>
    {
      await Promise.resolve();
      return 'auth not required';
    },
    isAuthenticated: (authenticateResult: unknown) =>
    {
      return authenticateResult === 'auth not required';
    },
    handleAuthenticationFailure: async (_authenticateResult: unknown) =>
    {
      return await Promise.reject(
        new Error(
          'INTERNAL ERROR: Authentication failed, but this should be impossible, since this app does not require authentication. Check the translation-editor-config for invalid config settings.',
        ),
      );
    },
  },
} as const;
