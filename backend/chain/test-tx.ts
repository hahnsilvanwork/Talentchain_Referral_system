import { buildRewardTx, getAdminUtxos } from "./cardano-tx";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const adminAddress = "addr_test1qptplewuhhdzmjh08wt5qhqlkk3h77cqgh4gxwxguu0z8uj32j084fmnqfv6p7wl9gcre3lj39x63q0sx8a876r7ne0smhzn0s";

  console.log("Admin UTxOs abrufen...");
  const utxos = await getAdminUtxos(adminAddress);
  console.log(`${utxos.length} UTxOs gefunden`);

  if (utxos.length > 0) {
    console.log("Erste UTxO:", utxos[0]);
  }
}

test();