import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class EmployeeDto {

    @ApiProperty({description: 'Id пользователя', example: 'qwe123asd', type: String})
    @IsNotEmpty()
    @IsNumber()
    user_id: number

}