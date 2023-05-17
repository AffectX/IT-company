import { Module } from '@nestjs/common';
import { OutsorcedService } from './outsorced.service';
import { OutsorcedController } from './outsorced.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [OutsorcedController],
  providers: [OutsorcedService, PrismaService]
})
export class OutsorcedModule {}
