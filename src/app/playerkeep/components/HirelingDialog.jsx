import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

export default function HirelingDialog({ open, onOpenChange, hireling, currencies, onSubmit, darkMode, viewOnly = false }) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		salaryAmount: '',
		salaryCurrency: '',
		profitAmount: '',
		profitCurrency: '',
	});

	useEffect(() => {
		if (hireling) {
			setFormData({
				name: hireling.name,
				description: hireling.description || '',
				salaryAmount: hireling.salaryAmount?.toString() || '',
				salaryCurrency: hireling.salaryCurrency || currencies[0]?.abbreviation || '',
				profitAmount: hireling.profitAmount?.toString() || '',
				profitCurrency: hireling.profitCurrency || currencies[0]?.abbreviation || '',
			});
		} else {
			setFormData({
				name: '',
				description: '',
				salaryAmount: '',
				salaryCurrency: currencies[0]?.abbreviation || '',
				profitAmount: '',
				profitCurrency: currencies[0]?.abbreviation || '',
			});
		}
	}, [hireling, currencies, open]);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			alert('Please enter hireling name');
			return;
		}

		// Build submission data with only non-empty fields
		const submitData = {
			name: formData.name.trim(),
			description: formData.description.trim() || null,
		};

		// Add salary if provided
		if (formData.salaryAmount && parseFloat(formData.salaryAmount) > 0) {
			submitData.salaryAmount = parseFloat(formData.salaryAmount);
			submitData.salaryCurrency = formData.salaryCurrency;
		} else {
			submitData.salaryAmount = null;
			submitData.salaryCurrency = null;
		}

		// Add profit if provided
		if (formData.profitAmount && parseFloat(formData.profitAmount) > 0) {
			submitData.profitAmount = parseFloat(formData.profitAmount);
			submitData.profitCurrency = formData.profitCurrency;
		} else {
			submitData.profitAmount = null;
			submitData.profitCurrency = null;
		}

		onSubmit(submitData);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={`max-w-xs sm:max-w-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>
						{viewOnly ? 'Hireling Details' : hireling ? 'Edit Hireling' : 'Add Hireling'}
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
						{(formData.salaryAmount || formData.profitAmount) && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100'
								}`}
							>
								<h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Financial Information</h3>
								<div className="grid grid-cols-2 gap-4">
									{formData.salaryAmount && formData.salaryCurrency && (
										<div className="text-center">
											<div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Weekly Salary</div>
											<div className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
												{formData.salaryAmount} {formData.salaryCurrency}
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

						{/* Close Button */}
						<Button type="button" onClick={() => onOpenChange(false)} className="w-full" variant="outline">
							Close
						</Button>
					</div>
				) : (
					/* Edit Mode - Form */
					<form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-32 sm:pb-4">
						{/* Hireling Name */}
						<div>
							<Label htmlFor="hirelingName" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
								Hireling Name {!viewOnly && '*'}
							</Label>
							<Input
								id="hirelingName"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="e.g., Blacksmith, Guard Captain, Cook"
								className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
								disabled={viewOnly}
								required={!viewOnly}
							/>
						</div>

						{/* Description */}
						<div>
							<Label htmlFor="hirelingDescription" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
								Description
							</Label>
							<Textarea
								id="hirelingDescription"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Describe this hireling..."
								className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
								rows={3}
								disabled={viewOnly}
							/>
						</div>

						{/* Salary Amount and Currency (Optional) */}
						<div className="space-y-2">
							<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Weekly Salary (Optional)</Label>
							<div className="flex gap-2">
								<Input
									type="number"
									step="0.01"
									value={formData.salaryAmount}
									onChange={(e) => setFormData({ ...formData, salaryAmount: e.target.value })}
									placeholder="Amount"
									className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
									disabled={viewOnly}
								/>
								<Select
									value={formData.salaryCurrency}
									onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
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

						{/* Submit Button */}
						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
						>
							{hireling ? 'Update Hireling' : 'Add Hireling'}
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
