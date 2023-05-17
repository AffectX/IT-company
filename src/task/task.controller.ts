import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Roles } from 'src/auth/guard/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}


  @ApiOperation({ summary: "Создать задачу" })
  @Roles('EMPLOYER', 'ADMIN','EMPLOYEE')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: RequestWithUser) {   
    return this.taskService.create(createTaskDto, req);
  }

  @ApiOperation({ summary: "Все задачи" })
  @Get()
  getAll() {
    return this.taskService.getAll();
  }

  @ApiOperation({ summary: "Взять задачу" })
  @Roles('USER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':taskId')
  takeTask (@Req() req: RequestWithUser, @Param('taskId') taskId: string ) {
    return this.taskService.takeTask(req, +taskId);
  }

}
