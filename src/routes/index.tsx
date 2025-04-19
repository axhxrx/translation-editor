import { createEffect, createSignal, For } from "solid-js"
import { Title } from "@solidjs/meta";
import TranslationEditor from "~/components/TranslationEditor";

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

  const initialProposedChanges = localStorage.getItem(kProposedChanges) || "{}";

  const parsedInitialProposedChanges = JSON.parse(initialProposedChanges);
  console.log('INITIAL PROPOSED CHANGES', parsedInitialProposedChanges);
  
  const [proposedChanges, setProposedChanges] = createSignal<Record<string, EditableNode>>(
    parsedInitialProposedChanges
  );

  createEffect(() => {
    const jsonRep = JSON.stringify(proposedChanges());
    console.log('PROPOSED CHANGES', jsonRep);
    localStorage.setItem(kProposedChanges, jsonRep);
    
  });

  /**
   The entries, filtered by the search query.
   */
  const [filteredTree, setFilteredTree] = createSignal<FlattenedTree<EditableNode>>(flattenedTree.filter(randomInitialSearchValue));

  /**
   The current search query.
   */
  const [searchQuery, setSearchQuery] = createSignal(randomInitialSearchValue);
  
  /**
   Handler for search query changes propagated by the SearchFilter component.
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Just handle the filtering here:
    const filteredTree = flattenedTree.filter(query);
    setFilteredTree(filteredTree);
  };

  const handleProposedChange = (keyPath: string[], node: EditableNode) => {
    // Update the entry's proposed values
    console.log('HANDLE PROPOSED CHANGE', keyPath, node);
    const jsonKeyPath = JSON.stringify(keyPath);
    setProposedChanges(prev => ({
      ...prev,
      [jsonKeyPath]: node,
    }));
  };

  return (
    <main>
      <Title>DADBOD.LOCALIZE</Title>
      <h1>Welcome to DADBOD.LOCALIZE</h1>
      <p>Sign up now for $2/year!</p>
      
      <SearchFilter initialValue={randomInitialSearchValue} onSearch={handleSearch} />

        <For each={filteredTree().entries}>
          {(entry) => <TranslationEditor entry={entry} onProposedChange={handleProposedChange} initialProposedChanges={proposedChanges()} />}
        </For>
    </main>
  );
}
