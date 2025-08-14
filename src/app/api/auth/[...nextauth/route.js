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
					});

					if (existingUser) {
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
						token.avatarUrl = user.image || existingUser.avatarUrl;
					}
				}
			}

			// Handle session updates without requiring re-authentication
			if (trigger === 'update' && token.id) {
				const existingUser = await prisma.user.findUnique({
					where: { id: token.id },
				});

				if (existingUser) {
					token.role = existingUser.role;
					token.avatarUrl = existingUser.avatarUrl;
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (session?.user) {
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.avatarUrl = token.avatarUrl;
			}
			return session;
		},

		async redirect({ url, baseUrl }) {
			if (url.startsWith('/')) return `${baseUrl}${url}`;
			if (url.startsWith(baseUrl)) return url;
			return baseUrl;
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
