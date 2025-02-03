import {
  EmailVerification,
  GradeType,
  Member,
  MemberGrade,
  Password,
  PrismaClient,
  Profile,
  Provider,
  ProviderType,
  TempMember,
} from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import prisma from './client';
import { randomBytes, randomUUID } from 'crypto';

jest.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const mockEmailVerification: EmailVerification = {
  id: BigInt(1),
  code: randomBytes(8).toString('hex'),
};
const mockTempMember: TempMember = {
  id: BigInt(1),
  email: 'test@test.com',
  nickname: 'test',
  password: 'password',
  createDate: new Date(),
  expiryDate: new Date(),
  emailVerificationId: mockEmailVerification.id,
};
const mockMemberGrade: MemberGrade = {
  id: 1,
  grade: GradeType.NORMAL,
  updateDate: new Date(),
};
const mockProfile: Profile = {
  id: 1,
  nickname: mockTempMember.nickname,
  imageUrl: '',
  joinDate: new Date(),
  updateDate: new Date(),
};
const mockPassword: Password = {
  id: 1,
  password: mockTempMember.password,
  updateDate: new Date(),
};
const mockProvider: Provider = {
  id: 1,
  provider: ProviderType.LOCAL,
  socialInfoId: null,
};
const mockMember: Member = {
  id: 1,
  email: mockTempMember.email,
  uuidKey: randomUUID(),
  memberGradeId: mockMemberGrade.id,
  profileId: mockProfile.id,
  passwordId: mockPassword.id,
  providerId: mockProvider.id,
};

export {
  mockEmailVerification,
  mockTempMember,
  mockMemberGrade,
  mockProfile,
  mockPassword,
  mockProvider,
  mockMember,
};
