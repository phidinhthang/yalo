import { createZodDto } from '@abitia/zod-dto';
import { z } from 'zod';

export const User = z.object({
  id: z.number().min(1),
  username: z
    .string()
    .min(1, 'username cannot empty')
    .min(3, 'username must be greater than 3'),
  password: z
    .string()
    .min(1, 'password cannot be empty')
    .min(3, 'password must be greater than 3'),
});
export type User = Required<z.infer<typeof User>>;

export const UserWithToken = z.object({
  user: User.omit({ password: true }),
  token: z.object({
    access: z.string(),
    refresh: z.string(),
  }),
});

export type UserWithToken = Required<z.infer<typeof UserWithToken>>;
export class GetUserWithTokenDto extends createZodDto(UserWithToken) {}

export const GetUser = User.omit({ password: true });
export type GetUser = Required<z.infer<typeof GetUser>>;
export class GetUserDto extends createZodDto(GetUser) {}

export const GetUsers = z.array(GetUser);
export type GetUsers = GetUser[];
export class GetUsersDto extends createZodDto(GetUsers) {}

export const CreateUser = User.omit({ id: true });
export type CreateUser = Required<z.infer<typeof CreateUser>>;
export class CreateUserDto extends createZodDto(CreateUser) {}
