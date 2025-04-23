import { createEffect, createMemo, createResource, createSignal, For, Show } from 'solid-js';
import { StatusBar } from '../components/StatusBar.tsx';
import TranslationEditor from '../components/TranslationEditor.tsx';
import { FilterCriteria } from '../FilterCriteria.ts';

import data from '../data.json' with { type: 'json' };
import revision from '../revision.json' with { type: 'json' };

import { loadConfig } from '../../translation-editor-config-manager.ts';
import PullRequestDetails from '../components/PullRequestDetails.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import { EditableNode, isEditableNode } from '../EditableNode.ts';
import { FlattenedTree, FlattenedTreeEntry } from '../FlattenedTree.ts';
import { randomInitialSearchValue } from '../randomInitialSearchValue.ts';
import { reconstructTreeFromProposedChanges } from '../utils/reconstructTree.ts'; // Import the utility

const config = await loadConfig();
const _apiUrl = config.apiUrl;
const apiUrl = typeof _apiUrl === 'string' ? _apiUrl : _apiUrl();
const appIdentifier = config.appIdentifier;

const kProposedChanges = `${appIdentifier}.proposedChanges`;
const kSearchQuery = `${appIdentifier}.searchQuery`;
const DEFAULT_QUERY = 'loading...ɓuᴉpɐoʅ...loading...ɓuᴉpɐoʅ';

