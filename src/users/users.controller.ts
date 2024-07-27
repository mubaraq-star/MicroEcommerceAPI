/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSignInDto } from './dto/user-signin.dto';
import { currentUser } from 'src/utility/Decorators/current-user.deccorator';
import { AuthenticationGuard } from 'src/utility/Guards/authentication.guard';
import { AuthorizeRoles } from 'src/utility/Decorators/authorize-roles.decorator';
import { Roles } from 'src/utility/common/user-roles.enum';
import { AuthorizeGuard } from 'src/utility/Guards/authorization.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async signup(
    @Body() userSignUpDto: UserSignUpDto,
  ): Promise<{ user: UserEntity }> {
    return { user: await this.usersService.signup(userSignUpDto) };
  }

  @Post('login')
  async signin(@Body() userSignInDto: UserSignInDto): Promise<{
    accessToken: string;
    user: UserEntity;
  }> {
    const user = await this.usersService.signin(userSignInDto);
    const accessToken = await this.usersService.accessToken(user);
    return { accessToken, user };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // return this.usersService.create(createUserDto);
    return 'hello';
  }

  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  @Get('All')
  async findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get('single/:id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.usersService.findOne(+id);
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('Profile')
  getProfile(@currentUser() currentUser: UserEntity) {
    return currentUser;
  }
}
