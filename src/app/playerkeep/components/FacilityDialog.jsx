import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

export default function FacilityDialog({ open, onOpenChange, facility, currencies, onSubmit, darkMode }) {
	const [formData, setFormData] = useState({
		name: '',
		upkeepAmount: '',
		upkeepCurrency: '',
		profitAmount: '',
		profitCurrency: '',
	});

	useEffect(() => {
		if (facility) {
			setFormData({
				name: facility.name,
				upkeepAmount: facility.upkeepAmount.toString(),
				upkeepCurrency: facility.upkeepCurrency,
				profitAmount: facility.profitAmount.toString(),
				profitCurrency: facility.profitCurrency,
			});
		} else {
			setFormData({
				name: '',
				upkeepAmount: '',
				upkeepCurrency: currencies[0]?.abbreviation || '',
				profitAmount: '',
				profitCurrency: currencies[0]?.abbreviation || '',
			});
		}
	}, [facility, currencies, open]);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!formData.name.trim() || !formData.upkeepAmount || !formData.profitAmount) {
			alert('Please fill in all fields');
			return;
		}

		onSubmit({
			name: formData.name.trim(),
			upkeepAmount: parseFloat(formData.upkeepAmount),
			upkeepCurrency: formData.upkeepCurrency,
			profitAmount: parseFloat(formData.profitAmount),
			profitCurrency: formData.profitCurrency,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={`max-w-xs sm:max-w-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>{facility ? 'Edit Facility' : 'Add Facility'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-32 sm:pb-4">
					{/* Facility Name */}
					<div>
						<Label htmlFor="facilityName" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
							Facility Name
						</Label>
						<Input
							id="facilityName"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g., Inn, Blacksmith, Farm"
							className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
							required
						/>
					</div>

					{/* Upkeep Amount and Currency */}
					<div className="space-y-2">
						<Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Weekly Upkeep</Label>
						<div className="flex gap-2">
							<Input
								type="number"
								step="0.01"
								value={formData.upkeepAmount}
								onChange={(e) => setFormData({ ...formData, upkeepAmount: e.target.value })}
								placeholder="Amount"
								className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
								required
							/>
							<Select value={formData.upkeepCurrency} onValueChange={(value) => setFormData({ ...formData, upkeepCurrency: value })}>
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
						{facility ? 'Update Facility' : 'Add Facility'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
