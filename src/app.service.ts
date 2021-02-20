import { ProfitService } from './profit/profit.service';
import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthHeader } from './models/auth-header.interface';
import { TradeData, TradesResponse } from './models/trades.interface';
import { Wallet } from './models/wallet.interface';
import { WalletStateResponseItem } from './profit/models/wallet-state-response-item.interface';
import { WalletState } from './profit/models/wallet-state.interface';
import { WalletStateResponse } from './profit/models/wallet-state-response.interface';

@Injectable()
export class AppService {
  constructor(
    private _httpService: HttpService,
    private _profitService: ProfitService,
  ) {}

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

  toProfitResponse(res: {
    wallets: Wallet[];
    trades: TradeData[];
  }): WalletStateResponse {
    const walletStates = this.toWalletStates(res);
    const responseItems = this.toWalletStateResponseItems(walletStates);
    const response = this.toWalletStateResponse(responseItems);

    return response;
  }

  private toWalletStateResponse(
    responseItems: WalletStateResponseItem[],
  ): WalletStateResponse {
    const profitsPerYear = this.getProfitsForYears(responseItems);

    const taxablesPerYear = this.getTaxableForYears(responseItems);

    return <WalletStateResponse>{
      items: responseItems,
      profitPerYear: Array.from(profitsPerYear),
      taxablePerYear: Array.from(taxablesPerYear),
    };
  }

  private toWalletStateResponseItems(
    walletState: WalletState[],
  ): WalletStateResponseItem[] {
    return walletState.map(
      (state) =>
        <WalletStateResponseItem>{
          cryptoSymbol: state.cryptoSymbol,
          amountCrypto: state.amountCrypto,
          assets: Array.from(state.assets).filter((a) => a[1].amount),
          profitPerYear: Array.from(state.profitPerYear),
          taxablePerYear: Array.from(state.taxablePerYear),
        },
    );
  }

  private toWalletStates(res: { wallets: Wallet[]; trades: TradeData[] }) {
    const walletStates: WalletState[] = [];
    res.wallets.forEach((w) => {
      const tradesOfWallet = res.trades.filter(
        (t) => t.attributes.wallet_id === w.id,
      );

      const profits = this._profitService.getProfits(
        tradesOfWallet,
        w.attributes.cryptocoin_symbol,
      );

      walletStates.push(profits);
    });

    return walletStates;
  }

  private getProfitsForYears(
    responseItems: WalletStateResponseItem[],
  ): Map<number, number> {
    const profitsPerYear = new Map<number, number>();

    responseItems
      .map((res) => res.profitPerYear)
      .forEach((profit) => {
        profit.forEach((p) => {
          const prevVal = profitsPerYear.has(p[0])
            ? profitsPerYear.get(p[0])
            : 0;

          profitsPerYear.set(p[0], prevVal + p[1]);
        });
      });
    return profitsPerYear;
  }

  private getTaxableForYears(
    responseItems: WalletStateResponseItem[],
  ): Map<number, number> {
    const profitsPerYear = new Map<number, number>();

    responseItems
      .map((res) => res.taxablePerYear)
      .forEach((profit) => {
        profit.forEach((p) => {
          const prevVal = profitsPerYear.has(p[0])
            ? profitsPerYear.get(p[0])
            : 0;

          profitsPerYear.set(p[0], prevVal + p[1]);
        });
      });
    return profitsPerYear;
  }
}
