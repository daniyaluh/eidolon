import { useLenisScroll } from "../../hooks/useLenisScroll";

/** Initializes global Lenis smooth scrolling. Renders nothing. */
export function SmoothScroll() {
  useLenisScroll();
  return null;
}
