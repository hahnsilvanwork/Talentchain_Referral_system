import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import * as bip39 from "bip39";
import dotenv from "dotenv";

dotenv.config();

export function getAdminWallet() {
  const seedPhrase = process.env.ADMIN_SEED_PHRASE;
  if (!seedPhrase) throw new Error("ADMIN_SEED_PHRASE nicht in .env gesetzt");

  // Seed Phrase zu Entropy konvertieren
  const entropy = bip39.mnemonicToEntropy(seedPhrase);

  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, "hex"),
    Buffer.from("")
  );

  // Cardano Derivation Path: m/1852'/1815'/0'/0/0
  const accountKey = rootKey
    .derive(harden(1852))
    .derive(harden(1815))
    .derive(harden(0));

  const paymentKey = accountKey.derive(0).derive(0);
  const stakeKey = accountKey.derive(2).derive(0);

  const paymentPubKey = paymentKey.to_public();
  const stakePubKey = stakeKey.to_public();

  const paymentKeyHash = paymentPubKey.to_raw_key().hash();
  const stakeKeyHash = stakePubKey.to_raw_key().hash();

  const baseAddress = CSL.BaseAddress.new(
    0, // 0 = Testnet
    CSL.Credential.from_keyhash(paymentKeyHash),
    CSL.Credential.from_keyhash(stakeKeyHash)
  );

  return {
    address: baseAddress.to_address().to_bech32(),
    paymentKey: paymentKey.to_raw_key(),
    paymentPubKeyHash: Buffer.from(paymentKeyHash.to_bytes()).toString("hex"),
  };
}

function harden(num: number): number {
  return 0x80000000 + num;
}