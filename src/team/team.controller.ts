import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/guard/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { GiveTeamRoleDto } from './dto/give-team-role.dto';
import { KickMemberDto } from './dto/kick-member.dto';

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @ApiOperation({ summary: "Создать команду" })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() createTeamDto: CreateTeamDto, @Req() req: RequestWithUser) {
    return this.teamService.create(req, createTeamDto);
  }

  @ApiOperation({ summary: "Выдать командную роль" })
  @Roles('USER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put('give-role')
  giveTeamRole(@Req() req: RequestWithUser, @Body() giveTeamRoleDto: GiveTeamRoleDto){
    return this.teamService.giveTeamRole(req, giveTeamRoleDto);
  }

  @ApiOperation({ summary: "Выгнать пользователя из команды" })
  @Roles('USER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put('kick')
  kickMember(@Req() req: RequestWithUser, @Body() kickMemberDto: KickMemberDto){
    return this.teamService.kickMember(req, kickMemberDto);
  }

  @ApiOperation({ summary: "Все команды" })
  @Get('all')
  findAll() {
    return this.teamService.findAll();
  }


  @ApiOperation({ summary: "Рейтинг команд" })
  @Roles('USER')
  @UseGuards(RolesGuard)
  @Get('rating')
  rating() {
    return this.teamService.rating();
  }


  @ApiOperation({ summary: "Таблица транзакций команды" })
  @UseGuards(JwtAuthGuard)
  @Get('table')
  table(){
    return this.teamService.history()
  }


  @ApiOperation({ summary: "Моя команда" })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  myTeam(@Req() req: RequestWithUser) {
    return this.teamService.myTeam(req)
  }

  @ApiOperation({ summary: "Команда по Id" })
  @Get(':teamId')
  teamProfile(@Param('teamId') teamId: string) {
    return this.teamService.teamProfile(+teamId);
  }


  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Req() req: RequestWithUser) {
    return this.teamService.remove(req);
  }

  @ApiOperation({ summary: "Вступить в команду" })
  @UseGuards(JwtAuthGuard)
  @Put('join/:teamId')
  joinTeam(@Req() req: RequestWithUser, @Param('teamId') teamId: string) {
    
    return this.teamService.joinTeam(req, +teamId);
  }

  @ApiOperation({ summary: "Выйти из команды" })
  @UseGuards(JwtAuthGuard)
  @Put('leave')
  leaveTeam(@Req() req: RequestWithUser) {
    return this.teamService.leaveTeam(req);
  }








}
