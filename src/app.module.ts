import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfitService } from './profit/profit.service';
import { WalletsService } from './wallets/wallets.service';
import { TradesService } from './trades/trades.service';
import { TransactionsService } from './transactions/transactions.service';
import { ProfitsService } from './profits/profits.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ProfitService,
    WalletsService,
    TradesService,
    TransactionsService,
    ProfitsService,
  ],
})
export class AppModule {}
