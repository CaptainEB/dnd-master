import { DateDisplay } from '@/components/DateDisplay';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { getAllCampaigns } from '../components/actions';
import CreateCampaignForm from './CreateCampaignForm';

export default async function AdminCampaigns() {
	const result = await getAllCampaigns();

	if (!result.success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<Link href="/admin/dashboard" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
							<ArrowLeft size={20} />
							Back to Dashboard
						</Link>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
					</div>
					<Card className="p-6">
						<p className="text-red-600">Error: {result.error}</p>
					</Card>
				</div>
			</div>
		);
	}

	const campaigns = result.data || [];

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link href="/admin/dashboard" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
						<ArrowLeft size={20} />
						Back to Dashboard
					</Link>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
							<p className="text-gray-600">Manage all campaigns across the platform ({campaigns.length} total)</p>
						</div>
						<CreateCampaignForm />
					</div>
				</div>

				<div className="grid gap-6">
					{campaigns.length === 0 ? (
						<Card className="p-8 text-center">
							<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Found</h3>
							<p className="text-gray-600">No campaigns have been created yet.</p>
						</Card>
					) : (
						campaigns.map((campaign) => {
							const dmCount = campaign.members?.filter((member) => member.role === 'DM').length || 0;
							const playerCount = campaign.members?.filter((member) => member.role === 'PLAYER').length || 0;

							return (
								<Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`}>
									<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.name}</h3>
												<p className="text-gray-600 mb-3">{campaign.description || 'No description provided'}</p>
												<div className="flex items-center gap-4 text-sm text-gray-500">
													<div className="flex items-center gap-1">
														<Calendar size={16} />
														Created: <DateDisplay date={campaign.createdAt} />
													</div>
													<div className="flex items-center gap-1">
														<Users size={16} />
														{campaign._count.members} members
													</div>
												</div>
											</div>
										</div>

										<div className="grid md:grid-cols-3 gap-4 mt-4">
											<div className="bg-blue-50 p-4 rounded-lg">
												<div className="flex items-center gap-2 mb-2">
													<Shield className="h-5 w-5 text-blue-600" />
													<span className="font-medium text-blue-900">DMs</span>
												</div>
												<p className="text-2xl font-bold text-blue-600">{dmCount}</p>
											</div>

											<div className="bg-green-50 p-4 rounded-lg">
												<div className="flex items-center gap-2 mb-2">
													<Users className="h-5 w-5 text-green-600" />
													<span className="font-medium text-green-900">Players</span>
												</div>
												<p className="text-2xl font-bold text-green-600">{playerCount}</p>
											</div>

											<div className="bg-purple-50 p-4 rounded-lg">
												<div className="flex items-center gap-2 mb-2">
													<Calendar className="h-5 w-5 text-purple-600" />
													<span className="font-medium text-purple-900">Content</span>
												</div>
												<div className="text-sm text-purple-600">
													<div>{campaign._count.updates || 0} updates</div>
													<div>{campaign._count.quests || 0} quests</div>
												</div>
											</div>
										</div>

										{campaign.members && campaign.members.length > 0 && (
											<div className="mt-4 pt-4 border-t border-gray-200">
												<h4 className="font-medium text-gray-900 mb-2">Recent Members</h4>
												<div className="flex flex-wrap gap-2">
													{campaign.members.slice(0, 5).map((member, index) => (
														<span
															key={index}
															className={`px-2 py-1 text-xs rounded-full ${
																member.role === 'DM' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
															}`}
														>
															{member.user.email?.split('@')[0] || 'Unknown User'} ({member.role})
														</span>
													))}
													{campaign.members.length > 5 && (
														<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">+{campaign.members.length - 5} more</span>
													)}
												</div>
											</div>
										)}
									</Card>
								</Link>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
