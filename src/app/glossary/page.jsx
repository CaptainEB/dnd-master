'use client';

import { createCreature, deleteCreature, getCampaignCreatures, updateCreature } from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Filter, LayoutGrid, List, Plus, Search, Shield, Trash2, User, Users, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function GlossaryPage() {
	const { data: session } = useSession();
	const [creatures, setCreatures] = useState([]);
	const [filteredCreatures, setFilteredCreatures] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isMounted, setIsMounted] = useState(false);

	// Search and filtering states
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [tagFilter, setTagFilter] = useState('');
	const [privateFilter, setPrivateFilter] = useState('all'); // 'all', 'private', 'public'
	const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

	// Dialog states
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [editingCreature, setEditingCreature] = useState(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [selectedCreatureForDetail, setSelectedCreatureForDetail] = useState(null);

	// Form state
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		category: 'NPC',
		tags: [],
		avatarUrl: '',
		isPrivate: false,

		// D&D Stats
		armorClass: '',
		hitPoints: '',
		speed: '',

		// Ability Scores
		strength: '',
		dexterity: '',
		constitution: '',
		intelligence: '',
		wisdom: '',
		charisma: '',

		// Combat & Skills
		challengeRating: '',
		proficiencyBonus: '',
		skills: '',
		savingThrows: '',
		damageResistances: '',
		damageImmunities: '',
		conditionImmunities: '',
		senses: '',
		languages: '',

		// D&D Features
		traits: '',
		actions: '',
		legendaryActions: '',
		lairActions: '',
		spellcasting: '',
	});

	const [tagInput, setTagInput] = useState('');

	// Check if user can manage creatures (DM or Admin)
	const canManageCreatures = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	// Prevent hydration issues
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Load creatures
	const loadCreatures = useCallback(async () => {
		if (!session?.user?.activeCampaignId) return;

		setLoading(true);
		try {
			const result = await getCampaignCreatures(session.user.activeCampaignId);
			if (result.success) {
				setCreatures(result.data);
				setFilteredCreatures(result.data);
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError('Failed to load creatures');
		} finally {
			setLoading(false);
		}
	}, [session?.user?.activeCampaignId]);

	useEffect(() => {
		if (session?.user?.activeCampaignId) {
			loadCreatures();
		}
	}, [session?.user?.activeCampaignId, loadCreatures]);

	// Filter creatures based on search, category, tags, and privacy
	useEffect(() => {
		let filtered = creatures;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(creature) =>
					creature.name.toLowerCase().includes(searchTerm.toLowerCase()) || creature.description?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Category filter
		if (selectedCategory && selectedCategory !== 'all') {
			filtered = filtered.filter((creature) => creature.category === selectedCategory);
		}

		// Tag filter
		if (tagFilter) {
			filtered = filtered.filter((creature) => creature.tags.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase())));
		}

		// Private filter (only available for DMs/Admins)
		if (canManageCreatures && privateFilter !== 'all') {
			if (privateFilter === 'private') {
				filtered = filtered.filter((creature) => creature.isPrivate === true);
			} else if (privateFilter === 'public') {
				filtered = filtered.filter((creature) => creature.isPrivate === false);
			}
		}

		setFilteredCreatures(filtered);
	}, [creatures, searchTerm, selectedCategory, tagFilter, privateFilter, canManageCreatures]);

	// Get unique categories
	const categories = [...new Set(creatures.map((c) => c.category))].sort();

	// Reset form
	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			category: 'NPC',
			tags: [],
			avatarUrl: '',
			isPrivate: false,
			armorClass: '',
			hitPoints: '',
			speed: '',
			strength: '',
			dexterity: '',
			constitution: '',
			intelligence: '',
			wisdom: '',
			charisma: '',
			challengeRating: '',
			proficiencyBonus: '',
			skills: '',
			savingThrows: '',
			damageResistances: '',
			damageImmunities: '',
			conditionImmunities: '',
			senses: '',
			languages: '',
			traits: '',
			actions: '',
			legendaryActions: '',
			lairActions: '',
			spellcasting: '',
		});
		setTagInput('');
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			setError('Name is required');
			return;
		}

		try {
			const data = {
				...formData,
				// Convert empty strings to null for numeric fields
				armorClass: formData.armorClass ? parseInt(formData.armorClass) : null,
				hitPoints: formData.hitPoints ? parseInt(formData.hitPoints) : null,
				strength: formData.strength ? parseInt(formData.strength) : null,
				dexterity: formData.dexterity ? parseInt(formData.dexterity) : null,
				constitution: formData.constitution ? parseInt(formData.constitution) : null,
				intelligence: formData.intelligence ? parseInt(formData.intelligence) : null,
				wisdom: formData.wisdom ? parseInt(formData.wisdom) : null,
				charisma: formData.charisma ? parseInt(formData.charisma) : null,
				proficiencyBonus: formData.proficiencyBonus ? parseInt(formData.proficiencyBonus) : null,
			};

			let result;
			if (editingCreature) {
				result = await updateCreature(editingCreature.id, data);
			} else {
				result = await createCreature(data);
			}

			if (result.success) {
				await loadCreatures();
				setShowCreateDialog(false);
				setShowEditDialog(false);
				setEditingCreature(null);
				resetForm();
				setError('');
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError('An unexpected error occurred');
		}
	};

	// Handle edit
	const handleEdit = (creature) => {
		setEditingCreature(creature);
		setFormData({
			name: creature.name,
			description: creature.description || '',
			category: creature.category,
			tags: creature.tags || [],
			avatarUrl: creature.avatarUrl || '',
			isPrivate: creature.isPrivate || false,
			armorClass: creature.armorClass?.toString() || '',
			hitPoints: creature.hitPoints?.toString() || '',
			speed: creature.speed || '',
			strength: creature.strength?.toString() || '',
			dexterity: creature.dexterity?.toString() || '',
			constitution: creature.constitution?.toString() || '',
			intelligence: creature.intelligence?.toString() || '',
			wisdom: creature.wisdom?.toString() || '',
			charisma: creature.charisma?.toString() || '',
			challengeRating: creature.challengeRating || '',
			proficiencyBonus: creature.proficiencyBonus?.toString() || '',
			skills: creature.skills || '',
			savingThrows: creature.savingThrows || '',
			damageResistances: creature.damageResistances || '',
			damageImmunities: creature.damageImmunities || '',
			conditionImmunities: creature.conditionImmunities || '',
			senses: creature.senses || '',
			languages: creature.languages || '',
			traits: creature.traits || '',
			actions: creature.actions || '',
			legendaryActions: creature.legendaryActions || '',
			lairActions: creature.lairActions || '',
			spellcasting: creature.spellcasting || '',
		});
		setShowEditDialog(true);
	};

	// Handle delete
	const handleDelete = async (creatureId) => {
		if (!confirm('Are you sure you want to delete this creature?')) return;

		try {
			const result = await deleteCreature(creatureId);
			if (result.success) {
				await loadCreatures();
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError('Failed to delete creature');
		}
	};

	// Handle creature detail view
	const handleViewCreature = (creature) => {
		setSelectedCreatureForDetail(creature);
		setShowDetailModal(true);
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

	// Generate creature avatar
	const getCreatureAvatar = (creature) => {
		if (creature.avatarUrl) {
			return (
				<img
					src={creature.avatarUrl}
					alt={creature.name}
					className="w-12 h-12 rounded-full object-cover"
					onError={(e) => {
						e.target.style.display = 'none';
						e.target.nextSibling.style.display = 'flex';
					}}
				/>
			);
		}

		// Default avatar with first letter
		const firstLetter = creature.name.charAt(0).toUpperCase();
		const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
		const colorIndex = creature.name.charCodeAt(0) % colors.length;

		return <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${colors[colorIndex]}`}>{firstLetter}</div>;
	};

	// Get small avatar for list view
	const getSmallCreatureAvatar = (creature) => {
		if (creature.avatarUrl) {
			return (
				<img
					src={creature.avatarUrl}
					alt={creature.name}
					className="w-8 h-8 rounded-full object-cover"
					onError={(e) => {
						e.target.style.display = 'none';
						e.target.nextSibling.style.display = 'flex';
					}}
				/>
			);
		}

		// Default small avatar with first letter
		const firstLetter = creature.name.charAt(0).toUpperCase();
		const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
		const colorIndex = creature.name.charCodeAt(0) % colors.length;

		return (
			<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${colors[colorIndex]}`}>{firstLetter}</div>
		);
	};

	// Generate large creature avatar for detail modal
	const getLargeCreatureAvatar = (creature) => {
		if (creature.avatarUrl) {
			return (
				<img
					src={creature.avatarUrl}
					alt={creature.name}
					className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg"
					onError={(e) => {
						e.target.style.display = 'none';
						e.target.nextSibling.style.display = 'flex';
					}}
				/>
			);
		}

		// Default large avatar with first letter
		const firstLetter = creature.name.charAt(0).toUpperCase();
		const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
		const colorIndex = creature.name.charCodeAt(0) % colors.length;

		return (
			<div
				className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto shadow-lg ${colors[colorIndex]}`}
			>
				{firstLetter}
			</div>
		);
	};

	// Generate full-width header image for detail modal
	const getCreatureHeaderImage = (creature) => {
		if (creature.avatarUrl) {
			return (
				<div className="relative w-full h-100 overflow-hidden rounded-t-lg">
					<img
						src={creature.avatarUrl}
						alt={creature.name}
						className="w-full h-full object-cover object-top"
						onError={(e) => {
							e.target.style.display = 'none';
							e.target.parentElement.classList.add('hidden');
							e.target.parentElement.nextElementSibling.classList.remove('hidden');
						}}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
					<div className="absolute bottom-4 left-6 right-6">
						<h1 className="text-3xl font-bold text-white drop-shadow-lg">{creature.name}</h1>
						<div className="flex items-center gap-2 mt-2">
							<Badge variant="outline" className="text-white border-white/60 bg-black/30 backdrop-blur-sm">
								{creature.category}
							</Badge>
							{creature.isPrivate && canManageCreatures && (
								<Badge variant="outline" className="text-white border-red-400 bg-red-900/60 backdrop-blur-sm">
									Private
								</Badge>
							)}
						</div>
					</div>
				</div>
			);
		}

		// Default header with gradient background
		const colors = [
			'from-red-500 to-red-700',
			'from-blue-500 to-blue-700',
			'from-green-500 to-green-700',
			'from-yellow-500 to-yellow-700',
			'from-purple-500 to-purple-700',
			'from-pink-500 to-pink-700',
			'from-indigo-500 to-indigo-700',
			'from-orange-500 to-orange-700',
		];
		const colorIndex = creature.name.charCodeAt(0) % colors.length;
		const firstLetter = creature.name.charAt(0).toUpperCase();

		return (
			<div className={`relative w-full h-64 bg-gradient-to-br ${colors[colorIndex]} rounded-t-lg flex items-center justify-center`}>
				<div className="text-center">
					<div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
						<span className="text-4xl font-bold text-white">{firstLetter}</span>
					</div>
					<h1 className="text-3xl font-bold text-white drop-shadow-lg">{creature.name}</h1>
					<div className="flex items-center justify-center gap-2 mt-2">
						<Badge variant="outline" className="text-white border-white/60 bg-black/30 backdrop-blur-sm">
							{creature.category}
						</Badge>
						{creature.isPrivate && canManageCreatures && (
							<Badge variant="outline" className="text-white border-red-400 bg-red-900/60 backdrop-blur-sm">
								Private
							</Badge>
						)}
					</div>
				</div>
			</div>
		);
	};

	// Check if user can edit creature
	const canEditCreature = (creature) => {
		return session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM' || creature.creatorId === session?.user?.id;
	};

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
								<Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
								<h2 className={`text-2xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Active Campaign</h2>
								<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									Please select an active campaign to view the glossary.
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
				isMounted && session?.user?.darkMode
					? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
					: 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
					<div>
						<h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
							Campaign Glossary
						</h1>
						<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							NPCs, monsters, and creatures for{' '}
							<span className={`font-semibold ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
								{session.user.activeCampaign?.name}
							</span>
						</p>
					</div>

					{/* Create Button */}
					{canManageCreatures && (
						<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
							<DialogTrigger asChild>
								<Button
									onClick={() => {
										resetForm();
										setShowCreateDialog(true);
									}}
									className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg w-full sm:w-auto text-sm sm:text-base"
								>
									<Plus size={16} className="mr-2" />
									Add Creature
								</Button>
							</DialogTrigger>
						</Dialog>
					)}
				</div>

				{/* Search and Filters */}
				<Card className={`mb-6 sm:mb-8 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<CardContent className="pt-4 sm:pt-6">
						<div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${canManageCreatures ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
								<Input
									placeholder="Search creatures..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className={`pl-10 text-sm sm:text-base ${
										session?.user?.darkMode
											? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
											: 'border-purple-200 focus:border-purple-500'
									}`}
								/>
							</div>

							{/* Category Filter */}
							<Select value={selectedCategory} onValueChange={setSelectedCategory}>
								<SelectTrigger
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-500'}`}
								>
									<Filter size={16} className="mr-2 flex-shrink-0" />
									<SelectValue placeholder="All Categories" />
								</SelectTrigger>
								<SelectContent className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600' : ''}>
									<SelectItem value="all">All Categories</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Tag Filter */}
							<div className="relative">
								<Input
									placeholder="Filter by tags..."
									value={tagFilter}
									onChange={(e) => setTagFilter(e.target.value)}
									className={`text-sm sm:text-base ${
										session?.user?.darkMode
											? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
											: 'border-purple-200 focus:border-purple-500'
									}`}
								/>
							</div>

							{/* Private Filter - Only for DMs/Admins */}
							{canManageCreatures && (
								<Select value={privateFilter} onValueChange={setPrivateFilter}>
									<SelectTrigger
										className={`text-sm sm:text-base ${
											session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-500'
										}`}
									>
										<Shield size={16} className="mr-2 flex-shrink-0" />
										<SelectValue placeholder="All Privacy" />
									</SelectTrigger>
									<SelectContent className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600' : ''}>
										<SelectItem value="all">All Privacy</SelectItem>
										<SelectItem value="public">Public Only</SelectItem>
										<SelectItem value="private">Private Only</SelectItem>
									</SelectContent>
								</Select>
							)}

							{/* View Mode Selector */}
							<Select value={viewMode} onValueChange={setViewMode}>
								<SelectTrigger
									className={`text-sm sm:text-base ${
										session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-500'
									}`}
								>
									{viewMode === 'card' ? <LayoutGrid size={16} className="mr-2 flex-shrink-0" /> : <List size={16} className="mr-2 flex-shrink-0" />}
									<SelectValue />
								</SelectTrigger>
								<SelectContent className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600' : ''}>
									<SelectItem value="card">Card View</SelectItem>
									<SelectItem value="list">List View</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Error Display */}
				{error && (
					<Card className={`mb-4 sm:mb-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-red-900/80' : 'bg-red-50/80'}`}>
						<CardContent className="pt-4 sm:pt-6">
							<p className={`text-sm ${session?.user?.darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
						</CardContent>
					</Card>
				)}

				{/* Creatures List */}
				{loading ? (
					<div className="text-center py-8 sm:py-12">
						<div className={`flex flex-col items-center gap-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
							<span className="text-sm sm:text-base">Loading creatures...</span>
						</div>
					</div>
				) : filteredCreatures.length === 0 ? (
					<Card className={`border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardContent className="pt-4 sm:pt-6">
							<div className="text-center py-6 sm:py-8">
								<Users className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-3 sm:mb-4" />
								<h3 className={`text-lg sm:text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
									{creatures.length === 0 ? 'No Creatures Yet' : 'No Results Found'}
								</h3>
								<p className={`mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
									{creatures.length === 0
										? canManageCreatures
											? 'Start building your campaign glossary by adding creatures, NPCs, and monsters!'
											: 'No creatures have been added to this campaign yet.'
										: 'Try adjusting your search or filter criteria.'}
								</p>
							</div>
						</CardContent>
					</Card>
				) : viewMode === 'card' ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
						{filteredCreatures.map((creature) => (
							<Card
								key={creature.id}
								className={`border-0 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-200 cursor-pointer min-h-[200px] w-full ${
									session?.user?.darkMode ? 'bg-gray-800/80 hover:bg-gray-800/90' : 'bg-white/80 hover:bg-white/90'
								}`}
								onClick={() => handleViewCreature(creature)}
							>
								<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
									<div className="flex items-start justify-between gap-2 min-h-[3rem]">
										<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
											{getCreatureAvatar(creature)}
											<div className="hidden">{getCreatureAvatar(creature)}</div>
											<div className="min-w-0 flex-1 overflow-hidden">
												<CardTitle
													className={`text-sm sm:text-base lg:text-lg truncate max-w-[100px] sm:max-w-[130px] lg:max-w-[150px] ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}
												>
													{creature.name}
												</CardTitle>
												<div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
													<Badge
														variant="outline"
														className={`text-xs shrink-0 ${session?.user?.darkMode ? 'border-cyan-400 text-cyan-400' : 'border-purple-600 text-purple-600'}`}
													>
														{creature.category}
													</Badge>
													{creature.isPrivate && canManageCreatures && (
														<Badge
															variant="outline"
															className={`text-xs shrink-0 ${session?.user?.darkMode ? 'border-red-400 text-red-400' : 'border-red-600 text-red-600'}`}
														>
															Private
														</Badge>
													)}
												</div>
											</div>
										</div>
										{canEditCreature(creature) && (
											<div className="flex flex-col gap-1 flex-shrink-0 min-w-[60px] sm:min-w-[70px]">
												<Button
													variant="outline"
													size="sm"
													className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 ${
														session?.user?.darkMode
															? 'border-gray-600 text-gray-300 hover:bg-gray-700'
															: 'border-purple-200 text-purple-600 hover:bg-purple-50'
													}`}
													onClick={(e) => {
														e.stopPropagation();
														handleEdit(creature);
													}}
												>
													<Edit size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 ${
														session?.user?.darkMode
															? 'border-red-600 text-red-400 hover:bg-red-900/50'
															: 'border-red-200 text-red-600 hover:bg-red-50'
													}`}
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(creature.id);
													}}
												>
													<Trash2 size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
									{/* Description */}
									{creature.description && (
										<div
											className={`p-2 sm:p-3 rounded-lg border mb-3 ${
												session?.user?.darkMode
													? 'bg-gray-700/50 border-gray-600'
													: 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'
											}`}
										>
											<p className={`text-xs sm:text-sm leading-relaxed ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
												{creature.description}
											</p>
										</div>
									)}

									{/* Quick Stats */}
									{(creature.armorClass || creature.hitPoints || creature.challengeRating) && (
										<div className="grid grid-cols-3 gap-2 mb-3">
											{creature.armorClass && (
												<div className="text-center">
													<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AC</div>
													<div className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
														{creature.armorClass}
													</div>
												</div>
											)}
											{creature.hitPoints && (
												<div className="text-center">
													<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>HP</div>
													<div className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
														{creature.hitPoints}
													</div>
												</div>
											)}
											{creature.challengeRating && (
												<div className="text-center">
													<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CR</div>
													<div className={`font-medium text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
														{creature.challengeRating}
													</div>
												</div>
											)}
										</div>
									)}

									{/* Tags */}
									{creature.tags && creature.tags.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-3">
											{creature.tags.slice(0, 3).map((tag, index) => (
												<Badge
													key={index}
													variant="secondary"
													className={`text-xs ${session?.user?.darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
												>
													{tag}
												</Badge>
											))}
											{creature.tags.length > 3 && (
												<Badge
													variant="secondary"
													className={`text-xs ${session?.user?.darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
												>
													+{creature.tags.length - 3}
												</Badge>
											)}
										</div>
									)}

									{/* Creator Info */}
									<div className={`text-xs flex items-center gap-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
										<User size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
										<span className="truncate">
											Created by{' '}
											{(creature.creator.campaignMembers && creature.creator.campaignMembers[0]?.characterName) ||
												creature.creator.username ||
												creature.creator.email?.split('@')[0] ||
												'Unknown User'}
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					/* List View */
					<div className="space-y-2">
						{filteredCreatures.map((creature) => (
							<Card
								key={creature.id}
								className={`border-0 shadow-md backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer ${
									session?.user?.darkMode ? 'bg-gray-800/80 hover:bg-gray-800/90' : 'bg-white/80 hover:bg-white/90'
								}`}
								onClick={() => handleViewCreature(creature)}
							>
								<CardContent className="p-3 sm:p-4">
									<div className="flex items-center gap-3 sm:gap-4">
										{/* Small Avatar */}
										<div className="flex-shrink-0">
											{getSmallCreatureAvatar(creature)}
											<div className="hidden">{getSmallCreatureAvatar(creature)}</div>
										</div>

										{/* Name and Category */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
													{creature.name}
												</h3>
												<Badge
													variant="outline"
													className={`text-xs shrink-0 ${session?.user?.darkMode ? 'border-cyan-400 text-cyan-400' : 'border-purple-600 text-purple-600'}`}
												>
													{creature.category}
												</Badge>
												{creature.isPrivate && canManageCreatures && (
													<Badge
														variant="outline"
														className={`text-xs shrink-0 ${session?.user?.darkMode ? 'border-red-400 text-red-400' : 'border-red-600 text-red-600'}`}
													>
														Private
													</Badge>
												)}
											</div>
										</div>

										{/* Quick Stats */}
										{(creature.armorClass || creature.hitPoints || creature.challengeRating) && (
											<div className="hidden sm:flex items-center gap-4 flex-shrink-0">
												{creature.armorClass && (
													<div className="text-center">
														<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AC</div>
														<div className={`font-medium text-sm ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{creature.armorClass}
														</div>
													</div>
												)}
												{creature.hitPoints && (
													<div className="text-center">
														<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>HP</div>
														<div className={`font-medium text-sm ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{creature.hitPoints}
														</div>
													</div>
												)}
												{creature.challengeRating && (
													<div className="text-center">
														<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CR</div>
														<div className={`font-medium text-sm ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{creature.challengeRating}
														</div>
													</div>
												)}
											</div>
										)}

										{/* Edit/Delete Buttons */}
										{canEditCreature(creature) && (
											<div className="flex gap-1 flex-shrink-0 ml-6 sm:ml-8">
												<Button
													variant="outline"
													size="sm"
													className={`h-7 w-7 p-0 ${
														session?.user?.darkMode
															? 'border-gray-600 text-gray-300 hover:bg-gray-700'
															: 'border-purple-200 text-purple-600 hover:bg-purple-50'
													}`}
													onClick={(e) => {
														e.stopPropagation();
														handleEdit(creature);
													}}
												>
													<Edit size={12} />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className={`h-7 w-7 p-0 ${
														session?.user?.darkMode
															? 'border-red-600 text-red-400 hover:bg-red-900/50'
															: 'border-red-200 text-red-600 hover:bg-red-50'
													}`}
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(creature.id);
													}}
												>
													<Trash2 size={12} />
												</Button>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Create/Edit Dialog */}
				<Dialog
					open={showCreateDialog || showEditDialog}
					onOpenChange={(open) => {
						if (!open) {
							setShowCreateDialog(false);
							setShowEditDialog(false);
							setEditingCreature(null);
							resetForm();
							setError('');
						}
					}}
				>
					<DialogContent
						className={`max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto border-0 shadow-xl backdrop-blur-sm ${
							session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'
						}`}
					>
						<DialogHeader>
							<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
								{editingCreature ? 'Edit Creature' : 'Create New Creature'}
							</DialogTitle>
						</DialogHeader>

						<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-32 sm:pb-4">
							{/* Basic Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
								<div>
									<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Name *</Label>
									<Input
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
										placeholder="Creature name"
										required
									/>
								</div>
								<div>
									<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Category</Label>
									<Input
										value={formData.category}
										onChange={(e) => setFormData({ ...formData, category: e.target.value })}
										className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
										placeholder="NPC, Monster, Human, etc."
									/>
								</div>
							</div>

							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</Label>
								<Textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
									placeholder="Describe the creature..."
									rows={3}
								/>
							</div>

							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Avatar URL</Label>
								<Input
									value={formData.avatarUrl}
									onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
									placeholder="https://example.com/image.jpg"
								/>
							</div>

							{/* Tags */}
							<div>
								<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tags</Label>
								<div className="flex flex-col sm:flex-row gap-2 mb-2">
									<Input
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										className={`flex-1 text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
										placeholder="Add a tag..."
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

							{/* Privacy Setting */}
							{canManageCreatures && (
								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="isPrivate"
										checked={formData.isPrivate}
										onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
										className={`w-4 h-4 rounded border-2 focus:ring-2 focus:ring-purple-500 ${
											session?.user?.darkMode
												? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500'
												: 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500'
										}`}
									/>
									<Label htmlFor="isPrivate" className={`text-sm ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
										Private (hidden from players)
									</Label>
								</div>
							)}

							{/* D&D Stats */}
							<div className="space-y-3 sm:space-y-4">
								<h3 className={`text-base sm:text-lg font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>D&D Statistics</h3>

								{/* Basic Combat Stats */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Armor Class</Label>
										<Input
											type="number"
											value={formData.armorClass}
											onChange={(e) => setFormData({ ...formData, armorClass: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Hit Points</Label>
										<Input
											type="number"
											value={formData.hitPoints}
											onChange={(e) => setFormData({ ...formData, hitPoints: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
										/>
									</div>
									<div className="sm:col-span-2 lg:col-span-1">
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Speed</Label>
										<Input
											value={formData.speed}
											onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="30 ft., fly 60 ft."
										/>
									</div>
								</div>

								{/* Ability Scores */}
								<div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
									{['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => (
										<div key={ability}>
											<Label className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
												{ability.charAt(0).toUpperCase() + ability.slice(1, 3).toUpperCase()}
											</Label>
											<Input
												type="number"
												value={formData[ability]}
												onChange={(e) => setFormData({ ...formData, [ability]: e.target.value })}
												className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											/>
										</div>
									))}
								</div>

								{/* Additional Stats */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Challenge Rating</Label>
										<Input
											value={formData.challengeRating}
											onChange={(e) => setFormData({ ...formData, challengeRating: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="1/4, 1, 5, 15, etc."
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Proficiency Bonus</Label>
										<Input
											type="number"
											value={formData.proficiencyBonus}
											onChange={(e) => setFormData({ ...formData, proficiencyBonus: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Senses</Label>
										<Input
											value={formData.senses}
											onChange={(e) => setFormData({ ...formData, senses: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="darkvision 60 ft., passive Perception 12"
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Languages</Label>
										<Input
											value={formData.languages}
											onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="Common, Draconic"
										/>
									</div>
								</div>

								{/* Resistances and Immunities */}
								<div className="grid grid-cols-1 gap-3 sm:gap-4">
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
											Damage Resistances
										</Label>
										<Input
											value={formData.damageResistances}
											onChange={(e) => setFormData({ ...formData, damageResistances: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="fire, cold"
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Damage Immunities</Label>
										<Input
											value={formData.damageImmunities}
											onChange={(e) => setFormData({ ...formData, damageImmunities: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="poison, necrotic"
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
											Condition Immunities
										</Label>
										<Input
											value={formData.conditionImmunities}
											onChange={(e) => setFormData({ ...formData, conditionImmunities: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="charmed, frightened"
										/>
									</div>
								</div>

								{/* Skills and Saves */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Skills</Label>
										<Textarea
											value={formData.skills}
											onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="Perception +5, Stealth +3"
											rows={2}
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Saving Throws</Label>
										<Textarea
											value={formData.savingThrows}
											onChange={(e) => setFormData({ ...formData, savingThrows: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="Dex +6, Wis +4"
											rows={2}
										/>
									</div>
								</div>

								{/* Features */}
								<div className="space-y-3 sm:space-y-4">
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Traits</Label>
										<Textarea
											value={formData.traits}
											onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="Special traits and abilities..."
											rows={3}
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Actions</Label>
										<Textarea
											value={formData.actions}
											onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="Combat actions and attacks..."
											rows={3}
										/>
									</div>
									<div>
										<Label className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Legendary Actions</Label>
										<Textarea
											value={formData.legendaryActions}
											onChange={(e) => setFormData({ ...formData, legendaryActions: e.target.value })}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200'}`}
											placeholder="Legendary actions (if any)..."
											rows={3}
										/>
									</div>
								</div>
							</div>

							{/* Form Actions */}
							<div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
								<Button
									type="button"
									variant="outline"
									className={`w-full sm:w-auto ${session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
									onClick={() => {
										setShowCreateDialog(false);
										setShowEditDialog(false);
										setEditingCreature(null);
										resetForm();
										setError('');
									}}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
								>
									{editingCreature ? 'Update Creature' : 'Create Creature'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>

				{/* Creature Detail Modal */}
				<Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
					<DialogContent
						className={`max-w-3xl max-h-[95vh] w-[95vw] sm:w-full border-0 shadow-xl backdrop-blur-sm p-0 flex flex-col ${
							session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'
						}`}
					>
						{/* Visually hidden title for accessibility */}
						<DialogHeader className="sr-only">
							<DialogTitle>{selectedCreatureForDetail ? selectedCreatureForDetail.name : 'Creature Details'}</DialogTitle>
						</DialogHeader>

						{selectedCreatureForDetail && (
							<div className="h-full flex flex-col relative min-h-0">
								{/* Custom Close Button */}
								<button
									onClick={() => setShowDetailModal(false)}
									className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
									aria-label="Close modal"
								>
									<X size={16} className="text-white" />
								</button>

								{/* Full-width header image */}
								{getCreatureHeaderImage(selectedCreatureForDetail)}

								{/* Scrollable content area */}
								<div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-0">
									{/* Description */}
									{selectedCreatureForDetail.description && (
										<div
											className={`p-3 sm:p-4 rounded-lg border ${
												session?.user?.darkMode
													? 'bg-gray-700/50 border-gray-600'
													: 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'
											}`}
										>
											<h3 className={`text-base sm:text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												Description
											</h3>
											<p className={`text-sm sm:text-base leading-relaxed ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
												{selectedCreatureForDetail.description}
											</p>
										</div>
									)}

									{/* Tags */}
									{selectedCreatureForDetail.tags && selectedCreatureForDetail.tags.length > 0 && (
										<div>
											<h3 className={`text-base sm:text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Tags</h3>
											<div className="flex flex-wrap gap-1 sm:gap-2">
												{selectedCreatureForDetail.tags.map((tag, index) => (
													<Badge
														key={index}
														variant="secondary"
														className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
													>
														{tag}
													</Badge>
												))}
											</div>
										</div>
									)}

									{/* Basic Combat Stats */}
									{(selectedCreatureForDetail.armorClass ||
										selectedCreatureForDetail.hitPoints ||
										selectedCreatureForDetail.speed ||
										selectedCreatureForDetail.challengeRating) && (
										<div
											className={`p-3 sm:p-4 rounded-lg border ${
												session?.user?.darkMode
													? 'bg-gray-700/50 border-gray-600'
													: 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100'
											}`}
										>
											<h3 className={`text-base sm:text-lg font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												Combat Statistics
											</h3>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
												{selectedCreatureForDetail.armorClass && (
													<div className="text-center">
														<div className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Armor Class</div>
														<div className={`text-lg sm:text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{selectedCreatureForDetail.armorClass}
														</div>
													</div>
												)}
												{selectedCreatureForDetail.hitPoints && (
													<div className="text-center">
														<div className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hit Points</div>
														<div className={`text-lg sm:text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{selectedCreatureForDetail.hitPoints}
														</div>
													</div>
												)}
												{selectedCreatureForDetail.speed && (
													<div className="text-center">
														<div className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Speed</div>
														<div className={`text-lg font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{selectedCreatureForDetail.speed}
														</div>
													</div>
												)}
												{selectedCreatureForDetail.challengeRating && (
													<div className="text-center">
														<div className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Challenge Rating</div>
														<div className={`text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{selectedCreatureForDetail.challengeRating}
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Ability Scores */}
									{(selectedCreatureForDetail.strength ||
										selectedCreatureForDetail.dexterity ||
										selectedCreatureForDetail.constitution ||
										selectedCreatureForDetail.intelligence ||
										selectedCreatureForDetail.wisdom ||
										selectedCreatureForDetail.charisma) && (
										<div
											className={`p-4 rounded-lg border ${
												session?.user?.darkMode
													? 'bg-gray-700/50 border-gray-600'
													: 'bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-100'
											}`}
										>
											<h3 className={`text-lg font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Ability Scores</h3>
											<div className="grid grid-cols-3 md:grid-cols-6 gap-4">
												{[
													{ key: 'strength', label: 'STR' },
													{ key: 'dexterity', label: 'DEX' },
													{ key: 'constitution', label: 'CON' },
													{ key: 'intelligence', label: 'INT' },
													{ key: 'wisdom', label: 'WIS' },
													{ key: 'charisma', label: 'CHA' },
												].map(
													({ key, label }) =>
														selectedCreatureForDetail[key] && (
															<div key={key} className="text-center">
																<div className={`text-sm font-medium ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
																<div className={`text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
																	{selectedCreatureForDetail[key]}
																</div>
																<div className={`text-xs ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
																	{Math.floor((selectedCreatureForDetail[key] - 10) / 2) >= 0 ? '+' : ''}
																	{Math.floor((selectedCreatureForDetail[key] - 10) / 2)}
																</div>
															</div>
														)
												)}
											</div>
										</div>
									)}

									{/* Skills and Saves */}
									{(selectedCreatureForDetail.skills || selectedCreatureForDetail.savingThrows || selectedCreatureForDetail.proficiencyBonus) && (
										<div
											className={`p-4 rounded-lg border ${
												session?.user?.darkMode
													? 'bg-gray-700/50 border-gray-600'
													: 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-yellow-100'
											}`}
										>
											<h3 className={`text-lg font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												Skills & Proficiencies
											</h3>
											<div className="space-y-2">
												{selectedCreatureForDetail.proficiencyBonus && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Proficiency Bonus:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>
															+{selectedCreatureForDetail.proficiencyBonus}
														</span>
													</div>
												)}
												{selectedCreatureForDetail.savingThrows && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Saving Throws:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>{selectedCreatureForDetail.savingThrows}</span>
													</div>
												)}
												{selectedCreatureForDetail.skills && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>{selectedCreatureForDetail.skills}</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Resistances and Immunities */}
									{(selectedCreatureForDetail.damageResistances ||
										selectedCreatureForDetail.damageImmunities ||
										selectedCreatureForDetail.conditionImmunities) && (
										<div
											className={`p-4 rounded-lg border ${
												session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-red-50/50 to-pink-50/50 border-red-100'
											}`}
										>
											<h3 className={`text-lg font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												Resistances & Immunities
											</h3>
											<div className="space-y-2">
												{selectedCreatureForDetail.damageResistances && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Damage Resistances:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>
															{selectedCreatureForDetail.damageResistances}
														</span>
													</div>
												)}
												{selectedCreatureForDetail.damageImmunities && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Damage Immunities:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>
															{selectedCreatureForDetail.damageImmunities}
														</span>
													</div>
												)}
												{selectedCreatureForDetail.conditionImmunities && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
															Condition Immunities:
														</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>
															{selectedCreatureForDetail.conditionImmunities}
														</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Senses and Languages */}
									{(selectedCreatureForDetail.senses || selectedCreatureForDetail.languages) && (
										<div
											className={`p-4 rounded-lg border ${
												session?.user?.darkMode
													? 'bg-gray-700/50 border-gray-600'
													: 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-indigo-100'
											}`}
										>
											<h3 className={`text-lg font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Senses & Languages</h3>
											<div className="space-y-2">
												{selectedCreatureForDetail.senses && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Senses:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>{selectedCreatureForDetail.senses}</span>
													</div>
												)}
												{selectedCreatureForDetail.languages && (
													<div>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Languages:</span>{' '}
														<span className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>{selectedCreatureForDetail.languages}</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Special Features */}
									{(selectedCreatureForDetail.traits ||
										selectedCreatureForDetail.actions ||
										selectedCreatureForDetail.legendaryActions ||
										selectedCreatureForDetail.lairActions ||
										selectedCreatureForDetail.spellcasting) && (
										<div className="space-y-4">
											<h3 className={`text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Special Features</h3>

											{selectedCreatureForDetail.traits && (
												<div
													className={`p-4 rounded-lg border ${
														session?.user?.darkMode
															? 'bg-gray-700/50 border-gray-600'
															: 'bg-gradient-to-r from-gray-50/50 to-slate-50/50 border-gray-100'
													}`}
												>
													<h4 className={`text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Traits</h4>
													<div className={`whitespace-pre-wrap ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
														{selectedCreatureForDetail.traits}
													</div>
												</div>
											)}

											{selectedCreatureForDetail.actions && (
												<div
													className={`p-4 rounded-lg border ${
														session?.user?.darkMode
															? 'bg-gray-700/50 border-gray-600'
															: 'bg-gradient-to-r from-gray-50/50 to-slate-50/50 border-gray-100'
													}`}
												>
													<h4 className={`text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Actions</h4>
													<div className={`whitespace-pre-wrap ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
														{selectedCreatureForDetail.actions}
													</div>
												</div>
											)}

											{selectedCreatureForDetail.legendaryActions && (
												<div
													className={`p-4 rounded-lg border ${
														session?.user?.darkMode
															? 'bg-yellow-900/20 border-yellow-600'
															: 'bg-gradient-to-r from-yellow-50/50 to-amber-50/50 border-yellow-200'
													}`}
												>
													<h4 className={`text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
														Legendary Actions
													</h4>
													<div className={`whitespace-pre-wrap ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
														{selectedCreatureForDetail.legendaryActions}
													</div>
												</div>
											)}

											{selectedCreatureForDetail.lairActions && (
												<div
													className={`p-4 rounded-lg border ${
														session?.user?.darkMode
															? 'bg-purple-900/20 border-purple-600'
															: 'bg-gradient-to-r from-purple-50/50 to-violet-50/50 border-purple-200'
													}`}
												>
													<h4 className={`text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
														Lair Actions
													</h4>
													<div className={`whitespace-pre-wrap ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
														{selectedCreatureForDetail.lairActions}
													</div>
												</div>
											)}

											{selectedCreatureForDetail.spellcasting && (
												<div
													className={`p-4 rounded-lg border ${
														session?.user?.darkMode
															? 'bg-blue-900/20 border-blue-600'
															: 'bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-blue-200'
													}`}
												>
													<h4 className={`text-lg font-semibold mb-2 ${session?.user?.darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
														Spellcasting
													</h4>
													<div className={`whitespace-pre-wrap ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
														{selectedCreatureForDetail.spellcasting}
													</div>
												</div>
											)}
										</div>
									)}

									{/* Creator Info */}
									<div className={`text-center text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
										<div className="flex items-center justify-center gap-1">
											<User size={14} />
											<span>
												Created by{' '}
												{(selectedCreatureForDetail.creator?.campaignMembers &&
													selectedCreatureForDetail.creator.campaignMembers[0]?.characterName) ||
													selectedCreatureForDetail.creator?.username ||
													selectedCreatureForDetail.creator?.email?.split('@')[0] ||
													'Unknown User'}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
