import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Liquidity, MAINNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.RPC_URL);
const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
const wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

async function buyToken(poolId, amountInSol) {
  try {
    console.log(`🔫 Sniping token: ${poolId}`);

    const poolKeys = await Liquidity.fetchPoolKeys({ connection, poolId });
    const tx = await Liquidity.makeSwapInstruction({
      connection,
      poolKeys,
      amountIn: amountInSol * 10 ** 9, // Convert SOL to lamports
      minAmountOut: 0, // Avoid slippage errors
      userKey: wallet.publicKey,
      programId: MAINNET_PROGRAM_ID,
    });

    await connection.sendTransaction(tx, [wallet]);
    console.log(`✅ Successfully sniped ${poolId}`);
  } catch (error) {
    console.error(`❌ Buy failed: ${error.message}`);
  }
}

export default buyToken;
