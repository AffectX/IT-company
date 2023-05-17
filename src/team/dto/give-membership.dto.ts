import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber } from "class-validator"

export class GiveMembershipDto {
    
    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: Array})
    @IsArray()
    user_id: number[]

    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    team_id: number

}