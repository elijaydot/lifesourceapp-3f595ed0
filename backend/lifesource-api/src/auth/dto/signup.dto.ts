import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { AppRole } from '../../common/roles.decorator';

export class SignupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['donor', 'recipient'] })
  @IsEnum(['donor', 'recipient'] as any)
  role: AppRole;
}
