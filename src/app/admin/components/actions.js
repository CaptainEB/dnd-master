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

		// Admin users don't automatically get added as campaign members
		// Campaign memberships are managed separately through the campaign member functions

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

		// Verify ADMIN role or DM of this campaign
		if (session.user.role !== 'ADMIN') {
			// If not admin, check if user is a DM of this campaign
			const campaignMembership = await prisma.campaignMember.findFirst({
				where: {
					campaignId: campaignId,
					user: {
						email: session.user.email,
					},
					role: 'DM',
				},
			});

			if (!campaignMembership) {
				return {
					success: false,
					error: 'Unauthorized - Admin access or DM role required for this campaign',
				};
			}
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

		// Convert old role values to new simplified system
		let userRole = userData.role;
		if (userData.role === 'DM' || userData.role === 'PLAYER') {
			userRole = 'USER'; // DM and PLAYER both become USER in site-level permissions
		} else if (userData.role === 'ADMIN') {
			userRole = 'ADMIN'; // ADMIN stays ADMIN
		} else if (userData.role === 'USER') {
			userRole = 'USER'; // USER stays USER
		} else {
			// Invalid role provided
			return {
				success: false,
				error: 'Invalid role. Must be USER or ADMIN.',
			};
		}

		// Create user
		const user = await prisma.user.create({
			data: {
				email: userData.email.trim().toLowerCase(),
				role: userRole,
				username: userData.username?.trim() || null,
			},
			select: {
				id: true,
				email: true,
				role: true,
				username: true,
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

		// Verify ADMIN role or DM of this campaign
		if (session.user.role !== 'ADMIN') {
			// If not admin, check if user is a DM of this campaign
			const campaignMembership = await prisma.campaignMember.findFirst({
				where: {
					campaignId: memberData.campaignId,
					user: {
						email: session.user.email,
					},
					role: 'DM',
				},
			});

			if (!campaignMembership) {
				return {
					success: false,
					error: 'Unauthorized - Admin access or DM role required for this campaign',
				};
			}
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

		// Validate membership ID
		if (!membershipId) {
			return {
				success: false,
				error: 'Membership ID is required',
			};
		}

		// Get the membership to check campaign access
		const membership = await prisma.campaignMember.findUnique({
			where: { id: membershipId },
			select: { campaignId: true },
		});

		if (!membership) {
			return {
				success: false,
				error: 'Membership not found',
			};
		}

		// Verify ADMIN role or DM of this campaign
		if (session.user.role !== 'ADMIN') {
			// If not admin, check if user is a DM of this campaign
			const campaignMembership = await prisma.campaignMember.findFirst({
				where: {
					campaignId: membership.campaignId,
					user: {
						email: session.user.email,
					},
					role: 'DM',
				},
			});

			if (!campaignMembership) {
				return {
					success: false,
					error: 'Unauthorized - Admin access or DM role required for this campaign',
				};
			}
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

// ===== INFO ACTIONS =====

/**
 * Get all campaign info entries
 * @param {string} campaignId
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignInfos(campaignId) {
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

		// Get all info entries for the campaign, ordered by category and order
		const infos = await prisma.info.findMany({
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

		// Get character names for info authors
		const authorIds = [...new Set(infos.map((info) => info.authorId))];
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

		// Add character names to infos
		const infosWithCharacterNames = infos.map((info) => ({
			...info,
			author: {
				...info.author,
				characterName: characterNameMap[info.authorId] || null,
			},
		}));

		return {
			success: true,
			data: infosWithCharacterNames,
		};
	} catch (error) {
		console.error('Error fetching campaign infos:', error);
		return {
			success: false,
			error: 'Failed to fetch info entries',
		};
	}
}

/**
 * Create a new info entry - DM/Admin only
 * @param {string} campaignId
 * @param {Object} infoData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCampaignInfo(campaignId, infoData) {
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
				error: 'Unauthorized - Only DMs and Admins can create info entries',
			};
		}

		// Create the info entry
		const info = await prisma.info.create({
			data: {
				title: infoData.title,
				description: infoData.description,
				body: infoData.body,
				category: infoData.category || 'General',
				order: infoData.order || 0,
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
			data: info,
		};
	} catch (error) {
		console.error('Error creating info:', error);
		return {
			success: false,
			error: 'Failed to create info entry',
		};
	}
}

/**
 * Update an existing info entry - DM/Admin only
 * @param {string} infoId
 * @param {Object} infoData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignInfo(infoId, infoData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing info with campaign info
		const existingInfo = await prisma.info.findUnique({
			where: { id: infoId },
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

		if (!existingInfo) {
			return {
				success: false,
				error: 'Info entry not found',
			};
		}

		// Check permissions: Admin or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = existingInfo.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can edit info entries',
			};
		}

		// Update the info entry
		const updatedInfo = await prisma.info.update({
			where: { id: infoId },
			data: {
				title: infoData.title,
				description: infoData.description,
				body: infoData.body,
				category: infoData.category,
				order: infoData.order,
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
			data: updatedInfo,
		};
	} catch (error) {
		console.error('Error updating info:', error);
		return {
			success: false,
			error: 'Failed to update info entry',
		};
	}
}

/**
 * Delete an info entry - DM/Admin only
 * @param {string} infoId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCampaignInfo(infoId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the existing info with campaign info
		const existingInfo = await prisma.info.findUnique({
			where: { id: infoId },
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

		if (!existingInfo) {
			return {
				success: false,
				error: 'Info entry not found',
			};
		}

		// Check permissions: Admin or DM in the campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = existingInfo.campaign.members.find((m) => m.role === 'DM');
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Only DMs and Admins can delete info entries',
			};
		}

		// Delete the info entry
		await prisma.info.delete({
			where: { id: infoId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting info:', error);
		return {
			success: false,
			error: 'Failed to delete info entry',
		};
	}
}

// ===== CAMPAIGN BACKGROUND ACTIONS =====

/**
 * Update campaign background image URL - DM/Admin only
 * @param {string} campaignId
 * @param {string} backgroundUrl
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignBackground(campaignId, backgroundUrl) {
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
				error: 'Unauthorized - Only DMs and Admins can change campaign background',
			};
		}

		// Update the campaign background
		const updatedCampaign = await prisma.campaign.update({
			where: { id: campaignId },
			data: {
				infoBackgroundUrl: backgroundUrl || null, // Allow clearing by passing empty string
			},
		});

		return {
			success: true,
			data: updatedCampaign,
		};
	} catch (error) {
		console.error('Error updating campaign background:', error);
		return {
			success: false,
			error: 'Failed to update campaign background',
		};
	}
}

/**
 * Get campaign background image URL
 * @param {string} campaignId
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
export async function getCampaignBackground(campaignId) {
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

		// Get the campaign background URL
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			select: { infoBackgroundUrl: true },
		});

		if (!campaign) {
			return {
				success: false,
				error: 'Campaign not found',
			};
		}

		return {
			success: true,
			data: campaign.infoBackgroundUrl,
		};
	} catch (error) {
		console.error('Error fetching campaign background:', error);
		return {
			success: false,
			error: 'Failed to fetch campaign background',
		};
	}
}

// ===== NOTES ACTIONS =====

/**
 * Get campaign notes for all members in a campaign
 * @param {string} campaignId
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @param {string} searchQuery - Optional search query
 * @param {string} tagFilter - Optional tag filter
 * @param {string} authorFilter - Optional author filter (user ID)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getCampaignNotes(campaignId, page = 1, limit = 20, searchQuery = '', tagFilter = '', authorFilter = '') {
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
			// Show all notes in the campaign, not just user's own notes
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

		// Add author filter
		if (authorFilter) {
			where.authorId = authorFilter;
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

		// Get all unique tags for this campaign
		const allCampaignNotes = await prisma.note.findMany({
			where: {
				campaignId: campaignId,
			},
			select: {
				tags: true,
			},
		});

		const allTags = [...new Set(allCampaignNotes.flatMap((note) => note.tags))].sort();

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
 * Create a new campaign note
 * @param {string} campaignId
 * @param {Object} noteData - {title?, content, tags?}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCampaignNote(campaignId, noteData) {
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
				isShared: noteData.isShared || false,
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
 * Update a campaign note - Users can edit their own notes, admins can edit any note
 * @param {string} noteId
 * @param {Object} noteData - {title?, content, tags?}
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCampaignNote(noteId, noteData) {
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

		// Check permissions: Users can edit their own notes, shared notes can be edited by campaign members, DMs can edit any notes in their campaign, admins can edit any notes
		let canEdit = false;

		// User is the author
		if (existingNote.authorId === session.user.id) {
			canEdit = true;
		}
		// User is a site admin
		else if (session.user.role === 'ADMIN') {
			canEdit = true;
		}
		// User is a DM in this campaign
		else {
			const dmMembership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingNote.campaignId,
					role: 'DM',
				},
			});
			if (dmMembership) {
				canEdit = true;
			}
		}
		// Note is shared and user is a campaign member
		if (!canEdit && existingNote.isShared) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingNote.campaignId,
				},
			});
			if (membership) {
				canEdit = true;
			}
		}

		if (!canEdit) {
			return {
				success: false,
				error: 'Unauthorized - You can only edit your own notes, shared notes, or notes in campaigns where you are a DM/admin',
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
				isShared: noteData.isShared !== undefined ? noteData.isShared : existingNote.isShared,
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
 * Delete a campaign note - Users can delete their own notes, admins can delete any note
 * @param {string} noteId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCampaignNote(noteId) {
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

		// Check permissions: Users can delete their own notes, DMs can delete any notes in their campaign, admins can delete any notes
		let canDelete = false;

		// User is the author
		if (existingNote.authorId === session.user.id) {
			canDelete = true;
		}
		// User is a site admin
		else if (session.user.role === 'ADMIN') {
			canDelete = true;
		}
		// User is a DM in this campaign
		else {
			const dmMembership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingNote.campaignId,
					role: 'DM',
				},
			});
			if (dmMembership) {
				canDelete = true;
			}
		}

		if (!canDelete) {
			return {
				success: false,
				error: 'Unauthorized - You can only delete your own notes unless you are a DM or admin',
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
 * @param {string} questTypeFilter - Optional quest type filter
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignQuests(campaignId, statusFilter = null, questTypeFilter = null) {
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
		if (questTypeFilter) {
			where.questTypeId = questTypeFilter;
		}

		// Get all quests for the campaign
		const quests = await prisma.quest.findMany({
			where: where,
			orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
			include: {
				questType: {
					select: {
						id: true,
						name: true,
					},
				},
			},
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
				questTypeId: questData.questTypeId || null,
			},
			include: {
				questType: {
					select: {
						id: true,
						name: true,
					},
				},
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
				questTypeId: questData.questTypeId || null,
			},
			include: {
				questType: {
					select: {
						id: true,
						name: true,
					},
				},
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

		// Check if user is DM of any campaign (can't check user.role since DM is a campaign role now)
		const dmMemberships = await prisma.campaignMember.findMany({
			where: {
				user: {
					email: session.user.email,
				},
				role: 'DM',
			},
		});

		if (dmMemberships.length === 0) {
			return {
				success: false,
				error: 'Unauthorized - DM role required in at least one campaign',
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
					role: 'USER', // Always create as USER initially
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

		// In the simplified role system, site-level roles are independent of campaign roles
		// Users maintain their site role (USER/ADMIN) regardless of campaign permissions

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

		// Filter out private creatures for non-DM/Admin users
		if (session.user.role !== 'ADMIN' && session.user.campaignRole !== 'DM') {
			// Show creatures that are NOT explicitly true (includes false, null, undefined)
			where.NOT = {
				isPrivate: true,
			};
		}

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
				isPrivate: creatureData.isPrivate || false,

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
				isPrivate: creatureData.isPrivate || false,

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

// ==================== QUEST TYPE ACTIONS ====================

/**
 * Get all quest types for a campaign
 * @param {string} campaignId
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getQuestTypes(campaignId) {
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

		// Get all quest types for the campaign
		const questTypes = await prisma.questType.findMany({
			where: { campaignId },
			orderBy: { name: 'asc' },
			include: {
				_count: {
					select: { quests: true },
				},
			},
		});

		return {
			success: true,
			data: questTypes,
		};
	} catch (error) {
		console.error('Error fetching quest types:', error);
		return {
			success: false,
			error: 'Failed to fetch quest types',
		};
	}
}

/**
 * Create a new quest type - DM/Admin only
 * @param {string} campaignId
 * @param {Object} questTypeData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createQuestType(campaignId, questTypeData) {
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
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Check if quest type name already exists in this campaign
		const existingQuestType = await prisma.questType.findFirst({
			where: {
				campaignId,
				name: questTypeData.name,
			},
		});

		if (existingQuestType) {
			return {
				success: false,
				error: 'A quest type with this name already exists in this campaign',
			};
		}

		// Create the quest type
		const questType = await prisma.questType.create({
			data: {
				name: questTypeData.name,
				description: questTypeData.description,
				campaignId,
			},
		});

		return {
			success: true,
			data: questType,
		};
	} catch (error) {
		console.error('Error creating quest type:', error);
		return {
			success: false,
			error: 'Failed to create quest type',
		};
	}
}

/**
 * Delete a quest type - DM/Admin only
 * @param {string} questTypeId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteQuestType(questTypeId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the quest type to verify campaign membership
		const questType = await prisma.questType.findUnique({
			where: { id: questTypeId },
			include: {
				_count: {
					select: { quests: true },
				},
			},
		});

		if (!questType) {
			return {
				success: false,
				error: 'Quest type not found',
			};
		}

		// Check if quest type has associated quests
		if (questType._count.quests > 0) {
			return {
				success: false,
				error: 'Cannot delete quest type that has associated quests',
			};
		}

		// Check if user is DM/Admin
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: questType.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Delete the quest type
		await prisma.questType.delete({
			where: { id: questTypeId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting quest type:', error);
		return {
			success: false,
			error: 'Failed to delete quest type',
		};
	}
}

// ============ MAP POST ACTIONS ============

/**
 * Create a new map post
 * @param {Object} mapPostData - The map post data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createMapPost(mapPostData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Validate required fields
		if (!mapPostData.title || !mapPostData.imageUrl || !mapPostData.campaignId) {
			return {
				success: false,
				error: 'Title, image URL, and campaign ID are required',
			};
		}

		// Check if user is DM/Admin for this campaign
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: mapPostData.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Create the map post
		const mapPost = await prisma.mapPost.create({
			data: {
				title: mapPostData.title,
				description: mapPostData.description || '',
				imageUrl: mapPostData.imageUrl,
				tags: mapPostData.tags || [],
				authorId: session.user.id,
				campaignId: mapPostData.campaignId,
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
						campaignMembers: {
							where: {
								campaignId: mapPostData.campaignId,
							},
							select: {
								characterName: true,
							},
						},
					},
				},
			},
		});

		return {
			success: true,
			data: mapPost,
		};
	} catch (error) {
		console.error('Error creating map post:', error);
		return {
			success: false,
			error: 'Failed to create map post',
		};
	}
}

/**
 * Get all map posts for a campaign
 * @param {string} campaignId - The campaign ID
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getMapPosts(campaignId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

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
				error: 'Unauthorized - Must be a campaign member',
			};
		}

		// Get all map posts for the campaign, ordered by creation date (newest first)
		const mapPosts = await prisma.mapPost.findMany({
			where: {
				campaignId: campaignId,
			},
			include: {
				author: {
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
			data: mapPosts,
		};
	} catch (error) {
		console.error('Error fetching map posts:', error);
		return {
			success: false,
			error: 'Failed to fetch map posts',
		};
	}
}

/**
 * Update a map post
 * @param {string} mapPostId - The map post ID
 * @param {Object} mapPostData - The updated map post data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateMapPost(mapPostId, mapPostData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		if (!mapPostId) {
			return {
				success: false,
				error: 'Map post ID is required',
			};
		}

		// Validate required fields
		if (!mapPostData.title || !mapPostData.imageUrl) {
			return {
				success: false,
				error: 'Title and image URL are required',
			};
		}

		// Get the existing map post to check permissions
		const existingMapPost = await prisma.mapPost.findUnique({
			where: { id: mapPostId },
		});

		if (!existingMapPost) {
			return {
				success: false,
				error: 'Map post not found',
			};
		}

		// Check if user is the author, DM, or Admin
		let hasPermission = session.user.role === 'ADMIN' || existingMapPost.authorId === session.user.id;

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingMapPost.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be the author, DM, or Admin',
			};
		}

		// Update the map post
		const updatedMapPost = await prisma.mapPost.update({
			where: { id: mapPostId },
			data: {
				title: mapPostData.title,
				description: mapPostData.description || '',
				imageUrl: mapPostData.imageUrl,
				tags: mapPostData.tags || [],
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
						campaignMembers: {
							where: {
								campaignId: existingMapPost.campaignId,
							},
							select: {
								characterName: true,
							},
						},
					},
				},
			},
		});

		return {
			success: true,
			data: updatedMapPost,
		};
	} catch (error) {
		console.error('Error updating map post:', error);
		return {
			success: false,
			error: 'Failed to update map post',
		};
	}
}

/**
 * Delete a map post
 * @param {string} mapPostId - The map post ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteMapPost(mapPostId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		if (!mapPostId) {
			return {
				success: false,
				error: 'Map post ID is required',
			};
		}

		// Get the existing map post to check permissions
		const existingMapPost = await prisma.mapPost.findUnique({
			where: { id: mapPostId },
		});

		if (!existingMapPost) {
			return {
				success: false,
				error: 'Map post not found',
			};
		}

		// Check if user is the author, DM, or Admin
		let hasPermission = session.user.role === 'ADMIN' || existingMapPost.authorId === session.user.id;

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingMapPost.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be the author, DM, or Admin',
			};
		}

		// Delete the map post
		await prisma.mapPost.delete({
			where: { id: mapPostId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting map post:', error);
		return {
			success: false,
			error: 'Failed to delete map post',
		};
	}
}

// =============================================
// MERCHANT ACTIONS
// =============================================

/**
 * Get all merchants for a campaign
 * @param {string} campaignId
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignMerchants(campaignId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify user is part of the campaign
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
			},
		});

		if (!membership) {
			return {
				success: false,
				error: 'Unauthorized - Not a member of this campaign',
			};
		}

		const merchants = await prisma.merchant.findMany({
			where: { campaignId },
			include: {
				author: {
					select: {
						username: true,
						email: true,
					},
				},
				stockItems: {
					include: {
						currency: true,
					},
					orderBy: [{ type: 'asc' }, { itemName: 'asc' }],
				},
			},
			orderBy: [{ city: 'asc' }, { name: 'asc' }],
		});

		return {
			success: true,
			data: merchants,
		};
	} catch (error) {
		console.error('Error fetching merchants:', error);
		return {
			success: false,
			error: 'Failed to fetch merchants',
		};
	}
}

/**
 * Create a new merchant - DM/Admin only
 * @param {string} campaignId
 * @param {object} merchantData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createMerchant(campaignId, merchantData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
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
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		const merchant = await prisma.merchant.create({
			data: {
				...merchantData,
				authorId: session.user.id,
				campaignId,
			},
			include: {
				author: {
					select: {
						username: true,
						email: true,
					},
				},
				stockItems: true,
			},
		});

		return {
			success: true,
			data: merchant,
		};
	} catch (error) {
		console.error('Error creating merchant:', error);
		return {
			success: false,
			error: 'Failed to create merchant',
		};
	}
}

/**
 * Update merchant - DM/Admin only
 * @param {string} merchantId
 * @param {object} merchantData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateMerchant(merchantId, merchantData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get existing merchant
		const existingMerchant = await prisma.merchant.findUnique({
			where: { id: merchantId },
		});

		if (!existingMerchant) {
			return {
				success: false,
				error: 'Merchant not found',
			};
		}

		// Check permissions
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingMerchant.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		const merchant = await prisma.merchant.update({
			where: { id: merchantId },
			data: merchantData,
			include: {
				author: {
					select: {
						username: true,
						email: true,
					},
				},
				stockItems: {
					orderBy: [{ type: 'asc' }, { itemName: 'asc' }],
				},
			},
		});

		return {
			success: true,
			data: merchant,
		};
	} catch (error) {
		console.error('Error updating merchant:', error);
		return {
			success: false,
			error: 'Failed to update merchant',
		};
	}
}

/**
 * Delete merchant - DM/Admin only
 * @param {string} merchantId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteMerchant(merchantId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get existing merchant
		const existingMerchant = await prisma.merchant.findUnique({
			where: { id: merchantId },
		});

		if (!existingMerchant) {
			return {
				success: false,
				error: 'Merchant not found',
			};
		}

		// Check permissions
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingMerchant.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		// Delete merchant (stock items will be deleted due to cascade)
		await prisma.merchant.delete({
			where: { id: merchantId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting merchant:', error);
		return {
			success: false,
			error: 'Failed to delete merchant',
		};
	}
}

/**
 * Create stock item for a merchant - DM/Admin only
 * @param {string} merchantId
 * @param {object} stockData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createStockItem(merchantId, stockData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get merchant to verify campaign membership
		const merchant = await prisma.merchant.findUnique({
			where: { id: merchantId },
		});

		if (!merchant) {
			return {
				success: false,
				error: 'Merchant not found',
			};
		}

		// Check permissions
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: merchant.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		const stockItem = await prisma.stockItem.create({
			data: {
				...stockData,
				merchantId,
			},
		});

		return {
			success: true,
			data: stockItem,
		};
	} catch (error) {
		console.error('Error creating stock item:', error);
		return {
			success: false,
			error: 'Failed to create stock item',
		};
	}
}

/**
 * Update stock item - DM/Admin only
 * @param {string} stockItemId
 * @param {object} stockData
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateStockItem(stockItemId, stockData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get stock item and merchant
		const existingStockItem = await prisma.stockItem.findUnique({
			where: { id: stockItemId },
			include: { merchant: true },
		});

		if (!existingStockItem) {
			return {
				success: false,
				error: 'Stock item not found',
			};
		}

		// Check permissions
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingStockItem.merchant.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		const stockItem = await prisma.stockItem.update({
			where: { id: stockItemId },
			data: stockData,
		});

		return {
			success: true,
			data: stockItem,
		};
	} catch (error) {
		console.error('Error updating stock item:', error);
		return {
			success: false,
			error: 'Failed to update stock item',
		};
	}
}

/**
 * Delete stock item - DM/Admin only
 * @param {string} stockItemId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteStockItem(stockItemId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get stock item and merchant
		const existingStockItem = await prisma.stockItem.findUnique({
			where: { id: stockItemId },
			include: { merchant: true },
		});

		if (!existingStockItem) {
			return {
				success: false,
				error: 'Stock item not found',
			};
		}

		// Check permissions
		let hasPermission = session.user.role === 'ADMIN';

		if (!hasPermission) {
			const membership = await prisma.campaignMember.findFirst({
				where: {
					userId: session.user.id,
					campaignId: existingStockItem.merchant.campaignId,
					role: 'DM',
				},
			});
			hasPermission = !!membership;
		}

		if (!hasPermission) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		await prisma.stockItem.delete({
			where: { id: stockItemId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting stock item:', error);
		return {
			success: false,
			error: 'Failed to delete stock item',
		};
	}
}

// ====================================
// Currency Management Functions
// ====================================

/**
 * Get all currencies for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCampaignCurrencies(campaignId) {
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

		if (!membership) {
			return {
				success: false,
				error: 'Unauthorized - Must be a member of this campaign',
			};
		}

		const currencies = await prisma.currency.findMany({
			where: { campaignId },
			orderBy: { name: 'asc' },
		});

		return {
			success: true,
			data: currencies,
		};
	} catch (error) {
		console.error('Error fetching currencies:', error);
		return {
			success: false,
			error: 'Failed to fetch currencies',
		};
	}
}

/**
 * Create a new currency for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {string} name - Currency name
 * @param {string} abbreviation - Currency abbreviation
 * @param {string} description - Currency description (optional)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCurrency(campaignId, name, abbreviation, description = '') {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify user is DM or Admin
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
			},
		});

		if (!membership || (membership.role !== 'DM' && session.user.role !== 'ADMIN')) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		const currency = await prisma.currency.create({
			data: {
				name,
				abbreviation,
				description,
				campaignId,
			},
		});

		return {
			success: true,
			data: currency,
		};
	} catch (error) {
		console.error('Error creating currency:', error);
		if (error.code === 'P2002') {
			return {
				success: false,
				error: 'Currency abbreviation already exists in this campaign',
			};
		}
		return {
			success: false,
			error: 'Failed to create currency',
		};
	}
}

/**
 * Update a currency
 * @param {string} currencyId - Currency ID
 * @param {string} name - Currency name
 * @param {string} abbreviation - Currency abbreviation
 * @param {string} description - Currency description (optional)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCurrency(currencyId, name, abbreviation, description = '') {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the currency and verify permissions
		const currency = await prisma.currency.findUnique({
			where: { id: currencyId },
		});

		if (!currency) {
			return {
				success: false,
				error: 'Currency not found',
			};
		}

		// Verify user is DM or Admin
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: currency.campaignId,
			},
		});

		if (!membership || (membership.role !== 'DM' && session.user.role !== 'ADMIN')) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		const updatedCurrency = await prisma.currency.update({
			where: { id: currencyId },
			data: {
				name,
				abbreviation,
				description,
			},
		});

		return {
			success: true,
			data: updatedCurrency,
		};
	} catch (error) {
		console.error('Error updating currency:', error);
		if (error.code === 'P2002') {
			return {
				success: false,
				error: 'Currency abbreviation already exists in this campaign',
			};
		}
		return {
			success: false,
			error: 'Failed to update currency',
		};
	}
}

/**
 * Delete a currency
 * @param {string} currencyId - Currency ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCurrency(currencyId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get the currency and verify permissions
		const currency = await prisma.currency.findUnique({
			where: { id: currencyId },
			include: {
				stockItems: true,
			},
		});

		if (!currency) {
			return {
				success: false,
				error: 'Currency not found',
			};
		}

		// Check if currency is in use
		if (currency.stockItems.length > 0) {
			return {
				success: false,
				error: 'Cannot delete currency that is in use by stock items',
			};
		}

		// Verify user is DM or Admin
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: currency.campaignId,
			},
		});

		if (!membership || (membership.role !== 'DM' && session.user.role !== 'ADMIN')) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		await prisma.currency.delete({
			where: { id: currencyId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting currency:', error);
		return {
			success: false,
			error: 'Failed to delete currency',
		};
	}
}

/**
 * Initialize default currencies for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function initializeDefaultCurrencies(campaignId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Verify user is DM or Admin
		const membership = await prisma.campaignMember.findFirst({
			where: {
				userId: session.user.id,
				campaignId: campaignId,
			},
		});

		if (!membership || (membership.role !== 'DM' && session.user.role !== 'ADMIN')) {
			return {
				success: false,
				error: 'Unauthorized - Must be DM or Admin',
			};
		}

		// Check if currencies already exist
		const existingCurrencies = await prisma.currency.findMany({
			where: { campaignId },
		});

		if (existingCurrencies.length > 0) {
			return {
				success: true,
				data: existingCurrencies,
			};
		}

		// Create default D&D currencies
		const defaultCurrencies = [
			{ name: 'Gold Pieces', abbreviation: 'gp', description: 'Standard gold currency' },
			{ name: 'Silver Pieces', abbreviation: 'sp', description: 'Standard silver currency' },
			{ name: 'Copper Pieces', abbreviation: 'cp', description: 'Standard copper currency' },
			{ name: 'Platinum Pieces', abbreviation: 'pp', description: 'Standard platinum currency' },
			{ name: 'Electrum Pieces', abbreviation: 'ep', description: 'Standard electrum currency' },
		];

		const currencies = await Promise.all(
			defaultCurrencies.map((currency) =>
				prisma.currency.create({
					data: {
						...currency,
						campaignId,
					},
				})
			)
		);

		return {
			success: true,
			data: currencies,
		};
	} catch (error) {
		console.error('Error initializing default currencies:', error);
		return {
			success: false,
			error: 'Failed to initialize default currencies',
		};
	}
}

// ============================================
// PLAYER KEEP FUNCTIONS
// ============================================

/**
 * Get or create player keep for campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getPlayerKeep(campaignId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Get or create player keep
		let playerKeep = await prisma.playerKeep.findUnique({
			where: { campaignId },
			include: {
				facilities: {
					orderBy: { createdAt: 'desc' },
				},
				hirelings: {
					orderBy: { createdAt: 'desc' },
				},
				checkIns: {
					orderBy: { createdAt: 'desc' },
					take: 10, // Get last 10 check-ins
				},
			},
		});

		// If no player keep exists, create one
		if (!playerKeep) {
			playerKeep = await prisma.playerKeep.create({
				data: {
					campaignId,
				},
				include: {
					facilities: true,
					hirelings: true,
					checkIns: true,
				},
			});
		}

		return {
			success: true,
			data: playerKeep,
		};
	} catch (error) {
		console.error('Error getting player keep:', error);
		return {
			success: false,
			error: 'Failed to get player keep',
		};
	}
}

/**
 * Update player keep icon
 * @param {string} playerKeepId - PlayerKeep ID
 * @param {string} iconUrl - Icon URL
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePlayerKeepIcon(playerKeepId, iconUrl) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify player keep belongs to user's active campaign
		const existingKeep = await prisma.playerKeep.findUnique({
			where: { id: playerKeepId },
			select: { campaignId: true },
		});

		if (!existingKeep || existingKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Player keep does not belong to your campaign',
			};
		}

		const playerKeep = await prisma.playerKeep.update({
			where: { id: playerKeepId },
			data: { iconUrl },
		});

		return {
			success: true,
			data: playerKeep,
		};
	} catch (error) {
		console.error('Error updating player keep icon:', error);
		return {
			success: false,
			error: 'Failed to update player keep icon',
		};
	}
}

/**
 * Update player keep description
 * @param {string} playerKeepId - PlayerKeep ID
 * @param {string} description - Description
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePlayerKeepDescription(playerKeepId, description) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify player keep belongs to user's active campaign
		const existingKeep = await prisma.playerKeep.findUnique({
			where: { id: playerKeepId },
			select: { campaignId: true },
		});

		if (!existingKeep || existingKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Player keep does not belong to your campaign',
			};
		}

		const playerKeep = await prisma.playerKeep.update({
			where: { id: playerKeepId },
			data: { description },
		});

		return {
			success: true,
			data: playerKeep,
		};
	} catch (error) {
		console.error('Error updating player keep description:', error);
		return {
			success: false,
			error: 'Failed to update player keep description',
		};
	}
}

/**
 * Create a facility
 * @param {Object} facilityData - Facility data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createFacility(facilityData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		const facility = await prisma.facility.create({
			data: facilityData,
		});

		return {
			success: true,
			data: facility,
		};
	} catch (error) {
		console.error('Error creating facility:', error);
		return {
			success: false,
			error: 'Failed to create facility',
		};
	}
}

/**
 * Update a facility
 * @param {string} facilityId - Facility ID
 * @param {Object} facilityData - Facility data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateFacility(facilityId, facilityData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify facility belongs to user's active campaign
		const existingFacility = await prisma.facility.findUnique({
			where: { id: facilityId },
			include: {
				playerKeep: {
					select: { campaignId: true },
				},
			},
		});

		if (!existingFacility || existingFacility.playerKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Facility does not belong to your campaign',
			};
		}

		const facility = await prisma.facility.update({
			where: { id: facilityId },
			data: facilityData,
		});

		return {
			success: true,
			data: facility,
		};
	} catch (error) {
		console.error('Error updating facility:', error);
		return {
			success: false,
			error: 'Failed to update facility',
		};
	}
}

/**
 * Delete a facility
 * @param {string} facilityId - Facility ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFacility(facilityId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify facility belongs to user's active campaign
		const existingFacility = await prisma.facility.findUnique({
			where: { id: facilityId },
			include: {
				playerKeep: {
					select: { campaignId: true },
				},
			},
		});

		if (!existingFacility || existingFacility.playerKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Facility does not belong to your campaign',
			};
		}

		await prisma.facility.delete({
			where: { id: facilityId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting facility:', error);
		return {
			success: false,
			error: 'Failed to delete facility',
		};
	}
}

/**
 * Create a hireling
 * @param {Object} hirelingData - Hireling data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createHireling(hirelingData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		const hireling = await prisma.hireling.create({
			data: hirelingData,
		});

		return {
			success: true,
			data: hireling,
		};
	} catch (error) {
		console.error('Error creating hireling:', error);
		return {
			success: false,
			error: 'Failed to create hireling',
		};
	}
}

/**
 * Update a hireling
 * @param {string} hirelingId - Hireling ID
 * @param {Object} hirelingData - Hireling data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateHireling(hirelingId, hirelingData) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify hireling belongs to user's active campaign
		const existingHireling = await prisma.hireling.findUnique({
			where: { id: hirelingId },
			include: {
				playerKeep: {
					select: { campaignId: true },
				},
			},
		});

		if (!existingHireling || existingHireling.playerKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Hireling does not belong to your campaign',
			};
		}

		const hireling = await prisma.hireling.update({
			where: { id: hirelingId },
			data: hirelingData,
		});

		return {
			success: true,
			data: hireling,
		};
	} catch (error) {
		console.error('Error updating hireling:', error);
		return {
			success: false,
			error: 'Failed to update hireling',
		};
	}
}

/**
 * Delete a hireling
 * @param {string} hirelingId - Hireling ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteHireling(hirelingId) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify hireling belongs to user's active campaign
		const existingHireling = await prisma.hireling.findUnique({
			where: { id: hirelingId },
			include: {
				playerKeep: {
					select: { campaignId: true },
				},
			},
		});

		if (!existingHireling || existingHireling.playerKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Hireling does not belong to your campaign',
			};
		}

		await prisma.hireling.delete({
			where: { id: hirelingId },
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error('Error deleting hireling:', error);
		return {
			success: false,
			error: 'Failed to delete hireling',
		};
	}
}

/**
 * Create a keep check-in with calculated breakdown
 * @param {string} playerKeepId - PlayerKeep ID
 * @param {number} weeksAway - Number of weeks away
 * @param {Object} breakdown - Breakdown of costs and profits
 * @param {Object} netProfit - Net profit for each currency
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createKeepCheckIn(playerKeepId, weeksAway, breakdown, netProfit) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		// Check if user is DM or Admin
		const userRole = session.user.role;
		const campaignRole = session.user.campaignRole;

		if (userRole !== 'ADMIN' && campaignRole !== 'DM') {
			return {
				success: false,
				error: 'Unauthorized - DM or Admin access required',
			};
		}

		// Verify player keep belongs to user's active campaign
		const existingKeep = await prisma.playerKeep.findUnique({
			where: { id: playerKeepId },
			select: { campaignId: true },
		});

		if (!existingKeep || existingKeep.campaignId !== session.user.activeCampaignId) {
			return {
				success: false,
				error: 'Unauthorized - Player keep does not belong to your campaign',
			};
		}

		const checkIn = await prisma.keepCheckIn.create({
			data: {
				playerKeepId,
				weeksAway,
				breakdown,
				netProfit,
			},
		});

		return {
			success: true,
			data: checkIn,
		};
	} catch (error) {
		console.error('Error creating keep check-in:', error);
		return {
			success: false,
			error: 'Failed to create keep check-in',
		};
	}
}

/**
 * Get keep check-ins history
 * @param {string} playerKeepId - PlayerKeep ID
 * @param {number} limit - Number of records to return
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getKeepCheckIns(playerKeepId, limit = 20) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return {
				success: false,
				error: 'Authentication required',
			};
		}

		const checkIns = await prisma.keepCheckIn.findMany({
			where: { playerKeepId },
			orderBy: { createdAt: 'desc' },
			take: limit,
		});

		return {
			success: true,
			data: checkIns,
		};
	} catch (error) {
		console.error('Error getting keep check-ins:', error);
		return {
			success: false,
			error: 'Failed to get keep check-ins',
		};
	}
}
