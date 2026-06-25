import { Fanpage } from 'src/modules/fanpages/entities/fanpage.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ProviderEnum, RoleEnumUserPage } from 'src/shared/enums/role.enum';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('user_pages')
@Unique(["user_id", "fanpage_id"])
export class UserPage {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    user_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ nullable: true })
    fanpage_id!: number;

    @ManyToOne(() => Fanpage)
    @JoinColumn({ name: 'fanpage_id' })
    page!: Fanpage;

    @Column({ type: 'enum', enum: ProviderEnum, default: ProviderEnum.LOCAL })
    provider!: ProviderEnum;

    // user được kết nối vào page với quyền
    @Column({ type: 'enum', enum: RoleEnumUserPage, default: RoleEnumUserPage.ADMIN_MANAGE })
    role!: RoleEnumUserPage;

    @Column({ nullable: true })
    created_at!: number;

}


// Nhân viên nào được quản lý page nào.
// CREATE TABLE user_pages (
//     id BIGSERIAL PRIMARY KEY,
//     user_id BIGINT REFERENCES users(id),
//     page_id BIGINT REFERENCES pages(id),
//     created_at TIMESTAMP DEFAULT NOW()
// );
