import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DevCoin } from './blockchain';
import { DevCoinController } from './contollers/devcoin.controller';

@Module({
  imports: [HttpModule],
  controllers: [DevCoinController],
  providers: [DevCoin],
})
export class AppModule {}
