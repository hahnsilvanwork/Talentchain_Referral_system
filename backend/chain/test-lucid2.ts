import { Lucid, Blockfrost, generatePrivateKey } from "@lucid-evolution/lucid";
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import * as bip39lib from "bip39";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  console.log("Step 1: Creating Lucid...");

  const lucid = await Lucid(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      process.env.BLOCKFROST_API_KEY || ""
    ),
    "Preprod"
  );

  lucid.selectWallet.fromSeed(process.env.ADMIN_SEED_PHRASE || "");

  console.log("Step 2: Building TX...");
  const tx = await lucid
    .newTx()
    .pay.ToAddress(
      "addr_test1qptplewuhhdzmjh08wt5qhqlkk3h77cqgh4gxwxguu0z8uj32j084fmnqfv6p7wl9gcre3lj39x63q0sx8a876r7ne0smhzn0s",
      { lovelace: 2000000n }
    )
    .complete();

  // Privaten Schlüssel aus Seed ableiten
  const entropy = bip39lib.mnemonicToEntropy(process.env.ADMIN_SEED_PHRASE || "");
  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, "hex"),
    Buffer.from("")
  );
  const paymentKey = rootKey
    .derive(0x80000000 + 1852)
    .derive(0x80000000 + 1815)
    .derive(0x80000000 + 0)
    .derive(0)
    .derive(0)
    .to_raw_key();

  // CBOR der unsigned TX
  const unsignedCbor = tx.toCBOR();

  // TX Body hashen und signieren
  const { blake2b } = await import("blakejs");
  const txBody = CSL.Transaction.from_hex(unsignedCbor).body();
  const txHash = CSL.TransactionHash.from_bytes(
    blake2b(txBody.to_bytes(), undefined, 32)
  );

  // Witness hinzufügen
  const vkeyWitness = CSL.make_vkey_witness(txHash, paymentKey);
  const witnesses = CSL.Transaction.from_hex(unsignedCbor).witness_set();
  const vkeys = CSL.Vkeywitnesses.new();
  vkeys.add(vkeyWitness);
  witnesses.set_vkeys(vkeys);

  const signedTx = CSL.Transaction.new(
    txBody,
    witnesses,
    undefined
  );
  const signedCbor = Buffer.from(signedTx.to_bytes()).toString("hex");

  console.log("Step 3: Submitting...");
  const { blockfrost } = await import("./blockfrost");
  const txHash2 = await blockfrost.txSubmit(signedCbor);
  console.log("TX Hash:", txHash2);

  process.exit(0);
}

test().catch((e) => {
  console.error("Error:", e.message || e);
  process.exit(1);
});