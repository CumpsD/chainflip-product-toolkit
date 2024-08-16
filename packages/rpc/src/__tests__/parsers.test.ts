import { describe, expect, it } from 'vitest';
import {
  cfBoostPoolDetails,
  cfBoostPoolPendingFees,
  cfEnvironment,
  numberOrHex,
  cfPoolsEnvironment,
} from '../parsers';

describe('parsers', () => {
  describe('numberOrHex', () => {
    it.each([1, '0x1'])('transforms %s into a bigint', (value) => {
      expect(numberOrHex.parse(value)).toBe(BigInt(value));
    });
  });

  describe('cfBoostPoolDetails', () => {
    it('parses boost pool details', () => {
      cfBoostPoolDetails.parse([
        {
          fee_tier: 5,
          chain: 'Bitcoin',
          asset: 'BTC',
          available_amounts: [
            {
              account_id: 'cFL8fmgKZcchhtLagBH2GKfsuWxBqUaD5CYE1m7DFb8DBSLJ1',
              amount: '0xbed6146',
            },
          ],
          deposits_pending_finalization: [
            {
              deposit_id: 11,
              owed_amounts: [
                {
                  account_id: 'cFL8fmgKZcchhtLagBH2GKfsuWxBqUaD5CYE1m7DFb8DBSLJ1',
                  amount: '0xf4240',
                },
              ],
            },
          ],
          pending_withdrawals: [],
        },
        {
          fee_tier: 10,
          chain: 'Bitcoin',
          asset: 'BTC',
          available_amounts: [],
          deposits_pending_finalization: [],
          pending_withdrawals: [],
        },
      ]);
    });
  });

  describe('cfBoostPoolPendingFees', () => {
    it('parses boost pool pending fees', () => {
      cfBoostPoolPendingFees.parse([
        {
          fee_tier: 5,
          chain: 'Bitcoin',
          asset: 'BTC',
          pending_fees: [
            {
              deposit_id: 3,
              fees: [
                {
                  account_id: 'cFL8fmgKZcchhtLagBH2GKfsuWxBqUaD5CYE1m7DFb8DBSLJ1',
                  amount: '0x1f4',
                },
              ],
            },
            {
              deposit_id: 11,
              fees: [
                {
                  account_id: 'cFL8fmgKZcchhtLagBH2GKfsuWxBqUaD5CYE1m7DFb8DBSLJ1',
                  amount: '0x1f4',
                },
              ],
            },
          ],
        },
        {
          fee_tier: 10,
          chain: 'Bitcoin',
          asset: 'BTC',
          pending_fees: [],
        },
        {
          fee_tier: 30,
          chain: 'Bitcoin',
          asset: 'BTC',
          pending_fees: [],
        },
      ]);
    });
  });

  describe('cfEnvironment', () => {
    it('parses the cfEnvironment response', () => {
      cfEnvironment.parse({
        ingress_egress: {
          minimum_deposit_amounts: {
            Ethereum: {
              ETH: '0x0',
              FLIP: '0x0',
              USDC: '0x0',
              USDT: '0x0',
            },
            Polkadot: {
              DOT: '0x0',
            },
            Bitcoin: {
              BTC: '0x0',
            },
            Arbitrum: {
              ETH: '0x0',
              USDC: '0x0',
            },
            Solana: {
              SOL: '0x0',
            },
          },
          ingress_fees: {
            Ethereum: {
              ETH: '0x55730',
              FLIP: '0x2db7b25',
              USDC: '0x0',
              USDT: '0x0',
            },
            Polkadot: {
              DOT: '0xbc28f20',
            },
            Bitcoin: {
              BTC: '0x4f',
            },
            Arbitrum: {
              ETH: '0x574b457d400',
              USDC: '0x150e',
            },
            Solana: {
              SOL: '0x2f62d048',
            },
          },
          egress_fees: {
            Ethereum: {
              ETH: '0x77a10',
              FLIP: '0x336ea89',
              USDC: '0x0',
              USDT: '0x0',
            },
            Polkadot: {
              DOT: '0xbc4d910',
            },
            Bitcoin: {
              BTC: '0xb3',
            },
            Arbitrum: {
              ETH: '0x74645ca7000',
              USDC: '0x1765',
            },
            Solana: {
              SOL: '0x4787c48',
            },
          },
          witness_safety_margins: {
            Arbitrum: 1,
            Ethereum: 2,
            Solana: 1,
            Bitcoin: 2,
            Polkadot: null,
          },
          egress_dust_limits: {
            Ethereum: {
              ETH: '0x1',
              FLIP: '0x1',
              USDC: '0x1',
              USDT: '0x1',
            },
            Polkadot: {
              DOT: '0x1',
            },
            Bitcoin: {
              BTC: '0x258',
            },
            Arbitrum: {
              ETH: '0x1',
              USDC: '0x1',
            },
            Solana: {
              SOL: '0x1',
            },
          },
          channel_opening_fees: {
            Ethereum: '0x0',
            Bitcoin: '0x0',
            Arbitrum: '0x0',
            Polkadot: '0x0',
            Solana: '0x0',
          },
          max_swap_retry_duration_blocks: {
            Ethereum: 5,
            Bitcoin: 2,
            Arbitrum: 30,
            Polkadot: 30,
            Solana: 10,
          },
        },
        swapping: {
          maximum_swap_amounts: {
            Ethereum: {
              ETH: null,
              FLIP: null,
              USDC: null,
              USDT: null,
            },
            Polkadot: {
              DOT: null,
            },
            Bitcoin: {
              BTC: null,
            },
            Arbitrum: {
              ETH: null,
              USDC: null,
            },
            Solana: {
              SOL: null,
            },
          },
          network_fee_hundredth_pips: 1000,
        },
        funding: {
          redemption_tax: '0x4563918244f40000',
          minimum_funding_amount: '0x8ac7230489e80000',
        },
        pools: {
          fees: {
            Ethereum: {
              ETH: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0x60df5e33d7020d',
                  quote: '0x84b113',
                },
                limit_order_total_fees_earned: {
                  base: '0x210317f6bb404',
                  quote: '0x0',
                },
                range_total_swap_inputs: {
                  base: '0x49e809af8ec5e4686d',
                  quote: '0x653bc61c72',
                },
                limit_total_swap_inputs: {
                  base: '0x192f8b3555c5aae8e',
                  quote: '0x0',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
              FLIP: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0x8fe2c5138911193',
                  quote: '0x1ad471',
                },
                limit_order_total_fees_earned: {
                  base: '0x0',
                  quote: '0x0',
                },
                range_total_swap_inputs: {
                  base: '0x6dc62318b26f5210b65',
                  quote: '0x1478117200',
                },
                limit_total_swap_inputs: {
                  base: '0x0',
                  quote: '0x0',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
              USDC: null,
              USDT: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0x8ae06',
                  quote: '0x1bf876',
                },
                limit_order_total_fees_earned: {
                  base: '0x0',
                  quote: '0x0',
                },
                range_total_swap_inputs: {
                  base: '0x69f36e6b2',
                  quote: '0x1556dc0dcb',
                },
                limit_total_swap_inputs: {
                  base: '0x0',
                  quote: '0x0',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
            },
            Polkadot: {
              DOT: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0x1264878c',
                  quote: '0x111676',
                },
                limit_order_total_fees_earned: {
                  base: '0x0',
                  quote: '0x0',
                },
                range_total_swap_inputs: {
                  base: '0xe084044b0fc',
                  quote: '0xd095d91a1',
                },
                limit_total_swap_inputs: {
                  base: '0x0',
                  quote: '0x0',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
            },
            Bitcoin: {
              BTC: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0x8961',
                  quote: '0xda0f22',
                },
                limit_order_total_fees_earned: {
                  base: '0x0',
                  quote: '0xac0c',
                },
                range_total_swap_inputs: {
                  base: '0x68cedbea',
                  quote: '0xa65ccd0506',
                },
                limit_total_swap_inputs: {
                  base: '0x0',
                  quote: '0x8341e381',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
            },
            Arbitrum: {
              ETH: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0x1a96a7c9901240',
                  quote: '0x210230',
                },
                limit_order_total_fees_earned: {
                  base: '0x0',
                  quote: '0x0',
                },
                range_total_swap_inputs: {
                  base: '0x1448f64c4ff15c61c0',
                  quote: '0x192ecd80a2',
                },
                limit_total_swap_inputs: {
                  base: '0x0',
                  quote: '0x0',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
              USDC: {
                limit_order_fee_hundredth_pips: 20,
                range_order_fee_hundredth_pips: 20,
                range_order_total_fees_earned: {
                  base: '0xaa9c1',
                  quote: '0x1b1d4b',
                },
                limit_order_total_fees_earned: {
                  base: '0x0',
                  quote: '0x0',
                },
                range_total_swap_inputs: {
                  base: '0x8228e1e3c',
                  quote: '0x14afa63498',
                },
                limit_total_swap_inputs: {
                  base: '0x0',
                  quote: '0x0',
                },
                quote_asset: {
                  chain: 'Ethereum',
                  asset: 'USDC',
                },
              },
            },
          },
        },
      });
    });
  });

  describe('cfPoolsEnvironment', () => {
    it('parses the cfPoolsEnvironment response', () => {
      const result = cfPoolsEnvironment.parse({
        fees: {
          Ethereum: {
            ETH: {
              limit_order_fee_hundredth_pips: 20,
              range_order_fee_hundredth_pips: 20,
              range_order_total_fees_earned: {
                base: '0x86f0428ea65',
                quote: '0x996fb',
              },
              limit_order_total_fees_earned: {
                base: '0xa8cfbac89ee8',
                quote: '0x1275e',
              },
              range_total_swap_inputs: {
                base: '0x66f2a6d7322ee91',
                quote: '0x750e7a0f1',
              },
              limit_total_swap_inputs: {
                base: '0x80ca536174e92eb0',
                quote: '0xe13dd2e6',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
            FLIP: {
              limit_order_fee_hundredth_pips: 20,
              range_order_fee_hundredth_pips: 20,
              range_order_total_fees_earned: {
                base: '0xccb9a0f848e',
                quote: '0x0',
              },
              limit_order_total_fees_earned: {
                base: '0x4c52d7d621a2d',
                quote: '0x468d7',
              },
              range_total_swap_inputs: {
                base: '0x9c3092e5cc1a8e5',
                quote: '0x0',
              },
              limit_total_swap_inputs: {
                base: '0x3a3aa7f8b6b2b6b51',
                quote: '0x35cf87380',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
            USDC: null,
            USDT: {
              limit_order_fee_hundredth_pips: 5,
              range_order_fee_hundredth_pips: 5,
              range_order_total_fees_earned: {
                base: '0x18ac',
                quote: '0x42c17',
              },
              limit_order_total_fees_earned: {
                base: '0x19d',
                quote: '0xfb',
              },
              range_total_swap_inputs: {
                base: '0x4b195890',
                quote: '0xcbb6eea1b',
              },
              limit_total_swap_inputs: {
                base: '0x4e400a2',
                quote: '0x2fadcfb',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
          },
          Polkadot: {
            DOT: {
              limit_order_fee_hundredth_pips: 20,
              range_order_fee_hundredth_pips: 20,
              range_order_total_fees_earned: {
                base: '0x6ff3',
                quote: '0x0',
              },
              limit_order_total_fees_earned: {
                base: '0x3fb505a',
                quote: '0xeb53',
              },
              range_total_swap_inputs: {
                base: '0x5568199c',
                quote: '0x0',
              },
              limit_total_swap_inputs: {
                base: '0x309a8bce81d',
                quote: '0xb383d1fa',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
          },
          Bitcoin: {
            BTC: {
              limit_order_fee_hundredth_pips: 20,
              range_order_fee_hundredth_pips: 20,
              range_order_total_fees_earned: {
                base: '0x70',
                quote: '0x91aa0',
              },
              limit_order_total_fees_earned: {
                base: '0xab',
                quote: '0x49a9a',
              },
              range_total_swap_inputs: {
                base: '0x5356ca',
                quote: '0x6f212e4ff',
              },
              limit_total_swap_inputs: {
                base: '0x7fb017',
                quote: '0x3832ba417',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
          },
          Arbitrum: {
            ETH: {
              limit_order_fee_hundredth_pips: 20,
              range_order_fee_hundredth_pips: 20,
              range_order_total_fees_earned: {
                base: '0xf3288bb9446',
                quote: '0x5ef8b',
              },
              limit_order_total_fees_earned: {
                base: '0x0',
                quote: '0x0',
              },
              range_total_swap_inputs: {
                base: '0xb982ebf13d4139a',
                quote: '0x487437e83',
              },
              limit_total_swap_inputs: {
                base: '0x0',
                quote: '0x0',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
            USDC: {
              limit_order_fee_hundredth_pips: 20,
              range_order_fee_hundredth_pips: 20,
              range_order_total_fees_earned: {
                base: '0x18da0',
                quote: '0xe9203',
              },
              limit_order_total_fees_earned: {
                base: '0x0',
                quote: '0x0',
              },
              range_total_swap_inputs: {
                base: '0x12f561efa',
                quote: '0xb1db4cae8',
              },
              limit_total_swap_inputs: {
                base: '0x0',
                quote: '0x0',
              },
              quote_asset: {
                chain: 'Ethereum',
                asset: 'USDC',
              },
            },
          },
          Solana: {
            SOL: null,
          },
        },
      });

      expect(result.fees.Solana.SOL).not.toBeNull();
      expect(result.fees.Solana.USDC).not.toBeNull();
    });
  });
});
