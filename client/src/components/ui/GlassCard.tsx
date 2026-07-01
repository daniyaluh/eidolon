import { useRef } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Disable the cursor-follow specular highlight. */
  spotlight?: boolean;
  className?: string;
}

/**
 * Apple-style "liquid glass" surface. A soft specular highlight tracks the
 * pointer across the card (via CSS custom properties), so the glass appears to
 * catch and bend light as you move over it.
 */
export function GlassCard({
  children,
  spotlight = true,
  className = "",
  ...rest
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!spotlight) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`glass relative overflow-hidden ${spotlight ? "glass-spot" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
