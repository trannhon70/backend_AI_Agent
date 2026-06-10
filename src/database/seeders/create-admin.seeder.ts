// create-admin.seeder.ts
import { User } from 'src/modules/users/entities/user.entity';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { DataSource } from 'typeorm';

export class CreateAdminSeeder {
    async run(dataSource: DataSource) {
        const userRepository = dataSource.getRepository(User);

        await userRepository.save({
            full_name: 'Admin',
            email: 'admin@gmail.com',
            password: '123123@',
            role_id: 1,
            created_at: currentTimestamp(),
        });
    }
}