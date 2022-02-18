import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { User } from './users.dto';

@Injectable()
export class UsersRepo {
  constructor(@InjectModel() private readonly knex: Knex) {}

  async findAll() {
    const users = await this.knex<User>('users').select('*');

    return users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const query = this.knex<User>('users')
        .insert({
          username: createUserDto.username,
          password: createUserDto.password,
        })
        .returning('*');
      console.log('query', query.toQuery());
      const user = (await query)[0];

      return user;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const query = this.knex<User>('users')
        .update(updateUserDto)
        .where('id', id)
        .returning('*');
      console.log('query ', query.toQuery());
      const user = (await query)[0];
      return user;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(
    field: number | Pick<User, 'username'>,
  ): Promise<User | undefined> {
    let user: User | undefined = undefined;

    console.log('run here');
    if (typeof field === 'number') {
      user = (
        await this.knex<User>('users').where({ id: field }).select('*')
      )[0];
    } else {
      user = (
        await this.knex<User>('users')
          .where({ username: field.username })
          .select('*')
      )[0];
    }

    return user;
  }

  async remove(id: number): Promise<number> {
    if (!id) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    await this.knex<User>('users').where({ id }).del();
    return id;
  }
}
