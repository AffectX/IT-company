import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/auth/interface/tokenPayload.interface';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  public async getByEmail(email: string): Promise<User> {
    try {
      return await this.prismaService.user.findUnique({
        where: {
          email
        },
        include:{
          role:{
            select:{
              value: true
            }
          }
        }
      })
    } catch (error) {

    }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.prismaService.user.create({
        data: {
          ...createUserDto,
          role: {
            create: {
              value: "USER"
            }
          }
        },
        include:{
          role:{
            select:{
              value: true
            }
          }
        }

      })
      delete user.password     
      return user;
    } catch (error) {
      throw new BadRequestException()
    }
  }

  async profile(req: RequestWithUser) {
    const {user} = req
     
    try {
      const userData = await this.prismaService.user.findUnique({
        where:{
          id: user.id
        },
        include:{
          team: true,
          role: {
            select:{
              value: true
            }
          }
        }
      })
      delete userData.password
      return userData;
    } catch (error) {
          
    }
  }

  public async getUserById(userId: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId
        }
      })

      if (!user || Object.keys(user).length === 0) {
        throw new HttpException(`Пользователь не найден`, HttpStatus.BAD_REQUEST)
      }
      return user
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }
  async findAll() {
    const users = await this.prismaService.user.findMany(
      {
        select:{
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role:{
            select:{
              value: true
            }
          },
          org:{
            select:{
              name: true
            }
          },
          team:{
            select:{
              id: true,
              name: true
            }
          }
        }
      }
    )
    return users
  }




}
