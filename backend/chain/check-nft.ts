import { hasIdentityNft } from "./mint-nft";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  const wallets = [
    "addr_test1qqstkwn0dsfzv35xuf39cgnh9f9ygwx0ycyqht508s024gqclmncwxyxtq7e0l3g7kv0367x8g8xkryy4yy6rprxpqsqvzjpwm",
    "addr_test1qrz4qat27435w7zkarxxa9qdg6q5w4f4hvgfdmw63zv0r5gnj9msf4ku3rfg22p9j5w2g3alypc5rsrps0y2r5l2gsgq66ntdy",
  ];

  for (const wallet of wallets) {
    const has = await hasIdentityNft(wallet);
    console.log(`${wallet.slice(0, 30)}... : NFT = ${has}`);
  }
  process.exit(0);
}

check().catch(console.error);