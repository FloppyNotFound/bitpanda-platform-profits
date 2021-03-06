export interface Withdrawal {
  wasHandled?: boolean;
  unixTime: number;
  fee: number;
  amount: number;
}
