import { TradeData } from '../../models/trades.interface';
import { TransferData } from '../../models/transfers.interface';
import { Wallet } from '../../models/wallet.interface';

export interface ProfitCalculationInput {
  wallets: Wallet[];
  trades: TradeData[];
  withdrawals: TransferData[];
  deposits: TransferData[];
  transfers: TransferData[];
}
