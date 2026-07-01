import { useState } from "react";
import { motion } from "framer-motion";

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-3xl",
} as const;

interface StarRatingProps {
  /** Display value (read-only mode). */
  rating?: number;
  /** Selected value (interactive mode). */
  value?: number;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: keyof typeof SIZE_CLASSES;
}

export function StarRating({
  rating = 0,
  value = 0,
  count,
  interactive = false,
  onChange,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sizeClass = SIZE_CLASSES[size];

  if (!interactive) {
    const rounded = Math.round(rating);
    return (
      <div
        className={`flex items-center gap-1 text-amber-400 ${sizeClass}`}
        aria-label={`Rated ${rating} out of 5`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rounded ? "opacity-100" : "opacity-25"}>
            ★
          </span>
        ))}
        {count !== undefined && <span className="ml-1 text-xs text-zinc-400">({count})</span>}
      </div>
    );
  }

  const activeValue = hovered ?? value;

  return (
    <div className={`flex items-center gap-1 ${sizeClass}`} role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= activeValue;
        return (
          <motion.button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: value === starValue && !hovered ? 1.1 : 1 }}
            className={`${isActive ? "text-amber-400" : "text-zinc-600"} leading-none`}
          >
            ★
          </motion.button>
        );
      })}
    </div>
  );
}
