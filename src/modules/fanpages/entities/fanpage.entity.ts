import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('fanpages')
export class Fanpage {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    page_id!: string;

    @Column({ nullable: true })
    page_name!: string;

    @Column({ nullable: true })
    page_avatar!: string;

    @Column({ nullable: true, type: "text" })
    access_token!: string; // Long-lived User Token

    //thời điểm quyền truy cập dữ liệu của người dùng sẽ hết hiệu lực nếu người dùng không tiếp tục sử dụng hoặc gia hạn quyền cho ứng dụng
    @Column({ type: 'float', nullable: true })
    data_access_expires_at!: number | null;

    @Column({ nullable: true })
    created_at!: number;

}

// facebook_page_id VARCHAR(100) UNIQUE NOT NULL,
// page_name VARCHAR(255),
// page_avatar TEXT,
// platform VARCHAR(50) DEFAULT 'facebook',
// https://graph.facebook.com/v25.0/me/accounts?access_token=EAAObdS0rwCYBRlEtL7nfw0VH1KKUxPj2OOiBGYWiQulK4kyz6SbZCwFKB6wamx9cajs0YKckE4NvujU1MXZCnLKeJQdKgqb1bTw6AYB0VHaZCObpNfZBRir3YTOUgOa3bakfzY0DpInc6hjZBHhp42T9ZC7dI8zhDZA7DrngulXTMQdj1jkm7j5tPaWMzxNVyfcUcTGSPQRSgMRNx90Qg9vIbxTEnvyGahvPPafWhJpEL5U4Ec1SHAv8hgzZCN6GtIhCZBU70v1KNUuxzbsMZD
// created_at TIMESTAMP DEFAULT NOW(),
// Ý nghĩa từng trường:

// Trường	Ý nghĩa
// id	ID duy nhất của Fanpage trên Facebook.
// name	Tên Fanpage.
// category	Danh mục chính của Fanpage.
// category_list	Danh sách tất cả danh mục mà Fanpage được gán.
// access_token	Token đại diện cho Fanpage, dùng để gọi Graph API thay mặt Page.
// tasks	Danh sách quyền mà tài khoản Facebook hiện tại có trên Fanpage này.