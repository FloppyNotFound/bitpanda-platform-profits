import { TradeData } from './../models/trades.interface';
import { Injectable } from '@nestjs/common';
import { WalletState } from './models/wallet-state.interface';
import { Crypto } from './models/crypto.interface';
import * as dayjs from 'dayjs';
import { TransferData } from '../models/transfers.interface';

@Injectable()
export class ProfitService {
  getWalletState(
    trades: TradeData[],
    withdrawals: TransferData[],
    cryptoSymbol: string,
  ): WalletState | null {
    if (!trades?.length) {
      return null;
    }

    const profitPerYear = new Map<number, number>();
    const taxablePerYear = new Map<number, number>();

    const assets = new Map<number, Crypto>();

    let previousTradeUnix = 0;

    for (let i = trades.length - 1; i >= 0; i--) {
      const trade = trades[i];
      const tradeDate = new Date(Number(trade.attributes.time.unix) * 1000);
      const yearOfTrade = new Date(
        Number(trade.attributes.time.unix) * 1000,
      ).getFullYear();

      const amountCrypto = Number(trade.attributes.amount_cryptocoin);
      const amountFiat = Number(trade.attributes.amount_fiat);
      const pricePerCoin = amountFiat / amountCrypto;

      //#region Reduce Assets by Withdrawals
      let amountWithdrawals = this.getAmountWithdrawals(
        withdrawals,
        trade,
        previousTradeUnix,
      );

      assets.forEach((a) => {
        // If there have been withdrawals before this sell,
        // the amount of available assets are decreased
        if (amountWithdrawals) {
          if (amountWithdrawals >= a.amount) {
            amountWithdrawals -= a.amount;
            a.amount = 0;
          } else {
            a.amount -= amountWithdrawals;
            amountWithdrawals = 0;
          }
        }
      });
      //#endregion

      if (trade.attributes.type === 'buy') {
        assets.set(Number(trade.attributes.time.unix), <Crypto>{
          amount: amountCrypto,
          amountOriginally: amountCrypto,
          priceFiat: amountFiat,
          priceFiatPerCoin: amountFiat / amountCrypto,
        });
      } else if (trade.attributes.type === 'sell') {
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

          const pricePerCoinOnTimeOfBuy = a.priceFiat / a.amountOriginally;

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

          a.amount -= amountOfThisCoinDateToSell;
          amountCryptosToSell -= amountOfThisCoinDateToSell;
        });
      } else {
        throw new Error('Unknown trade type ' + trade.attributes.type);
      }

      previousTradeUnix = Number(trade.attributes.time.unix);
    }

    return <WalletState>{
      cryptoId: Number(trades[0].attributes.cryptocoin_id),
      cryptoSymbol,
      amountCrypto: Array.from(assets.values())
        .map((d) => d.amount)
        .reduce((prev, cur) => prev + cur, 0),
      profitPerYear,
      taxablePerYear,
      assets,
    };
  }

  private getAmountWithdrawals(
    withdrawals: TransferData[],
    trade: TradeData,
    previousTradeUnix: number,
  ) {
    return withdrawals
      .filter((w) => {
        const withdrawalTime = Number(w.attributes.time.unix);
        const tradeTime = Number(trade.attributes.time.unix);

        return withdrawalTime < tradeTime && withdrawalTime > previousTradeUnix;
      })
      .map((w) => Number(w.attributes.amount) + Number(w.attributes.fee))
      .reduce((prev, cur) => prev + cur, 0);
  }

  private getProfit(
    profitPerYear: Map<number, number>,
    yearOfTrade: number,
    sellPrice: number,
    buyPrice: number,
  ) {
    const profitOfYear = profitPerYear.get(yearOfTrade) ?? 0;
    const profit =
      (profitOfYear * 100 + sellPrice * 100 - buyPrice * 100) / 100;
    return profit;
  }

  private checkIsOlderThanOneYear(unixBuyTime: number, tradeDate: Date) {
    const buyDate = new Date(unixBuyTime * 1000);

    return dayjs(buyDate).isBefore(dayjs(tradeDate).add(-1, 'year'));
  }
}
