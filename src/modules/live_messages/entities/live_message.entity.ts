import { Conversation } from 'src/modules/conversations/entities/conversation.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, Index
} from 'typeorm';

@Entity('live_messages')
export class LiveMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    // 🔗 Conversation
    @Column({ name: 'conversation_id' })
    conversation_id!: number;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    // 👤 Agent gửi
    @Column({ name: 'user_id', nullable: true })
    user_id!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    // 💬 nội dung
    @Column({ type: 'text', nullable: true })
    content!: string;

    // 🔗 link
    @Column({ type: 'text', nullable: true })
    url!: string;

    // 📎 file
    @Column({ type: 'text', nullable: true })
    file!: string;

    // 👤 loại người gửi staff: tư vấn, customer: khách hàng,
    @Column({
        type: 'enum',
        enum: ['staff', 'customer', 'auto', 'ai'],
    })
    senderType!: 'staff' | 'customer' | 'auto' | 'ai';

    // 👁 đã đọc chưa
    @Column({ name: 'is_read', default: false })
    is_read!: boolean;

    // 💻 client id
    @Column({ name: 'id_computer', nullable: true })
    id_computer!: string;

    // 📊 tracking
    @Column({ name: 'gclid', nullable: true })
    gclid!: string;

    // ⏱ thời gian
    @Column({ name: 'created_at', nullable: true })
    created_at!: number;
}