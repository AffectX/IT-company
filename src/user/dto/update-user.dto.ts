import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, Min } from "class-validator"

export class UpdateUserDto {

    @ApiProperty({ description: 'Имя пользователя', example: 'Иван', type: String })
    @IsNotEmpty()
    @IsString()
    @Min(1)
    firstName: string

    @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов', type: String })
    @IsNotEmpty()
    @IsString()
    @Min(1)
    lastName: string


}
