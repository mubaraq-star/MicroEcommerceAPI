/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should register a new user', async () => {
      const userSignUpDto: UserSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: '',
      };
      const hashedPassword = 'hashedPassword';
      const savedUser: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (usersRepository.save as jest.Mock).mockResolvedValue(savedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.signup(userSignUpDto);

      expect(result).toEqual(savedUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: userSignUpDto.email,
      });
      jest.spyOn(usersRepository, 'save').mockImplementation((user) => {
        console.log('Saving user:', user);
        return Promise.resolve(savedUser);
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const userSignUpDto: UserSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: '',
      };
      const existingUser: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'password',
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(existingUser);

      await expect(service.signup(userSignUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signin', () => {
    it('should authenticate a user and return user data', async () => {
      const userSignInDto: UserSignInDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.signin(userSignInDto);

      expect(result).toEqual(user);
    });

    it('should throw BadRequestException if credentials are wrong', async () => {
      const userSignInDto: UserSignInDto = {
        email: 'test@example.com',
        password: 'password',
      };

      (usersRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      await expect(service.signin(userSignInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const userSignInDto: UserSignInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        roles: [],
        name: '',
        createdAt: undefined,
        updatedAt: undefined,
      };

      (usersRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(userSignInDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: UserEntity[] = [
        {
          id: 1,
          email: 'test1@example.com',
          password: 'password',
          roles: [],
          name: '',
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          id: 2,
          email: 'test2@example.com',
          password: 'password',
          roles: [],
          name: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (usersRepository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'password',
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('accessToken', () => {
    it('should generate a JWT token', async () => {
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'password',
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = 'some-jwt-token';
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await service.accessToken(user);
      expect(result).toEqual(token);
    });
  });
});
