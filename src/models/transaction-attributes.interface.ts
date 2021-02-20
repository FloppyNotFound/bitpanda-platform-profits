import { Time } from './time.interface';

export interface TransactionAttributes {
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
  tags: unknown[];
  public_status: string;
  is_bfc: boolean;
}
