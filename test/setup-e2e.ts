import { member, password, provider } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import { Client } from 'pg';
import { PrismaService } from 'src/services/prisma.service';
import bcrypt from 'bcrypt';
import { RedisClientType, createClient } from 'redis';

let postgresClient: Client;
let redisClient: RedisClientType;
let postgresContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;
let prismaService: PrismaService;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer().start();
  redisContainer = await new RedisContainer().start();

  // Postgres setup
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

  // Redis setup
  redisClient = createClient({
    url: redisContainer.getConnectionUrl(),
  });
  await redisClient.connect();
});

afterAll(async () => {
  await prismaService.$disconnect();
  await postgresClient.end();
  await postgresContainer.stop();
  await redisClient.quit();
  await redisContainer.stop();
});

afterEach(async () => {
  await postgresClient.query('DELETE FROM "member"."member"');
  await postgresClient.query('DELETE FROM "member"."profile"');
  await postgresClient.query('DELETE FROM "auth"."provider"');
  await postgresClient.query('DELETE FROM "auth"."password"');
});

jest.setTimeout(10000);

export { postgresClient, prismaService, redisClient };

const createTestMember = async (email: string, password: string) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const member = await postgresClient.query<member>(
    `INSERT INTO "member"."member" (email) VALUES ('${email}') RETURNING id`,
  );
  await postgresClient.query<password>(
    `INSERT INTO "auth"."password" (user_id, password) VALUES ('${member.rows[0].id}', '${hashedPassword}')`,
  );
  await postgresClient.query<provider>(
    `INSERT INTO "auth"."provider" (user_id, provider) VALUES ('${member.rows[0].id}', 'local')`,
  );
};

export { createTestMember };
