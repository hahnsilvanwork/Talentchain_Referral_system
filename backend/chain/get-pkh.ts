import dotenv from "dotenv";
dotenv.config();

async function getPkh() {
  const CardanoWasm = await import("@emurgo/cardano-serialization-lib-nodejs");

  const address = CardanoWasm.Address.from_bech32(
    "addr_test1qqstkwn0dsfzv35xuf39cgnh9f9ygwx0ycyqht508s024gqclmncwxyxtq7e0l3g7kv0367x8g8xkryy4yy6rprxpqsqvzjpwm"
  );

  const baseAddress = CardanoWasm.BaseAddress.from_address(address);
  const pkh = baseAddress?.payment_cred().to_keyhash()?.to_hex();

  console.log("Payment Key Hash (PKH):", pkh);
}

getPkh();