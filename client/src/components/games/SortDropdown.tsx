import type { GamesSort } from "../../types/game";

const SORT_OPTIONS: { value: GamesSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "alphabetical", label: "A–Z" },
];

interface SortDropdownProps {
  value: GamesSort | undefined;
  onChange: (sort: GamesSort) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value ?? "newest"}
      onChange={(e) => onChange(e.target.value as GamesSort)}
      className="glass-soft cursor-pointer rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:bg-zinc-900"
      aria-label="Sort games"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
