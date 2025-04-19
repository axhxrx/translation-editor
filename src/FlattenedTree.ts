export interface FlattenedTreeEntry<T> {
  keyPath: string[];
  value: T;
}

export class FlattenedTree<T> {
  private _entries: FlattenedTreeEntry<T>[] = [];
  private _keyMap: Map<string, number> = new Map();

  get entries(): readonly FlattenedTreeEntry<T>[] {
    return this._entries;
  }

  get keyMap(): Map<string, number> {
    return this._keyMap;
  }

  /**
   Add entry to the flattened tree. This method always succeeds..
   */
  addEntry(entry: FlattenedTreeEntry<T>) {
    const key = JSON.stringify(entry.keyPath);
    this._entries.push(entry);
    this._keyMap.set(key, this._entries.length - 1);
  }

  /**
   Remove entry from the flattened tree. Returns true if the entry was removed, false otherwise.
   */
  removeEntry(keyPath: string[]) {
    const key = JSON.stringify(keyPath);
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
  updateEntry(keyPath: string[], value: T) {
    const key = JSON.stringify(keyPath);
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

  constructor(
    content: Record<string, any> | FlattenedTreeEntry<T>[],
    private readonly valueDetectorFn?: (value: any) => T | undefined
  ) {
    const start = performance.now();

    // If the content is already an array of entries, use it directly (and update the key map), otherwise flatten the tree:
    if (Array.isArray(content)) {
      this._entries = content;
      this._keyMap = new Map(content.map(entry => [JSON.stringify(entry.keyPath), entry]));
    } else {
      this.flattenTree(content, [], valueDetectorFn);
    }

    const end = performance.now();
    this.metrics = {
      constructionTime: end - start,
    };
    console.log(`FlattenedTree constructor: ${end - start}ms`);
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
        this.addEntry({ keyPath: newKeyPath, value: detectedValue });
        continue;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        this.flattenTree(value, newKeyPath, valueDetectorFn);
      } else {
        this.addEntry({ keyPath: newKeyPath, value });
      }
    }
  }

  /**
   Filters the flattened tree based on the search query and return a new flattened tree. 
   */
  filter(query: string) {
    const lowerQuery = query.toLowerCase();
    const myEntries = this.entries.filter(entry => {
      const keyPathMatch = entry.keyPath.some(key => key.toLowerCase().includes(lowerQuery));
      if (keyPathMatch)
      {
        return true;
      }
      const entryValue = entry.value;
      if (typeof entryValue === 'string') {
        if (entryValue.toLowerCase().includes(lowerQuery)) {
          return true;
        }
      }
      if (typeof entryValue === 'object' && entryValue !== null) {
        const valueMatch = Object.values(entryValue).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
        );
        if (valueMatch) {
          return true;
        }
        const valueKeyMatch = Object.keys(entryValue).some(key =>
          typeof key === 'string' && key.toLowerCase().includes(lowerQuery)
        );
        if (valueKeyMatch) {
          return true;
        }
      }

      return false;
    });
    const newEntries = structuredClone(myEntries);
    return new FlattenedTree(newEntries, this.valueDetectorFn);
  }
}

import data from "./data.json" with {type: "json"};


interface EditableNode {
  en?: string;
  ja?: string;
  proposedEn?: string;
  proposedJa?: string;
}

function isValue(value: unknown): EditableNode | undefined {
  if (typeof value !== 'object') {
    return undefined;
  }
  if (value == null)
  {
    return undefined;
  }
  const objEntries = Object.entries(value);
  if (objEntries.length === 0)
  {
    return value as EditableNode
  }
  return objEntries.every(([key, val]) => typeof key === 'string' && typeof val === 'string')
    ? value as EditableNode
    : undefined;
}
// const data = {
//   foo: {
//     bar: {
//       baz: 1,
//       qux: 2,
//     }, 
//     quux: 3,
//   },

//   corge: {
//     grault: 4,
//     garply: {
//       waldo: 5,
//       fred: 6,
//     },
//     plugh: 7,
//     xyzzy: 8,
//   },
// };

const flattenedTree = new FlattenedTree(data, isValue);
console.log(flattenedTree, flattenedTree.entries);