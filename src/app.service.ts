import { ProfitService } from './profit/profit.service';
import { Injectable } from '@nestjs/common';
import { TradeData } from './models/trades.interface';
import { Wallet } from './models/wallet.interface';
import { WalletStateResponseItem } from './profit/models/wallet-state-response-item.interface';
import { WalletState } from './profit/models/wallet-state.interface';
import { WalletStateResponse } from './profit/models/wallet-state-response.interface';
import { TransferData } from './models/transfers.interface';
import { AuthHeader } from './models/auth-header.interface';

@Injectable()
export class AppService {
  constructor(private _profitService: ProfitService) {}

  getHttpHeaders(apiToken: string): AuthHeader {
    const httpGetHeaders = {
      'X-API-KEY': apiToken,
    };

    return httpGetHeaders;
  }

  toProfitResponse(res: {
    wallets: Wallet[];
    trades: TradeData[];
    withdrawals: TransferData[];
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
