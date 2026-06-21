import { LiveMessage } from "src/modules/live_messages/entities/live_message.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn()
    id!: number;

    // Nhân viên đảm nhận chat
    @Column({ nullable: true })
    assigned_user_id!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assigned_user_id' })
    assignedUser!: User | null;

    // 💬 messages
    @OneToMany(() => LiveMessage, (message) => message.conversation)
    messages!: LiveMessage[];

    //hội thoại này thuộc Facebook Page nào
    @Column({ nullable: true })
    page_id!: string;

    //khách hàng đang nhắn tin
    @Column({ nullable: true })
    customer_id!: string;

    // last_message tin nhắn mới nhất
    @Column({ nullable: true })
    last_message_id!: number | null;

    @ManyToOne(() => LiveMessage, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'last_message_id' })
    lastMessage!: LiveMessage | null;

    @Column({ type: 'float', nullable: true })
    last_message_at!: number | null;

    //Số tin nhắn chưa đọc từ phía khách hàng gửi vào
    @Column({ nullable: true })
    unread_count!: number;

    //Thời điểm cuộc hội thoại được tạo lần đầu
    @Column({ type: 'float', nullable: true })
    created_at!: number | null;

    //Thời điểm cuộc hội thoại được tạo lần đầu
    @Column({ type: 'float', nullable: true })
    updated_at!: number | null;
}
