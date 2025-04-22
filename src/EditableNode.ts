/**
 In the context of this app, an `EditableNode` is an object that contains translation strings for different languages. The keys of the object are language codes (e.g., "en" for English, "ja" for Japanese), and the values are the corresponding translations. The `proposedEn` and `proposedJa` properties are optional and can be used to store proposed translations in English and Japanese, respectively.

 Someday it might support more languages and be more generic, but for now it just supports the 2 languages I need.
 */
export interface EditableNode
{
  en?: string;
  ja?: string;
  proposedEn?: string;
  proposedJa?: string;
}

/**
 This is a value-detector function, not a user-defined type guard. It returns an `EditableNode` if the JSON unknown value is an object with only string properties. Otherwise, it returns undefined.
 */
export function isEditableNode(value: unknown): EditableNode | undefined
{
  if (typeof value !== 'object')
  {
    return undefined;
  }
  if (value == null)
  {
    return undefined;
  }
  const objEntries = Object.entries(value);
  if (objEntries.length === 0)
  {
    return value as EditableNode;
  }
  return objEntries.every(([key, val]) => typeof key === 'string' && typeof val === 'string')
    ? value as EditableNode
    : undefined;
}
