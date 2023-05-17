import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator"

export class CompletedOutsorcedDto {

    @ApiProperty({description: 'Id заявки', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    ticket_id: number

}