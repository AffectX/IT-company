import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Put } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { Roles } from 'src/auth/guard/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { TicketDto } from './dto/ticket.dto';
import { PayOffDto } from './dto/pay-off.dto';
import { EmployeeDto } from './dto/employee.dto';

@ApiTags('Organization')
@Controller('org')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }


  @ApiOperation({ summary: "Создать организацию" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req: RequestWithUser) {
    return this.organizationService.create(req, createOrganizationDto);
  }


  @ApiOperation({ summary: "Моя организация" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  myOrg(@Req() req: RequestWithUser) {
    return this.organizationService.myOrg(req);
  }

  @ApiOperation({ summary: "Проверить тикет" })
  @Roles('ADMIN', 'EMPLOYER', 'EMPLOYEE')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  checkTicket(@Req() req: RequestWithUser) {
    return this.organizationService.checkTicket(req);
  }

  @ApiOperation({ summary: "Активные тикеты" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  acceptTicket(@Req() req: RequestWithUser, @Body() ticketDto: TicketDto) {
    return this.organizationService.acceptTicket(req, ticketDto);
  }

  @ApiOperation({ summary: "Тикеты в прогрессе" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('tickets/inprogress')
  taskInProgress(@Req() req: RequestWithUser) {
    return this.organizationService.taskInProgress(req);
  }

  @ApiOperation({ summary: "Выплатить деньги команду" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('tickets/payoff')
  payOffForTask(@Req() req: RequestWithUser, @Body() payOffDto: PayOffDto) {
    return this.organizationService.payOffForTask(req, payOffDto);
  }


  @ApiOperation({ summary: "Нанаять сотрудника" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('hire-up')
  hireAnEmployee(@Req() req: RequestWithUser, @Body() employeeDto: EmployeeDto) {
    return this.organizationService.hireAnEmployee(employeeDto, req)
  }


  @ApiOperation({ summary: "Уволить сотрудника" })
  @Roles('ADMIN', 'EMPLOYER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put('dismiss')
  dismiss(@Req() req: RequestWithUser, @Body() employeeDto: EmployeeDto) {
    return this.organizationService.dismiss(employeeDto, req)

  }



}
