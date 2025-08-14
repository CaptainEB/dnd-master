'use client';

import { createCampaignQuest, deleteCampaignQuest, getCampaignQuests, updateCampaignQuest } from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Coins, Crown, Edit, Plus, Save, Scroll, Shield, Sword, Target, Trash2, X, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function QuestsPage() {
	const { data: session } = useSession();
	const [mounted, setMounted] = useState(false);
	const [quests, setQuests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('AVAILABLE');

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
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	// Check if user can manage quests (DM or Admin)
	const canManageQuests = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	const loadQuests = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

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

	useEffect(() => {
		if (mounted && session?.user?.activeCampaignId) {
			loadQuests();
		}
	}, [mounted, loadQuests]);

	const handleCreateQuest = async (e) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.description.trim()) {
			setError('Title and description are required');
			return;
		}

		try {
			const result = await createCampaignQuest(session.user.activeCampaignId, formData);

			if (result.success) {
				setFormData({ title: '', description: '', status: 'AVAILABLE', reward: '', difficulty: '' });
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
			const result = await updateCampaignQuest(editingQuest.id, formData);

			if (result.success) {
				setEditingQuest(null);
				setShowEditDialog(false);
				setFormData({ title: '', description: '', status: 'AVAILABLE', reward: '', difficulty: '' });
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
		});
		setShowEditDialog(true);
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
		if (!mounted) return '';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const filteredQuests = quests.filter((quest) => (selectedStatus === 'ALL' ? true : quest.status === selectedStatus));

	if (!mounted) {
		return <div>Loading...</div>;
	}

	if (!session?.user?.activeCampaignId) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-28 p-8">
				<div className="max-w-6xl mx-auto">
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<Scroll className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Campaign</h2>
								<p className="text-gray-600">Please select an active campaign to view the quest board.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-28 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
							<Scroll className="h-10 w-10 text-purple-600" />
							Quest Board
						</h1>
						<p className="text-gray-600">
							Available adventures for <span className="font-semibold text-purple-700">{session.user.activeCampaignName}</span>
						</p>
					</div>

					{/* Create Quest Button */}
					{canManageQuests && (
						<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
							<DialogTrigger asChild>
								<Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
									<Plus className="h-4 w-4 mr-2" />
									Post Quest
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl border-0 shadow-xl bg-white/95 backdrop-blur-sm">
								<DialogHeader>
									<DialogTitle className="text-gray-800">Post New Quest</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleCreateQuest} className="space-y-4">
									<div>
										<Label htmlFor="createTitle" className="text-gray-700">
											Quest Title *
										</Label>
										<Input
											id="createTitle"
											placeholder="e.g., Rescue the Missing Scholar"
											value={formData.title}
											onChange={(e) => setFormData({ ...formData, title: e.target.value })}
											className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
											required
										/>
									</div>
									<div>
										<Label htmlFor="createDescription" className="text-gray-700">
											Description *
										</Label>
										<Textarea
											id="createDescription"
											placeholder="Describe the quest objectives, background, and any important details..."
											value={formData.description}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											className="min-h-32 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
											required
										/>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div>
											<Label htmlFor="createStatus" className="text-gray-700">
												Status
											</Label>
											<select
												id="createStatus"
												value={formData.status}
												onChange={(e) => setFormData({ ...formData, status: e.target.value })}
												className="mt-1 block w-full rounded-md border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
											>
												<option value="AVAILABLE">Available</option>
												<option value="IN_PROGRESS">In Progress</option>
												<option value="COMPLETED">Completed</option>
												<option value="UNAVAILABLE">Unavailable</option>
											</select>
										</div>
										<div>
											<Label htmlFor="createDifficulty" className="text-gray-700">
												Difficulty
											</Label>
											<Input
												id="createDifficulty"
												placeholder="e.g., Easy, Challenging, Legendary, etc."
												value={formData.difficulty}
												onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
												className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
											/>
										</div>
										<div>
											<Label htmlFor="createReward" className="text-gray-700">
												Reward
											</Label>
											<Input
												id="createReward"
												placeholder="e.g., 1000 gold, Magic item"
												value={formData.reward}
												onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
												className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
											/>
										</div>
									</div>
									<div className="flex gap-2 pt-4">
										<Button
											type="submit"
											className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
										>
											<Save className="h-4 w-4 mr-2" />
											Post Quest
										</Button>
										<Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={() => setShowCreateDialog(false)}>
											Cancel
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<Card className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm shadow-lg">
						<CardContent className="pt-6">
							<p className="text-red-600">{error}</p>
						</CardContent>
					</Card>
				)}

				{/* Status Filter Tabs */}
				<Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
					<CardContent className="pt-6">
						<Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
							<TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-purple-100 to-blue-100">
								<TabsTrigger value="AVAILABLE" className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800">
									Available ({quests.filter((q) => q.status === 'AVAILABLE').length})
								</TabsTrigger>
								<TabsTrigger value="IN_PROGRESS" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800">
									In Progress ({quests.filter((q) => q.status === 'IN_PROGRESS').length})
								</TabsTrigger>
								<TabsTrigger value="COMPLETED" className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800">
									Completed ({quests.filter((q) => q.status === 'COMPLETED').length})
								</TabsTrigger>
								<TabsTrigger value="UNAVAILABLE" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800">
									Unavailable ({quests.filter((q) => q.status === 'UNAVAILABLE').length})
								</TabsTrigger>
								<TabsTrigger value="ALL" className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800">
									All ({quests.length})
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</CardContent>
				</Card>

				{/* Quests Grid */}
				{loading ? (
					<div className="text-center py-12">
						<div className="text-gray-600 flex flex-col items-center gap-3">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
							Loading quest board...
						</div>
					</div>
				) : filteredQuests.length === 0 ? (
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<Scroll className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-gray-800 mb-2">
									No {selectedStatus === 'ALL' ? '' : selectedStatus.toLowerCase().replace('_', ' ')} Quests
								</h3>
								<p className="text-gray-600 mb-4">
									{canManageQuests ? 'Post the first quest to get started!' : 'Check back later for new adventures.'}
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredQuests.map((quest) => (
							<Card
								key={quest.id}
								className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 relative overflow-hidden"
							>
								{/* Parchment-like border decoration */}
								<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200"></div>

								<CardHeader className="pb-3">
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<CardTitle className="text-lg text-gray-800 mb-2 flex items-center gap-2">
												<Crown className="h-5 w-5 text-yellow-600" />
												{quest.title}
											</CardTitle>
											<div className="flex flex-wrap gap-2 mb-2">
												<Badge className={`border ${getStatusColor(quest.status)}`}>{quest.status.replace('_', ' ')}</Badge>
												{quest.difficulty && (
													<Badge variant="outline" className={`border ${getDifficultyColor(quest.difficulty)}`}>
														{getDifficultyIcon(quest.difficulty)}
														<span className="ml-1">{quest.difficulty}</span>
													</Badge>
												)}
											</div>
											<CardDescription className="flex items-center gap-1 text-gray-500">
												<Calendar className="h-4 w-4" />
												Posted {formatDate(quest.createdAt)}
											</CardDescription>
										</div>
										{canManageQuests && (
											<div className="flex gap-1">
												<Button
													variant="outline"
													size="sm"
													className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 h-8 w-8 p-0"
													onClick={() => startEditing(quest)}
												>
													<Edit className="h-3 w-3" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 w-8 p-0"
													onClick={() => handleDeleteQuest(quest.id)}
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="bg-gradient-to-r from-amber-50/50 to-yellow-50/50 p-3 rounded-lg border border-amber-100 mb-3">
										<p className="text-gray-700 text-sm leading-relaxed">{quest.description}</p>
									</div>
									{quest.reward && (
										<div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
											<Coins className="h-4 w-4" />
											<span>Reward: {quest.reward}</span>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Edit Quest Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className="max-w-2xl border-0 shadow-xl bg-white/95 backdrop-blur-sm">
						<DialogHeader>
							<DialogTitle className="text-gray-800">Edit Quest</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleUpdateQuest} className="space-y-4">
							<div>
								<Label htmlFor="editTitle" className="text-gray-700">
									Quest Title *
								</Label>
								<Input
									id="editTitle"
									placeholder="e.g., Rescue the Missing Scholar"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
									required
								/>
							</div>
							<div>
								<Label htmlFor="editDescription" className="text-gray-700">
									Description *
								</Label>
								<Textarea
									id="editDescription"
									placeholder="Describe the quest objectives, background, and any important details..."
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className="min-h-32 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
									required
								/>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<Label htmlFor="editStatus" className="text-gray-700">
										Status
									</Label>
									<select
										id="editStatus"
										value={formData.status}
										onChange={(e) => setFormData({ ...formData, status: e.target.value })}
										className="mt-1 block w-full rounded-md border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
									>
										<option value="AVAILABLE">Available</option>
										<option value="IN_PROGRESS">In Progress</option>
										<option value="COMPLETED">Completed</option>
										<option value="UNAVAILABLE">Unavailable</option>
									</select>
								</div>
								<div>
									<Label htmlFor="editDifficulty" className="text-gray-700">
										Difficulty
									</Label>
									<Input
										id="editDifficulty"
										placeholder="e.g., Easy, Challenging, Legendary, etc."
										value={formData.difficulty}
										onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
									/>
								</div>
								<div>
									<Label htmlFor="editReward" className="text-gray-700">
										Reward
									</Label>
									<Input
										id="editReward"
										placeholder="e.g., 1000 gold, Magic item"
										value={formData.reward}
										onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
										className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
									/>
								</div>
							</div>
							<div className="flex gap-2 pt-4">
								<Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
									<Save className="h-4 w-4 mr-2" />
									Save Changes
								</Button>
								<Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={() => setShowEditDialog(false)}>
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
