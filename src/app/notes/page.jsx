'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Save, X, Tag } from 'lucide-react';
import { getPersonalNotes, createPersonalNote, updatePersonalNote, deletePersonalNote } from '@/app/admin/components/actions';

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
		if (!mounted) return '';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (!mounted) {
		return <div>Loading...</div>;
	}

	if (!session?.user?.activeCampaignId) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-28 p-8">
				<div className="max-w-7xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle>No Active Campaign</CardTitle>
							<CardDescription>Please select an active campaign to view and manage your notes.</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-28 p-8">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">Campaign Notes</h1>
					<p className="text-gray-600">Your personal notes for {session.user.activeCampaignName}</p>
				</div>

				{error && (
					<Card className="mb-6 border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<p className="text-red-600">{error}</p>
						</CardContent>
					</Card>
				)}

				{/* Search and Filter Controls */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-lg">Search & Filter</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<Label htmlFor="search">Search notes</Label>
								<div className="flex gap-2 mt-1">
									<Input
										id="search"
										placeholder="Search by title or content..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
									/>
									<Button onClick={handleSearch} size="sm">
										<Search className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="flex-1">
								<Label htmlFor="tagFilter">Filter by tag</Label>
								<select
									id="tagFilter"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
									value={tagFilter}
									onChange={(e) => {
										setTagFilter(e.target.value);
										setCurrentPage(1);
									}}
								>
									<option value="">All tags</option>
									{availableTags.map((tag) => (
										<option key={tag} value={tag}>
											{tag}
										</option>
									))}
								</select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* New Note Button */}
				<div className="mb-6">
					<Button
						onClick={() => {
							setShowNewNoteForm(true);
							setEditingNote(null);
							setFormData({ title: '', content: '', tags: [] });
						}}
						className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
					>
						<Plus className="h-4 w-4 mr-2" />
						New Note
					</Button>
				</div>

				{/* New Note Form */}
				{showNewNoteForm && (
					<Card className="mb-6 border-blue-200 bg-blue-50">
						<CardHeader>
							<CardTitle className="text-lg">Create New Note</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleCreateNote} className="space-y-4">
								<div>
									<Label htmlFor="newTitle">Title (optional)</Label>
									<Input
										id="newTitle"
										placeholder="Enter note title..."
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									/>
								</div>
								<div>
									<Label htmlFor="newContent">Content *</Label>
									<Textarea
										id="newContent"
										placeholder="Enter your note content..."
										value={formData.content}
										onChange={(e) => setFormData({ ...formData, content: e.target.value })}
										className="min-h-32 max-h-64 resize-y"
										required
									/>
								</div>
								<div>
									<Label>Tags</Label>
									<div className="flex gap-2 mt-1 mb-2">
										<Input
											placeholder="Add a tag..."
											value={newTag}
											onChange={(e) => setNewTag(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
										/>
										<Button type="button" onClick={addTag} size="sm">
											<Tag className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{formData.tags.map((tag) => (
											<Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
												{tag} <X className="h-3 w-3 ml-1" />
											</Badge>
										))}
									</div>
								</div>
								<div className="flex gap-2">
									<Button type="submit" className="bg-green-600 hover:bg-green-700">
										<Save className="h-4 w-4 mr-2" />
										Save Note
									</Button>
									<Button type="button" variant="outline" onClick={() => setShowNewNoteForm(false)}>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				{/* Notes List */}
				{loading ? (
					<Card>
						<CardContent className="pt-6">
							<p className="text-gray-600">Loading notes...</p>
						</CardContent>
					</Card>
				) : notes.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<p className="text-gray-600 text-center">
								{searchQuery || tagFilter ? 'No notes found matching your search criteria.' : 'No notes yet. Create your first note!'}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{notes.map((note) => (
							<Card key={note.id} className="hover:shadow-md transition-shadow">
								{editingNote?.id === note.id ? (
									<CardContent className="pt-6">
										<form onSubmit={handleUpdateNote} className="space-y-4">
											<div>
												<Label htmlFor="editTitle">Title (optional)</Label>
												<Input
													id="editTitle"
													placeholder="Enter note title..."
													value={formData.title}
													onChange={(e) => setFormData({ ...formData, title: e.target.value })}
												/>
											</div>
											<div>
												<Label htmlFor="editContent">Content *</Label>
												<Textarea
													id="editContent"
													placeholder="Enter your note content..."
													value={formData.content}
													onChange={(e) => setFormData({ ...formData, content: e.target.value })}
													className="min-h-32 max-h-64 resize-y"
													required
												/>
											</div>
											<div>
												<Label>Tags</Label>
												<div className="flex gap-2 mt-1 mb-2">
													<Input
														placeholder="Add a tag..."
														value={newTag}
														onChange={(e) => setNewTag(e.target.value)}
														onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
													/>
													<Button type="button" onClick={addTag} size="sm">
														<Tag className="h-4 w-4" />
													</Button>
												</div>
												<div className="flex flex-wrap gap-2">
													{formData.tags.map((tag) => (
														<Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
															{tag} <X className="h-3 w-3 ml-1" />
														</Badge>
													))}
												</div>
											</div>
											<div className="flex gap-2">
												<Button type="submit" className="bg-green-600 hover:bg-green-700">
													<Save className="h-4 w-4 mr-2" />
													Save Changes
												</Button>
												<Button type="button" variant="outline" onClick={cancelEditing}>
													Cancel
												</Button>
											</div>
										</form>
									</CardContent>
								) : (
									<>
										<CardHeader>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<CardTitle className="text-lg">
														{note.title || 'Untitled Note'}
													</CardTitle>
													<CardDescription>
														Created {formatDate(note.createdAt)}
														{note.updatedAt !== note.createdAt && (
															<> • Updated {formatDate(note.updatedAt)}</>
														)}
													</CardDescription>
												</div>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => startEditing(note)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeleteNote(note.id)}
														className="text-red-600 hover:text-red-700"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className="prose max-w-none">
												<p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
											</div>
											{note.tags && note.tags.length > 0 && (
												<div className="flex flex-wrap gap-2 mt-4">
													{note.tags.map((tag) => (
														<Badge key={tag} variant="outline">
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
					<div className="flex justify-center items-center gap-2 mt-8">
						<Button
							variant="outline"
							onClick={() => setCurrentPage(pagination.page - 1)}
							disabled={!pagination.hasPrev}
						>
							Previous
						</Button>
						<span className="text-sm text-gray-600">
							Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total notes)
						</span>
						<Button
							variant="outline"
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
