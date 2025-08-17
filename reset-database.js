const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
	try {
		console.log('🚨 WARNING: This will delete ALL data from your database!');
		console.log('Starting database reset in 3 seconds...');

		await new Promise((resolve) => setTimeout(resolve, 3000));

		console.log('Deleting all data...');

		// Delete in order to respect foreign key constraints
		await prisma.campaignMember.deleteMany();
		console.log('✅ Deleted all campaign members');

		await prisma.note.deleteMany();
		console.log('✅ Deleted all notes');

		await prisma.quest.deleteMany();
		console.log('✅ Deleted all quests');

		await prisma.update.deleteMany();
		console.log('✅ Deleted all updates');

		await prisma.campaign.deleteMany();
		console.log('✅ Deleted all campaigns');

		await prisma.user.deleteMany();
		console.log('✅ Deleted all users');

		console.log('🎉 Database reset complete! All data has been removed.');
		console.log('You can now create fresh accounts with the new role system.');
	} catch (error) {
		console.error('❌ Error during database reset:', error);
	} finally {
		await prisma.$disconnect();
	}
}

// Uncomment the line below and run the script when you're ready
// console.log('To reset the database, uncomment the last line in this script and run it again.');
resetDatabase();
