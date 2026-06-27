import { Conversation } from 'src/modules/conversations/entities/conversation.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { MessageDirection, MessageType } from 'src/shared/enums/role.enum';
import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, Index
} from 'typeorm';


@Entity('live_messages')
export class LiveMessage {

    @PrimaryGeneratedColumn()
    id!: number;

    // 🔗 Conversation
    @Index()
    @Column({ name: 'conversation_id' })
    conversation_id!: number;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    // 🔑 Facebook Message ID - tránh duplicate
    @Index({ unique: true })
    @Column({ type: 'varchar', name: 'facebook_mid', nullable: true })
    facebook_mid!: string | null;

    // 👤 sender & recipient (PSID hoặc Page ID)
    @Column({ name: 'sender_id' })
    sender_id!: string;

    @Column({ name: 'recipient_id' })
    recipient_id!: string;

    // ↔️ Chiều tin nhắn
    @Column({
        type: 'enum',
        enum: MessageDirection,
        default: MessageDirection.AUTO,
    })
    direction!: MessageDirection;

    // 📌 Loại tin nhắn
    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    type!: MessageType;

    // 💬 Nội dung text
    @Column({ type: 'text', nullable: true })
    text!: string | null;

    // 📎 Attachments (image, file, audio...)
    @Column({ type: 'jsonb', nullable: true })
    attachments!: object[] | null;

    // 🗃 Raw payload từ Facebook webhook - để debug
    @Column({ type: 'jsonb', nullable: true })
    raw_data!: object | null;

    // 👤 Agent gửi (nếu outbound)
    @Column({ name: 'user_id', nullable: true })
    user_id!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    // ⏱ Thời gian khách gửi (từ Facebook timestamp)
    @Column({ type: 'float', nullable: true })
    sent_at!: number | null;

    // ⏱ Thời gian lưu vào DB
    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}