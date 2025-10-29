import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FacilityDialog({ open, onOpenChange, facility, currencies, onSubmit, darkMode, viewOnly = false }) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		upkeepAmount: '',
		upkeepCurrency: '',
		profitAmount: '',
		profitCurrency: '',
		notes: '',
		craftingItems: [], // [{name: string, weeksRemaining: number, originalWeeks: number}]
		recurringItems: [], // [{name: string, quantity: number, craftingDuration: number}]
	});
	const [newCraftItem, setNewCraftItem] = useState({ name: '', weeks: '' });
	const [newRecurringItem, setNewRecurringItem] = useState({ name: '', quantity: '', craftingDuration: '1' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (facility) {
			setFormData({
				name: facility.name,
				description: facility.description || '',
				upkeepAmount: facility.upkeepAmount?.toString() || '',
				upkeepCurrency: facility.upkeepCurrency || currencies[0]?.abbreviation || '',
				profitAmount: facility.profitAmount?.toString() || '',
				profitCurrency: facility.profitCurrency || currencies[0]?.abbreviation || '',
				notes: facility.notes || '',
				craftingItems: facility.craftingItems || [],
				recurringItems: (facility.recurringItems || []).map((item) => ({
					...item,
					progressWeeks: item.progressWeeks ?? 0, // Ensure progressWeeks exists (backward compatibility)
				})),
			});
		} else {
			setFormData({
				name: '',
				description: '',
				upkeepAmount: '',
				upkeepCurrency: currencies[0]?.abbreviation || '',
				profitAmount: '',
				profitCurrency: currencies[0]?.abbreviation || '',
				notes: '',
				craftingItems: [],
				recurringItems: [],
			});
		}
		setNewCraftItem({ name: '', weeks: '' });
		setNewRecurringItem({ name: '', quantity: '', craftingDuration: '1' });
	}, [facility, currencies, open]);

	const handleAddCraftItem = () => {
		if (!newCraftItem.name.trim() || !newCraftItem.weeks || parseInt(newCraftItem.weeks) <= 0) {
			alert('Please enter item name and valid craft time');
			return;
		}

		const weeks = parseInt(newCraftItem.weeks);
		setFormData({
			...formData,
			craftingItems: [
				...formData.craftingItems,
				{
					name: newCraftItem.name.trim(),
					weeksRemaining: weeks,
					originalWeeks: weeks,
				},
			],
		});
		setNewCraftItem({ name: '', weeks: '' });
	};

	const handleRemoveCraftItem = (index) => {
		setFormData({
			...formData,
			craftingItems: formData.craftingItems.filter((_, i) => i !== index),
		});
	};

	const handleAddRecurringItem = () => {
		if (
			!newRecurringItem.name.trim() ||
			!newRecurringItem.quantity ||
			parseInt(newRecurringItem.quantity) <= 0 ||
			!newRecurringItem.craftingDuration ||
			parseInt(newRecurringItem.craftingDuration) <= 0
		) {
			alert('Please enter item name, valid quantity, and valid crafting duration');
			return;
		}

		const quantity = parseInt(newRecurringItem.quantity);
		const craftingDuration = parseInt(newRecurringItem.craftingDuration);
		setFormData({
			...formData,
			recurringItems: [
				...formData.recurringItems,
				{
					name: newRecurringItem.name.trim(),
					quantity: quantity,
					craftingDuration: craftingDuration,
					progressWeeks: 0, // Initialize progress tracking
				},
			],
		});
		setNewRecurringItem({ name: '', quantity: '', craftingDuration: '1' });
	};

	const handleRemoveRecurringItem = (index) => {
		setFormData({
			...formData,
			recurringItems: formData.recurringItems.filter((_, i) => i !== index),
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			alert('Please enter facility name');
			return;
		}

		// Build submission data with only non-empty fields
		const submitData = {
			name: formData.name.trim(),
			description: formData.description.trim() || null,
			notes: formData.notes.trim() || null,
			craftingItems: formData.craftingItems.length > 0 ? formData.craftingItems : null,
			recurringItems: formData.recurringItems.length > 0 ? formData.recurringItems : null,
		};

		// Add upkeep if provided
		if (formData.upkeepAmount && parseFloat(formData.upkeepAmount) > 0) {
			submitData.upkeepAmount = parseFloat(formData.upkeepAmount);
			submitData.upkeepCurrency = formData.upkeepCurrency;
		} else {
			submitData.upkeepAmount = null;
			submitData.upkeepCurrency = null;
		}

		// Add profit if provided
		if (formData.profitAmount && parseFloat(formData.profitAmount) > 0) {
			submitData.profitAmount = parseFloat(formData.profitAmount);
			submitData.profitCurrency = formData.profitCurrency;
		} else {
			submitData.profitAmount = null;
			submitData.profitCurrency = null;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(submitData);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={`max-w-xs sm:max-w-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>
						{viewOnly ? 'Facility Details' : facility ? 'Edit Facility' : 'Add Facility'}
					</DialogTitle>
				</DialogHeader>

				{viewOnly ? (
					/* View Mode - Info Card Style */
					<div className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-4">
						{/* Name */}
						<div>
							<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formData.name}</h2>
						</div>

						{/* Description */}
						{formData.description && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'
								}`}
							>
								<h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Description</h3>
								<p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formData.description}</p>
							</div>
						)}

						{/* Financial Statistics */}
						{(formData.upkeepAmount || formData.profitAmount) && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100'
								}`}
							>
								<h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Financial Information</h3>
								<div className="grid grid-cols-2 gap-4">
									{formData.upkeepAmount && formData.upkeepCurrency && (
										<div className="text-center">
											<div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Weekly Upkeep</div>
											<div className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
												{formData.upkeepAmount} {formData.upkeepCurrency}
											</div>
										</div>
									)}
									{formData.profitAmount && formData.profitCurrency && (
										<div className="text-center">
											<div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Weekly Profit</div>
											<div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
												{formData.profitAmount} {formData.profitCurrency}
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Crafting Items */}
						{formData.craftingItems && formData.craftingItems.length > 0 && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-indigo-100'
								}`}
							>
								<h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Items in Progress</h3>
								<div className="space-y-2">
									{formData.craftingItems.map((item, idx) => (
										<div key={idx} className={`flex justify-between items-center p-2 rounded ${darkMode ? 'bg-gray-600/50' : 'bg-white/50'}`}>
											<span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</span>
											<span className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
												{item.weeksRemaining} {item.weeksRemaining === 1 ? 'week' : 'weeks'} remaining
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Notes */}
						{formData.notes && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-amber-100'
								}`}
							>
								<h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notes</h3>
								<p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formData.notes}</p>
							</div>
						)}

						{/* Close Button */}
						<Button type="button" onClick={() => onOpenChange(false)} className="w-full" variant="outline">
							Close
						</Button>
					</div>
				) : (
					/* Edit Mode - Form */
					<form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-32 sm:pb-4">
						{/* Facility Name */}
						<div>
							<Label htmlFor="facilityName" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
								Facility Name {!viewOnly && '*'}
							</Label>
							<Input
								id="facilityName"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="e.g., Inn, Blacksmith, Farm"
								className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
								disabled={viewOnly}
								required={!viewOnly}
							/>
						</div>

						{/* Description */}
						<div>
							<Label htmlFor="facilityDescription" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
								Description
							</Label>
							<Textarea
								id="facilityDescription"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Describe this facility..."
								className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
								rows={3}
								disabled={viewOnly}
							/>
						</div>

						{/* Upkeep Amount and Currency (Optional) */}
						<div className="space-y-2">
							<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Weekly Upkeep (Optional)</Label>
							<div className="flex gap-2">
								<Input
									type="number"
									step="0.01"
									value={formData.upkeepAmount}
									onChange={(e) => setFormData({ ...formData, upkeepAmount: e.target.value })}
									placeholder="Amount"
									className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
									disabled={viewOnly}
								/>
								<Select
									value={formData.upkeepCurrency}
									onValueChange={(value) => setFormData({ ...formData, upkeepCurrency: value })}
									disabled={viewOnly}
								>
									<SelectTrigger className={`w-24 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
										{currencies.map((currency) => (
											<SelectItem key={currency.id} value={currency.abbreviation} className={darkMode ? 'text-white' : ''}>
												{currency.abbreviation}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Profit Amount and Currency (Optional) */}
						<div className="space-y-2">
							<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Weekly Profit (Optional)</Label>
							<div className="flex gap-2">
								<Input
									type="number"
									step="0.01"
									value={formData.profitAmount}
									onChange={(e) => setFormData({ ...formData, profitAmount: e.target.value })}
									placeholder="Amount"
									className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
									disabled={viewOnly}
								/>
								<Select
									value={formData.profitCurrency}
									onValueChange={(value) => setFormData({ ...formData, profitCurrency: value })}
									disabled={viewOnly}
								>
									<SelectTrigger className={`w-24 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
										{currencies.map((currency) => (
											<SelectItem key={currency.id} value={currency.abbreviation} className={darkMode ? 'text-white' : ''}>
												{currency.abbreviation}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Notes */}
						<div>
							<Label htmlFor="notes" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
								Notes (Optional)
							</Label>
							<Textarea
								id="notes"
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								placeholder="Keep track of custom information..."
								className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
								rows={3}
								disabled={viewOnly}
							/>
						</div>

						{/* Crafting Items */}
						{!viewOnly && (
							<div className="space-y-2">
								<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Crafting Items</Label>
								<p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									Items that take time to craft. Progress deducts on each party check-in.
								</p>

								{/* Existing Crafting Items */}
								{formData.craftingItems.length > 0 && (
									<div className="space-y-2">
										{formData.craftingItems.map((item, index) => (
											<div
												key={index}
												className={`flex items-center justify-between p-2 rounded ${
													darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
												}`}
											>
												<div>
													<span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</span>
													<span className={`text-sm ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
														{item.weeksRemaining} weeks remaining
													</span>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveCraftItem(index)}
													className={darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700'}
												>
													<X size={16} />
												</Button>
											</div>
										))}
									</div>
								)}

								{/* Add New Crafting Item */}
								<div className="flex gap-2">
									<Input
										value={newCraftItem.name}
										onChange={(e) => setNewCraftItem({ ...newCraftItem, name: e.target.value })}
										placeholder="Item name"
										className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
									/>
									<Input
										type="number"
										min="1"
										value={newCraftItem.weeks}
										onChange={(e) => setNewCraftItem({ ...newCraftItem, weeks: e.target.value })}
										placeholder="Weeks"
										className={`w-24 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
									/>
									<Button
										type="button"
										onClick={handleAddCraftItem}
										size="sm"
										className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
									>
										<Plus size={16} />
									</Button>
								</div>
							</div>
						)}

						{/* Recurring Production */}
						<div className="space-y-2">
							<Label className="text-white/90">Recurring Production</Label>
							<p className="text-sm text-white/60">Items produced weekly on each party check-in</p>

							{/* Display existing recurring items */}
							{formData.recurringItems && formData.recurringItems.length > 0 && (
								<div className="space-y-2 mb-3">
									{formData.recurringItems.map((item, index) => (
										<div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
											<div className="flex-1">
												<div className="text-sm font-medium text-white/90">{item.name}</div>
												<div className="text-xs text-white/60">
													Produces {item.quantity} every {item.craftingDuration || 1} {(item.craftingDuration || 1) === 1 ? 'week' : 'weeks'}
												</div>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveRecurringItem(index)}
												className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
											>
												Remove
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Add new recurring item */}
							<div className="flex gap-2">
								<div className="flex-1">
									<Input
										placeholder="Item name (e.g., Healing Potion)"
										value={newRecurringItem.name}
										onChange={(e) => setNewRecurringItem({ ...newRecurringItem, name: e.target.value })}
										className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
									/>
								</div>
								<div className="w-20">
									<Input
										type="number"
										placeholder="Qty"
										min="1"
										value={newRecurringItem.quantity}
										onChange={(e) => setNewRecurringItem({ ...newRecurringItem, quantity: e.target.value })}
										className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
									/>
								</div>
								<div className="w-24">
									<Input
										type="number"
										placeholder="Weeks"
										min="1"
										value={newRecurringItem.craftingDuration}
										onChange={(e) => setNewRecurringItem({ ...newRecurringItem, craftingDuration: e.target.value })}
										className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
									/>
								</div>
								<Button
									type="button"
									onClick={handleAddRecurringItem}
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
								>
									Add
								</Button>
							</div>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{facility ? 'Updating...' : 'Adding...'}
								</>
							) : (
								<>{facility ? 'Update Facility' : 'Add Facility'}</>
							)}
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
