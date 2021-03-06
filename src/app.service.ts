import { ProfitService } from './profit/profit.service';
import { Injectable } from '@nestjs/common';
import { WalletStateResponseItem } from './profit/models/wallet-state-response-item.interface';
import { WalletState } from './profit/models/wallet-state.interface';
import { WalletStateResponse } from './profit/models/wallet-state-response.interface';
import { AuthHeader } from './models/auth-header.interface';
import { ProfitCalculationInput } from './profit/models/profit-calculation-input.interface';
import { ProfitsService } from './profits/profits.service';
import {
  Transaction,
  TransactionType,
} from './profit/models/transaction.interface';
import { Trade } from './profit/models/trade.interface';
import { TransferData } from './models/transfers.interface';

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
          amountFiat: state.amountFiat,
          assets: Array.from(state.assets).filter((a) => a[1].amount),
          profitPerYear: Array.from(state.profitPerYear),
          taxablePerYear: Array.from(state.taxablePerYear),
        },
    );
  }

  private toWalletStates(res: ProfitCalculationInput): WalletState[] {
    const walletStates: WalletState[] = [];
    res.wallets.forEach((wallet) => {
      const tradesOfWallet = res.trades
        .filter((t) => t.attributes.wallet_id === wallet.id)
        .map(
          (t) =>
            <Trade>{
              cryptoCoinId: Number(t.attributes.cryptocoin_id),
              unixTime: Number(t.attributes.time.unix),
              amountCrypto: Number(t.attributes.amount_cryptocoin),
              amountFiat: Number(t.attributes.amount_fiat),
              type: t.attributes.type,
            },
        );

      const withdrawalsOfWallet = res.withdrawals
        .filter((withdrawal) => withdrawal.attributes.wallet_id === wallet.id)
        .map((w) => this.toTransaction(w, 'withdrawal'));

      const depositsOfWallet = res.deposits
        .filter((deposit) => deposit.attributes.wallet_id === wallet.id)
        .map((d) => this.toTransaction(d, 'deposit'));

      const profits = this._profitService.getWalletState(
        tradesOfWallet,
        withdrawalsOfWallet,
        depositsOfWallet,
        wallet.attributes.cryptocoin_symbol,
        Date.now() / 1000,
      );

      if (profits) {
        walletStates.push(profits);
      }
    });

    return walletStates;
  }

  private toTransaction(w: TransferData, type: TransactionType): Transaction {
    return <Transaction>{
      type,
      unixTime: Number(w.attributes.time.unix),
      amountCrypto: Number(w.attributes.amount),
      amountEur: Number(w.attributes.amount_eur),
      fee: Number(w.attributes.fee),
    };
  }
}
