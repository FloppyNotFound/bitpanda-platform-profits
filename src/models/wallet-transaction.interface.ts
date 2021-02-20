import { TransactionAttributes } from './transaction-attributes.interface';

export interface WalletTransaction {
  type: string;
  attributes: TransactionAttributes;
  id: string;
}
