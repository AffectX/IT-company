import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOrganizationDto {

    @ApiProperty({ description: 'Название команды', example: 'Енисей', type: String })
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({ description: 'Описание компании', example: 'Енисей', type: String })
    @IsOptional()
    @IsString()
    description: string

}
