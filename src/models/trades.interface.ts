export interface TradesResponse {
  data: Trade[];
  meta: Meta;
  links: Links;
}

interface Links {
  next: string;
  last: string;
  self: string;
}

interface Meta {
  total_count: number;
  page: number;
  page_size: number;
}

export interface Trade {
  type: string;
  attributes: TradeAttributes;
  id: string;
}

interface TradeAttributes {
  status: string;
  type: string;
  cryptocoin_id: string;
  fiat_id: string;
  amount_fiat: string;
  amount_cryptocoin: string;
  fiat_to_eur_rate: string;
  wallet_id: string;
  fiat_wallet_id: string;
  payment_option_id?: string;
  time: Time;
  price: string;
  is_swap: boolean;
  is_savings?: boolean;
  tags?: unknown[];
  bfc_used: boolean;
  best_fee_collection: BestFeeCoolection;
}

interface Time {
  date_iso8601: string;
  unix: string;
}

interface BestFeeCoolection {
  type: string;
  attributes: BestFeeAttributes;
}

interface BestFeeAttributes {
  best_current_price_eur: string;
  best_used_price_eur: string;
  bfc_deduction: number;
  bfc_market_value_eur: string;
  wallet_transaction: WalletTransaction;
}

interface WalletTransaction {
  type: string;
  attributes: WalletTransactionAttributes;
  id: string;
}

interface WalletTransactionAttributes {
  amount: string;
  recipient: string;
  time: Time;
  confirmations: number;
  in_or_out: string;
  type: string;
  status: string;
  amount_eur: string;
  wallet_id: string;
  confirmation_by: string;
  confirmed: boolean;
  cryptocoin_id: string;
  last_changed: Time;
  fee: string;
  current_fiat_id: string;
  current_fiat_amount: string;
  is_metal_storage_fee: boolean;
  tags: any[];
  public_status: string;
  is_bfc: boolean;
}
