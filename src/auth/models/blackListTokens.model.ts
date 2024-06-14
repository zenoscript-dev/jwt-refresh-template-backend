import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("blacklistedtokens")
export class BlackListedTokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async setExpiration() {
    if (!this.expiresAt) {
      const currentDate = new Date();
      this.expiresAt = new Date(currentDate.getTime() + Number(process.env.REFRESH_EXPIRY) * 60 * 60 * 1000); // Adjust as needed
    }
  }
}
