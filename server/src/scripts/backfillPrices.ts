import { prisma } from "../lib/prisma";
import { derivePrices } from "../lib/pricing";
import { invalidateGamesListCache } from "../utils/cache";

async function main() {
  // Price every game that isn't already priced. The MongoDB connector treats an
  // unset optional as absent (not null), so we filter in JS rather than the DB.
  const games = await prisma.game.findMany();
  const unpriced = games.filter((g) => g.priceOneTime == null);
  console.log(`[backfillPrices] pricing ${unpriced.length} of ${games.length} games...`);

  let updated = 0;
  for (const game of unpriced) {
    const prices = derivePrices(game.avgRating);
    await prisma.game.update({ where: { id: game.id }, data: prices });
    updated++;
  }

  await invalidateGamesListCache();
  console.log(`[backfillPrices] done. updated=${updated}`);
}

main()
  .catch((err) => {
    console.error("[backfillPrices] error:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
