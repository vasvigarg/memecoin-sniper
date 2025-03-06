import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.RPC_URL);

// Check if the token has liquidity
async function checkLiquidity(poolId) {
  const poolInfo = await connection.getParsedAccountInfo(new PublicKey(poolId));
  return poolInfo.value !== null;
}

export { checkLiquidity };
