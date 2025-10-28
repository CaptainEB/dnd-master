import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

export default function HirelingDialog({ open, onOpenChange, hireling, currencies, onSubmit, darkMode }) {
	const [formData, setFormData] = useState({
		name: '',
		salaryAmount: '',
		salaryCurrency: '',
		profitAmount: '',
		profitCurrency: '',
	});

	useEffect(() => {
		if (hireling) {
			setFormData({
				name: hireling.name,
				salaryAmount: hireling.salaryAmount.toString(),
				salaryCurrency: hireling.salaryCurrency,
				profitAmount: hireling.profitAmount.toString(),
				profitCurrency: hireling.profitCurrency,
			});
		} else {
			setFormData({
				name: '',
				salaryAmount: '',
				salaryCurrency: currencies[0]?.abbreviation || '',
				profitAmount: '',
				profitCurrency: currencies[0]?.abbreviation || '',
			});
		}
	}, [hireling, currencies, open]);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!formData.name.trim() || !formData.salaryAmount || !formData.profitAmount) {
			alert('Please fill in all fields');
			return;
		}

		onSubmit({
			name: formData.name.trim(),
			salaryAmount: parseFloat(formData.salaryAmount),
			salaryCurrency: formData.salaryCurrency,
			profitAmount: parseFloat(formData.profitAmount),
			profitCurrency: formData.profitCurrency,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={`max-w-xs sm:max-w-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>{hireling ? 'Edit Hireling' : 'Add Hireling'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-32 sm:pb-4">
					{/* Hireling Name */}
					<div>
						<Label htmlFor="hirelingName" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
							Hireling Name
						</Label>
						<Input
							id="hirelingName"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g., Guard Captain, Chef, Stable Master"
							className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
							required
						/>
					</div>

					{/* Salary Amount and Currency */}
					<div className="space-y-2">
						<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Weekly Salary</Label>
						<div className="flex gap-2">
							<Input
								type="number"
								step="0.01"
								value={formData.salaryAmount}
								onChange={(e) => setFormData({ ...formData, salaryAmount: e.target.value })}
								placeholder="Amount"
								className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
								required
							/>
							<Select value={formData.salaryCurrency} onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}>
								<SelectTrigger className={`w-24 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
									{currencies.map((currency) => (
										<SelectItem key={currency.id} value={currency.abbreviation}>
											{currency.abbreviation}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Profit Amount and Currency */}
					<div className="space-y-2">
						<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Weekly Profit</Label>
						<div className="flex gap-2">
							<Input
								type="number"
								step="0.01"
								value={formData.profitAmount}
								onChange={(e) => setFormData({ ...formData, profitAmount: e.target.value })}
								placeholder="Amount"
								className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
								required
							/>
							<Select value={formData.profitCurrency} onValueChange={(value) => setFormData({ ...formData, profitCurrency: value })}>
								<SelectTrigger className={`w-24 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
									{currencies.map((currency) => (
										<SelectItem key={currency.id} value={currency.abbreviation}>
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
			</DialogContent>
		</Dialog>
	);
}
