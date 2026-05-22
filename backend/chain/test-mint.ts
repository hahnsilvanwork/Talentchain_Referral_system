import { mintIdentityNft, hasIdentityNft } from "./mint-nft";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const address = "addr_test1qqstkwn0dsfzv35xuf39cgnh9f9ygwx0ycyqht508s024gqclmncwxyxtq7e0l3g7kv0367x8g8xkryy4yy6rprxpqsqvzjpwm";
  const pkh = "20bb3a6f6c12264686e2625c22772a4a4438cf26080bae8f3c1eaaa0";

  console.log("Prüfe ob NFT bereits vorhanden...");
  const hasNft = await hasIdentityNft(address);
  console.log("Hat NFT:", hasNft);

  if (!hasNft) {
    console.log("Minting Identity NFT...");
    const txHash = await mintIdentityNft(address, pkh);
    console.log("Erfolgreich! TX:", txHash);
    console.log(`Cardanoscan: https://preprod.cardanoscan.io/transaction/${txHash}`);
  } else {
    console.log("NFT bereits vorhanden — kein Re-Minting möglich");
  }
  process.exit(0);
}

test().catch(console.error);