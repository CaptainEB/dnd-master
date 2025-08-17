import { DateDisplay } from '@/components/DateDisplay';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calendar, FileText, Scroll, Settings, Shield, Target, Users } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { getCampaignById } from '../../components/actions';

export default async function AdminCampaignDetail({ params }) {
	const { id } = await params;
	const session = await getServerSession(authOptions);
	const result = await getCampaignById(id);

	if (!result.success) {
		return (
			<div
				className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
			>
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<Link
							href="/admin/campaigns"
							className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
						>
							<ArrowLeft size={20} />
							Back to Campaigns
						</Link>
						<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Details</h1>
					</div>
					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<p className="text-red-600">Error: {result.error}</p>
					</Card>
				</div>
			</div>
		);
	}

	const campaign = result.data;
	const dmCount = campaign.members?.filter((member) => member.role === 'DM').length || 0;
	const playerCount = campaign.members?.filter((member) => member.role === 'PLAYER').length || 0;

	// Check if current user is a DM of this campaign or is an admin
	const currentUserMembership = campaign.members?.find((member) => member.user.email === session?.user?.email);
	const isCurrentUserDM = currentUserMembership?.role === 'DM';
	const isAdmin = session?.user?.role === 'ADMIN';
	const canManageMembers = isAdmin || isCurrentUserDM;

	return (
		<div
			className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
		>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link
						href="/admin/campaigns"
						className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
					>
						<ArrowLeft size={20} />
						Back to Campaigns
					</Link>
					<div className="flex items-start justify-between">
						<div>
							<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</h1>
							<p className={`mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								{campaign.description || 'No description provided'}
							</p>
							<div className={`flex items-center gap-4 text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								<div className="flex items-center gap-1">
									<Calendar size={16} />
									Created: <DateDisplay date={campaign.createdAt} />
								</div>
								<div className="flex items-center gap-1">
									<Calendar size={16} />
									Updated: <DateDisplay date={campaign.updatedAt} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
								<Shield className={`h-6 w-6 ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>DMs</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{dmCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
								<Users className={`h-6 w-6 ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Players</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>{playerCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
								<Scroll className={`h-6 w-6 ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Updates</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{campaign._count.updates}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
								<Target className={`h-6 w-6 ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Quests</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{campaign._count.quests}</p>
							</div>
						</div>
					</Card>
				</div>

				<div className="grid lg:grid-cols-2 gap-6">
					{/* Members */}
					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							<Users className="h-5 w-5" />
							Campaign Members ({campaign.members?.length || 0})
						</h3>
						<div className="space-y-3">
							{campaign.members && campaign.members.length > 0 ? (
								campaign.members.map((member) => (
									<div
										key={member.id}
										className={`flex items-center justify-between p-3 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
									>
										<div className="flex items-center gap-3">
											{member.user.avatarUrl ? (
												<img src={member.user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full" />
											) : (
												<div
													className={`h-8 w-8 rounded-full flex items-center justify-center ${session?.user?.darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}
												>
													<Users size={16} className={`${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
												</div>
											)}
											<div>
												<p className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{member.user.email}</p>
												<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
													Global: {member.user.role} • Campaign: {member.role}
												</p>
											</div>
										</div>
										<div className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
											Joined: <DateDisplay date={member.joinedAt} />
										</div>
									</div>
								))
							) : (
								<div className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									<Users className={`h-12 w-12 mx-auto mb-2 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
									<p>No members yet</p>
								</div>
							)}
						</div>
					</Card>

					{/* Manage Players Section - Only show for DMs and Admins */}
					{canManageMembers && (
						<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
							<h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
								<Settings className="h-5 w-5" />
								Manage Players
							</h3>
							<div className={`p-4 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
								<p className={`text-sm mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									{isAdmin ? 'As an admin, you can manage all campaign members.' : 'As a DM, you can manage players in this campaign.'}
								</p>
								<div className="flex gap-2">
									<button
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
											session?.user?.darkMode
												? 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-800/50'
												: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
										}`}
									>
										Add Player
									</button>
									<button
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
											session?.user?.darkMode
												? 'bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-800/50'
												: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
										}`}
									>
										Manage Roles
									</button>
								</div>
							</div>
						</Card>
					)}

					{/* Recent Updates */}
					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							<FileText className="h-5 w-5" />
							Recent Updates
						</h3>
						<div className="space-y-3">
							{campaign.updates && campaign.updates.length > 0 ? (
								campaign.updates.map((update) => (
									<div key={update.id} className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
										<h4 className={`font-medium mb-1 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{update.title}</h4>
										<p className={`text-sm mb-2 line-clamp-2 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{update.content}</p>
										<div className={`flex items-center gap-2 text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
											<span>By: {update.author.email?.split('@')[0] || 'Unknown User'}</span>
											<span>•</span>
											<span>
												<DateDisplay date={update.createdAt} />
											</span>
										</div>
									</div>
								))
							) : (
								<div className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									<FileText className={`h-12 w-12 mx-auto mb-2 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
									<p>No updates yet</p>
								</div>
							)}
						</div>
					</Card>

					{/* Quests */}
					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							<Target className="h-5 w-5" />
							Quests ({campaign.quests?.length || 0})
						</h3>
						<div className="space-y-3">
							{campaign.quests && campaign.quests.length > 0 ? (
								campaign.quests.map((quest) => (
									<div key={quest.id} className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
										<div className="flex items-start justify-between mb-2">
											<h4 className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{quest.title}</h4>
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													quest.status === 'ACTIVE'
														? session?.user?.darkMode
															? 'bg-green-900/30 text-green-400'
															: 'bg-green-100 text-green-800'
														: session?.user?.darkMode
															? 'bg-gray-600 text-gray-300'
															: 'bg-gray-100 text-gray-800'
												}`}
											>
												{quest.status}
											</span>
										</div>
										<p className={`text-sm mb-2 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{quest.description}</p>
										<div className={`flex items-center gap-4 text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
											{quest.difficulty && <span>Difficulty: {quest.difficulty}</span>}
											{quest.reward && <span>Reward: {quest.reward}</span>}
										</div>
									</div>
								))
							) : (
								<div className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									<Target className={`h-12 w-12 mx-auto mb-2 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
									<p>No quests yet</p>
								</div>
							)}
						</div>
					</Card>

					{/* Additional Content Stats */}
					<Card className={`p-6 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
						<h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							<BookOpen className="h-5 w-5" />
							Content Overview
						</h3>
						<div className="space-y-4">
							<div className={`flex items-center justify-between p-3 rounded-lg ${session?.user?.darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
								<div className="flex items-center gap-2">
									<FileText className={`h-4 w-4 ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
									<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Updates</span>
								</div>
								<span className={`font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{campaign._count.updates}</span>
							</div>
							<div className={`flex items-center justify-between p-3 rounded-lg ${session?.user?.darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
								<div className="flex items-center gap-2">
									<Target className={`h-4 w-4 ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`} />
									<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Quests</span>
								</div>
								<span className={`font-bold ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>{campaign._count.quests}</span>
							</div>
							<div className={`flex items-center justify-between p-3 rounded-lg ${session?.user?.darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
								<div className="flex items-center gap-2">
									<Scroll className={`h-4 w-4 ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
									<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Rules</span>
								</div>
								<span className={`font-bold ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{campaign._count.rules}</span>
							</div>
							<div className={`flex items-center justify-between p-3 rounded-lg ${session?.user?.darkMode ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
								<div className="flex items-center gap-2">
									<BookOpen className={`h-4 w-4 ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
									<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Notes</span>
								</div>
								<span className={`font-bold ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{campaign._count.notes}</span>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
