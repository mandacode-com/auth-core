import { Prisma, TempMember } from '@prisma/client';
import { AuthLocalService } from './local.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../token.service';
import {
  mockEmailVerification,
  mockMember,
  mockTempMember,
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

  describe('signup', () => {
    const token = randomBytes(8).toString('hex');
    it('should create a new member', async () => {
      prismaMock.member.findUnique.mockResolvedValue(null);
      const tempMemberCreateValue = {
        emailVerification: {
          code: mockEmailVerification.code,
        },
      } as unknown as Prisma.Prisma__TempMemberClient<TempMember>;
      prismaMock.tempMember.create.mockResolvedValueOnce(tempMemberCreateValue);
      tokenServiceMock.emailConfirmToken.mockReturnValueOnce(
        Promise.resolve(token),
      );

      const result = await service.signup(
        mockTempMember.email,
        mockTempMember.password,
        mockTempMember.nickname,
      );
      expect(result).toBe(token);
      expect(prismaMock.member.findUnique).toHaveBeenCalled();
      expect(prismaMock.tempMember.create).toHaveBeenCalled();
      expect(tokenServiceMock.emailConfirmToken).toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    const token = randomBytes(8).toString('hex');

    it('should confirm', async () => {
      tokenServiceMock.verifyEmailConfirmToken.mockResolvedValue({
        email: mockTempMember.email,
        code: mockEmailVerification.code,
      });
      const tempMemberFindUniqueValue = {
        id: mockTempMember.id,
        email: mockTempMember.email,
        password: mockTempMember.password,
        nickname: mockTempMember.nickname,
        emailVerification: {
          code: mockEmailVerification.code,
        },
      } as unknown as Prisma.Prisma__TempMemberClient<TempMember>;
      prismaMock.tempMember.findUnique.mockResolvedValue(
        tempMemberFindUniqueValue,
      );
      prismaMock.$transaction.mockResolvedValue([mockMember, mockTempMember]);

      const result = await service.confirm(token);
      expect(result).toEqual({
        uuid: mockMember.uuidKey,
        email: mockTempMember.email,
      });
      expect(tokenServiceMock.verifyEmailConfirmToken).toHaveBeenCalled();
      expect(prismaMock.tempMember.findUnique).toHaveBeenCalled();
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
