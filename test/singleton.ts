import {
  AuthAccount,
  PrismaClient,
  Profile,
  TempUser,
  User,
  UserRole,
} from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import prisma from './client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

jest.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const mockPassword = 'password';
const hashedPassword = bcrypt.hashSync(mockPassword, 10);

const mockUser: User = {
  id: 1,
  uuid: crypto.randomUUID(),
  email: 'test@test.com',
  role: UserRole.USER,
};

const mockAuthAccount: AuthAccount = {
  id: 1,
  userId: mockUser.id,
  loginId: 'test',
  password: hashedPassword,
  createdAt: new Date(),
};

const mockProfile: Profile = {
  id: 1,
  userId: mockUser.id,
  nickname: 'test',
  profileImage: null,
  joinDate: new Date(),
  updateDate: new Date(),
};

const mockTempUser: TempUser = {
  id: BigInt(1),
  email: mockUser.email || 'test@test.com',
  nickname: mockProfile.nickname,
  loginId: mockAuthAccount.loginId,
  password: mockAuthAccount.password,
  createDate: new Date(),
  updateDate: new Date(),
  expiryDate: new Date(),
  emailVerificationCode: randomBytes(8).toString('hex'),
  resendCount: 0,
};

export { mockPassword, mockUser, mockAuthAccount, mockProfile, mockTempUser };
