import { AuthHeader } from './../models/auth-header.interface';
import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { TransfersResponse } from '../models/transfers.interface';

@Injectable()
export class WithdrawalsService {
  constructor(private _httpService: HttpService) {}

  getWithdrawals(
    withdrawalsUrl: URL,
    httpHeaders: AuthHeader,
  ): Observable<TransfersResponse> {
    return this._httpService
      .get(withdrawalsUrl.href, { headers: httpHeaders })
      .pipe(
        map((res) => <TransfersResponse>res.data),
        switchMap((withdrawals) => {
          if (withdrawals.links.next) {
            withdrawalsUrl.searchParams.set(
              'page',
              (withdrawals.meta.page + 1).toString(),
            );

            return this.getWithdrawals(withdrawalsUrl, httpHeaders).pipe(
              tap((t) => (t.data = [...withdrawals.data, ...t.data])),
            );
          }

          return of(withdrawals);
        }),
      );
  }

  /**
   * Gets the url with query params required to load withdrawals
   * @param baseUrl
   * @param pageSize Max 500
   */
  getWithdrawalsUrl(baseUrl: string, pageSize: number): URL {
    const withdrawalsUrl = new URL('wallets/transactions', baseUrl);
    const withdrawalsPageSize = pageSize.toString();
    withdrawalsUrl.searchParams.set('page_size', withdrawalsPageSize);
    withdrawalsUrl.searchParams.set('type', 'withdrawal');
    withdrawalsUrl.searchParams.set('status', 'finished');
    return withdrawalsUrl;
  }
}
