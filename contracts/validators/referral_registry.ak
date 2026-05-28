use aiken/collection/list
use cardano/transaction.{Transaction}

pub type ReferralDatum {
  inviter: Option<ByteArray>,
  // None = L1 Ambassador (Root)
  invitee: ByteArray,
  // Public Key Hash des eingeladenen Users
  identity_nft: ByteArray,
  // Asset Name des Identity NFT
  registered_at: Int,
  // POSIX Timestamp
  expires_at: Int,
  // Ablaufdatum
}

pub type ReferralAction {
  Register
  Renew
}

validator referral_registry(admin_pkh: ByteArray) {
  spend(
    datum: Option<ReferralDatum>,
    redeemer: ReferralAction,
    _utxo: Data,
    tx: Transaction,
  ) {
    when datum is {
      None -> fail
      Some(d) ->
        when redeemer is {
          Register -> {
            // Einlader muss signieren (oder Admin falls L1)
            let inviter_signs =
              when d.inviter is {
                Some(pkh) -> list.has(tx.extra_signatories, pkh)
                None -> list.has(tx.extra_signatories, admin_pkh)
              }

            // Eingeladene Person muss auch signieren
            let invitee_signs =
              list.has(tx.extra_signatories, d.invitee)

            inviter_signs && invitee_signs
          }

          // Nur Admin kann verlängern
          Renew -> list.has(tx.extra_signatories, admin_pkh)
        }
    }
  }

  else(_) {
    fail
  }
}