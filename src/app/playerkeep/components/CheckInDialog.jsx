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
			const upkeepTotal = facility.upkeepAmount * weeks;
			const profitTotal = facility.profitAmount * weeks;

			if (!currencyTotals[facility.upkeepCurrency]) {
				currencyTotals[facility.upkeepCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
			}
			if (!currencyTotals[facility.profitCurrency]) {
				currencyTotals[facility.profitCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
			}

			currencyTotals[facility.upkeepCurrency].totalUpkeep += upkeepTotal;
			currencyTotals[facility.profitCurrency].totalProfit += profitTotal;

			currencyTotals[facility.upkeepCurrency].facilities.push({
				name: facility.name,
				type: 'upkeep',
				amount: upkeepTotal,
				currency: facility.upkeepCurrency,
				perWeek: facility.upkeepAmount,
			});

			currencyTotals[facility.profitCurrency].facilities.push({
				name: facility.name,
				type: 'profit',
				amount: profitTotal,
				currency: facility.profitCurrency,
				perWeek: facility.profitAmount,
			});
		});

		// Calculate hireling costs and profits
		playerKeep.hirelings?.forEach((hireling) => {
			const salaryTotal = hireling.salaryAmount * weeks;
			const profitTotal = hireling.profitAmount * weeks;

			if (!currencyTotals[hireling.salaryCurrency]) {
				currencyTotals[hireling.salaryCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
			}
			if (!currencyTotals[hireling.profitCurrency]) {
				currencyTotals[hireling.profitCurrency] = { totalUpkeep: 0, totalProfit: 0, facilities: [], hirelings: [] };
			}

			currencyTotals[hireling.salaryCurrency].totalUpkeep += salaryTotal;
			currencyTotals[hireling.profitCurrency].totalProfit += profitTotal;

			currencyTotals[hireling.salaryCurrency].hirelings.push({
				name: hireling.name,
				type: 'salary',
				amount: salaryTotal,
				currency: hireling.salaryCurrency,
				perWeek: hireling.salaryAmount,
			});

			currencyTotals[hireling.profitCurrency].hirelings.push({
				name: hireling.name,
				type: 'profit',
				amount: profitTotal,
				currency: hireling.profitCurrency,
				perWeek: hireling.profitAmount,
			});
		});

		// Calculate net profit for each currency
		const netProfit = {};
		Object.keys(currencyTotals).forEach((currency) => {
			const data = currencyTotals[currency];
			netProfit[currency] = data.totalProfit - data.totalUpkeep;
		});

		setBreakdown({
			weeks,
			currencyTotals,
			netProfit,
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
