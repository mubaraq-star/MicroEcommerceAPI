import { IsEmail, IsNotEmpty, IsString, MinLength, minLength } from "class-validator";


export class UserSignUpDto{
    @IsNotEmpty({message:'name cannot be empty'})
    @IsString ({message:'Name should be string'})
  name:string;

     @IsNotEmpty ({message:'email cannot be empty'})
     @IsEmail({},{message:'provide a valid email address'})
    email:string;

@IsNotEmpty({message:'password cannot be empty'})
@MinLength(5, {message:'password must be at least 5 characters'})
    password:string;
}