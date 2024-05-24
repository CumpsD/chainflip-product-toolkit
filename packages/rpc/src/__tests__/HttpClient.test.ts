import { HexString } from '@chainflip/utils/types';
import { Server } from 'http';
import { promisify } from 'util';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { z } from 'zod';
import HttpClient from '../HttpClient';
import {
  cfEnvironment,
  cfIngressEgressEnvironment,
  cfSwapRateV2,
  cfSwappingEnvironment,
  type cfFundingEnvironment,
  type cfSwapRate,
} from '../parsers';
import { AddressInfo } from 'net';
import { JsonRpcRequest, RpcMethod } from '../common';

const supportedAssets = [
  { chain: 'Ethereum', asset: 'ETH' },
  { chain: 'Ethereum', asset: 'FLIP' },
  { chain: 'Ethereum', asset: 'USDC' },
  { chain: 'Ethereum', asset: 'USDT' },
  { chain: 'Polkadot', asset: 'DOT' },
  { chain: 'Bitcoin', asset: 'BTC' },
  { chain: 'Arbitrum', asset: 'ETH' },
  { chain: 'Arbitrum', asset: 'USDC' },
];

const ingressEgressEnvironment: z.input<typeof cfIngressEgressEnvironment> = {
  minimum_deposit_amounts: {
    Ethereum: { ETH: '0x0', FLIP: '0x0', USDC: '0x0', USDT: '0x0' },
    Polkadot: { DOT: '0x0' },
    Bitcoin: { BTC: '0x0' },
    Arbitrum: { ETH: '0x0', USDC: '0x0' },
  },
  ingress_fees: {
    Ethereum: { ETH: '0x55730', FLIP: '0x0', USDC: '0x0', USDT: '0x0' },
    Polkadot: { DOT: '0xbc28f20' },
    Bitcoin: { BTC: '0x4e' },
    Arbitrum: { ETH: '0x574b457d400', USDC: '0x231b' },
  },
  egress_fees: {
    Ethereum: { ETH: '0x77a10', FLIP: '0x0', USDC: '0x0', USDT: '0x0' },
    Polkadot: { DOT: '0xbc4d910' },
    Bitcoin: { BTC: '0xb0' },
    Arbitrum: { ETH: '0x74645ca7000', USDC: '0x2701' },
  },
  witness_safety_margins: { Bitcoin: 2, Polkadot: null, Ethereum: 2, Arbitrum: 1 },
  egress_dust_limits: {
    Ethereum: { ETH: '0x1', FLIP: '0x1', USDC: '0x1', USDT: '0x1' },
    Polkadot: { DOT: '0x1' },
    Bitcoin: { BTC: '0x258' },
    Arbitrum: { ETH: '0x1', USDC: '0x1' },
  },
  channel_opening_fees: {
    Arbitrum: '0x0',
    Ethereum: '0x0',
    Polkadot: '0x0',
    Bitcoin: '0x0',
  },
};

