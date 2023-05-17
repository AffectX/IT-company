import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { TaskStatus } from './dto/task-status.enum';

@Injectable()
export class TaskService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService

  ) { }
  async create(createTaskDto: CreateTaskDto, req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        }

      })
      console.log(userData);

      if (!userData.org_id) {
        throw new HttpException(`Вы не состоите в организации`, HttpStatus.FORBIDDEN)
      }
      const task = await this.prismaService.task.create({
        data: {
          org_id: userData.org_id,
          ...createTaskDto
        }
      })
      if (!task) {
        throw new HttpException(`Ошибка создания задания`, HttpStatus.BAD_REQUEST)
      }
      return task;
    } catch (error) {
      console.log(error);

      throw new HttpException(error['response'], error['status'])
    }
  }

  async getAll() {
    const tasks = await this.prismaService.task.findMany({
      where: {
        NOT: {
          status: Number(TaskStatus.inProgress)
        }
      }
    })
    if (!tasks || Object.keys(tasks).length === 0) {
      throw new HttpException(`Нет новых задач. Увы!`, HttpStatus.NO_CONTENT)
    }
    return tasks
  }
  //TODO Сделать роли для команды
  async takeTask(req: RequestWithUser, taskId: number) {
    const { user } = req;
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        include: {
          team: {
            select: {
              _count: {
                select: {
                  tasks: true
                }
              },
              team_role:{
                select:{
                  value: true
                }
              }
            }
          }
        }
      })

      if (!userData.teamId) {
        throw new HttpException('Вы должны находиться в команде, чтобы взять эту задачу', HttpStatus.FORBIDDEN)
      }
      const teamRole = userData.team.team_role.map(r => r.value)
      if (teamRole[0] !== "LEADER") {
        throw new HttpException('Только лидер команды может брать задания', HttpStatus.FORBIDDEN)
      }
      if (userData.team._count.tasks >= 2) {
        throw new HttpException('Команда не может брать больше 2 активных задач', HttpStatus.FORBIDDEN)
      }

      const task = await this.prismaService.task.findUnique({
        where: {
          id: taskId
        }
      })
      if (task.status === Number(TaskStatus.inProgress)) {
        throw new HttpException('Задание занято другой командой', HttpStatus.FORBIDDEN)
      }

      await this.prismaService.task.update({
        where:{
          id: taskId
        },
        data:{
          status: Number(TaskStatus.inProgress)
        }
      })
      const ticket = await this.prismaService.taskTeam.create({
        data: {
          team_id: userData.teamId,
          task_id: task.id
        }
      });

      if(!ticket || Object.keys(ticket).length === 0) {
        throw new HttpException('Тикет не создан', HttpStatus.BAD_REQUEST)
      }

      return { statusCode: HttpStatus.OK }

    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }



}
