import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService],
  imports: [JwtModule.register({
    global: true,
    secret: process.env.JWT_KEY || 'SECRET',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '24h'
    }
  }),
  forwardRef(() => UserModule),
  ],
  exports: [AuthModule, JwtModule]
})
export class AuthModule { }
