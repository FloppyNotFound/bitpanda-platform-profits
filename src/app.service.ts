import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthHeader } from './models/auth-header.interface';
import { TradesResponse } from './models/trades.interface';
import { WalletResponse } from './models/wallet.interface';

@Injectable()
export class AppService {
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

  getTrades(
    tradesUrl: URL,
    httpHeaders: AuthHeader,
  ): Observable<TradesResponse> {
    return this._httpService.get(tradesUrl.href, { headers: httpHeaders }).pipe(
      map((res) => <TradesResponse>res.data),
      switchMap((trades) => {
        if (trades.links.next) {
          tradesUrl.searchParams.set('page', (trades.meta.page + 1).toString());

          return this.getTrades(tradesUrl, httpHeaders).pipe(
            tap((t) => (t.data = [...trades.data, ...t.data])),
          );
        }

        return of(trades);
      }),
    );
  }
}
