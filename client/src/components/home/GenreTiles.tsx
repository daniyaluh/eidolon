import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useGames } from "../../hooks/queries/useGames";

const GENRES: { name: string; accent: string }[] = [
  { name: "Action", accent: "from-rose-500/40" },
  { name: "RPG", accent: "from-violet-500/40" },
  { name: "Shooter", accent: "from-red-500/40" },
  { name: "Adventure", accent: "from-emerald-500/40" },
  { name: "Strategy", accent: "from-sky-500/40" },
  { name: "Puzzle", accent: "from-fuchsia-500/40" },
  { name: "Racing", accent: "from-amber-500/40" },
  { name: "Indie", accent: "from-teal-500/40" },
];

function GenreTile({
  name,
  accent,
  cover,
}: {
  name: string;
  accent: string;
  cover?: string;
}) {
  // Per-genre count (and a fallback cover for rare genres not in the pool).
  const { data, isLoading } = useGames({ genre: name, sort: "rating", page: 1, pageSize: 1 });
  const fallback = data?.items[0]?.screenshots?.[0] ?? data?.items[0]?.coverUrl;
  const art = cover ?? fallback;
  const count = data?.total ?? 0;

  return (
    <Link
      to={`/games?genre=${encodeURIComponent(name)}&sort=rating`}
      className="group relative h-40 overflow-hidden rounded-2xl ring-1 ring-white/10 transition duration-300 hover:ring-white/25"
    >
      {art ? (
        <img
          src={art}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 ease-out group-hover:scale-110 group-hover:opacity-80"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${accent} to-transparent opacity-25 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-60`}
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <div>
          <h3 className="text-display text-xl font-semibold leading-none text-white">{name}</h3>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-300/70">
            {isLoading ? "—" : `${count} ${count === 1 ? "game" : "games"}`}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm text-white ring-1 ring-white/20 backdrop-blur-sm transition duration-300 group-hover:bg-white group-hover:text-black">
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}

export function GenreTiles() {
  // One shared pool of top games, then hand each genre a DISTINCT game it
  // belongs to (claim-and-dedupe) so no two tiles show the same art even though
  // RAWG games span multiple genres.
  const { data: pool } = useGames({ sort: "rating", page: 1, pageSize: 60 });

  const covers = useMemo(() => {
    const claimed = new Set<string>();
    const map: Record<string, string | undefined> = {};
    for (const g of GENRES) {
      const match = pool?.items.find(
        (item) => !claimed.has(item.id) && item.genres.includes(g.name)
      );
      if (match) {
        claimed.add(match.id);
        map[g.name] = match.screenshots?.[0] ?? match.coverUrl;
      }
    }
    return map;
  }, [pool]);

  return (
    <section className="mx-auto max-w-[1800px] px-4 py-6">
      <div className="mb-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">Explore</p>
        <h2 className="text-display mt-1 text-2xl font-bold text-white sm:text-3xl">
          Browse by genre
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {GENRES.map((g) => (
          <GenreTile key={g.name} name={g.name} accent={g.accent} cover={covers[g.name]} />
        ))}
      </div>
    </section>
  );
}
