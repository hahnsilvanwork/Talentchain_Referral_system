import { buildAndSubmitTx } from "./cardano-tx";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    // Sende 2 ADA an die gleiche Admin-Adresse (Test)
    const txHash = await buildAndSubmitTx([
      {
        address: "addr_test1qptplewuhhdzmjh08wt5qhqlkk3h77cqgh4gxwxguu0z8uj32j084fmnqfv6p7wl9gcre3lj39x63q0sx8a876r7ne0smhzn0s",
        lovelace: 2_000_000,
      },
    ]);
    console.log("Erfolgreich! TX Hash:", txHash);
    console.log(`Cardanoscan: https://preprod.cardanoscan.io/transaction/${txHash}`);
  } catch (error) {
    console.error("Fehler:", error);
  }
}

test();