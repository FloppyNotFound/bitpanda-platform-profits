import { HttpService, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthHeader } from 'src/models/auth-header.interface';
import { TradesResponse } from 'src/models/trades.interface';
import { WalletResponse, Wallet } from 'src/models/wallet.interface';

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
    walletResponse: WalletResponse,
    tradesResponse: TradesResponse,
  ): Wallet[] {
    const uniqueWalletIdsInUse = tradesResponse.data
      .map((trade) => trade.attributes.wallet_id)
      .filter((v, i, a) => a.indexOf(v) == i);

    return walletResponse.data.filter((wallet) =>
      uniqueWalletIdsInUse.includes(wallet.id),
    );
  }
}
