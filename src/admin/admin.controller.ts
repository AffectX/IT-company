import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';

import { Roles } from 'src/auth/guard/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { TakeRoleDto } from './dto/take-role.dto';
import { UserService } from 'src/user/user.service';
import { OutsorcedService } from 'src/outsorced/outsorced.service';
import { CompletedOutsorcedDto } from 'src/outsorced/dto/completed-outsorced.dto';
import { TeamService } from 'src/team/team.service';
import { GiveLeaderDto } from 'src/team/dto/give-leader.dto';
import { GiveMembershipDto } from 'src/team/dto/give-membership.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly outsorcedSerivce: OutsorcedService,
    private readonly teamService: TeamService
  ) { }


  @ApiOperation({ summary: "Выдать роль" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('take-role')
  takeRole(@Req() req: RequestWithUser, @Body() takeRoleDto: TakeRoleDto) {
    return this.adminService.takeRole(req, takeRoleDto);
  }

  @ApiOperation({ summary: "Все пользователи" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('all-users')
  getAllUsers() {
    return this.userService.findAll()
  }


  @ApiOperation({ summary: "Все заявки консультанта" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('outsorced')
  findAllOutsorced() {
    return this.outsorcedSerivce.findAll()
  }

  @ApiOperation({ summary: "Подтвердить консультацию" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('outsorced')
  completedOutsorced(@Body() completedOutsorcedDto: CompletedOutsorcedDto) {
    return this.outsorcedSerivce.completedOutsorced(completedOutsorcedDto)
  }

  @ApiOperation({ summary: "Команды без участников" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('no-team')
  noTeam() {
    return this.teamService.findNoTeam();
  }


  @ApiOperation({ summary: "Создать пустую команду" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('create-team')
  createRandomTeam() {
    return this.teamService.createRandomTeam();
  }

  @ApiOperation({ summary: "Выдать лидера (пустой команде)" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('give-leader')
  giveLeader(@Body() giveLeaderDto: GiveLeaderDto) {
    return this.teamService.giveLeader(giveLeaderDto);
  }

  @ApiOperation({ summary: "Пустые команды" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('empty-team')
  emptyTeam() {
    return this.teamService.emptyTeam();
  }

  @ApiOperation({ summary: "Добавить участника в команду" })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('give-membership')
  giveMembership(@Body() giveMembershipDto: GiveMembershipDto) {
    return this.teamService.giveMembership(giveMembershipDto);
  }


}
