import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {


    @ApiProperty({ description: 'Описание компании', example: 'Енисей', type: String })
    @IsNotEmpty()
    @IsString()
    description: string



}
