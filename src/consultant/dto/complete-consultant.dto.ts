import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber } from "class-validator"

export class CompleteConsultantDto {

    @ApiProperty({description: 'ID Команды', example: 'qwe123asd', type: Number})
    @IsNumber()
    @IsNotEmpty()
    ticket_id: number

}
