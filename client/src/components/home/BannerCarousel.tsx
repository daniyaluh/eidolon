import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { GamesFilters } from "../../types/game";
import { useGames } from "../../hooks/queries/useGames";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface BannerCarouselProps {
  eyebrow?: string;
  title: string;
  filters: Partial<Omit<GamesFilters, "page" | "pageSize">>;
}

const ROTATE_MS = 4000;

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A wide, auto-sliding banner carousel of game spotlights. */
export function BannerCarousel({ eyebrow, title, filters }: BannerCarouselProps) {
  const reduced = usePrefersReducedMotion();
  const { data, isLoading } = useGames({ page: 1, pageSize: 6, ...filters });
  const items = data?.items ?? [];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index >= items.length && items.length > 0) setIndex(0);
  }, [items.length, index]);

  useEffect(() => {
    if (reduced || paused || items.length <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused, items.length, reduced]);

  if (!isLoading && items.length === 0) return null;

  const active = items[index];
  const art = active?.screenshots?.[0] ?? active?.coverUrl;

  function go(dir: 1 | -1) {
    setIndex((i) => (i + dir + items.length) % items.length);
  }

  return (
    <section className="mx-auto max-w-[1800px] px-4 py-6">
      <div className="mb-5">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</p>
        )}
        <h2 className="text-display mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      </div>

      <div
        className="relative h-[320px] overflow-hidden rounded-[1.75rem] sm:h-[400px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-white/[0.04]" />
        ) : (
          <>
            <AnimatePresence>
              <motion.img
                key={active?.id}
                src={art}
                alt=""
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.6 }, scale: { duration: 5, ease: "easeOut" } }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            <div key={active?.id} className="relative flex h-full flex-col justify-end gap-3 p-7 sm:p-10">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  {active?.genres.slice(0, 3).map((g) => (
                    <span key={g} className="glass-soft rounded-full px-3 py-1 text-xs text-zinc-200">
                      {g}
                    </span>
                  ))}
                </div>
                <h3 className="text-display max-w-2xl text-3xl font-bold uppercase leading-[0.95] text-white sm:text-5xl">
                  {active?.title}
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to={active ? `/games/${active.slug}` : "/games"}
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
                  >
                    View game
                  </Link>
                  {active?.priceOneTime != null && (
                    <span className="text-display text-xl font-semibold text-white">
                      ${active.priceOneTime.toFixed(2)}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => go(-1)}
                  className="glass-soft absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:bg-white/20"
                >
                  <Arrow dir="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => go(1)}
                  className="glass-soft absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:bg-white/20"
                >
                  <Arrow dir="right" />
                </button>
                <div className="absolute bottom-5 right-7 flex gap-2">
                  {items.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Show ${s.title}`}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? "w-7 bg-white" : "w-3 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
