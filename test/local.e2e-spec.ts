import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth.module';
import { PrismaService } from 'src/services/prisma.service';
import { prismaService } from './setup-e2e';
import request from 'supertest';

describe('Local', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /local/signup', () => {
    const email = 'test12@test.com';
    const password = 'password';
    const nickname = 'nickname1';
    it('should create a new member', async () => {
      const response = await request(app.getHttpServer())
        .post('/local/signup')
        .send({ email, password, nickname })
        .expect(201);
      expect(response.text).toEqual('Signup success');
    });
  });
});
