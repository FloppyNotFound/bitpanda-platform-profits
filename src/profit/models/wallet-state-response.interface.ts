import { WalletStateResponseItem } from './wallet-state-response-item.interface';

export interface WalletStateResponse {
  items: WalletStateResponseItem[];
  profitPerYear: [number, number][];
  taxablePerYear: [number, number][];
}
