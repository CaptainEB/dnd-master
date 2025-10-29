import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowDown, ArrowUp, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

export default function HistorySection({ checkIns, currencies, darkMode }) {
	const [selectedCheckIn, setSelectedCheckIn] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	// Calculate pagination
	const totalPages = Math.ceil((checkIns?.length || 0) / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentCheckIns = checkIns?.slice(startIndex, endIndex) || [];

	// Reset to page 1 if checkIns change
	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	};

	// Get net profit summary for display
	const getNetProfitSummary = (netProfit) => {
		if (!netProfit) return 'No data';

		const entries = Object.entries(netProfit).filter(([currency, amount]) => Math.abs(amount) >= 0.01);
		if (entries.length === 0) return 'No transactions';

		return entries
			.map(([currency, amount]) => {
				const isPositive = amount >= 0;
				const symbol = isPositive ? '+' : '';
				return `${symbol}${amount.toFixed(2)} ${currency}`;
			})
			.join(' • ');
	};

	// Determine overall profit/loss status
	const getOverallStatus = (netProfit) => {
		if (!netProfit) return 'neutral';

		const values = Object.values(netProfit);
		if (values.length === 0) return 'neutral';

		const totalPositive = values.reduce((sum, val) => sum + (val > 0 ? val : 0), 0);
		const totalNegative = values.reduce((sum, val) => sum + (val < 0 ? Math.abs(val) : 0), 0);

		if (totalPositive > totalNegative) return 'profit';
		if (totalNegative > totalPositive) return 'loss';
		return 'neutral';
	};

	if (!checkIns || checkIns.length === 0) {
		return (
			<Card className={`p-8 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<Calendar size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
				<p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No check-ins recorded yet</p>
				<p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
					Use the "Record Party Return" button to log your first check-in
				</p>
			</Card>
		);
	}

	return (
		<>
			<div className="space-y-3">
				{currentCheckIns.map((checkIn) => {
					const status = getOverallStatus(checkIn.netProfit);
					const statusColor =
						status === 'profit'
							? darkMode
								? 'border-green-500/50 bg-green-900/20'
								: 'border-green-300 bg-green-50'
							: status === 'loss'
								? darkMode
									? 'border-red-500/50 bg-red-900/20'
									: 'border-red-300 bg-red-50'
								: darkMode
									? 'border-gray-600 bg-gray-800'
									: 'border-gray-300 bg-gray-50';

					return (
						<Card
							key={checkIn.id}
							className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${statusColor}`}
							onClick={() => setSelectedCheckIn(checkIn)}
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<Calendar size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
										<span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(checkIn.createdAt)}</span>
										<Clock size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
										<span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{checkIn.weeksAway} weeks</span>
									</div>
									<div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getNetProfitSummary(checkIn.netProfit)}</div>
								</div>
								<div className="flex items-center">
									{status === 'profit' ? (
										<ArrowUp size={24} className={darkMode ? 'text-green-400' : 'text-green-600'} />
									) : status === 'loss' ? (
										<ArrowDown size={24} className={darkMode ? 'text-red-400' : 'text-red-600'} />
									) : (
										<div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
									)}
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-6">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
									className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<PaginationItem key={page}>
									<PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">
										{page}
									</PaginationLink>
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationNext
									onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
									className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}

			{/* Detail Dialog */}
			<Dialog open={!!selectedCheckIn} onOpenChange={() => setSelectedCheckIn(null)}>
				<DialogContent className={`max-w-xs sm:max-w-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
					<DialogHeader>
						<DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>
							Check-In Details - {selectedCheckIn && formatDate(selectedCheckIn.createdAt)}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] pb-4">
						{selectedCheckIn && (
							<>
								{/* Header Info */}
								<div className={`flex items-center gap-4 pb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
									<div className="flex items-center gap-2">
										<Clock size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
										<span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedCheckIn.weeksAway} Weeks Away</span>
									</div>
								</div>

								{/* Completed Crafting Items Section */}
								{selectedCheckIn.breakdown?.completedItems && selectedCheckIn.breakdown.completedItems.length > 0 && (
									<div
										className={`p-4 rounded-lg border ${
											darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
										}`}
									>
										<div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-400/30">
											<span className={`text-lg font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>✨ Crafting Completed</span>
										</div>
										<div className="space-y-2">
											{selectedCheckIn.breakdown.completedItems.map((item, idx) => (
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
								{selectedCheckIn.breakdown?.recurringProduction && selectedCheckIn.breakdown.recurringProduction.length > 0 && (
									<div
										className={`p-4 rounded-lg border ${
											darkMode ? 'bg-green-900/30 border-green-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
										}`}
									>
										<div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-400/30">
											<span className={`text-lg font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>📦 Items Produced</span>
										</div>
										<div className="space-y-2">
											{selectedCheckIn.breakdown.recurringProduction.map((item, idx) => (
												<div key={idx} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
													<span className="font-semibold">{item.facilityName}:</span> {item.totalProduced}× {item.itemName}
													<span className={`ml-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
														({item.completedCycles || Math.floor(item.totalProduced / (item.quantityPerCycle || item.quantityPerWeek || 1))}{' '}
														{(item.completedCycles || 1) === 1 ? 'cycle' : 'cycles'} × {item.quantityPerCycle || item.quantityPerWeek || 1},{' '}
														{item.craftingDuration || 1} {(item.craftingDuration || 1) === 1 ? 'week' : 'weeks'} each)
													</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Breakdown by Currency */}
								{selectedCheckIn.breakdown &&
									Object.entries(selectedCheckIn.breakdown)
										.filter(([key]) => key !== 'completedItems' && key !== 'recurringProduction') // Exclude special sections from currency iteration
										.map(([currency, data]) => {
											// Skip currencies with no transactions
											if (!data || typeof data !== 'object' || (data.totalUpkeep === 0 && data.totalProfit === 0)) return null;

											const netAmount = selectedCheckIn.netProfit?.[currency] || 0;
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
																	?.filter((f) => f.type === 'profit')
																	.map((facility, idx) => (
																		<div key={`f-${idx}`} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																			{facility.name}: {facility.amount.toFixed(2)} {currency} ({facility.perWeek}/week)
																		</div>
																	))}
																{data.hirelings
																	?.filter((h) => h.type === 'profit')
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
																	?.filter((f) => f.type === 'upkeep')
																	.map((facility, idx) => (
																		<div key={`f-${idx}`} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
																			{facility.name}: {facility.amount.toFixed(2)} {currency} ({facility.perWeek}/week)
																		</div>
																	))}
																{data.hirelings
																	?.filter((h) => h.type === 'salary')
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
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
