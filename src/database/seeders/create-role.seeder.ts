import { Role } from 'src/modules/roles/entities/role.entity';
import { DataSource } from 'typeorm';

export class CreateRoleSeeder {
    public async run(dataSource: DataSource): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);

        const roles = [
            {
                name: 'ADMIN'
            },
            {
                name: 'STAFF'
            },
            {
                name: 'CUSTOMER'
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