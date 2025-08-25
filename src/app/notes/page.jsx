'use client';

import { createCampaignNote, deleteCampaignNote, getCampaignMembers, getCampaignNotes, updateCampaignNote } from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Edit, Plus, Save, Search, Tag, Trash2, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function NotesPage() {
	const { data: session } = useSession();
	const [mounted, setMounted] = useState(false);
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [tagFilter, setTagFilter] = useState('');
	const [authorFilter, setAuthorFilter] = useState('');
	const [availableTags, setAvailableTags] = useState([]);
	const [campaignMembers, setCampaignMembers] = useState([]);
	const [pagination, setPagination] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	const [activeTab, setActiveTab] = useState('my-notes'); // Track which tab is active

	// Form states
	const [showNewNoteForm, setShowNewNoteForm] = useState(false);
	const [editingNote, setEditingNote] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		tags: [],
		isShared: false,
	});
	const [newTag, setNewTag] = useState('');

	useEffect(() => {
		setMounted(true);
	}, []);

	const loadNotes = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

		setLoading(true);
		try {
			const result = await getCampaignNotes(session.user.activeCampaignId, currentPage, 20, searchQuery, tagFilter, authorFilter);

			if (result.success) {
				setNotes(result.data.notes);
				setPagination(result.data.pagination);
				setAvailableTags(result.data.availableTags);
				setError('');
			} else {
				setError(result.error || 'Failed to load notes');
			}
		} catch (err) {
			setError('Failed to load notes');
			console.error('Error loading notes:', err);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.activeCampaignId, currentPage, searchQuery, tagFilter, authorFilter]);

	useEffect(() => {
		if (mounted && session?.user?.activeCampaignId) {
			loadNotes();
			loadCampaignMembers();
		}
	}, [mounted, loadNotes]);

	const loadCampaignMembers = async () => {
		if (!session?.user?.activeCampaignId) return;

		try {
			const result = await getCampaignMembers(session.user.activeCampaignId);
			if (result.success) {
				setCampaignMembers(result.data);
			}
		} catch (err) {
			console.error('Error loading campaign members:', err);
		}
	};

	const handleCreateNote = async (e) => {
		e.preventDefault();

		if (!formData.content.trim()) {
			setError('Note content is required');
			return;
		}

		try {
			const result = await createCampaignNote(session.user.activeCampaignId, formData);

			if (result.success) {
				setFormData({ title: '', content: '', tags: [], isShared: false });
				setShowNewNoteForm(false);
				setError('');
				await loadNotes();
			} else {
				setError(result.error || 'Failed to create note');
			}
		} catch (err) {
			setError('Failed to create note');
			console.error('Error creating note:', err);
		}
	};

	const handleUpdateNote = async (e) => {
		e.preventDefault();

		if (!formData.content.trim()) {
			setError('Note content is required');
			return;
		}

		try {
			const result = await updateCampaignNote(editingNote.id, formData);

			if (result.success) {
				setEditingNote(null);
				setFormData({ title: '', content: '', tags: [], isShared: false });
				setError('');
				await loadNotes();
			} else {
				setError(result.error || 'Failed to update note');
			}
		} catch (err) {
			setError('Failed to update note');
			console.error('Error updating note:', err);
		}
	};

	const handleDeleteNote = async (noteId) => {
		if (!confirm('Are you sure you want to delete this note?')) return;

		try {
			const result = await deleteCampaignNote(noteId);

			if (result.success) {
				setError('');
				await loadNotes();
			} else {
				setError(result.error || 'Failed to delete note');
			}
		} catch (err) {
			setError('Failed to delete note');
			console.error('Error deleting note:', err);
		}
	};

	const startEditing = (note) => {
		setEditingNote(note);
		setFormData({
			title: note.title || '',
			content: note.content,
			tags: note.tags || [],
			isShared: note.isShared || false,
		});
		setShowNewNoteForm(false);
	};

	const cancelEditing = () => {
		setEditingNote(null);
		setFormData({ title: '', content: '', tags: [], isShared: false });
	};

	const addTag = () => {
		if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, newTag.trim()],
			});
			setNewTag('');
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleSearch = () => {
		setCurrentPage(1);
		loadNotes();
	};

	const formatDate = (date) => {
		if (!date) return '';
		try {
			return new Date(date).toLocaleDateString('en-US', {
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

	// Check if current user can edit/delete a note
	const canEditNote = (note) => {
		if (!session?.user) return false;

		// User is the note author
		if (note.authorId === session.user.id) {
			return true;
		}

		// User is a site admin
		if (session.user.role === 'ADMIN') {
			return true;
		}

		// User is a DM in the current campaign
		if (session.user.campaignRole === 'DM') {
			return true;
		}

		// Note is shared and user is a campaign member
		if (note.isShared) {
			return true; // Any campaign member can edit shared notes
		}

		return false;
	};

	// Filter notes based on active tab
	const getFilteredNotes = () => {
		if (activeTab === 'shared-notes') {
			return notes.filter((note) => note.isShared);
		} else {
			// My notes - show personal notes (either authored by user or shared)
			return notes.filter((note) => !note.isShared || note.authorId === session.user.id);
		}
	};

	if (!mounted) {
		return <div>Loading...</div>;
	}

	if (!session?.user?.activeCampaignId) {
		return (
			<div
				className={`min-h-screen pt-16 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
					session?.user?.darkMode
						? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
						: 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
				}`}
			>
				<div className="max-w-4xl mx-auto">
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-6">
							<div className="text-center py-6 sm:py-8">
								<Tag className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-4" />
								<h2 className={`text-lg sm:text-2xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
									No Active Campaign
								</h2>
								<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									Please select an active campaign to view and manage your notes.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen pt-16 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
					<div className="min-w-0 flex-1">
						<h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
							Campaign Notes
						</h1>
						<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							Campaign notes for{' '}
							<span className={`font-semibold ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
								{session.user.activeCampaignName}
							</span>
						</p>
					</div>

					{/* New Note Button */}
					<Button
						onClick={() => {
							setShowNewNoteForm(true);
							setEditingNote(null);
							setFormData({ title: '', content: '', tags: [], isShared: false });
						}}
						className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg w-full sm:w-auto"
					>
						<Plus className="h-4 w-4 mr-2" />
						<span className="sm:inline">New Note</span>
					</Button>
				</div>

				{/* Error Display */}
				{error && (
					<Card className="mb-4 sm:mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm shadow-lg">
						<CardContent className="pt-4 sm:pt-6">
							<p className="text-red-600 text-sm sm:text-base">{error}</p>
						</CardContent>
					</Card>
				)}

				{/* Search and Filter Controls */}
				<Card className={`mb-4 sm:mb-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<CardHeader className="pb-3 sm:pb-6">
						<CardTitle className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Search & Filter</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4">
							<div className="w-full">
								<Label htmlFor="search" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
									Search notes
								</Label>
								<div className="flex gap-2 mt-1">
									<Input
										id="search"
										placeholder="Search by title or content..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
									/>
									<Button
										onClick={handleSearch}
										size="sm"
										className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 sm:px-4"
									>
										<Search className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="tagFilter" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Filter by tag
									</Label>
									<Select
										value={tagFilter || 'all'}
										onValueChange={(value) => {
											setTagFilter(value === 'all' ? '' : value);
											setCurrentPage(1);
										}}
									>
										<SelectTrigger className="w-full mt-1">
											<SelectValue placeholder="All tags" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All tags</SelectItem>
											{availableTags.map((tag) => (
												<SelectItem key={tag} value={tag}>
													{tag}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="authorFilter" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Filter by author
									</Label>
									<Select
										value={authorFilter || 'all'}
										onValueChange={(value) => {
											setAuthorFilter(value === 'all' ? '' : value);
											setCurrentPage(1);
										}}
									>
										<SelectTrigger className="w-full mt-1">
											<SelectValue placeholder="All authors" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All authors</SelectItem>
											{campaignMembers.map((member) => (
												<SelectItem key={member.user.id} value={member.user.id}>
													{member.characterName || 'Player'}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* New Note Form */}
				{showNewNoteForm && (
					<Card
						className={`mb-4 sm:mb-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50'}`}
					>
						<CardHeader className="pb-3 sm:pb-6">
							<CardTitle className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Create New Note</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleCreateNote} className="space-y-4">
								<div>
									<Label htmlFor="newTitle" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Title (optional)
									</Label>
									<Input
										id="newTitle"
										placeholder="Enter note title..."
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="newContent" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Content *
									</Label>
									<Textarea
										id="newContent"
										placeholder="Enter your note content..."
										value={formData.content}
										onChange={(e) => setFormData({ ...formData, content: e.target.value })}
										className="min-h-24 sm:min-h-32 max-h-48 sm:max-h-64 resize-y border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base mt-1"
										required
									/>
								</div>
								<div>
									<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Tags</Label>
									<div className="flex gap-2 mt-1 mb-2">
										<Input
											placeholder="Add a tag..."
											value={newTag}
											onChange={(e) => setNewTag(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
											className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
										/>
										<Button
											type="button"
											onClick={addTag}
											size="sm"
											className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 sm:px-4"
										>
											<Tag className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{formData.tags.map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="cursor-pointer hover:bg-red-100 text-xs sm:text-sm"
												onClick={() => removeTag(tag)}
											>
												{tag} <X className="h-3 w-3 ml-1" />
											</Badge>
										))}
									</div>
								</div>
								<div>
									<div className="flex items-center space-x-3">
										<input
											type="checkbox"
											id="isShared"
											checked={formData.isShared}
											onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
											className={`w-4 h-4 rounded border-2 focus:ring-2 focus:ring-purple-500 ${
												session?.user?.darkMode
													? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500'
													: 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500'
											}`}
										/>
										<Label
											htmlFor="isShared"
											className={`text-sm sm:text-base cursor-pointer ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
										>
											Allow everyone in the campaign to edit this note
										</Label>
									</div>
									<p className={`text-xs sm:text-sm mt-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
										Shared notes appear in the "Shared Notes" tab and can be edited by all campaign members.
									</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4">
									<Button
										type="submit"
										className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto"
									>
										<Save className="h-4 w-4 mr-2" />
										Save Note
									</Button>
									<Button
										type="button"
										variant="outline"
										className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
										onClick={() => setShowNewNoteForm(false)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				{/* Notes List with Tabs */}
				{loading ? (
					<div className="text-center py-8 sm:py-12">
						<div className={`flex flex-col items-center gap-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							<div
								className={`animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 ${session?.user?.darkMode ? 'border-purple-400' : 'border-purple-600'}`}
							></div>
							<span className="text-sm sm:text-base">Loading notes...</span>
						</div>
					</div>
				) : (
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-4 sm:pt-6">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className={`grid w-full grid-cols-2 ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
									<TabsTrigger
										value="my-notes"
										className={`${
											session?.user?.darkMode
												? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white'
												: 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
										}`}
									>
										My Notes
									</TabsTrigger>
									<TabsTrigger
										value="shared-notes"
										className={`${
											session?.user?.darkMode
												? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white'
												: 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
										}`}
									>
										Shared Notes
									</TabsTrigger>
								</TabsList>

								<TabsContent value="my-notes" className="mt-4 sm:mt-6">
									{getFilteredNotes().length === 0 ? (
										<div className="text-center py-6 sm:py-8">
											<Tag className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-4" />
											<h3 className={`text-lg sm:text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												{searchQuery || tagFilter || authorFilter ? 'No Notes Found' : 'No Personal Notes Yet'}
											</h3>
											<p className={`mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
												{searchQuery || tagFilter || authorFilter
													? 'No personal notes found matching your filter criteria.'
													: 'Create your first personal note to get started!'}
											</p>
										</div>
									) : (
										<div className="space-y-4 sm:space-y-6">
											{getFilteredNotes().map((note) => (
												<Card
													key={note.id}
													className={`border-0 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-200 ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}
												>
													{editingNote?.id === note.id ? (
														<CardContent className="pt-4 sm:pt-6">
															<form onSubmit={handleUpdateNote} className="space-y-4">
																<div>
																	<Label
																		htmlFor="editTitle"
																		className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
																	>
																		Title (optional)
																	</Label>
																	<Input
																		id="editTitle"
																		placeholder="Enter note title..."
																		value={formData.title}
																		onChange={(e) => setFormData({ ...formData, title: e.target.value })}
																		className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base mt-1"
																	/>
																</div>
																<div>
																	<Label
																		htmlFor="editContent"
																		className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
																	>
																		Content *
																	</Label>
																	<Textarea
																		id="editContent"
																		placeholder="Enter your note content..."
																		value={formData.content}
																		onChange={(e) => setFormData({ ...formData, content: e.target.value })}
																		className="min-h-24 sm:min-h-32 max-h-48 sm:max-h-64 resize-y border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base mt-1"
																		required
																	/>
																</div>
																<div>
																	<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Tags</Label>
																	<div className="flex gap-2 mt-1 mb-2">
																		<Input
																			placeholder="Add a tag..."
																			value={newTag}
																			onChange={(e) => setNewTag(e.target.value)}
																			onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
																			className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
																		/>
																		<Button
																			type="button"
																			onClick={addTag}
																			size="sm"
																			className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 sm:px-4"
																		>
																			<Tag className="h-4 w-4" />
																		</Button>
																	</div>
																	<div className="flex flex-wrap gap-2">
																		{formData.tags.map((tag) => (
																			<Badge
																				key={tag}
																				variant="secondary"
																				className="cursor-pointer hover:bg-red-100 text-xs sm:text-sm"
																				onClick={() => removeTag(tag)}
																			>
																				{tag} <X className="h-3 w-3 ml-1" />
																			</Badge>
																		))}
																	</div>
																</div>
																<div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4">
																	<Button
																		type="submit"
																		className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto"
																	>
																		<Save className="h-4 w-4 mr-2" />
																		Save Changes
																	</Button>
																	<Button
																		type="button"
																		variant="outline"
																		className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
																		onClick={cancelEditing}
																	>
																		Cancel
																	</Button>
																</div>
															</form>
														</CardContent>
													) : (
														<>
															<CardHeader className="pb-3">
																<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
																	<div className="min-w-0 flex-1">
																		<CardTitle className={`text-lg sm:text-xl mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
																			{note.title || 'Untitled Note'}
																		</CardTitle>
																		<CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
																			<span
																				className={`flex items-center gap-1 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}
																			>
																				<User className="h-3 w-3 sm:h-4 sm:w-4" />
																				{note.author.characterName || note.author.email?.split('@')[0] || 'Unknown User'}
																			</span>
																			{note.isShared && (
																				<Badge variant="outline" className="text-xs text-green-600 border-green-200">
																					Shared
																				</Badge>
																			)}
																			<span className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
																				<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
																				{formatDate(note.createdAt)}
																			</span>
																			{note.updatedAt !== note.createdAt && (
																				<span className="text-gray-400 text-xs">(Updated {formatDate(note.updatedAt)})</span>
																			)}
																		</CardDescription>
																	</div>
																	{canEditNote(note) && (
																		<div className="flex gap-2 shrink-0">
																			<Button
																				variant="outline"
																				size="sm"
																				className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
																				onClick={() => startEditing(note)}
																			>
																				<Edit className="h-4 w-4" />
																				<span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
																			</Button>
																			<Button
																				variant="outline"
																				size="sm"
																				className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
																				onClick={() => handleDeleteNote(note.id)}
																			>
																				<Trash2 className="h-4 w-4" />
																				<span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
																			</Button>
																		</div>
																	)}
																</div>
															</CardHeader>
															<CardContent className="pt-0">
																<div
																	className={`p-3 sm:p-4 rounded-lg border mb-4 ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'}`}
																>
																	<p
																		className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}
																	>
																		{note.content}
																	</p>
																</div>
																{note.tags && note.tags.length > 0 && (
																	<div className="flex flex-wrap gap-2">
																		{note.tags.map((tag) => (
																			<Badge
																				key={tag}
																				variant="outline"
																				className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'border-purple-600 text-purple-400' : 'border-purple-200 text-purple-700'}`}
																			>
																				{tag}
																			</Badge>
																		))}
																	</div>
																)}
															</CardContent>
														</>
													)}
												</Card>
											))}
										</div>
									)}
								</TabsContent>

								<TabsContent value="shared-notes" className="mt-4 sm:mt-6">
									{notes.filter((note) => note.isShared).length === 0 ? (
										<div className="text-center py-6 sm:py-8">
											<Tag className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-4" />
											<h3 className={`text-lg sm:text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												No Shared Notes Yet
											</h3>
											<p className={`mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
												Shared notes can be edited by all campaign members. Create a note and check "Allow everyone to edit" to get started!
											</p>
										</div>
									) : (
										<div className="space-y-4 sm:space-y-6">
											{notes
												.filter((note) => note.isShared)
												.map((note) => (
													<Card
														key={note.id}
														className={`border-0 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-200 ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}
													>
														{editingNote?.id === note.id ? (
															<CardContent className="pt-4 sm:pt-6">
																<form onSubmit={handleUpdateNote} className="space-y-4">
																	<div>
																		<Label
																			htmlFor="editTitle"
																			className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
																		>
																			Title (optional)
																		</Label>
																		<Input
																			id="editTitle"
																			placeholder="Enter note title..."
																			value={formData.title}
																			onChange={(e) => setFormData({ ...formData, title: e.target.value })}
																			className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base mt-1"
																		/>
																	</div>
																	<div>
																		<Label
																			htmlFor="editContent"
																			className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
																		>
																			Content *
																		</Label>
																		<Textarea
																			id="editContent"
																			placeholder="Enter your note content..."
																			value={formData.content}
																			onChange={(e) => setFormData({ ...formData, content: e.target.value })}
																			className="min-h-24 sm:min-h-32 max-h-48 sm:max-h-64 resize-y border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base mt-1"
																			required
																		/>
																	</div>
																	<div>
																		<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Tags</Label>
																		<div className="flex gap-2 mt-1 mb-2">
																			<Input
																				placeholder="Add a tag..."
																				value={newTag}
																				onChange={(e) => setNewTag(e.target.value)}
																				onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
																				className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
																			/>
																			<Button
																				type="button"
																				onClick={addTag}
																				size="sm"
																				className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 sm:px-4"
																			>
																				<Tag className="h-4 w-4" />
																			</Button>
																		</div>
																		<div className="flex flex-wrap gap-2">
																			{formData.tags.map((tag) => (
																				<Badge
																					key={tag}
																					variant="secondary"
																					className="cursor-pointer hover:bg-red-100 text-xs sm:text-sm"
																					onClick={() => removeTag(tag)}
																				>
																					{tag} <X className="h-3 w-3 ml-1" />
																				</Badge>
																			))}
																		</div>
																	</div>
																	<div>
																		<div className="flex items-center space-x-3">
																			<input
																				type="checkbox"
																				id="editIsShared"
																				checked={formData.isShared}
																				onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
																				className={`w-4 h-4 rounded border-2 focus:ring-2 focus:ring-purple-500 ${
																					session?.user?.darkMode
																						? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500'
																						: 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500'
																				}`}
																			/>
																			<Label
																				htmlFor="editIsShared"
																				className={`text-sm sm:text-base cursor-pointer ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
																			>
																				Allow everyone in the campaign to edit this note
																			</Label>
																		</div>
																	</div>
																	<div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4">
																		<Button
																			type="submit"
																			className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto"
																		>
																			<Save className="h-4 w-4 mr-2" />
																			Update Note
																		</Button>
																		<Button
																			type="button"
																			variant="outline"
																			className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
																			onClick={cancelEditing}
																		>
																			Cancel
																		</Button>
																	</div>
																</form>
															</CardContent>
														) : (
															<>
																<CardHeader className="pb-3">
																	<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
																		<div className="min-w-0 flex-1">
																			<CardTitle className={`text-lg sm:text-xl mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
																				{note.title || 'Untitled Note'}
																			</CardTitle>
																			<CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
																				<span
																					className={`flex items-center gap-1 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}
																				>
																					<User className="h-3 w-3 sm:h-4 sm:w-4" />
																					{note.author.characterName || note.author.email?.split('@')[0] || 'Unknown User'}
																				</span>
																				<Badge variant="outline" className="text-xs text-green-600 border-green-200">
																					Shared
																				</Badge>
																				<span className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
																					<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
																					{formatDate(note.createdAt)}
																				</span>
																				{note.updatedAt !== note.createdAt && (
																					<span className="text-gray-400 text-xs">(Updated {formatDate(note.updatedAt)})</span>
																				)}
																			</CardDescription>
																		</div>
																		{canEditNote(note) && (
																			<div className="flex gap-2 shrink-0">
																				<Button
																					variant="outline"
																					size="sm"
																					className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
																					onClick={() => startEditing(note)}
																				>
																					<Edit className="h-4 w-4" />
																					<span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
																				</Button>
																				<Button
																					variant="outline"
																					size="sm"
																					className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
																					onClick={() => handleDeleteNote(note.id)}
																				>
																					<Trash2 className="h-4 w-4" />
																					<span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
																				</Button>
																			</div>
																		)}
																	</div>
																</CardHeader>
																<CardContent className="pt-0">
																	<div
																		className={`p-3 sm:p-4 rounded-lg border mb-4 ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'}`}
																	>
																		<p
																			className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}
																		>
																			{note.content}
																		</p>
																	</div>
																	{note.tags && note.tags.length > 0 && (
																		<div className="flex flex-wrap gap-2">
																			{note.tags.map((tag) => (
																				<Badge
																					key={tag}
																					variant="outline"
																					className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'border-purple-600 text-purple-400' : 'border-purple-200 text-purple-700'}`}
																				>
																					{tag}
																				</Badge>
																			))}
																		</div>
																	)}
																</CardContent>
															</>
														)}
													</Card>
												))}
										</div>
									)}
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				)}

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-4 mt-6 sm:mt-8">
						<Button
							variant="outline"
							className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
							onClick={() => setCurrentPage(pagination.page - 1)}
							disabled={!pagination.hasPrev}
						>
							Previous
						</Button>
						<div
							className={`backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border shadow-sm text-center ${session?.user?.darkMode ? 'bg-gray-700/80 border-gray-600' : 'bg-white/80 border-purple-100'}`}
						>
							<span className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total notes)
							</span>
						</div>
						<Button
							variant="outline"
							className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
							onClick={() => setCurrentPage(pagination.page + 1)}
							disabled={!pagination.hasNext}
						>
							Next
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