export default function Home()
{
  const [authenticationResult] = createResource(
    config.authConfig.authenticate,
  );

  createEffect(() =>
  {
    const authResult = authenticationResult();

    // If we have a result and it's not authenticated (i.e., not a success)
    if (authResult && !config.authConfig.isAuthenticated(authResult))
    {
      // I think we have to move async operation into a separate function that's called from the effect but isn't part of the effect's reactivity tracking (per LLM advice haha)
      (async () =>
      {
        await config.authConfig.handleAuthenticationFailure(authResult);
        // FIXME: @masonmark 2025-04-23: Right now we just assume the above method has redirected somewhere else to log in. Since this app has all its data built into the app, there is not much we can do here. The data edited by this app is presumed to be public data, so this is a usability issue, not a security issue. If the handleAuthenticationFailure() method does not redirect, then we should probably show an error message, or something, but it is not a high priority at this early stage.
      })();
    }
  });
  /**
   The FlattenedTree instance lives as long as the app. It has all the translations that are built into the app. But we can use it to filter entries based on the search query; filter() returns a new FlattenedTree instance, so we need to keep a reference to this one around for the life of the app.
   */
  const flattenedTree = new FlattenedTree(data, isEditableNode);

  /**
   The proposed changes are persisted to localStorage, and we load them on app startup. So initialize the signal to an empty set of changes. We'll update it after loading.
   */
  const [proposedChanges, setProposedChanges] = createSignal<
    Record<string, EditableNode>
  >({});

  /**
   Search query in the box
   */
  const [searchQuery, setSearchQuery] = createSignal(DEFAULT_QUERY);

  /**
   A signal to track loading state, which is used to prevent rendering before we've loaded the proposed changes from localStorage.
   */
  const [loading, setLoading] = createSignal(true);

  /**
   * State to track the current application mode: 'edit' or 'finalize'.
   */
  const [appMode, setAppMode] = createSignal<'edit' | 'finalize'>('edit');

  /**
   Initialize filteredTree with the initial text filter state
   */
  const [filteredTree, setFilteredTree] = createSignal<
    FlattenedTree<EditableNode>
  >(
    flattenedTree.filter({ mode: 'text', query: DEFAULT_QUERY }), // Use the master tree to filter initially
  );

  /**
   * Calculates the total number of proposed changes.
   */
  const totalChanges = createMemo(() =>
  {
    return Object.keys(proposedChanges()).length;
  });

  /**
   * Calculates the number of proposed changes currently visible in the filtered view.
   */
  const shownChanges = createMemo(() =>
  {
    const currentProposed = proposedChanges();
    const currentFiltered = filteredTree();
    if (!currentFiltered) return 0; // Handle initial state or errors

    return currentFiltered.entries.filter((entry) =>
      Object.prototype.hasOwnProperty.call(currentProposed, entry.keyPathString)
    ).length;
  });

  /**
   This effect is the main "app loading" logic, which prevents rendering before we've initialized everything we need (namely, proposed changes from localstorage)
   */
  createEffect(() =>
  {
    setLoading(true);
    // Load initial state from localStorage on mount (client-side)
    const initialProposedChanges = localStorage.getItem(kProposedChanges) || '{}';
    const storedQuery = localStorage.getItem(kSearchQuery) || DEFAULT_QUERY;
    setSearchQuery(storedQuery === DEFAULT_QUERY ? randomInitialSearchValue : storedQuery);

    try
    {
      const parsedInitialProposedChanges = JSON.parse(initialProposedChanges);
      setProposedChanges(parsedInitialProposedChanges);
      console.log(
        'INITIAL PROPOSED CHANGES (loaded client-side)',
        parsedInitialProposedChanges,
      );
    }
    catch (e)
    {
      console.error(
        'Failed to parse proposed changes from localStorage! Nuking bogus data, therefore.',
        e,
      );
      localStorage.removeItem(kProposedChanges);
    }
    finally
    {
      setLoading(false);
    }

    /**
     Persists the proposed changes to local storage, whenever they are updated. This needs to be nested or have a dependency on proposedChanges() to re-run when changes occur.
     */
    createEffect(() =>
    {
      // Prevent saving during initial load if proposedChanges hasn't been set yet
      if (loading())
      {
        return;
      }
      const jsonRep = JSON.stringify(proposedChanges());
      localStorage.setItem(kProposedChanges, jsonRep);
      console.log('PROPOSED CHANGES (saved to localStorage)', jsonRep);

      localStorage.setItem(kSearchQuery, searchQuery());
    });
  });

  /**
   Derived signal for proposed paths (string[][])
   */
  const proposedPathsSignal = createMemo(() =>
  {
    const proposed = proposedChanges();
    const pathsJson = Object.keys(proposed);
    try
    {
      return pathsJson.map((jsonPath) => JSON.parse(jsonPath) as string[]);
    }
    catch (e)
    {
      console.error('Failed to parse proposed paths for signal:', e);
      return [];
    }
  });

  /**
   Handler for search query changes propagated by the SearchFilter component.
   */
  const handleCriteriaChange = (criteria: FilterCriteria) =>
  {
    console.log('Handling Criteria Change:', criteria);

    let finalFilteredTree: FlattenedTree<EditableNode>;

    if (criteria.mode === 'combined')
    {
      const { query, keyPaths } = criteria;
      const uniqueEntriesMap = new Map<
        string,
        FlattenedTreeEntry<EditableNode>
      >();

      // 1. Perform text filter on original data
      const textFilteredResults = flattenedTree.filter({
        mode: 'text',
        query: query,
      });
      textFilteredResults.entries.forEach((entry) => uniqueEntriesMap.set(entry.keyPathString, entry));
      console.log(`Text filter ('${query}') found:`, uniqueEntriesMap.size);

      // 2. Perform keyPaths filter on original data
      // Avoid filtering if keyPaths is empty to prevent showing all entries unintentionally
      if (keyPaths && keyPaths.length > 0)
      {
        const keyPathFilteredResults = flattenedTree.filter({
          mode: 'keyPaths',
          paths: keyPaths,
        });
        console.log(
          `KeyPaths filter found:`,
          keyPathFilteredResults.entries.length,
        );
        // 3. Merge into map (duplicates handled by Map overwrite)
        keyPathFilteredResults.entries.forEach((entry) => uniqueEntriesMap.set(entry.keyPathString, entry));
      }
      else
      {
        console.log(
          'No keyPaths provided for combined filter, skipping keyPath filtering.',
        );
      }

      const finalEntries = Array.from(uniqueEntriesMap.values());
      console.log('Final combined entries count:', finalEntries.length);

      // 4. Create new FlattenedTree instance with combined entries
      finalFilteredTree = new FlattenedTree<EditableNode>(
        undefined,
        undefined,
        finalEntries,
      );
    }
    else if (criteria.mode === 'all')
    {
      // Filter directly from the master tree
      finalFilteredTree = flattenedTree.filter({ mode: 'all' });
      console.log(
        "Final 'all' entries count:",
        finalFilteredTree.entries.length,
      );
    }
    else if (criteria.mode === 'text')
    {
      // Filter directly from the master tree
      finalFilteredTree = flattenedTree.filter({
        mode: 'text',
        query: criteria.query,
      });
      console.log(
        `Final 'text' ('${criteria.query}') entries count:`,
        finalFilteredTree.entries.length,
      );
    }
    else if (criteria.mode === 'keyPaths')
    {
      // Filter directly from the master tree
      finalFilteredTree = flattenedTree.filter({
        mode: 'keyPaths',
        paths: criteria.paths,
      });
      console.log(`Final 'keyPaths' count:`, finalFilteredTree.entries.length);
    }
    else
    {
      // Fallback or handle unexpected criteria mode
      console.warn('Unexpected criteria mode, showing all:', criteria);
      finalFilteredTree = flattenedTree.filter({ mode: 'all' });
    }

    setFilteredTree(finalFilteredTree); // Update the signal with the new tree instance
    if (criteria.mode === 'text' || criteria.mode === 'combined')
    {
      setSearchQuery(criteria.query);
    }
  };

  /**
   Handles proposed changes to a translation entry. This parent component is responsible for persisting the changes.
   */
  const handleProposedChange = (keyPath: string[], node: EditableNode) =>
  {
    // Update the entry's proposed values
    console.log('HANDLE PROPOSED CHANGE', keyPath, node);
    const jsonKeyPath = JSON.stringify(keyPath);

    if (node.en === undefined && node.ja === undefined)
    {
      // If both are undefined, remove the key from the state
      setProposedChanges((prev) =>
      {
        const { [jsonKeyPath]: _, ...next } = prev; // Destructure the key to remove it
        return next; // Return the new object without the key
      });
    }
    else
    {
      // Otherwise, add or update the key
      setProposedChanges((prev) => ({
        ...prev,
        [jsonKeyPath]: node,
      }));
    }
  };

  // New handler function for PR creation
  const handleCreatePr = async (title: string, description: string) =>
  {
    console.log('Attempting to create PR...');
    console.log('Title:', title);
    console.log('Description:', description);

    const currentProposed = proposedChanges();
    if (Object.keys(currentProposed).length === 0)
    {
      console.warn('No proposed changes to submit.');
      alert('There are no proposed changes to submit.');
      return;
    }

    let reconstructedTree;
    try
    {
      reconstructedTree = reconstructTreeFromProposedChanges(currentProposed);
      console.log('Reconstructed Tree for Submission:', reconstructedTree);
    }
    catch (error)
    {
      console.error('Error reconstructing tree:', error);
      alert(
        `An error occurred while preparing the changes: ${error instanceof Error ? error.message : String(error)}`,
      );
      return; // Stop execution if tree reconstruction fails
    }

    // Construct the final payload
    const payload = {
      githubOrg: revision.githubOrg,
      repoName: revision.repoName,
      baseBranch: revision.baseBranch,
      prTitle: title,
      prBody: description,
      proposedChanges: reconstructedTree, // Use the reconstructed tree directly
    };

    try
    {
      console.log('Sending POST request to:', apiUrl);
      console.log('Payload:', JSON.stringify(payload, null, 2)); // Log the payload being sent

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok)
      {
        const responseData = await response.json(); // Or response.text() if it's not JSON
        console.log('API Success Response:', responseData);
        alert('SUCCESS: PR creation request sent successfully!');
        // Optionally clear proposed changes or redirect here
      }
      else
      {
        // Handle HTTP errors (e.g., 4xx, 5xx)
        let errorDetails = `Server responded with status: ${response.status}`;
        try
        {
          const errorData = await response.text(); // Try to get more details from body
          errorDetails += ` - ${errorData}`;
        }
        catch (_e)
        {
          // Ignore if reading error body fails
        }
        console.error('API Error Response:', errorDetails);
        alert(`Error creating PR: ${errorDetails}`);
      }
    }
    catch (error)
    {
      // Handle network errors or other fetch issues
      console.error('Network or fetch error:', error);
      alert(
        `Failed to send request to API: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <main class='container mx-auto px-4 py-8'>
      {/* Wrap content in Show based on loading state */}
      <Show when={!loading()} fallback={<div>Loading editor state...</div>}>
        <h1 class='text-2xl font-bold mb-4'>SORACOM Translation Editor</h1>

        {/* Mode-dependent UI */}
        <Show when={appMode() === 'edit'}>
          {/* Search/Filter Component (Edit Mode Only) */}
          <SearchFilter
            initialValue={searchQuery()} // Use the initial value
            onCriteriaChange={handleCriteriaChange}
            proposedKeyPaths={proposedPathsSignal} // Pass the signal accessor, not the invoked value
          />
        </Show>
        <Show when={appMode() === 'finalize'}>
          {/* Pull Request Details Form (Finalize Mode Only) */}
          <PullRequestDetails
            onCancel={() =>
            {
              setAppMode('edit');
              // Reset filter to show all entries
              handleCriteriaChange({ mode: 'text', query: searchQuery() });
            }}
            onSubmit={handleCreatePr} // Pass the handler
          />
        </Show>

        {/* Status Bar (Always Visible) */}
        <StatusBar totalChanges={totalChanges} shownChanges={shownChanges} />

        {/* Button to switch to Finalize Mode */}
        <Show
          when={appMode() === 'edit' && Object.keys(proposedChanges()).length > 0}
        >
          <div class='mt-4 text-right'>
            {/* Align button to the right */}
            <button
              type='button'
              onClick={() =>
              {
                setAppMode('finalize');
                // Update filter to show only proposed changes
                handleCriteriaChange({
                  mode: 'keyPaths',
                  paths: proposedPathsSignal(),
                });
              }}
              class='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              Finalize {Object.keys(proposedChanges()).length} Change(s)...
            </button>
          </div>
        </Show>

        {/* Translation Editor (Always Visible, content filtered by filteredTree) */}
        <For each={filteredTree().entries}>
          {(entry) => (
            <TranslationEditor
              entry={entry}
              onProposedChange={handleProposedChange}
              initialProposedChanges={proposedChanges()}
            />
          )}
        </For>
      </Show>
      <hr />
      <p style='text-align: center; font-size: xx-small;'>
        &copy;2025 Kludge-O-Matic&trade;
      </p>
    </main>
  );
}
