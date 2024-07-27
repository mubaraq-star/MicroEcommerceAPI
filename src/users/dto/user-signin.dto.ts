import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';
export class UserSignInDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user',
  })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsEmail({}, { message: 'provide a valid email address' })
  email: string;

  // @ApiProperty({ example: 'Test User', description: 'The name of the user' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(5, { message: 'password must be at least 5 characters' })
  password: string;
}
