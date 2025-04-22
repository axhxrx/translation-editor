/// <reference lib="deno.ns" />

import { assertEquals, assertThrows } from '@std/assert';
import { FlattenedTree, FlattenedTreeEntry } from '../src/FlattenedTree.ts';

// --- Test Data ---
const testArrayPath: string[] = ['foo', 'bar', 'baz'];
const testStringPath: string = JSON.stringify(testArrayPath);
const invalidStringPath = '["foo", "bar", 123]'; // Not all strings
const invalidJsonString = '{"a": 1}'; // Not an array
const nonJsonString = 'not json';

// --- Tests for normalizeKeyPathToArray ---
Deno.test('FlattenedTree.normalizeKeyPathToArray - array input', () =>
{
  assertEquals(FlattenedTree.normalizeKeyPathToArray(testArrayPath), testArrayPath);
});

Deno.test('FlattenedTree.normalizeKeyPathToArray - valid string input', () =>
{
  assertEquals(FlattenedTree.normalizeKeyPathToArray(testStringPath), testArrayPath);
});

Deno.test('FlattenedTree.normalizeKeyPathToArray - invalid string (non-string items)', () =>
{
  assertThrows(
    () => FlattenedTree.normalizeKeyPathToArray(invalidStringPath),
    Error,
    'Parsed JSON is not an array of strings.',
  );
});

Deno.test('FlattenedTree.normalizeKeyPathToArray - invalid string (not an array)', () =>
{
  assertThrows(
    () => FlattenedTree.normalizeKeyPathToArray(invalidJsonString),
    Error,
    'Parsed JSON is not an array of strings.',
  );
});

Deno.test('FlattenedTree.normalizeKeyPathToArray - invalid string (not JSON)', () =>
{
  assertThrows(
    () => FlattenedTree.normalizeKeyPathToArray(nonJsonString),
    Error, // Error message includes the original parsing error
    'Failed to parse keyPath string',
  );
});

// --- Tests for normalizeKeyPathToString ---
Deno.test('FlattenedTree.normalizeKeyPathToString - array input', () =>
{
  assertEquals(FlattenedTree.normalizeKeyPathToString(testArrayPath), testStringPath);
});

Deno.test('FlattenedTree.normalizeKeyPathToString - string input', () =>
{
  // Assumes string input is already correct, returns it directly
  assertEquals(FlattenedTree.normalizeKeyPathToString(testStringPath), testStringPath);
  assertEquals(FlattenedTree.normalizeKeyPathToString(invalidJsonString), invalidJsonString);
});

// --- Tests for FlattenedTreeEntry.keyPathString ---
Deno.test('FlattenedTreeEntry.keyPathString getter', () =>
{
  const entry = new FlattenedTreeEntry(testArrayPath, { en: 'hello' });
  assertEquals(entry.keyPathString, testStringPath);
});

// --- Tests for FlattenedTree.filter ---
const filterTestData = {
  greetings: {
    english: { en: 'Hello', ja: 'こんにちは' },
    french: { en: 'Bonjour', ja: 'ボンジュール' },
  },
  farewells: {
    english: { en: 'Goodbye', ja: 'さようなら' },
  },
};
const filterIsValue = (v: any) => (typeof v === 'object' && v !== null && ('en' in v || 'ja' in v)) ? v : undefined;

Deno.test("FlattenedTree.filter - mode 'text'", () =>
{
  const tree = new FlattenedTree(filterTestData, filterIsValue);

  // Test with query matching value
  const filteredHello = tree.filter({ mode: 'text', query: 'Hello' });
  assertEquals(filteredHello.entries.length, 1);
  assertEquals(filteredHello.entries[0].path, ['greetings', 'english']);

  // Test with query matching key path component
  const filteredEnglish = tree.filter({ mode: 'text', query: 'english' });
  assertEquals(filteredEnglish.entries.length, 2);
  const paths = filteredEnglish.entries.map(e => JSON.stringify(e.path));
  assertEquals(paths.includes(JSON.stringify(['greetings', 'english'])), true);
  assertEquals(paths.includes(JSON.stringify(['farewells', 'english'])), true);

  // Test with query matching nothing
  const filteredNothing = tree.filter({ mode: 'text', query: 'xyzzy' });
  assertEquals(filteredNothing.entries.length, 0);

  // Test with empty query (should return all)
  const filteredEmpty = tree.filter({ mode: 'text', query: '' });
  assertEquals(filteredEmpty.entries.length, tree.entries.length);
});

Deno.test("FlattenedTree.filter - mode 'all'", () =>
{
  const tree = new FlattenedTree(filterTestData, filterIsValue);
  const filteredAll = tree.filter({ mode: 'all' });
  assertEquals(filteredAll.entries.length, tree.entries.length);
  // Ensure it's a distinct instance but has same entries
  assertEquals(filteredAll.entries, tree.entries);
});

Deno.test("FlattenedTree.filter - mode 'keyPaths'", () =>
{
  const tree = new FlattenedTree(filterTestData, filterIsValue);
  const keyPath1 = ['greetings', 'english'];
  const keyPath2 = ['farewells', 'english'];
  const nonExistentPath = ['non', 'existent'];

  // Test with one key path
  const filteredOnePath = tree.filter({ mode: 'keyPaths', paths: [keyPath1] });
  assertEquals(filteredOnePath.entries.length, 1);
  assertEquals(filteredOnePath.entries[0].keyPathString, JSON.stringify(keyPath1));

  // Test with multiple key paths
  const filteredTwoPaths = tree.filter({ mode: 'keyPaths', paths: [keyPath1, keyPath2] });
  assertEquals(filteredTwoPaths.entries.length, 2);
  const resultPaths = filteredTwoPaths.entries.map(e => e.keyPathString);
  assertEquals(resultPaths.includes(JSON.stringify(keyPath1)), true);
  assertEquals(resultPaths.includes(JSON.stringify(keyPath2)), true);

  // Test with non-existent key path
  const filteredNonExistent = tree.filter({ mode: 'keyPaths', paths: [nonExistentPath] });
  assertEquals(filteredNonExistent.entries.length, 0);

  // Test with empty paths array
  const filteredEmptyPaths = tree.filter({ mode: 'keyPaths', paths: [] });
  assertEquals(filteredEmptyPaths.entries.length, 0);
});
