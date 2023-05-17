import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class OutsorcedDto {

    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsOptional()
    @IsString()
    description: string
    
    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    cost: number

    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    executor_id: number
}