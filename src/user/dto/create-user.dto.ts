import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ description: 'Email пользователя', example: 'test@test.ru', type: String })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({ description: 'Имя пользователя', example: 'Иван', type: String })
    @IsNotEmpty()
    @IsString()
    firstName: string

    @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов', type: String })
    @IsNotEmpty()
    @IsString()
    lastName: string

    @ApiProperty({ description: 'пароль пользователя', example: 'qweasd123', type: String })
    @IsNotEmpty()
    @IsString()
    password: string

}
