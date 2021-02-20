import { ProfitService } from './profit/profit.service';
import { Injectable } from '@nestjs/common';
import { WalletStateResponseItem } from './profit/models/wallet-state-response-item.interface';
import { WalletState } from './profit/models/wallet-state.interface';
import { WalletStateResponse } from './profit/models/wallet-state-response.interface';
import { AuthHeader } from './models/auth-header.interface';
import { ProfitCalculationInput } from './profit/models/profit-calculation-input.interface';
import { ProfitsService } from './profits/profits.service';

@Injectable()
export class AppService {
  constructor(
    private _profitsService: ProfitsService,
    private _profitService: ProfitService,
  ) {}

  getHttpHeaders(apiToken: string): AuthHeader {
    const httpGetHeaders = {
      'X-API-KEY': apiToken,
    };

    return httpGetHeaders;
  }

  toProfitResponse(res: ProfitCalculationInput): WalletStateResponse {
    const walletStates = this.toWalletStates(res);
    const responseItems = this.toWalletStateResponseItems(walletStates);
    const response = this.toWalletStateResponse(responseItems);

    return response;
  }

  private toWalletStateResponse(
    responseItems: WalletStateResponseItem[],
  ): WalletStateResponse {
    const profitsPerYear = this._profitsService.getProfitsForYears(
      responseItems,
    );

    const taxablesPerYear = this._profitsService.getTaxableForYears(
      responseItems,
    );

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

  private toWalletStates(res: ProfitCalculationInput): WalletState[] {
    const walletStates: WalletState[] = [];
    res.wallets.forEach((wallet) => {
      const tradesOfWallet = res.trades.filter(
        (t) => t.attributes.wallet_id === wallet.id,
      );

      const withdrawalsOfWallet = res.withdrawals.filter(
        (withdrawal) => withdrawal.attributes.wallet_id === wallet.id,
      );

      const profits = this._profitService.getWalletState(
        tradesOfWallet,
        withdrawalsOfWallet,
        wallet.attributes.cryptocoin_symbol,
      );

      walletStates.push(profits);
    });

    return walletStates;
  }
}
