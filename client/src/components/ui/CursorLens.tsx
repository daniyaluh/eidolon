import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ helpers */

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Smooth Hermite interpolation between two edges (0 below `a`, 1 above `b`).
function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Builds an EDGE-RING displacement field as a data-URL image.
 *
 * Each pixel encodes a displacement vector in its R (x) and G (y) channels
 * (128 = "no displacement"). Unlike a full lens, the magnitude is ~zero across
 * the whole centre and rises only in a soft ring near the rim, then fades back
 * to zero at the very edge. Fed to feDisplacementMap (at low strength) this just
 * gently bends colours AROUND the edge — the UI appears to wrap the droplet rim
 * — while the centre stays calm and transparent. No zoom, no flooding.
 */
function buildEdgeRingMap(size = 320): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const c = (size - 1) / 2;
  const radius = size / 2;

  // Soft ring: a narrow Gaussian band sitting close to the rim.
  const RING_POS = 0.8; // where the bending concentrates (0 centre → 1 rim)
  const RING_WIDTH = 0.13; // softness of the band

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const r = Math.hypot(dx, dy);
      const rn = r / radius; // 0 at centre → 1 at rim

      let nx = 0;
      let ny = 0;
      if (rn < 1 && r > 0.0001) {
        // Edge ring: strongest bending near the rim.
        const ring = Math.exp(-((rn - RING_POS) ** 2) / (2 * RING_WIDTH * RING_WIDTH)) * 0.85;
        // Gentle full-disc lens so the centre area isn't dead-flat (still 0 at
        // the exact centre, soft through the middle).
        const disc = Math.sin(rn * Math.PI) * 0.32;
        // Fade out right at the rim so the edge dissolves into the page.
        const falloff = (ring + disc) * smoothstep(1.0, 0.92, rn);
        // Subtle inward pull → colours wrap softly around the edge / magnify.
        nx = (-dx / r) * falloff;
        ny = (-dy / r) * falloff;
      }

      const i = (y * size + x) * 4;
      img.data[i] = Math.round(128 + nx * 127); // R = x displacement
      img.data[i + 1] = Math.round(128 + ny * 127); // G = y displacement
      img.data[i + 2] = 128; // B unused
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/* ----------------------------------------------------------------- component */

/**
 * A living liquid-glass droplet that hovers over the UI and refracts what's
 * beneath it. Position is governed by a spring (mass, inertia, gentle
 * follow-through); the bead stretches along its travel and eases back to round;
 * the refraction strength glides — nothing snaps.
 */
export function CursorLens() {
  const elRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<SVGFEImageElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = elRef.current;
    if (!el) return;

    // Inject the precomputed edge-ring field.
    const map = buildEdgeRingMap();
    imageRef.current?.setAttribute("href", map);
    imageRef.current?.setAttribute("xlink:href", map);

    // ---- spring + deformation state ----
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let vx = 0; // spring velocity
    let vy = 0;
    let sx = 1; // current stretch
    let sy = 1;
    let bend = 7.2; // current refraction strength (kept low + subtle)
    let bendTarget = 7.2;
    let raf = 0;

    // Spring constants — soft and well-damped: slow mass that gently catches up.
    const STIFFNESS = 0.042;
    const DAMPING = 0.84;
    const MAX_STRETCH = 0.12; // keep elastic deformation subtle

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      const node = e.target as HTMLElement | null;
      // Over text inputs / the search bar: hide the bead so it never covers
      // the characters being typed.
      if (node?.closest("input, textarea, [data-cursor-hide]")) {
        el!.style.opacity = "0";
        return;
      }
      const interactive = node?.closest("a, button, select, [role='button']");
      el!.style.opacity = "1";
      el!.style.width = interactive ? "44px" : "32px";
      el!.style.height = interactive ? "44px" : "32px";
      bendTarget = interactive ? 9.6 : 7.2;
    }
    function onLeave() {
      el!.style.opacity = "0";
    }

    function frame() {
      // --- position: soft, well-damped spring (gentle mass, slow catch-up) ---
      const ax = (targetX - x) * STIFFNESS;
      const ay = (targetY - y) * STIFFNESS;
      vx = (vx + ax) * DAMPING;
      vy = (vy + ay) * DAMPING;
      x += vx;
      y += vy;

      // --- shape: SUBTLE axis-aligned stretch from velocity (no rotation, so
      //     the specular highlight never swings/jumps), eased back to round ---
      const speed = Math.hypot(vx, vy);
      const ex = clamp(Math.abs(vx) * 0.011, 0, MAX_STRETCH);
      const ey = clamp(Math.abs(vy) * 0.011, 0, MAX_STRETCH);
      const tsx = 1 + ex - ey * 0.55; // wider when moving horizontally
      const tsy = 1 + ey - ex * 0.55; // taller when moving vertically
      sx += (tsx - sx) * 0.12;
      sy += (tsy - sy) * 0.12;

      // --- refraction strength: low base + a tiny motion bump, eased ---
      const bendDynamic = bendTarget + clamp(speed * 0.15, 0, 3);
      bend += (bendDynamic - bend) * 0.06;
      dispRef.current?.setAttribute("scale", bend.toFixed(2));

      const half = el!.offsetWidth / 2 || 19;
      el!.style.transform =
        `translate3d(${x - half}px, ${y - half}px, 0) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

      raf = requestAnimationFrame(frame);
    }
    frame();

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter
          id="droplet"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Edge-ring lens field */}
          <feImage ref={imageRef} result="mapRaw" preserveAspectRatio="none" />
          {/* Blur the FIELD heavily so displacement varies smoothly (kills the
              8-bit stair-stepping) — this keeps the bend smooth... */}
          <feGaussianBlur in="mapRaw" stdDeviation="1.4" result="map" />
          {/* ...while the displaced CONTENT itself stays crisp (only a hair of
              output blur), so the refraction reads high-res, not washed out. */}
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="map"
            scale="7.2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="lens"
          />
          <feGaussianBlur in="lens" stdDeviation="0.15" />
        </filter>
      </svg>
      <div ref={elRef} aria-hidden className="cursor-lens" style={{ opacity: 0 }} />
    </>
  );
}
