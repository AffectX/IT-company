import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { Team } from '@prisma/client';
import { GiveTeamRoleDto } from './dto/give-team-role.dto';
import { KickMemberDto } from './dto/kick-member.dto';
import { v4 as uuid } from 'uuid';
import { GiveLeaderDto } from './dto/give-leader.dto';
import { GiveMembershipDto } from './dto/give-membership.dto';


const START_TIME: Date = new Date(process.env.START);

@Injectable()
export class TeamService {
  constructor(
    private readonly prismaService: PrismaService

  ) { }



  async create(req: RequestWithUser, createTeamDto: CreateTeamDto): Promise<Team> {
    const { user } = req;
    try {
      const userTeam = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          teamId: true,
        }
      })

      if (userTeam.teamId) {
        throw new HttpException(`Вы уже состоите в команде`, HttpStatus.BAD_REQUEST)
      }
      const team = await this.prismaService.team.create({
        data: {
          ...createTeamDto,
          nextTax: new Date(START_TIME.getTime() + 60 * 60 * 1000),
          team_role: {
            create: {
              user_id: user.id,
              value: "LEADER"
            }
          },
          member: {
            connect: {
              id: user.id
            },

          }
        },
        include: {
          tasks: {
            select: {
              task: true
            }
          },
          team_role: {
            select: {
              value: true
            }
          }
        }
      })

      return team;
    } catch (error) {
      if (error['code'] === 'P2002') {
        throw new HttpException(`Данное название уже занято`, HttpStatus.BAD_REQUEST)
      }
      throw new HttpException(error['response'], error['status'])
    }
  }

  async findAll() {
    try {
      const teams = await this.prismaService.team.findMany({
        include: {
          _count: {
            select: {
              member: true
            }
          }
        }
      });
      console.log(Object.keys(teams).length === 0);

      if (Object.keys(teams).length === 0) {
        throw new HttpException(`Нет созданных команд`, HttpStatus.BAD_REQUEST)
      }
      return teams;
    } catch (error) {
      throw new HttpException(`Нет созданных команд`, HttpStatus.BAD_REQUEST)
    }
  }

  async remove(req: RequestWithUser) {

  }

  async joinTeam(req: RequestWithUser, teamId: number) {
    const { user } = req;
    try {

      console.log(teamId);

      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        }
      })
      if (userData.teamId) {
        throw new HttpException(`Вы уже состоите в команде`, HttpStatus.BAD_REQUEST)
      }

      const members = await this.prismaService.user.findMany({
        where: {
          teamId
        }
      });
      if (members.length >= Number(process.env.MAX_TEAM_MEMBER)) {
        throw new HttpException(`Лимит команды ${Number(process.env.MAX_TEAM_MEMBER)} участников`, HttpStatus.BAD_REQUEST)
      }
      const joinTeam = await this.prismaService.user.update({
        where: {
          id: userData.id
        },
        data: {
          team: {
            connect: {
              id: teamId
            }
          },
          team_role: {
            create: {
              team_id: teamId,
              value: "MEMBER"
            }
          }
        },
        include: {
          team: true,
          team_role: {
            select: {
              value: true
            }
          }
        }
      })
      delete joinTeam.password

      return joinTeam
    } catch (error) {
      console.log(error);

      throw new HttpException(error['response'], HttpStatus.BAD_REQUEST)
    }
  }

  async leaveTeam(req: RequestWithUser) {
    const { user } = req;
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        }
      })
      console.log(userData.teamId);

      if (!userData.teamId) {
        throw new HttpException(`У вас нет команды`, HttpStatus.BAD_REQUEST)
      }
      const newData = await this.prismaService.user.update({
        where: {
          id: user.id
        },
        data: {
          teamId: null
        }
      })
      const members = await this.prismaService.user.count({
        where: {
          teamId: userData.teamId
        }
      })
      if (members === 0) {
        return await this.prismaService.team.delete({
          where: {
            id: userData.teamId
          }
        })
      }
      delete newData.password
      return newData;
    } catch (error) {

      throw new HttpException(error['response'], HttpStatus.BAD_REQUEST)

    }
  }

  async rating(): Promise<Team[]> {
    return await this.prismaService.team.findMany({
      orderBy: {
        money: 'desc'
      }
    })
  }

  async teamProfile(teamId: number) {
    try {
      const team = await this.prismaService.team.findUnique({
        where: {
          id: teamId
        },
        include: {
          member: {
            select: {
              id:true,
              firstName: true,
              lastName: true,
              team_role: {
                select: {
                  value: true
                }
              }
            }
          },
          tasks: {
            select: {
              task: {
                select: {
                  title: true,
                  reward: true,
                  org: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      if (!team || Object.keys(team).length === 0) {
        throw new HttpException(`Команда c ${teamId} ID не найдена`, HttpStatus.BAD_REQUEST)
      }
      return team;
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

  async giveTeamRole(req: RequestWithUser, giveTeamRoleDto: GiveTeamRoleDto) {
    const { user } = req;
    const propsRole = ['BACKEND', 'FRONTEND', 'DESIGNER', 'MANAGER'];


    if (!propsRole.includes(giveTeamRoleDto.role)) {
      throw new HttpException(`Недопустимое значение. Используйте: ${propsRole}`, HttpStatus.BAD_REQUEST)
    }
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          teamId: true,
          team_role: {
            select: {
              value: true
            }
          }
        }
      })
      if (userData.team_role.value !== "LEADER") {
        throw new HttpException(`Только лидер команды может назначать роли`, HttpStatus.BAD_REQUEST)
      }
      console.log(user.id, giveTeamRoleDto.user_id);

      if (user.id === giveTeamRoleDto.user_id) {
        throw new HttpException(`Нельзя изменить роль лидера команды`, HttpStatus.BAD_REQUEST)
      }
      const member = await this.prismaService.user.findUnique({
        where: {
          id: giveTeamRoleDto.user_id
        },
        select: {
          teamId: true
        }
      })
      if (member?.teamId !== userData.teamId) {
        throw new HttpException(`Назначать роли можно только участникам своей команды`, HttpStatus.BAD_REQUEST)
      }
      const updateMember = await this.prismaService.user.update({
        where: {
          id: giveTeamRoleDto.user_id
        },
        data: {
          team_role: {
            update: {
              value: giveTeamRoleDto.role
            }
          }
        },
        select: {
          id: true,
          team_role: {
            select: {
              value: true
            }
          }
        }
      })
      if (!updateMember || Object.keys(updateMember).length === 0) {
        throw new HttpException(`Ошибка записи`, HttpStatus.BAD_REQUEST)
      }
      return updateMember
    } catch (error) {
      console.log(error);

      throw new HttpException(error['response'], error['status'])

    }
  }

  async kickMember(req: RequestWithUser, kickMemberDto: KickMemberDto) {
    const { user } = req;
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          teamId: true,
          team_role: {
            select: {
              value: true
            }
          }
        }
      })
      if (userData.team_role.value !== "LEADER") {
        throw new HttpException(`Только лидер команды может выгнать участника`, HttpStatus.BAD_REQUEST)
      }
      if (user.id === kickMemberDto.member_id) {
        throw new HttpException(`Нельзя выгнать самого себя`, HttpStatus.BAD_REQUEST)
      }
      const member = await this.prismaService.user.findUnique({
        where: {
          id: kickMemberDto.member_id
        },
        select: {
          teamId: true
        }
      })
      if (member?.teamId !== userData.teamId) {
        throw new HttpException(`Нельзя выгнать участника другой команды`, HttpStatus.BAD_REQUEST)
      }
      const updateMember = await this.prismaService.user.update({
        where: {
          id: kickMemberDto.member_id
        },
        data: {
          teamId: null
        },
        include: {
          team_role: {
            select: {
              value: true
            }
          }
        }
      })
      delete updateMember.password
      return updateMember
    } catch (error) {
      console.log(error);

      throw new HttpException(error['response'], error['status'])
    }
  }

  async myTeam(req: RequestWithUser) {
    const { user } = req
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: user.id
        }
      });
      if (!userData.teamId) {
        throw new HttpException(`У Вас нет команды`, HttpStatus.BAD_REQUEST)
      }
      const team = await this.prismaService.team.findUnique({
        where: {
          id: userData.teamId
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              team_role: {
                select: {
                  value: true
                }
              }
            }
          },
          tasks: {
            select: {
              task: {
                select: {
                  title: true,
                  reward: true,
                  org: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      if (!team || Object.keys(team).length === 0) {
        throw new HttpException(`Команда c ${userData.teamId} ID не найдена`, HttpStatus.BAD_REQUEST)
      }
      return team;
    } catch (error) {
      console.log(error);

      throw new HttpException(error['response'], error['status'])
    }
  }


  async history() {
    const history = await this.prismaService.team.findMany({
      select: {
        id: true,
        name: true,
        history: {
          select: {
            value: true,
            createdAt: true
          }
        }
      }
    })
    const groupedData = {}

    history.forEach(obj => {

      const { id, name, ...history } = obj

      if (!groupedData[obj.name]) {
        groupedData[obj.name] = [];
      }
      groupedData[obj.name].push({ id, name, ...history });
    })

    return groupedData
  }

  async findNoTeam() {
    const noTeam = await this.prismaService.user.findMany({
      where: {
        teamId: null,
        AND: {
          org_id: null
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            value: true
          }
        }
      }
    })
    if (!noTeam || Object.keys(noTeam).length === 0) {
      throw new HttpException(`Все участники состоят в командах`, HttpStatus.BAD_REQUEST)
    }
    return noTeam
  }

  async createRandomTeam() {
    const createTeam = await this.prismaService.team.create({
      data: {
        name: uuid(),
        nextTax: new Date(START_TIME.getTime() + 60 * 60 * 1000),
      }
    })
    return createTeam;
  }

  async giveLeader(giveLeaderDto: GiveLeaderDto) {
    try {
      const userData = await this.prismaService.user.findUnique({
        where: {
          id: giveLeaderDto.user_id
        },
        select: {
          teamId: true
        }
      })
      if (userData.teamId) {
        throw new HttpException('У пользователя есть команда', HttpStatus.BAD_REQUEST)
      }
      const teamLeader = await this.prismaService.team.update({
        where: {
          id: giveLeaderDto.team_id
        },
        data: {
          team_role: {
            create: {
              user_id: giveLeaderDto.user_id,
              value: "LEADER"
            }
          },
          member: {
            connect: {
              id: giveLeaderDto.user_id
            }
          }
        },
        include: {
          team_role: true
        }
      })
      return teamLeader
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

  async emptyTeam() {
    const team = await this.prismaService.team.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            member: true
          }
        }
      }
    })
    const emptyTeam = team.filter(t => {
      if (t._count.member <= 1) {
        return t
      }
    })
    return emptyTeam;
  }

  async giveMembership(giveMembershipDto: GiveMembershipDto) {
    console.log(giveMembershipDto);
    
    if (giveMembershipDto.user_id.length >= Number(process.env.TAX_PER_MEMBER) - 1) {
      throw new HttpException('Слишком много участников, максимум 4', HttpStatus.BAD_REQUEST)
    }
    const users = await this.prismaService.$transaction(
      giveMembershipDto.user_id.map(user => {
        return this.prismaService.user.findUnique({
          where: {
            id: user,
          },
          select:{
            id: true,
            team:{
              select:{
                id: true
              }
            }
          }
        })
      })
    )

    const userTeam = users.map(t => t.team.id)
    if (!userTeam.includes(null)) {
      throw new HttpException('Один из участников состоит в команде', HttpStatus.BAD_REQUEST)
    }
    console.log(users.includes(null) && !userTeam.includes(null));
    
    console.log(users);
    
    const team = await this.prismaService.team.findUnique({
      where: {
        id: giveMembershipDto.team_id
      },
      select: {
        member: true
      }
    })
    if (team.member.length <= 0) {
      throw new HttpException('Добавьте лидера в команду', HttpStatus.BAD_REQUEST)
    }

    const updateTeam = await this.prismaService.$transaction(
      users.map(u => {

        return this.prismaService.team.update({
          where: { id: giveMembershipDto.team_id },
          data: {
            team_role: {
              create: {
                user_id: u.id,
                value: "MEMBER"
              }
            },
            member: {
              connect: {
                id: u.id
              }
            }
          }
        })
      })
    )
    return updateTeam

  }
}
