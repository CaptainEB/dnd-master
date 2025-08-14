const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	const email = 'sambose426@gmail.com';

	const existing = await prisma.user.findUnique({
		where: { email },
	});

	if (existing) {
		console.log('User already exists:', existing);
		return;
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
