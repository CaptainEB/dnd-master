'use client';

import { createMapPost, deleteMapPost, getMapPosts, updateMapPost } from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, ImageIcon, Plus, Trash2, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function MapPage() {
	const { data: session } = useSession();
	const [mapPosts, setMapPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [editingMapPost, setEditingMapPost] = useState(null);

	// State for tracking image load status
	const [imageLoadStatus, setImageLoadStatus] = useState({});

	// Form state
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		imageUrl: '',
	});

	// Load map posts
	const loadMapPosts = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

		try {
			setLoading(true);
			setError('');
			const response = await getMapPosts(session.user.activeCampaignId);

			if (response.success) {
				setMapPosts(response.data || []);
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
		const membership = session.user.campaignMembers?.find((member) => member.campaignId === session.user.activeCampaignId);
		return membership?.role === 'DM';
	};

	// Check if user can create
	const canCreate = () => {
		if (!session?.user) return false;
		if (session.user.role === 'ADMIN') return true;

		// Check if user is DM
		const membership = session.user.campaignMembers?.find((member) => member.campaignId === session.user.activeCampaignId);
		return membership?.role === 'DM';
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
			<div className={`min-h-screen ${session?.user?.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center h-64">
						<div className={`text-lg ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading maps...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen ${session?.user?.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className={`text-3xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Maps</h1>
						<p className={`mt-2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>View and manage campaign maps and updates</p>
					</div>
					{canCreate() && (
						<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
							<DialogTrigger asChild>
								<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
									<Plus size={20} className="mr-2" />
									Add Map
								</Button>
							</DialogTrigger>
							<DialogContent className={`max-w-2xl ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
								<DialogHeader>
									<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-900'}>Add New Map</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleCreateMapPost} className="space-y-6">
									{error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}

									<div>
										<Label className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>Title *</Label>
										<Input
											value={formData.title}
											onChange={(e) => setFormData({ ...formData, title: e.target.value })}
											className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}
											placeholder="Map title..."
											required
										/>
									</div>

									<div>
										<Label className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>Image URL *</Label>
										<Input
											value={formData.imageUrl}
											onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
											className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}
											placeholder="https://..."
											required
										/>
									</div>

									<div>
										<Label className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>Description</Label>
										<Textarea
											value={formData.description}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}
											placeholder="Map description or notes..."
											rows={3}
										/>
									</div>

									<div className="flex justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowCreateDialog(false);
												resetForm();
												setError('');
											}}
											className={session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}
										>
											Cancel
										</Button>
										<Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
											Create Map Post
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Error Display */}
				{error && <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}

				{/* Map Posts */}
				{mapPosts.length === 0 ? (
					<Card className={session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<ImageIcon size={48} className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'} />
							<h3 className={`mt-4 text-lg font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>No maps yet</h3>
							<p className={`mt-2 text-center ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
								{canCreate() ? 'Create your first map post to get started!' : 'No maps have been shared yet.'}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-6">
						{mapPosts.map((mapPost) => (
							<Card
								key={mapPost.id}
								className={`overflow-hidden ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
							>
								<CardHeader className="pb-4">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className={`text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{mapPost.title}</CardTitle>
											<div className={`flex items-center gap-2 mt-2 text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
												<User size={14} />
												<span>
													{(mapPost.author?.campaignMembers && mapPost.author.campaignMembers[0]?.characterName) ||
														mapPost.author?.username ||
														mapPost.author?.email?.split('@')[0] ||
														'Unknown User'}
												</span>
												<span>•</span>
												<span>{new Date(mapPost.createdAt).toLocaleDateString()}</span>
											</div>
										</div>
										{canEditDelete(mapPost) && (
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditDialog(mapPost)}
													className={`${
														session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
													}`}
												>
													<Edit size={16} />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDeleteMapPost(mapPost.id)}
													className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
												>
													<Trash2 size={16} />
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									{mapPost.description && (
										<p className={`mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{mapPost.description}</p>
									)}
									<div
										className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200"
										onClick={() => openImageModal(mapPost)}
									>
										<div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
											{mapPost.imageUrl && <img src={mapPost.imageUrl} alt={mapPost.title} className="w-full h-full object-cover" />}
										</div>
										{/* Removed the black overlay that was covering the image */}
										<div className="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
											<div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg pointer-events-auto">
												Click to enlarge
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Edit Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className={`max-w-2xl ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
						<DialogHeader>
							<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-900'}>Edit Map Post</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleEditMapPost} className="space-y-6">
							{error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}

							<div>
								<Label className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>Title *</Label>
								<Input
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}
									placeholder="Map title..."
									required
								/>
							</div>

							<div>
								<Label className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>Image URL *</Label>
								<Input
									value={formData.imageUrl}
									onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
									className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}
									placeholder="https://..."
									required
								/>
							</div>

							<div>
								<Label className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>Description</Label>
								<Textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-blue-200'}
									placeholder="Map description or notes..."
									rows={3}
								/>
							</div>

							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowEditDialog(false);
										setEditingMapPost(null);
										resetForm();
										setError('');
									}}
									className={session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}
								>
									Cancel
								</Button>
								<Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
									Update Map Post
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>

				{/* Image Modal */}
				<Dialog open={showImageModal} onOpenChange={setShowImageModal}>
					<DialogContent className="max-w-[98vw] max-h-[98vh] p-4 border-0 bg-transparent flex items-center justify-center">
						<DialogHeader className="sr-only">
							<DialogTitle>View Map Image</DialogTitle>
						</DialogHeader>
						{selectedImage && (
							<div className="relative flex items-center justify-center">
								<button
									onClick={() => setShowImageModal(false)}
									className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
									aria-label="Close modal"
								>
									<X size={20} className="text-white" />
								</button>
								{selectedImage.imageUrl ? (
									<img
										src={selectedImage.imageUrl}
										alt={selectedImage.title}
										className="object-contain rounded-lg mx-auto"
										style={{
											minWidth: '80vw',
											minHeight: '70vh',
											maxWidth: '95vw',
											maxHeight: '90vh',
											width: 'auto',
											height: 'auto',
										}}
										onError={(e) => {
											e.target.style.display = 'none';
											e.target.nextSibling.style.display = 'flex';
										}}
									/>
								) : null}
								<div className="hidden w-full h-96 bg-gray-800 rounded-lg">{getFallbackImage(selectedImage.title)}</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
