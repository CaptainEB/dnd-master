'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	createStockItem,
	deleteStockItem,
	getCampaignCurrencies,
	getCampaignMerchants,
	initializeDefaultCurrencies,
	updateStockItem,
} from '../../admin/components/actions';

export default function EditStockDialog({ open, onOpenChange, merchant, session, onMerchantUpdated }) {
	const [editingItem, setEditingItem] = useState(null);
	const [addingItem, setAddingItem] = useState(false);
	const [activeTab, setActiveTab] = useState('staple');
	const [currencies, setCurrencies] = useState([]);
	const [variablePricing, setVariablePricing] = useState(false);

	// Load currencies when dialog opens
	useEffect(() => {
		if (open && session?.user?.activeCampaignId) {
			loadCurrencies();
		}
	}, [open, session?.user?.activeCampaignId]);

	const loadCurrencies = async () => {
		try {
			const result = await getCampaignCurrencies(session.user.activeCampaignId);
			if (result.success) {
				setCurrencies(result.data);

				// If no currencies exist, initialize defaults
				if (result.data.length === 0) {
					const initResult = await initializeDefaultCurrencies(session.user.activeCampaignId);
					if (initResult.success) {
						setCurrencies(initResult.data);
					}
				}
			} else {
				console.error('Failed to load currencies:', result.error);
			}
		} catch (error) {
			console.error('Error loading currencies:', error);
		}
	};

	const form = useForm({
		defaultValues: {
			itemName: '',
			description: '',
			price: '',
			currencyId: '',
			quantity: '',
			type: 'STAPLE',
			available: true,
		},
	});

	if (!merchant) return null;

	const stapleItems = merchant.stockItems.filter((item) => item.type === 'STAPLE');
	const rotatingItems = merchant.stockItems.filter((item) => item.type === 'ROTATING');

	const startAddItem = (type = 'STAPLE') => {
		const defaultCurrencyId = currencies.length > 0 ? currencies[0].id : '';
		setVariablePricing(false);
		form.reset({
			itemName: '',
			description: '',
			price: '',
			currencyId: defaultCurrencyId,
			quantity: '',
			type: type,
			available: true,
		});
		setEditingItem(null);
		setAddingItem(true);
		// Switch to the appropriate tab
		setActiveTab(type.toLowerCase());
	};

	const startEditItem = (item) => {
		// Handle both old (string currency) and new (currency object) formats
		let currencyId = '';
		if (item.currency && typeof item.currency === 'object') {
			// New format: item has currency relation
			currencyId = item.currency.id;
		} else if (item.currency && typeof item.currency === 'string') {
			// Old format: find currency by abbreviation
			const foundCurrency = currencies.find((c) => c.abbreviation === item.currency);
			currencyId = foundCurrency ? foundCurrency.id : '';
		} else if (item.currencyId) {
			// Direct currency ID reference
			currencyId = item.currencyId;
		}

		// Check if this item has variable pricing (price === -1)
		const isVariablePricing = item.price === -1;
		setVariablePricing(isVariablePricing);

		form.reset({
			itemName: item.itemName,
			description: item.description || '',
			price: isVariablePricing ? '' : item.price.toString(),
			currencyId: currencyId,
			quantity: item.quantity?.toString() || '',
			type: item.type,
			available: item.available,
		});
		setEditingItem(item);
		setAddingItem(false);
		// Switch to the appropriate tab
		setActiveTab(item.type.toLowerCase());
	};

	const cancelForm = () => {
		setEditingItem(null);
		setAddingItem(false);
		setVariablePricing(false);
		form.reset();
	};

	const onSubmit = async (data) => {
		try {
			// Manual validation for price when not using variable pricing
			if (!variablePricing) {
				if (!data.price || data.price.trim() === '') {
					form.setError('price', { message: 'Price is required' });
					return;
				}

				const priceRegex = /^\d+(\.\d{1,2})?$/;
				if (!priceRegex.test(data.price)) {
					form.setError('price', { message: 'Enter a valid price (e.g., 10 or 10.50)' });
					return;
				}
			}

			// Convert price and quantity to numbers
			const formattedData = {
				...data,
				price: variablePricing ? -1 : parseFloat(data.price),
				quantity: data.quantity ? parseInt(data.quantity) : null,
			};

			let result;
			if (editingItem) {
				result = await updateStockItem(editingItem.id, formattedData);
			} else {
				result = await createStockItem(merchant.id, formattedData);
			}

			if (result.success) {
				// Refresh merchant data
				const refreshResult = await getCampaignMerchants(session.user.activeCampaignId);
				if (refreshResult.success) {
					const updatedMerchant = refreshResult.data.find((m) => m.id === merchant.id);
					if (updatedMerchant) {
						onMerchantUpdated(updatedMerchant);
					}
				}
				cancelForm();
			} else {
				form.setError('root', { message: result.error });
			}
		} catch (error) {
			form.setError('root', { message: 'An unexpected error occurred' });
		}
	};

	const handleDeleteItem = async (itemId) => {
		if (!confirm('Are you sure you want to delete this item?')) return;

		try {
			const result = await deleteStockItem(itemId);
			if (result.success) {
				// Refresh merchant data
				const refreshResult = await getCampaignMerchants(session.user.activeCampaignId);
				if (refreshResult.success) {
					const updatedMerchant = refreshResult.data.find((m) => m.id === merchant.id);
					if (updatedMerchant) {
						onMerchantUpdated(updatedMerchant);
					}
				}
			} else {
				alert('Failed to delete item: ' + result.error);
			}
		} catch (error) {
			alert('Error deleting item: ' + error.message);
		}
	};

	const formatPrice = (price, currency) => {
		// Safely extract currency display string
		let currencyDisplay = 'GP'; // Default fallback

		try {
			if (currency) {
				if (typeof currency === 'object' && currency !== null) {
					// Handle currency object - use abbreviation, then name, then fallback
					const abbrev = currency.abbreviation;
					const name = currency.name;

					if (abbrev && typeof abbrev === 'string') {
						currencyDisplay = String(abbrev);
					} else if (name && typeof name === 'string') {
						currencyDisplay = String(name);
					} else {
						currencyDisplay = 'GP';
					}
				} else if (typeof currency === 'string') {
					// Handle currency string
					currencyDisplay = String(currency);
				} else {
					// If currency is neither object nor string, use default
					currencyDisplay = 'GP';
				}
			}
		} catch (error) {
			console.error('Error processing currency in formatPrice:', error);
			currencyDisplay = 'GP';
		}

		// Ensure price is a number
		const numPrice = parseFloat(price) || 0;

		// Check for variable pricing
		if (numPrice === -1) {
			return 'Variable';
		}

		// Return formatted string
		if (numPrice % 1 === 0) {
			return `${numPrice} ${currencyDisplay}`;
		}
		return `${numPrice.toFixed(2)} ${currencyDisplay}`;
	};

	const StockList = ({ items, type }) => (
		<div className="space-y-3">
			{items.map((item) => {
				// Ensure all values are safe for rendering
				const safeItem = {
					id: String(item.id || ''),
					itemName: String(item.itemName || 'Unnamed Item'),
					description: item.description ? String(item.description) : null,
					price: parseFloat(item.price) || 0,
					currency: item.currency,
					quantity: item.quantity,
					available: Boolean(item.available),
				};

				return (
					<div
						key={safeItem.id}
						className={`p-3 rounded-lg border ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
					>
						<div className="flex items-start justify-between">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h4 className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>{safeItem.itemName}</h4>
									{!safeItem.available && (
										<Badge variant="secondary" className="text-xs">
											Unavailable
										</Badge>
									)}
								</div>
								{safeItem.description && (
									<p className={`text-sm mb-2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{safeItem.description}</p>
								)}
								<div className="flex items-center gap-4 text-sm">
									<span className={`font-medium ${session?.user?.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
										{formatPrice(safeItem.price, safeItem.currency)}
									</span>
									{safeItem.quantity !== null && safeItem.quantity !== undefined && (
										<span className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>
											{safeItem.quantity === 0 ? 'Out of Stock' : `Qty: ${String(safeItem.quantity)}`}
										</span>
									)}
								</div>
							</div>
							<div className="flex gap-1 ml-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => startEditItem(item)}
									className={`h-8 w-8 p-0 ${session?.user?.darkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => handleDeleteItem(item.id)}
									className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				);
			})}
			{items.length === 0 && (
				<div className="text-center py-6">
					<Package className={`h-8 w-8 mx-auto mb-2 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
					<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No {type.toLowerCase()} items yet</p>
				</div>
			)}
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`sm:max-w-4xl max-h-[80vh] overflow-y-auto ${
					session?.user?.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
				}`}
			>
				<DialogHeader>
					<DialogTitle className={`flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
						<Package className="h-5 w-5" />
						Manage Stock - {merchant.name}
					</DialogTitle>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className={`grid w-full grid-cols-2 ${session?.user?.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
						<TabsTrigger
							value="staple"
							className={`${
								session?.user?.darkMode
									? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white'
									: 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
							}`}
						>
							Staple Stock ({stapleItems.length})
						</TabsTrigger>
						<TabsTrigger
							value="rotating"
							className={`${
								session?.user?.darkMode
									? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white'
									: 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
							}`}
						>
							Rotating Stock ({rotatingItems.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="staple" className="space-y-4">
						<div className="flex justify-between items-center">
							<div>
								<h3 className={`font-medium ${session?.user?.darkMode ? 'text-green-400' : 'text-green-700'}`}>Staple Stock</h3>
								<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Items that are always available</p>
							</div>
							<Button
								size="sm"
								onClick={() => startAddItem('STAPLE')}
								className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Item
							</Button>
						</div>

						{/* Add/Edit Item Form for Staple Items */}
						{(addingItem || editingItem) && (form.watch('type') === 'STAPLE' || (editingItem && editingItem.type === 'STAPLE')) && (
							<div
								className={`p-4 border rounded-lg ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}
							>
								<h4 className={`font-medium mb-4 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
									{editingItem ? 'Edit Item' : 'Add New Item'}
								</h4>

								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
										<FormField
											control={form.control}
											name="itemName"
											rules={{ required: 'Item name is required' }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Item Name</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="e.g., Health Potion, Magic Sword"
															className={
																session?.user?.darkMode
																	? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																	: 'border-gray-300 focus:border-purple-500'
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description (Optional)</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															placeholder="Describe the item's properties, effects, or appearance..."
															rows={2}
															className={
																session?.user?.darkMode
																	? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																	: 'border-gray-300 focus:border-purple-500'
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<div className="space-y-3">
												<FormField
													control={form.control}
													name="price"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Price</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder={variablePricing ? 'Variable pricing enabled' : '10.50'}
																	type="number"
																	step="0.01"
																	min="0"
																	disabled={variablePricing}
																	className={
																		session?.user?.darkMode
																			? `bg-gray-700 border-gray-600 text-white focus:border-purple-500 ${variablePricing ? 'opacity-50 cursor-not-allowed' : ''}`
																			: `border-gray-300 focus:border-purple-500 ${variablePricing ? 'opacity-50 cursor-not-allowed' : ''}`
																	}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												{/* Variable Pricing Checkbox */}
												<div className="flex items-center space-x-2">
													<input
														type="checkbox"
														id="variablePricing"
														checked={variablePricing}
														onChange={(e) => {
															setVariablePricing(e.target.checked);
															if (e.target.checked) {
																form.setValue('price', '');
																form.clearErrors('price');
															}
														}}
														className={`w-4 h-4 rounded border-2 focus:ring-2 focus:ring-purple-500 ${
															session?.user?.darkMode
																? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500'
																: 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500'
														}`}
													/>
													<label
														htmlFor="variablePricing"
														className={`text-sm font-medium cursor-pointer ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}
													>
														Variable pricing (Ask DM)
													</label>
												</div>
											</div>

											<div className="space-y-3">
												<FormField
													control={form.control}
													name="currencyId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Currency</FormLabel>
															<Select onValueChange={field.onChange} value={field.value}>
																<FormControl>
																	<SelectTrigger
																		className={
																			session?.user?.darkMode
																				? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																				: 'border-gray-300 focus:border-purple-500'
																		}
																	>
																		<SelectValue placeholder="Select currency" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent className={session?.user?.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}>
																	{currencies.map((currency) => (
																		<SelectItem
																			key={currency.id}
																			value={currency.id}
																			className={
																				session?.user?.darkMode
																					? 'text-gray-200 hover:bg-gray-700 focus:bg-gray-700'
																					: 'text-gray-800 hover:bg-gray-100 focus:bg-gray-100'
																			}
																		>
																			{currency.name} ({currency.abbreviation})
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
												{/* Spacer to match checkbox height */}
												<div className="h-6"></div>
											</div>

											<div className="space-y-3">
												<FormField
													control={form.control}
													name="quantity"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Quantity (Optional)</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder="Leave empty for unlimited"
																	type="number"
																	min="0"
																	className={
																		session?.user?.darkMode
																			? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																			: 'border-gray-300 focus:border-purple-500'
																	}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												{/* Spacer to match checkbox height */}
												<div className="h-6"></div>
											</div>
										</div>

										<div className="flex justify-end gap-3">
											<Button
												type="button"
												variant="outline"
												onClick={cancelForm}
												className={
													session?.user?.darkMode
														? 'border-gray-600 text-gray-300 hover:bg-gray-700'
														: 'border-gray-300 text-gray-700 hover:bg-gray-100'
												}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={form.formState.isSubmitting}
												className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
											>
												{form.formState.isSubmitting ? (editingItem ? 'Updating...' : 'Adding...') : editingItem ? 'Update Item' : 'Add Item'}
											</Button>
										</div>
									</form>
								</Form>
							</div>
						)}

						<StockList items={stapleItems} type="Staple" />
					</TabsContent>

					<TabsContent value="rotating" className="space-y-4">
						<div className="flex justify-between items-center">
							<div>
								<h3 className={`font-medium ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Rotating Stock</h3>
								<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Limited time or special items</p>
							</div>
							<Button
								size="sm"
								onClick={() => startAddItem('ROTATING')}
								className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Item
							</Button>
						</div>

						{/* Add/Edit Item Form for Rotating Items */}
						{(addingItem || editingItem) && (form.watch('type') === 'ROTATING' || (editingItem && editingItem.type === 'ROTATING')) && (
							<div
								className={`p-4 border rounded-lg ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}
							>
								<h4 className={`font-medium mb-4 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
									{editingItem ? 'Edit Item' : 'Add New Item'}
								</h4>

								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
										<FormField
											control={form.control}
											name="itemName"
											rules={{ required: 'Item name is required' }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Item Name</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="e.g., Health Potion, Magic Sword"
															className={
																session?.user?.darkMode
																	? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																	: 'border-gray-300 focus:border-purple-500'
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description (Optional)</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															placeholder="Describe the item's properties, effects, or appearance..."
															rows={2}
															className={
																session?.user?.darkMode
																	? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																	: 'border-gray-300 focus:border-purple-500'
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<div className="space-y-3">
												<FormField
													control={form.control}
													name="price"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Price</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder={variablePricing ? 'Variable pricing enabled' : '10.50'}
																	type="number"
																	step="0.01"
																	min="0"
																	disabled={variablePricing}
																	className={
																		session?.user?.darkMode
																			? `bg-gray-700 border-gray-600 text-white focus:border-purple-500 ${variablePricing ? 'opacity-50 cursor-not-allowed' : ''}`
																			: `border-gray-300 focus:border-purple-500 ${variablePricing ? 'opacity-50 cursor-not-allowed' : ''}`
																	}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												{/* Variable Pricing Checkbox */}
												<div className="flex items-center space-x-2">
													<input
														type="checkbox"
														id="variablePricingRotating"
														checked={variablePricing}
														onChange={(e) => {
															setVariablePricing(e.target.checked);
															if (e.target.checked) {
																form.setValue('price', '');
																form.clearErrors('price');
															}
														}}
														className={`w-4 h-4 rounded border-2 focus:ring-2 focus:ring-purple-500 ${
															session?.user?.darkMode
																? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500'
																: 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500'
														}`}
													/>
													<label
														htmlFor="variablePricingRotating"
														className={`text-sm font-medium cursor-pointer ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}
													>
														Variable pricing (Ask DM)
													</label>
												</div>
											</div>

											<div className="space-y-3">
												<FormField
													control={form.control}
													name="currencyId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Currency</FormLabel>
															<Select onValueChange={field.onChange} value={field.value}>
																<FormControl>
																	<SelectTrigger
																		className={
																			session?.user?.darkMode
																				? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																				: 'border-gray-300 focus:border-purple-500'
																		}
																	>
																		<SelectValue placeholder="Select currency" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent className={session?.user?.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}>
																	{currencies.map((currency) => (
																		<SelectItem
																			key={currency.id}
																			value={currency.id}
																			className={
																				session?.user?.darkMode
																					? 'text-gray-200 hover:bg-gray-700 focus:bg-gray-700'
																					: 'text-gray-800 hover:bg-gray-100 focus:bg-gray-100'
																			}
																		>
																			{currency.name} ({currency.abbreviation})
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
												{/* Spacer to match checkbox height */}
												<div className="h-6"></div>
											</div>

											<div className="space-y-3">
												<FormField
													control={form.control}
													name="quantity"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Quantity (Optional)</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder="Leave empty for unlimited"
																	type="number"
																	min="0"
																	className={
																		session?.user?.darkMode
																			? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
																			: 'border-gray-300 focus:border-purple-500'
																	}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												{/* Spacer to match checkbox height */}
												<div className="h-6"></div>
											</div>
										</div>

										<div className="flex justify-end gap-3">
											<Button
												type="button"
												variant="outline"
												onClick={cancelForm}
												className={
													session?.user?.darkMode
														? 'border-gray-600 text-gray-300 hover:bg-gray-700'
														: 'border-gray-300 text-gray-700 hover:bg-gray-100'
												}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={form.formState.isSubmitting}
												className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
											>
												{form.formState.isSubmitting ? (editingItem ? 'Updating...' : 'Adding...') : editingItem ? 'Update Item' : 'Add Item'}
											</Button>
										</div>
									</form>
								</Form>
							</div>
						)}

						<StockList items={rotatingItems} type="Rotating" />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
