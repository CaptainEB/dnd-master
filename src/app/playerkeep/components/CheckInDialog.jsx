import { createKeepCheckIn } from '@/app/admin/components/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDown, ArrowUp, Calculator } from 'lucide-react';
import { useState } from 'react';

export default function CheckInDialog({ open, onOpenChange, playerKeep, currencies, onSuccess, darkMode }) {
	const [weeksAway, setWeeksAway] = useState('');
	const [showBreakdown, setShowBreakdown] = useState(false);
	const [breakdown, setBreakdown] = useState(null);
	const [processing, setProcessing] = useState(false);

	const calculateBreakdown = () => {
		if (!weeksAway || parseInt(weeksAway) <= 0) {
			alert('Please enter a valid number of weeks');
			return;
		}

		const weeks = parseInt(weeksAway);
		const currencyTotals = {};

		// Initialize currency totals
		currencies.forEach((currency) => {
			currencyTotals[currency.abbreviation] = {
				totalUpkeep: 0,
				totalProfit: 0,
				facilities: [],
				hirelings: [],
			};
		});

		// Calculate facility costs and profits
		playerKeep.facilities?.forEach((facility) => {
			// Only add if values exist
			if (facility.upkeepAmount && facility.upkeepCurrency) {
				const upkeepTotal = facility.upkeepAmount * weeks;

				if (!currencyTotals[facility.upkeepCurrency]) {
					currencyTotals[facility.upkeepCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
				}

				currencyTotals[facility.upkeepCurrency].totalUpkeep += upkeepTotal;
				currencyTotals[facility.upkeepCurrency].facilities.push({
					name: facility.name,
					type: 'upkeep',
					amount: upkeepTotal,
					currency: facility.upkeepCurrency,
					perWeek: facility.upkeepAmount,
				});
			}

			if (facility.profitAmount && facility.profitCurrency) {
				const profitTotal = facility.profitAmount * weeks;

				if (!currencyTotals[facility.profitCurrency]) {
					currencyTotals[facility.profitCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
				}

				currencyTotals[facility.profitCurrency].totalProfit += profitTotal;
				currencyTotals[facility.profitCurrency].facilities.push({
					name: facility.name,
					type: 'profit',
					amount: profitTotal,
					currency: facility.profitCurrency,
					perWeek: facility.profitAmount,
				});
			}
		});

		// Calculate hireling costs and profits
		playerKeep.hirelings?.forEach((hireling) => {
			// Only add if values exist
			if (hireling.salaryAmount && hireling.salaryCurrency) {
				const salaryTotal = hireling.salaryAmount * weeks;

				if (!currencyTotals[hireling.salaryCurrency]) {
					currencyTotals[hireling.salaryCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
				}

				currencyTotals[hireling.salaryCurrency].totalUpkeep += salaryTotal;
				currencyTotals[hireling.salaryCurrency].hirelings.push({
					name: hireling.name,
					type: 'salary',
					amount: salaryTotal,
					currency: hireling.salaryCurrency,
					perWeek: hireling.salaryAmount,
				});
			}

			if (hireling.profitAmount && hireling.profitCurrency) {
				const profitTotal = hireling.profitAmount * weeks;

				if (!currencyTotals[hireling.profitCurrency]) {
					currencyTotals[hireling.profitCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
				}

				currencyTotals[hireling.profitCurrency].totalProfit += profitTotal;
				currencyTotals[hireling.profitCurrency].hirelings.push({
					name: hireling.name,
					type: 'profit',
					amount: profitTotal,
					currency: hireling.profitCurrency,
					perWeek: hireling.profitAmount,
				});
			}
		});

		// Calculate net profit for each currency
		const netProfit = {};
		Object.keys(currencyTotals).forEach((currency) => {
			const data = currencyTotals[currency];
			netProfit[currency] = data.totalProfit - data.totalUpkeep;
		});

		// Calculate completed crafting items
		const completedItems = [];
		playerKeep.facilities?.forEach((facility) => {
			if (facility.craftingItems && Array.isArray(facility.craftingItems)) {
				facility.craftingItems.forEach((item) => {
					if (item.weeksRemaining - weeks <= 0) {
						completedItems.push({
							facilityName: facility.name,
							itemName: item.name,
							weeksToComplete: item.originalWeeks || item.weeksRemaining,
						});
					}
				});
			}
		});

		// Calculate recurring production (with progress tracking)
		const recurringProduction = [];
		playerKeep.facilities?.forEach((facility) => {
			if (facility.recurringItems && Array.isArray(facility.recurringItems)) {
				facility.recurringItems.forEach((item) => {
					const craftingDuration = item.craftingDuration || 1; // Default to 1 week if not specified
					const currentProgress = item.progressWeeks || 0; // Get current progress
					const totalWeeks = currentProgress + weeks; // Add new weeks to progress
					const completedCycles = Math.floor(totalWeeks / craftingDuration); // Calculate completed cycles
					const totalProduced = item.quantity * completedCycles;

					if (totalProduced > 0) {
						recurringProduction.push({
							facilityName: facility.name,
							itemName: item.name,
							quantityPerCycle: item.quantity,
							craftingDuration: craftingDuration,
							completedCycles: completedCycles,
							totalProduced,
							currentProgress: currentProgress, // Include for display
							newProgress: totalWeeks % craftingDuration, // Show what progress will be after
						});
					}
				});
			}
		});

		setBreakdown({
			weeks,
			currencyTotals,
			netProfit,
			completedItems,
			recurringProduction,
		});
		setShowBreakdown(true);
	};

	const handleConfirm = async () => {
		if (!breakdown) return;

		setProcessing(true);
		try {
			const response = await createKeepCheckIn(playerKeep.id, breakdown.weeks, breakdown.currencyTotals, breakdown.netProfit);

			if (response.success) {
				onSuccess();
				setWeeksAway('');
				setBreakdown(null);
				setShowBreakdown(false);
				onOpenChange(false);
			} else {
				alert(response.error || 'Failed to record check-in');
			}
		} catch (error) {
			console.error('Error recording check-in:', error);
			alert('Failed to record check-in');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<>
			{/* Initial Dialog - Enter Weeks */}
			<Dialog
				open={open && !showBreakdown}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						setWeeksAway('');
						onOpenChange(false);
					}
				}}
			>
				<DialogContent className={`max-w-xs sm:max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
					<DialogHeader>
						<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>Record Party Return</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div>
							<Label htmlFor="weeksAway" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
								How many weeks was the party away?
							</Label>
							<Input
								id="weeksAway"
								type="number"
								min="1"
								value={weeksAway}
								onChange={(e) => setWeeksAway(e.target.value)}
								placeholder="Enter number of weeks"
								className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
							/>
						</div>
						<Button
							onClick={calculateBreakdown}
							className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
						>
							<Calculator size={16} className="mr-2" />
							Calculate
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Breakdown Dialog - Show Calculations */}
			<Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
				<DialogContent className={`max-w-xs sm:max-w-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
					<DialogHeader>
						<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>Keep Report - {breakdown?.weeks} Weeks</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-4">
						{/* Completed Crafting Items Section */}
						{breakdown?.completedItems && breakdown.completedItems.length > 0 && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
								}`}
							>
								<div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-400/30">
									<span className={`text-lg font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>✨ Crafting Completed</span>
								</div>
								<div className="space-y-2">
									{breakdown.completedItems.map((item, idx) => (
										<div key={idx} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
											<span className="font-semibold">{item.facilityName}:</span> {item.itemName}
											<span className={`ml-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
												({item.weeksToComplete} {item.weeksToComplete === 1 ? 'week' : 'weeks'})
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Recurring Production Section */}
						{breakdown?.recurringProduction && breakdown.recurringProduction.length > 0 && (
							<div
								className={`p-4 rounded-lg border ${
									darkMode ? 'bg-green-900/30 border-green-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
								}`}
							>
								<div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-400/30">
									<span className={`text-lg font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>📦 Items Produced</span>
								</div>
								<div className="space-y-2">
									{breakdown.recurringProduction.map((item, idx) => (
										<div key={idx} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
											<span className="font-semibold">{item.facilityName}:</span> {item.totalProduced}× {item.itemName}
											<span className={`ml-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
												({item.completedCycles} {item.completedCycles === 1 ? 'cycle' : 'cycles'} × {item.quantityPerCycle}, {item.craftingDuration}{' '}
												{item.craftingDuration === 1 ? 'week' : 'weeks'} each)
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Currency Breakdown */}
						{breakdown &&
							Object.entries(breakdown.currencyTotals).map(([currency, data]) => {
								// Skip currencies with no transactions
								if (data.totalUpkeep === 0 && data.totalProfit === 0) return null;

								const netAmount = breakdown.netProfit[currency];
								const isPositive = netAmount >= 0;

								return (
									<div
										key={currency}
										className={`p-4 rounded-lg border ${
											darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
										}`}
									>
										{/* Currency Header */}
										<div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-400/30">
											<h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currency}</h3>
											<div
												className={`text-xl font-bold ${
													isPositive ? (darkMode ? 'text-green-400' : 'text-green-600') : darkMode ? 'text-red-400' : 'text-red-600'
												}`}
											>
												{isPositive ? '+' : ''}
												{netAmount.toFixed(2)} {currency}
											</div>
										</div>

										{/* Profits Section */}
										{data.totalProfit > 0 && (
											<div className="mb-3">
												<div className={`flex items-center gap-2 mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
													<ArrowUp size={16} />
													<span className="font-semibold">Income</span>
												</div>
												<div className="space-y-1 ml-6">
													{data.facilities
														.filter((f) => f.type === 'profit')
														.map((facility, idx) => (
															<div key={`f-${idx}`} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																{facility.name}: {facility.amount.toFixed(2)} {currency} ({facility.perWeek}/week)
															</div>
														))}
													{data.hirelings
														.filter((h) => h.type === 'profit')
														.map((hireling, idx) => (
															<div key={`h-${idx}`} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																{hireling.name}: {hireling.amount.toFixed(2)} {currency} ({hireling.perWeek}/week)
															</div>
														))}
													<div className={`text-sm font-semibold pt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
														Total: {data.totalProfit.toFixed(2)} {currency}
													</div>
												</div>
											</div>
										)}

										{/* Costs Section */}
										{data.totalUpkeep > 0 && (
											<div>
												<div className={`flex items-center gap-2 mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
													<ArrowDown size={16} />
													<span className="font-semibold">Expenses</span>
												</div>
												<div className="space-y-1 ml-6">
													{data.facilities
														.filter((f) => f.type === 'upkeep')
														.map((facility, idx) => (
															<div key={`f-${idx}`} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																{facility.name}: {facility.amount.toFixed(2)} {currency} ({facility.perWeek}/week)
															</div>
														))}
													{data.hirelings
														.filter((h) => h.type === 'salary')
														.map((hireling, idx) => (
															<div key={`h-${idx}`} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																{hireling.name}: {hireling.amount.toFixed(2)} {currency} ({hireling.perWeek}/week)
															</div>
														))}
													<div className={`text-sm font-semibold pt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
														Total: {data.totalUpkeep.toFixed(2)} {currency}
													</div>
												</div>
											</div>
										)}
									</div>
								);
							})}

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2">
							<Button onClick={() => setShowBreakdown(false)} variant="outline" className="flex-1">
								Back
							</Button>
							<Button
								onClick={handleConfirm}
								disabled={processing}
								className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
							>
								{processing ? 'Recording...' : 'Confirm & Record'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
