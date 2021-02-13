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

interface Trade {
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
  payment_option_id: string;
  time: Time;
  price: string;
  is_swap: boolean;
}

interface Time {
  date_iso8601: string;
  unix: string;
}
