import { AuthHeader } from '../models/auth-header.interface';
import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { TransfersResponse } from '../models/transfers.interface';
import { TransactionType } from '../profit/models/transaction.interface';

@Injectable()
export class TransactionsService {
  constructor(private _httpService: HttpService) {}

  getTransactions(
    transactionsUrl: URL,
    httpHeaders: AuthHeader,
  ): Observable<TransfersResponse> {
    return this._httpService
      .get(transactionsUrl.href, { headers: httpHeaders })
      .pipe(
        map((res) => <TransfersResponse>res.data),
        switchMap((transactions) => {
          if (transactions.links.next) {
            transactionsUrl.searchParams.set(
              'page',
              (transactions.meta.page + 1).toString(),
            );

            return this.getTransactions(transactionsUrl, httpHeaders).pipe(
              tap((t) => (t.data = [...transactions.data, ...t.data])),
            );
          }

          return of(transactions);
        }),
      );
  }

  /**
   * Gets the url with query params required to load transaction
   * @param baseUrl
   * @param pageSize Max 500
   */
  getTransactionsUrl(
    baseUrl: string,
    pageSize: number,
    type: TransactionType,
  ): URL {
    const withdrawalsUrl = new URL('wallets/transactions', baseUrl);
    const withdrawalsPageSize = pageSize.toString();
    withdrawalsUrl.searchParams.set('page_size', withdrawalsPageSize);
    withdrawalsUrl.searchParams.set('type', type);
    withdrawalsUrl.searchParams.set('status', 'finished');
    return withdrawalsUrl;
  }
}
