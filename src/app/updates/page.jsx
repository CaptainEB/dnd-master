'use client';

import { createCampaignUpdate, deleteCampaignUpdate, getCampaignUpdates, updateCampaignUpdate } from '@/app/admin/components/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, ChevronLeft, ChevronRight, Edit, Plus, Shield, Trash2, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const updateSchema = z.object({
	title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
	content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
});

export default function UpdatesPage() {
	const { data: session } = useSession();
	const [updates, setUpdates] = useState([]);
	const [pagination, setPagination] = useState({});
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingUpdate, setEditingUpdate] = useState(null);

	const createForm = useForm({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			title: '',
			content: '',
		},
	});

	const editForm = useForm({
		resolver: zodResolver(updateSchema),
		defaultValues: {
			title: '',
			content: '',
		},
	});

	// Check if user can create/edit updates (Admin or DM in current campaign)
	const [userCampaignRole, setUserCampaignRole] = useState(null);

	// Get user's role in current campaign
	useEffect(() => {
		if (session?.user?.activeCampaign?.id) {
			// Get user's role from session or check campaign membership
			const activeCampaign = session.user.activeCampaign;
			// This should be available from the session if the user has an active campaign
			setUserCampaignRole(activeCampaign.userRole || null);
		}
	}, [session?.user?.activeCampaign]);

	const canManageUpdates = session?.user?.role === 'ADMIN' || userCampaignRole === 'DM';

	// Load updates
	const loadUpdates = async (page = 1) => {
		if (!session?.user?.activeCampaign?.id) {
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const result = await getCampaignUpdates(session.user.activeCampaign.id, page, 10);
			if (result.success) {
				setUpdates(result.data.updates);
				setPagination(result.data.pagination);
				setCurrentPage(page);
			} else {
				console.error('Failed to load updates:', result.error);
			}
		} catch (error) {
			console.error('Error loading updates:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session?.user?.activeCampaign?.id) {
			loadUpdates(1);
		}
	}, [session?.user?.activeCampaign?.id]);

	// Create update
	const onCreateSubmit = async (values) => {
		if (!session?.user?.activeCampaign?.id) return;

		try {
			const result = await createCampaignUpdate({
				...values,
				campaignId: session.user.activeCampaign.id,
			});

			if (result.success) {
				createForm.reset();
				setCreateDialogOpen(false);
				// Dispatch event to notify other components
				window.dispatchEvent(new CustomEvent('campaignUpdatesChanged'));
				loadUpdates(1); // Reload first page
			} else {
				createForm.setError('root', {
					type: 'manual',
					message: result.error,
				});
			}
		} catch (error) {
			createForm.setError('root', {
				type: 'manual',
				message: 'An unexpected error occurred',
			});
		}
	};

	// Edit update
	const openEditDialog = (update) => {
		setEditingUpdate(update);
		editForm.reset({
			title: update.title,
			content: update.content,
		});
		setEditDialogOpen(true);
	};

	const onEditSubmit = async (values) => {
		if (!editingUpdate) return;

		try {
			const result = await updateCampaignUpdate(editingUpdate.id, values);
			if (result.success) {
				setEditDialogOpen(false);
				setEditingUpdate(null);
				// Dispatch event to notify other components
				window.dispatchEvent(new CustomEvent('campaignUpdatesChanged'));
				loadUpdates(currentPage); // Reload current page
			} else {
				editForm.setError('root', {
					type: 'manual',
					message: result.error,
				});
			}
		} catch (error) {
			editForm.setError('root', {
				type: 'manual',
				message: 'An unexpected error occurred',
			});
		}
	};

	// Delete update
	const handleDelete = async (updateId) => {
		if (!confirm('Are you sure you want to delete this update?')) return;

		try {
			const result = await deleteCampaignUpdate(updateId);
			if (result.success) {
				// Dispatch event to notify other components
				window.dispatchEvent(new CustomEvent('campaignUpdatesChanged'));
				loadUpdates(currentPage);
			} else {
				alert('Failed to delete update: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred');
		}
	};

	// Check if user can edit/delete specific update
	const canEditUpdate = (update) => {
		return session?.user?.role === 'ADMIN' || update.authorId === session?.user?.id || userCampaignRole === 'DM';
	};

	const formatDate = (dateString) => {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return '';
		}
	};

	if (!session?.user?.activeCampaign) {
		return (
			<div
				className={`min-h-screen pt-28 p-8 ${
					session?.user?.darkMode
						? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
						: 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
				}`}
			>
				<div className="max-w-4xl mx-auto">
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h2 className={`text-2xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Active Campaign</h2>
								<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please select an active campaign to view updates.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen pt-28 p-8 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className={`text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Campaign Updates</h1>
						<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							Latest updates for{' '}
							<span className={`font-semibold ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
								{session.user.activeCampaign.name}
							</span>
						</p>
					</div>

					{/* Create Update Button */}
					{canManageUpdates && (
						<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
							<DialogTrigger asChild>
								<Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
									<Plus size={16} className="mr-2" />
									Add Update
								</Button>
							</DialogTrigger>
							<DialogContent className={`max-w-md border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}>
								<DialogHeader>
									<DialogTitle className="text-gray-800">Create New Update</DialogTitle>
								</DialogHeader>
								<Form {...createForm}>
									<form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
										<FormField
											control={createForm.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">Title</FormLabel>
													<FormControl>
														<Input
															placeholder="e.g., Session 5 Rewards"
															className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={createForm.control}
											name="content"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">Content</FormLabel>
													<FormControl>
														<Textarea
															placeholder="e.g., All party members receive 1000 XP and 500 gold pieces..."
															rows={4}
															className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{createForm.formState.errors.root && (
											<div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
												{createForm.formState.errors.root.message}
											</div>
										)}
										<div className="flex justify-end gap-2 pt-4">
											<Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={() => setCreateDialogOpen(false)}>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={createForm.formState.isSubmitting}
												className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
											>
												{createForm.formState.isSubmitting ? 'Creating...' : 'Create Update'}
											</Button>
										</div>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Updates List */}
				{loading ? (
					<div className="text-center py-12">
						<div className={`flex flex-col items-center gap-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
							Loading updates...
						</div>
					</div>
				) : updates.length === 0 ? (
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<Plus className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h3 className={`text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Updates Yet</h3>
								<p className={`mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									{canManageUpdates ? 'Be the first to add a campaign update!' : 'No updates have been posted for this campaign yet.'}
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{updates.map((update) => (
							<Card
								key={update.id}
								className={`border-0 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-200 ${
									session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'
								}`}
							>
								<CardHeader className="pb-3">
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<CardTitle className={`text-xl mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>{update.title}</CardTitle>
											<CardDescription className="flex items-center gap-4">
												<span className={`flex items-center gap-1 ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
													<User size={14} />
													{update.author.characterName || update.author.email?.split('@')[0] || 'Unknown User'}
												</span>
												<span className={`flex items-center gap-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
													<Calendar size={14} />
													{formatDate(update.createdAt)}
												</span>
											</CardDescription>
										</div>
										{canEditUpdate(update) && (
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
													onClick={() => openEditDialog(update)}
												>
													<Edit size={14} />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
													onClick={() => handleDelete(update.id)}
												>
													<Trash2 size={14} />
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div
										className={`p-4 rounded-lg border ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'}`}
									>
										<p className={`whitespace-pre-wrap leading-relaxed ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
											{update.content}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className="flex justify-center items-center gap-4 mt-8">
						<Button
							variant="outline"
							className="border-purple-200 text-purple-600 hover:bg-purple-50"
							onClick={() => loadUpdates(currentPage - 1)}
							disabled={!pagination.hasPrev}
						>
							<ChevronLeft size={16} />
							Previous
						</Button>
						<div
							className={`backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm ${session?.user?.darkMode ? 'bg-gray-700/80 border-gray-600' : 'bg-white/80 border-purple-100'}`}
						>
							<span className="text-sm text-gray-600">
								Page {pagination.page} of {pagination.totalPages}
							</span>
						</div>
						<Button
							variant="outline"
							className="border-purple-200 text-purple-600 hover:bg-purple-50"
							onClick={() => loadUpdates(currentPage + 1)}
							disabled={!pagination.hasNext}
						>
							Next
							<ChevronRight size={16} />
						</Button>
					</div>
				)}

				{/* Edit Dialog */}
				<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
					<DialogContent className={`max-w-md border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}>
						<DialogHeader>
							<DialogTitle className="text-gray-800">Edit Update</DialogTitle>
						</DialogHeader>
						<Form {...editForm}>
							<form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
								<FormField
									control={editForm.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-gray-700">Title</FormLabel>
											<FormControl>
												<Input className="border-purple-200 focus:border-purple-500 focus:ring-purple-500" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={editForm.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-gray-700">Content</FormLabel>
											<FormControl>
												<Textarea rows={4} className="border-purple-200 focus:border-purple-500 focus:ring-purple-500" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{editForm.formState.errors.root && (
									<div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{editForm.formState.errors.root.message}</div>
								)}
								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={() => setEditDialogOpen(false)}>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={editForm.formState.isSubmitting}
										className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
									>
										{editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
