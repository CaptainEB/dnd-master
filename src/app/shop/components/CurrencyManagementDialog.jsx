'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coins, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCurrency, deleteCurrency, getCampaignCurrencies, initializeDefaultCurrencies, updateCurrency } from '../../admin/components/actions';

const currencySchema = z.object({
	name: z.string().min(1, 'Currency name is required').max(50, 'Currency name must be 50 characters or less'),
	abbreviation: z.string().min(1, 'Abbreviation is required').max(10, 'Abbreviation must be 10 characters or less'),
	description: z.string().max(200, 'Description must be 200 characters or less').optional(),
});

export default function CurrencyManagementDialog({ open, onOpenChange }) {
	const { data: session } = useSession();
	const [currencies, setCurrencies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingCurrency, setEditingCurrency] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const form = useForm({
		resolver: zodResolver(currencySchema),
		defaultValues: {
			name: '',
			abbreviation: '',
			description: '',
		},
	});

	// Load currencies when dialog opens
	useEffect(() => {
		if (open && session?.user?.activeCampaignId) {
			loadCurrencies();
		}
	}, [open, session?.user?.activeCampaignId]);

	const loadCurrencies = async () => {
		setLoading(true);
		try {
			const result = await getCampaignCurrencies(session.user.activeCampaignId);
			if (result.success) {
				setCurrencies(result.data);
			} else {
				console.error('Failed to load currencies:', result.error);
			}
		} catch (error) {
			console.error('Error loading currencies:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (data) => {
		setSubmitting(true);
		try {
			let result;
			if (editingCurrency) {
				result = await updateCurrency(editingCurrency.id, data.name, data.abbreviation, data.description);
			} else {
				result = await createCurrency(session.user.activeCampaignId, data.name, data.abbreviation, data.description);
			}

			if (result.success) {
				await loadCurrencies();
				form.reset();
				setEditingCurrency(null);
			} else {
				console.error('Failed to save currency:', result.error);
				// You could add a toast notification here
			}
		} catch (error) {
			console.error('Error saving currency:', error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (currency) => {
		setEditingCurrency(currency);
		form.setValue('name', currency.name);
		form.setValue('abbreviation', currency.abbreviation);
		form.setValue('description', currency.description || '');
	};

	const handleCancelEdit = () => {
		setEditingCurrency(null);
		form.reset();
	};

	const handleDelete = async (currencyId) => {
		if (!confirm('Are you sure you want to delete this currency? This action cannot be undone.')) {
			return;
		}

		try {
			const result = await deleteCurrency(currencyId);
			if (result.success) {
				await loadCurrencies();
			} else {
				console.error('Failed to delete currency:', result.error);
				alert('Failed to delete currency: ' + result.error);
			}
		} catch (error) {
			console.error('Error deleting currency:', error);
			alert('An error occurred while deleting the currency.');
		}
	};

	const handleInitializeDefaults = async () => {
		if (!confirm('This will add the standard D&D currencies (Gold, Silver, Copper, Electrum, Platinum). Continue?')) {
			return;
		}

		try {
			const result = await initializeDefaultCurrencies(session.user.activeCampaignId);
			if (result.success) {
				await loadCurrencies();
			} else {
				console.error('Failed to initialize default currencies:', result.error);
				alert('Failed to initialize default currencies: ' + result.error);
			}
		} catch (error) {
			console.error('Error initializing default currencies:', error);
			alert('An error occurred while initializing default currencies.');
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`max-w-2xl max-h-[90vh] overflow-y-auto ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
			>
				<DialogHeader>
					<DialogTitle className={`text-lg sm:text-xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
						<div className="flex items-center gap-2">
							<Coins className="h-5 w-5 text-purple-600" />
							Manage Currencies
						</div>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Add/Edit Currency Form */}
					<div className={`p-4 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
						<h3 className={`text-sm font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
							{editingCurrency ? 'Edit Currency' : 'Add New Currency'}
						</h3>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}>Currency Name</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="e.g., Gold Pieces"
														className={
															session?.user?.darkMode
																? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
																: 'bg-white border-gray-300'
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="abbreviation"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}>Abbreviation</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="e.g., gp"
														className={
															session?.user?.darkMode
																? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
																: 'bg-white border-gray-300'
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}>Description (optional)</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													placeholder="e.g., Standard gold currency"
													rows={2}
													className={
														session?.user?.darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400' : 'bg-white border-gray-300'
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex gap-2">
									<Button
										type="submit"
										disabled={submitting}
										className={`flex-1 ${
											session?.user?.darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
										}`}
									>
										{submitting ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : editingCurrency ? (
											<Edit className="h-4 w-4 mr-2" />
										) : (
											<Plus className="h-4 w-4 mr-2" />
										)}
										{editingCurrency ? 'Update Currency' : 'Add Currency'}
									</Button>
									{editingCurrency && (
										<Button
											type="button"
											variant="outline"
											onClick={handleCancelEdit}
											className={
												session?.user?.darkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
											}
										>
											Cancel
										</Button>
									)}
								</div>
							</form>
						</Form>
					</div>

					{/* Existing Currencies List */}
					<div>
						<h3 className={`text-sm font-semibold mb-3 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Current Currencies</h3>

						{loading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-purple-600" />
							</div>
						) : currencies.length === 0 ? (
							<div className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								<Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
								<p className="mb-4">No currencies found. Add your first currency above.</p>
								<Button
									onClick={handleInitializeDefaults}
									variant="outline"
									size="sm"
									className={
										session?.user?.darkMode
											? 'border-gray-600 text-gray-300 hover:bg-gray-700'
											: 'border-gray-300 text-gray-600 hover:bg-gray-50'
									}
								>
									<Coins className="h-4 w-4 mr-2" />
									Initialize Standard D&D Currencies
								</Button>
							</div>
						) : (
							<div className="space-y-2">
								{currencies.map((currency) => (
									<div
										key={currency.id}
										className={`flex items-center justify-between p-3 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
									>
										<div>
											<div className="flex items-center gap-2">
												<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{currency.name}</span>
												<span
													className={`px-2 py-1 text-xs rounded ${
														session?.user?.darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'
													}`}
												>
													{currency.abbreviation}
												</span>
											</div>
											{currency.description && (
												<p className={`text-sm mt-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currency.description}</p>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleEdit(currency)}
												className={
													session?.user?.darkMode
														? 'border-purple-400/50 hover:bg-purple-900/30 text-purple-400'
														: 'border-purple-200 hover:bg-purple-50 text-purple-600'
												}
											>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleDelete(currency.id)}
												className={
													session?.user?.darkMode
														? 'border-red-400/50 hover:bg-red-900/30 text-red-400'
														: 'border-red-200 hover:bg-red-50 text-red-600'
												}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
