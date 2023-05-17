import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { TaskModule } from './task/task.module';
import { OrganizationModule } from './organization/organization.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TimerModule } from './timer/timer.module';
import { ConsultantModule } from './consultant/consultant.module';
import { AdminModule } from './admin/admin.module';
import { OutsorcedModule } from './outsorced/outsorced.module';

@Module({
  imports: [UserModule, ConfigModule.forRoot(), AuthModule, TeamModule, TaskModule, OrganizationModule, ScheduleModule.forRoot(), TimerModule, ConsultantModule, AdminModule, OutsorcedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
