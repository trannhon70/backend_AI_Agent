import { Role } from 'src/modules/roles/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    role_id!: number;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    password!: string;

    @Column({ nullable: true })
    full_name!: string;

    @Column({ nullable: true })
    ngay_sinh!: string;

    @Column({ nullable: true })
    phone!: string;

    @Column({ default: true })
    is_deleted!: boolean;

    @Column({ type: 'boolean', nullable: true, default: false })
    is_online!: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar!: string;

    @Column({ nullable: true })
    created_at!: number;
}