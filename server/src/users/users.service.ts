import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TypedKnex } from '@wwwouter/typed-knex';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  private readonly typedKnex: TypedKnex;
  constructor(@InjectModel() private readonly knex: Knex) {
    this.typedKnex = new TypedKnex(this.knex);
  }

  async findAll() {
    const users = await this.typedKnex
      .query(User)
      .select('id', 'username')
      .getMany();

    return users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.typedKnex.query(User).insertItemWithReturning({
        username: createUserDto.username,
        password: createUserDto.password,
      });

      return user;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    if (!id) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    const user = await this.typedKnex
      .query(User)
      .select('id', 'username')
      .getSingle();

    return user;
  }

  async remove(id: number): Promise<number> {
    if (!id) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    await this.typedKnex.query(User).where('id', id).del();
    return id;
  }
}
