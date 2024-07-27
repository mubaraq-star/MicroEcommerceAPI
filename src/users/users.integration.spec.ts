import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UsersService } from './users.service';
import { AppModule } from 'src/app.module';
import { UserSignUpDto } from './dto/user-signup.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    usersService = app.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const userSignUpDto: UserSignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      //   await usersService.deleteAll(); // Clear existing users, if this method exists

      return request(app.getHttpServer())
        .post('/users/register')
        .send(userSignUpDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toEqual(userSignUpDto.email);
          expect(res.body.password).toBeUndefined(); // Password should not be in response
        });
    });

    it('should return 400 if email already exists', async () => {
      const userSignUpDto: UserSignUpDto = {
        email: 'test@example.com', // Same email as the previous test
        password: 'password123',
        name: 'Test User',
      };

      await usersService.signup(userSignUpDto); // Ensure this user is created first

      return request(app.getHttpServer())
        .post('/users/register')
        .send(userSignUpDto)
        .expect(400);
    });
  });

  describe('POST /users/login', () => {
    it('should sign in a user and return user data', async () => {
      const userSignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/login')
        .send(userSignInDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toEqual(userSignInDto.email);
          expect(res.body.password).toBeUndefined(); // Password should not be in response
        });
    });

    it('should return 400 if credentials are wrong', async () => {
      const userSignInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/users/login')
        .send(userSignInDto)
        .expect(400);
    });
  });

  // Additional tests for other endpoints can be added here
});
