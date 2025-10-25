'use client';

import {
	createCampaignQuest,
	createQuestType,
	deleteCampaignQuest,
	deleteQuestType,
	getCampaignQuests,
	getQuestTypes,
	updateCampaignQuest,
} from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Coins, Crown, Edit, Plus, Save, Scroll, Shield, Sword, Tag, Target, Trash2, X, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function QuestsPage() {
	const { data: session } = useSession();
	const [mounted, setMounted] = useState(false);
	const [quests, setQuests] = useState([]);
	const [questTypes, setQuestTypes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('AVAILABLE');
	const [selectedQuestType, setSelectedQuestType] = useState('ALL');

	// Quest Type Filter
	const [questTypeFilter, setQuestTypeFilter] = useState('all');

	// Quest Type Management
	const [showQuestTypeDialog, setShowQuestTypeDialog] = useState(false);
	const [newQuestTypeName, setNewQuestTypeName] = useState('');

	// Form states
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [editingQuest, setEditingQuest] = useState(null);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		status: 'AVAILABLE',
		reward: '',
		difficulty: '',
		questTypeId: 'none',
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	// Check if user can manage quests (DM or Admin)
	const canManageQuests = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	const loadQuests = useCallback(async () => {
		if (!session?.user?.activeCampaignId) {
			setQuests([]);
			return;
		}

		setLoading(true);
		try {
			const result = await getCampaignQuests(session.user.activeCampaignId);

			if (result.success) {
				setQuests(result.data || []);
				setError('');
			} else {
				setError(result.error || 'Failed to load quests');
			}
		} catch (err) {
			setError('Failed to load quests');
			console.error('Error loading quests:', err);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.activeCampaignId]);

	const loadQuestTypes = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

		try {
			const result = await getQuestTypes(session.user.activeCampaignId);
			if (result.success) {
				setQuestTypes(result.data);
			}
		} catch (err) {
			console.error('Failed to load quest types:', err);
		}
	}, [session?.user?.activeCampaignId]);

	useEffect(() => {
		if (mounted && session?.user?.activeCampaignId) {
			loadQuests();
			loadQuestTypes();
		}
	}, [mounted, loadQuests, loadQuestTypes]);

	const handleCreateQuest = async (e) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.description.trim()) {
			setError('Title and description are required');
			return;
		}

		try {
			const questData = {
				...formData,
				questTypeId: formData.questTypeId === 'none' ? null : formData.questTypeId,
			};
			const result = await createCampaignQuest(session.user.activeCampaignId, questData);

			if (result.success) {
				setFormData({ title: '', description: '', status: 'AVAILABLE', reward: '', difficulty: '', questTypeId: 'none' });
				setShowCreateDialog(false);
				setError('');
				await loadQuests();
			} else {
				setError(result.error || 'Failed to create quest');
			}
		} catch (err) {
			setError('Failed to create quest');
			console.error('Error creating quest:', err);
		}
	};

	const handleUpdateQuest = async (e) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.description.trim()) {
			setError('Title and description are required');
			return;
		}

		try {
			const questData = {
				...formData,
				questTypeId: formData.questTypeId === 'none' ? null : formData.questTypeId,
			};
			const result = await updateCampaignQuest(editingQuest.id, questData);

			if (result.success) {
				setEditingQuest(null);
				setShowEditDialog(false);
				setFormData({ title: '', description: '', status: 'AVAILABLE', reward: '', difficulty: '', questTypeId: 'none' });
				setError('');
				await loadQuests();
			} else {
				setError(result.error || 'Failed to update quest');
			}
		} catch (err) {
			setError('Failed to update quest');
			console.error('Error updating quest:', err);
		}
	};

	const handleDeleteQuest = async (questId) => {
		if (!confirm('Are you sure you want to delete this quest?')) return;

		try {
			const result = await deleteCampaignQuest(questId);

			if (result.success) {
				setError('');
				await loadQuests();
			} else {
				setError(result.error || 'Failed to delete quest');
			}
		} catch (err) {
			setError('Failed to delete quest');
			console.error('Error deleting quest:', err);
		}
	};

	const startEditing = (quest) => {
		setEditingQuest(quest);
		setFormData({
			title: quest.title,
			description: quest.description,
			status: quest.status,
			reward: quest.reward || '',
			difficulty: quest.difficulty || '',
			questTypeId: quest.questTypeId || 'none',
		});
		setShowEditDialog(true);
	};

	const handleCreateQuestType = async (e) => {
		e.preventDefault();

		if (!newQuestTypeName.trim()) {
			setError('Quest type name is required');
			return;
		}

		try {
			const result = await createQuestType(session.user.activeCampaignId, {
				name: newQuestTypeName.trim(),
			});

			if (result.success) {
				setNewQuestTypeName('');
				setShowQuestTypeDialog(false);
				await loadQuestTypes();
			} else {
				setError(result.error || 'Failed to create quest type');
			}
		} catch (err) {
			setError('Failed to create quest type');
			console.error('Error creating quest type:', err);
		}
	};

	const handleDeleteQuestType = async (questTypeId) => {
		if (!confirm('Are you sure you want to delete this quest type? This will unassign it from all quests.')) {
			return;
		}

		try {
			const result = await deleteQuestType(questTypeId);
			if (result.success) {
				await loadQuestTypes();
				await loadQuests(); // Refresh quests to update the UI
			} else {
				setError(result.error || 'Failed to delete quest type');
			}
		} catch (err) {
			setError('Failed to delete quest type');
			console.error('Error deleting quest type:', err);
		}
	};

	const getDifficultyIcon = (difficulty) => {
		if (!difficulty) return <Target className="h-4 w-4" />;
		switch (difficulty.toLowerCase()) {
			case 'easy':
				return <Shield className="h-4 w-4 text-green-500" />;
			case 'medium':
				return <Sword className="h-4 w-4 text-yellow-500" />;
			case 'hard':
				return <Zap className="h-4 w-4 text-red-500" />;
			default:
				return <Target className="h-4 w-4" />;
		}
	};

	const getDifficultyColor = (difficulty) => {
		if (!difficulty) return 'bg-gray-100 text-gray-700';
		switch (difficulty.toLowerCase()) {
			case 'easy':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'hard':
				return 'bg-red-100 text-red-700 border-red-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'AVAILABLE':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'IN_PROGRESS':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'COMPLETED':
				return 'bg-purple-100 text-purple-700 border-purple-200';
			case 'UNAVAILABLE':
				return 'bg-gray-100 text-gray-700 border-gray-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const formatDate = (date) => {
		if (!date) return '';
		try {
			return new Date(date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch {
			return '';
		}
	};

	const filteredQuests = quests.filter((quest) => {
		// Filter by status
		const statusMatch = selectedStatus === 'ALL' ? true : quest.status === selectedStatus;

		// Filter by quest type
		let questTypeMatch = true;
		if (questTypeFilter === 'all') {
			questTypeMatch = true;
		} else {
			questTypeMatch = quest.questTypeId === questTypeFilter;
		}

		return statusMatch && questTypeMatch;
	});

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
				<div className="max-w-6xl mx-auto">
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<Scroll className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h2 className={`text-2xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Active Campaign</h2>
								<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									Please select an active campaign to view the quest board.
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
			className={`min-h-screen pt-20 sm:pt-24 lg:pt-28 px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
					<div>
						<h1
							className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}
						>
							<Scroll className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
							Quest Board
						</h1>
						<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-600'}`}>
							Available adventures for{' '}
							<span className={`font-semibold ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
								{session.user.activeCampaignName}
							</span>
						</p>
					</div>

					{/* Create Quest Button */}
					{canManageQuests && (
						<div className="flex flex-col sm:flex-row gap-2">
							<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
								<DialogTrigger asChild>
									<Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg w-full sm:w-auto text-sm sm:text-base">
										<Plus className="h-4 w-4 mr-2" />
										Post Quest
									</Button>
								</DialogTrigger>
								<DialogContent
									className={`max-w-xs sm:max-w-lg lg:max-w-2xl border-0 shadow-xl backdrop-blur-sm mx-2 sm:mx-auto overflow-y-auto max-h-[90vh] ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
								>
									<DialogHeader>
										<DialogTitle className={`${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Post New Quest</DialogTitle>
									</DialogHeader>
									<form onSubmit={handleCreateQuest} className="space-y-4 pb-32 sm:pb-4">
										<div>
											<Label htmlFor="createTitle" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
												Quest Title *
											</Label>
											<Input
												id="createTitle"
												placeholder="e.g., Rescue the Missing Scholar"
												value={formData.title}
												onChange={(e) => setFormData({ ...formData, title: e.target.value })}
												className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
												required
											/>
										</div>
										<div>
											<Label
												htmlFor="createDescription"
												className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
											>
												Description *
											</Label>
											<Textarea
												id="createDescription"
												placeholder="Describe the quest objectives, background, and any important details..."
												value={formData.description}
												onChange={(e) => setFormData({ ...formData, description: e.target.value })}
												className="min-h-24 sm:min-h-32 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
												required
											/>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
											<div>
												<Label htmlFor="createStatus" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
													Status
												</Label>
												<Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
													<SelectTrigger className="w-full mt-1 text-sm sm:text-base">
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="AVAILABLE">Available</SelectItem>
														<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
														<SelectItem value="COMPLETED">Completed</SelectItem>
														<SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label
													htmlFor="createDifficulty"
													className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}
												>
													Difficulty
												</Label>
												<Input
													id="createDifficulty"
													placeholder="e.g., Easy, Challenging, Legendary, etc."
													value={formData.difficulty}
													onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
													className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
												/>
											</div>
											<div className="sm:col-span-2 lg:col-span-1">
												<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
													Quest Type (Optional)
												</Label>
												<Select value={formData.questTypeId} onValueChange={(value) => setFormData({ ...formData, questTypeId: value })}>
													<SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base">
														<SelectValue placeholder="Select a quest type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="none">No Quest Type</SelectItem>
														{questTypes.map((type) => (
															<SelectItem key={type.id} value={type.id}>
																{type.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="sm:col-span-2 lg:col-span-3">
												<Label htmlFor="createReward" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
													Reward
												</Label>
												<Input
													id="createReward"
													placeholder="e.g., 1000 gold, Magic item"
													value={formData.reward}
													onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
													className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
												/>
											</div>
										</div>
										<div className="flex flex-col sm:flex-row gap-2 pt-4">
											<Button
												type="submit"
												className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base"
											>
												<Save className="h-4 w-4 mr-2" />
												Post Quest
											</Button>
											<Button
												type="button"
												variant="outline"
												className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50'}`}
												onClick={() => setShowCreateDialog(false)}
											>
												Cancel
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>

							<Dialog open={showQuestTypeDialog} onOpenChange={setShowQuestTypeDialog}>
								<DialogTrigger asChild>
									<Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto text-sm sm:text-base">
										<Tag className="h-4 w-4 mr-2" />
										Manage Quest Types
									</Button>
								</DialogTrigger>
								<DialogContent
									className={`max-w-xs sm:max-w-md border-0 shadow-xl backdrop-blur-sm mx-2 sm:mx-auto ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
								>
									<DialogHeader>
										<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
											Manage Quest Types
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										{/* Create New Quest Type */}
										<form onSubmit={handleCreateQuestType} className="space-y-3">
											<div>
												<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
													New Quest Type Name
												</Label>
												<Input
													placeholder="e.g., Guild Missions, Side Quests"
													value={newQuestTypeName}
													onChange={(e) => setNewQuestTypeName(e.target.value)}
													className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
												/>
											</div>
											<Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base">
												Create Quest Type
											</Button>
										</form>

										{/* Existing Quest Types */}
										<div className="space-y-2">
											<h4 className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
												Existing Quest Types
											</h4>
											{questTypes.length === 0 ? (
												<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No quest types created yet</p>
											) : (
												questTypes.map((type) => (
													<div
														key={type.id}
														className={`flex items-center justify-between p-2 rounded border ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
													>
														<span className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>{type.name}</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteQuestType(type.id)}
															className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												))
											)}
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<Card
						className={`mb-4 sm:mb-6 backdrop-blur-sm shadow-lg ${session?.user?.darkMode ? 'border-red-800 bg-red-900/80' : 'border-red-200 bg-red-50/80'}`}
					>
						<CardContent className="pt-4 sm:pt-6">
							<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
						</CardContent>
					</Card>
				)}

				{/* Quest Type Filter */}
				<Card
					className={`mb-4 sm:mb-6 backdrop-blur-sm shadow-lg ${session?.user?.darkMode ? 'border-purple-800 bg-gray-800/80' : 'border-purple-200 bg-white/80'}`}
				>
					<CardContent className="pt-4 sm:pt-6">
						<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
							<Label className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
								Filter by Quest Type:
							</Label>
							<Select value={questTypeFilter} onValueChange={setQuestTypeFilter}>
								<SelectTrigger
									className={`w-full sm:w-64 text-sm sm:text-base ${session?.user?.darkMode ? 'border-purple-600 bg-gray-700 text-white' : 'border-purple-200 bg-white'}`}
								>
									<SelectValue placeholder="Select quest type filter" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Quest Types ({quests.length})</SelectItem>
									{questTypes.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name} ({quests.filter((q) => q.questTypeId === type.id).length})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Status Filter Tabs */}
				<Card className={`mb-4 sm:mb-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<CardContent className="pt-4 sm:pt-6">
						<Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
							<TabsList
								className={`w-full h-auto p-1 ${session?.user?.darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-purple-100 to-blue-100'}`}
							>
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 w-full">
									<TabsTrigger
										value="AVAILABLE"
										className={`text-xs sm:text-sm h-auto py-2 px-2 sm:px-3 ${session?.user?.darkMode ? 'data-[state=active]:bg-green-800 data-[state=active]:text-green-200' : 'data-[state=active]:bg-green-200 data-[state=active]:text-green-800'}`}
									>
										<div className="flex flex-col items-center">
											<span className="hidden sm:inline">Available</span>
											<span className="sm:hidden">Avail.</span>
											<span className="text-[10px] sm:text-xs">({quests.filter((q) => q.status === 'AVAILABLE').length})</span>
										</div>
									</TabsTrigger>
									<TabsTrigger
										value="IN_PROGRESS"
										className={`text-xs sm:text-sm h-auto py-2 px-2 sm:px-3 ${session?.user?.darkMode ? 'data-[state=active]:bg-blue-800 data-[state=active]:text-blue-200' : 'data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800'}`}
									>
										<div className="flex flex-col items-center">
											<span className="hidden sm:inline">In Progress</span>
											<span className="sm:hidden">Progress</span>
											<span className="text-[10px] sm:text-xs">({quests.filter((q) => q.status === 'IN_PROGRESS').length})</span>
										</div>
									</TabsTrigger>
									<TabsTrigger
										value="COMPLETED"
										className={`text-xs sm:text-sm h-auto py-2 px-2 sm:px-3 col-span-2 sm:col-span-1 ${session?.user?.darkMode ? 'data-[state=active]:bg-cyan-800 data-[state=active]:text-cyan-200' : 'data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800'}`}
									>
										<div className="flex flex-col items-center">
											<span className="hidden sm:inline">Completed</span>
											<span className="sm:hidden">Done</span>
											<span className="text-[10px] sm:text-xs">({quests.filter((q) => q.status === 'COMPLETED').length})</span>
										</div>
									</TabsTrigger>
									<TabsTrigger
										value="UNAVAILABLE"
										className={`text-xs sm:text-sm h-auto py-2 px-2 sm:px-3 ${session?.user?.darkMode ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-gray-300' : 'data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800'}`}
									>
										<div className="flex flex-col items-center">
											<span className="hidden sm:inline">Unavailable</span>
											<span className="sm:hidden">Unavail.</span>
											<span className="text-[10px] sm:text-xs">({quests.filter((q) => q.status === 'UNAVAILABLE').length})</span>
										</div>
									</TabsTrigger>
									<TabsTrigger
										value="ALL"
										className={`text-xs sm:text-sm h-auto py-2 px-2 sm:px-3 ${session?.user?.darkMode ? 'data-[state=active]:bg-cyan-800 data-[state=active]:text-cyan-200' : 'data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800'}`}
									>
										<div className="flex flex-col items-center">
											<span className="hidden sm:inline">All Quests</span>
											<span className="sm:hidden">All</span>
											<span className="text-[10px] sm:text-xs">({quests.length})</span>
										</div>
									</TabsTrigger>
								</div>
							</TabsList>
						</Tabs>
					</CardContent>
				</Card>

				{/* Quests Grid */}
				{!loading && filteredQuests.length > 0 && (
					<div className={`mb-3 sm:mb-4 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
						Showing {filteredQuests.length} of {quests.length} quest{quests.length === 1 ? '' : 's'}
						{questTypeFilter !== 'all' && <span> • Filtered by: {questTypes.find((type) => type.id === questTypeFilter)?.name || 'Unknown'}</span>}
					</div>
				)}
				{loading ? (
					<div className="text-center py-8 sm:py-12">
						<div className="text-gray-600 flex flex-col items-center gap-3">
							<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
							<span className="text-sm sm:text-base">Loading quest board...</span>
						</div>
					</div>
				) : filteredQuests.length === 0 ? (
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-4 sm:pt-6">
							<div className="text-center py-6 sm:py-8">
								<Scroll className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-3 sm:mb-4" />
								<h3 className={`text-lg sm:text-xl font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
									No Quests Found
								</h3>
								<p className="text-sm sm:text-base text-gray-600 mb-4">
									{filteredQuests.length === 0 && quests.length > 0
										? 'No quests match your current filters. Try adjusting the status or quest type filters.'
										: canManageQuests
											? 'Post the first quest to get started!'
											: 'Check back later for new adventures.'}
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{filteredQuests.map((quest) => (
							<Card
								key={quest.id}
								className={`border-0 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-200 relative ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}
							>
								{/* Parchment-like border decoration */}
								<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 rounded-t-lg"></div>

								<CardHeader className="pb-2 sm:pb-3">
									<div className="flex justify-between items-start gap-2">
										<div className="flex-1 min-w-0">
											<CardTitle
												className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center gap-2 max-w-[150px] sm:max-w-[200px] lg:max-w-[230px]`}
											>
												<Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
												<span className="truncate">{quest.title}</span>
											</CardTitle>
											<div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
												<Badge className={`border text-xs ${getStatusColor(quest.status)}`}>{quest.status.replace('_', ' ')}</Badge>
												{quest.difficulty && (
													<Badge variant="outline" className={`border text-xs ${getDifficultyColor(quest.difficulty)}`}>
														{getDifficultyIcon(quest.difficulty)}
														<span className="ml-1">{quest.difficulty}</span>
													</Badge>
												)}
												{quest.questType && (
													<Badge
														variant="outline"
														className={`border-blue-200 bg-blue-50 text-blue-700 text-xs ${session?.user?.darkMode ? 'border-blue-600 bg-blue-900/50 text-blue-300' : ''}`}
													>
														<Tag className="h-3 w-3 mr-1 flex-shrink-0" />
														<span className="truncate">{quest.questType.name}</span>
													</Badge>
												)}
											</div>
											<CardDescription className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
												<Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
												<span className="truncate">Posted {formatDate(quest.createdAt)}</span>
											</CardDescription>
										</div>
										{canManageQuests && (
											<div className="flex gap-1 flex-shrink-0">
												<Button
													variant="outline"
													size="sm"
													className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 h-7 w-7 sm:h-8 sm:w-8 p-0"
													onClick={() => startEditing(quest)}
												>
													<Edit className="h-3 w-3" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-7 w-7 sm:h-8 sm:w-8 p-0"
													onClick={() => handleDeleteQuest(quest.id)}
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div
										className={`p-3 sm:p-4 rounded-lg border mb-3 ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'}`}
									>
										<p className={`text-xs sm:text-sm leading-relaxed ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
											{quest.description}
										</p>
									</div>
									{quest.reward && (
										<div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-yellow-700">
											<Coins className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
											<span className="truncate">Reward: {quest.reward}</span>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Edit Quest Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent
						className={`max-w-xs sm:max-w-lg lg:max-w-2xl border-0 shadow-xl backdrop-blur-sm mx-2 sm:mx-auto overflow-y-auto max-h-[90vh] ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
					>
						<DialogHeader>
							<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Quest</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleUpdateQuest} className="space-y-4 pb-32 sm:pb-4">
							<div>
								<Label htmlFor="editTitle" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
									Quest Title *
								</Label>
								<Input
									id="editTitle"
									placeholder="e.g., Rescue the Missing Scholar"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
									required
								/>
							</div>
							<div>
								<Label htmlFor="editDescription" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
									Description *
								</Label>
								<Textarea
									id="editDescription"
									placeholder="Describe the quest objectives, background, and any important details..."
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className="min-h-24 sm:min-h-32 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
									required
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
								<div>
									<Label htmlFor="editStatus" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Status
									</Label>
									<Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
										<SelectTrigger className="w-full mt-1 text-sm sm:text-base">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="AVAILABLE">Available</SelectItem>
											<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
											<SelectItem value="COMPLETED">Completed</SelectItem>
											<SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="editDifficulty" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Difficulty
									</Label>
									<Input
										id="editDifficulty"
										placeholder="e.g., Easy, Challenging, Legendary, etc."
										value={formData.difficulty}
										onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
									/>
								</div>
								<div className="sm:col-span-2 lg:col-span-1">
									<Label htmlFor="editReward" className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Reward
									</Label>
									<Input
										id="editReward"
										placeholder="e.g., 1000 gold, Magic item"
										value={formData.reward}
										onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
									/>
								</div>
							</div>
							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Quest Type (Optional)</Label>
								<Select value={formData.questTypeId} onValueChange={(value) => setFormData({ ...formData, questTypeId: value })}>
									<SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base">
										<SelectValue placeholder="Select a quest type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No Quest Type</SelectItem>
										{questTypes.map((type) => (
											<SelectItem key={type.id} value={type.id}>
												{type.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col sm:flex-row gap-2 pt-4">
								<Button
									type="submit"
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base"
								>
									<Save className="h-4 w-4 mr-2" />
									Save Changes
								</Button>
								<Button
									type="button"
									variant="outline"
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50'}`}
									onClick={() => setShowEditDialog(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
