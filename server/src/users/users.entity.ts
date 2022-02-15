import { Table, Column } from '@wwwouter/typed-knex';
import { ApiProperty } from '@nestjs/swagger';

@Table('users')
export class User {
  @ApiProperty({ type: String })
  @Column({ primary: true })
  public id: number;

  @ApiProperty({ type: String })
  @Column()
  public username: string;

  @Column()
  public password: string;
}
