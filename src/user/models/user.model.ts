import { Base } from "src/core/models/base.model";
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "../enums/userStatus.enum";

@Entity("users")
export class User extends Base{
  @PrimaryGeneratedColumn()
    id: string;
    
    @Index()
    @Column({ unique: true, nullable: false })
    loginId: string;

    @Index()
    @Column({ unique: true, nullable: false })
    employeeId: string;
  
    @Column({ select: true, nullable: false })
    password: string;
  
    @Column({
      type: 'enum',
      enum: UserStatus,
      default: UserStatus.ACTIVE,
      nullable: false
    })
    status: UserStatus;
  
    // @Column({ default: false, nullable: false })
    // isDefault: boolean;
  
    @Column({ nullable: true })
    lastLoggedIn: Date;
  
    @Column({ default: false, nullable: false })
    changePasswordRequired: boolean;
  
    @Column({ nullable: true })
    lastPasswordChanged: Date;
  
    name: string;
  
    userId: string;
  
    @BeforeInsert()
    @BeforeUpdate()
    toLowerCaseloginId() {
      if (this.loginId)
        this.loginId = this.loginId.toLowerCase();
    }
}