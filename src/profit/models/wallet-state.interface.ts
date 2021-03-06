import { Crypto } from './crypto.interface';

export interface WalletState {
  cryptoId: number;
  cryptoSymbol: string;
  amountCrypto: number;
  amountFiat: number;
  assets: Map<number, Crypto>;
  profitPerYear: Map<number, number>;
  taxablePerYear: Map<number, number>;
}
