import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthHeader } from '../models/auth-header.interface';
import { TradesResponse } from '../models/trades.interface';

@Injectable()
export class TradesService {
  constructor(private _httpService: HttpService) {}

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

  /**
   * Gets the url with query params required to load trades
   * @param baseUrl
   * @param pageSize Max 500
   */
  getTradesUrl(baseUrl: string, pageSize: number): URL {
    const tradesUrl = new URL('trades', baseUrl);
    const tradesPageSize = pageSize.toString();
    tradesUrl.searchParams.set('page_size', tradesPageSize);
    return tradesUrl;
  }
}
