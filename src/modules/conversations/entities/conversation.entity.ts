import { LiveMessage } from "src/modules/live_messages/entities/live_message.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn()
    id!: number;

    // Người dùng có thể không có tài khoản → lưu IP
    @Column({ nullable: true })
    customerIp!: string;

    // Nhân viên đảm nhận chat
    @Column({ nullable: true })
    assigned_user_id!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assigned_user_id' })
    assignedUser!: User | null;

    // 💬 messages
    @OneToMany(() => LiveMessage, (message) => message.conversation)
    messages!: LiveMessage[];

    //nếu khách hàng gửi -> lưu id máy tính và trình duyệt
    @Column({ nullable: true, default: '' })
    id_computer!: string;

    //Chuỗi User-Agent gốc từ trình duyệt hoặc thiết bị client gửi lên.
    @Column({ type: 'text', nullable: true })
    userAgent!: string;

    //Tên trình duyệt mà client đang sử dụng.
    @Column({ type: 'text', nullable: true })
    browser!: string;

    //Hệ điều hành của thiết bị client.
    @Column({ nullable: true, default: '' })
    os!: string;

    //loại thiết bị đang sử dụng
    @Column({ nullable: true, default: '' })
    device!: string;

    //loại thiết bị đang sử dụng
    @Column({ nullable: true, default: false })
    online!: boolean;

    @Column({ nullable: true })
    country!: string;

    @Column({ nullable: true })
    city!: string;

    @Column({ nullable: true })
    region!: string;

    @Column({ nullable: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    url!: string;

    //Địa chỉ khi user chấp nhận xác định vị trí
    @Column({ type: 'text', nullable: true })
    address!: string;

    //mã hóa của analytics để xác định lượt truy cập quảng cáo 
    @Column({ type: 'varchar', nullable: true })
    gclid!: string;

    //bot google thả vào
    @Column({ type: 'text', nullable: true })
    bot!: string;

    //thời gian tạo
    @Column({ nullable: true })
    created_at!: number;


}
