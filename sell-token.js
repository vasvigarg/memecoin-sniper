import { Connection, Keypair } from "@solana/web3.js";
import { Liquidity, MAINNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.RPC_URL);
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY))
);

async function sellToken(poolId, tokenAmount) {
  try {
    console.log(`💰 Selling token: ${poolId}`);

    const poolKeys = await Liquidity.fetchPoolKeys({ connection, poolId });
    const tx = await Liquidity.makeSwapInstruction({
      connection,
      poolKeys,
      amountIn: tokenAmount,
      minAmountOut: 0,
      userKey: wallet.publicKey,
      programId: MAINNET_PROGRAM_ID,
    });

    await connection.sendTransaction(tx, [wallet]);
    console.log(`✅ Sold ${tokenAmount} tokens of ${poolId}`);
  } catch (error) {
    console.error(`❌ Sell failed: ${error.message}`);
  }
}

export default sellToken;
