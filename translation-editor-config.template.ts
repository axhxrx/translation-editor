export interface TranslationEditorConfig
{
  apiUrl: string;
  // Add other configuration options as needed
  debugMode?: boolean;
  // etc...
}

export const TRANSLATION_EDITOR_CONFIG = {
  apiUrl: 'http://localhost:8000/create-pr',
  debugMode: true,
} as const;
