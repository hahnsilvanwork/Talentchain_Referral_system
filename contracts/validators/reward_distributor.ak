use aiken/collection/list
use cardano/transaction.{Transaction}

pub type MatchDatum {
  talent_pkh: ByteArray,
  annual_salary: Int,
  total_fee: Int,
  created_at: Int,
  valid_until: Int,
}

pub type RewardRedeemer {
  chain_indices: List<Int>,
  reward_amounts: List<Int>,
  institution_amount: Int,
  talent_amount: Int,
  platform_amount: Int,
  institution_address: ByteArray,
  talent_address: ByteArray,
  platform_address: ByteArray,
}

validator reward_distributor(admin_pkh: ByteArray) {
  spend(
    datum: Option<MatchDatum>,
    redeemer: RewardRedeemer,
    _utxo: Data,
    tx: Transaction,
  ) {
    when datum is {
      None -> fail
      Some(d) -> {
        // Admin muss signieren
        let admin_signs =
          list.has(tx.extra_signatories, admin_pkh)

        // Institution amount muss positiv sein
        let not_expired =
          redeemer.institution_amount > 0

        // Summe aller Reward-Beträge berechnen
        let referrer_sum =
          list.foldl(redeemer.reward_amounts, 0, fn(acc, x) { acc + x })

        // Gesamtsumme muss mit total_fee übereinstimmen
        let total_check =
          referrer_sum + redeemer.institution_amount + redeemer.talent_amount + redeemer.platform_amount == d.total_fee

        // Mindestens eine Output-Zahlung muss existieren
        let has_outputs =
          list.length(tx.outputs) > 0

        admin_signs && not_expired && total_check && has_outputs
      }
    }
  }

  else(_) {
    fail
  }
}