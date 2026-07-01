import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ScreenshotCarouselProps {
  trailerUrl: string | null;
  screenshots: string[];
  title: string;
}

export function ScreenshotCarousel({ trailerUrl, screenshots, title }: ScreenshotCarouselProps) {
  const slides = [...(trailerUrl ? [{ type: "trailer" as const, src: trailerUrl }] : []), ...screenshots.map((src) => ({ type: "image" as const, src }))];

  const [index, setIndex] = useState(0);

  if (slides.length === 0) {
    return <div className="aspect-video w-full rounded-xl bg-zinc-800" />;
  }

  const current = slides[index];

  function go(delta: number) {
    setIndex((prev) => (prev + delta + slides.length) % slides.length);
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {current.type === "trailer" ? (
            <video src={current.src} controls className="h-full w-full object-cover" />
          ) : (
            <img src={current.src} alt={`${title} screenshot`} className="h-full w-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-6 rounded-full ${i === index ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
