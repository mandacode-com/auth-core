import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/services/prisma.service';
import {
  createTempTestMember,
  createTestMember,
  prismaService,
  redisClient,
} from './setup-e2e';
import request from 'supertest';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { AppModule } from 'src/app.module';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

describe('Local', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    jwtService = new JwtService({
      secret: 'secret',
    });

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(JwtService)
      .useValue(jwtService)
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

  describe('[GET] /local/confirm', () => {
    const email = 'email@ifelfi.com';
    const password = 'password';
    const nickname = 'nickname';
    const code = randomBytes(8).toString('hex');
    let token: string;
    beforeEach(() => {
      token = jwtService.sign({ email, code: code });
      createTempTestMember(code, nickname, email, password);
    });

    it('should confirm', async () => {
      const response = await request(app.getHttpServer())
        .get('/local/confirm')
        .query({ token });

      expect(response.status).toEqual(200);
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
