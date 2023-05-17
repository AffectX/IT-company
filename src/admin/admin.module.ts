import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { OutsorcedService } from 'src/outsorced/outsorced.service';
import { TeamService } from 'src/team/team.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, UserService, OutsorcedService, TeamService]
})
export class AdminModule {}
