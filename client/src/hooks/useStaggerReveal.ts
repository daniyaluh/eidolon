import { useEffect, useRef } from "react";
import type { DependencyList } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade + upward-translate reveal of a container's direct children, staggered as
 * the container scrolls into view. No-op under prefers-reduced-motion (children
 * render in their final state). Pass the data length in `deps` so it re-runs
 * once content has loaded.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(deps: DependencyList = []) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || el.children.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
