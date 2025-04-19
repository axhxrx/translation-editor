import { FilterCriteria } from "./FilterCriteria.ts";

/**
 * Represents a key path, which can be either an array of strings (canonical form)
 * or a JSON-stringified array of strings.
 */
export type KeyPath = string | string[];

/**
 * Represents a single entry in the flattened tree structure.
 * It holds the key path, the associated value, and potentially other metadata.
 */
export class FlattenedTreeEntry<T> {
  constructor(public path: string[], public value: T) {}

  /**
   * Returns the key path as a JSON-stringified string.
   * Useful for using the path as a key in objects or Maps.
   */
  get keyPathString(): string {
    return JSON.stringify(this.path);
  }
}

export class FlattenedTree<T> {
  private _entries: FlattenedTreeEntry<T>[] = [];
  private _keyMap: Map<string, number> = new Map();
  private originalEntries: FlattenedTreeEntry<T>[] = [];

  get entries(): readonly FlattenedTreeEntry<T>[] {
    return this._entries;
  }

  get keyMap(): Map<string, number> {
    return this._keyMap;
  }

  /**
   * Normalizes a KeyPath (string | string[]) to its canonical string[] form.
   * If the input is already string[], it's returned directly.
   * If the input is a string, it's parsed as JSON.
   * @param keyPath The key path to normalize.
   * @returns The normalized key path as string[].
   * @throws If the string input is not valid JSON or not an array of strings.
   */
  public static normalizeKeyPathToArray(keyPath: KeyPath): string[] {
    if (Array.isArray(keyPath)) {
      return keyPath;
    }
    if (typeof keyPath === 'string') {
      try {
        const parsed = JSON.parse(keyPath);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
          return parsed as string[];
        }
        throw new Error("Parsed JSON is not an array of strings.");
      } catch (error) {
        throw new Error(`Failed to parse keyPath string '${keyPath}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    // Should be unreachable given the type definition, but belts and suspenders:
    throw new Error('Invalid KeyPath type provided.');
  }

  /**
   * Normalizes a KeyPath (string | string[]) to its JSON string form.
   * If the input is already a string, it's assumed to be the correct format and returned directly.
   * If the input is string[], it's JSON-stringified.
   * @param keyPath The key path to normalize.
   * @returns The normalized key path as a JSON string.
   */
  public static normalizeKeyPathToString(keyPath: KeyPath): string {
    if (typeof keyPath === 'string') {
      // Assume string is already the correct JSON representation
      // We could add validation here if needed, but let's keep it simple for now.
      return keyPath;
    }
    if (Array.isArray(keyPath)) {
      return JSON.stringify(keyPath);
    }
    // Should be unreachable
    throw new Error('Invalid KeyPath type provided.');
  }

  /**
   Add entry to the flattened tree. This method always succeeds..
   */
  addEntry(entry: FlattenedTreeEntry<T>) {
    const key = entry.keyPathString;
    this._entries.push(entry);
    this._keyMap.set(key, this._entries.length - 1);
  }

  /**
   Remove entry from the flattened tree. Returns true if the entry was removed, false otherwise.
   */
  removeEntry(keyPath: KeyPath) {
    const key = FlattenedTree.normalizeKeyPathToString(keyPath);
    const index = this._keyMap.get(key);
    if (index !== undefined) {
      this._entries.splice(index, 1);
      this._keyMap.delete(key);
      return true;
    }
    return false;
  }

  /**
   Update entry in the flattened tree. Returns true if the entry was updated, false otherwise.
   */
  updateEntry(keyPath: KeyPath, value: T) {
    const key = FlattenedTree.normalizeKeyPathToString(keyPath);
    const index = this._keyMap.get(key);
    if (index !== undefined) {
      this._entries[index].value = value;
      return true;
    }
    return false;
  }

  metrics: {
    constructionTime: number;
  }

  /**
   * Constructor for FlattenedTree.
   * Either flattens the provided data object or initializes directly from provided entries.
   * @param data The nested data object to flatten (optional if initialEntries provided).
   * @param valueDetectorFn Predicate function to determine if a node is a leaf (optional if initialEntries provided).
   * @param initialEntries Optional array of entries to initialize the tree directly.
   */
  constructor(data?: Record<string, any>, valueDetectorFn?: (value: any) => T | undefined, initialEntries?: FlattenedTreeEntry<T>[]) {
    const start = performance.now();

    if (initialEntries) {
      // Initialize directly from entries
      this.setEntries(initialEntries); // Use setEntries to build map
      this.originalEntries = initialEntries; // Set originalEntries for consistency?
    } else if (data !== undefined && valueDetectorFn !== undefined) {
      // Flatten the data
      this.flattenTree(data, [], valueDetectorFn);
      this.originalEntries = [...this._entries]; // Store a copy of the initial entries
    } else if (initialEntries === undefined) {
      // Allow creating an empty tree explicitly if needed (e.g., for manual building)
      // Do nothing, _entries and _keyMap are already initialized as empty.
      this.originalEntries = []; 
    }
     else {
        throw new Error("FlattenedTree constructor requires either data and valueDetectorFn, or initialEntries.");
    }

    const end = performance.now();
    this.metrics = {
      constructionTime: end - start,
    };
    console.log(`FlattenedTree constructor: ${end - start}ms`);
  }

  private buildKeyMap() {
    this._keyMap.clear();
    this._entries.forEach((entry, index) => {
      this._keyMap.set(entry.keyPathString, index);
    });
  }

  private flattenTree(
    tree: Record<string, any>,
    keyPath: string[] = [],
    valueDetectorFn?: (value: any) => T | undefined
  ) {
    for (const [key, value] of Object.entries(tree)) {
      const newKeyPath = [...keyPath, key];
      const detectedValue = valueDetectorFn ? valueDetectorFn(value) : undefined;
      if (detectedValue !== undefined) {
        this.addEntry(new FlattenedTreeEntry(newKeyPath, detectedValue));
        continue;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        this.flattenTree(value, newKeyPath, valueDetectorFn);
      } else {
        this.addEntry(new FlattenedTreeEntry(newKeyPath, value));
      }
    }
  }

  /**
   * Retrieves entries based on a provided list of key paths.
   * @param paths An array of key paths (string[][]) to retrieve.
   * @returns An array of FlattenedTreeEntry<T> objects corresponding to the found paths.
   */
  public getEntriesByPaths(paths: string[][]): FlattenedTreeEntry<T>[] {
    const foundEntries: FlattenedTreeEntry<T>[] = [];
    for (const path of paths) {
      const keyString = JSON.stringify(path);
      const index = this._keyMap.get(keyString);
      if (index !== undefined) {
        const entry = this.originalEntries[index];
        if (entry) {
          foundEntries.push(entry);
        }
      }
    }
    return foundEntries;
  }

  /**
   * Manually sets the entries for this tree instance and rebuilds the internal key map.
   * Use with caution, intended for scenarios like creating a tree from combined filter results.
   * @param entries The array of FlattenedTreeEntry<T> to set.
   */
  public setEntries(entries: FlattenedTreeEntry<T>[]) {
    this._entries = [...entries]; // Use spread to ensure a new array reference
    this._keyMap.clear();
    this._entries.forEach((entry, index) => {
      this._keyMap.set(entry.keyPathString, index);
    });
    // Note: This does not update originalEntries. This method creates a potentially
    // modified view, not intended to replace the original source data structure.
  }

  /**
   * Creates a new FlattenedTree containing only the entries that match the given criteria.
   * @param criteria The filtering criteria (text query, key paths, etc.).
   * @returns A new FlattenedTree instance with the filtered entries.
   */
  public filter(criteria: FilterCriteria): FlattenedTree<T> {

    let filteredEntries: FlattenedTreeEntry<T>[];

    switch (criteria.mode) {
      case 'all':
        // Return all entries
        filteredEntries = [...this.originalEntries]; // Use original for full set
        break;

      case 'text':
      case 'combined': // Treat combined as text-only for now
        {
          const lowerQuery = criteria.query.toLowerCase();
          if (!lowerQuery) {
            // Empty query means show all
            filteredEntries = [...this.originalEntries];
          } else {
            filteredEntries = this.originalEntries.filter(entry => {
              // Check path components
              const keyPathMatch = entry.path.some(key => key.toLowerCase().includes(lowerQuery));
              if (keyPathMatch) return true;

              // Check value properties if it's an object
              if (typeof entry.value === 'object' && entry.value !== null) {
                for (const val of Object.values(entry.value)) {
                  if (typeof val === 'string' && val.toLowerCase().includes(lowerQuery)) {
                    return true;
                  }
                }
              }
              return false;
            });
          }
        }
        break;

      case 'keyPaths':
        {
          const pathSet = new Set(criteria.paths.map(p => JSON.stringify(p)));
          filteredEntries = this.originalEntries.filter(entry => pathSet.has(entry.keyPathString));
        }
        break;

      default:
        // Should be unreachable if FilterCriteria is exhaustive
        console.warn("Unhandled filter criteria mode:", criteria);
        filteredEntries = [...this.originalEntries]; // Return original if mode is unknown
        break;
    }

    // Create a new FlattenedTree instance with the filtered results
    // Pass undefined for data/valueDetectorFn, provide initialEntries
    return new FlattenedTree<T>(undefined, undefined, filteredEntries);
  }
}