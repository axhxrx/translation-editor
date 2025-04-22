import { Accessor } from 'solid-js';
import { EditableNode } from '../EditableNode.ts';
import { FlattenedTree } from '../FlattenedTree.ts';

interface StatusBarProps
{
  filteredTree: Accessor<FlattenedTree<EditableNode>>;
  proposedChanges: Accessor<Record<string, EditableNode>>;
}

export const StatusBar = (props: StatusBarProps) =>
{
  // TODO: Display more stats and add action buttons
  return <p>Changes: {Object.keys(props.proposedChanges()).length}</p>;
};
