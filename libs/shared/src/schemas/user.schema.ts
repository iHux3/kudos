import { z } from 'zod';
import { USER_ROLES } from '../types/user';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
});

export type UserDto = z.infer<typeof UserSchema>;
