import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'password123';
    const name = 'Admin';

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingAdmin) {
        console.log(`Admin user ${email} already exists. Updating password...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await prisma.admin.update({
            where: { email },
            data: { password: hashedPassword },
        });
        console.log('Password updated successfully.');
    } else {
        console.log(`Creating admin user ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        console.log('Admin user created successfully.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
