import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays
 * in sync. Skipped under prefers-reduced-motion.
 *
 * The page grows after init as data/images/carousels load in, so we recompute
 * Lenis's scroll limit and ScrollTrigger's positions whenever the document
 * height changes — without this, smooth scroll clamps short of the real bottom.
 * (Requires body/#root to use min-height, not height; see index.css.)
 */
export function useLenisScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ smoothWheel: true });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    let rafId = 0;
    const recalc = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
    };

    // Recompute on any content-height change (async data, image decode, etc.).
    const resizeObserver = new ResizeObserver(recalc);
    resizeObserver.observe(document.body);
    window.addEventListener("load", recalc);
    // Safety net for late async content that lands after the first paints.
    const timers = [300, 1000, 2500].map((ms) => window.setTimeout(recalc, ms));

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("load", recalc);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);
}
