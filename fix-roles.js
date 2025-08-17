const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserRoles() {
	try {
		console.log('Attempting to fix user roles...');

		// Try to update any users with invalid roles using raw MongoDB commands
		console.log('Updating all users with invalid roles to USER...');

		// Update any user that doesn't have 'USER' or 'ADMIN' role
		const result = await prisma.$runCommandRaw({
			updateMany: {
				filter: {
					role: { $nin: ['USER', 'ADMIN'] },
				},
				update: {
					$set: { role: 'USER' },
				},
			},
		});

		console.log('Update result:', result);

		// Now try to count users with valid roles
		const userCount = await prisma.$runCommandRaw({
			count: 'User',
			query: {},
		});

		console.log('Total users in database:', userCount.n);
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

fixUserRoles();
