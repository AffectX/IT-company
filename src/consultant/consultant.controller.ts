import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ConsultantService } from './consultant.service';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { Roles } from 'src/auth/guard/roles-auth.decorator';
import { Request } from 'express';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { CompleteConsultantDto } from './dto/complete-consultant.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('consultant')
@Controller('consultant')
export class ConsultantController {
  constructor(private readonly consultantService: ConsultantService) {}


  @ApiOperation({ summary: "Моя помощь" })
  @Roles('ADMIN', 'CONSULTANT')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('help')
  myhelp(@Req() req: RequestWithUser) {
    return this.consultantService.myhelp(req);
  }

  @ApiOperation({ summary: "Помощь команде" })
  @Roles('ADMIN', 'USER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  helpTeam(@Body() helpDto: CreateConsultantDto, @Req() req: RequestWithUser) {
    return this.consultantService.helpTeam(helpDto, req);
  }

  @ApiOperation({ summary: "Подтвердить заявку" })
  @Roles('ADMIN', 'CONSULTANT')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('complete')
  completeTicket(@Body() completeTicketDto: CompleteConsultantDto, @Req() req: RequestWithUser) {
    return this.consultantService.completeHelp(completeTicketDto, req);
  }



}
