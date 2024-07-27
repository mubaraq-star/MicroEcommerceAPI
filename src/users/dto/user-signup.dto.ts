import { IsNotEmpty, IsString } from 'class-validator';
import { UserSignInDto } from './user-signin.dto';

export class UserSignUpDto extends UserSignInDto {
  @IsNotEmpty({ message: 'name cannot be empty' })
  @IsString({ message: 'Name should be string' })
  name: string;
}
