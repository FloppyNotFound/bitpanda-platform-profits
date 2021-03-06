import { Transaction } from './transaction.interface';

export type InOrOut = 'incoming' | 'outgoing';

export interface Transfer extends Transaction {
  inOrOut: InOrOut;
}
