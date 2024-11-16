import { PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { SignupService } from './signup.service';
import {
  member,
  password,
  PrismaClient,
  profile,
  provider,
  temp_member,
  temp_member_info,
} from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('SignupService', () => {
  let service: SignupService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let jwtMock: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    // Mock PrismaService
    prismaMock = mockDeep<PrismaClient>();
    jwtMock = mockDeep<JwtService>();

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();
    service = module.get<SignupService>(SignupService);

    // Mock $transaction
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );
    jwtMock.sign.mockReturnValue('token');
    jwtMock.verify.mockReturnValue({ tempMemberId: BigInt(1), code: 'code' });
  });

  describe('signup', () => {
    // Mock data
    const mockTempMember: temp_member = {
      id: BigInt(1),
      code: 'code',
      create_date: new Date(),
      expiry_date: new Date(),
    };
    const mockTempMemberInfo: temp_member_info = {
      id: BigInt(1),
      temp_member_id: BigInt(1),
      nickname: 'test',
      email: 'test@email.com',
      password: 'password',
    };

    // Test case
    it('should create a new member', async () => {
      const email = 'test@email.com';
      const password = 'password';
      const nickname = 'test';

      prismaMock.member.findUnique.mockResolvedValue(null);
      prismaMock.temp_member.create.mockResolvedValue(mockTempMember);
      prismaMock.temp_member_info.create.mockResolvedValue(mockTempMemberInfo);

      const result = await service.signup(email, password, nickname);
      expect(result).toEqual('token');
    });
  });

  describe('confirm', () => {
    // Mock data
    const mockTempMember: temp_member = {
      id: BigInt(1),
      code: 'code',
      create_date: new Date(),
      expiry_date: new Date(),
    };
    const mockTempMemberInfo: temp_member_info = {
      id: BigInt(1),
      temp_member_id: BigInt(1),
      nickname: 'test',
      email: 'test@ifelfi.com',
      password: 'password',
    };
    const mockMember: member = {
      id: 1,
      email: mockTempMemberInfo.email,
      uuid_key: 'uuid_key',
    };
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
      nickname: 'test',
      image_url: 'image_url',
      join_date: new Date(),
      update_date: new Date(),
    };

    // Test case
    it('should confirm the token', async () => {
      const token = 'token';
      prismaMock.temp_member_info.findUnique.mockResolvedValue(
        mockTempMemberInfo,
      );
      prismaMock.temp_member.findUnique.mockResolvedValue(mockTempMember);
      prismaMock.member.create.mockResolvedValue(mockMember);
      prismaMock.password.create.mockResolvedValue(mockPassword);
      prismaMock.provider.create.mockResolvedValue(mockProvider);
      prismaMock.profile.create.mockResolvedValue(mockProfile);

      const result = await service.confirm(token);
      expect(result).toEqual(mockMember);
    });
  });
});
