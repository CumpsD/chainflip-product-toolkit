import { assert } from './assertion';
import { blake2b } from '@noble/hashes/blake2b';
import * as base58 from './base58';

const CHECKSUM_BYTE_LENGTH = 2;
const DATA_LENGTH = 32;
const MAX_SIMPLE_PREFIX = 0x3f;
const MAX_PREFIX = 0x3fff;
const RESERVED_PREFIXES = [46, 47];

const computeChecksum = (data: Uint8Array | number[]) => {
  const checksumPrefix = [83, 83, 53, 56, 80, 82, 69];
  const checksum = blake2b(new Uint8Array([...checksumPrefix, ...data]));
  return checksum.slice(0, CHECKSUM_BYTE_LENGTH);
};

type Address = { data: Uint8Array; ss58Format: number };

export const decode = (input: string): Address => {
  const decodedBytes = base58.decode(input);

  let ss58FormatLen: number;
  let ss58Format: number;

  if ((decodedBytes[0] & 0x40) !== 0) {
    ss58FormatLen = 2;
    ss58Format =
      ((decodedBytes[0] & 0x3f) << 2) | (decodedBytes[1] >> 6) | ((decodedBytes[1] & 0x3f) << 8);
  } else {
    ss58FormatLen = 1;
    ss58Format = decodedBytes[0];
  }

  assert(!RESERVED_PREFIXES.includes(ss58Format), `Reserved prefix: ${ss58Format}`);

  const checksumBytes = decodedBytes.splice(-CHECKSUM_BYTE_LENGTH);
  const data = decodedBytes.slice(ss58FormatLen);

  assert(data.length === DATA_LENGTH, `Invalid data length: ${data.length}`);

  const checksum = computeChecksum(decodedBytes);

  assert(
    checksumBytes[0] === checksum[0],
    `Invalid checksum: ${checksumBytes[0]} !== ${checksum[0]}`,
  );
  assert(
    checksumBytes[1] === checksum[1],
    `Invalid checksum: ${checksumBytes[1]} !== ${checksum[1]}`,
  );

  return {
    data: new Uint8Array(data),
    ss58Format: ss58Format,
  };
};

export const encode = ({ data, ss58Format }: Address): string => {
  assert(data.length === DATA_LENGTH, `Invalid data length: ${data.length}`, RangeError);
  assert(ss58Format >= 0 && ss58Format <= MAX_PREFIX, `Invalid prefix: ${ss58Format}`, RangeError);
  assert(!RESERVED_PREFIXES.includes(ss58Format), `Reserved prefix: ${ss58Format}`);

  let prefixBytes;

  if (ss58Format <= MAX_SIMPLE_PREFIX) {
    prefixBytes = [ss58Format];
  } else {
    prefixBytes = [
      ((ss58Format & 0x00fc) >> 2) | 0x0040,
      (ss58Format >> 8) | ((ss58Format & 0x0003) << 6),
    ];
  }

  const checksum = computeChecksum(new Uint8Array([...prefixBytes, ...data]));

  return base58.encode([...prefixBytes, ...data, ...checksum]);
};
