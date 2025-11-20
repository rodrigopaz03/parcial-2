import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Key } from './keys.entity';

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
        unique: true,
        })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column("simple-array")
  roles: string[];

  @OneToMany(
      ()=> Key,
      (key) => key.user,
      {cascade: true} //evitar true para q no haya huerfanos
  )
  keys?: Key[]

}
