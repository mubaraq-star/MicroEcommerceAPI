/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async signup(UserSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const userExist = await this.findUserByEmail(UserSignUpDto.email);
    if (userExist) throw new BadRequestException('Email is not available');
    UserSignUpDto.password = await hash(UserSignUpDto.password, 10);

    let user = this.usersRepository.create(UserSignUpDto);
    user = await this.usersRepository.save(user);
    delete user.password;

    return user;
  }

  async signin(userSignInDto: UserSignInDto): Promise<UserEntity> {
    const userExist = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email=:email', { email: userSignInDto.email })
      .getOne();
    if (!userExist) throw new BadRequestException('Wrong credentials');
    const matchPassword = await compare(
      userSignInDto.password,
      userExist.password,
    );
    if (!matchPassword) throw new BadRequestException('Wrong credentials');
    delete userExist.password;
    return userExist;
  }

  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  //   return ' hello';
  // }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('not found!');
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }
  async accessToken(user: UserEntity): Promise<string> {
    return sign(
      { id: user.id, email: user.email },
      process.env.Access_Token_secret_key,
      { expiresIn: process.env.Access_Token_Expire_Time },
    );
  }
}
