import { AuthAccount, Prisma, TempUser } from '@prisma/client';
import { AuthLocalService } from './local.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../token.service';
import {
  mockAuthAccount,
  mockPassword,
  mockProfile,
  mockTempUser,
  mockUser,
  prismaMock,
} from 'test/singleton';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

describe('local.service.spec.ts', () => {
  let service: AuthLocalService;
  let tokenServiceMock: MockProxy<TokenService>;

  beforeEach(async () => {
    tokenServiceMock = mock<TokenService>();

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        AuthLocalService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
      ],
    }).compile();

    service = testingModule.get<AuthLocalService>(AuthLocalService);
  });

  describe('createTempUser', () => {
    const token = randomBytes(8).toString('hex');
    it('should create a temporary user', async () => {
      const data = {
        email: mockTempUser.email,
        loginId: mockTempUser.loginId,
        password: mockAuthAccount.password,
        nickname: mockProfile.nickname,
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.authAccount.findUnique.mockResolvedValue(null);
      prismaMock.tempUser.create.mockResolvedValue(mockTempUser);
      tokenServiceMock.emailVerificationToken.mockResolvedValue(token);

      const result: string = await service.createTempUser(data);

      expect(result).toBe(token);
    });
  });

  describe('verifyEmail', () => {
    it('should verify the email', async () => {
      const token = randomBytes(8).toString('hex');
      const payload = {
        code: token,
        email: mockTempUser.email,
      };

      prismaMock.tempUser.findUnique.mockResolvedValue(mockTempUser);
      prismaMock.user.create.mockResolvedValue(mockUser);
      prismaMock.$transaction.mockResolvedValue([mockUser, null]);
      tokenServiceMock.verifyEmailVerificationToken.mockResolvedValue(payload);

      const result = await service.verifyEmail({ token });

      expect(result).toEqual({ uuid: mockUser.uuid });
    });
  });

  describe('resend', () => {
    it('should resend the email', async () => {
      const token = randomBytes(8).toString('hex');
      const email = mockTempUser.email;

      prismaMock.tempUser.findUnique.mockResolvedValue(mockTempUser);
      prismaMock.tempUser.update.mockResolvedValue(mockTempUser);
      tokenServiceMock.emailVerificationToken.mockResolvedValue(token);

      const result = await service.resend({ email });

      expect(result).toBe(token);
    });
  });

  describe('deleteTempUser', () => {
    it('should delete the temporary user', async () => {
      const email = mockTempUser.email;

      prismaMock.tempUser.delete.mockResolvedValue(mockTempUser);

      const result = await service.deleteTempUser({ email });

      expect(result).toEqual(mockTempUser);
    });
  });

  describe('login', () => {
    it('should login', async () => {
      const loginId = mockAuthAccount.loginId;
      const password = mockPassword;

      prismaMock.authAccount.findUnique.mockResolvedValue({
        ...mockAuthAccount,
        user: mockUser,
      } as AuthAccount);

      const result = await service.login({ loginId, password });

      expect(result).toEqual({
        uuid: mockUser.uuid,
      });
    });
  });
});
