const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateRoles() {
	console.log('Starting role migration...');

	try {
		// Use raw MongoDB operations to update roles since Prisma client
		// can't handle the old enum values

		console.log('Updating PLAYER roles to USER...');
		const playerResult = await prisma.$runCommandRaw({
			update: 'User',
			updates: [
				{
					q: { role: 'PLAYER' },
					u: { $set: { role: 'USER' } },
					multi: true,
				},
			],
		});
		console.log('PLAYER update result:', playerResult);

		console.log('Updating DM roles to USER...');
		const dmResult = await prisma.$runCommandRaw({
			update: 'User',
			updates: [
				{
					q: { role: 'DM' },
					u: { $set: { role: 'USER' } },
					multi: true,
				},
			],
		});
		console.log('DM update result:', dmResult);

		console.log('Migration completed successfully!');

		// Check if there are any users and their actual role values
		console.log('Checking for users in database...');
		const allUsers = await prisma.$runCommandRaw({
			find: 'User',
			filter: {},
			projection: { _id: 1, email: 1, role: 1 },
		});

		console.log('Total users found:', allUsers.cursor.firstBatch.length);
		console.log('Sample users:', allUsers.cursor.firstBatch.slice(0, 3));
	} catch (error) {
		console.error('Migration failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

migrateRoles();
