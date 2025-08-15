'use client';

import { DateDisplay } from '@/components/DateDisplay';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Shield, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllCampaigns } from '../components/actions';
import CreateCampaignForm from './CreateCampaignForm';

export default function AdminCampaigns() {
	const { data: session } = useSession();
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadCampaigns = async () => {
			try {
				const result = await getAllCampaigns();
				if (result.success) {
					setCampaigns(result.data || []);
				} else {
					setError(result.error);
				}
			} catch (err) {
				setError('Failed to load campaigns');
			} finally {
				setLoading(false);
			}
		};

		loadCampaigns();
	}, []);

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
							Loading campaigns...
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
							href="/admin/dashboard"
							className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
						>
							<ArrowLeft size={20} />
							Back to Dashboard
						</Link>
						<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Management</h1>
					</div>
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<p className={session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}>Error: {error}</p>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
		>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link
						href="/admin/dashboard"
						className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
					>
						<ArrowLeft size={20} />
						Back to Dashboard
					</Link>
					<div className="flex items-center justify-between">
						<div>
							<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Management</h1>
							<p className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}>
								Manage all campaigns across the platform ({campaigns.length} total)
							</p>
						</div>
						<CreateCampaignForm />
					</div>
				</div>

				<div className="grid gap-6">
					{campaigns.length === 0 ? (
						<Card className={`p-8 text-center border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
							<Shield className={`h-12 w-12 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
							<h3 className={`text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>No Campaigns Found</h3>
							<p className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}>No campaigns have been created yet.</p>
						</Card>
					) : (
						campaigns.map((campaign) => {
							const dmCount = campaign.members?.filter((member) => member.role === 'DM').length || 0;
							const playerCount = campaign.members?.filter((member) => member.role === 'PLAYER').length || 0;

							return (
								<Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`}>
									<Card
										className={`p-6 transition-all duration-200 cursor-pointer border-0 shadow-lg backdrop-blur-sm hover:shadow-xl ${
											session?.user?.darkMode ? 'bg-gray-800/80 hover:bg-gray-800/90' : 'bg-white/80 hover:bg-gray-50'
										}`}
									>
										<div className="flex items-start justify-between mb-4">
											<div>
												<h3 className={`text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</h3>
												<p className={`mb-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
													{campaign.description || 'No description provided'}
												</p>
												<div className={`flex items-center gap-4 text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
											<div className={`p-4 rounded-lg ${session?.user?.darkMode ? 'bg-blue-800/50' : 'bg-blue-50'}`}>
												<div className="flex items-center gap-2 mb-2">
													<Shield className={`h-5 w-5 ${session?.user?.darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-blue-200' : 'text-blue-900'}`}>DMs</span>
												</div>
												<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{dmCount}</p>
											</div>

											<div className={`p-4 rounded-lg ${session?.user?.darkMode ? 'bg-green-800/50' : 'bg-green-50'}`}>
												<div className="flex items-center gap-2 mb-2">
													<Users className={`h-5 w-5 ${session?.user?.darkMode ? 'text-green-300' : 'text-green-600'}`} />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-green-200' : 'text-green-900'}`}>Players</span>
												</div>
												<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>{playerCount}</p>
											</div>

											<div className={`p-4 rounded-lg ${session?.user?.darkMode ? 'bg-cyan-800/50' : 'bg-purple-50'}`}>
												<div className="flex items-center gap-2 mb-2">
													<Calendar className={`h-5 w-5 ${session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'}`} />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-cyan-200' : 'text-purple-900'}`}>Content</span>
												</div>
												<div className={`text-sm ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
													<div>{campaign._count.updates || 0} updates</div>
													<div>{campaign._count.quests || 0} quests</div>
												</div>
											</div>
										</div>

										{campaign.members && campaign.members.length > 0 && (
											<div className={`mt-4 pt-4 border-t ${session?.user?.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
												<h4 className={`font-medium mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Members</h4>
												<div className="flex flex-wrap gap-2">
													{campaign.members.slice(0, 5).map((member, index) => (
														<span
															key={index}
															className={`px-2 py-1 text-xs rounded-full ${
																member.role === 'DM'
																	? session?.user?.darkMode
																		? 'bg-blue-800 text-blue-300'
																		: 'bg-blue-100 text-blue-800'
																	: session?.user?.darkMode
																		? 'bg-green-800 text-green-300'
																		: 'bg-green-100 text-green-800'
															}`}
														>
															{member.user.email?.split('@')[0] || 'Unknown User'} ({member.role})
														</span>
													))}
													{campaign.members.length > 5 && (
														<span
															className={`px-2 py-1 text-xs rounded-full ${
																session?.user?.darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
															}`}
														>
															+{campaign.members.length - 5} more
														</span>
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
