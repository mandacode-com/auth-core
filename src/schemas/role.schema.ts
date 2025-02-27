import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const roleSchema = z.nativeEnum(UserRole);

export type Role = z.infer<typeof roleSchema>;
