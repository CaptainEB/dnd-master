import { DateDisplay } from '@/components/DateDisplay';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calendar, FileText, Scroll, Shield, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { getCampaignById } from '../../components/actions';

export default async function AdminCampaignDetail({ params }) {
	const { id } = await params;
	const result = await getCampaignById(id);

	if (!result.success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<Link href="/admin/campaigns" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
							<ArrowLeft size={20} />
							Back to Campaigns
						</Link>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Details</h1>
					</div>
					<Card className="p-6">
						<p className="text-red-600">Error: {result.error}</p>
					</Card>
				</div>
			</div>
		);
	}

	const campaign = result.data;
	const dmCount = campaign.members?.filter((member) => member.role === 'DM').length || 0;
	const playerCount = campaign.members?.filter((member) => member.role === 'PLAYER').length || 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link href="/admin/campaigns" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
						<ArrowLeft size={20} />
						Back to Campaigns
					</Link>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
							<p className="text-gray-600 mb-4">{campaign.description || 'No description provided'}</p>
							<div className="flex items-center gap-4 text-sm text-gray-500">
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
					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Shield className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">DMs</h3>
								<p className="text-2xl font-bold text-blue-600">{dmCount}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Players</h3>
								<p className="text-2xl font-bold text-green-600">{playerCount}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<Scroll className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Updates</h3>
								<p className="text-2xl font-bold text-purple-600">{campaign._count.updates}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-orange-100 rounded-lg">
								<Target className="h-6 w-6 text-orange-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Quests</h3>
								<p className="text-2xl font-bold text-orange-600">{campaign._count.quests}</p>
							</div>
						</div>
					</Card>
				</div>

				<div className="grid lg:grid-cols-2 gap-6">
					{/* Members */}
					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Users className="h-5 w-5" />
							Campaign Members ({campaign.members?.length || 0})
						</h3>
						<div className="space-y-3">
							{campaign.members && campaign.members.length > 0 ? (
								campaign.members.map((member) => (
									<div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div className="flex items-center gap-3">
											{member.user.avatarUrl ? (
												<img src={member.user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full" />
											) : (
												<div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
													<Users size={16} className="text-purple-600" />
												</div>
											)}
											<div>
												<p className="font-medium text-gray-900">{member.user.email}</p>
												<p className="text-sm text-gray-500">
													Global: {member.user.role} • Campaign: {member.role}
												</p>
											</div>
										</div>
										<div className="text-sm text-gray-500">
											Joined: <DateDisplay date={member.joinedAt} />
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-gray-500">
									<Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
									<p>No members yet</p>
								</div>
							)}
						</div>
					</Card>

					{/* Recent Updates */}
					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Recent Updates
						</h3>
						<div className="space-y-3">
							{campaign.updates && campaign.updates.length > 0 ? (
								campaign.updates.map((update) => (
									<div key={update.id} className="p-3 bg-gray-50 rounded-lg">
										<h4 className="font-medium text-gray-900 mb-1">{update.title}</h4>
										<p className="text-sm text-gray-600 mb-2 line-clamp-2">{update.content}</p>
										<div className="flex items-center gap-2 text-xs text-gray-500">
											<span>By: {update.author.email.split('@')[0]}</span>
											<span>•</span>
											<span>
												<DateDisplay date={update.createdAt} />
											</span>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-gray-500">
									<FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
									<p>No updates yet</p>
								</div>
							)}
						</div>
					</Card>

					{/* Quests */}
					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Target className="h-5 w-5" />
							Quests ({campaign.quests?.length || 0})
						</h3>
						<div className="space-y-3">
							{campaign.quests && campaign.quests.length > 0 ? (
								campaign.quests.map((quest) => (
									<div key={quest.id} className="p-3 bg-gray-50 rounded-lg">
										<div className="flex items-start justify-between mb-2">
											<h4 className="font-medium text-gray-900">{quest.title}</h4>
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													quest.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
												}`}
											>
												{quest.status}
											</span>
										</div>
										<p className="text-sm text-gray-600 mb-2">{quest.description}</p>
										<div className="flex items-center gap-4 text-xs text-gray-500">
											{quest.difficulty && <span>Difficulty: {quest.difficulty}</span>}
											{quest.reward && <span>Reward: {quest.reward}</span>}
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-gray-500">
									<Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
									<p>No quests yet</p>
								</div>
							)}
						</div>
					</Card>

					{/* Additional Content Stats */}
					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Content Overview
						</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
								<div className="flex items-center gap-2">
									<FileText className="h-4 w-4 text-blue-600" />
									<span className="font-medium">Updates</span>
								</div>
								<span className="text-blue-600 font-bold">{campaign._count.updates}</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Target className="h-4 w-4 text-green-600" />
									<span className="font-medium">Quests</span>
								</div>
								<span className="text-green-600 font-bold">{campaign._count.quests}</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Scroll className="h-4 w-4 text-purple-600" />
									<span className="font-medium">Rules</span>
								</div>
								<span className="text-purple-600 font-bold">{campaign._count.rules}</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
								<div className="flex items-center gap-2">
									<BookOpen className="h-4 w-4 text-orange-600" />
									<span className="font-medium">Notes</span>
								</div>
								<span className="text-orange-600 font-bold">{campaign._count.notes}</span>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
