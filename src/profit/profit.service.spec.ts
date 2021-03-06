import { Test, TestingModule } from '@nestjs/testing';
import { ProfitService } from './profit.service';
import { Transaction } from './models/transaction.interface';
import { Trade } from './models/trade.interface';

const generateTrade = (
  type: 'buy' | 'sell',
  cryptoCoinId: number,
  amountCrypto: number,
  amountFiat: number,
  tradeUnixTime: number,
): Trade => {
  return <Trade>{
    cryptoCoinId: cryptoCoinId,
    unixTime: tradeUnixTime,
    amountFiat,
    amountCrypto,
    type,
  };
};

const generateWithdrawal = (
  amountCrypto: number,
  transactionUnixTime: number,
  fee = 0,
): Transaction => {
  return <Transaction>{
    amountCrypto: amountCrypto,
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
    const trades: Trade[] = [
      generateTrade('sell', 1, 100, 400, 1611935044),
      generateTrade('buy', 1, 100, 200, 1611935043),
    ];

    const result = service.getWalletState(
      trades,
      [],
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(200);
  });

  it('should return profits with different prices of two buys, if everything was sold', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 200, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(
      trades,
      [],
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(200);
  });

  it('should return profits with different prices of two buys, if not everything was sold', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 100, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(
      trades,
      [],
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(100);
    expect(result?.profitPerYear.get(2021)).toBe(400);
    expect(result?.assets?.get(1611935043)?.amount).toBe(0);
    expect(result?.assets?.get(1611935044)?.amount).toBe(100);
  });

  it('should return profits with different prices of two buys and two sells', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 100, 400, 1611935046),
      generateTrade('sell', 1, 100, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(
      trades,
      [],
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(600);
    expect(result?.assets?.get(1611935043)?.amount).toBe(0);
    expect(result?.assets?.get(1611935044)?.amount).toBe(0);
  });

  it('should return profits of two buys and two sells of different years', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 100, 400, 1650000000),
      generateTrade('sell', 1, 100, 500, 1611935045),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const result = service.getWalletState(
      trades,
      [],
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(400);
    expect(result?.profitPerYear.get(2022)).toBe(200);
  });

  it('should reduce asset, if a withdrawal was made', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 50, 500, 1611935045),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Transaction[] = [generateWithdrawal(50, 1611935044)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(450);
  });

  it('should reduce profit, if a withdrawal was made between sells and no more of the cheaper coins are left', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 100, 500, 1611935046),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Transaction[] = [generateWithdrawal(100, 1611935045)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(300);
  });

  it('should reduce profit, if a withdrawal was made between sells and only some more of the cheaper coins are left', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 100, 500, 1611935046),
      generateTrade('buy', 1, 100, 200, 1611935044),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Transaction[] = [generateWithdrawal(50, 1611935045)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(50);
    expect(result?.profitPerYear.get(2021)).toBe(350);
  });

  it('should reduce asset, if a withdrawal was made and fees were charged', () => {
    const trades: Trade[] = [
      generateTrade('sell', 1, 50, 500, 1611935045),
      generateTrade('buy', 1, 100, 100, 1611935043),
    ];

    const withdrawals: Transaction[] = [generateWithdrawal(45, 1611935044, 5)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(0);
    expect(result?.profitPerYear.get(2021)).toBe(450);
  });

  it('should reduce BEST, if BEST is used for paying fees', () => {
    const trades: Trade[] = [generateTrade('buy', 1, 100, 100, 1611935043)];

    const withdrawals: Transaction[] = [generateWithdrawal(0, 1611935044, 5)];

    const result = service.getWalletState(
      trades,
      withdrawals,
      [],
      '',
      Date.now() / 1000,
    );

    expect(result?.amountCrypto).toBe(95);
  });
});
