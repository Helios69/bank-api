import { Currency } from 'src/common/enums';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  OneToOne,
} from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  accountNumber: string;

  @Column({ type: 'decimal', default: 100.5 })
  amount: number;

  @OneToOne(() => User)
  user: User;
}
