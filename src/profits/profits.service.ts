import { Injectable } from '@nestjs/common';
import { WalletStateResponseItem } from 'src/profit/models/wallet-state-response-item.interface';

@Injectable()
export class ProfitsService {
  getProfitsForYears(
    responseItems: WalletStateResponseItem[],
  ): Map<number, number> {
    const profitPerYearItems = responseItems.map((res) => res.profitPerYear);

    return this.getPerYear(profitPerYearItems);
  }

  getTaxableForYears(
    responseItems: WalletStateResponseItem[],
  ): Map<number, number> {
    const taxablePerYear = responseItems.map((res) => res.taxablePerYear);

    return this.getPerYear(taxablePerYear);
  }

  private getPerYear(
    profitPerYearItems: [number, number][][],
  ): Map<number, number> {
    const profitsPerYear = new Map<number, number>();

    profitPerYearItems.forEach((profit) => {
      profit.forEach((p) => {
        const prevVal = profitsPerYear.has(p[0])
          ? Number(profitsPerYear.get(p[0]))
          : 0;

        profitsPerYear.set(p[0], prevVal + p[1]);
      });
    });

    return profitsPerYear;
  }
}
