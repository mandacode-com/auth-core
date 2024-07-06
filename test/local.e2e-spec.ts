import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/services/prisma.service';
import { createTestMember, prismaService, redisClient } from './setup-e2e';
import request from 'supertest';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { AppModule } from 'src/app.module';

describe('Local', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = module.createNestApplication();
    app.use(
      session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {},
        store: new RedisStore({
          client: redisClient,
        }),
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[POST] /local/signup', () => {
    const email = 'email@ifelfi.com';
    const password = 'password';
    const nickname = 'nickname';
    it('should create a new member', async () => {
      const response = await request(app.getHttpServer())
        .post('/local/signup')
        .send({ email, password, nickname });

      expect(response.status).toEqual(201);
    });
  });

  describe('[POST] /local/signin', () => {
    const email = 'email@ifelfi.com';
    const password = 'password';
    beforeEach(async () => {
      createTestMember(email, password);
    });

    it('should signin', async () => {
      const response = await request(app.getHttpServer())
        .post('/local/signin')
        .send({ email, password });

      expect(response.status).toEqual(200);
    });
  });
});
