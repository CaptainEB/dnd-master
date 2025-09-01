const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCreatures() {
	try {
		console.log('Checking all creatures in the database...\n');

		const allCreatures = await prisma.creature.findMany({
			select: {
				id: true,
				name: true,
				campaignId: true,
				isPrivate: true,
			},
		});

		console.log(`Total creatures in database: ${allCreatures.length}\n`);

		if (allCreatures.length === 0) {
			console.log('No creatures found in the database!');
			return;
		}

		// Group by campaign
		const byCampaign = {};
		allCreatures.forEach((creature) => {
			if (!byCampaign[creature.campaignId]) {
				byCampaign[creature.campaignId] = [];
			}
			byCampaign[creature.campaignId].push(creature);
		});

		console.log('Creatures by campaign:');
		Object.keys(byCampaign).forEach((campaignId) => {
			console.log(`\nCampaign ${campaignId}:`);
			byCampaign[campaignId].forEach((creature) => {
				console.log(`  - ${creature.name} (ID: ${creature.id}, isPrivate: ${creature.isPrivate})`);
			});
		});

		// Check specific campaign from the logs
		const targetCampaignId = '68a293d04f42e70b42d39b99';
		console.log(`\nSpecific check for campaign ${targetCampaignId}:`);

		const campaignCreatures = await prisma.creature.findMany({
			where: {
				campaignId: targetCampaignId,
			},
			select: {
				id: true,
				name: true,
				isPrivate: true,
			},
		});

		console.log(`Found ${campaignCreatures.length} creatures in target campaign`);
		campaignCreatures.forEach((creature) => {
			console.log(`  - ${creature.name} (isPrivate: ${creature.isPrivate})`);
		});

		// Test the NOT query
		console.log('\nTesting NOT isPrivate: true query:');
		const publicCreatures = await prisma.creature.findMany({
			where: {
				campaignId: targetCampaignId,
				NOT: {
					isPrivate: true,
				},
			},
			select: {
				id: true,
				name: true,
				isPrivate: true,
			},
		});

		console.log(`Found ${publicCreatures.length} public creatures`);
		publicCreatures.forEach((creature) => {
			console.log(`  - ${creature.name} (isPrivate: ${creature.isPrivate})`);
		});
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

checkCreatures();
