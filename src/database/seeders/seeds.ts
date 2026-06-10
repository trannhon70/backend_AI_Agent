// src/database/seeds.ts

import { AppDataSource } from "../data-source";
import { CreateAdminSeeder } from "./create-admin.seeder";
import { CreateRoleSeeder } from "./create-role.seeder";


async function bootstrap() {
    try {
        await AppDataSource.initialize();

        console.log('🚀 Start seeding...');

        const seeders = [
            new CreateRoleSeeder(),
            new CreateAdminSeeder(),
        ];

        for (const seeder of seeders) {
            await seeder.run(AppDataSource);
        }

        console.log('✅ Seed completed');

        await AppDataSource.destroy();
    } catch (error) {
        console.error(error);
    }
}

bootstrap();