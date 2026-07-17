
import { Fanpage } from "src/modules/fanpages/entities/fanpage.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('labels')
export class Label {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    name!: string;

    @Column({ nullable: true })
    color!: string;

    @Column({ nullable: true })
    fanpage_id!: number | null;

    @ManyToOne(() => Fanpage, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'fanpage_id' })
    fanpage!: Fanpage | null;

    // false: active, true: deleted
    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ type: 'tsvector', select: false, nullable: true })
    search_vector!: string;

    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}
