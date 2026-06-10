import { Role } from '../../modules/roles/entities/role.entity';
import { currentTimestamp } from '../../shared/utils/currentTimestamp';
import { DataSource } from 'typeorm';

export class CreateRoleSeeder {
    public async run(dataSource: DataSource): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);

        const roles = [
            {
                name: 'Owner',
                created_at: currentTimestamp(),
            },
            {
                name: 'Admin Manager',
                created_at: currentTimestamp(),
            },
            {
                name: 'Sale',
                created_at: currentTimestamp(),
            },
            {
                name: 'CSKH',
                created_at: currentTimestamp(),
            },
        ];

        for (const role of roles) {
            const exists = await roleRepository.findOne({
                where: { name: role.name },
            });

            if (!exists) {
                await roleRepository.save(role);
            }
        }

        console.log('✅ Roles seeded successfully');
    }
}