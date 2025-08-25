'use client';

import { createMapPost, deleteMapPost, getMapPosts, updateMapPost } from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, ImageIcon, Plus, Search, Trash2, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function MapPage() {
	const { data: session } = useSession();
	const [mapPosts, setMapPosts] = useState([]);
	const [filteredMapPosts, setFilteredMapPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [editingMapPost, setEditingMapPost] = useState(null);

	// Search and filtering states
	const [searchTerm, setSearchTerm] = useState('');
	const [tagFilter, setTagFilter] = useState('all');

	// State for tracking image load status
	const [imageLoadStatus, setImageLoadStatus] = useState({});

	// Form state
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		imageUrl: '',
		tags: [],
	});

	const [tagInput, setTagInput] = useState('');

	// Load map posts
	const loadMapPosts = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

		try {
			setLoading(true);
			setError('');
			const response = await getMapPosts(session.user.activeCampaignId);

			if (response.success) {
				setMapPosts(response.data || []);
				setFilteredMapPosts(response.data || []);
			} else {
				setError(response.error || 'Failed to load map posts');
			}
		} catch (error) {
			console.error('Error loading map posts:', error);
			setError('Failed to load map posts');
		} finally {
			setLoading(false);
		}
	}, [session?.user?.activeCampaignId]);

	// Filter map posts based on search and tags
	useEffect(() => {
		let filtered = mapPosts;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(mapPost) =>
					mapPost.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					mapPost.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					mapPost.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		// Tag filter
		if (tagFilter && tagFilter !== 'all') {
			filtered = filtered.filter((mapPost) => mapPost.tags?.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase())));
		}

		setFilteredMapPosts(filtered);
	}, [mapPosts, searchTerm, tagFilter]);

	// Get all unique tags from all map posts
	const getAllTags = () => {
		const allTags = new Set();
		mapPosts.forEach((mapPost) => {
			mapPost.tags?.forEach((tag) => allTags.add(tag));
		});
		return Array.from(allTags).sort();
	};

	// Load data on mount and when session changes
	useEffect(() => {
		if (session?.user?.activeCampaignId) {
			loadMapPosts();
		}
	}, [session?.user?.activeCampaignId, loadMapPosts]);

	// Reset form
	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			imageUrl: '',
			tags: [],
		});
		setTagInput('');
	};

	// Add tag
	const addTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, tagInput.trim()],
			});
			setTagInput('');
		}
	};

	// Remove tag
	const removeTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	// Handle create map post
	const handleCreateMapPost = async (e) => {
		e.preventDefault();
		if (!session?.user?.activeCampaignId) return;

		try {
			setError('');
			const response = await createMapPost({
				...formData,
				campaignId: session.user.activeCampaignId,
			});

			if (response.success) {
				setShowCreateDialog(false);
				resetForm();
				loadMapPosts();
			} else {
				setError(response.error || 'Failed to create map post');
			}
		} catch (error) {
			console.error('Error creating map post:', error);
			setError('Failed to create map post');
		}
	};

	// Handle edit map post
	const handleEditMapPost = async (e) => {
		e.preventDefault();
		if (!editingMapPost) return;

		try {
			setError('');
			const response = await updateMapPost(editingMapPost.id, formData);

			if (response.success) {
				setShowEditDialog(false);
				setEditingMapPost(null);
				resetForm();
				loadMapPosts();
			} else {
				setError(response.error || 'Failed to update map post');
			}
		} catch (error) {
			console.error('Error updating map post:', error);
			setError('Failed to update map post');
		}
	};

	// Handle delete map post
	const handleDeleteMapPost = async (mapPostId) => {
		if (!confirm('Are you sure you want to delete this map post?')) return;

		try {
			setError('');
			const response = await deleteMapPost(mapPostId);

			if (response.success) {
				loadMapPosts();
			} else {
				setError(response.error || 'Failed to delete map post');
			}
		} catch (error) {
			console.error('Error deleting map post:', error);
			setError('Failed to delete map post');
		}
	};

	// Open edit dialog
	const openEditDialog = (mapPost) => {
		setEditingMapPost(mapPost);
		setFormData({
			title: mapPost.title,
			description: mapPost.description || '',
			imageUrl: mapPost.imageUrl,
			tags: mapPost.tags || [],
		});
		setShowEditDialog(true);
	};

	// Open image modal
	const openImageModal = (mapPost) => {
		setSelectedImage(mapPost);
		setShowImageModal(true);
	};

	// Check if user can edit/delete
	const canEditDelete = (mapPost) => {
		if (!session?.user) return false;
		if (session.user.role === 'ADMIN') return true;
		if (mapPost.authorId === session.user.id) return true;

		// Check if user is DM
		return session?.user?.campaignRole === 'DM';
	};

	// Check if user can create
	const canCreate = () => {
		if (!session?.user) return false;
		if (session.user.role === 'ADMIN') return true;

		// Check if user is DM
		return session?.user?.campaignRole === 'DM';
	};

	// Generate fallback image
	const getFallbackImage = (title) => {
		const firstLetter = title.charAt(0).toUpperCase();
		const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
		const colorIndex = title.charCodeAt(0) % colors.length;

		return (
			<div className={`w-full h-64 flex items-center justify-center ${colors[colorIndex]} text-white`}>
				<div className="text-center">
					<ImageIcon size={48} className="mx-auto mb-2" />
					<div className="text-2xl font-bold">{firstLetter}</div>
					<div className="text-sm opacity-75">Image not available</div>
				</div>
			</div>
		);
	};

	if (loading) {
		return (
			<div className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
				<div className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
					<div className="flex items-center justify-center h-48 sm:h-64">
						<div className={`flex flex-col items-center gap-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							<div
								className={`animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 ${session?.user?.darkMode ? 'border-purple-400' : 'border-purple-600'}`}
							></div>
							<span className="text-sm sm:text-lg">Loading maps...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
			<div className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
					<div className="min-w-0 flex-1">
						<h1 className={`text-2xl sm:text-3xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Maps</h1>
						<p className={`mt-1 sm:mt-2 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
							View and manage campaign maps and updates
						</p>
					</div>
					{canCreate() && (
						<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
							<DialogTrigger asChild>
								<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto">
									<Plus size={16} className="sm:w-5 sm:h-5 mr-2" />
									Add Map
								</Button>
							</DialogTrigger>
							<DialogContent
								className={`max-w-[95vw] sm:max-w-2xl ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
							>
								<DialogHeader className="space-y-2">
									<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Map</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleCreateMapPost} className="space-y-4 sm:space-y-6">
									{error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>}

									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Title *</Label>
										<Input
											value={formData.title}
											onChange={(e) => setFormData({ ...formData, title: e.target.value })}
											className={`mt-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
											placeholder="Map title..."
											required
										/>
									</div>

									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Image URL *</Label>
										<Input
											value={formData.imageUrl}
											onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
											className={`mt-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
											placeholder="https://..."
											required
										/>
									</div>

									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</Label>
										<Textarea
											value={formData.description}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											className={`mt-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
											placeholder="Map description or notes..."
											rows={3}
										/>
									</div>

									{/* Tags Section */}
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tags</Label>
										<div className="mt-1 space-y-2">
											<div className="flex flex-col sm:flex-row gap-2">
												<Input
													value={tagInput}
													onChange={(e) => setTagInput(e.target.value)}
													placeholder="Add a tag..."
													className={`flex-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
													onKeyPress={(e) => {
														if (e.key === 'Enter') {
															e.preventDefault();
															addTag();
														}
													}}
												/>
												<Button type="button" onClick={addTag} variant="outline" className="w-full sm:w-auto">
													Add
												</Button>
											</div>
											<div className="flex flex-wrap gap-1">
												{formData.tags.map((tag, index) => (
													<Badge
														key={index}
														variant="secondary"
														className={`text-xs cursor-pointer ${session?.user?.darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
														onClick={() => removeTag(tag)}
													>
														{tag}
														<X size={12} className="ml-1" />
													</Badge>
												))}
											</div>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowCreateDialog(false);
												resetForm();
												setError('');
											}}
											className={`w-full sm:w-auto ${session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
										>
											Create Map Post
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm sm:text-base">{error}</div>
				)}

				{/* Search and Filter Controls */}
				<div className="mb-6 sm:mb-8 space-y-4">
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						{/* Search Input */}
						<div className="flex-1">
							<div className="relative">
								<Search
									size={16}
									className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
								/>
								<Input
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Search maps by title, description, or tags..."
									className={`pl-10 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'}`}
								/>
							</div>
						</div>

						{/* Tag Filter Dropdown */}
						<div className="w-full sm:w-48">
							<Select value={tagFilter} onValueChange={setTagFilter}>
								<SelectTrigger
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
								>
									<SelectValue placeholder="Filter by tag" />
								</SelectTrigger>
								<SelectContent className={session?.user?.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}>
									<SelectItem value="all" className={session?.user?.darkMode ? 'text-white hover:bg-gray-700' : 'hover:bg-gray-50'}>
										All tags
									</SelectItem>
									{getAllTags().map((tag) => (
										<SelectItem key={tag} value={tag} className={session?.user?.darkMode ? 'text-white hover:bg-gray-700' : 'hover:bg-gray-50'}>
											{tag}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Active Filters */}
					{(searchTerm || (tagFilter && tagFilter !== 'all')) && (
						<div className="flex flex-wrap items-center gap-2">
							<span className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active filters:</span>
							{searchTerm && (
								<Badge
									variant="secondary"
									className={`text-xs cursor-pointer ${session?.user?.darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
									onClick={() => setSearchTerm('')}
								>
									Search: "{searchTerm}"
									<X size={12} className="ml-1" />
								</Badge>
							)}
							{tagFilter && tagFilter !== 'all' && (
								<Badge
									variant="secondary"
									className={`text-xs cursor-pointer ${session?.user?.darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
									onClick={() => setTagFilter('all')}
								>
									Tag: {tagFilter}
									<X size={12} className="ml-1" />
								</Badge>
							)}
						</div>
					)}

					{/* Results count */}
					<div className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
						Showing {filteredMapPosts.length} of {mapPosts.length} maps
					</div>
				</div>

				{/* Map Posts */}
				{filteredMapPosts.length === 0 ? (
					<Card className={session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
						<CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
							<ImageIcon size={40} className={`sm:w-12 sm:h-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
							<h3 className={`mt-3 sm:mt-4 text-base sm:text-lg font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
								{mapPosts.length === 0 ? 'No maps yet' : 'No maps found'}
							</h3>
							<p className={`mt-2 text-center text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
								{mapPosts.length === 0
									? canCreate()
										? 'Create your first map post to get started!'
										: 'No maps have been shared yet.'
									: 'Try adjusting your search or filter criteria.'}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4 sm:space-y-6">
						{filteredMapPosts.map((mapPost) => (
							<Card
								key={mapPost.id}
								className={`overflow-hidden ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
							>
								<CardHeader className="pb-3 sm:pb-4">
									<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
										<div className="min-w-0 flex-1">
											<CardTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
												{mapPost.title}
											</CardTitle>
											<div
												className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
											>
												<div className="flex items-center gap-1">
													<User size={12} className="sm:w-3.5 sm:h-3.5" />
													<span>
														{(mapPost.author?.campaignMembers && mapPost.author.campaignMembers[0]?.characterName) ||
															mapPost.author?.username ||
															mapPost.author?.email?.split('@')[0] ||
															'Unknown User'}
													</span>
												</div>
												<span className="hidden sm:inline">•</span>
												<span>{new Date(mapPost.createdAt).toLocaleDateString()}</span>
											</div>
										</div>
										{canEditDelete(mapPost) && (
											<div className="flex gap-2 shrink-0">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditDialog(mapPost)}
													className={`${
														session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
													}`}
												>
													<Edit size={14} className="sm:w-4 sm:h-4" />
													<span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDeleteMapPost(mapPost.id)}
													className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
												>
													<Trash2 size={14} className="sm:w-4 sm:h-4" />
													<span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									{mapPost.description && (
										<p className={`mb-3 sm:mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
											{mapPost.description}
										</p>
									)}

									{/* Tags */}
									{mapPost.tags && mapPost.tags.length > 0 && (
										<div className="mb-3 sm:mb-4">
											<div className="flex flex-wrap gap-1 sm:gap-2">
												{mapPost.tags.map((tag, index) => (
													<Badge
														key={index}
														variant="secondary"
														className={`text-xs cursor-pointer ${session?.user?.darkMode ? 'bg-blue-900/50 text-blue-200 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
														onClick={() => setTagFilter(tag)}
													>
														{tag}
													</Badge>
												))}
											</div>
										</div>
									)}

									<div
										className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg transition-shadow duration-200"
										onClick={() => openImageModal(mapPost)}
									>
										<div className="w-full h-48 sm:h-64 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
											{mapPost.imageUrl && <img src={mapPost.imageUrl} alt={mapPost.title} className="w-full h-full object-cover" />}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Edit Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent
						className={`max-w-[95vw] sm:max-w-2xl ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
					>
						<DialogHeader className="space-y-2">
							<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Map Post</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleEditMapPost} className="space-y-4 sm:space-y-6">
							{error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>}

							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Title *</Label>
								<Input
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className={`mt-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
									placeholder="Map title..."
									required
								/>
							</div>

							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Image URL *</Label>
								<Input
									value={formData.imageUrl}
									onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
									className={`mt-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
									placeholder="https://..."
									required
								/>
							</div>

							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</Label>
								<Textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className={`mt-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
									placeholder="Map description or notes..."
									rows={3}
								/>
							</div>

							{/* Tags Section */}
							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tags</Label>
								<div className="mt-1 space-y-2">
									<div className="flex flex-col sm:flex-row gap-2">
										<Input
											value={tagInput}
											onChange={(e) => setTagInput(e.target.value)}
											placeholder="Add a tag..."
											className={`flex-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}`}
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addTag();
												}
											}}
										/>
										<Button type="button" onClick={addTag} variant="outline" className="w-full sm:w-auto">
											Add
										</Button>
									</div>
									<div className="flex flex-wrap gap-1">
										{formData.tags.map((tag, index) => (
											<Badge
												key={index}
												variant="secondary"
												className={`text-xs cursor-pointer ${session?.user?.darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
												onClick={() => removeTag(tag)}
											>
												{tag}
												<X size={12} className="ml-1" />
											</Badge>
										))}
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowEditDialog(false);
										setEditingMapPost(null);
										resetForm();
										setError('');
									}}
									className={`w-full sm:w-auto ${session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
								>
									Update Map Post
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>

				{/* Image Modal */}
				<Dialog open={showImageModal} onOpenChange={setShowImageModal}>
					<DialogContent className="!fixed !inset-0 !z-50 !max-w-none !max-h-none !w-screen !h-screen !p-0 !m-0 !border-0 !bg-black/60 !flex !items-center !justify-center !translate-x-0 !translate-y-0 !top-0 !left-0 !rounded-none !gap-0">
						<DialogHeader className="sr-only">
							<DialogTitle>View Map Image</DialogTitle>
						</DialogHeader>
						{selectedImage && (
							<>
								{/* Close button - fixed position */}
								<button
									onClick={() => setShowImageModal(false)}
									className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
									aria-label="Close modal"
								>
									<X size={20} className="text-white" />
								</button>

								{/* Backdrop - full screen, clicking closes the modal */}
								<div
									className="fixed inset-0 cursor-pointer bg-black/90 flex items-center justify-center"
									onClick={() => setShowImageModal(false)}
									aria-label="Close modal"
								>
									{/* Image - natural sizing within viewport */}
									{selectedImage.imageUrl ? (
										<img
											src={selectedImage.imageUrl}
											alt={selectedImage.title}
											className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-zoom-out"
											onClick={(e) => {
												e.stopPropagation();
												setShowImageModal(false);
											}}
											onError={(e) => {
												e.target.style.display = 'none';
												e.target.nextSibling.style.display = 'flex';
											}}
										/>
									) : null}
									<div className="hidden max-w-md h-64 bg-gray-800 rounded-lg shadow-2xl items-center justify-center">
										{getFallbackImage(selectedImage.title)}
									</div>
								</div>
							</>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
