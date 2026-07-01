import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGames } from "../hooks/queries/useGames";
import type { Game } from "../types/game";

/* One card in the fanned showcase, positioned by scroll progress. */
function ShowcaseCard({
  progress,
  index,
  count,
  game,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  game: Game;
}) {
  const center = (count - 1) / 2;
  const d = index - center;
  const isCentre = Math.round(d) === 0;

  const x = useTransform(progress, [0.1, 0.32, 0.8], [0, d * 200, d * 240]);
  const y = useTransform(progress, [0.1, 0.32], [120, Math.abs(d) * 36]);
  const rotate = useTransform(progress, [0.1, 0.32], [0, d * 8]);
  const scale = useTransform(progress, [0.1, 0.32], [0.6, 1.16 - Math.abs(d) * 0.08]);

  const art = game.screenshots?.[0] ?? game.coverUrl;

  return (
    <motion.div
      style={{ x, y, rotate, scale, zIndex: Math.round(20 - Math.abs(d)) }}
      className="absolute left-1/2 top-1/2 -ml-[110px] -mt-[150px]"
    >
      <div
        className={`relative h-[300px] w-[220px] overflow-hidden rounded-3xl ring-1 ring-white/10 ${
          isCentre ? "rgb-frame shadow-2xl shadow-black/60" : "shadow-xl shadow-black/50"
        }`}
      >
        <img src={art} alt={game.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          {isCentre && (
            <span className="mb-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
              Featured
            </span>
          )}
          <p className="truncate text-display text-sm font-semibold text-white">{game.title}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* A single full-screen text scene. Mounted/unmounted via AnimatePresence so
   only ONE is ever on screen — they can't overlap. */
function SceneText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -26 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`absolute left-1/2 top-1/2 z-30 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center ${className}`}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { title: "Own it forever", body: "Buy once and it's yours — no strings, no expiry." },
  { title: "Or subscribe", body: "Stream the latest releases monthly, cancel anytime." },
  { title: "Yours everywhere", body: "Your library and wishlist follow you across devices." },
];

// Step boundaries on scroll progress (0..1).
function stepFor(v: number): number {
  if (v >= 0.82) return 4; // outro
  if (v >= 0.62) return 3; // cards shine alone (no text)
  if (v >= 0.36) return 2; // features
  if (v >= 0.16) return 1; // showcase caption
  return 0; // intro
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const navigatedRef = useRef(false);

  const { data } = useGames({ sort: "rating", page: 1, pageSize: 5 });
  const cards = data?.items ?? [];

  const { scrollYProgress } = useScroll();
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(stepFor(v));
    if (v > 0.99 && !navigatedRef.current) {
      navigatedRef.current = true;
      navigate("/profile", { replace: true });
    }
  });

  // Cards: appear, hold at 100% across the whole middle, then fade before outro.
  const cardsOpacity = useTransform(scrollYProgress, [0.08, 0.18, 0.78, 0.88], [0, 1, 1, 0]);
  const cardsRotate = useTransform(scrollYProgress, [0.1, 0.8], [0, -14]);

  return (
    <div className="relative h-[620vh] bg-[#08080a]">
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-gradient-to-r from-violet-400 via-sky-400 to-fuchsia-400"
      />
      <button
        type="button"
        onClick={() => navigate("/profile", { replace: true })}
        className="fixed right-5 top-5 z-50 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-zinc-200 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20"
      >
        Skip
      </button>

      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 40% at 50% 28%, rgba(120,90,240,0.2), transparent 60%)," +
              "radial-gradient(40% 40% at 82% 88%, rgba(56,189,248,0.13), transparent 60%)," +
              "radial-gradient(35% 35% at 12% 80%, rgba(244,114,182,0.1), transparent 60%)",
          }}
        />

        {/* Card showcase */}
        <motion.div
          style={{ opacity: cardsOpacity, rotateY: cardsRotate, perspective: 1500 }}
          className="absolute inset-0 z-10"
        >
          {cards.map((g, i) => (
            <ShowcaseCard key={g.id} progress={scrollYProgress} index={i} count={cards.length} game={g} />
          ))}
        </motion.div>

        {/* Readability scrim: darkens only the centre (where text sits) while the
            outer cards stay bright. Shown only when text overlaps the cards. */}
        <AnimatePresence>
          {(step === 1 || step === 2 || step === 4) && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                background:
                  "radial-gradient(ellipse 58% 52% at 50% 50%, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.3) 45%, transparent 72%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Exactly one text scene at a time */}
        <AnimatePresence>
          {step === 0 && (
            <SceneText key="intro">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.4em] text-zinc-400">
                Welcome{user?.displayName ? `, ${user.displayName}` : ""}
              </p>
              <h1 className="text-display text-5xl font-bold uppercase leading-[0.95] text-white sm:text-7xl">
                {"Your library awaits".split(" ").map((w, i) => (
                  <motion.span
                    key={w}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.14, duration: 0.6, ease: "easeOut" }}
                    className="mr-3 inline-block"
                  >
                    {w}
                  </motion.span>
                ))}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-zinc-400">
                Hundreds of worlds, hand-picked for you. Take the scenic route in.
              </p>
            </SceneText>
          )}

          {step === 1 && (
            <SceneText key="caption" className="!top-auto bottom-24 !translate-y-0">
              <h2 className="text-display text-3xl font-bold text-white sm:text-5xl">
                A universe of games
              </h2>
              <p className="mt-2 text-zinc-400">Top-rated, trending, and timeless — all in one place.</p>
            </SceneText>
          )}

          {step === 2 && (
            <SceneText key="features">
              <h2 className="text-display mb-8 text-3xl font-bold text-white sm:text-5xl">
                Play your way
              </h2>
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
                    className="rounded-2xl border border-white/10 bg-black/70 p-5 text-left backdrop-blur-xl"
                  >
                    <h3 className="text-display text-lg font-semibold text-white">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-zinc-400">{f.body}</p>
                  </motion.div>
                ))}
              </div>
            </SceneText>
          )}

          {/* step 3: cards shine alone — no text */}

          {step === 4 && (
            <SceneText key="outro">
              <h2 className="text-display text-5xl font-bold uppercase text-white sm:text-7xl">
                You&apos;re all set
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-zinc-400">
                Your profile is ready. Let&apos;s get you playing.
              </p>
              <button
                type="button"
                onClick={() => navigate("/profile", { replace: true })}
                className="mt-7 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
              >
                Enter your profile →
              </button>
            </SceneText>
          )}
        </AnimatePresence>

        {/* Scroll hint — only during the intro */}
        <AnimatePresence>
          {step === 0 && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500"
            >
              <span className="text-[11px] uppercase tracking-[0.3em]">Scroll</span>
              <motion.span
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
