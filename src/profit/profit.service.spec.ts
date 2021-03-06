import { Test, TestingModule } from '@nestjs/testing';
import { TradeData } from '../models/trades.interface';
import { ProfitService } from './profit.service';
import { v4 as uuidv4 } from 'uuid';
import { Withdrawal } from '../models/withdrawal.interface';

const generateTrade = (
  type: 'buy' | 'sell',
  cryptocointId: number,
  amountCrypto: number,
  amountFiat: number,
  tradeUnixTime: number,
): TradeData => {
  return {
    type: 'trade',
    attributes: {
      status: 'finished',
      type,
      cryptocoin_id: cryptocointId.toString(),
      fiat_id: '1',
      amount_fiat: amountFiat.toString(),
      amount_cryptocoin: amountCrypto.toString(),
      fiat_to_eur_rate: '1.00000000',
      wallet_id: 'eae0d8b2-d2bf-4401-bf99-fc5f9a8747cb',
      fiat_wallet_id: 'af5d6d64-59e4-11e9-8c75-0a0e6623f374',
      time: {
        date_iso8601: '',
        unix: tradeUnixTime.toString(),
      },
      price: '0.047144',
      is_swap: false,
      is_savings: false,
      tags: [],
      bfc_used: true,
      best_fee_collection: {
        type: 'best_fee_collection',
        attributes: {
          best_current_price_eur: '0.34382482',
          best_used_price_eur: '0.34382482',
          bfc_deduction: 0.2001,
          bfc_market_value_eur: '2.62000000',
          wallet_transaction: {
            type: 'wallet_transaction',
            attributes: {
              amount: '0.00000000',
              recipient: 'Bitpanda',
              time: {
                date_iso8601: '2021-02-04T09:30:46+01:00',
                unix: '1612427446',
              },
              confirmations: 99,
              in_or_out: 'outgoing',
              type: 'withdrawal',
              status: 'finished',
              amount_eur: '0.00',
              wallet_id: '2e378c99-7715-49d5-8062-128c6152c36d',
              confirmation_by: 'not_required',
              confirmed: false,
              cryptocoin_id: '33',
              last_changed: {
                date_iso8601: '2021-02-04T09:30:46+01:00',
                unix: '1612427446',
              },
              fee: '7.62015959',
              current_fiat_id: '1',
              current_fiat_amount: '0.00',
              is_metal_storage_fee: false,
              tags: [],
              public_status: 'finished',
              is_bfc: true,
            },
            id: '43e72cfd-a7ca-4a1b-b73c-0ea5b4475acd',
          },
        },
      },
    },
    id: uuidv4(),
  };
};

const generateWithdrawal = (
  amountCrypto: number,
  transactionUnixTime: number,
  fee = 0,
): Withdrawal => {
  return <Withdrawal>{
    amount: amountCrypto,
    unixTime: transactionUnixTime,
    fee,
  };
};

describe('ProfitService', () => {
  let service: ProfitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitService],
    }).compile();

    service = module.get<ProfitService>(ProfitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return profits, if everything was sold', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 100, 400, 1611935044),
      generateTrade('buy', 1, 100, 200, 1611935043),
    ];

    const result = service.getWalletState(trades, [], '', Date.now() / 1000);

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(200);
  });

  it('should return profits with different prices of two buys, if everything was sold', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 200, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(trades, [], '', Date.now() / 1000);

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(200);
  });

  it('should return profits with different prices of two buys, if not everything was sold', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 100, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(trades, [], '', Date.now() / 1000);

    expect(result?.amountCrypto).toBe(100);
    expect(result?.profitPerYear.get(2021)).toBe(400);
    expect(result?.assets?.get(1611935043)?.amount).toBe(0);
    expect(result?.assets?.get(1611935044)?.amount).toBe(100);
  });

  it('should return profits with different prices of two buys and two sells', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 100, 400, 1611935046),
      generateTrade('sell', 1, 100, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(trades, [], '', Date.now() / 1000);

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(600);
    expect(result?.assets?.get(1611935043)?.amount).toBe(0);
    expect(result?.assets?.get(1611935044)?.amount).toBe(0);
  });

  it('should return profits of two buys and two sells of different years', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 100, 400, 1650000000),
      generateTrade('sell', 1, 100, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(trades, [], '', Date.now() / 1000);

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(400);
    expect(result?.profitPerYear.get(2022)).toBe(200);
  });

  it('should reduce asset, if a withdrawal was made', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 50, 500, 1611935045),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Withdrawal[] = [generateWithdrawal(50, 1611935044)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(450);
  });

  it('should reduce profit, if a withdrawal was made between sells and no more of the cheaper coins are left', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 100, 500, 1611935046),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Withdrawal[] = [generateWithdrawal(100, 1611935045)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(300);
  });

  it('should reduce profit, if a withdrawal was made between sells and only some more of the cheaper coins are left', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 100, 500, 1611935046),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Withdrawal[] = [generateWithdrawal(50, 1611935045)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(50);
    expect(result?.profitPerYear.get(2021)).toBe(350);
  });

  it('should reduce asset, if a withdrawal was made and fees were charged', () => {
    const trades: TradeData[] = [
      generateTrade('sell', 1, 50, 500, 1611935045),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Withdrawal[] = [generateWithdrawal(45, 1611935044, 5)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(450);
  });

  it('should reduce BEST, if BEST is used for paying fees', () => {
    const trades: TradeData[] = [generateTrade('buy', 1, 100, 100, 1611935043)];

    const withdrawals: Withdrawal[] = [generateWithdrawal(0, 1611935044, 5)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(95);
  });
});
