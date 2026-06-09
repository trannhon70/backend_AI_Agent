// create-admin.seeder.ts
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';

export class CreateAdminSeeder {
    async run(dataSource: DataSource) {
        const userRepository = dataSource.getRepository(User);

        await userRepository.save({
            full_name: 'Admin',
            email: 'admin@gmail.com',
            password: '123456',
            role_id: 1,
        });
    }
}