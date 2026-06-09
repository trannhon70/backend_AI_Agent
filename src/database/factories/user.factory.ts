import { faker } from '@faker-js/faker';

export const userFactory = () => ({
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
});