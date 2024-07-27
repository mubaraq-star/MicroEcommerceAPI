import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name', 'John Doe');
      });
  });

  it('/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/login')
      .send({ email: 'john@example.com', password: 'password' })
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('access_token');
      });
  });

  // More integration tests...
});
