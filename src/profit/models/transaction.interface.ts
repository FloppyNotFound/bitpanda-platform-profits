export type TransactionType = 'deposit' | 'withdrawal';

export interface Transaction {
  wasHandled?: boolean;
  unixTime: number;
  fee: number;
  amountCrypto: number;
  amountEur: number;
  type: TransactionType;
}
