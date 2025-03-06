import getNewPools from "./monitor-pools.js";
import buyToken from "./buy-token.js";
import sellToken from "./sell-token.js";
import { checkLiquidity } from "./utils.js";

let isRunning = false;

async function sniperBot() {
  if (isRunning) {
    console.log("⚠️ Bot is already running, skipping this cycle...");
    return;
  }

  isRunning = true; // Lock execution
  console.log("\n🚀 Sniper Bot Started!");
  console.log("🔍 Fetching new token pools...");

  try {
    const newPools = await getNewPools();
    console.log(`✅ Found ${newPools.length} new pools`);

    for (const pool of newPools) {
      console.log(`🔎 Checking liquidity for: ${pool}`);
      if (await checkLiquidity(pool)) {
        console.log(`🎯 Sniping: ${pool}`);

        try {
          const buyTx = await buyToken(pool, 0.5); // Buy with 0.5 SOL
          console.log(`💰 Successfully bought from pool ${pool}. TX: ${buyTx}`);
        } catch (error) {
          console.error(`❌ Buy failed for ${pool}:`, error);
          continue;
        }

        console.log(`⏳ Waiting 30 seconds before selling...`);
        setTimeout(async () => {
          try {
            const sellTx = await sellToken(pool, 50_000_000);
            console.log(`💸 Sold 50M tokens from ${pool}. TX: ${sellTx}`);
          } catch (error) {
            console.error(`❌ Sell failed for ${pool}:`, error);
          }
        }, 30000);
      } else {
        console.log(`❌ Skipping ${pool}, low liquidity`);
      }
    }
  } catch (error) {
    console.error(
      "❌ Error fetching new pools or processing transactions:",
      error
    );
  }

  isRunning = false; // Unlock execution
}

// Run bot every 60 seconds
setInterval(sniperBot, 60000);
