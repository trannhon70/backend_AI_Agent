
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('files')
export class File {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text', nullable: true })
    url!: string | null;

    // ⏱ Thời gian lưu vào DB
    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}
