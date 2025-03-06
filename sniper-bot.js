import getNewPools from "./monitor-pools.js";
import buyToken from "./buy-token.js";
import sellToken from "./sell-token.js";
import { checkLiquidity } from "./utils.js";

let isRunning = false; // Prevent duplicate execution

async function sniperBot() {
  if (isRunning) {
    console.log("⚠️ Bot is already running, skipping this cycle...");
    return;
  }

  isRunning = true;
  console.log("\n🚀 Sniper Bot Started!");
  console.log("🔍 Fetching new token pools from Raydium...");

  try {
    const newPools = await getNewPools();
    console.log(`✅ Found ${newPools.length} new pools`);

    for (const pool of newPools) {
      console.log(`🔎 Checking liquidity for: ${pool}`);

      try {
        if (await checkLiquidity(pool)) {
          console.log(`🎯 Sniping: ${pool}`);

          const buyTx = await buyToken(pool, 0.5);
          console.log(`💰 Bought 0.5 SOL worth of ${pool}. TX: ${buyTx}`);

          console.log("⏳ Waiting 30 seconds before selling...");
          setTimeout(async () => {
            try {
              const sellTx = await sellToken(pool, 50_000_000);
              console.log(`💸 Sold 50M tokens from ${pool}. TX: ${sellTx}`);
            } catch (sellError) {
              console.error(`❌ Sell failed for ${pool}:`, sellError);
            }
          }, 30000);
        } else {
          console.log(`❌ Skipping ${pool}, low liquidity`);
        }
      } catch (liquidityError) {
        console.error(
          `⚠️ Error checking liquidity for ${pool}:`,
          liquidityError
        );
      }
    }
  } catch (fetchError) {
    console.error(
      "❌ Error fetching new pools or processing transactions:",
      fetchError
    );
  }

  isRunning = false; // Allow next cycle to start
}

// Run every 60 seconds
setInterval(sniperBot, 60000);
