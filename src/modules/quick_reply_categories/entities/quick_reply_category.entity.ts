import { Fanpage } from 'src/modules/fanpages/entities/fanpage.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quick_reply_category')
@Index('idx_QuickReplyCategor_created_at_id', ['created_at', 'id'])
export class QuickReplyCategory {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ type: 'varchar', nullable: true })
    name!: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    color!: string | null;

    @Column({ nullable: true })
    fanpage_id!: number | null;

    @ManyToOne(() => Fanpage, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'fanpage_id' })
    fanpage!: Fanpage | null;

    @Column({ type: 'tsvector', select: false, nullable: true })
    search_vector!: string;

    @Column({ nullable: true })
    created_at!: number;
}
