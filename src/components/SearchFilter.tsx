import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js';
import { FilterCriteria } from '../FilterCriteria.ts';

interface SearchFilterProps
{
  onCriteriaChange: (criteria: FilterCriteria) => void;
  initialValue?: string;
  placeholder?: string;
  debounceTime?: number;
  proposedKeyPaths?: Accessor<string[][]>;
}

export default function SearchFilter(props: SearchFilterProps)
{
  const [searchQuery, setSearchQuery] = createSignal(props.initialValue || '');
  const [debouncedQuery, setDebouncedQuery] = createSignal(props.initialValue || '');
  const [includeProposedPaths, setIncludeProposedPaths] = createSignal(false);
  const debounceTime = props.debounceTime || 300;

  const emitCriteria = () =>
  {
    const query = debouncedQuery();
    const include = includeProposedPaths();
    const paths = props.proposedKeyPaths ? props.proposedKeyPaths() : [];
    const hasPaths = paths && paths.length > 0;

    let criteria: FilterCriteria;

    if (query && include && hasPaths)
    {
      criteria = { mode: 'combined', query: query, keyPaths: paths };
    }
    else if (query)
    {
      criteria = { mode: 'text', query: query };
    }
    else if (include && hasPaths)
    {
      criteria = { mode: 'keyPaths', paths: paths };
    }
    else
    {
      criteria = { mode: 'all' };
    }

    props.onCriteriaChange(criteria);
  };

  const handleInputChange = (e: InputEvent) =>
  {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
  };

  createEffect(() =>
  {
    const query = searchQuery();
    const timeout = setTimeout(() =>
    {
      setDebouncedQuery(query);
      emitCriteria();
    }, debounceTime);

    onCleanup(() => clearTimeout(timeout));
  });

  const handleCheckboxChange = (e: Event) =>
  {
    const target = e.target as HTMLInputElement;
    setIncludeProposedPaths(target.checked);
    emitCriteria();
  };

  return (
    <div class='search-filter'>
      <div class='search-input-wrapper'>
        <input
          type='text'
          value={searchQuery()}
          onInput={handleInputChange}
          placeholder={props.placeholder || 'Search...'}
          class='search-input'
        />
        {searchQuery() && (
          <button
            type='button'
            class='clear-button'
            onClick={() =>
            {
              setSearchQuery('');
              setIncludeProposedPaths(false);
              setDebouncedQuery('');
              props.onCriteriaChange({ mode: 'all' });
            }}
            aria-label='Clear search'
          >
            ×
          </button>
        )}
      </div>

      <div class='filter-options' style={{ 'margin-top': '10px' }}>
        <label style={{ display: 'flex', 'align-items': 'center' }}>
          <input
            type='checkbox'
            id='includeProposed'
            checked={includeProposedPaths()}
            onChange={handleCheckboxChange}
          />
          Also show proposed changes
        </label>
      </div>
    </div>
  );
}
