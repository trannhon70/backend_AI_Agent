import { Fanpage } from 'src/modules/fanpages/entities/fanpage.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('page_tokens')
export class PageToken {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    page_id!: number;

    @ManyToOne(() => Fanpage)
    @JoinColumn({ name: 'page_id' })
    page!: Fanpage;

    @Column({ nullable: true })
    access_token!: string;

    @Column({ nullable: true })
    created_at!: number;
}

// Lưu token riêng.
// CREATE TABLE page_tokens (
//     id BIGSERIAL PRIMARY KEY,
//     page_id BIGINT REFERENCES pages(id),
//     access_token TEXT NOT NULL,
//     expires_at TIMESTAMP,
//     created_at TIMESTAMP DEFAULT NOW()
// );
