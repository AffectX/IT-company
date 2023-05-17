import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class KickMemberDto {
    
    @ApiProperty({description: 'Старый пароль пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    member_id: number
}