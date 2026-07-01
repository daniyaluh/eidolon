import { useCallback, useEffect, useRef } from "react";

const BOTTOM_THRESHOLD = 80;

/**
 * Auto-scrolls a container to the bottom when its dependency changes, but only
 * if the user is already near the bottom — so scrolling up to read history is
 * not interrupted by new messages.
 */
export function useChatAutoScroll<T>(dep: T) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedToBottom = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedToBottom.current = distanceFromBottom <= BOTTOM_THRESHOLD;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !pinnedToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [dep]);

  return { containerRef, handleScroll };
}
