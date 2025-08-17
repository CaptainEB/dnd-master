const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	const email = 'sambose426@gmail.com';

	const existing = await prisma.user.findUnique({
		where: { email },
	});

	if (existing) {
		if (existing.role === 'ADMIN') {
			console.log('Admin user already exists:', existing);
			return;
		} else {
			// Update existing user to admin role
			const updated = await prisma.user.update({
				where: { email },
				data: { role: 'ADMIN' },
			});
			console.log('Updated existing user to admin:', updated);
			return;
		}
	}

	const admin = await prisma.user.create({
		data: {
			email,
			role: 'ADMIN',
		},
	});

	console.log('Admin user created:', admin);
}

main()
	.catch((e) => console.error(e))
	.finally(async () => {
		await prisma.$disconnect();
	});
