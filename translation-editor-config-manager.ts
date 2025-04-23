export interface TranslationEditorConfig {
  /**
   The API URL to which the translation editor will send requests. These are expected to be handled by [pr-maker](https://github.com/axhxrx/pr-maker) or equivalent.
   This URL can be a string or a function that returns a string. The function can be used to dynamically generate the URL based on certain conditions, such as the environment (development, production, etc.), or just to use the real API unless the app is running on localhost, or whatever.
   */
  apiUrl: string | (() => string);

  /**
   Used as a localStorage prefix, you probably should use a reverse-domain identifier for a domain you control, e.g. `com.example.app.translation-editor`.
   */
  appIdentifier: string;

  /**
   A rudimentary extension for arbitrary authentication mechanism. 
   */
  authConfig?: {
    /**
     An optional user-supplied function to attempt to authenticate. This function must return some kind of result object that can be passed to the `isAuthenticated` function to determine if authentication was successful.
     */
    authenticate: () => Promise<unknown>;

    /**
     The result of your `authenticate` function will be passed to this function to determine if authentication was successful. 
     */
    isAuthenticated: (authenticateResult: unknown) => boolean;

    /**
     If you have supplied an authConfig, then the result of `authenticate()` will be passed to this method when `isAuthenticated()` returns false.
     */
    handleAuthenticationFailure: (authenticateResult: unknown) => Promise<void>;
  };
}

import { TRANSLATION_EDITOR_CONFIG } from './translation-editor-config.template.ts';

// This error message will be shown if the config file is missing
const CONFIG_MISSING_ERROR = `
ERROR: Translation Editor configuration file is missing.

Please create a 'translation-editor-config.ts' file in the
root directory of this project, next to the existing
'translation-editor-config.template.ts' file. Use that file
as a starting point, and areference for what the config should
look like.

Example:
  cp translation-editor-config.template.ts translation-editor-config.ts
  
Then edit the new translation-editor-config.ts file with your
specific configuration values.
`;

export async function loadConfig(): Promise<Required<TranslationEditorConfig>> {
  try {
    // Dynamic import of the user's config file
    const userConfig = await import('./translation-editor-config.ts');

    if (!userConfig.TRANSLATION_EDITOR_CONFIG) {
      throw new Error('Invalid configuration format');
    }

    // Merge with defaults to ensure all required fields exist
    const mergedConfig = {
      ...TRANSLATION_EDITOR_CONFIG,
      ...userConfig.TRANSLATION_EDITOR_CONFIG,
    };

    if (!mergedConfig) {
      throw new Error('Invalid configuration format');
    }

    return mergedConfig;
  } catch (error) {
    // Display a clear error message in the console
    console.error(CONFIG_MISSING_ERROR);

    throw error;
  }
}
