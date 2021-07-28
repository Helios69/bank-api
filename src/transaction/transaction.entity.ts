import { Currency, TransactionStatuses } from 'src/common/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  description: string;

  @Column()
  amount: number;

  @Column({ default: Currency.LEI })
  currency: Currency;

  @Column()
  sourceAccount: string;

  @Column()
  destinationAccount: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ default: TransactionStatuses.CREATED })
  status: TransactionStatuses;

  @Column({ nullable: true })
  jobId: string;
}
