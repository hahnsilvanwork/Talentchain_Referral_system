import { Lucid, Blockfrost } from "@lucid-evolution/lucid";

async function test() {
  console.log("Starting...");
  const lucid = await Lucid(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      "preprodnIsai2fOaow8LXwyF1y0yWGz5ZFP2Q6a"
    ),
    "Preprod"
  );
  console.log("Lucid keys:", Object.keys(lucid));
}

test().catch(console.error);