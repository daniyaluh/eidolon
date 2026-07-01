import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Game } from "../../types/game";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface HeroSectionProps {
  featured?: Game;
  games?: Game[];
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="m12 17.27 5.18 3.12-1.37-5.9 4.59-3.97-6.04-.52L12 4.5 9.64 9.99l-6.04.52 4.59 3.97-1.37 5.9z" />
    </svg>
  );
}

const ROTATE_MS = 6000;

// Reference-style stat card: dark frosted panel, content on top, a divider, and
// a "VIEW …" footer link.
function StatCard({
  label,
  children,
  to,
  action,
}: {
  label: string;
  children: React.ReactNode;
  to: string;
  action: string;
}) {
  return (
    <div className="rgb-frame group flex flex-col overflow-hidden rounded-2xl bg-black/80 backdrop-blur-2xl transition-colors duration-300 hover:bg-white">
      <div className="flex-1 px-4 pt-3.5 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-400 transition-colors duration-300 group-hover:text-zinc-500">
          {label}
        </p>
        <div className="mt-2.5">{children}</div>
      </div>
      <Link
        to={to}
        className="border-t border-white/10 px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 transition-colors duration-300 hover:text-zinc-900 group-hover:border-black/10 group-hover:text-zinc-600"
      >
        {action} →
      </Link>
    </div>
  );
}

export function HeroSection({ featured, games = [] }: HeroSectionProps) {
  const reduced = usePrefersReducedMotion();

  const slides = (games.length > 0 ? games : featured ? [featured] : []).slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (reduced || paused || slides.length <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused, slides.length, reduced]);

  const active = slides[index];
  const backgroundImage = active?.screenshots?.[0] ?? active?.coverUrl;
  const trending = games.filter((g) => g.id !== active?.id).slice(0, 3);

  const title = active?.title ?? "Your next obsession";
  const words = title.split(" ");

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: 0.05 } },
  };
  const word = reduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
      };

  return (
    <section
      className="relative mx-auto mt-3 min-h-[86vh] max-w-[1800px] overflow-hidden rounded-[2rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cinematic art — crossfades between slides */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {backgroundImage && (
            <motion.img
              key={active?.id ?? "fallback"}
              src={backgroundImage}
              alt=""
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.8 }, scale: { duration: 6, ease: "easeOut" } }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
      </div>

      <div className="relative flex min-h-[86vh] w-full flex-col justify-between px-6 py-10 sm:px-10 sm:py-14">
        <div key={active?.id ?? "x"} className="max-w-3xl pt-10">
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400"
          >
            Most played
          </motion.p>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-display mt-4 text-5xl font-bold uppercase leading-[0.92] text-white sm:text-7xl xl:text-8xl"
          >
            {words.map((w, i) => (
              <motion.span key={`${w}-${i}`} variants={word} className="mr-4 inline-block">
                {w}
              </motion.span>
            ))}
          </motion.h1>

          {active?.genres && active.genres.length > 0 && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {active.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="glass-soft rounded-full px-3 py-1 text-xs font-medium text-zinc-200"
                >
                  {g}
                </span>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-8 flex items-center gap-3"
          >
            <Link
              to={active ? `/games/${active.slug}` : "/games"}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition hover:bg-zinc-200 active:scale-95"
            >
              <PlayIcon />
              {active ? "View game" : "Explore"}
            </Link>
            <Link
              to="/games"
              className="glass-soft inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Browse store
            </Link>

            {slides.length > 1 && (
              <div className="ml-2 flex items-center gap-2">
                {slides.map((s, i) => (
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
            )}
          </motion.div>
        </div>

        {/* Reference-style stat cards: three separate dark panels with footer links */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Pricing — two stats side by side */}
          <StatCard label="Pricing" to={active ? `/games/${active.slug}` : "/games"} action="View game">
            <div className="flex items-stretch gap-6">
              <div>
                <p className="text-display text-3xl font-bold text-white transition-colors duration-300 group-hover:text-zinc-900">
                  {active?.priceOneTime != null ? `$${active.priceOneTime.toFixed(2)}` : "—"}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">One-time</p>
              </div>
              <div className="w-px bg-white/10 transition-colors duration-300 group-hover:bg-black/10" />
              <div>
                <p className="text-display text-3xl font-bold text-white transition-colors duration-300 group-hover:text-zinc-900">
                  {active?.priceMonthly != null ? `$${active.priceMonthly.toFixed(2)}` : "—"}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Monthly</p>
              </div>
            </div>
          </StatCard>

          {/* Rating */}
          <StatCard label="Rated" to={active ? `/games/${active.slug}` : "/games"} action="Read reviews">
            <div className="flex items-center gap-3">
              <span className="text-display text-4xl font-bold text-white transition-colors duration-300 group-hover:text-zinc-900">
                {active ? active.avgRating.toFixed(2) : "4.8"}
              </span>
              <div>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(active?.avgRating ?? 5)
                          ? "text-amber-400"
                          : "text-zinc-600 group-hover:text-zinc-300"
                      }
                    >
                      <StarIcon />
                    </span>
                  ))}
                </span>
                <p className="mt-1 text-xs text-zinc-400 transition-colors duration-300 group-hover:text-zinc-600">
                  {active ? `${active.ratingCount.toLocaleString()} ratings` : "Acclaimed"}
                </p>
              </div>
            </div>
          </StatCard>

          {/* Trending — small thumbnails */}
          <StatCard label="Trending" to="/games" action="Browse all">
            <div className="flex items-center gap-2.5">
              {trending.length > 0
                ? trending.map((g) => (
                    <Link
                      key={g.id}
                      to={`/games/${g.slug}`}
                      className="group h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10"
                      title={g.title}
                    >
                      <img
                        src={g.coverUrl}
                        alt={g.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    </Link>
                  ))
                : [0, 1, 2].map((i) => <div key={i} className="h-12 w-12 rounded-lg bg-white/5" />)}
            </div>
          </StatCard>
        </motion.div>
      </div>
    </section>
  );
}
