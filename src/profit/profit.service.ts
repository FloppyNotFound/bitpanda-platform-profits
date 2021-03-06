import { Injectable } from '@nestjs/common';
import { WalletState } from './models/wallet-state.interface';
import { Crypto } from './models/crypto.interface';
import * as dayjs from 'dayjs';
import { Transaction } from './models/transaction.interface';
import minus from '../helpers/minus';
import plus from '../helpers/plus';
import { Trade } from './models/trade.interface';

@Injectable()
export class ProfitService {
  getWalletState(
    trades: Trade[],
    withdrawals: Transaction[],
    deposits: Transaction[],
    cryptoSymbol: string,
    untilUnixSeconds: number,
  ): WalletState | null {
    if (!trades?.length) {
      return null;
    }

    const profitPerYear = new Map<number, number>();
    const taxablePerYear = new Map<number, number>();

    const assets = new Map<number, Crypto>();

    for (let i = trades.length - 1; i >= 0; i--) {
      const trade = trades[i];
      const tradeDate = new Date(trade.unixTime * 1000);
      const yearOfTrade = new Date(Number(trade.unixTime) * 1000).getFullYear();

      const amountCrypto = Number(trade.amountCrypto);
      const amountFiat = Number(trade.amountFiat);
      const pricePerCoin = amountFiat / amountCrypto;

      //#region Reduce by Withdrawals and increase by Deposits until current trade
      const amountWithdrawals = this.getAmountWithdrawals(
        withdrawals,
        trade.unixTime,
      );

      this.reduceAssetsByWithdrawals(assets, amountWithdrawals);

      this.increaseAssetsByDeposits(deposits, trade.unixTime, assets);
      //#endregion

      if (trade.type === 'buy') {
        assets.set(trade.unixTime, <Crypto>{
          amount: amountCrypto,
          amountOriginally: amountCrypto,
          amountEur: amountFiat,
          priceFiatPerCoin: amountFiat / amountCrypto,
        });
      } else if (trade.type === 'sell') {
        let amountCryptosToSell = amountCrypto;

        assets.forEach((a, key) => {
          if (!amountCryptosToSell || !a.amount) {
            return;
          }

          const amountAvailableOfThisDate = a.amount;

          const areEnoughCoinsToSellAvailable =
            amountCryptosToSell <= amountAvailableOfThisDate;

          const amountOfThisCoinDateToSell = areEnoughCoinsToSellAvailable
            ? amountCryptosToSell
            : amountAvailableOfThisDate;

          const pricePerCoinOnTimeOfBuy = a.amountEur / a.amountOriginally;

          const sellPrice = amountOfThisCoinDateToSell * pricePerCoin;
          const buyPrice = amountOfThisCoinDateToSell * pricePerCoinOnTimeOfBuy;

          const profit = this.getProfit(
            profitPerYear,
            yearOfTrade,
            sellPrice,
            buyPrice,
          );
          profitPerYear.set(yearOfTrade, profit);

          if (!this.checkIsOlderThanOneYear(key, tradeDate)) {
            const tax = this.getProfit(
              taxablePerYear,
              yearOfTrade,
              sellPrice,
              buyPrice,
            );

            taxablePerYear.set(yearOfTrade, tax);
          }

          a.amount = minus(a.amount, amountOfThisCoinDateToSell);
          amountCryptosToSell = minus(
            amountCryptosToSell,
            amountOfThisCoinDateToSell,
          );
        });
      } else {
        throw new Error('Unknown trade type ' + trade.type);
      }
    }

    //#region Reduce by Withdrawals and increase by Deposits until given date
    const amountWithdrawals = this.getAmountWithdrawals(
      withdrawals,
      untilUnixSeconds,
    );

    this.reduceAssetsByWithdrawals(assets, amountWithdrawals);

    this.increaseAssetsByDeposits(deposits, untilUnixSeconds, assets);
    //#endregion

    return <WalletState>{
      // Is the same for all trades of wallet
      cryptoId: Number(trades[0].cryptoCoinId),
      cryptoSymbol,
      amountCrypto: Array.from(assets.values())
        .map((d) => d.amount)
        .reduce((prev, cur) => plus(prev, cur), 0),
      profitPerYear,
      taxablePerYear,
      assets,
    };
  }

  private increaseAssetsByDeposits(
    deposits: Transaction[],
    unixTime: number,
    assets: Map<number, Crypto>,
  ) {
    deposits
      .filter((d) => this.checkShouldTransactionShouldBeHandled(d, unixTime))
      .forEach((d) => {
        d.wasHandled = true;
        assets.set(d.unixTime, <Crypto>{
          amount: d.amountCrypto,
          amountOriginally: d.amountCrypto,
          amountEur: d.amountEur,
          priceFiatPerCoin: d.amountEur / d.amountCrypto,
        });
      });
  }

  private reduceAssetsByWithdrawals(
    assets: Map<number, Crypto>,
    amountWithdrawals: number,
  ): void {
    for (const asset of assets.values()) {
      if (!amountWithdrawals) {
        break;
      }

      const [
        newAssetAmount,
        newAmountWithdrawals,
      ] = this.getReducedAssetAmountByWithdrawals(
        asset.amount,
        amountWithdrawals,
      );

      asset.amount = newAssetAmount;
      amountWithdrawals = newAmountWithdrawals;
    }
  }

  /**
   * @returns Tuple with reduced asset amount as first and reduced amount withdrawals as second value
   */
  private getReducedAssetAmountByWithdrawals(
    assetAmount: number,
    amountWithdrawals: number,
  ): [number, number] {
    if (!amountWithdrawals) {
      return [assetAmount, amountWithdrawals];
    }

    let newAssetAmount = assetAmount;
    let newAmountWithdrawals = amountWithdrawals;

    if (amountWithdrawals >= assetAmount) {
      newAmountWithdrawals = minus(amountWithdrawals, assetAmount);
      newAssetAmount = 0;
    } else {
      newAssetAmount = minus(assetAmount, amountWithdrawals);
      newAmountWithdrawals = 0;
    }

    if (newAssetAmount < 0 || newAmountWithdrawals < 0) {
      throw new Error(
        'Reducing assets by withdrawals resulted in negative result',
      );
    }

    return [newAssetAmount, newAmountWithdrawals];
  }

  private getAmountWithdrawals(withdrawals: Transaction[], untilUnix: number) {
    return withdrawals
      .filter((w) => this.checkShouldTransactionShouldBeHandled(w, untilUnix))
      .map((w) => {
        w.wasHandled = true;
        return plus(w.amountCrypto, w.fee);
      })
      .reduce((prev, cur) => plus(prev, cur), 0);
  }

  private checkShouldTransactionShouldBeHandled(
    w: Transaction,
    untilUnix: number,
  ): boolean {
    return !w.wasHandled && w.unixTime <= untilUnix;
  }

  private getProfit(
    profitPerYear: Map<number, number>,
    yearOfTrade: number,
    sellPrice: number,
    buyPrice: number,
  ) {
    const profitOfYear = profitPerYear.get(yearOfTrade) ?? 0;
    return plus(profitOfYear, minus(sellPrice, buyPrice));
  }

  private checkIsOlderThanOneYear(unixBuyTime: number, tradeDate: Date) {
    const buyDate = new Date(unixBuyTime * 1000);

    return dayjs(buyDate).isBefore(dayjs(tradeDate).add(-1, 'year'));
  }
}
