import { createEffect, createSignal, For, createMemo } from "solid-js";
import { Title } from "@solidjs/meta";
import TranslationEditor from "~/components/TranslationEditor";
import { StatusBar } from "~/components/StatusBar";
import { FilterCriteria } from "~/FilterCriteria.ts";

import data from "../data.json";
import { FlattenedTree, FlattenedTreeEntry } from "~/FlattenedTree";
import SearchFilter from "~/components/SearchFilter";
import { randomInitialSearchValue } from "~/randomInitialSearchValue";
import { EditableNode, isEditableNode } from "~/EditableNode";

const kProposedChanges = 'io.soracom.translation-editor.proposedChanges';

export default function Home() {
  /**
   The FlattendTree instance lives as long as the app. But we can use it to filter entries based on the search query.
   */
  const flattenedTree = new FlattenedTree(data, isEditableNode);

  // Extract top-level keys for filter options
  const topLevelKeys = Object.keys(data);

  // Initialize signal as empty first
  const [proposedChanges, setProposedChanges] = createSignal<Record<string, EditableNode>>({});

  // Load from localStorage and persist back ONLY on the client
  createEffect(() => {
    // Load initial state from localStorage on mount (client-side)
    const initialProposedChanges = localStorage.getItem(kProposedChanges) || "{}";
    try {
      const parsedInitialProposedChanges = JSON.parse(initialProposedChanges);
      console.log('INITIAL PROPOSED CHANGES (loaded client-side)', parsedInitialProposedChanges);
      setProposedChanges(parsedInitialProposedChanges);
    } catch (e) {
      console.error("Failed to parse proposed changes from localStorage", e);
      // Optionally clear invalid data
      // localStorage.removeItem(kProposedChanges);
    }

    // Persists the proposed changes to local storage, whenever they are updated.
    // This needs to be nested or have a dependency on proposedChanges()
    // to re-run when changes occur.
    createEffect(() => {
      const jsonRep = JSON.stringify(proposedChanges());
      console.log('PROPOSED CHANGES (saving client-side)', jsonRep);
      localStorage.setItem(kProposedChanges, jsonRep);
    });
  });

  // Derived signal for proposed paths (string[][])
  const proposedPathsSignal = createMemo(() => {
    const proposed = proposedChanges();
    const pathsJson = Object.keys(proposed);
    try {
      return pathsJson.map(jsonPath => JSON.parse(jsonPath) as string[]);
    } catch (e) {
      console.error("Failed to parse proposed paths for signal:", e);
      return [];
    }
  });

  // Initialize filteredTree with the initial text filter state
  const [filteredTree, setFilteredTree] = createSignal<FlattenedTree<EditableNode>>(
    flattenedTree.filter({ mode: 'text', query: randomInitialSearchValue }) // Use the master tree to filter initially
  );

  /**
   The current search query.
   */
  const [searchQuery, setSearchQuery] = createSignal(randomInitialSearchValue);
  
  /**
   Handler for search query changes propagated by the SearchFilter component.
   */
  const handleCriteriaChange = (criteria: FilterCriteria) => {
    console.log("Handling Criteria Change:", criteria);

    // Update search query display
    if (criteria.mode === 'text' || criteria.mode === 'combined') {
      setSearchQuery(criteria.query);
    } else if (criteria.mode === 'all') {
      setSearchQuery("");
    }

    let finalFilteredTree: FlattenedTree<EditableNode>;

    if (criteria.mode === 'combined') {
      const { query, keyPaths } = criteria;
      const uniqueEntriesMap = new Map<string, FlattenedTreeEntry<EditableNode>>();

      // 1. Perform text filter on original data
      const textFilteredResults = flattenedTree.filter({ mode: 'text', query: query });
      textFilteredResults.entries.forEach(entry => uniqueEntriesMap.set(entry.keyPathString, entry));
      console.log(`Text filter ('${query}') found:`, uniqueEntriesMap.size);

      // 2. Perform keyPaths filter on original data
      // Avoid filtering if keyPaths is empty to prevent showing all entries unintentionally
      if (keyPaths && keyPaths.length > 0) {
        const keyPathFilteredResults = flattenedTree.filter({ mode: 'keyPaths', paths: keyPaths });
        console.log(`KeyPaths filter found:`, keyPathFilteredResults.entries.length);
        // 3. Merge into map (duplicates handled by Map overwrite)
        keyPathFilteredResults.entries.forEach(entry => uniqueEntriesMap.set(entry.keyPathString, entry));
      } else {
         console.log("No keyPaths provided for combined filter, skipping keyPath filtering.");
      }

      const finalEntries = Array.from(uniqueEntriesMap.values());
      console.log("Final combined entries count:", finalEntries.length);

      // 4. Create new FlattenedTree instance with combined entries
      finalFilteredTree = new FlattenedTree<EditableNode>(undefined, undefined, finalEntries);

    } else if (criteria.mode === 'all') {
      // Filter directly from the master tree
      finalFilteredTree = flattenedTree.filter({ mode: 'all' });
      console.log("Final 'all' entries count:", finalFilteredTree.entries.length);
    } else if (criteria.mode === 'text') {
      // Filter directly from the master tree
      finalFilteredTree = flattenedTree.filter({ mode: 'text', query: criteria.query });
      console.log(`Final 'text' ('${criteria.query}') entries count:`, finalFilteredTree.entries.length);
    } else if (criteria.mode === 'keyPaths') {
       // Filter directly from the master tree
      finalFilteredTree = flattenedTree.filter({ mode: 'keyPaths', paths: criteria.paths });
      console.log(`Final 'keyPaths' count:`, finalFilteredTree.entries.length);
    } else {
       // Fallback or handle unexpected criteria mode
       console.warn("Unexpected criteria mode, showing all:", criteria);
       finalFilteredTree = flattenedTree.filter({ mode: 'all' });
    }

    setFilteredTree(finalFilteredTree); // Update the signal with the new tree instance

  };

  /**
   Handles proposed changes to a translation entry. This parent component is responsible for persisting the changes.
   */
  const handleProposedChange = (keyPath: string[], node: EditableNode) => {
    // Update the entry's proposed values
    console.log('HANDLE PROPOSED CHANGE', keyPath, node);
    const jsonKeyPath = JSON.stringify(keyPath);

    if (node.en === undefined && node.ja === undefined) {
      // If both are undefined, remove the key from the state
      setProposedChanges(prev => {
        const { [jsonKeyPath]: _, ...next } = prev; // Destructure the key to remove it
        return next; // Return the new object without the key
      });
    } else {
      // Otherwise, add or update the key
      setProposedChanges(prev => ({
        ...prev,
        [jsonKeyPath]: node,
      }));
    }
  };

  return (
    <main>
      <StatusBar filteredTree={filteredTree} proposedChanges={proposedChanges} />
      <SearchFilter
        initialValue={randomInitialSearchValue}
        onCriteriaChange={handleCriteriaChange}
        proposedKeyPaths={proposedPathsSignal} // Pass the derived signal
      />

        <For each={filteredTree().entries}>
          {(entry) => <TranslationEditor entry={entry} onProposedChange={handleProposedChange} initialProposedChanges={proposedChanges()} />}
        </For>
    </main>
  );
}
