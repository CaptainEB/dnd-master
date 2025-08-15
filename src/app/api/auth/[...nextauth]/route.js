import prisma from '@/lib/prisma';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					prompt: 'select_account',
				},
			},
		}),
	],

	session: {
		strategy: 'jwt',
		maxAge: 7 * 24 * 60 * 60, // 7 days
	},

	callbacks: {
		async signIn({ user }) {
			const email = user?.email;
			if (!email) return false;

			// Only allow pre-existing users to sign in
			// Users must be manually added to the database first
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			// Reject sign-in if user doesn't exist in database
			if (!existingUser) {
				console.log(`Sign-in attempt rejected for unauthorized email: ${email}`);
				return false;
			}

			return true;
		},

		async jwt({ token, user, account, trigger }) {
			if (account && user) {
				const email = user?.email;
				if (email) {
					const existingUser = await prisma.user.findUnique({
						where: { email },
						include: {
							activeCampaign: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					});

					if (existingUser) {
						// Get user's role in active campaign
						let activeCampaignWithRole = null;
						if (existingUser.activeCampaign) {
							const membership = await prisma.campaignMember.findFirst({
								where: {
									userId: existingUser.id,
									campaignId: existingUser.activeCampaign.id,
								},
								select: {
									role: true,
									characterName: true,
								},
							});

							activeCampaignWithRole = {
								...existingUser.activeCampaign,
								userRole: membership?.role || null,
								characterName: membership?.characterName || null,
							};
						}
						// Update avatar if provided from OAuth provider
						if (user.image && account.provider === 'google') {
							try {
								await prisma.user.update({
									where: { id: existingUser.id },
									data: {
										avatarUrl: user.image,
									},
								});
							} catch (error) {
								console.error('Error updating user avatar:', error);
							}
						}

						token.id = existingUser.id;
						token.role = existingUser.role;
						token.username = existingUser.username;
						token.avatarUrl = user.image || existingUser.avatarUrl;
						token.activeCampaign = activeCampaignWithRole;
					}
				}
			}

			// Handle session updates without requiring re-authentication
			if (trigger === 'update' && token.id) {
				const existingUser = await prisma.user.findUnique({
					where: { id: token.id },
					include: {
						activeCampaign: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				});

				if (existingUser) {
					// Get user's role in active campaign
					let activeCampaignWithRole = null;
					if (existingUser.activeCampaign) {
						const membership = await prisma.campaignMember.findFirst({
							where: {
								userId: existingUser.id,
								campaignId: existingUser.activeCampaign.id,
							},
							select: {
								role: true,
								characterName: true,
							},
						});

						activeCampaignWithRole = {
							...existingUser.activeCampaign,
							userRole: membership?.role || null,
							characterName: membership?.characterName || null,
						};
					}

					token.role = existingUser.role;
					token.username = existingUser.username;
					token.avatarUrl = existingUser.avatarUrl;
					token.activeCampaign = activeCampaignWithRole;
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (session?.user) {
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.username = token.username;
				session.user.avatarUrl = token.avatarUrl;
				session.user.activeCampaign = token.activeCampaign;

				// Add convenience properties for backward compatibility
				if (token.activeCampaign) {
					session.user.activeCampaignId = token.activeCampaign.id;
					session.user.activeCampaignName = token.activeCampaign.name;
					session.user.campaignRole = token.activeCampaign.userRole;
					session.user.characterName = token.activeCampaign.characterName;
				} else {
					session.user.activeCampaignId = null;
					session.user.activeCampaignName = null;
					session.user.campaignRole = null;
					session.user.characterName = null;
				}
			}
			return session;
		},

		async redirect({ url, baseUrl }) {
			if (url.startsWith('/')) return `${baseUrl}${url}`;
			if (url.startsWith(baseUrl)) return url;
			return baseUrl;
		},
	},
	pages: {
		error: '/auth/error',
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
