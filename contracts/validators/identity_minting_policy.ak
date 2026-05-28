use aiken/collection/list
use cardano/transaction.{Transaction}
use cardano/assets.{PolicyId}

pub type MintAction {
  Mint
  Burn
}

validator identity_minting_policy(admin_pkh: ByteArray) {
  mint(redeemer: MintAction, _policy_id: PolicyId, tx: Transaction) {
    when redeemer is {
      Mint -> list.has(tx.extra_signatories, admin_pkh)
      Burn -> list.has(tx.extra_signatories, admin_pkh)
    }
  }

  else(_) {
    fail
  }
}