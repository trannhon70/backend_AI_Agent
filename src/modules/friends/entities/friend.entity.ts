import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('friend')
export class Friend {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    //Người tạo
    @Column({ nullable: true })
    user_id!: number;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    // ID của người bạn
    @Column({ nullable: true })
    friend_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'friend_id' }) // ánh xạ rõ ràng vào cột friendId
    friend!: User;

    @Column({ nullable: true })
    created_at!: number;
}