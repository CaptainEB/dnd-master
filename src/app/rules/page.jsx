'use client';

import { createCampaignRule, deleteCampaignRule, getCampaignRules, updateCampaignRule } from '@/app/admin/components/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUp, BookOpen, Edit, Eye, Loader2, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

// Safe date formatting to avoid hydration mismatch
const formatDate = (dateString) => {
	try {
		const date = new Date(dateString);
		return date.toISOString().split('T')[0]; // YYYY-MM-DD format
	} catch {
		return 'Invalid date';
	}
};

const ruleSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	content: z.string().min(1, 'Content is required'),
	category: z.string().min(1, 'Category is required'),
	order: z.number().min(0).default(0),
});

export default function RulesPage() {
	const { data: session } = useSession();
	const [rules, setRules] = useState([]);
	const [loading, setLoading] = useState(true);
	const [mounted, setMounted] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingRule, setEditingRule] = useState(null);
	const [viewMode, setViewMode] = useState('read'); // 'read' or 'edit'

	// Handle client-side mounting to avoid hydration issues
	useEffect(() => {
		setMounted(true);
	}, []);

	// Form for creating rules
	const createForm = useForm({
		resolver: zodResolver(ruleSchema),
		defaultValues: {
			title: '',
			content: '',
			category: 'General',
			order: 0,
		},
	});

	// Form for editing rules
	const editForm = useForm({
		resolver: zodResolver(ruleSchema),
		defaultValues: {
			title: '',
			content: '',
			category: 'General',
			order: 0,
		},
	});

	// Check if user can edit (DM or Admin)
	const canEdit = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	// Load rules
	useEffect(() => {
		loadRules();
	}, [session]);

	const loadRules = async () => {
		if (!session?.user?.activeCampaignId) {
			setLoading(false);
			return;
		}

		try {
			const result = await getCampaignRules(session.user.activeCampaignId);
			if (result.success) {
				setRules(result.data || []);
			} else {
				console.error('Failed to load rules:', result.error);
			}
		} catch (error) {
			console.error('Error loading rules:', error);
		} finally {
			setLoading(false);
		}
	};

	// Get unique categories
	const categories = useMemo(() => {
		const cats = ['all', ...new Set(rules.map((rule) => rule.category))];
		return cats;
	}, [rules]);

	// Filter rules based on search and category
	const filteredRules = useMemo(() => {
		return rules.filter((rule) => {
			const matchesSearch =
				rule.title.toLowerCase().includes(searchTerm.toLowerCase()) || rule.content.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;

			return matchesSearch && matchesCategory;
		});
	}, [rules, searchTerm, selectedCategory]);

	// Group rules by category
	const groupedRules = useMemo(() => {
		const grouped = {};
		filteredRules.forEach((rule) => {
			if (!grouped[rule.category]) {
				grouped[rule.category] = [];
			}
			grouped[rule.category].push(rule);
		});

		// Sort within each category by order, then by creation date
		Object.keys(grouped).forEach((category) => {
			grouped[category].sort((a, b) => {
				if (a.order !== b.order) return a.order - b.order;
				return new Date(a.createdAt) - new Date(b.createdAt);
			});
		});

		return grouped;
	}, [filteredRules]);

	// Handle create rule
	const onCreateSubmit = async (data) => {
		try {
			const result = await createCampaignRule(session.user.activeCampaignId, data);
			if (result.success) {
				setRules((prev) => [...prev, result.data]);
				setCreateDialogOpen(false);
				createForm.reset();
			} else {
				createForm.setError('root', { message: result.error });
			}
		} catch (error) {
			createForm.setError('root', { message: 'An unexpected error occurred' });
		}
	};

	// Handle edit rule
	const openEditDialog = (rule) => {
		setEditingRule(rule);
		editForm.reset({
			title: rule.title,
			content: rule.content,
			category: rule.category,
			order: rule.order,
		});
		setEditDialogOpen(true);
	};

	const onEditSubmit = async (data) => {
		try {
			const result = await updateCampaignRule(editingRule.id, data);
			if (result.success) {
				setRules((prev) => prev.map((rule) => (rule.id === editingRule.id ? result.data : rule)));
				setEditDialogOpen(false);
				setEditingRule(null);
			} else {
				editForm.setError('root', { message: result.error });
			}
		} catch (error) {
			editForm.setError('root', { message: 'An unexpected error occurred' });
		}
	};

	// Handle delete rule
	const handleDeleteRule = async (ruleId) => {
		if (!confirm('Are you sure you want to delete this rule?')) return;

		try {
			const result = await deleteCampaignRule(ruleId);
			if (result.success) {
				setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
			} else {
				alert('Failed to delete rule: ' + result.error);
			}
		} catch (error) {
			alert('An unexpected error occurred while deleting the rule');
		}
	};

	// Generate table of contents
	const generateTOC = () => {
		return Object.keys(groupedRules).map((category) => ({
			category,
			rules: groupedRules[category].map((rule) => ({
				id: rule.id,
				title: rule.title,
			})),
		}));
	};

	if (loading) {
		return (
			<div
				className={`min-h-screen pt-28 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
					session?.user?.darkMode
						? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
						: 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
				}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-center">
						<Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-600" />
						<span className={`ml-2 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading rules...</span>
					</div>
				</div>
			</div>
		);
	}

	if (!session?.user?.activeCampaignId) {
		return (
			<div
				className={`min-h-screen pt-28 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
					session?.user?.darkMode
						? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
						: 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
				}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center">
						<BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-purple-400" />
						<h1 className={`text-xl sm:text-2xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Active Campaign</h1>
						<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							Select an active campaign to view rules.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const toc = generateTOC();

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return (
			<div
				className={`min-h-screen pt-28 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
					session?.user?.darkMode
						? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
						: 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
				}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-center">
						<Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-600" />
						<span className={`ml-2 text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen pt-28 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
						<div className="min-w-0 flex-1">
							<h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
								Campaign Rules
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

							{/* Add Rule Button */}
							{canEdit && (
								<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
									<DialogTrigger asChild>
										<Button
											className={`w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 ${
												session?.user?.darkMode
													? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
													: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
											}`}
										>
											<Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
											Add Rule
										</Button>
									</DialogTrigger>
									<DialogContent
										className={`w-[95vw] max-w-2xl mx-auto border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
									>
										<DialogHeader>
											<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
												Create New Rule
											</DialogTitle>
										</DialogHeader>
										<Form {...createForm}>
											<form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<FormField
														control={createForm.control}
														name="title"
														render={({ field }) => (
															<FormItem>
																<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																	Title
																</FormLabel>
																<FormControl>
																	<Input
																		className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={createForm.control}
														name="category"
														render={({ field }) => (
															<FormItem>
																<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																	Category
																</FormLabel>
																<FormControl>
																	<Input
																		className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<FormField
													control={createForm.control}
													name="content"
													render={({ field }) => (
														<FormItem>
															<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																Content (Markdown Supported)
															</FormLabel>
															<FormControl>
																<Textarea
																	rows={6}
																	className={`text-xs sm:text-sm font-mono max-h-60 sm:max-h-80 overflow-y-auto resize-none ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
																	placeholder="Enter your rule content here. You can use markdown formatting..."
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={createForm.control}
													name="order"
													render={({ field }) => (
														<FormItem>
															<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																Order (for sorting within category)
															</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
																	{...field}
																	onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												{createForm.formState.errors.root && (
													<div
														className={`text-sm p-3 rounded-lg border ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200'}`}
													>
														{createForm.formState.errors.root.message}
													</div>
												)}
												<div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
													<Button
														type="button"
														variant="outline"
														className={`order-2 sm:order-1 ${
															session?.user?.darkMode
																? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
																: 'border-gray-300 hover:bg-gray-50 text-gray-700'
														}`}
														onClick={() => setCreateDialogOpen(false)}
													>
														Cancel
													</Button>
													<Button
														type="submit"
														disabled={createForm.formState.isSubmitting}
														className={`order-1 sm:order-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white`}
													>
														{createForm.formState.isSubmitting ? (
															<>
																<Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
																Creating...
															</>
														) : (
															<>
																<Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
																Create Rule
															</>
														)}
													</Button>
												</div>
											</form>
										</Form>
									</DialogContent>
								</Dialog>
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
							placeholder="Search rules..."
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
				{rules.length === 0 ? (
					<Card className={`backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-purple-200'}`}>
						<CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
							<BookOpen
								className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-400'}`}
							/>
							<h2 className={`text-lg sm:text-xl font-semibold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>No Rules Yet</h2>
							<p className={`text-sm sm:text-base mb-4 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								{canEdit ? 'Get started by creating your first campaign rule.' : "The DM hasn't added any rules yet."}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="relative">
						{/* Fixed Table of Contents - Only visible on large screens */}
						{toc.length > 0 && (
							<div className="hidden lg:block fixed lg:left-10 xl:left-10 2xl:left-60 top-90 w-72 z-40">
								<Card
									className={`backdrop-blur-sm max-h-[calc(100vh-2rem)] flex flex-col shadow-lg ${
										session?.user?.darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-purple-200'
									}`}
								>
									<CardHeader className="pb-3 flex-shrink-0">
										<CardTitle className={`text-lg flex items-center justify-between ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
											Table of Contents
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
									<CardContent className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
										{toc.map((categoryGroup) => (
											<div key={categoryGroup.category}>
												<h4
													className={`font-semibold mb-1 text-sm sticky top-0 bg-inherit py-1 border-b ${
														session?.user?.darkMode ? 'text-purple-400 border-gray-600' : 'text-purple-700 border-purple-100'
													}`}
												>
													{categoryGroup.category}
												</h4>
												<ul className="space-y-0.5 ml-2 mb-3">
													{categoryGroup.rules.map((rule) => (
														<li key={rule.id}>
															<a
																href={`#rule-${rule.id}`}
																className={`text-sm block py-1.5 px-2 rounded transition-all duration-200 hover:translate-x-1 ${
																	session?.user?.darkMode
																		? 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20'
																		: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
																}`}
																onClick={(e) => {
																	e.preventDefault();
																	document.getElementById(`rule-${rule.id}`)?.scrollIntoView({
																		behavior: 'smooth',
																		block: 'start',
																	});
																}}
															>
																{rule.title}
															</a>
														</li>
													))}
												</ul>
											</div>
										))}
									</CardContent>
								</Card>
							</div>
						)}

						{/* Mobile TOC - Collapsible */}
						{toc.length > 0 && (
							<div className="lg:hidden mb-6">
								<Card className={`backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-purple-200'}`}>
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
									<CardContent className="space-y-2 px-4 pb-4">
										{toc.map((categoryGroup) => (
											<div key={categoryGroup.category}>
												<h4 className={`font-semibold mb-1 text-sm ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
													{categoryGroup.category}
												</h4>
												<div className="flex flex-wrap gap-1 ml-2 mb-3">
													{categoryGroup.rules.map((rule) => (
														<button
															key={rule.id}
															onClick={() => {
																document.getElementById(`rule-${rule.id}`)?.scrollIntoView({
																	behavior: 'smooth',
																	block: 'start',
																});
															}}
															className={`text-xs px-2 py-1 rounded transition-colors ${
																session?.user?.darkMode
																	? 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 border border-gray-600'
																	: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-purple-200'
															}`}
														>
															{rule.title}
														</button>
													))}
												</div>
											</div>
										))}
									</CardContent>
								</Card>
							</div>
						)}

						{/* Rules Content */}
						<div className={`${toc.length > 0 ? 'lg:ml-80' : ''} space-y-4 sm:space-y-6`}>
							{Object.keys(groupedRules).map((category) => (
								<div key={category}>
									<h2
										className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 border-b-2 pb-2 ${session?.user?.darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-purple-200'}`}
									>
										{category}
									</h2>
									<div className="space-y-3 sm:space-y-4">
										{groupedRules[category].map((rule) => (
											<Card
												key={rule.id}
												id={`rule-${rule.id}`}
												className={`backdrop-blur-sm hover:shadow-md transition-shadow ${
													session?.user?.darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-purple-200'
												}`}
											>
												<CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
													<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
														<CardTitle className={`text-lg sm:text-xl leading-tight ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{rule.title}
														</CardTitle>
														{viewMode === 'edit' && canEdit && (
															<div className="flex items-center gap-2 flex-shrink-0">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => openEditDialog(rule)}
																	className={`text-xs sm:text-sm ${
																		session?.user?.darkMode
																			? 'border-purple-400/50 hover:bg-purple-900/30 text-purple-400 hover:text-purple-300'
																			: 'border-purple-200 hover:bg-purple-50 text-purple-600'
																	}`}
																>
																	<Edit className="h-3 w-3 sm:h-4 sm:w-4" />
																</Button>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleDeleteRule(rule.id)}
																	className={`text-xs sm:text-sm ${
																		session?.user?.darkMode
																			? 'border-red-400/50 hover:bg-red-900/30 text-red-400 hover:text-red-300'
																			: 'border-red-200 hover:bg-red-50 text-red-600'
																	}`}
																>
																	<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
																</Button>
															</div>
														)}
													</div>
													<div
														className={`flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
													>
														<div className="flex items-center gap-2 flex-wrap">
															<Badge
																variant="outline"
																className={`text-xs ${session?.user?.darkMode ? 'border-purple-400/50 text-purple-400' : 'border-purple-200 text-purple-700'}`}
															>
																{rule.category}
															</Badge>
															<span className="hidden sm:inline">•</span>
															<span className="text-xs">
																By {rule.author.characterName || rule.author.username || rule.author.email?.split('@')[0] || 'Unknown User'}
															</span>
															<span className="hidden sm:inline">•</span>
															<span className="text-xs">{formatDate(rule.createdAt)}</span>
														</div>
													</div>
												</CardHeader>
												<CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
													<div
														className={`p-3 sm:p-4 rounded-lg ${
															session?.user?.darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50'
														}`}
													>
														<div className={`prose prose-sm max-w-none ${session?.user?.darkMode ? 'prose-invert prose-gray' : 'prose-gray'}`}>
															<ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.content}</ReactMarkdown>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Edit Dialog */}
				<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
					<DialogContent
						className={`w-[95vw] max-w-2xl mx-auto border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
					>
						<DialogHeader>
							<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Rule</DialogTitle>
						</DialogHeader>
						<Form {...editForm}>
							<form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<FormField
										control={editForm.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</FormLabel>
												<FormControl>
													<Input
														className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
														{...field}
													/>
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
												<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
													Category
												</FormLabel>
												<FormControl>
													<Input
														className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={editForm.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
												Content (Markdown Supported)
											</FormLabel>
											<FormControl>
												<Textarea
													rows={6}
													className={`text-xs sm:text-sm font-mono max-h-60 sm:max-h-80 overflow-y-auto resize-none ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={editForm.control}
									name="order"
									render={({ field }) => (
										<FormItem>
											<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order</FormLabel>
											<FormControl>
												<Input
													type="number"
													className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{editForm.formState.errors.root && (
									<div
										className={`text-sm p-3 rounded-lg border ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200'}`}
									>
										{editForm.formState.errors.root.message}
									</div>
								)}
								<div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										className={`order-2 sm:order-1 ${
											session?.user?.darkMode
												? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
												: 'border-gray-300 hover:bg-gray-50 text-gray-700'
										}`}
										onClick={() => setEditDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={editForm.formState.isSubmitting}
										className={`order-1 sm:order-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white`}
									>
										{editForm.formState.isSubmitting ? (
											<>
												<Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
												Save Changes
											</>
										)}
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
