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
import { WalletStateResponse } from './profit/models/wallet-state-response.interface';
import { WalletsService } from './wallets/wallets.service';
import { TradesService } from './trades/trades.service';
import { TransactionsService } from './transactions/transactions.service';

@Controller()
export class AppController {
  private _baseUrl = 'https://api.bitpanda.com/v1/';

  constructor(
    private readonly _appService: AppService,
    private _walletsService: WalletsService,
    private _tradesService: TradesService,
    private _transactionsService: TransactionsService,
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
    const tradesUrl = this._tradesService.getTradesUrl(this._baseUrl, 250);
    const withdrawalsUrl = this._transactionsService.getTransactionsUrl(
      this._baseUrl,
      250,
      'withdrawal',
    );
    const depositsUrl = this._transactionsService.getTransactionsUrl(
      this._baseUrl,
      250,
      'deposit',
    );
    const transfersUrl = this._transactionsService.getTransactionsUrl(
      this._baseUrl,
      250,
      'transfer',
    );

    const httpHeaders = this._appService.getHttpHeaders(apiToken);

    return this._walletsService.getWallets(walletsUrl, httpHeaders).pipe(
      switchMap((walletResponse) =>
        this._tradesService.getTrades(tradesUrl, httpHeaders).pipe(
          map((tradesResponse) => ({
            wallets: walletResponse,
            trades: tradesResponse,
          })),
        ),
      ),
      switchMap((response) =>
        this._transactionsService
          .getTransactions(withdrawalsUrl, httpHeaders)
          .pipe(map((withdrawals) => ({ ...response, withdrawals }))),
      ),
      switchMap((response) =>
        this._transactionsService
          .getTransactions(depositsUrl, httpHeaders)
          .pipe(map((deposits) => ({ ...response, deposits }))),
      ),
      switchMap((response) =>
        this._transactionsService
          .getTransactions(transfersUrl, httpHeaders)
          .pipe(map((transfers) => ({ ...response, deposits: transfers }))),
      ),
      map((res) => ({
        wallets: this._walletsService.filterWalletsInUse(
          res.wallets.data,
          res.trades.data,
          [...res.withdrawals.data, ...res.deposits.data],
        ),
        trades: res.trades.data,
        withdrawals: res.withdrawals.data,
        deposits: res.deposits.data,
        transfers: res.deposits.data,
      })),
      map((res) => this._appService.toProfitResponse(res)),
    );
  }
}
