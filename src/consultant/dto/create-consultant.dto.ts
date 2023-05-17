import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateConsultantDto {


    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsOptional()
    @IsString()
    description: string

    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNumber()
    @IsNotEmpty()
    consultant_id: number

    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNumber()
    @IsNotEmpty()
    team_id: number

    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNumber()
    @IsPositive()
    cost: number


}
