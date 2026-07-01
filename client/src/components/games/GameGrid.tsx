import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Game } from "../../types/game";
import { GameCard } from "./GameCard";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

interface GameGridProps {
  games: Game[];
}

export function GameGrid({ games }: GameGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Reduced motion: reveal everything immediately, no scroll trigger.
    if (reduced) {
      setIsInView(true);
      return;
    }
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 85%",
      once: true,
      onEnter: () => setIsInView(true),
    });

    return () => trigger.kill();
  }, [games, reduced]);

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </motion.div>
  );
}
