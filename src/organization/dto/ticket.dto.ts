import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class TicketDto {


    @ApiProperty({ description: 'ID команды', example: '1', type: String })
    @IsNotEmpty()
    @IsNumber()
    task_id: number

    @ApiProperty({ description: 'ID задачи', example: '1', type: String })
    @IsNotEmpty()
    @IsNumber()
    team_id: number

    @ApiProperty({ description: 'Описание компании', example: 'true', type: String })
    @IsBoolean()
    @IsNotEmpty()
    isAccepted: boolean
}