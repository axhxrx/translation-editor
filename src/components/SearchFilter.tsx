import { createSignal, createEffect, onCleanup } from "solid-js";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  debounceTime?: number;
}

export default function SearchFilter(props: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = createSignal(props.initialValue || "");
  const [debouncedQuery, setDebouncedQuery] = createSignal("");
  const debounceTime = props.debounceTime || 300;
  
  // Handle input changes
  const handleInputChange = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
  };
  
  // Debounce search query
  createEffect(() => {
    const query = searchQuery();
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
      props.onSearch(query);
    }, debounceTime);
    
    onCleanup(() => clearTimeout(timeout));
  });
  
  return (
    <div class="search-filter">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          value={searchQuery()} 
          onInput={handleInputChange} 
          placeholder={props.placeholder || "Search..."}
          class="search-input"
        />
        {searchQuery() && (
          <button 
            class="clear-button" 
            onClick={() => {
              setSearchQuery("");
              props.onSearch("");
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Future checkbox options will go here */}
      <div class="filter-options">
        {/* Checkbox filters will be added here */}
      </div>
    </div>
  );
}