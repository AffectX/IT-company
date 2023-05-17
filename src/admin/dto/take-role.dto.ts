import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class TakeRoleDto {
    
    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @ApiProperty({description: 'Роль', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsString()
    role: string
}