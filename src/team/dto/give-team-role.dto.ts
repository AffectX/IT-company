import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class GiveTeamRoleDto {
    
    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    user_id: number
    
    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsString()
    role: string
}