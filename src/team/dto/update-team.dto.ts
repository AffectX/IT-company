import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateTeamDto {



    @ApiProperty({ description: 'Название команды', example: 'Енисей', type: String })
    @IsNotEmpty()
    @IsString()
    name: string

}
