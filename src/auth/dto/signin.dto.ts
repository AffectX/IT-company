import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SignInDto {
    
    @ApiProperty({ description: 'Email пользователя', example: 'test@test.ru', type: String })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'Пароль пользователя', example: 'qweasd123', type: String })
    @IsNotEmpty()
    @IsString()
    password: string
}