import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator"

export class CreateTaskDto {


    @ApiProperty({ description: 'Описание задачи', example: 'Социальная сеть', type: String })
    @IsNotEmpty()
    @IsString()
    title: string

    @ApiProperty({ description: 'Описание задачи', example: 'Создать то то  то то пятое дестяое', type: String })
    @IsNotEmpty()
    @IsString()
    description: string
   
    @ApiProperty({ description: 'Награда за задачу', example: '10000', type: String })
    @IsNotEmpty()
    @IsNumber()
    @Min(10000)
    reward: number



}
