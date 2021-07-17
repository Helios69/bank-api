import { Account } from 'src/account/account.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  login: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column()
  dateOfBirth: Date;

  @Column({ nullable: true })
  avatar: string;

  @OneToOne(() => Account, { eager: true, cascade: true })
  @JoinColumn()
  account: Account;
}
