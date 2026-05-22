import { getAdminWallet } from "./wallet";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    const wallet = getAdminWallet();
    console.log("Wallet Adresse:", wallet.address);
    console.log("PKH:", wallet.paymentPubKeyHash);
  } catch (error) {
    console.error("Fehler:", error);
  }
}

test();