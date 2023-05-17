import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';
import { TakeRoleDto } from './dto/take-role.dto';
import { PrismaService } from 'prisma/prisma.service';
import { request } from 'http';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService
  ){}

  async takeRole(req: RequestWithUser, takeRoleDto: TakeRoleDto){
    const { user } = req
    
    try {
      const roles = ['ADMIN', 'USER', 'EMPLOYER', 'CONSULTANT']
      if (!roles.includes(takeRoleDto.role)) {
        throw new HttpException(`Не допустимое значение роли`, HttpStatus.BAD_REQUEST)
      }
      const newRole = await this.prismaService.user.update({
        where:{
          id: takeRoleDto.user_id
        },
        data:{
          role:{
            update:{
              value: takeRoleDto.role
            }
          }
        },
        select:{
          id: true,
          role:{
            select:{
              value: true
            }
          }
        }
      })
      if (!newRole || Object.keys(newRole).length === 0) {
        throw new HttpException(`Ошибка записи`, HttpStatus.BAD_REQUEST)

      }
      return { statusCode: HttpStatus.OK, message: `У пользователя ${takeRoleDto.user_id}ID обновлена роль на ${takeRoleDto.role}`};
    } catch (error) {
      throw new HttpException(error['response'], error['status'])
    }
  }

}
