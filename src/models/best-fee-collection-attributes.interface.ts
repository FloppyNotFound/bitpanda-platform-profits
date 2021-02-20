import { WalletTransaction } from './wallet-transaction.interface';

export interface BestFeeCollectionAttributes {
  best_current_price_eur: string;
  best_used_price_eur: string;
  bfc_deduction: number;
  bfc_market_value_eur: string;
  wallet_transaction: WalletTransaction;
}
