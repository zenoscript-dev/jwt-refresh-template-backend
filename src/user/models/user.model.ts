import { Base } from 'src/core/models/base.model';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserStatus } from '../enums/userStatus.enum';

@Entity('users')
@Index('IDX_UNIQUE_LOGIN_ID', ['loginId'], { unique: true })
export class User extends Base {
  @PrimaryGeneratedColumn('uuid')
  @Index('IDX_UNIQUE_USER_ID')
  id: string;

  @Column({ unique: true, nullable: false })
  loginId: string;
  @Column({ unique: true, nullable: false })
  userName: string;

  @Column({ select: true, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    nullable: false,
  })
  status: UserStatus;

  @Column({ nullable: true })
  profilepic: string;

  @Column({ nullable: true })
  lastLoggedIn: Date;

  @BeforeInsert()
  @BeforeUpdate()
  toLowerCaseloginId() {
    if (this.loginId) {
      this.loginId = this.loginId.toLowerCase();
      this.loginId = this.loginId.trim()
    }
  }
}
