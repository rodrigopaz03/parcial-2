import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './auth.entity';

@Entity()
export class Key {

  @PrimaryGeneratedColumn('uuid')
  id: string;

 @Column('text', {
        unique: true,
        })
  value: string;

  @Column()
  reqLeft: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    () => User,
    (user)=> user.keys
   )
   user: User

}
