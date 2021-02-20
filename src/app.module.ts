import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfitService } from './profit/profit.service';
import { WalletsService } from './wallets/wallets.service';
import { TradesService } from './trades/trades.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ProfitService, WalletsService, TradesService],
})
export class AppModule {}
