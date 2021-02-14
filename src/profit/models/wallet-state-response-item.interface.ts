import { Crypto } from './crypto.interface';

export interface WalletStateResponseItem {
  cryptoSymbol: string;
  amountCrypto: number;
  assets: [number, Crypto][];
  profitPerYear: [number, number][];
  taxablePerYear: [number, number][];
}
