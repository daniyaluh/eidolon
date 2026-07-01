import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Magnetic hover: the element drifts toward the cursor while hovered, then
 * springs back on leave. Disabled under prefers-reduced-motion.
 */
export function useMagnetic(strength = 0.4) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });

  function onMouseMove(e: MouseEvent) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * strength);
    y.set(offsetY * strength);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { ref, style: { x, y }, onMouseMove, onMouseLeave };
}
