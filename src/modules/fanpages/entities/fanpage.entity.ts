import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('fanpages')
export class Fanpage {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    facebook_page_id!: string;

    @Column({ nullable: true })
    page_name!: string;

    @Column({ nullable: true })
    page_avatar!: string;

    @Column({ nullable: true })
    created_at!: number;

}

// facebook_page_id VARCHAR(100) UNIQUE NOT NULL,
// page_name VARCHAR(255),
// page_avatar TEXT,
// platform VARCHAR(50) DEFAULT 'facebook',
// created_at TIMESTAMP DEFAULT NOW(),
