'use client';

import { DateDisplay } from '@/components/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, FileText, Settings, Shield, StickyNote, Trash2, User, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserById } from '../../components/actions';
import CampaignMembershipManager from './CampaignMembershipManager';

export default function AdminUserDetail({ params }) {
	const { data: session } = useSession();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [avatarError, setAvatarError] = useState(false);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const resolvedParams = await params;
				const { id } = resolvedParams;
				const result = await getUserById(id);

				if (result.success) {
					setUser(result.data);
				} else {
					setError(result.error);
				}
			} catch (err) {
				setError('Failed to load user');
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, [params]);

	if (loading) {
		return (
			<div
				className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
			>
				<div className="container mx-auto px-4 py-8">
					<div className="text-center py-12">
						<div className={`flex flex-col items-center gap-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							<div
								className={`animate-spin rounded-full h-8 w-8 border-b-2 ${session?.user?.darkMode ? 'border-cyan-400' : 'border-purple-600'}`}
							></div>
							Loading user details...
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
			>
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<Link
							href="/admin/users"
							className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
						>
							<ArrowLeft size={20} />
							Back to Users
						</Link>
						<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>User Details</h1>
					</div>
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<p className={session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}>Error: {error}</p>
					</Card>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div
			className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
		>
			<div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<Link
						href="/admin/users"
						className={`flex items-center gap-2 mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
					>
						<ArrowLeft size={16} className="sm:w-5 sm:h-5" />
						Back to Users
					</Link>
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1">
							<h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
								{user.email}
							</h1>
							<div
								className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-4 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
							>
								<span
									className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${
										user.role === 'ADMIN'
											? session?.user?.darkMode
												? 'bg-red-800 text-red-300'
												: 'bg-red-100 text-red-800'
											: user.role === 'DM'
												? session?.user?.darkMode
													? 'bg-blue-800 text-blue-300'
													: 'bg-blue-100 text-blue-800'
												: session?.user?.darkMode
													? 'bg-green-800 text-green-300'
													: 'bg-green-100 text-green-800'
									}`}
								>
									{user.role}
								</span>
								<div className="flex items-center gap-1">
									<Calendar size={12} className="sm:w-4 sm:h-4" />
									Joined: <DateDisplay date={user.createdAt} />
								</div>
								<div className="flex items-center gap-1">
									<Calendar size={12} className="sm:w-4 sm:h-4" />
									Updated: <DateDisplay date={user.updatedAt} />
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2 flex-shrink-0">
							{user.avatarUrl && !avatarError ? (
								<img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" onError={() => setAvatarError(true)} />
							) : (
								<div
									className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center ${session?.user?.darkMode ? 'bg-cyan-800' : 'bg-purple-100'}`}
								>
									<User size={20} className={`sm:w-6 sm:h-6 ${session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'}`} />
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
								<Shield className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaigns</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
									{user._count.campaignMembers}
								</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
								<FileText className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Updates</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
									{user._count.updates}
								</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-orange-800' : 'bg-orange-100'}`}>
								<StickyNote className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-orange-300' : 'text-orange-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Notes</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
									{user._count.notes}
								</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
								<Users className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-green-300' : 'text-green-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>DM Roles</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>
									{user.campaignMembers?.filter((m) => m.role === 'DM').length || 0}
								</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Campaign Memberships */}
				<Card className={`p-6 mb-8 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<div className="flex items-center justify-between mb-6">
						<h3 className={`text-lg font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Memberships</h3>
						<CampaignMembershipManager userId={user.id} />
					</div>
					<div className="space-y-4">
						{user.campaignMembers && user.campaignMembers.length > 0 ? (
							user.campaignMembers.map((membership) => (
								<div
									key={membership.id}
									className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
								>
									<div className="flex items-center gap-3 sm:gap-4 flex-1">
										<div className={`p-2 rounded-lg flex-shrink-0 ${session?.user?.darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
											<Shield size={16} className={session?.user?.darkMode ? 'text-blue-300' : 'text-blue-600'} />
										</div>
										<div className="flex-1 min-w-0">
											<h4 className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
												{membership.campaign.name}
											</h4>
											<p className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
												{membership.campaign.description || 'No description'}
											</p>
											<div
												className={`flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
											>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														membership.role === 'DM'
															? session?.user?.darkMode
																? 'bg-blue-800 text-blue-300'
																: 'bg-blue-100 text-blue-800'
															: session?.user?.darkMode
																? 'bg-green-800 text-green-300'
																: 'bg-green-100 text-green-800'
													}`}
												>
													{membership.role}
												</span>
												<span className="flex items-center gap-1">
													<Calendar size={14} className="sm:w-4 sm:h-4" />
													<span className="hidden sm:inline">Joined:</span> <DateDisplay date={membership.joinedAt} />
												</span>
												<span className="flex items-center gap-1">
													<Users size={14} className="sm:w-4 sm:h-4" />
													{membership.campaign._count.members} <span className="hidden sm:inline">members</span>
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2 flex-shrink-0">
										<CampaignMembershipManager
											userId={user.id}
											membershipId={membership.id}
											currentRole={membership.role}
											campaignName={membership.campaign.name}
											mode="edit"
										/>
									</div>
								</div>
							))
						) : (
							<div className={`text-center py-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								<Shield className={`h-16 w-16 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
								<h4 className={`text-lg font-medium mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>No campaign memberships</h4>
								<p>This user is not a member of any campaigns yet</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
