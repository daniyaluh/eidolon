import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useGameSearchSuggestions } from "../../hooks/queries/useGameSearchSuggestions";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(query, 300);
  const { data, isLoading } = useGameSearchSuggestions(debouncedQuery);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsOpen(false);
    navigate(`/games?search=${encodeURIComponent(query.trim())}`);
  }

  const showDropdown = isOpen && debouncedQuery.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search games..."
          data-cursor-hide
          className="w-full rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl transition placeholder:text-zinc-400 focus:border-white/30 focus:bg-white/[0.11] focus:outline-none focus:ring-2 focus:ring-white/15"
        />
      </form>

      {showDropdown && (
        <div className="glass absolute z-20 mt-2 w-full overflow-hidden rounded-xl p-1 shadow-xl">
          {isLoading && <div className="p-3 text-sm text-zinc-400">Searching...</div>}

          {!isLoading && data && data.items.length === 0 && (
            <div className="p-3 text-sm text-zinc-400">No matches found.</div>
          )}

          {!isLoading &&
            data?.items.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setQuery(game.title);
                  navigate(`/games/${game.slug}`);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-200/10"
              >
                <img src={game.coverUrl} alt="" className="h-8 w-12 rounded object-cover" />
                <span className="truncate">{game.title}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
