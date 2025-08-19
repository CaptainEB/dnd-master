'use client';

import { DateDisplay } from '@/components/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BookOpen, Calendar, FileText, Loader2, Scroll, Shield, Target, Trash2, User, UserPlus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { addCampaignMember, getAllUsers, getCampaignById, removeCampaignMember, updateCampaignMemberRole } from '../../components/actions';

const addMemberSchema = z.object({
	userId: z.string().min(1, 'Please select a user'),
	role: z.enum(['PLAYER', 'DM'], {
		required_error: 'Please select a role',
	}),
});

export default function AdminCampaignDetail({ params }) {
	const { data: session } = useSession();
	const router = useRouter();
	const [campaign, setCampaign] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [users, setUsers] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		resolver: zodResolver(addMemberSchema),
		defaultValues: {
			userId: '',
			role: 'PLAYER',
		},
	});

	useEffect(() => {
		const loadCampaign = async () => {
			try {
				const resolvedParams = await params;
				const { id } = resolvedParams;
				const result = await getCampaignById(id);

				if (result.success) {
					setCampaign(result.data);
				} else {
					setError(result.error);
				}
			} catch (err) {
				setError('Failed to load campaign');
			} finally {
				setLoading(false);
			}
		};

		loadCampaign();
	}, [params]);

	const loadUsers = async () => {
		if (users.length > 0) return; // Already loaded

		setLoadingUsers(true);
		try {
			const result = await getAllUsers();
			if (result.success) {
				setUsers(result.data);
			}
		} catch (error) {
			console.error('Error loading users:', error);
		} finally {
			setLoadingUsers(false);
		}
	};

	const handleAddMember = async (values) => {
		if (!campaign) return;

		setIsLoading(true);
		try {
			const result = await addCampaignMember({
				userId: values.userId,
				campaignId: campaign.id,
				role: values.role,
			});

			if (result.success) {
				form.reset();
				setOpen(false);
				// Refresh campaign data
				const refreshResult = await getCampaignById(campaign.id);
				if (refreshResult.success) {
					setCampaign(refreshResult.data);
				}
			} else {
				form.setError('root', {
					type: 'manual',
					message: result.error || 'Failed to add member',
				});
			}
		} catch (error) {
			form.setError('root', {
				type: 'manual',
				message: 'An unexpected error occurred',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveMember = async (membershipId) => {
		if (!campaign) return;

		setIsLoading(true);
		try {
			const result = await removeCampaignMember(membershipId);
			if (result.success) {
				// Refresh campaign data
				const refreshResult = await getCampaignById(campaign.id);
				if (refreshResult.success) {
					setCampaign(refreshResult.data);
				}
			} else {
				alert('Failed to remove member: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangeRole = async (membershipId, newRole, currentRole) => {
		if (!campaign || newRole === currentRole) return;

		setIsLoading(true);
		try {
			const result = await updateCampaignMemberRole(membershipId, newRole);
			if (result.success) {
				// Refresh campaign data
				const refreshResult = await getCampaignById(campaign.id);
				if (refreshResult.success) {
					setCampaign(refreshResult.data);
				}
			} else {
				alert('Failed to update role: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

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
							Loading campaign...
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
							href="/admin/campaigns"
							className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
						>
							<ArrowLeft size={20} />
							Back to Campaigns
						</Link>
						<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Details</h1>
					</div>
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<p className={session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}>Error: {error}</p>
					</Card>
				</div>
			</div>
		);
	}

	if (!campaign) return null;

	const dmCount = campaign.members?.filter((member) => member.role === 'DM').length || 0;
	const playerCount = campaign.members?.filter((member) => member.role === 'PLAYER').length || 0;

	// Check if current user is a DM of this campaign or is an admin
	const currentUserMembership = campaign.members?.find((member) => member.user.email === session?.user?.email);
	const isCurrentUserDM = currentUserMembership?.role === 'DM';
	const isAdmin = session?.user?.role === 'ADMIN';
	const canManageMembers = isAdmin || isCurrentUserDM;

	return (
		<div
			className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
		>
			<div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<Link
						href="/admin/campaigns"
						className={`flex items-center gap-2 mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
					>
						<ArrowLeft size={16} className="sm:w-5 sm:h-5" />
						Back to Campaigns
					</Link>
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1">
							<h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</h1>
							<p className={`mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								{campaign.description || 'No description provided'}
							</p>
							<div
								className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
							>
								<div className="flex items-center gap-1">
									<Calendar size={14} className="sm:w-4 sm:h-4" />
									Created: <DateDisplay date={campaign.createdAt} />
								</div>
								<div className="flex items-center gap-1">
									<Calendar size={14} className="sm:w-4 sm:h-4" />
									Updated: <DateDisplay date={campaign.updatedAt} />
								</div>
							</div>
						</div>
						{canManageMembers && (
							<div className="flex-shrink-0">
								<Dialog open={open} onOpenChange={setOpen}>
									<DialogTrigger asChild>
										<Button
											className={`text-sm ${
												session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
											}`}
											onClick={loadUsers}
										>
											<UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
											<span className="hidden sm:inline">Add Player</span>
											<span className="sm:hidden">Add</span>
										</Button>
									</DialogTrigger>
									<DialogContent className={`mx-3 sm:mx-0 sm:max-w-[425px] ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
										<DialogHeader>
											<DialogTitle className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
												Add User to Campaign
											</DialogTitle>
										</DialogHeader>
										<Form {...form}>
											<form onSubmit={form.handleSubmit(handleAddMember)} className="space-y-4">
												<FormField
													control={form.control}
													name="userId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>User</FormLabel>
															<Select onValueChange={field.onChange} defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue
																			placeholder={loadingUsers ? 'Loading users...' : users.length === 0 ? 'No users available' : 'Select a user'}
																		/>
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{!loadingUsers &&
																		users.length > 0 &&
																		users
																			.filter((user) => !campaign.members?.some((member) => member.user.email === user.email))
																			.map((user) => (
																				<SelectItem key={user.id} value={user.id}>
																					{user.email}
																				</SelectItem>
																			))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="role"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Role in Campaign</FormLabel>
															<Select onValueChange={field.onChange} defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select a role" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="PLAYER">Player</SelectItem>
																	<SelectItem value="DM">Dungeon Master</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>

												{form.formState.errors.root && (
													<div
														className={`text-sm p-3 rounded-md ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50'}`}
													>
														{form.formState.errors.root.message}
													</div>
												)}

												<div className="flex justify-end gap-3 pt-4">
													<Button
														type="button"
														variant="outline"
														onClick={() => {
															form.reset();
															setOpen(false);
														}}
														disabled={isLoading}
													>
														Cancel
													</Button>
													<Button type="submit" disabled={isLoading}>
														{isLoading ? (
															<>
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
																Adding...
															</>
														) : (
															<>
																<UserPlus className="h-4 w-4 mr-2" />
																Add to Campaign
															</>
														)}
													</Button>
												</div>
											</form>
										</Form>
									</DialogContent>
								</Dialog>
							</div>
						)}
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
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>DMs</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{dmCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
								<Users className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-green-300' : 'text-green-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Players</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>{playerCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
								<Scroll className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Updates</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
									{campaign._count.updates}
								</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-orange-800' : 'bg-orange-100'}`}>
								<Target className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-orange-300' : 'text-orange-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Quests</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
									{campaign._count.quests}
								</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Campaign Members */}
				<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm mb-6 sm:mb-8 ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<h3 className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
						Campaign Members ({campaign.members?.length || 0})
					</h3>
					<div className="flex flex-col gap-4 sm:gap-6">
						{campaign.members && campaign.members.length > 0 ? (
							campaign.members.map((member) => (
								<div
									key={member.id}
									className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
								>
									<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
										{member.user.avatarUrl ? (
											<img src={member.user.avatarUrl} alt="Avatar" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
										) : (
											<div
												className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
													session?.user?.darkMode ? 'bg-cyan-800' : 'bg-purple-100'
												}`}
											>
												<User size={16} className={`sm:w-5 sm:h-5 ${session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'}`} />
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h4 className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
												{member.user.email}
											</h4>
											<div
												className={`flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
											>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														member.role === 'DM'
															? session?.user?.darkMode
																? 'bg-blue-800 text-blue-300'
																: 'bg-blue-100 text-blue-800'
															: session?.user?.darkMode
																? 'bg-green-800 text-green-300'
																: 'bg-green-100 text-green-800'
													}`}
												>
													{member.role}
												</span>
												<span className="flex items-center gap-1">
													<Calendar size={14} className="sm:w-4 sm:h-4" />
													<span className="hidden sm:inline">Joined:</span> <DateDisplay date={member.joinedAt} />
												</span>
												<span className="flex items-center gap-1">
													<Shield size={14} className="sm:w-4 sm:h-4" />
													Global: {member.user.role}
												</span>
											</div>
										</div>
									</div>
									{canManageMembers && (
										<div className="flex items-center gap-2 flex-shrink-0">
											<div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-6">
												{/* Role Toggle Buttons */}
												<div className={`flex rounded-lg p-1 ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
													<button
														onClick={() => handleChangeRole(member.id, 'PLAYER', member.role)}
														disabled={isLoading || member.role === 'PLAYER'}
														className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
															member.role === 'PLAYER'
																? session?.user?.darkMode
																	? 'bg-gray-600 text-green-400 shadow-sm'
																	: 'bg-white text-green-700 shadow-sm'
																: session?.user?.darkMode
																	? 'text-gray-300 hover:text-green-400'
																	: 'text-gray-600 hover:text-green-700'
														}`}
													>
														Player
													</button>
													<button
														onClick={() => handleChangeRole(member.id, 'DM', member.role)}
														disabled={isLoading || member.role === 'DM'}
														className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
															member.role === 'DM'
																? session?.user?.darkMode
																	? 'bg-gray-600 text-blue-400 shadow-sm'
																	: 'bg-white text-blue-700 shadow-sm'
																: session?.user?.darkMode
																	? 'text-gray-300 hover:text-blue-400'
																	: 'text-gray-600 hover:text-blue-700'
														}`}
													>
														DM
													</button>
												</div>

												{/* Remove Button */}
												<div className="mt-2 sm:mt-0">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleRemoveMember(member.id)}
														disabled={isLoading}
														className={`text-xs sm:text-sm ${
															session?.user?.darkMode
																? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 border-gray-600'
																: 'text-red-600 hover:text-red-700 hover:bg-red-50'
														}`}
													>
														{isLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />}
													</Button>
												</div>
											</div>
										</div>
									)}
								</div>
							))
						) : (
							<div className={`text-center py-8 sm:py-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								<Users className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
								<h4 className={`text-base sm:text-lg font-medium mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
									No members yet
								</h4>
								<p className="text-sm">Add players to get started</p>
							</div>
						)}
					</div>
				</Card>

				<div className="grid lg:grid-cols-2 gap-6">
					{/* Recent Updates */}
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
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
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
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
				</div>
			</div>
		</div>
	);
}
