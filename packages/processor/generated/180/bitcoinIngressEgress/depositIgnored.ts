import { z } from 'zod';
import {
  cfChainsBtcScriptPubkey,
  cfChainsBtcUtxo,
  cfPrimitivesChainsAssetsBtcAsset,
  numberOrHex,
  palletCfIngressEgressDepositIgnoredReason,
} from '../common';

export const bitcoinIngressEgressDepositIgnored = z.object({
  depositAddress: cfChainsBtcScriptPubkey.nullish(),
  asset: cfPrimitivesChainsAssetsBtcAsset,
  amount: numberOrHex,
  depositDetails: cfChainsBtcUtxo,
  reason: palletCfIngressEgressDepositIgnoredReason,
});
