import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import * as blake from "blakejs";
import { blockfrost } from "./blockfrost";
import { getAdminWallet } from "./wallet";
import dotenv from "dotenv";

dotenv.config();

export interface Payment {
  address: string;
  lovelace: number;
}

function hashTransactionBody(txBody: CSL.TransactionBody): CSL.TransactionHash {
  const bodyBytes = txBody.to_bytes();
  const hash = blake.blake2b(bodyBytes, undefined, 32);
  return CSL.TransactionHash.from_bytes(hash);
}

export async function buildAndSubmitTx(payments: Payment[]): Promise<string> {
  const wallet = getAdminWallet();
  const adminAddress = wallet.address;

  const utxos = await blockfrost.addressesUtxos(adminAddress);
  if (utxos.length === 0) throw new Error("Keine UTxOs gefunden");

  const protocolParams = await blockfrost.epochsLatestParameters();

  const txBuilderConfig = CSL.TransactionBuilderConfigBuilder.new()
    .fee_algo(
      CSL.LinearFee.new(
        CSL.BigNum.from_str(protocolParams.min_fee_a.toString()),
        CSL.BigNum.from_str(protocolParams.min_fee_b.toString())
      )
    )
    .pool_deposit(CSL.BigNum.from_str(protocolParams.pool_deposit))
    .key_deposit(CSL.BigNum.from_str(protocolParams.key_deposit))
    .max_value_size(protocolParams.max_val_size ? parseInt(protocolParams.max_val_size) : 5000)
    .max_tx_size(protocolParams.max_tx_size)
    .coins_per_utxo_byte(
      CSL.BigNum.from_str(protocolParams.coins_per_utxo_size || "4310")
    )
    .build();

  const txBuilder = CSL.TransactionBuilder.new(txBuilderConfig);

  // Alle UTxOs als Input hinzufügen
  for (const utxo of utxos) {
    const input = CSL.TransactionInput.new(
      CSL.TransactionHash.from_hex(utxo.tx_hash),
      utxo.output_index
    );
    const inputAmount = CSL.Value.new(
      CSL.BigNum.from_str(
        utxo.amount.find((a) => a.unit === "lovelace")?.quantity || "0"
      )
    );
    txBuilder.add_key_input(
      CSL.Ed25519KeyHash.from_hex(wallet.paymentPubKeyHash),
      input,
      inputAmount
    );
  }

  for (const payment of payments) {
    const outputAddress = CSL.Address.from_bech32(payment.address);
    const outputValue = CSL.Value.new(
      CSL.BigNum.from_str(payment.lovelace.toString())
    );
    txBuilder.add_output(
      CSL.TransactionOutput.new(outputAddress, outputValue)
    );
  }

  const latestBlock = await blockfrost.blocksLatest();
  const ttl = latestBlock.slot ? latestBlock.slot + 3600 : 99999999;
  txBuilder.set_ttl(ttl);

  const changeAddress = CSL.Address.from_bech32(adminAddress);
  txBuilder.add_change_if_needed(changeAddress);

  const txBody = txBuilder.build();
  const txHash = hashTransactionBody(txBody);

  const witnesses = CSL.TransactionWitnessSet.new();
  const vkeyWitnesses = CSL.Vkeywitnesses.new();
  const vkeyWitness = CSL.make_vkey_witness(txHash, wallet.paymentKey);
  vkeyWitnesses.add(vkeyWitness);
  witnesses.set_vkeys(vkeyWitnesses);

  const tx = CSL.Transaction.new(txBody, witnesses, undefined);
  const txCbor = Buffer.from(tx.to_bytes()).toString("hex");

  console.log("Submitting Transaktion...");
  const submittedTxHash = await blockfrost.txSubmit(txCbor);
  console.log("TX Hash:", submittedTxHash);

  return submittedTxHash;
}