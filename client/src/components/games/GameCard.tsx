import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Game } from "../../types/game";
import { StarRating } from "./StarRating";
import { GamePrice } from "./GamePrice";
import { WishlistButton } from "../wishlist/WishlistButton";

export const gameCardItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <motion.div
      variants={gameCardItemVariants}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="surface surface-hover group overflow-hidden rounded-2xl"
    >
      <Link to={`/games/${game.slug}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elev)] via-transparent to-transparent" />
          <WishlistButton game={game} className="absolute right-2.5 top-2.5" />
          {game.genres[0] && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {game.genres[0]}
            </span>
          )}
        </div>

        <div className="space-y-2.5 p-4">
          <h3 className="truncate text-base font-semibold text-white">{game.title}</h3>

          <div className="flex flex-wrap gap-1.5">
            {game.genres.slice(1, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-zinc-400 ring-1 ring-white/5"
              >
                {genre}
              </span>
            ))}
          </div>

          <StarRating rating={game.avgRating} count={game.ratingCount} />

          <GamePrice priceOneTime={game.priceOneTime} priceMonthly={game.priceMonthly} />
        </div>
      </Link>
    </motion.div>
  );
}
