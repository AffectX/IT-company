import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, PrismaService, UserService]
})
export class OrganizationModule {}
