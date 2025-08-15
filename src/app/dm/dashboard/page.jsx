'use client';

import { Card } from '@/components/ui/card';
import { DateDisplay } from '@/components/DateDisplay';
import { Users, Calendar, Scroll, UserPlus, Crown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUserCampaigns } from '../../admin/components/actions';
import CreateCampaignForm from './CreateCampaignForm';
import ManagePlayersSection from './ManagePlayersSection';

export default function DMDashboard() {
	const { data: session } = useSession();
	const [campaigns, setCampaigns] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeSection, setActiveSection] = useState('campaigns');

	useEffect(() => {
		const fetchCampaigns = async () => {
			try {
				const result = await getUserCampaigns();
				if (result.success) {
					// Filter for campaigns where user is DM
					const dmCampaigns = result.data.filter(campaign => campaign.userRole === 'DM');
					setCampaigns(dmCampaigns);
				} else {
					setError(result.error);
				}
			} catch (err) {
				setError('Failed to load campaigns');
			} finally {
				setIsLoading(false);
			}
		};

		if (session?.user) {
			fetchCampaigns();
		}
	}, [session]);

	const scrollToSection = (sectionId) => {
		setActiveSection(sectionId);
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Dungeon Master Dashboard</h1>
					<p className="text-gray-600">
						Welcome back, DM {session?.user?.characterName || session?.user?.email?.split('@')[0]}! Ready to guide your players on epic adventures?
					</p>
				</div>

				<div className="flex gap-8">
					{/* Side Navigation */}
					<div className="w-64 flex-shrink-0">
						<Card className="p-4 sticky top-24">
							<h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
							<nav className="space-y-2">
								<button
									onClick={() => scrollToSection('campaigns')}
									className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
										activeSection === 'campaigns'
											? 'bg-purple-100 text-purple-800 font-medium'
											: 'text-gray-600 hover:bg-gray-100'
									}`}
								>
									<div className="flex items-center gap-2">
										<Scroll size={16} />
										My Campaigns
									</div>
								</button>
								<button
									onClick={() => scrollToSection('manage-players')}
									className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
										activeSection === 'manage-players'
											? 'bg-purple-100 text-purple-800 font-medium'
											: 'text-gray-600 hover:bg-gray-100'
									}`}
								>
									<div className="flex items-center gap-2">
										<UserPlus size={16} />
										Manage Players
									</div>
								</button>
							</nav>
						</Card>
					</div>

					{/* Main Content */}
					<div className="flex-1 space-y-8">
						{/* My Campaigns Section */}
						<section id="campaigns">
							<Card className="p-8">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">My Campaigns</h3>
										<p className="text-gray-600">Manage and oversee your D&D campaigns</p>
									</div>
									<CreateCampaignForm />
								</div>
								
								{isLoading ? (
									<div className="text-center py-12 text-gray-500">
										<Scroll className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
										<p>Loading campaigns...</p>
									</div>
								) : error ? (
									<div className="text-center py-12 text-red-500">
										<p>Error: {error}</p>
									</div>
								) : campaigns.length === 0 ? (
									<div className="text-center py-12 text-gray-500">
										<Scroll className="h-16 w-16 text-gray-400 mx-auto mb-4" />
										<h4 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h4>
										<p className="text-gray-600 mb-6">Create your first campaign to start your D&D adventure!</p>
									</div>
								) : (
									<div className="grid gap-6">
										{campaigns.map((campaign) => (
											<div key={campaign.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 overflow-hidden">
												<div className="p-6">
													<div className="flex items-start justify-between mb-4">
														<div>
															<h4 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h4>
															<p className="text-gray-600 mb-4">{campaign.description || 'No description provided'}</p>
														</div>
														<div className="flex gap-2">
															<span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">DM</span>
															<span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Active</span>
														</div>
													</div>
													
													<div className="grid md:grid-cols-3 gap-4 p-4 bg-white/50 rounded-lg">
														<div className="flex items-center gap-3">
															<div className="p-2 bg-blue-100 rounded-lg">
																<Users className="h-5 w-5 text-blue-600" />
															</div>
															<div>
																<p className="text-sm font-medium text-gray-900">{campaign.memberCount || 0} Members</p>
																<p className="text-xs text-gray-500">Total players</p>
															</div>
														</div>
														<div className="flex items-center gap-3">
															<div className="p-2 bg-green-100 rounded-lg">
																<Calendar className="h-5 w-5 text-green-600" />
															</div>
															<div>
																<p className="text-sm font-medium text-gray-900">
																	<DateDisplay date={campaign.createdAt} />
																</p>
																<p className="text-xs text-gray-500">Created</p>
															</div>
														</div>
														<div className="flex items-center gap-3">
															<div className="p-2 bg-orange-100 rounded-lg">
																<Scroll className="h-5 w-5 text-orange-600" />
															</div>
															<div>
																<p className="text-sm font-medium text-gray-900">
																	<DateDisplay date={campaign.updatedAt} />
																</p>
																<p className="text-xs text-gray-500">Last updated</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</Card>
						</section>

						{/* Manage Players Section */}
						<section id="manage-players">
							<Card className="p-8">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Players</h3>
										<p className="text-gray-600">Promote players to Dungeon Master role</p>
									</div>
								</div>
								
								<ManagePlayersSection />
							</Card>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
