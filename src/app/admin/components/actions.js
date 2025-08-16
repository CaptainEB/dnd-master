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
 * Create a new campaign - Admin or DM
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

		// Verify ADMIN or DM role
		if (session.user.role !== 'ADMIN' && session.user.role !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - Admin or DM access required',
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

		// If creator is a DM (not admin), automatically add them as DM member
		if (session.user.role === 'DM') {
			await prisma.campaignMember.create({
				data: {
					userId: session.user.id,
					campaignId: campaign.id,
					role: 'DM',
				},
			});
		}

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
 * Get all users - Admin or DM (for player invitations)
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

		// Verify ADMIN or DM role
		if (session.user.role !== 'ADMIN' && session.user.role !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - Admin or DM access required',
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
 * Add a member to a campaign - Admin or DM (for their own campaigns)
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

		// For DMs, verify they are DM of the campaign
		if (session.user.role === 'DM') {
			const dmMembership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: memberData.campaignId,
					role: 'DM',
				},
			});

			if (!dmMembership) {
				return {
					success: false,
					error: 'Unauthorized - You must be a DM of this campaign',
				};
			}
		} else if (session.user.role !== 'ADMIN') {
			// Only ADMIN and DM roles can add members
			return {
				success: false,
				error: 'Unauthorized - Admin or DM access required',
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
						createdAt: true,
						updatedAt: true,
						_count: {
							select: {
								members: true,
							},
						},
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
			memberCount: membership.campaign._count.members,
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
					// Get the author's character name for this campaign
					campaign: {
						select: {
							members: {
								where: {
									userId: {
										in: [], // Will be populated below
									},
								},
								select: {
									userId: true,
									characterName: true,
								},
							},
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

		// Get all unique author IDs to fetch their character names
		const authorIds = [...new Set(updates.map((update) => update.authorId))];

		// Get character names for all authors in this campaign
		const campaignMembers = await prisma.campaignMember.findMany({
			where: {
				campaignId: campaignId,
				userId: { in: authorIds },
			},
			select: {
				userId: true,
				characterName: true,
			},
		});

		// Create a map of userId -> characterName
		const characterNameMap = {};
		campaignMembers.forEach((member) => {
			characterNameMap[member.userId] = member.characterName;
		});

		// Add character names to updates
		const updatesWithCharacterNames = updates.map((update) => ({
			...update,
			author: {
				...update.author,
				characterName: characterNameMap[update.authorId] || null,
			},
		}));

		const totalPages = Math.ceil(totalCount / limit);

		return {
			success: true,
			data: {
				updates: updatesWithCharacterNames,
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

		// Get the author's character name for this campaign
		const authorMembership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: updateData.campaignId,
			},
			select: {
				characterName: true,
			},
		});

		// Add character name to the response
		const updateWithCharacterName = {
			...update,
			author: {
				...update.author,
				characterName: authorMembership?.characterName || null,
			},
		};

		return {
			success: true,
			data: updateWithCharacterName,
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

		// Get character names for rule authors
		const authorIds = [...new Set(rules.map((rule) => rule.authorId))];
		const campaignMembers = await prisma.campaignMember.findMany({
			where: {
				campaignId: campaignId,
				userId: { in: authorIds },
			},
			select: {
				userId: true,
				characterName: true,
			},
		});

		// Create character name map
		const characterNameMap = {};
		campaignMembers.forEach((member) => {
			characterNameMap[member.userId] = member.characterName;
		});

		// Add character names to rules
		const rulesWithCharacterNames = rules.map((rule) => ({
			...rule,
			author: {
				...rule.author,
				characterName: characterNameMap[rule.authorId] || null,
			},
		}));

		return {
			success: true,
			data: rulesWithCharacterNames,
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

// ===== NOTES ACTIONS =====

/**
 * Get personal notes for the current user in a campaign
 * @param {string} campaignId
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @param {string} searchQuery - Optional search query
 * @param {string} tagFilter - Optional tag filter
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getPersonalNotes(campaignId, page = 1, limit = 20, searchQuery = '', tagFilter = '') {
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

		const skip = (page - 1) * limit;

		// Build where clause for filtering
		const where = {
			campaignId: campaignId,
			authorId: session.user.id, // Only get user's own notes
		};

		// Add search filter
		if (searchQuery) {
			where.OR = [
				{
					title: {
						contains: searchQuery,
						mode: 'insensitive',
					},
				},
				{
					content: {
						contains: searchQuery,
						mode: 'insensitive',
					},
				},
			];
		}

		// Add tag filter
		if (tagFilter) {
			where.tags = {
				has: tagFilter,
			};
		}

		// Get notes with pagination
		const [notes, totalCount] = await Promise.all([
			prisma.note.findMany({
				where: where,
				include: {
					author: {
						select: {
							id: true,
							email: true,
						},
					},
				},
				orderBy: { updatedAt: 'desc' },
				skip: skip,
				take: limit,
			}),
			prisma.note.count({
				where: where,
			}),
		]);

		// Get character names for note authors
		const authorIds = [...new Set(notes.map((note) => note.authorId))];
		const campaignMembers = await prisma.campaignMember.findMany({
			where: {
				campaignId: campaignId,
				userId: { in: authorIds },
			},
			select: {
				userId: true,
				characterName: true,
			},
		});

		// Create character name map
		const characterNameMap = {};
		campaignMembers.forEach((member) => {
			characterNameMap[member.userId] = member.characterName;
		});

		// Add character names to notes
		const notesWithCharacterNames = notes.map((note) => ({
			...note,
			author: {
				...note.author,
				characterName: characterNameMap[note.authorId] || null,
			},
		}));

		const totalPages = Math.ceil(totalCount / limit);

		// Get all unique tags for this user in this campaign
		const allUserNotes = await prisma.note.findMany({
			where: {
				campaignId: campaignId,
				authorId: session.user.id,
			},
			select: {
				tags: true,
			},
		});

		const allTags = [...new Set(allUserNotes.flatMap((note) => note.tags))].sort();

		return {
			success: true,
			data: {
				notes: notesWithCharacterNames,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
				availableTags: allTags,
			},
		};
	} catch (error) {
		console.error('Error fetching personal notes:', error);
		return {
			success: false,
			error: 'Failed to fetch notes',
		};
	}
}

/**
 * Create a new personal note
 * @param {string} campaignId
 * @param {Object} noteData - {title?, content, tags?}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createPersonalNote(campaignId, noteData) {
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

		// Validate required fields
		if (!noteData.content || noteData.content.trim().length === 0) {
			return {
				success: false,
				error: 'Note content is required',
			};
		}

		// Create the note
		const note = await prisma.note.create({
			data: {
				title: noteData.title?.trim() || null,
				content: noteData.content.trim(),
				tags: noteData.tags || [],
				authorId: session.user.id,
				campaignId: campaignId,
			},
			include: {
				author: {
					select: {
						id: true,
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
 * Update a personal note - Users can only edit their own notes
 * @param {string} noteId
 * @param {Object} noteData - {title?, content, tags?}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePersonalNote(noteId, noteData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing note
		const existingNote = await prisma.note.findUnique({
			where: { id: noteId },
			include: {
				author: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		if (!existingNote) {
			return {
				success: false,
				error: 'Note not found',
			};
		}

		// Check permissions: Users can only edit their own notes
		if (existingNote.authorId !== session.user.id && session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - You can only edit your own notes',
			};
		}

		// Validate required fields
		if (!noteData.content || noteData.content.trim().length === 0) {
			return {
				success: false,
				error: 'Note content is required',
			};
		}

		// Update the note
		const updatedNote = await prisma.note.update({
			where: { id: noteId },
			data: {
				title: noteData.title?.trim() || null,
				content: noteData.content.trim(),
				tags: noteData.tags || [],
				updatedAt: new Date(),
			},
			include: {
				author: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		return {
			success: true,
			data: updatedNote,
		};
	} catch (error) {
		console.error('Error updating note:', error);
		return {
			success: false,
			error: 'Failed to update note',
		};
	}
}

/**
 * Delete a personal note - Users can only delete their own notes
 * @param {string} noteId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePersonalNote(noteId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing note
		const existingNote = await prisma.note.findUnique({
			where: { id: noteId },
		});

		if (!existingNote) {
			return {
				success: false,
				error: 'Note not found',
			};
		}

		// Check permissions: Users can only delete their own notes
		if (existingNote.authorId !== session.user.id && session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - You can only delete your own notes',
			};
		}

		// Delete the note
		await prisma.note.delete({
			where: { id: noteId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting note:', error);
		return {
			success: false,
			error: 'Failed to delete note',
		};
	}
}

// ===== QUEST ACTIONS =====

/**
 * Get all quests for a campaign
 * @param {string} campaignId
 * @param {string} statusFilter - Optional status filter (AVAILABLE, IN_PROGRESS, COMPLETED, UNAVAILABLE)
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignQuests(campaignId, statusFilter = null) {
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

		// Build where clause
		const where = { campaignId };
		if (statusFilter) {
			where.status = statusFilter;
		}

		// Get all quests for the campaign
		const quests = await prisma.quest.findMany({
			where: where,
			orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
		});

		return {
			success: true,
			data: quests,
		};
	} catch (error) {
		console.error('Error fetching campaign quests:', error);
		return {
			success: false,
			error: 'Failed to fetch quests',
		};
	}
}

/**
 * Create a new quest - DM/Admin only
 * @param {string} campaignId
 * @param {Object} questData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCampaignQuest(campaignId, questData) {
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
				error: 'Unauthorized - Only DMs and Admins can create quests',
			};
		}

		// Validate required fields
		if (!questData.title || !questData.description) {
			return {
				success: false,
				error: 'Title and description are required',
			};
		}

		// Create the quest
		const quest = await prisma.quest.create({
			data: {
				title: questData.title.trim(),
				description: questData.description.trim(),
				status: questData.status || 'AVAILABLE',
				reward: questData.reward?.trim() || null,
				difficulty: questData.difficulty?.trim() || null,
				campaignId: campaignId,
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
 * Update an existing quest - DM/Admin only
 * @param {string} questId
 * @param {Object} questData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignQuest(questId, questData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing quest with campaign info
		const existingQuest = await prisma.quest.findUnique({
			where: { id: questId },
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

		if (!existingQuest) {
			return {
				success: false,
				error: 'Quest not found',
			};
		}

		// Check permissions: Admin or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = existingQuest.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can edit quests',
			};
		}

		// Update the quest
		const updatedQuest = await prisma.quest.update({
			where: { id: questId },
			data: {
				title: questData.title?.trim(),
				description: questData.description?.trim(),
				status: questData.status,
				reward: questData.reward?.trim() || null,
				difficulty: questData.difficulty?.trim() || null,
			},
		});

		return {
			success: true,
			data: updatedQuest,
		};
	} catch (error) {
		console.error('Error updating quest:', error);
		return {
			success: false,
			error: 'Failed to update quest',
		};
	}
}

/**
 * Delete a quest - DM/Admin only
 * @param {string} questId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCampaignQuest(questId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing quest with campaign info
		const existingQuest = await prisma.quest.findUnique({
			where: { id: questId },
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

		if (!existingQuest) {
			return {
				success: false,
				error: 'Quest not found',
			};
		}

		// Check permissions: Admin or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = existingQuest.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can delete quests',
			};
		}

		// Delete the quest
		await prisma.quest.delete({
			where: { id: questId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting quest:', error);
		return {
			success: false,
			error: 'Failed to delete quest',
		};
	}
}

/**
 * Update user profile (username)
 * @param {Object} profileData - Profile data {username}
 */
export async function updateUserProfile(profileData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return {
				success: false,
				error: 'Unauthorized - Please log in',
			};
		}

		// Validate input
		if (!profileData.username || !profileData.username.trim()) {
			return {
				success: false,
				error: 'Username is required',
			};
		}

		const username = profileData.username.trim();

		// Check if username is already taken by another user
		const existingUser = await prisma.user.findFirst({
			where: {
				username: username,
				id: { not: session.user.id },
			},
		});

		if (existingUser) {
			return {
				success: false,
				error: 'Username is already taken',
			};
		}

		// Update user profile
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: { username: username },
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				avatarUrl: true,
			},
		});

		return {
			success: true,
			data: updatedUser,
		};
	} catch (error) {
		console.error('Error updating user profile:', error);
		return {
			success: false,
			error: 'Failed to update profile',
		};
	}
}

