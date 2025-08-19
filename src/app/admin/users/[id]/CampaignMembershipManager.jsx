'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MoreHorizontal, Settings, Trash2, UserPlus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { addCampaignMember, getAllCampaigns, removeCampaignMember, updateCampaignMemberRole } from '../../components/actions';

const addCampaignSchema = z.object({
	campaignId: z.string().min(1, 'Please select a campaign'),
	role: z.enum(['PLAYER', 'DM'], {
		required_error: 'Please select a role',
	}),
});

export default function CampaignMembershipManager({
	userId,
	membershipId = null,
	currentRole = null,
	campaignName = null,
	mode = 'add', // 'add' or 'edit'
}) {
	const { data: session } = useSession();
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [campaigns, setCampaigns] = useState([]);
	const [loadingCampaigns, setLoadingCampaigns] = useState(false);
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(addCampaignSchema),
		defaultValues: {
			campaignId: '',
			role: 'PLAYER',
		},
	});

	const loadCampaigns = async () => {
		if (campaigns.length > 0) return; // Already loaded

		setLoadingCampaigns(true);
		try {
			const result = await getAllCampaigns();
			if (result.success) {
				setCampaigns(result.data);
			}
		} catch (error) {
			console.error('Error loading campaigns:', error);
		} finally {
			setLoadingCampaigns(false);
		}
	};

	const onSubmit = async (values) => {
		setIsLoading(true);
		try {
			const result = await addCampaignMember({
				userId: userId,
				campaignId: values.campaignId,
				role: values.role,
			});

			if (result.success) {
				form.reset();
				setOpen(false);
				// Notify other components that campaign membership has changed
				window.dispatchEvent(new CustomEvent('campaignMembershipChanged'));
				router.refresh(); // Refresh the page to show updated memberships
			} else {
				form.setError('root', {
					type: 'manual',
					message: result.error || 'Failed to add to campaign',
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

	const handleRemoveMembership = async () => {
		if (!membershipId) return;

		setIsLoading(true);
		try {
			const result = await removeCampaignMember(membershipId);
			if (result.success) {
				// Notify other components that campaign membership has changed
				window.dispatchEvent(new CustomEvent('campaignMembershipChanged'));
				router.refresh();
			} else {
				alert('Failed to remove from campaign: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangeRole = async (newRole) => {
		if (!membershipId || newRole === currentRole) return;

		setIsLoading(true);
		try {
			const result = await updateCampaignMemberRole(membershipId, newRole);
			if (result.success) {
				// Notify other components that campaign membership has changed
				window.dispatchEvent(new CustomEvent('campaignMembershipChanged'));
				router.refresh();
			} else {
				alert('Failed to update role: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	if (mode === 'edit') {
		return (
			<div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-6">
				{/* Role Toggle Buttons */}
				<div className={`flex rounded-lg p-1 ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
					<button
						onClick={() => handleChangeRole('PLAYER')}
						disabled={isLoading || currentRole === 'PLAYER'}
						className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
							currentRole === 'PLAYER'
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
						onClick={() => handleChangeRole('DM')}
						disabled={isLoading || currentRole === 'DM'}
						className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
							currentRole === 'DM'
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

				{/* Remove Button - with additional spacing on mobile */}
				<div className="mt-2 sm:mt-0">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRemoveMembership}
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
		);
	}

	// Add mode
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="text-sm bg-blue-600 hover:bg-blue-700" onClick={loadCampaigns}>
					<UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
					<span className="hidden sm:inline">Add to Campaign</span>
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
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="campaignId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Campaign</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														loadingCampaigns ? 'Loading campaigns...' : campaigns.length === 0 ? 'No campaigns available' : 'Select a campaign'
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{!loadingCampaigns &&
												campaigns.length > 0 &&
												campaigns.map((campaign) => (
													<SelectItem key={campaign.id} value={campaign.id}>
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

						{form.formState.errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{form.formState.errors.root.message}</div>}

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
	);
}
