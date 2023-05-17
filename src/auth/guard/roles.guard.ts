import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { HttpStatus } from "@nestjs/common/enums";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ROLES_KEY } from "./roles-auth.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {


        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ])
            console.log(requiredRoles);
            
            if (!requiredRoles || Object.keys(requiredRoles).length === 0) {
                return true;
            }
            const req = context.switchToHttp().getRequest();
            const authHeader = req.headers.authorization;
            const bearer = authHeader.split(' ')[0];
            const token = authHeader.split(' ')[1];


            if (!token && bearer === 'Bearer') {
                throw new UnauthorizedException({ statusCode: HttpStatus.UNAUTHORIZED, message: 'Пользователь не авторизован' })
            }

            const user = await this.jwtService.verify(token);
            console.log(user.roles);
            
            return requiredRoles.includes(user.roles)

        } catch (error) {
            console.log(error);
            
            throw new UnauthorizedException({ statusCode: HttpStatus.FORBIDDEN, message: 'FORBIDDEN' })
        }
    }
}