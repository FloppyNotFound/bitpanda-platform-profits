import { HttpService, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransferData } from '../models/transfers.interface';
import { AuthHeader } from '../models/auth-header.interface';
import { TradeData } from '../models/trades.interface';
import { WalletResponse, Wallet } from '../models/wallet.interface';

@Injectable()
export class WalletsService {
  constructor(private _httpService: HttpService) {}

  getWallets(
    walletsUrl: URL,
    httpHeaders: AuthHeader,
  ): Observable<WalletResponse> {
    return this._httpService
      .get(walletsUrl.href, {
        headers: httpHeaders,
      })
      .pipe(map((res) => <WalletResponse>res.data));
  }

  filterWalletsInUse(
    wallets: Wallet[],
    trades: TradeData[],
    transactions: TransferData[],
  ): Wallet[] {
    const uniqueWalletIdsUsedInTrades = trades
      .map((trade) => trade.attributes.wallet_id)
      .filter((v, i, a) => a.indexOf(v) == i);

    const uniqueWalletIdsUsedInTransactions = transactions
      .map((transaction) => transaction.attributes.wallet_id)
      .filter((v, i, a) => a.indexOf(v) == i);

    const uniqueWlletIdsUsed = [
      ...uniqueWalletIdsUsedInTrades,
      ...uniqueWalletIdsUsedInTransactions,
    ];

    return wallets.filter((wallet) => uniqueWlletIdsUsed.includes(wallet.id));
  }
}
