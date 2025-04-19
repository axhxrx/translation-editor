/**
 Represents the different ways the translation entries can be filtered.
 */
export type FilterCriteria =
  | { mode: 'all' } // Show all entries
  | { mode: 'text'; query: string } // Filter by text query
  | { mode: 'keyPaths'; paths: string[][] } // Filter by specific key paths
  | { mode: 'combined'; query: string; keyPaths: string[][] }; // Filter by text AND specific key paths
