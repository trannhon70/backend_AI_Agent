// create-admin.seeder.ts
import { User } from 'src/modules/users/entities/user.entity';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
let saltOrRounds = 10;

export class CreateAdminSeeder {
    async run(dataSource: DataSource) {
        const userRepository = dataSource.getRepository(User);
        const hashPassword = await bcrypt.hash('123123@', saltOrRounds);
        await userRepository.save({
            full_name: 'Admin',
            email: 'admin@gmail.com',
            password: hashPassword,
            role_id: 1,
            created_at: currentTimestamp(),
        });
    }
}