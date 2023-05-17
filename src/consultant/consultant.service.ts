import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { PrismaService } from 'prisma/prisma.service';
import { TaskStatus } from 'src/task/dto/task-status.enum';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { CompleteConsultantDto } from './dto/complete-consultant.dto';

@Injectable()
export class ConsultantService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async helpTeam(helpDto: CreateConsultantDto, req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          teamId: true
        }
      })
      if (userData.teamId !== helpDto.team_id) {
        throw new HttpException(`Нельзя подделывать записи >:( `, HttpStatus.BAD_REQUEST)

      }
      const result = await this.prismaService.consultHelp.create({
        data: {
          ...helpDto,
          status: TaskStatus.inProgress
        }
      })
      if (!result || Object.keys(result).length === 0) {
        throw new HttpException(`Ошибка записи`, HttpStatus.BAD_REQUEST)
      }
    } catch (error) {
      throw new HttpException(error['response'], error['status'])

    }
  }

  async myhelp(req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select:{
          consultanthelp: true
        }
      })
      if (!userData.consultanthelp || Object.keys(userData.consultanthelp).length === 0) {
        throw new HttpException(`Нет активных заявок `, HttpStatus.BAD_REQUEST)
      }    
      
      return userData
    } catch (error) {

      throw new HttpException(error['response'], error['status'])
    }
  }

  async completeHelp(completeTicketDto: CompleteConsultantDto,req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id,
        },
        select:{
          consultanthelp: true
        }
      })
      const tickets = userData.consultanthelp.map(t => t.id)
      const ticketsWithCost = userData.consultanthelp.find((t)=> t.id === completeTicketDto.ticket_id )
      
      if (!tickets.includes(completeTicketDto.ticket_id)) {
        throw new HttpException(`Нельзя подделывать записи >:( `, HttpStatus.BAD_REQUEST)
      }
      if (ticketsWithCost.status === TaskStatus.completed) {
        throw new HttpException(`Задание уже выполнено`, HttpStatus.BAD_REQUEST)
      }
      
      const updateTicket = await this.prismaService.consultHelp.update({
        where:{
          id: completeTicketDto.ticket_id
        },
        data:{
          status: TaskStatus.completed,
          team:{
            update:{
              money: { decrement: ticketsWithCost.cost},
              history:{
                create:{
                  value: (ticketsWithCost.cost * -1)
                },
              }
            },
          
          }
        }
      })

      return updateTicket;
      
    } catch (error) {
      console.log(error);
      
      throw new HttpException(error['response'], error['status'])
    }
  }

}
