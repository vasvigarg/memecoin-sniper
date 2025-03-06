import { Connection } from "@solana/web3.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.RPC_URL);
const RAYDIUM_POOLS_URL =
  "https://api.raydium.io/v2/sdk/liquidity/mainnet.json";

let cachedPools = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

async function getNewPools() {
  const now = Date.now();

  if (cachedPools && now - lastFetchTime < CACHE_DURATION) {
    console.log("♻️ Using cached pools (to prevent rate limits)");
    return cachedPools;
  }

  console.log("🔍 Fetching new token pools from Raydium...");

  try {
    const response = await fetch(RAYDIUM_POOLS_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const pools = await response.json();
    console.log(`✅ Successfully fetched ${Object.keys(pools).length} pools`);

    let newTokens = [];
    for (const pool of Object.values(pools)) {
      if (pool.baseMint === "So11111111111111111111111111111111111111112") {
        console.log(`🆕 New token detected: ${pool.lpMint}`);
        newTokens.push(pool.lpMint);
      }
    }

    cachedPools = newTokens;
    lastFetchTime = now;
    return newTokens;
  } catch (error) {
    console.error("❌ Error fetching pools:", error.message);
    return [];
  }
}

export default getNewPools;
