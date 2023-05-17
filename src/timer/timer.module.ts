import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { PrismaService } from 'prisma/prisma.service';


@Module({
  controllers: [],
  providers: [TimerService, PrismaService]
})
export class TimerModule {}
