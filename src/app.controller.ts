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
import { TradesResponse } from './models/trades.interface';
import { Wallet, WalletResponse } from './models/wallet.interface';
import { AuthHeader } from './models/auth-header.interface';

@Controller()
export class AppController {
  private _baseUrl = 'https://api.bitpanda.com/v1/';

  constructor(private readonly _appService: AppService) {}

  /**
   * 1) Get wallets
   * 2) Get Asset Wallets (Gold, BEST, ...)
   * 3) Get FIAT wallets (EUR)
   * 4) Get Trades (type, page, page_size, )
   * 5) Get Transaction Commodity page_size
   */
  @Get()
  getTrades(
    @Query() queryParams: { apiToken: string },
  ): Observable<unknown> | null {
    const apiToken = queryParams.apiToken;

    if (!queryParams.apiToken) {
      throw new HttpException(
        'apiToken must be provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Get all user crypto wallets
    const walletsUrl = new URL('wallets', this._baseUrl);

    // Get all user asset wallets
    // const walletsUrl = new URL('asset-wallets', this._baseUrl);

    // Ge all user fiat wallets
    // const walletsUrl = new URL('fiatwallets', this._baseUrl);

    // Get trades (type=buy,sell, page=<page>, page_size=<=500)
    const tradesUrl = new URL('trades', this._baseUrl);
    const tradesPageSize = '100';
    tradesUrl.searchParams.set('page_size', tradesPageSize);

    const httpHeaders = this.getHttpHeaders(apiToken);

    return this._appService.getWallets(walletsUrl, httpHeaders).pipe(
      switchMap((walletResponse) =>
        this._appService.getTrades(tradesUrl, httpHeaders).pipe(
          map((tradesResponse) => ({
            wallets: this.filterWalletsInUse(walletResponse, tradesResponse),
            trades: tradesResponse.data,
          })),
        ),
      ),
    );
  }

  private filterWalletsInUse(
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

  private getHttpHeaders(apiToken: string): AuthHeader {
    const httpGetHeaders = {
      'X-API-KEY': apiToken,
    };

    return httpGetHeaders;
  }
}
