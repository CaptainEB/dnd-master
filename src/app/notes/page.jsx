'use client';

import { createPersonalNote, deletePersonalNote, getPersonalNotes, updatePersonalNote } from '@/app/admin/components/actions';
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
	const [availableTags, setAvailableTags] = useState([]);
	const [pagination, setPagination] = useState({});
	const [currentPage, setCurrentPage] = useState(1);

	// Form states
	const [showNewNoteForm, setShowNewNoteForm] = useState(false);
	const [editingNote, setEditingNote] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		tags: [],
	});
	const [newTag, setNewTag] = useState('');

	useEffect(() => {
		setMounted(true);
	}, []);

	const loadNotes = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

		setLoading(true);
		try {
			const result = await getPersonalNotes(session.user.activeCampaignId, currentPage, 20, searchQuery, tagFilter);

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
	}, [session?.user?.activeCampaignId, currentPage, searchQuery, tagFilter]);

	useEffect(() => {
		if (mounted && session?.user?.activeCampaignId) {
			loadNotes();
		}
	}, [mounted, loadNotes]);

	const handleCreateNote = async (e) => {
		e.preventDefault();

		if (!formData.content.trim()) {
			setError('Note content is required');
			return;
		}

		try {
			const result = await createPersonalNote(session.user.activeCampaignId, formData);

			if (result.success) {
				setFormData({ title: '', content: '', tags: [] });
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
			const result = await updatePersonalNote(editingNote.id, formData);

			if (result.success) {
				setEditingNote(null);
				setFormData({ title: '', content: '', tags: [] });
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
			const result = await deletePersonalNote(noteId);

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
		});
		setShowNewNoteForm(false);
	};

	const cancelEditing = () => {
		setEditingNote(null);
		setFormData({ title: '', content: '', tags: [] });
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

	if (!mounted) {
		return <div>Loading...</div>;
	}

	if (!session?.user?.activeCampaignId) {
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
								<Tag className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h2 className={`text-2xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Active Campaign</h2>
								<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
			className={`min-h-screen pt-28 p-8 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className={`text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Campaign Notes</h1>
						<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							Your personal notes for{' '}
							<span className={`font-semibold ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
								{session.user.activeCampaignName}
							</span>
						</p>
					</div>

					{/* New Note Button */}
					<Button
						onClick={() => {
							setShowNewNoteForm(true);
							setEditingNote(null);
							setFormData({ title: '', content: '', tags: [] });
						}}
						className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
					>
						<Plus className="h-4 w-4 mr-2" />
						New Note
					</Button>
				</div>

				{/* Error Display */}
				{error && (
					<Card className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm shadow-lg">
						<CardContent className="pt-6">
							<p className="text-red-600">{error}</p>
						</CardContent>
					</Card>
				)}

				{/* Search and Filter Controls */}
				<Card className={`mb-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<CardHeader>
						<CardTitle className={`text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Search & Filter</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<Label htmlFor="search" className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
									Search notes
								</Label>
								<div className="flex gap-2 mt-1">
									<Input
										id="search"
										placeholder="Search by title or content..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
									/>
									<Button
										onClick={handleSearch}
										size="sm"
										className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
									>
										<Search className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="flex-1">
								<Label htmlFor="tagFilter" className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
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
						</div>
					</CardContent>
				</Card>

				{/* New Note Form */}
				{showNewNoteForm && (
					<Card
						className={`mb-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50'}`}
					>
						<CardHeader>
							<CardTitle className={`text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Create New Note</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleCreateNote} className="space-y-4">
								<div>
									<Label htmlFor="newTitle" className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Title (optional)
									</Label>
									<Input
										id="newTitle"
										placeholder="Enter note title..."
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
									/>
								</div>
								<div>
									<Label htmlFor="newContent" className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Content *
									</Label>
									<Textarea
										id="newContent"
										placeholder="Enter your note content..."
										value={formData.content}
										onChange={(e) => setFormData({ ...formData, content: e.target.value })}
										className="min-h-32 max-h-64 resize-y border-purple-200 focus:border-purple-500 focus:ring-purple-500"
										required
									/>
								</div>
								<div>
									<Label className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Tags</Label>
									<div className="flex gap-2 mt-1 mb-2">
										<Input
											placeholder="Add a tag..."
											value={newTag}
											onChange={(e) => setNewTag(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
											className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
										/>
										<Button
											type="button"
											onClick={addTag}
											size="sm"
											className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
										>
											<Tag className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{formData.tags.map((tag) => (
											<Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-red-100" onClick={() => removeTag(tag)}>
												{tag} <X className="h-3 w-3 ml-1" />
											</Badge>
										))}
									</div>
								</div>
								<div className="flex gap-2 pt-4">
									<Button
										type="submit"
										className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
									>
										<Save className="h-4 w-4 mr-2" />
										Save Note
									</Button>
									<Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={() => setShowNewNoteForm(false)}>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				{/* Notes List */}
				{loading ? (
					<div className="text-center py-12">
						<div className="text-gray-600 flex flex-col items-center gap-3">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
							Loading notes...
						</div>
					</div>
				) : notes.length === 0 ? (
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<Tag className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h3 className={`text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
									{searchQuery || tagFilter ? 'No Notes Found' : 'No Notes Yet'}
								</h3>
								<p className={`mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									{searchQuery || tagFilter ? 'No notes found matching your search criteria.' : 'Create your first note to get started!'}
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{notes.map((note) => (
							<Card
								key={note.id}
								className={`border-0 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-200 ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}
							>
								{editingNote?.id === note.id ? (
									<CardContent className="pt-6">
										<form onSubmit={handleUpdateNote} className="space-y-4">
											<div>
												<Label htmlFor="editTitle" className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
													Title (optional)
												</Label>
												<Input
													id="editTitle"
													placeholder="Enter note title..."
													value={formData.title}
													onChange={(e) => setFormData({ ...formData, title: e.target.value })}
													className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
												/>
											</div>
											<div>
												<Label htmlFor="editContent" className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
													Content *
												</Label>
												<Textarea
													id="editContent"
													placeholder="Enter your note content..."
													value={formData.content}
													onChange={(e) => setFormData({ ...formData, content: e.target.value })}
													className="min-h-32 max-h-64 resize-y border-purple-200 focus:border-purple-500 focus:ring-purple-500"
													required
												/>
											</div>
											<div>
												<Label className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Tags</Label>
												<div className="flex gap-2 mt-1 mb-2">
													<Input
														placeholder="Add a tag..."
														value={newTag}
														onChange={(e) => setNewTag(e.target.value)}
														onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
														className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
													/>
													<Button
														type="button"
														onClick={addTag}
														size="sm"
														className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
													>
														<Tag className="h-4 w-4" />
													</Button>
												</div>
												<div className="flex flex-wrap gap-2">
													{formData.tags.map((tag) => (
														<Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-red-100" onClick={() => removeTag(tag)}>
															{tag} <X className="h-3 w-3 ml-1" />
														</Badge>
													))}
												</div>
											</div>
											<div className="flex gap-2 pt-4">
												<Button
													type="submit"
													className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
												>
													<Save className="h-4 w-4 mr-2" />
													Save Changes
												</Button>
												<Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={cancelEditing}>
													Cancel
												</Button>
											</div>
										</form>
									</CardContent>
								) : (
									<>
										<CardHeader className="pb-3">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<CardTitle className={`text-xl mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
														{note.title || 'Untitled Note'}
													</CardTitle>
													<CardDescription className="flex items-center gap-4">
														<span className={`flex items-center gap-1 ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
															<User className="h-4 w-4" />
															{note.author.characterName || note.author.email?.split('@')[0] || 'Unknown User'}
														</span>
														<span className="flex items-center gap-1 text-gray-500">
															<Calendar className="h-4 w-4" />
															{formatDate(note.createdAt)}
														</span>
														{note.updatedAt !== note.createdAt && (
															<span className="text-gray-400 text-sm">(Updated {formatDate(note.updatedAt)})</span>
														)}
													</CardDescription>
												</div>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
														onClick={() => startEditing(note)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
														onClick={() => handleDeleteNote(note.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardHeader>
										<CardContent className="pt-0">
											<div
												className={`p-4 rounded-lg border mb-4 ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'}`}
											>
												<p className={`whitespace-pre-wrap leading-relaxed ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
													{note.content}
												</p>
											</div>
											{note.tags && note.tags.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{note.tags.map((tag) => (
														<Badge
															key={tag}
															variant="outline"
															className={`${session?.user?.darkMode ? 'border-cyan-600 text-cyan-400' : 'border-purple-200 text-purple-700'}`}
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

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className="flex justify-center items-center gap-4 mt-8">
						<Button
							variant="outline"
							className="border-purple-200 text-purple-600 hover:bg-purple-50"
							onClick={() => setCurrentPage(pagination.page - 1)}
							disabled={!pagination.hasPrev}
						>
							Previous
						</Button>
						<div
							className={`backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm ${session?.user?.darkMode ? 'bg-gray-700/80 border-gray-600' : 'bg-white/80 border-purple-100'}`}
						>
							<span className="text-sm text-gray-600">
								Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total notes)
							</span>
						</div>
						<Button
							variant="outline"
							className="border-purple-200 text-purple-600 hover:bg-purple-50"
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
