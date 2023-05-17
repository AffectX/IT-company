import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/signin.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client';
import { TokenPayload } from './interface/tokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { Token } from './interface/token.interface';
import { PrismaService } from 'prisma/prisma.service';




@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService

    ) { }

    public async signIn(signInDto: SignInDto): Promise<Token> {
        const user = await this.validateUser(signInDto);
        
        return await this.genAccessToken(user);
    }

    public async signUp(createUserDto: CreateUserDto): Promise<Token> {
        const candidate = await this.userService.getByEmail(createUserDto.email)

        console.log(candidate, createUserDto);
        
        if (candidate) {
            throw new HttpException(
                `User with email ${createUserDto.email} already exist`,
                HttpStatus.BAD_REQUEST,
            );
        }
        try {
            const hashPassword = await bcrypt.hash(createUserDto.password, 5)
            const user = await this.userService.create({ ...createUserDto, password: hashPassword })
            console.log(user['value']);
            
            return await this.genAccessToken(user);
        } catch (error) {
            console.log(error);
            
            throw new HttpException(`Registration error`, HttpStatus.BAD_REQUEST)
        }

    }

    async genAccessToken(user: User): Promise<Token> {
        console.log(user);
        const role = await this.prismaService.globalRole.findUnique({
            where:{
                user_id: user.id
            }
        })
        const payload: TokenPayload = { email: user.email, id: user.id, roles: role.value };
        
        return {
            token: await this.jwtService.sign(payload)
        }
    }

      
  private async validateUser(signInDto: SignInDto): Promise<User> {
   const user = await this.userService.getByEmail(signInDto.email)

    if (!user || Object.keys(user).length == 0) {
      throw new UnauthorizedException({ message: 'Некорректный логин или пароль', statusCode: 401 })
    }

    const passwordEquals = await bcrypt.compare(signInDto.password, user.password)
    if (user && passwordEquals) {
      return { ...user }
    }
    throw new UnauthorizedException({ message: 'Некорректный логин или пароль', statusCode: 401 })

  }



}