/**
 * Update user's dark mode preference
 * @param {boolean} darkMode - Dark mode preference
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateUserTheme(darkMode) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return {
				success: false,
				error: 'Unauthorized - Please log in',
			};
		}

		// Update user's dark mode preference
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: { darkMode: darkMode },
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				avatarUrl: true,
				darkMode: true,
			},
		});

		return {
			success: true,
			data: updatedUser,
		};
	} catch (error) {
		console.error('Error updating user theme:', error);
		return {
			success: false,
			error: 'Failed to update theme preference',
		};
	}
}

/**
 * Update character name for current user in their active campaign
 * @param {string} characterName - New character name
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCharacterName(characterName) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		if (!session.user.activeCampaignId) {
			return {
				success: false,
				error: 'No active campaign selected',
			};
		}

		// Validate character name
		if (!characterName || typeof characterName !== 'string') {
			return {
				success: false,
				error: 'Character name is required',
			};
		}

		const trimmedName = characterName.trim();
		if (trimmedName.length < 1 || trimmedName.length > 50) {
			return {
				success: false,
				error: 'Character name must be between 1 and 50 characters',
			};
		}

		// Check if character name already exists in this campaign
		const existingCharacter = await prisma.campaignMember.findFirst({
			where: {
				campaignId: session.user.activeCampaignId,
				characterName: trimmedName,
				userId: {
					not: session.user.id,
				},
			},
		});

		if (existingCharacter) {
			return {
				success: false,
				error: 'This character name is already taken in this campaign',
			};
		}

		// Update the character name
		const updatedMember = await prisma.campaignMember.update({
			where: {
				userId_campaignId: {
					userId: session.user.id,
					campaignId: session.user.activeCampaignId,
				},
			},
			data: {
				characterName: trimmedName,
			},
		});

		return {
			success: true,
			data: {
				characterName: updatedMember.characterName,
			},
		};
	} catch (error) {
		console.error('Error updating character name:', error);
		return {
			success: false,
			error: 'Failed to update character name',
		};
	}
}

/**
 * Get all campaign members for DM's campaigns
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getDMCampaignMembers() {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify DM role
		if (session.user.role !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM access required',
			};
		}

		// Get all campaign members from campaigns where user is DM
		const campaignMembers = await prisma.campaignMember.findMany({
			where: {
				campaign: {
					members: {
						some: {
							userId: session.user.id,
							role: 'DM',
						},
					},
				},
			},
			select: {
				id: true,
				role: true,
				joinedAt: true,
				characterName: true,
				user: {
					select: {
						id: true,
						email: true,
						username: true,
						role: true,
						createdAt: true,
						_count: {
							select: {
								campaignMembers: true,
							},
						},
					},
				},
				campaign: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				joinedAt: 'desc',
			},
		});

		return {
			success: true,
			data: campaignMembers,
		};
	} catch (error) {
		console.error('Error fetching DM campaign members:', error);
		return {
			success: false,
			error: 'Failed to fetch campaign members',
		};
	}
}

/**
 * Invite player by email - creates user if doesn't exist, adds to campaign
 * @param {Object} inviteData - {email, role, username, campaignId}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function invitePlayerByEmail(inviteData) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify DM role
		if (session.user.role !== 'DM' && session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Validate input
		if (!inviteData.email || !inviteData.role || !inviteData.campaignId) {
			return {
				success: false,
				error: 'Email, role, and campaign are required',
			};
		}

		// For DMs, verify they are DM of the specified campaign
		if (session.user.role === 'DM') {
			const dmMembership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: inviteData.campaignId,
					role: 'DM',
				},
			});

			if (!dmMembership) {
				return {
					success: false,
					error: 'Unauthorized - You must be a DM of this campaign',
				};
			}
		}

		// Check if user already exists
		let user = await prisma.user.findUnique({
			where: { email: inviteData.email },
		});

		// Create user if doesn't exist
		if (!user) {
			user = await prisma.user.create({
				data: {
					email: inviteData.email,
					username: inviteData.username || inviteData.email.split('@')[0],
					role: 'PLAYER', // Always create as PLAYER initially
				},
			});
		}

		// Check if user is already a member of this campaign
		const existingMembership = await prisma.campaignMember.findFirst({
			where: {
				userId: user.id,
				campaignId: inviteData.campaignId,
			},
		});

		if (existingMembership) {
			return {
				success: false,
				error: 'User is already a member of this campaign',
			};
		}

		// Add user to campaign
		const membership = await prisma.campaignMember.create({
			data: {
				userId: user.id,
				campaignId: inviteData.campaignId,
				role: inviteData.role,
			},
			select: {
				id: true,
				role: true,
				joinedAt: true,
				user: {
					select: {
						id: true,
						email: true,
						username: true,
						role: true,
					},
				},
				campaign: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return {
			success: true,
			data: membership,
		};
	} catch (error) {
		console.error('Error inviting player:', error);
		return {
			success: false,
			error: 'Failed to invite player',
		};
	}
}

/**
 * Promote a user to DM role - DM or Admin only
 * @param {string} userId - User ID to promote
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function promoteUserToDM(userId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify DM or ADMIN role
		if (session.user.role !== 'DM' && session.user.role !== 'ADMIN') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Validate user ID
		if (!userId) {
			return {
				success: false,
				error: 'User ID is required',
			};
		}

		// Check if user exists and is currently a PLAYER
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				role: true,
				_count: {
					select: {
						campaignMembers: true,
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

		if (user.role !== 'PLAYER') {
			return {
				success: false,
				error: `User is already a ${user.role}`,
			};
		}

		// Promote user to DM
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { role: 'DM' },
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});

		return {
			success: true,
			data: updatedUser,
		};
	} catch (error) {
		console.error('Error promoting user to DM:', error);
		return {
			success: false,
			error: 'Failed to promote user to DM',
		};
	}
}

/**
 * Promote player to DM within a specific campaign
 * @param {string} userId - User ID to promote
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function promoteToDMInCampaign(userId, campaignId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify DM role in the campaign
		const dmMembership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
				role: 'DM',
			},
		});

		if (!dmMembership) {
			return {
				success: false,
				error: 'Unauthorized - You must be a DM of this campaign',
			};
		}

		// Check if user is a member of this campaign
		const targetMembership = await prisma.campaignMember.findFirst({
			where: {
				userId: userId,
				campaignId: campaignId,
			},
			include: {
				user: true,
			},
		});

		if (!targetMembership) {
			return {
				success: false,
				error: 'User is not a member of this campaign',
			};
		}

		if (targetMembership.role === 'DM') {
			return {
				success: false,
				error: 'User is already a DM in this campaign',
			};
		}

		// Update campaign membership role to DM
		const updatedMembership = await prisma.campaignMember.update({
			where: { id: targetMembership.id },
			data: { role: 'DM' },
			include: {
				user: true,
				campaign: true,
			},
		});

		// Also promote user's global role to DM if they're still a PLAYER
		if (targetMembership.user.role === 'PLAYER') {
			await prisma.user.update({
				where: { id: userId },
				data: { role: 'DM' },
			});
		}

		return {
			success: true,
			data: updatedMembership,
		};
	} catch (error) {
		console.error('Error promoting user to DM in campaign:', error);
		return {
			success: false,
			error: 'Failed to promote user to DM',
		};
	}
}

/**
 * Demote DM to player within a specific campaign (only self-demotion)
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function demoteFromDMInCampaign(campaignId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify user is DM in the campaign
		const userMembership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
				role: 'DM',
			},
		});

		if (!userMembership) {
			return {
				success: false,
				error: 'You are not a DM in this campaign',
			};
		}

		// Check how many DMs are in this campaign
		const dmCount = await prisma.campaignMember.count({
			where: {
				campaignId: campaignId,
				role: 'DM',
			},
		});

		if (dmCount <= 1) {
			return {
				success: false,
				error: 'Cannot step down - there must be at least one DM in the campaign. Promote another player to DM first.',
			};
		}

		// Demote to PLAYER in this campaign
		const updatedMembership = await prisma.campaignMember.update({
			where: { id: userMembership.id },
			data: { role: 'PLAYER' },
			include: {
				user: true,
				campaign: true,
			},
		});

		// Check if user is DM in any other campaigns
		const otherDMRoles = await prisma.campaignMember.count({
			where: {
				userId: session.user.id,
				role: 'DM',
				campaignId: { not: campaignId },
			},
		});

		// If user is not DM in any other campaigns, demote their global role to PLAYER
		if (otherDMRoles === 0 && session.user.role === 'DM') {
			await prisma.user.update({
				where: { id: session.user.id },
				data: { role: 'PLAYER' },
			});
		}

		return {
			success: true,
			data: updatedMembership,
		};
	} catch (error) {
		console.error('Error demoting from DM in campaign:', error);
		return {
			success: false,
			error: 'Failed to step down from DM role',
		};
	}
}

/**
 * Get campaign members for a specific campaign (accessible to campaign members)
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignMembers(campaignId) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify user is a member of this campaign
		const userMembership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
			},
		});

		if (!userMembership) {
			return {
				success: false,
				error: 'Unauthorized - You must be a member of this campaign',
			};
		}

		// Get all campaign members
		const campaignMembers = await prisma.campaignMember.findMany({
			where: {
				campaignId: campaignId,
			},
			select: {
				id: true,
				role: true,
				joinedAt: true,
				characterName: true,
				user: {
					select: {
						id: true,
						email: true,
						username: true,
						role: true,
					},
				},
			},
			orderBy: [
				{ role: 'desc' }, // DMs first
				{ joinedAt: 'asc' }, // Then by join date
			],
		});

		return {
			success: true,
			data: campaignMembers,
		};
	} catch (error) {
		console.error('Error fetching campaign members:', error);
		return {
			success: false,
			error: 'Failed to fetch campaign members',
		};
	}
}

// ============ CREATURE ACTIONS ============

/**
 * Get all creatures for the active campaign
 * @param {string} campaignId - Campaign ID
 * @param {string} search - Search term (optional)
 * @param {string} category - Category filter (optional)
 * @param {string[]} tags - Tags filter (optional)
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignCreatures(campaignId, search = '', category = '', tags = []) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Build filter conditions
		const where = {
			campaignId: campaignId,
		};

		// Add search filter
		if (search) {
			where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
		}

		// Add category filter
		if (category) {
			where.category = category;
		}

		// Add tags filter
		if (tags.length > 0) {
			where.tags = { hasSome: tags };
		}

		const creatures = await prisma.creature.findMany({
			where,
			include: {
				creator: {
					select: {
						id: true,
						username: true,
						email: true,
						campaignMembers: {
							where: {
								campaignId: campaignId,
							},
							select: {
								characterName: true,
								role: true,
							},
						},
					},
				},
			},
			orderBy: {
				name: 'asc', // Alphabetical order
			},
		});

		return {
			success: true,
			data: creatures,
		};
	} catch (error) {
		console.error('Error fetching creatures:', error);
		return {
			success: false,
			error: 'Failed to fetch creatures',
		};
	}
}

/**
 * Create a new creature
 * @param {Object} creatureData - Creature data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCreature(creatureData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		if (!session.user.activeCampaignId) {
			return {
				success: false,
				error: 'No active campaign',
			};
		}

		// Check if user is DM or Admin
		if (session.user.role !== 'ADMIN' && session.user.campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Only DMs and Admins can create creatures',
			};
		}

		// Validate required fields
		if (!creatureData.name) {
			return {
				success: false,
				error: 'Name is required',
			};
		}

		// Create the creature
		const creature = await prisma.creature.create({
			data: {
				name: creatureData.name,
				description: creatureData.description || '',
				category: creatureData.category || 'NPC',
				tags: creatureData.tags || [],
				avatarUrl: creatureData.avatarUrl || null,

				// D&D Stats
				armorClass: creatureData.armorClass || null,
				hitPoints: creatureData.hitPoints || null,
				speed: creatureData.speed || null,

				// Ability Scores
				strength: creatureData.strength || null,
				dexterity: creatureData.dexterity || null,
				constitution: creatureData.constitution || null,
				intelligence: creatureData.intelligence || null,
				wisdom: creatureData.wisdom || null,
				charisma: creatureData.charisma || null,

				// Combat & Skills
				challengeRating: creatureData.challengeRating || null,
				proficiencyBonus: creatureData.proficiencyBonus || null,
				skills: creatureData.skills || null,
				savingThrows: creatureData.savingThrows || null,
				damageResistances: creatureData.damageResistances || null,
				damageImmunities: creatureData.damageImmunities || null,
				conditionImmunities: creatureData.conditionImmunities || null,
				senses: creatureData.senses || null,
				languages: creatureData.languages || null,

				// D&D Features
				traits: creatureData.traits || null,
				actions: creatureData.actions || null,
				legendaryActions: creatureData.legendaryActions || null,
				lairActions: creatureData.lairActions || null,
				spellcasting: creatureData.spellcasting || null,

				// Metadata
				creatorId: session.user.id,
				campaignId: session.user.activeCampaignId,
			},
			include: {
				creator: {
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
			data: creature,
		};
	} catch (error) {
		console.error('Error creating creature:', error);
		return {
			success: false,
			error: 'Failed to create creature',
		};
	}
}

/**
 * Update a creature
 * @param {string} creatureId - Creature ID
 * @param {Object} creatureData - Updated creature data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCreature(creatureId, creatureData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Find the creature
		const existingCreature = await prisma.creature.findUnique({
			where: { id: creatureId },
		});

		if (!existingCreature) {
			return {
				success: false,
				error: 'Creature not found',
			};
		}

		// Check permissions - only creator, DM, or Admin can edit
		if (session.user.role !== 'ADMIN' && session.user.campaignRole !== 'DM' && existingCreature.creatorId !== session.user.id) {
			return {
				success: false,
				error: 'Permission denied',
			};
		}

		// Update the creature
		const updatedCreature = await prisma.creature.update({
			where: { id: creatureId },
			data: {
				name: creatureData.name,
				description: creatureData.description || '',
				category: creatureData.category || 'NPC',
				tags: creatureData.tags || [],
				avatarUrl: creatureData.avatarUrl || null,

				// D&D Stats
				armorClass: creatureData.armorClass || null,
				hitPoints: creatureData.hitPoints || null,
				speed: creatureData.speed || null,

				// Ability Scores
				strength: creatureData.strength || null,
				dexterity: creatureData.dexterity || null,
				constitution: creatureData.constitution || null,
				intelligence: creatureData.intelligence || null,
				wisdom: creatureData.wisdom || null,
				charisma: creatureData.charisma || null,

				// Combat & Skills
				challengeRating: creatureData.challengeRating || null,
				proficiencyBonus: creatureData.proficiencyBonus || null,
				skills: creatureData.skills || null,
				savingThrows: creatureData.savingThrows || null,
				damageResistances: creatureData.damageResistances || null,
				damageImmunities: creatureData.damageImmunities || null,
				conditionImmunities: creatureData.conditionImmunities || null,
				senses: creatureData.senses || null,
				languages: creatureData.languages || null,

				// D&D Features
				traits: creatureData.traits || null,
				actions: creatureData.actions || null,
				legendaryActions: creatureData.legendaryActions || null,
				lairActions: creatureData.lairActions || null,
				spellcasting: creatureData.spellcasting || null,
			},
			include: {
				creator: {
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
			data: updatedCreature,
		};
	} catch (error) {
		console.error('Error updating creature:', error);
		return {
			success: false,
			error: 'Failed to update creature',
		};
	}
}

/**
 * Delete a creature
 * @param {string} creatureId - Creature ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCreature(creatureId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Find the creature
		const existingCreature = await prisma.creature.findUnique({
			where: { id: creatureId },
		});

		if (!existingCreature) {
			return {
				success: false,
				error: 'Creature not found',
			};
		}

		// Check permissions - only creator, DM, or Admin can delete
		if (session.user.role !== 'ADMIN' && session.user.campaignRole !== 'DM' && existingCreature.creatorId !== session.user.id) {
			return {
				success: false,
				error: 'Permission denied',
			};
		}

		// Delete the creature
		await prisma.creature.delete({
			where: { id: creatureId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting creature:', error);
		return {
			success: false,
			error: 'Failed to delete creature',
		};
	}
}
