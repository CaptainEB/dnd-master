'use client';

import { DateDisplay } from '@/components/DateDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Crown, Loader2, Mail, Shield, UserCheck, UserMinus, UserPlus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
	demoteFromDMInCampaign,
	getDMCampaignMembers,
	getUserCampaigns,
	invitePlayerByEmail,
	promoteToDMInCampaign,
	promoteUserToDM,
} from '../../admin/components/actions';

const inviteSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	role: z.enum(['PLAYER', 'DM'], { required_error: 'Please select a role' }),
	username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
	campaignId: z.string().min(1, 'Please select a campaign'),
});

export default function ManagePlayersSection() {
	const { data: session } = useSession();
	const [campaignMembers, setCampaignMembers] = useState([]);
	const [campaigns, setCampaigns] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [promotingUserId, setPromotingUserId] = useState(null);
	const [demotingCampaignId, setDemotingCampaignId] = useState(null);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null, campaignId: null });
	const [currentUser, setCurrentUser] = useState(null);
	const router = useRouter();

	const inviteForm = useForm({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: '',
			role: 'PLAYER',
			username: '',
			campaignId: '',
		},
	});

	useEffect(() => {
		loadData();
		// Get current user info from session
		fetch('/api/auth/session')
			.then((res) => res.json())
			.then((session) => {
				if (session?.user) {
					setCurrentUser(session.user);
				}
			})
			.catch(console.error);
	}, []);

	const loadData = async () => {
		try {
			setIsLoading(true);
			const [membersResult, campaignsResult] = await Promise.all([getDMCampaignMembers(), getUserCampaigns()]);

			if (membersResult.success) {
				setCampaignMembers(membersResult.data);
			} else {
				setError(membersResult.error);
			}

			if (campaignsResult.success) {
				// Filter for DM campaigns
				const dmCampaigns = campaignsResult.data.filter((campaign) => campaign.userRole === 'DM');
				setCampaigns(dmCampaigns);
			}
		} catch (err) {
			setError('Failed to load data');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePromoteUser = async (userId, campaignId) => {
		setPromotingUserId(userId);
		try {
			const result = await promoteToDMInCampaign(userId, campaignId);
			if (result.success) {
				// Update the member's role in the campaign members list
				setCampaignMembers(
					campaignMembers.map((member) => (member.user.id === userId && member.campaign.id === campaignId ? { ...member, role: 'DM' } : member))
				);
				setConfirmDialog({ open: false, user: null, action: null, campaignId: null });
				router.refresh();
			} else {
				alert('Failed to promote user: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		} finally {
			setPromotingUserId(null);
		}
	};

	const handleDemoteUser = async (campaignId) => {
		setDemotingCampaignId(campaignId);
		try {
			const result = await demoteFromDMInCampaign(campaignId);
			if (result.success) {
				// Update the current user's role in the campaign members list
				setCampaignMembers(
					campaignMembers.map((member) =>
						member.user.id === currentUser?.id && member.campaign.id === campaignId ? { ...member, role: 'PLAYER' } : member
					)
				);
				setConfirmDialog({ open: false, user: null, action: null, campaignId: null });
				router.refresh();
			} else {
				alert('Failed to step down: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		} finally {
			setDemotingCampaignId(null);
		}
	};

	const handleInvitePlayer = async (data) => {
		setInviteLoading(true);
		try {
			const result = await invitePlayerByEmail(data);
			if (result.success) {
				inviteForm.reset();
				setInviteDialogOpen(false);
				loadData(); // Reload data to show new member
			} else {
				inviteForm.setError('root', { message: result.error });
			}
		} catch (error) {
			inviteForm.setError('root', { message: 'An unexpected error occurred' });
		} finally {
			setInviteLoading(false);
		}
	};

	// Auto-generate username from email
	const handleEmailChange = (email) => {
		const username = email.split('@')[0];
		inviteForm.setValue('username', username);
	};

	const openConfirmDialog = (user, action, campaignId) => {
		setConfirmDialog({ open: true, user, action, campaignId });
	};

	const closeConfirmDialog = () => {
		setConfirmDialog({ open: false, user: null, action: null, campaignId: null });
	};

	const handleConfirmAction = () => {
		if (confirmDialog.action === 'promote') {
			handlePromoteUser(confirmDialog.user.id, confirmDialog.campaignId);
		} else if (confirmDialog.action === 'demote') {
			handleDemoteUser(confirmDialog.campaignId);
		}
	};

	// Helper function to check if current user can demote (is there another DM in this campaign?)
	const canCurrentUserDemote = (campaignId) => {
		const campaignDMs = campaignMembers.filter((member) => member.campaign.id === campaignId && member.role === 'DM');
		return campaignDMs.length > 1;
	};

	if (isLoading) {
		return (
			<div className={`text-center py-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
				<Users className={`h-12 w-12 mx-auto mb-4 animate-pulse ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
				<p>Loading campaign members...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className={`text-center py-12 ${session?.user?.darkMode ? 'text-red-400' : 'text-red-500'}`}>
				<p>Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Invite Player Section */}
			<div
				className={`rounded-xl p-4 sm:p-6 ${session?.user?.darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}
			>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
					<div>
						<h4 className={`text-base sm:text-lg font-bold mb-1 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Invite New Player</h4>
						<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Add players to your campaigns by email</p>
					</div>
					<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
						<DialogTrigger asChild>
							<Button className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
								<UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
								<span className="hidden sm:inline">Invite Player</span>
								<span className="sm:hidden">Invite</span>
							</Button>
						</DialogTrigger>
						<DialogContent className={`mx-3 sm:mx-0 sm:max-w-[500px] ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
							<DialogHeader>
								<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-900'}>Invite Player to Campaign</DialogTitle>
								<DialogDescription className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>
									Enter the player's details to send them an invitation.
								</DialogDescription>
							</DialogHeader>
							<Form {...inviteForm}>
								<form onSubmit={inviteForm.handleSubmit(handleInvitePlayer)} className="space-y-4">
									<FormField
										control={inviteForm.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Email Address *</FormLabel>
												<FormControl>
													<Input
														placeholder="player@example.com"
														{...field}
														className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
														onChange={(e) => {
															field.onChange(e);
															handleEmailChange(e.target.value);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={inviteForm.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Preferred Username *</FormLabel>
												<FormControl>
													<Input
														placeholder="Enter username"
														{...field}
														className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={inviteForm.control}
										name="campaignId"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Campaign *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger
															className={
																session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
															}
														>
															<SelectValue placeholder="Select campaign" />
														</SelectTrigger>
													</FormControl>
													<SelectContent className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
														{campaigns.map((campaign) => (
															<SelectItem
																key={campaign.id}
																value={campaign.id}
																className={session?.user?.darkMode ? 'text-white hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-100'}
															>
																{campaign.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={inviteForm.control}
										name="role"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Role *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger
															className={
																session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
															}
														>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
														<SelectItem
															value="PLAYER"
															className={session?.user?.darkMode ? 'text-white hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-100'}
														>
															Player
														</SelectItem>
														<SelectItem
															value="DM"
															className={session?.user?.darkMode ? 'text-white hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-100'}
														>
															Dungeon Master
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{inviteForm.formState.errors.root && (
										<div className={`text-sm ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>
											{inviteForm.formState.errors.root.message}
										</div>
									)}

									<div className="flex gap-2 pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={() => setInviteDialogOpen(false)}
											disabled={inviteLoading}
											className={`flex-1 ${session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={inviteLoading}
											className={`flex-1 ${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'}`}
										>
											{inviteLoading ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Inviting...
												</>
											) : (
												<>
													<Mail className="h-4 w-4 mr-2" />
													Send Invitation
												</>
											)}
										</Button>
									</div>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Campaign Members Section */}
			<div>
				<h4 className={`text-base sm:text-lg font-bold mb-4 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Members</h4>

				{campaignMembers.length === 0 ? (
					<div className={`text-center py-8 sm:py-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
						<UserCheck className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
						<h4 className={`text-base sm:text-lg font-medium mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							No Campaign Members
						</h4>
						<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							Invite players to your campaigns to see them here.
						</p>
					</div>
				) : (
					<div className="space-y-3 sm:space-y-4">
						{campaignMembers.map((member) => (
							<Card
								key={member.id}
								className={`p-4 sm:p-6 hover:shadow-md transition-shadow ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-start gap-4">
									<div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
										<div
											className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
												session?.user?.darkMode ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-blue-100 to-purple-100'
											}`}
										>
											{member.role === 'DM' ? (
												<Crown className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
											) : (
												<Users className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
											)}
										</div>
										<div className="min-w-0 flex-1">
											<h4 className={`font-semibold text-sm sm:text-base truncate ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
												{member.characterName || member.user.email}
												{member.user.username && ` (${member.user.username})`}
											</h4>
											<div className={`flex flex-col gap-2 text-xs sm:text-sm mt-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
												<div className="flex flex-wrap gap-2">
													<Badge
														variant="secondary"
														className={`text-xs ${
															member.role === 'DM'
																? session?.user?.darkMode
																	? 'bg-purple-900/30 text-purple-400 border-purple-800'
																	: 'bg-purple-100 text-purple-800'
																: session?.user?.darkMode
																	? 'bg-green-900/30 text-green-400 border-green-800'
																	: 'bg-green-100 text-green-800'
														}`}
													>
														{member.role} in {member.campaign.name}
													</Badge>
													<Badge
														variant="outline"
														className={`text-xs ${
															member.user.role === 'ADMIN'
																? session?.user?.darkMode
																	? 'bg-red-900/30 text-red-400 border-red-800'
																	: 'bg-red-100 text-red-800'
																: session?.user?.darkMode
																	? 'bg-gray-700 text-gray-300 border-gray-600'
																	: 'bg-gray-100 text-gray-800'
														}`}
													>
														Global: {member.user.role}
													</Badge>
												</div>
												<div className="flex items-center gap-1 text-xs">
													<Calendar size={12} />
													<span>
														Joined: <DateDisplay date={member.joinedAt} />
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
										{/* Promote to DM button - only show for PLAYER role in campaign */}
										{member.role === 'PLAYER' && (
											<Button
												onClick={() => openConfirmDialog(member.user, 'promote', member.campaign.id)}
												disabled={promotingUserId === member.user.id}
												size="sm"
												className={`text-xs ${
													session?.user?.darkMode
														? 'bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white'
														: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
												}`}
											>
												{promotingUserId === member.user.id ? (
													<>
														<Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
														<span className="hidden sm:inline">Promoting...</span>
														<span className="sm:hidden">...</span>
													</>
												) : (
													<>
														<Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
														<span className="hidden sm:inline">Promote to DM</span>
														<span className="sm:hidden">Promote</span>
													</>
												)}
											</Button>
										)}

										{/* Step down button - only show for current user if they're DM and there are other DMs */}
										{member.role === 'DM' && member.user.id === currentUser?.id && (
											<Button
												onClick={() => openConfirmDialog(member.user, 'demote', member.campaign.id)}
												disabled={demotingCampaignId === member.campaign.id || !canCurrentUserDemote(member.campaign.id)}
												variant="outline"
												size="sm"
												className={`text-xs ${
													session?.user?.darkMode
														? 'border-orange-600 text-orange-400 hover:bg-orange-900/20 bg-gray-800'
														: 'border-orange-300 text-orange-700 hover:bg-orange-50'
												}`}
											>
												{demotingCampaignId === member.campaign.id ? (
													<>
														<Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
														<span className="hidden sm:inline">Stepping down...</span>
														<span className="sm:hidden">...</span>
													</>
												) : (
													<>
														<UserMinus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
														<span className="hidden sm:inline">{canCurrentUserDemote(member.campaign.id) ? 'Step Down' : 'Cannot Step Down'}</span>
														<span className="sm:hidden">{canCurrentUserDemote(member.campaign.id) ? 'Step Down' : 'Cannot'}</span>
													</>
												)}
											</Button>
										)}

										{/* DM indicator for other DMs */}
										{member.role === 'DM' && member.user.id !== currentUser?.id && (
											<div
												className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg ${session?.user?.darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}
											>
												<Shield className={`h-3 w-3 sm:h-4 sm:w-4 ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
												<span className={`text-xs sm:text-sm font-medium ${session?.user?.darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
													<span className="hidden sm:inline">Dungeon Master</span>
													<span className="sm:hidden">DM</span>
												</span>
											</div>
										)}
									</div>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Promotion/Demotion Confirmation Dialog */}
			<Dialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
				<DialogContent className={session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
					<DialogHeader>
						<DialogTitle className={`flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							{confirmDialog.action === 'promote' ? (
								<>
									<Crown className={`h-5 w-5 ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
									Promote to Dungeon Master
								</>
							) : (
								<>
									<UserMinus className={`h-5 w-5 ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
									Step Down from Dungeon Master
								</>
							)}
						</DialogTitle>
						<DialogDescription className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>
							{confirmDialog.action === 'promote' ? (
								<>
									Are you sure you want to promote <strong>{confirmDialog.user?.email}</strong> to Dungeon Master in this campaign?
								</>
							) : (
								<>Are you sure you want to step down from Dungeon Master role in this campaign?</>
							)}
						</DialogDescription>
					</DialogHeader>
					<div
						className={`border rounded-lg p-4 my-4 ${
							confirmDialog.action === 'promote'
								? session?.user?.darkMode
									? 'bg-blue-900/20 border-blue-800'
									: 'bg-blue-50 border-blue-200'
								: session?.user?.darkMode
									? 'bg-orange-900/20 border-orange-800'
									: 'bg-orange-50 border-orange-200'
						}`}
					>
						{confirmDialog.action === 'promote' ? (
							<>
								<h4 className={`font-medium mb-2 ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-900'}`}>
									This will grant them the ability to:
								</h4>
								<ul className={`text-sm space-y-1 ${session?.user?.darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
									<li>• Manage this campaign as a co-DM</li>
									<li>• Invite players to this campaign</li>
									<li>• Promote other players to DM role</li>
									<li>• Access DM tools for this campaign</li>
								</ul>
							</>
						) : (
							<>
								<h4 className={`font-medium mb-2 ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-900'}`}>This will:</h4>
								<ul className={`text-sm space-y-1 ${session?.user?.darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
									<li>• Change your role to Player in this campaign</li>
									<li>• Remove your DM privileges for this campaign</li>
									<li>• Other DMs will continue to manage the campaign</li>
									{!canCurrentUserDemote(confirmDialog.campaignId) && (
										<li className={`font-medium ${session?.user?.darkMode ? 'text-red-400' : 'text-red-700'}`}>
											• ⚠️ Cannot proceed - you are the only DM in this campaign
										</li>
									)}
								</ul>
							</>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={closeConfirmDialog}
							className={session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmAction}
							disabled={
								(confirmDialog.action === 'promote' && promotingUserId === confirmDialog.user?.id) ||
								(confirmDialog.action === 'demote' &&
									(demotingCampaignId === confirmDialog.campaignId || !canCurrentUserDemote(confirmDialog.campaignId)))
							}
							className={
								confirmDialog.action === 'promote'
									? session?.user?.darkMode
										? 'bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white'
										: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
									: session?.user?.darkMode
										? 'bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-800 hover:to-red-800 text-white'
										: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
							}
						>
							{(confirmDialog.action === 'promote' && promotingUserId === confirmDialog.user?.id) ||
							(confirmDialog.action === 'demote' && demotingCampaignId === confirmDialog.campaignId) ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{confirmDialog.action === 'promote' ? 'Promoting...' : 'Stepping down...'}
								</>
							) : (
								<>
									{confirmDialog.action === 'promote' ? (
										<>
											<Crown className="h-4 w-4 mr-2" />
											Yes, Promote to DM
										</>
									) : (
										<>
											<UserMinus className="h-4 w-4 mr-2" />
											Yes, Step Down
										</>
									)}
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
