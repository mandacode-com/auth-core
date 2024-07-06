import { PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  PrismaClient,
  member,
  password,
  profile,
  provider,
} from '@prisma/client';
import { SigninService } from './signin.service';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';

describe('SignupService', () => {
  let service: SigninService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let logger: DeepMockProxy<PinoLogger>;

  beforeEach(async () => {
    // Mock PrismaService
    prismaMock = mockDeep<PrismaClient>();
    logger = mockDeep<PinoLogger>();

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: PinoLogger,
          useValue: logger,
        },
      ],
    }).compile();
    service = module.get<SigninService>(SigninService);

    // Mock $transaction
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );
  });

  describe('signin', () => {
    // Mock data
    const mockMember: member = { id: 1, uuid_key: 'uuid_key', email: 'email' };
    const mockPassword: password = {
      id: 1,
      user_id: 1,
      password: bcrypt.hashSync('password', 10),
      update_date: new Date(),
    };
    const mockProvider: provider = { id: 1, user_id: 1, provider: 'local' };
    const mockProfile: profile = {
      id: 1,
      user_id: 1,
      nickname: 'nickname',
      image_url: 'image_url',
      join_date: new Date(),
      update_date: new Date(),
    };

    // Test case
    it('should create a new member', async () => {
      const email = 'test@email.com';
      const password = 'password';

      // Mock PrismaService
      prismaMock.member.findUnique.mockResolvedValue(mockMember);
      prismaMock.provider.findUnique.mockResolvedValue(mockProvider);
      prismaMock.password.findUnique.mockResolvedValue(mockPassword);
      prismaMock.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.signin(email, password);
      expect(result).toEqual(mockMember);
    });
  });
});
