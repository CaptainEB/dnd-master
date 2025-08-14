'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';

/**
 * Get all campaigns with member counts - Admin only
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getAllCampaigns() {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Fetch all campaigns with member counts
		const campaigns = await prisma.campaign.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						members: true,
						updates: true,
						quests: true,
					},
				},
				members: {
					select: {
						role: true,
						user: {
							select: {
								email: true,
								role: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return {
			success: true,
			data: campaigns,
		};
	} catch (error) {
		console.error('Error fetching campaigns:', error);
		return {
			success: false,
			error: 'Failed to fetch campaigns',
		};
	}
}

/**
 * Create a new campaign - Admin only
 * @param {Object} campaignData - Campaign data {name, description}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCampaign(campaignData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!campaignData.name || campaignData.name.trim().length === 0) {
			return {
				success: false,
				error: 'Campaign name is required',
			};
		}

		// Create campaign
		const campaign = await prisma.campaign.create({
			data: {
				name: campaignData.name.trim(),
				description: campaignData.description?.trim() || null,
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
			},
		});

		return {
			success: true,
			data: campaign,
		};
	} catch (error) {
		console.error('Error creating campaign:', error);
		return {
			success: false,
			error: 'Failed to create campaign',
		};
	}
}

/**
 * Get a specific campaign by ID - Admin only
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getCampaignById(campaignId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate campaign ID
		if (!campaignId) {
			return {
				success: false,
				error: 'Campaign ID is required',
			};
		}

		// Fetch campaign with all related data
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						members: true,
						updates: true,
						quests: true,
						rules: true,
						notes: true,
					},
				},
				members: {
					select: {
						id: true,
						role: true,
						joinedAt: true,
						user: {
							select: {
								email: true,
								role: true,
								avatarUrl: true,
							},
						},
					},
					orderBy: {
						joinedAt: 'desc',
					},
				},
				updates: {
					select: {
						id: true,
						title: true,
						content: true,
						createdAt: true,
						author: {
							select: {
								email: true,
							},
						},
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 5, // Latest 5 updates
				},
				quests: {
					select: {
						id: true,
						title: true,
						description: true,
						status: true,
						reward: true,
						difficulty: true,
						createdAt: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
			},
		});

		if (!campaign) {
			return {
				success: false,
				error: 'Campaign not found',
			};
		}

		return {
			success: true,
			data: campaign,
		};
	} catch (error) {
		console.error('Error fetching campaign:', error);
		return {
			success: false,
			error: 'Failed to fetch campaign',
		};
	}
}

/**
 * Get all users - Admin only
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getAllUsers() {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Fetch all users with campaign counts
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				avatarUrl: true,
				_count: {
					select: {
						campaignMembers: true,
						updates: true,
						notes: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return {
			success: true,
			data: users,
		};
	} catch (error) {
		console.error('Error fetching users:', error);
		return {
			success: false,
			error: 'Failed to fetch users',
		};
	}
}

/**
 * Create a new user - Admin only
 * @param {Object} userData - User data {email, role, username}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createUser(userData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!userData.email || userData.email.trim().length === 0) {
			return {
				success: false,
				error: 'Email is required',
			};
		}

		if (!userData.role) {
			return {
				success: false,
				error: 'Role is required',
			};
		}

		// Create user
		const user = await prisma.user.create({
			data: {
				email: userData.email.trim().toLowerCase(),
				role: userData.role,
				// Note: username field needs to be added to schema
			},
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});

		return {
			success: true,
			data: user,
		};
	} catch (error) {
		console.error('Error creating user:', error);
		if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
			return {
				success: false,
				error: 'A user with this email already exists',
			};
		}
		return {
			success: false,
			error: 'Failed to create user',
		};
	}
}

/**
 * Add a member to a campaign - Admin only
 * @param {Object} memberData - Member data {userId, campaignId, role}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addCampaignMember(memberData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!memberData.userId || !memberData.campaignId || !memberData.role) {
			return {
				success: false,
				error: 'User ID, Campaign ID, and role are required',
			};
		}

		// Add member to campaign
		const member = await prisma.campaignMember.create({
			data: {
				userId: memberData.userId,
				campaignId: memberData.campaignId,
				role: memberData.role,
			},
			select: {
				id: true,
				role: true,
				joinedAt: true,
				user: {
					select: {
						email: true,
						role: true,
					},
				},
			},
		});

		return {
			success: true,
			data: member,
		};
	} catch (error) {
		console.error('Error adding campaign member:', error);
		if (error.code === 'P2002') {
			return {
				success: false,
				error: 'User is already a member of this campaign',
			};
		}
		return {
			success: false,
			error: 'Failed to add campaign member',
		};
	}
}

/**
 * Create a new update for a campaign - Admin only
 * @param {Object} updateData - Update data {title, content, campaignId}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createUpdate(updateData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!updateData.title || !updateData.content || !updateData.campaignId) {
			return {
				success: false,
				error: 'Title, content, and campaign ID are required',
			};
		}

		// Create update
		const update = await prisma.update.create({
			data: {
				title: updateData.title.trim(),
				content: updateData.content.trim(),
				campaignId: updateData.campaignId,
				authorId: session.user.id,
			},
			select: {
				id: true,
				title: true,
				content: true,
				createdAt: true,
				author: {
					select: {
						email: true,
					},
				},
			},
		});

		return {
			success: true,
			data: update,
		};
	} catch (error) {
		console.error('Error creating update:', error);
		return {
			success: false,
			error: 'Failed to create update',
		};
	}
}

/**
 * Create a new quest for a campaign - Admin only
 * @param {Object} questData - Quest data {title, description, campaignId, reward?, difficulty?}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createQuest(questData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!questData.title || !questData.description || !questData.campaignId) {
			return {
				success: false,
				error: 'Title, description, and campaign ID are required',
			};
		}

		// Create quest
		const quest = await prisma.quest.create({
			data: {
				title: questData.title.trim(),
				description: questData.description.trim(),
				campaignId: questData.campaignId,
				reward: questData.reward?.trim() || null,
				difficulty: questData.difficulty?.trim() || null,
			},
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				reward: true,
				difficulty: true,
				createdAt: true,
			},
		});

		return {
			success: true,
			data: quest,
		};
	} catch (error) {
		console.error('Error creating quest:', error);
		return {
			success: false,
			error: 'Failed to create quest',
		};
	}
}

/**
 * Create a new rule for a campaign - Admin only
 * @param {Object} ruleData - Rule data {content, campaignId}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createRule(ruleData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!ruleData.content || !ruleData.campaignId) {
			return {
				success: false,
				error: 'Content and campaign ID are required',
			};
		}

		// Create rule
		const rule = await prisma.rule.create({
			data: {
				content: ruleData.content.trim(),
				campaignId: ruleData.campaignId,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
			},
		});

		return {
			success: true,
			data: rule,
		};
	} catch (error) {
		console.error('Error creating rule:', error);
		return {
			success: false,
			error: 'Failed to create rule',
		};
	}
}

/**
 * Create a new note for a campaign - Admin only
 * @param {Object} noteData - Note data {content, campaignId}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createNote(noteData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate required fields
		if (!noteData.content || !noteData.campaignId) {
			return {
				success: false,
				error: 'Content and campaign ID are required',
			};
		}

		// Create note
		const note = await prisma.note.create({
			data: {
				content: noteData.content.trim(),
				campaignId: noteData.campaignId,
				authorId: session.user.id,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				author: {
					select: {
						email: true,
					},
				},
			},
		});

		return {
			success: true,
			data: note,
		};
	} catch (error) {
		console.error('Error creating note:', error);
		return {
			success: false,
			error: 'Failed to create note',
		};
	}
}

/**
 * Get a specific user by ID with campaign details - Admin only
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getUserById(userId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate user ID
		if (!userId) {
			return {
				success: false,
				error: 'User ID is required',
			};
		}

		// Fetch user with campaign memberships
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				avatarUrl: true,
				_count: {
					select: {
						campaignMembers: true,
						updates: true,
						notes: true,
					},
				},
				campaignMembers: {
					select: {
						id: true,
						role: true,
						joinedAt: true,
						campaign: {
							select: {
								id: true,
								name: true,
								description: true,
								createdAt: true,
								_count: {
									select: {
										members: true,
									},
								},
							},
						},
					},
					orderBy: {
						joinedAt: 'desc',
					},
				},
			},
		});

		if (!user) {
			return {
				success: false,
				error: 'User not found',
			};
		}

		return {
			success: true,
			data: user,
		};
	} catch (error) {
		console.error('Error fetching user:', error);
		return {
			success: false,
			error: 'Failed to fetch user',
		};
	}
}

/**
 * Remove a member from a campaign - Admin only
 * @param {string} membershipId - CampaignMember ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeCampaignMember(membershipId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate membership ID
		if (!membershipId) {
			return {
				success: false,
				error: 'Membership ID is required',
			};
		}

		// Remove campaign member
		await prisma.campaignMember.delete({
			where: { id: membershipId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error removing campaign member:', error);
		return {
			success: false,
			error: 'Failed to remove campaign member',
		};
	}
}

/**
 * Update a campaign member's role - Admin only
 * @param {string} membershipId - CampaignMember ID
 * @param {string} newRole - New campaign role (PLAYER or DM)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignMemberRole(membershipId, newRole) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify ADMIN role
		if (session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - Admin access required',
			};
		}

		// Validate inputs
		if (!membershipId || !newRole) {
			return {
				success: false,
				error: 'Membership ID and new role are required',
			};
		}

		if (!['PLAYER', 'DM'].includes(newRole)) {
			return {
				success: false,
				error: 'Invalid role. Must be PLAYER or DM',
			};
		}

		// Update campaign member role
		const updatedMember = await prisma.campaignMember.update({
			where: { id: membershipId },
			data: { role: newRole },
			select: {
				id: true,
				role: true,
				campaign: {
					select: {
						name: true,
					},
				},
			},
		});

		return {
			success: true,
			data: updatedMember,
		};
	} catch (error) {
		console.error('Error updating campaign member role:', error);
		return {
			success: false,
			error: 'Failed to update campaign member role',
		};
	}
}

/**
 * Get current user's campaigns - for campaign selector
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getUserCampaigns() {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get user's campaign memberships
		const memberships = await prisma.campaignMember.findMany({
			where: { userId: session.user.id },
			select: {
				campaign: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
				role: true,
			},
			orderBy: {
				joinedAt: 'desc',
			},
		});

		const campaigns = memberships.map((membership) => ({
			...membership.campaign,
			userRole: membership.role,
		}));

		return {
			success: true,
			data: campaigns,
		};
	} catch (error) {
		console.error('Error fetching user campaigns:', error);
		return {
			success: false,
			error: 'Failed to fetch campaigns',
		};
	}
}

/**
 * Update current user's active campaign
 * @param {string} campaignId - Campaign ID to set as active (null to clear)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateActiveCampaign(campaignId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Validate campaign ID if provided
		if (campaignId) {
			// Check if user is a member of this campaign
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: campaignId,
				},
			});

			if (!membership) {
				return {
					success: false,
					error: 'You are not a member of this campaign',
				};
			}
		}

		// Update user's active campaign
		await prisma.user.update({
			where: { id: session.user.id },
			data: { activeCampaignId: campaignId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error updating active campaign:', error);
		return {
			success: false,
			error: 'Failed to update active campaign',
		};
	}
}

// ============= UPDATES MANAGEMENT =============

/**
 * Get updates for a campaign with pagination
 * @param {string} campaignId - Campaign ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getCampaignUpdates(campaignId, page = 1, limit = 10) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Validate campaign ID
		if (!campaignId) {
			return {
				success: false,
				error: 'Campaign ID is required',
			};
		}

		// Check if user is a member of this campaign
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
			},
		});

		if (!membership && session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'You are not a member of this campaign',
			};
		}

		const skip = (page - 1) * limit;

		// Get updates with pagination
		const [updates, totalCount] = await Promise.all([
			prisma.update.findMany({
				where: { campaignId: campaignId },
				include: {
					author: {
						select: {
							id: true,
							email: true,
							role: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				skip: skip,
				take: limit,
			}),
			prisma.update.count({
				where: { campaignId: campaignId },
			}),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		return {
			success: true,
			data: {
				updates,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			},
		};
	} catch (error) {
		console.error('Error fetching campaign updates:', error);
		return {
			success: false,
			error: 'Failed to fetch updates',
		};
	}
}

/**
 * Create a new update for a campaign - Admin or DM only
 * @param {Object} updateData - Update data {title, content, campaignId}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCampaignUpdate(updateData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Validate required fields
		if (!updateData.title || !updateData.content || !updateData.campaignId) {
			return {
				success: false,
				error: 'Title, content, and campaign ID are required',
			};
		}

		// Check permissions: Admin or DM in the specific campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: updateData.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Admin or DM access required',
			};
		}

		// Create update
		const update = await prisma.update.create({
			data: {
				title: updateData.title.trim(),
				content: updateData.content.trim(),
				campaignId: updateData.campaignId,
				authorId: session.user.id,
			},
			include: {
				author: {
					select: {
						id: true,
						email: true,
						role: true,
					},
				},
			},
		});

		return {
			success: true,
			data: update,
		};
	} catch (error) {
		console.error('Error creating update:', error);
		return {
			success: false,
			error: 'Failed to create update',
		};
	}
}

/**
 * Update an existing update - Admin or DM only (or original author)
 * @param {string} updateId - Update ID
 * @param {Object} updateData - Update data {title, content}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignUpdate(updateId, updateData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Validate required fields
		if (!updateId || !updateData.title || !updateData.content) {
			return {
				success: false,
				error: 'Update ID, title, and content are required',
			};
		}

		// Get the existing update
		const existingUpdate = await prisma.update.findUnique({
			where: { id: updateId },
			include: {
				campaign: {
					include: {
						members: {
							where: { userId: session.user.id },
						},
					},
				},
			},
		});

		if (!existingUpdate) {
			return {
				success: false,
				error: 'Update not found',
			};
		}

		// Check permissions: Admin, original author, or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN' || existingUpdate.authorId === session.user.id;

		if (!hasPermission) {
			const membership = existingUpdate.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - You can only edit your own updates or must be a DM/Admin',
			};
		}

		// Update the update
		const updatedUpdate = await prisma.update.update({
			where: { id: updateId },
			data: {
				title: updateData.title.trim(),
				content: updateData.content.trim(),
			},
			include: {
				author: {
					select: {
						id: true,
						email: true,
						role: true,
					},
				},
			},
		});

		return {
			success: true,
			data: updatedUpdate,
		};
	} catch (error) {
		console.error('Error updating update:', error);
		return {
			success: false,
			error: 'Failed to update update',
		};
	}
}

/**
 * Delete an update - Admin or DM only (or original author)
 * @param {string} updateId - Update ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCampaignUpdate(updateId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Validate update ID
		if (!updateId) {
			return {
				success: false,
				error: 'Update ID is required',
			};
		}

		// Get the existing update
		const existingUpdate = await prisma.update.findUnique({
			where: { id: updateId },
			include: {
				campaign: {
					include: {
						members: {
							where: { userId: session.user.id },
						},
					},
				},
			},
		});

		if (!existingUpdate) {
			return {
				success: false,
				error: 'Update not found',
			};
		}

		// Check permissions: Admin, original author, or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN' || existingUpdate.authorId === session.user.id;

		if (!hasPermission) {
			const membership = existingUpdate.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - You can only delete your own updates or must be a DM/Admin',
			};
		}

		// Delete the update
		await prisma.update.delete({
			where: { id: updateId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting update:', error);
		return {
			success: false,
			error: 'Failed to delete update',
		};
	}
}

// ===== RULES ACTIONS =====

/**
 * Get all rules for a campaign
 * @param {string} campaignId
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignRules(campaignId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify user is a member of the campaign
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
			},
		});

		if (!membership && session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - You must be a member of this campaign',
			};
		}

		// Get all rules for the campaign, ordered by category and order
		const rules = await prisma.rule.findMany({
			where: { campaignId },
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
			},
			orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
		});

		return {
			success: true,
			data: rules,
		};
	} catch (error) {
		console.error('Error fetching campaign rules:', error);
		return {
			success: false,
			error: 'Failed to fetch rules',
		};
	}
}

/**
 * Create a new rule - DM/Admin only
 * @param {string} campaignId
 * @param {Object} ruleData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCampaignRule(campaignId, ruleData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM/Admin
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can create rules',
			};
		}

		// Create the rule
		const rule = await prisma.rule.create({
			data: {
				title: ruleData.title,
				content: ruleData.content,
				category: ruleData.category || 'General',
				order: ruleData.order || 0,
				authorId: session.user.id,
				campaignId: campaignId,
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
			},
		});

		return {
			success: true,
			data: rule,
		};
	} catch (error) {
		console.error('Error creating rule:', error);
		return {
			success: false,
			error: 'Failed to create rule',
		};
	}
}

/**
 * Update an existing rule - DM/Admin only
 * @param {string} ruleId
 * @param {Object} ruleData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignRule(ruleId, ruleData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing rule with campaign info
		const existingRule = await prisma.rule.findUnique({
			where: { id: ruleId },
			include: {
				campaign: {
					include: {
						members: {
							where: { userId: session.user.id },
							select: { role: true },
						},
					},
				},
			},
		});

		if (!existingRule) {
			return {
				success: false,
				error: 'Rule not found',
			};
		}

		// Check permissions: Admin or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = existingRule.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can edit rules',
			};
		}

		// Update the rule
		const updatedRule = await prisma.rule.update({
			where: { id: ruleId },
			data: {
				title: ruleData.title,
				content: ruleData.content,
				category: ruleData.category,
				order: ruleData.order,
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
			},
		});

		return {
			success: true,
			data: updatedRule,
		};
	} catch (error) {
		console.error('Error updating rule:', error);
		return {
			success: false,
			error: 'Failed to update rule',
		};
	}
}

/**
 * Delete a rule - DM/Admin only
 * @param {string} ruleId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCampaignRule(ruleId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing rule with campaign info
		const existingRule = await prisma.rule.findUnique({
			where: { id: ruleId },
			include: {
				campaign: {
					include: {
						members: {
							where: { userId: session.user.id },
							select: { role: true },
						},
					},
				},
			},
		});

		if (!existingRule) {
			return {
				success: false,
				error: 'Rule not found',
			};
		}

		// Check permissions: Admin or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = existingRule.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can delete rules',
			};
		}

		// Delete the rule
		await prisma.rule.delete({
			where: { id: ruleId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting rule:', error);
		return {
			success: false,
			error: 'Failed to delete rule',
		};
	}
}
