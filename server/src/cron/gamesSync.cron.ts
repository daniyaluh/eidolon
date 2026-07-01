import cron from "node-cron";
import { syncRawgGames } from "../services/rawgSync.service";

const EVERY_12_HOURS = "0 */12 * * *";

export function scheduleGamesSync() {
  cron.schedule(EVERY_12_HOURS, async () => {
    console.log("[gamesSyncCron] running scheduled RAWG sync...");
    try {
      const result = await syncRawgGames();
      console.log(
        `[gamesSyncCron] done. synced=${result.gamesSynced} failed=${result.gamesFailed}`
      );
    } catch (err) {
      console.error("[gamesSyncCron] sync failed:", (err as Error).message);
    }
  });

  console.log("[gamesSyncCron] scheduled to run every 12 hours");
}
