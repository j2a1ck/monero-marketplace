import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from './comment.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'bytea',
    array: true,
    nullable: true,
    select: false,
  })
  pics?: Buffer[];

  //FIXME should get all rate and return one final rate
  @Column({ type: 'float', nullable: true })
  rate: number;

  @Column({ type: 'bigint' })
  price: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(() => Comment, (comment) => comment.product)
  comments: Comment[];

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'RESTRICT',
    eager: false,
  })
  seller: User;
}
