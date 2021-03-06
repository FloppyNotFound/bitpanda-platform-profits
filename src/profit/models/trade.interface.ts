export interface Trade {
  cryptoCoinId: number;
  unixTime: number;
  amountCrypto: number;
  amountFiat: number;
  type: 'buy' | 'sell';
}
