import { HeroSection } from "../components/home/HeroSection";
import { GameRow } from "../components/home/GameRow";
import { BannerCarousel } from "../components/home/BannerCarousel";
import { GenreTiles } from "../components/home/GenreTiles";
import { useGames } from "../hooks/queries/useGames";

export function HomePage() {
  // Top-rated games power the cinematic rotating hero.
  const { data } = useGames({ sort: "rating", page: 1, pageSize: 8 });

  return (
    <div className="pb-20">
      <HeroSection featured={data?.items[0]} games={data?.items} />

      <div className="mt-6 space-y-4">
        {/* Carousel */}
        <GameRow
          eyebrow="Just landed"
          title="New Releases"
          filters={{ sort: "newest" }}
          viewAllTo="/games?sort=newest"
        />

        {/* Sliding spotlight banners */}
        <BannerCarousel eyebrow="In the spotlight" title="Featured Now" filters={{ sort: "rating" }} />

        {/* Genre tiles */}
        <GenreTiles />

        {/* Full grid */}
        <GameRow
          eyebrow="Curated"
          title="Top Rated"
          filters={{ sort: "rating" }}
          viewAllTo="/games?sort=rating"
          layout="grid"
        />

        {/* Carousels by genre */}
        <GameRow
          eyebrow="Adrenaline"
          title="Action Games"
          filters={{ genre: "Action", sort: "rating" }}
          viewAllTo="/games?genre=Action&sort=rating"
        />

        <GameRow
          eyebrow="Epic journeys"
          title="RPGs"
          filters={{ genre: "RPG", sort: "rating" }}
          viewAllTo="/games?genre=RPG&sort=rating"
        />

        {/* Second sliding banner set — adventure spotlights */}
        <BannerCarousel
          eyebrow="Worlds to explore"
          title="Adventure Awaits"
          filters={{ genre: "Adventure", sort: "rating" }}
        />

        <GameRow
          eyebrow="Lock and load"
          title="Shooters"
          filters={{ genre: "Shooter", sort: "rating" }}
          viewAllTo="/games?genre=Shooter&sort=rating"
        />

        {/* Full grid */}
        <GameRow
          eyebrow="Easy on the wallet"
          title="Best Value"
          filters={{ sort: "price_asc" }}
          viewAllTo="/games?sort=price_asc"
          layout="grid"
        />
      </div>
    </div>
  );
}
