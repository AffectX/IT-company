import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OutsorcedDto } from './dto/outsorced.dto';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { CompletedOutsorcedDto } from './dto/completed-outsorced.dto';
import { TaskStatus } from 'src/task/dto/task-status.enum';

@Injectable()
export class OutsorcedService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async outsorced(req: RequestWithUser, outsorcedDto: OutsorcedDto) {
        const { user } = req
        try {
            if (user.id === outsorcedDto.executor_id) {
                throw new HttpException(`Вы не можете нанять самого себя`, HttpStatus.BAD_REQUEST)
            }
            const userData = await this.prismaService.user.findUnique({
                where: {
                    id: user.id
                },
                select: {
                    team: {
                        select: {
                            id: true,
                            team_role: {
                                select: {
                                    value: true
                                }
                            }
                        }
                    }
                }
            })

            if (!userData.team.id) {
                throw new HttpException(`Только участники команд могут использовать аутсорс`, HttpStatus.BAD_REQUEST)
            }

            const role = userData.team.team_role.map(r => r.value)
            if (role[0] !== "LEADER" || role[0] === null) {
                throw new HttpException(`Только лидер команды может использовать аутсорс`, HttpStatus.BAD_REQUEST)
            }
            const executor = await this.prismaService.user.findUnique({
                where: {
                    id: outsorcedDto.executor_id
                }
            })
            if (!executor) {
                throw new HttpException(`Участника с ${outsorcedDto.executor_id}ID не существует`, HttpStatus.BAD_REQUEST)
            }

            const ticket = await this.prismaService.outsourced.create({
                data: {
                    executor_id: executor.id,
                    team_id: userData.team.id,
                    cost: outsorcedDto.cost
                }
            })

            if (!ticket) {
                throw new HttpException(`Ошибка записи`, HttpStatus.BAD_REQUEST)
            }

            return ticket
        } catch (error) {
            console.log(error);

            throw new HttpException(error['response'], error['status'])
        }

    }

    async myOutsorced(req: RequestWithUser) {
        const { user } = req
        try {
            const myOutsorced = await this.prismaService.user.findUnique({
                where: {
                    id: user.id
                },
                select: {
                    outsourced: {
                        select: {
                            team: {
                                select: {
                                    id: true,
                                    name: true,
                                    team_role: {
                                        where: {
                                            value: "LEADER"
                                        },
                                        select: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    firstName: true,
                                                    lastName: true
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            cost: true,
                            status: true
                        }
                    }
                }
            })

            if (!myOutsorced.outsourced || Object.keys(myOutsorced.outsourced).length === 0) {
                throw new HttpException(`Нет активных заявок`, HttpStatus.BAD_REQUEST)
            }

            return myOutsorced
        } catch (error) {
            throw new HttpException(error['response'], error['status'])

        }
    }

    async completedOutsorced(completedOutsorcedDto: CompletedOutsorcedDto) {
        try {
            const ticket = await this.prismaService.outsourced.findUnique({
                where: {
                    id: completedOutsorcedDto.ticket_id
                },
                select: {
                    status: true,
                    cost: true
                }
            })
            if (ticket.status === Number(TaskStatus.completed)) {
                throw new HttpException(`Заявка уже выполнена`, HttpStatus.BAD_REQUEST)
            }
            const completeTicket = await this.prismaService.outsourced.update({
                where: {
                    id: completedOutsorcedDto.ticket_id
                },
                data: {
                    status: Number(TaskStatus.completed),
                    team: {
                        update: {
                            money: { decrement: ticket.cost },
                            history: {
                                create: {
                                    value: ticket.cost * -1
                                }
                            }
                        },
                    }
                }
            })
            if (!completeTicket) {
                throw new HttpException(`Ошибка записи`, HttpStatus.BAD_REQUEST)
            }
            return { statusCode: HttpStatus.ACCEPTED, completeTicket }
        } catch (error) {
            throw new HttpException(error['response'], error['status'])
        }
    }

    async findAll() {
        const tickets = await this.prismaService.outsourced.findMany()
        if (!tickets || Object.keys(tickets).length === 0) {
            throw new HttpException(`Нет активных заявок`, HttpStatus.BAD_REQUEST)
        }
        return tickets
    }



}
