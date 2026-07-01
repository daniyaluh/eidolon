import { syncRawgGames } from "../services/rawgSync.service";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("[sync:games] starting RAWG sync...");
  const result = await syncRawgGames();
  console.log(
    `[sync:games] done. pages=${result.pagesFetched} synced=${result.gamesSynced} failed=${result.gamesFailed}`
  );
}

main()
  .catch((err) => {
    console.error("[sync:games] fatal error:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
