import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import { Client } from 'pg';
import { PrismaService } from 'src/services/prisma.service';

let postgresClient: Client;
let postgresContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;
let prismaService: PrismaService;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer().start();
  redisContainer = await new RedisContainer().start();

  postgresClient = new Client({
    user: postgresContainer.getUsername(),
    host: postgresContainer.getHost(),
    database: postgresContainer.getDatabase(),
    password: postgresContainer.getPassword(),
    port: postgresContainer.getMappedPort(5432),
  });
  await postgresClient.connect();
  const databaseUrl = postgresContainer.getConnectionUri();
  execSync(`npx prisma migrate dev --name 0_init`, {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  prismaService = new PrismaService({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
});

afterAll(async () => {
  await prismaService.$disconnect();
  await postgresClient.end();
  await postgresContainer.stop();
  await redisContainer.stop();
});

beforeEach(async () => {
  await postgresClient.query('DELETE FROM "member"."member"');
  await postgresClient.query('DELETE FROM "member"."profile"');
  await postgresClient.query('DELETE FROM "auth"."provider"');
  await postgresClient.query('DELETE FROM "auth"."password"');
});

jest.setTimeout(10000);

export { postgresClient, prismaService };
