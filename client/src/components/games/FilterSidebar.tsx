import type { GamesFilters } from "../../types/game";

const GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Shooter",
  "Puzzle",
  "Sports",
  "Racing",
  "Simulation",
  "Indie",
];

const PLATFORMS = ["PC", "PlayStation 5", "Xbox Series X", "Nintendo Switch", "macOS", "Linux"];

interface FilterSidebarProps {
  filters: GamesFilters;
  onChange: (patch: Partial<GamesFilters>) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  return (
    <aside className="surface h-fit w-full shrink-0 space-y-6 rounded-2xl p-5 lg:sticky lg:top-24 lg:w-72">
      <FilterSection title="Genre">
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Pill
              key={genre}
              label={genre}
              active={filters.genre === genre}
              onClick={() => onChange({ genre: filters.genre === genre ? undefined : genre })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Platform">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <Pill
              key={platform}
              label={platform}
              active={filters.platform === platform}
              onClick={() =>
                onChange({ platform: filters.platform === platform ? undefined : platform })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="glass-soft w-full rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <span className="text-zinc-500">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="glass-soft w-full rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">{title}</h3>
      {children}
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-white text-black shadow-sm"
          : "glass-soft text-zinc-300 hover:bg-zinc-200/15 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
