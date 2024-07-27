import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSignUpDto } from './dto/user-signup.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserSignInDto } from './dto/user-signin.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
            // create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            // update: jest.fn(),
            // remove: jest.fn(),
            accessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('signup', () => {
    it('should register a new user', async () => {
      const userSignUpDto: UserSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: '',
      };
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'password',
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'signup').mockResolvedValue(user);

      const result = await usersController.signup(userSignUpDto);
      expect(result).toEqual({ user });
    });
  });

  describe('signin', () => {
    it('should authenticate a user and return a JWT', async () => {
      const userSignInDto: UserSignInDto = {
        email: 'test@example.com',
        password: 'password',
      };
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

      jest.spyOn(usersService, 'signin').mockResolvedValue(user);
      jest.spyOn(usersService, 'accessToken').mockResolvedValue(token);

      const result = await usersController.signin(userSignInDto);
      expect(result).toEqual({ accessToken: token, user });
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
          createdAt: new Date(),
          updatedAt: new Date(),
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

      jest.spyOn(usersService, 'findAll').mockResolvedValue(users);

      const result = await usersController.findAll();
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

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await usersController.findOne('1');
      expect(result).toEqual(user);
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', () => {
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        password: 'password',
        roles: [],
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const request = { currentUser: user };

      const result = usersController.getProfile(request.currentUser);
      expect(result).toEqual(user);
    });
  });
});
