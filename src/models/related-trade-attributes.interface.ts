import { Time } from './time.interface';

export interface RelatedTradeAttributes {
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
  is_savings: boolean;
  tags: unknown[];
  bfc_used: boolean;
}
