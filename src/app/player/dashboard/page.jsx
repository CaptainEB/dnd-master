'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, ArrowUp, Shield, Calendar, UserCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getUserCampaigns, getCampaignMembers } from '../../admin/components/actions';
import { DateDisplay } from '@/components/DateDisplay';

export default function PlayerDashboard() {
	const { data: session } = useSession();
	const [campaigns, setCampaigns] = useState([]);
	const [campaignMembers, setCampaignMembers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [membersLoading, setMembersLoading] = useState(false);

	useEffect(() => {
		loadCampaigns();
	}, []);

	useEffect(() => {
		if (session?.user?.activeCampaign?.id) {
			loadCampaignMembers(session.user.activeCampaign.id);
		} else {
			setCampaignMembers([]);
		}
	}, [session?.user?.activeCampaign?.id]);

	const loadCampaigns = async () => {
		try {
			setIsLoading(true);
			const result = await getUserCampaigns();
			if (result.success) {
				setCampaigns(result.data);
			}
		} catch (err) {
			console.error('Failed to load campaigns');
		} finally {
			setIsLoading(false);
		}
	};

	const loadCampaignMembers = async (campaignId) => {
		try {
			setMembersLoading(true);
			const result = await getCampaignMembers(campaignId);
			if (result.success) {
				setCampaignMembers(result.data);
			} else {
				console.error('Failed to load campaign members:', result.error);
			}
		} catch (err) {
			console.error('Failed to load campaign members');
		} finally {
			setMembersLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center py-12">
						<Users className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
						<p className="text-gray-500">Loading your campaigns...</p>
					</div>
				</div>
			</div>
		);
	}

	const activeCampaign = session?.user?.activeCampaign;

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Player Dashboard</h1>
					<p className="text-gray-600">Welcome back, {session?.user?.email?.split('@')[0]}!</p>
				</div>

				{campaigns.length === 0 ? (
					// Empty State - No Campaigns
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Users className="h-12 w-12 text-blue-600" />
						</div>
						<h3 className="text-2xl font-semibold text-gray-900 mb-3">No Campaigns Yet</h3>
						<p className="text-gray-600 mb-6 max-w-md mx-auto">
							You haven't been invited to any campaigns yet. Ask a Dungeon Master to invite you to join their campaign!
						</p>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
							<p className="text-sm text-blue-800">
								<strong>Tip:</strong> Once a DM invites you to a campaign, you'll be able to access campaign content through the navigation bar.
							</p>
						</div>
					</div>
				) : !activeCampaign ? (
					// Has Campaigns but None Selected - Direct to Navbar
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Crown className="h-12 w-12 text-purple-600" />
						</div>
						<h3 className="text-2xl font-semibold text-gray-900 mb-3">Select a Campaign</h3>
						<p className="text-gray-600 mb-6 max-w-md mx-auto">
							You're a member of {campaigns.length} campaign{campaigns.length > 1 ? 's' : ''}. 
							Use the campaign selector in the navigation bar above to access campaign content.
						</p>
						<div className="flex items-center justify-center gap-2 text-purple-600 mb-6">
							<ArrowUp className="h-5 w-5 animate-bounce" />
							<span className="font-medium">Look for the campaign selector in the top navigation</span>
						</div>
						<Card className="p-6 max-w-md mx-auto bg-gradient-to-r from-purple-50 to-blue-50">
							<h4 className="font-semibold text-gray-900 mb-3">Your Campaigns:</h4>
							<div className="space-y-2">
								{campaigns.map((campaign) => (
									<div
										key={campaign.id}
										className="flex items-center justify-between p-3 bg-white rounded-lg"
									>
										<span className="font-medium text-gray-900">{campaign.name}</span>
										<span className="text-sm text-gray-600">{campaign.userRole}</span>
									</div>
								))}
							</div>
						</Card>
					</div>
				) : (
					// Campaign Selected - Show Members
					<div className="space-y-6">
						<Card className="p-6">
							<div className="flex items-center gap-4 mb-6">
								<Shield className="h-6 w-6 text-blue-600" />
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{activeCampaign.name} - Party Members
									</h3>
									<p className="text-gray-600">Your fellow adventurers</p>
								</div>
							</div>

							{membersLoading ? (
								<div className="text-center py-8">
									<Users className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
									<p className="text-gray-500">Loading party members...</p>
								</div>
							) : campaignMembers.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p>No party members found</p>
								</div>
							) : (
								<div className="space-y-4">
									{campaignMembers.map((member) => (
										<div
											key={member.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
										>
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
													{member.role === 'DM' ? (
														<Crown className="h-6 w-6 text-purple-600" />
													) : (
														<Users className="h-6 w-6 text-blue-600" />
													)}
												</div>
												<div>
													<h4 className="font-semibold text-gray-900">
														{member.characterName || member.user.email}
														{member.user.username && ` (${member.user.username})`}
													</h4>
													<div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
														<Badge 
															variant="secondary" 
															className={
																member.role === 'DM' 
																	? 'bg-purple-100 text-purple-800' 
																	: 'bg-green-100 text-green-800'
															}
														>
															{member.role}
														</Badge>
														<div className="flex items-center gap-1">
															<Calendar size={12} />
															Joined: <DateDisplay date={member.joinedAt} />
														</div>
													</div>
												</div>
											</div>
											{member.user.id === session?.user?.id && (
												<div className="text-sm text-blue-600 font-medium">
													You
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</Card>

						{/* Campaign Info */}
						<Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
							<div className="flex items-center gap-4">
								<Crown className="h-6 w-6 text-purple-600" />
								<div>
									<h4 className="font-semibold text-gray-900">Current Campaign</h4>
									<p className="text-gray-700">{activeCampaign.name}</p>
									<p className="text-sm text-gray-600 mt-1">
										Your role: <span className="font-medium">{activeCampaign.userRole}</span>
									</p>
								</div>
							</div>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
