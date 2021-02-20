import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { map, switchMap } from 'rxjs/operators';
import { AuthHeader } from './models/auth-header.interface';
import { WalletStateResponse } from './profit/models/wallet-state-response.interface';
import { WalletsService } from './wallets/wallets.service';

@Controller()
export class AppController {
  private _baseUrl = 'https://api.bitpanda.com/v1/';

  constructor(
    private readonly _appService: AppService,
    private _walletsService: WalletsService,
  ) {}

  /**
   * Calculate bitpanda platform trade profits
   * @see https://developers.bitpanda.com/platform/
   */
  @Get()
  getTradeProfits(
    @Query() queryParams: { apiToken: string },
  ): Observable<WalletStateResponse> {
    const apiToken = queryParams.apiToken;

    if (!queryParams.apiToken) {
      throw new HttpException(
        'apiToken must be provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Get all user crypto wallets
    const walletsUrl = new URL('wallets', this._baseUrl);

    const tradesUrl = new URL('trades', this._baseUrl);
    const tradesPageSize = '250'; // max value is 500
    tradesUrl.searchParams.set('page_size', tradesPageSize);

    const httpHeaders = this.getHttpHeaders(apiToken);

    return this._walletsService.getWallets(walletsUrl, httpHeaders).pipe(
      switchMap((walletResponse) =>
        this._appService.getTrades(tradesUrl, httpHeaders).pipe(
          map((tradesResponse) => ({
            wallets: this._walletsService.filterWalletsInUse(
              walletResponse,
              tradesResponse,
            ),
            trades: tradesResponse.data,
          })),
        ),
      ),
      map((res) => this._appService.toProfitResponse(res)),
    );
  }

  private getHttpHeaders(apiToken: string): AuthHeader {
    const httpGetHeaders = {
      'X-API-KEY': apiToken,
    };

    return httpGetHeaders;
  }
}