const swappingEnvironment: z.input<typeof cfSwappingEnvironment> = {
  maximum_swap_amounts: {
    Ethereum: {
      ETH: '0x10000',
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
  },
  network_fee_hundredth_pips: 1000,
};

const fundingEnvironment: z.input<typeof cfFundingEnvironment> = {
  redemption_tax: '0x4563918244f40000',
  minimum_funding_amount: '0x8ac7230489e80000',
};

const environment: z.input<typeof cfEnvironment> = {
  ingress_egress: ingressEgressEnvironment,
  swapping: swappingEnvironment,
  funding: fundingEnvironment,
};

const runtimeVersion = {
  specName: 'chainflip-node',
  implName: 'chainflip-node',
  authoringVersion: 1,
  specVersion: 141,
  implVersion: 1,
  apis: [
    ['0xb7fb30db9d96703a', 1],
    ['0xdf6acb689907609b', 4],
    ['0x37e397fc7c91f5e4', 2],
    ['0x40fe3ad401f8959a', 6],
    ['0xd2bc9897eed08f15', 3],
    ['0xf78b278be53f454c', 2],
    ['0xdd718d5cc53262d4', 1],
    ['0xab3c0572291feb8b', 1],
    ['0xed99c5acb25eedf5', 3],
    ['0xbc9d89904f5b923f', 1],
    ['0x37c8bb1350a9a2a8', 4],
    ['0xf3ff14d5ab527059', 3],
    ['0xfbc577b9d747efd6', 1],
  ],
  transactionVersion: 12,
  stateVersion: 1,
};

const boostPoolsDepth = [
  { chain: 'Bitcoin', asset: 'BTC', tier: 5, available_amount: '0x98e888' },
  { chain: 'Bitcoin', asset: 'BTC', tier: 30, available_amount: '0x989680' },
  { chain: 'Bitcoin', asset: 'BTC', tier: 10, available_amount: '0x989680' },
];

const swapRateV2: z.input<typeof cfSwapRateV2> = {
  intermediary: null,
  output: '0xffbc',
  network_fee: { chain: 'Ethereum', asset: 'USDC', amount: '0x42' },
  ingress_fee: { chain: 'Ethereum', asset: 'USDT', amount: '0x0' },
  egress_fee: { chain: 'Ethereum', asset: 'USDC', amount: '0x0' },
};

const isHexString = (value: unknown): value is HexString =>
  typeof value === 'string' && value.startsWith('0x');

describe(HttpClient, () => {
  it('returns all methods', () => {
    expect(new HttpClient('http://localhost:8080').methods()).toMatchInlineSnapshot(`
      [
        "cf_boost_pools_depth",
        "cf_environment",
        "cf_funding_environment",
        "cf_ingress_egress_environment",
        "cf_supported_assets",
        "cf_swap_rate",
        "cf_swap_rate_v2",
        "cf_swapping_environment",
        "chain_getBlockHash",
        "state_getMetadata",
        "state_getRuntimeVersion",
      ]
    `);
  });

  describe('with server', () => {
    let server: Server;

    let client: HttpClient;

    beforeEach(() => {
      server = new Server(async (req, res) => {
        if (req.headers['content-type'] !== 'application/json') {
          return res.writeHead(400).end();
        }

        const chunks = [] as Buffer[];

        let length = 0;

        for await (const chunk of req as AsyncIterable<Buffer>) {
          chunks.push(chunk);
          length += chunk.length;
        }

        const body = JSON.parse(
          Buffer.concat(chunks, length).toString(),
        ) as JsonRpcRequest<RpcMethod>;

        const specialMethod = body.method as string;

        if (specialMethod === 'malformed_response') {
          return res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result: 1 }));
        } else if (specialMethod === 'non_200') {
          return res.writeHead(404).end();
        } else if (specialMethod === 'malformed_json') {
          return res.end('{');
        }

        const respond = (result: unknown) =>
          res.end(
            JSON.stringify({
              id: body.id,
              jsonrpc: '2.0',
              result,
            }),
          );

        if (body.method === 'cf_swap_rate') {
          const { chain, asset } = body.params[1]!;

          if (!isHexString(body.params.at(-1))) {
            return res.end(
              JSON.stringify({
                id: body.id,
                jsonrpc: '2.0',
                error: { code: -32602, message: 'invalid parameter type' },
              }),
            );
          }

          return respond({
            intermediary: chain === 'Ethereum' && asset === 'USDC' ? null : '0x1',
            output: '0x1',
          } as z.input<typeof cfSwapRate>);
        }

        switch (body.method) {
          case 'cf_funding_environment':
            return respond(fundingEnvironment);
          case 'cf_ingress_egress_environment':
            return respond(ingressEgressEnvironment);
          case 'cf_swapping_environment':
            return respond(swappingEnvironment);
          case 'cf_environment':
            return respond(environment);
          case 'state_getMetadata':
            return respond('0x1234');
          case 'cf_supported_assets':
            return respond(supportedAssets);
          case 'chain_getBlockHash':
            return respond('0x5678');
          case 'state_getRuntimeVersion':
            return respond(runtimeVersion);
          case 'cf_boost_pools_depth':
            return respond(boostPoolsDepth);
          case 'cf_swap_rate_v2':
            return respond(swapRateV2);
          default:
            console.error('Method not found:', body.method);
            return res.writeHead(200).end(
              JSON.stringify({
                id: body.id,
                jsonrpc: '2.0',
                error: { code: 1, message: `Method not found: "${body.method as string}"` },
              }),
            );
        }
      }).listen(0);

      client = new HttpClient(`http://localhost:${(server.address() as AddressInfo).port}`);
    });

    afterEach(async () => {
      await promisify(server.close.bind(server))();
    });

    it('gets the swap rate with intermediary', async () => {
      expect(
        await client.sendRequest(
          'cf_swap_rate',
          { asset: 'BTC', chain: 'Bitcoin' },
          { asset: 'ETH', chain: 'Ethereum' },
          '0x1',
        ),
      ).toMatchInlineSnapshot(`
        {
          "intermediary": 1n,
          "output": 1n,
        }
      `);
    });

    it('gets the swap rate without intermediary', async () => {
      expect(
        await client.sendRequest(
          'cf_swap_rate',
          { asset: 'BTC', chain: 'Bitcoin' },
          { asset: 'USDC', chain: 'Ethereum' },
          '0x1',
        ),
      ).toMatchInlineSnapshot(`
        {
          "intermediary": null,
          "output": 1n,
        }
      `);
    });

    it('gets the funding environment', async () => {
      expect(await client.sendRequest('cf_funding_environment')).toMatchInlineSnapshot(`
        {
          "minimum_funding_amount": 10000000000000000000n,
          "redemption_tax": 5000000000000000000n,
        }
      `);
    });

    it('gets the ingress/egress environment', async () => {
      expect(await client.sendRequest('cf_ingress_egress_environment')).toMatchSnapshot();
    });

    it('gets the swapping environment', async () => {
      expect(await client.sendRequest('cf_swapping_environment')).toMatchInlineSnapshot(`
        {
          "maximum_swap_amounts": {
            "Arbitrum": {
              "ETH": null,
              "USDC": null,
            },
            "Bitcoin": {
              "BTC": null,
            },
            "Ethereum": {
              "ETH": 65536n,
              "FLIP": null,
              "USDC": null,
              "USDT": null,
            },
            "Polkadot": {
              "DOT": null,
            },
          },
          "network_fee_hundredth_pips": 1000,
        }
      `);
    });

    it('gets the environment', async () => {
      expect(await client.sendRequest('cf_environment')).toMatchSnapshot();
    });

    it('gets the metadata', async () => {
      expect(await client.sendRequest('state_getMetadata')).toBe('0x1234');
    });

    it('gets the supported assets', async () => {
      expect(await client.sendRequest('cf_supported_assets')).toEqual(supportedAssets);
    });

    it('gets the block hash', async () => {
      expect(await client.sendRequest('chain_getBlockHash')).toEqual('0x5678');
    });

    it('gets the runtime version', async () => {
      expect(await client.sendRequest('state_getRuntimeVersion')).toEqual(runtimeVersion);
    });

    it('gets the boost pools', async () => {
      expect(await client.sendRequest('cf_boost_pools_depth')).toMatchInlineSnapshot(`
        [
          {
            "asset": "BTC",
            "available_amount": 10021000n,
            "chain": "Bitcoin",
            "tier": 5,
          },
          {
            "asset": "BTC",
            "available_amount": 10000000n,
            "chain": "Bitcoin",
            "tier": 30,
          },
          {
            "asset": "BTC",
            "available_amount": 10000000n,
            "chain": "Bitcoin",
            "tier": 10,
          },
        ]
      `);
    });

    it('does the swap rate v2', async () => {
      expect(
        await client.sendRequest(
          'cf_swap_rate_v2',
          { asset: 'USDT', chain: 'Ethereum' },
          { asset: 'USDC', chain: 'Ethereum' },
          '0x10000',
          [
            {
              LimitOrder: {
                base_asset: { asset: 'USDT', chain: 'Ethereum' },
                quote_asset: { asset: 'USDC', chain: 'Ethereum' },
                side: 'buy',
                tick: 0,
                sell_amount: '0x10000',
              },
            },
          ],
        ),
      ).toMatchInlineSnapshot(`
        {
          "egress_fee": {
            "amount": 0n,
            "asset": "USDC",
            "chain": "Ethereum",
          },
          "ingress_fee": {
            "amount": 0n,
            "asset": "USDT",
            "chain": "Ethereum",
          },
          "intermediary": null,
          "network_fee": {
            "amount": 66n,
            "asset": "USDC",
            "chain": "Ethereum",
          },
          "output": 65468n,
        }
      `);
    });

    it('throws on invalid response', async () => {
      const method = 'malformed_response' as RpcMethod;

      await expect(client.sendRequest(method)).rejects.toThrow('Invalid response');
    });

    it('throws on a non-200 response', async () => {
      const method = 'non_200' as RpcMethod;
      await expect(client.sendRequest(method)).rejects.toThrow('HTTP error: 404');
    });

    it('returns the rejected error message', async () => {
      await expect(
        client.sendRequest(
          'cf_swap_rate',
          { asset: 'BTC', chain: 'Bitcoin' },
          { asset: 'ETH', chain: 'Ethereum' },
          '0x1',
          1 as unknown as HexString,
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: invalid parameter type]`);
    });

    it('handles malformed json', async () => {
      const method = 'malformed_json' as RpcMethod;
      await expect(client.sendRequest(method)).rejects.toThrow('Invalid JSON response');
    });
  });
});