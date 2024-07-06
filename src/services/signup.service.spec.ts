import { PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { SignupService } from './signup.service';
import {
  PrismaClient,
  member,
  password,
  profile,
  provider,
} from '@prisma/client';

describe('SignupService', () => {
  let service: SignupService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    // Mock PrismaService
    prismaMock = mockDeep<PrismaClient>();

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();
    service = module.get<SignupService>(SignupService);

    // Mock $transaction
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );
  });

  describe('signup', () => {
    // Mock data
    const mockMember: member = { id: 1, uuid_key: 'uuid_key', email: 'email' };
    const mockPassword: password = {
      id: 1,
      user_id: 1,
      password: 'password',
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
      const nickname = 'test';

      prismaMock.member.create.mockResolvedValue(mockMember);
      prismaMock.password.create.mockResolvedValue(mockPassword);
      prismaMock.provider.create.mockResolvedValue(mockProvider);
      prismaMock.profile.create.mockResolvedValue(mockProfile);

      const result = await service.signup(email, password, nickname);
      expect(result).toEqual(mockMember);
    });
  });
});
