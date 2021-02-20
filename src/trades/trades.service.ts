import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthHeader } from 'src/models/auth-header.interface';
import { TradesResponse } from 'src/models/trades.interface';

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
}
