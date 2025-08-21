'use client';

import {
	createCampaignInfo,
	deleteCampaignInfo,
	getCampaignBackground,
	getCampaignInfos,
	updateCampaignBackground,
	updateCampaignInfo,
} from '@/app/admin/components/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, BookOpen, Edit, Eye, Image, Plus, Search, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CreateInfoDialog from './components/CreateInfoDialog';
import InfoCard from './components/InfoCard';
import SetBackgroundDialog from './components/SetBackgroundDialog';

export default function InfoPage() {
	const { data: session, status } = useSession();
	const [infos, setInfos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [viewMode, setViewMode] = useState('read');

	// Dialog states
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingInfo, setEditingInfo] = useState(null);
	const [backgroundDialogOpen, setBackgroundDialogOpen] = useState(false);

	// Background state
	const [backgroundUrl, setBackgroundUrl] = useState('');

	// Form setup
	const createForm = useForm({
		defaultValues: {
			title: '',
			description: '',
			body: '',
			category: 'General',
			order: 0,
		},
	});

	const editForm = useForm({
		defaultValues: {
			title: '',
			description: '',
			body: '',
			category: 'General',
			order: 0,
		},
	});

	const backgroundForm = useForm({
		defaultValues: {
			backgroundUrl: '',
		},
	});

	// Check permissions
	const canEdit = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	// Fetch info entries
	useEffect(() => {
		async function fetchInfos() {
			if (!session?.user?.activeCampaignId) return;

			try {
				const result = await getCampaignInfos(session.user.activeCampaignId);
				if (result.success) {
					setInfos(result.data);
				} else {
					console.error('Failed to fetch infos:', result.error);
				}
			} catch (error) {
				console.error('Error fetching infos:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchInfos();
	}, [session?.user?.activeCampaignId]);

	// Fetch campaign background
	useEffect(() => {
		async function fetchBackground() {
			if (!session?.user?.activeCampaignId) return;

			try {
				const result = await getCampaignBackground(session.user.activeCampaignId);
				if (result.success) {
					setBackgroundUrl(result.data || '');
					backgroundForm.setValue('backgroundUrl', result.data || '');
				}
			} catch (error) {
				console.error('Error fetching background:', error);
			}
		}

		fetchBackground();
	}, [session?.user?.activeCampaignId, backgroundForm]);

	// Filter infos
	const filteredInfos = infos.filter((info) => {
		const matchesSearch =
			info.title.toLowerCase().includes(searchTerm.toLowerCase()) || info.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === 'all' || info.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	// Group infos by category
	const groupedInfos = {};
	filteredInfos.forEach((info) => {
		const category = info.category || 'General';
		if (!groupedInfos[category]) {
			groupedInfos[category] = [];
		}
		groupedInfos[category].push(info);
	});

	// Sort categories and infos within categories
	Object.keys(groupedInfos).forEach((category) => {
		groupedInfos[category].sort((a, b) => {
			if (a.order !== b.order) {
				return a.order - b.order;
			}
			return new Date(a.createdAt) - new Date(b.createdAt);
		});
	});

	// Get unique categories for filter
	const categories = ['all', ...new Set(infos.map((info) => info.category || 'General'))];

	// Generate table of contents
	const generateTOC = () => {
		const toc = [];
		Object.keys(groupedInfos)
			.sort()
			.forEach((category) => {
				if (groupedInfos[category].length > 0) {
					toc.push({
						category,
						infos: groupedInfos[category],
					});
				}
			});
		return toc;
	};

	const toc = generateTOC();

	// Handle create info
	const onCreateSubmit = async (data) => {
		try {
			const result = await createCampaignInfo(session.user.activeCampaignId, data);
			if (result.success) {
				setInfos([...infos, result.data]);
				setCreateDialogOpen(false);
				createForm.reset();
			} else {
				createForm.setError('root', { message: result.error });
			}
		} catch (error) {
			createForm.setError('root', { message: 'An unexpected error occurred' });
		}
	};

	// Handle edit info
	const openEditDialog = (info) => {
		setEditingInfo(info);
		editForm.reset({
			title: info.title,
			description: info.description,
			body: info.body,
			category: info.category || 'General',
			order: info.order || 0,
		});
		setEditDialogOpen(true);
	};

	const onEditSubmit = async (data) => {
		try {
			const result = await updateCampaignInfo(editingInfo.id, data);
			if (result.success) {
				setInfos(infos.map((info) => (info.id === editingInfo.id ? result.data : info)));
				setEditDialogOpen(false);
				setEditingInfo(null);
				editForm.reset();
			} else {
				editForm.setError('root', { message: result.error });
			}
		} catch (error) {
			editForm.setError('root', { message: 'An unexpected error occurred' });
		}
	};

	// Handle background submission
	const handleBackgroundSubmit = async (data) => {
		if (!session?.user?.activeCampaignId) return;

		try {
			const result = await updateCampaignBackground(session.user.activeCampaignId, data.backgroundUrl);
			if (result.success) {
				setBackgroundUrl(data.backgroundUrl);
				setBackgroundDialogOpen(false);
			} else {
				console.error('Failed to update background:', result.error);
			}
		} catch (error) {
			console.error('Error updating background:', error);
		}
	};

	// Handle clearing background
	const handleClearBackground = async () => {
		if (!session?.user?.activeCampaignId) return;

		try {
			const result = await updateCampaignBackground(session.user.activeCampaignId, '');
			if (result.success) {
				setBackgroundUrl('');
				backgroundForm.setValue('backgroundUrl', '');
				setBackgroundDialogOpen(false);
			} else {
				console.error('Failed to clear background:', result.error);
			}
		} catch (error) {
			console.error('Error clearing background:', error);
		}
	};

	// Handle delete info
	const handleDeleteInfo = async (infoId) => {
		if (!confirm('Are you sure you want to delete this info entry?')) return;

		try {
			const result = await deleteCampaignInfo(infoId);
			if (result.success) {
				setInfos(infos.filter((info) => info.id !== infoId));
			} else {
				alert('Failed to delete info entry: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred while deleting the info entry');
		}
	};

	// Format date
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	if (status === 'loading' || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	if (status === 'unauthenticated') {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
					<p className="text-gray-600">Please sign in to view campaign information.</p>
				</div>
			</div>
		);
	}

	if (!session?.user?.activeCampaignId) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">No Active Campaign</h1>
					<p className="text-gray-600">Join or create a campaign to view information.</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Background Image */}
			{backgroundUrl && (
				<div
					className="fixed inset-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage: `url(${backgroundUrl})`,
						opacity: 0.3,
						zIndex: -10,
					}}
				/>
			)}

			{/* Desktop Full-Screen Sidebar - Fixed to left edge, full height */}
			{toc.length > 0 && (
				<aside className="hidden lg:block fixed left-0 top-0 h-screen w-80 z-50">
					<div
						className={`h-full flex flex-col ${
							session?.user?.darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-purple-200'
						} border-r shadow-lg`}
					>
						<div className="p-6 border-b border-inherit">
							<h2 className={`text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Information</h2>
							<p className={`text-sm mt-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Campaign Lore & Info</p>
						</div>
						<div className="flex-1 overflow-y-auto p-4">
							{toc.map((categoryGroup) => (
								<div key={categoryGroup.category} className="mb-6">
									<h3
										className={`font-semibold mb-3 text-lg sticky top-0 bg-inherit py-2 border-b border-inherit ${
											session?.user?.darkMode ? 'text-purple-400 border-gray-600' : 'text-purple-700 border-purple-100'
										}`}
									>
										{categoryGroup.category}
									</h3>
									<ul className="space-y-1 ml-4">
										{categoryGroup.infos.map((info) => (
											<li key={info.id}>
												<a
													href={`#info-${info.id}`}
													className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:translate-x-1 text-sm ${
														session?.user?.darkMode
															? 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20'
															: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
													}`}
													onClick={(e) => {
														e.preventDefault();
														document.getElementById(`info-${info.id}`)?.scrollIntoView({
															behavior: 'smooth',
															block: 'start',
														});
													}}
												>
													{info.title}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
						<div className="p-4 border-t border-inherit">
							<button
								onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
								className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
									session?.user?.darkMode
										? 'hover:bg-purple-900/30 text-purple-400 hover:text-purple-300'
										: 'hover:bg-purple-100 text-purple-600 hover:text-purple-700'
								}`}
							>
								<ArrowUp className="h-4 w-4" />
								Back to Top
							</button>
						</div>
					</div>
				</aside>
			)}

			{/* Main Content Area with Left Margin for Sidebar */}
			<div
				className={`min-h-screen pt-28 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${toc.length > 0 ? 'lg:ml-80' : ''}`}
				style={{
					background: session?.user?.darkMode
						? 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.7), rgba(31, 41, 55, 0.7), rgba(17, 24, 39, 0.7))'
						: 'linear-gradient(to bottom right, rgba(243, 232, 255, 0.7), rgba(255, 255, 255, 0.7), rgba(239, 246, 255, 0.7))',
				}}
			>
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-6 sm:mb-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
							<div className="min-w-0 flex-1">
								<h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
									Campaign Information
								</h1>
								<p className="text-sm sm:text-base font-medium text-purple-600">{session.user.activeCampaignName}</p>
							</div>

							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
								{/* View Mode Toggle */}
								<div
									className={`flex rounded-lg p-1 backdrop-blur-sm w-full sm:w-auto ${
										session?.user?.darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80 border border-purple-200'
									}`}
								>
									<Button
										variant={viewMode === 'read' ? 'default' : 'ghost'}
										size="sm"
										onClick={() => setViewMode('read')}
										className={`flex-1 sm:flex-initial text-xs sm:text-sm ${
											viewMode === 'read'
												? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
												: session?.user?.darkMode
													? 'text-gray-300 hover:text-white hover:bg-gray-700'
													: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
										}`}
									>
										<Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
										Read
									</Button>
									{canEdit && (
										<Button
											variant={viewMode === 'edit' ? 'default' : 'ghost'}
											size="sm"
											onClick={() => setViewMode('edit')}
											className={`flex-1 sm:flex-initial text-xs sm:text-sm ${
												viewMode === 'edit'
													? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
													: session?.user?.darkMode
														? 'text-gray-300 hover:text-white hover:bg-gray-700'
														: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
											}`}
										>
											<Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
											Edit
										</Button>
									)}
								</div>

								{/* Add Info Button */}
								{canEdit && (
									<div className="flex gap-2">
										<Button
											onClick={() => setCreateDialogOpen(true)}
											className={`text-xs sm:text-sm px-3 sm:px-4 ${
												session?.user?.darkMode
													? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
													: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
											}`}
										>
											<Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
											Add Info
										</Button>
										<Button
											onClick={() => setBackgroundDialogOpen(true)}
											variant="outline"
											size="sm"
											className={`text-xs sm:text-sm px-3 sm:px-4 ${
												session?.user?.darkMode
													? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
													: 'border-purple-200 text-purple-600 hover:bg-purple-50'
											}`}
										>
											<Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
											Background
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Search and Filter */}
					<div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
						<div className="flex-1 relative">
							<Search
								className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'}`}
							/>
							<Input
								placeholder="Search information..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={`pl-10 text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm'}`}
							/>
						</div>
						<div className="flex gap-2 flex-wrap">
							{categories.map((category) => (
								<Button
									key={category}
									variant={selectedCategory === category ? 'default' : 'outline'}
									size="sm"
									onClick={() => setSelectedCategory(category)}
									className={`text-xs sm:text-sm px-2 sm:px-3 ${
										selectedCategory === category
											? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
											: session?.user?.darkMode
												? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-200 hover:text-white'
												: 'border-purple-200 hover:bg-purple-50 text-gray-700 hover:text-gray-900'
									}`}
								>
									{category === 'all' ? 'All Categories' : category}
								</Button>
							))}
						</div>
					</div>

					{/* Content */}
					{infos.length === 0 ? (
						<Card className={`backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-purple-200'}`}>
							<CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
								<BookOpen
									className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-400'}`}
								/>
								<h2 className={`text-lg sm:text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
									No Information Yet
								</h2>
								<p className={`text-sm sm:text-base mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									{canEdit ? 'Get started by adding your first campaign information.' : "The DM hasn't added any information yet."}
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="relative">
							{/* Mobile TOC - Collapsible */}
							{toc.length > 0 && (
								<div className="lg:hidden mb-6">
									<Card
										className={`backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-purple-200'}`}
									>
										<CardHeader className="pb-3">
											<CardTitle className={`text-lg flex items-center justify-between ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												Quick Navigation
												<button
													onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
													className={`p-1 rounded-full transition-colors ${
														session?.user?.darkMode
															? 'hover:bg-purple-900/30 text-purple-400 hover:text-purple-300'
															: 'hover:bg-purple-100 text-purple-600 hover:text-purple-700'
													}`}
													title="Scroll to top"
												>
													<ArrowUp className="h-4 w-4" />
												</button>
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											{toc.map((categoryGroup) => (
												<div key={categoryGroup.category}>
													<h3 className={`font-semibold mb-2 text-sm ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
														{categoryGroup.category}
													</h3>
													<div className="grid grid-cols-1 gap-1">
														{categoryGroup.infos.map((info) => (
															<button
																key={info.id}
																onClick={() => {
																	document.getElementById(`info-${info.id}`)?.scrollIntoView({
																		behavior: 'smooth',
																		block: 'start',
																	});
																}}
																className={`text-left text-sm p-2 rounded transition-colors ${
																	session?.user?.darkMode
																		? 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20'
																		: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
																}`}
															>
																{info.title}
															</button>
														))}
													</div>
												</div>
											))}
										</CardContent>
									</Card>
								</div>
							)}

							{/* Info Content */}
							<div className="space-y-4 sm:space-y-6">
								{Object.keys(groupedInfos).map((category) => (
									<div key={category}>
										<h2
											className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 border-b-2 pb-2 ${session?.user?.darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-purple-200'}`}
										>
											{category}
										</h2>
										<div className="space-y-3 sm:space-y-4">
											{groupedInfos[category].map((info) => (
												<InfoCard
													key={info.id}
													info={info}
													session={session}
													viewMode={viewMode}
													canEdit={canEdit}
													onEdit={openEditDialog}
													onDelete={handleDeleteInfo}
													formatDate={formatDate}
												/>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Edit Dialog */}
					<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
						<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Edit Information</DialogTitle>
							</DialogHeader>
							<Form {...editForm}>
								<form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
									{editForm.formState.errors.root && (
										<div className="text-sm text-red-600 bg-red-50 p-3 rounded">{editForm.formState.errors.root.message}</div>
									)}

									<FormField
										control={editForm.control}
										name="title"
										rules={{ required: 'Title is required' }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="description"
										rules={{ required: 'Description is required' }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea {...field} placeholder="Brief description of this information..." rows={2} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="category"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Category</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="General">General</SelectItem>
														<SelectItem value="World Lore">World Lore</SelectItem>
														<SelectItem value="Character Creation">Character Creation</SelectItem>
														<SelectItem value="Setting">Setting</SelectItem>
														<SelectItem value="NPCs">NPCs</SelectItem>
														<SelectItem value="Locations">Locations</SelectItem>
														<SelectItem value="History">History</SelectItem>
														<SelectItem value="Culture">Culture</SelectItem>
														<SelectItem value="Religion">Religion</SelectItem>
														<SelectItem value="Politics">Politics</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="order"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Order (for sorting within category)</FormLabel>
												<FormControl>
													<Input {...field} type="number" min="0" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="body"
										rules={{ required: 'Body content is required' }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Content (Markdown Supported)</FormLabel>
												<FormControl>
													<Textarea {...field} placeholder="Enter detailed information here..." rows={10} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex justify-end gap-2 pt-4">
										<Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
											Cancel
										</Button>
										<Button type="submit" disabled={editForm.formState.isSubmitting}>
											{editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
										</Button>
									</div>
								</form>
							</Form>
						</DialogContent>
					</Dialog>

					{/* Create Info Dialog */}
					<CreateInfoDialog
						open={createDialogOpen}
						onOpenChange={setCreateDialogOpen}
						form={createForm}
						onSubmit={onCreateSubmit}
						session={session}
					/>

					{/* Set Background Dialog */}
					<SetBackgroundDialog
						open={backgroundDialogOpen}
						onOpenChange={setBackgroundDialogOpen}
						form={backgroundForm}
						onSubmit={handleBackgroundSubmit}
						onClear={handleClearBackground}
						session={session}
					/>
				</div>
			</div>
		</>
	);
}
