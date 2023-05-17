import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OutsorcedService } from './outsorced.service';
import { Request } from 'express';
import { OutsorcedDto } from './dto/outsorced.dto';
import { Roles } from 'src/auth/guard/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('outsorced')

@Controller('outsorced')
export class OutsorcedController {
  constructor(private readonly outsorcedService: OutsorcedService) {}


  @ApiOperation({ summary: "Заявка на аутсорс" })
  @Roles('ADMIN', 'USER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  outsorced(@Req() req: RequestWithUser, @Body() outsorcedDto: OutsorcedDto) {
    return this.outsorcedService.outsorced(req, outsorcedDto)
  }

  @ApiOperation({ summary: "Мои аутсорс заявки" })
  @Roles('ADMIN', 'USER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  myOutsorced(@Req() req: RequestWithUser) {
    return this.outsorcedService.myOutsorced(req)
  }

}
