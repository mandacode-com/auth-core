import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { AppModule } from 'src/app.module';
import { redisClient } from './setup-e2e';
import request from 'supertest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('Session', () => {
  let app: INestApplication;
  let cacheManager: Cache;
  const secret = 'secret';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.use(
      session({
        secret,
        resave: false,
        saveUninitialized: false,
        cookie: {},
        store: new RedisStore({
          client: redisClient,
        }),
      }),
    );
    await app.init();

    // Cache service
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[GET] /session/issue', () => {
    it('should return 200', async () => {
      cacheManager.get = jest.fn().mockResolvedValue('uuid');
      const response = await request(app.getHttpServer()).get('/session/issue');
      expect(response.status).toEqual(200);
    });
  });

  describe('[GET] /session/destroy', () => {
    it('should return 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/session/destroy')
        .set('Cookie', 'SID=sid');
      expect(response.status).toEqual(200);
    });
  });
});
