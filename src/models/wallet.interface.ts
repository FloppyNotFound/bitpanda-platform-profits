export interface WalletResponse {
  data: Wallet[];
}

export interface Wallet {
  type: string;
  attributes: WalletAttributes;
  id: string;
}

interface WalletAttributes {
  cryptocoin_id: string;
  cryptocoin_symbol: string;
  balance: string;
  is_default: boolean;
  name: string;
  pending_transactions_count: number;
  deleted: boolean;
}
