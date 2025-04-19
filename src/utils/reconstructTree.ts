import { EditableNode } from "../EditableNode.ts";

// Recursive type for the nested structure
export type ReconstructedNode = EditableNode | { [key: string]: ReconstructedNode };

/**
 * Reconstructs a nested tree structure from a flat map of proposed changes.
 * The keys in the input map are JSON-stringified paths.
 *
 * @param proposedChanges - A record where keys are stringified paths (e.g., '["path","to","key"]')
 *                          and values are the EditableNode objects { en: string, ja: string }.
 * @returns A nested object representing the tree structure of the proposed changes.
 */
export function reconstructTreeFromProposedChanges(
  proposedChanges: Record<string, EditableNode>
): ReconstructedNode { // Use the defined recursive type
  const reconstructedTree: { [key: string]: ReconstructedNode } = {}; // Start with the object part

  for (const [jsonPath, nodeValue] of Object.entries(proposedChanges)) {
    try {
      const pathSegments = JSON.parse(jsonPath) as string[];
      if (!Array.isArray(pathSegments)) {
        console.warn(`Skipping invalid path (not an array): ${jsonPath}`);
        continue;
      }

      // Need to type currentLevel carefully due to recursion
      let currentLevel: { [key: string]: ReconstructedNode } = reconstructedTree;

      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];

        if (i === pathSegments.length - 1) {
          // Last segment, assign the EditableNode value
          currentLevel[segment] = nodeValue;
        } else {
          // Not the last segment, ensure nested object exists
          const nextLevel = currentLevel[segment];

          if (
            nextLevel === undefined ||
            typeof nextLevel !== 'object' ||
            nextLevel === null ||
            ('en' in nextLevel || 'ja' in nextLevel) // Check if it's an EditableNode (leaf)
          ) {
             // Overwriting a leaf node with a branch or creating a new branch
             if (nextLevel !== undefined && ('en' in nextLevel || 'ja' in nextLevel)) {
                 console.warn(`Overwriting a leaf node at path segment '${segment}' in path ${jsonPath}`);
             }
            currentLevel[segment] = {};
          }
          // Type assertion needed because TS can't infer the structure change after the check/creation
          currentLevel = currentLevel[segment] as { [key: string]: ReconstructedNode };
        }
      }
    } catch (e) {
      console.error(`Failed to parse path string: ${jsonPath}`, e);
    }
  }

  return reconstructedTree;
}
