import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'prisma/prisma.service';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { Organization } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { TicketDto } from './dto/ticket.dto';
import { PayOffDto } from './dto/pay-off.dto';
import { TaskStatus } from 'src/task/dto/task-status.enum';
import { EmployeeDto } from './dto/employee.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService

  ) { }


  async create(req: RequestWithUser, createOrganizationDto: CreateOrganizationDto): Promise<any> {
    const { user } = req;
    try {
      const userOrg = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          org_id: true
        }
      })

      if (userOrg.org_id) {
        throw new HttpException(`Вы уже состоите в организации`, HttpStatus.BAD_REQUEST)
      }
      console.log(await this.findName(createOrganizationDto.name));

      if (this.findName(createOrganizationDto.name) === null) {
        throw new HttpException(`Организация с таким названием уже сутществует`, HttpStatus.BAD_REQUEST)

      }
      const organization = await this.prismaService.organization.create({
        data: {
          ...createOrganizationDto,
          employee: {
            connect: {
              id: user.id
            }
          }
        },

      })

      return organization;
    } catch (error) {
      console.log(error);

      throw new HttpException(error['response'], error['status'])
    }
  }

  async myOrg(req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          org_id: true
        }
      })
      if (!userData.org_id) {
        throw new HttpException(`Вы не состоите в организации`, HttpStatus.BAD_REQUEST)
      }
      const org = await this.prismaService.organization.findUnique({
        where: {
          id: userData.org_id
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              reward: true,
              description: true,
              status: true,
              complexity: true,
              recommendedTime: true
            }
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
      return org;
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

  private async findName(name: string): Promise<Organization> {
    return await this.prismaService.organization.findFirst({
      where: {
        name
      }
    })
  }

  async checkTicket(req: RequestWithUser) {
    const { user } = req

    try {
      const userData = await this.userService.getUserById(user.id)
      const tickets = await this.prismaService.taskTeam.findMany({
        where: {
          task: {
            org_id: userData.org_id
          },
          status: Number(TaskStatus.pending)
        },
        select: {
          team: {
            select: {
              id: true,
              name: true,
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              reward: true,
            }
          }
        }
      })
      if (!tickets || Object.keys(tickets).length === 0) {
        throw new HttpException(`Нет активных заявок`, HttpStatus.BAD_REQUEST)
      }
      return tickets;
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

  async acceptTicket(req: RequestWithUser, ticketDto: TicketDto) {
    const { user } = req
    try {
      const userData = await this.userService.getUserById(user.id);

      const condition = await this.prismaService.taskTeam.findUnique({
        where: {
          team_id_task_id: {
            task_id: ticketDto.task_id,
            team_id: ticketDto.team_id
          }
        }
      })
      if (!condition || Object.keys(condition).length === 0) {
        throw new HttpException('Нет совпадений', HttpStatus.BAD_REQUEST)
      }
      if (ticketDto.isAccepted) {
        const task = await this.prismaService.task.findUnique({
          where: {
            id: ticketDto.task_id
          },
          select: {
            recommendedTime: true
          }
        });
        const deadline = new Date();
        deadline.setMinutes(deadline.getMinutes() + task.recommendedTime);
        await this.prismaService.taskTeam.update({
          where: {
            team_id_task_id: {
              task_id: ticketDto.task_id,
              team_id: ticketDto.team_id
            }
          },
          data: {
            status: Number(TaskStatus.inProgress),
            gettingStarted: new Date(),
            accepted: new Date(),
            endOfWork: deadline,
          }
        })
        return { statusCode: HttpStatus.ACCEPTED, message: `Тикет одобрен` }
      }

      await this.prismaService.taskTeam.delete({
        where: {
          team_id_task_id: {
            task_id: ticketDto.task_id,
            team_id: ticketDto.team_id,
          }
        },
      })
      await this.prismaService.task.update({
        where: {
          id: ticketDto.task_id
        },
        data: {
          status: TaskStatus.pending
        }
      })
      return { statusCode: HttpStatus.ACCEPTED, message: `Тикет отклонен` }
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

  async taskInProgress(req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.userService.getUserById(user.id)
      const tickets = await this.prismaService.taskTeam.findMany({
        where: {
          task: {
            org_id: userData.org_id
          },
          status: Number(TaskStatus.inProgress)
        },
        select: {
          team: {
            select: {
              id: true,
              name: true,
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              reward: true,
            }
          }
        }
      })

      if (!tickets || Object.keys(tickets).length === 0) {
        throw new HttpException(`Нет активных заявок`, HttpStatus.BAD_REQUEST)
      }
      return tickets;
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

  async payOffForTask(req: RequestWithUser, payOffDto: PayOffDto) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          org: {
            select: {
              id: true,
              task: {
                where: {
                  id: payOffDto.task_id
                }
              }
            }
          }
        }
      })
      const orgTasks = userData.org.task.map(t => t.id)
      const task = await this.prismaService.taskTeam.findUnique({
        where: {
          team_id_task_id: {
            task_id: payOffDto.task_id,
            team_id: payOffDto.team_id
          }
        },
        select: {
          task: {
            select: {
              reward: true
            }
          },
          team: {
            select: {
              money: true
            }
          }
        }
      })

      if (!task || Object.keys(task).length === 0) {
        throw new HttpException(`Нет записи`, HttpStatus.BAD_REQUEST)
      }

      if (!orgTasks.includes(payOffDto.task_id)) {
        throw new HttpException(`У Вашей организации не было задания с таким ID`, HttpStatus.BAD_REQUEST)
      }
      if (payOffDto.isAccepted) {
        await this.prismaService.team.update({
          where: {
            id: payOffDto.team_id
          },
          data: {
            money: { increment: task.task.reward },
            history:{
              create:{
                value: task.task.reward
              }
            },
            tasks: {
              update: {
                where: {
                  team_id_task_id: {
                    task_id: payOffDto.task_id,
                    team_id: payOffDto.team_id
                  },
                },
                data: {
                  status: Number(TaskStatus.completed)
                }
              },

            }
          }
        })
        return { statusCode: HttpStatus.ACCEPTED, message: `Платеж на ${task.task.reward} пройден` }
      }

      await this.prismaService.taskTeam.update({
        where: {
          team_id_task_id: {
            task_id: payOffDto.task_id,
            team_id: payOffDto.team_id
          },
        },
        data: {
          status: Number(TaskStatus.failed)
        }
      })
      return { statusCode: HttpStatus.ACCEPTED, message: `Статус изменен на Failed` }

    } catch (error) {
      throw new HttpException(error['response'], error['statud'])
    }
  }

  async hireAnEmployee(employeeDto: EmployeeDto, req: RequestWithUser) {
    const { user } = req
    try {
      const roleProps = ['ADMIN', 'CONSULTANT']
      const employer = await this.prismaService.user.findUnique({
        where:{
          id: user.id
        },
        select:{
          org_id: true
        }
      })
      if (!employer.org_id) {
        throw new HttpException(`Создайте организацию, чтобы добавлять сотрудников`, HttpStatus.BAD_REQUEST)
      }
      const employee = await this.prismaService.user.findUnique({
        where: {
          id: employeeDto.user_id
        },
        select: {
          org_id: true,
          role:{
            select:{
              value: true
            }
          }
        }
      })
      if (employee.org_id) {
        throw new HttpException(`Пользователь уже состоит в организации`, HttpStatus.BAD_REQUEST)
      }
      if (roleProps.includes(employee.role.value)) {
        throw new HttpException(`Выбранного пользователя нельзя нанаять`, HttpStatus.BAD_REQUEST)
      }
      const updatedUser = await this.prismaService.user.update({
        where: { 
          id: employeeDto.user_id 
        },
        data:{
          org_id: employer.org_id,
          role:{
            update:{
              value: "EMPLOYEE"
            }
          }
        }
      })
      delete updatedUser.password
      return updatedUser 
    } catch (error) {
      throw new HttpException(error['response'], error['statud'])
    }
  }

  async dismiss(employeeDto: EmployeeDto, req: RequestWithUser){
    const { user } = req
    try {
      const roleProps = ['ADMIN', 'CONSULTANT']
      if(employeeDto.user_id === user.id) {
        throw new HttpException(`Нельзя себя уволить`, HttpStatus.BAD_REQUEST)
      }
      const employer = await this.prismaService.user.findUnique({
        where:{
          id: user.id
        },
        select:{
          org_id: true
        }
      })
      if(employeeDto.user_id === user.id) {

      }
      const employee = await this.prismaService.user.findUnique({
        where:{
          id: employeeDto.user_id
        },
        select:{
          org_id: true,
          role:{
            select:{
              value: true
            }
          }
        }
      })
      if (!employee) {
        throw new HttpException(`Пользователя не существует`, HttpStatus.BAD_REQUEST)
      }

      if (employee.org_id !== employer.org_id) {
        throw new HttpException(`Пользователь не состоит в вашей организации`, HttpStatus.BAD_REQUEST)
      }
      const updatedUser = await this.prismaService.user.update({
        where:{
          id: employeeDto.user_id 
        },
        data:{
          org_id: null,
          role:{
            update:{
              value: "USER"
            }
          }
        },
        include:{
          role: true
        }
      })
      delete updatedUser.password
      return updatedUser
    } catch (error) {
      console.log(error);
      
      throw new HttpException(error['response'], error['statud'])
    }
  }



}
