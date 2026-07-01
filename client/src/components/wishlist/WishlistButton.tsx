import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { Game } from "../../types/game";
import { useAuthStore } from "../../store/authStore";
import { useWishlist } from "../../hooks/queries/useWishlist";
import { useToggleWishlist } from "../../hooks/mutations/useToggleWishlist";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 20.7 4.3 13C2.1 10.8 2.1 7.4 4.3 5.3a5 5 0 0 1 7.1 0l.6.6.6-.6a5 5 0 0 1 7.1 0c2.2 2.1 2.2 5.5 0 7.7L12 20.7Z" />
    </svg>
  );
}

interface WishlistButtonProps {
  game: Game;
  className?: string;
}

export function WishlistButton({ game, className = "" }: WishlistButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const { data } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const isWishlisted = (data?.items ?? []).some((item) => item.game.id === game.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleWishlist.mutate({ game, isWishlisted });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      whileTap={{ scale: 0.8 }}
      animate={{ scale: isWishlisted ? [1, 1.3, 1] : 1 }}
      transition={{ duration: 0.3 }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm ring-1 ring-white/10 transition-colors ${
        isWishlisted ? "text-rose-500" : "text-white hover:text-rose-400"
      } ${className}`}
    >
      <HeartIcon filled={isWishlisted} />
    </motion.button>
  );
}
