'use client';

import {
	createFacility,
	createHireling,
	deleteFacility,
	deleteHireling,
	getCampaignCurrencies,
	getPlayerKeep,
	updateFacility,
	updateHireling,
	updatePlayerKeepDescription,
	updatePlayerKeepIcon,
	updatePlayerKeepNotes,
} from '@/app/admin/components/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Castle, Clock, Edit, ImageIcon, Package, Plus, Trash, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckInDialog from './components/CheckInDialog';
import FacilityDialog from './components/FacilityDialog';
import HirelingDialog from './components/HirelingDialog';
import HistorySection from './components/HistorySection';

export default function PlayerKeepPage() {
	const { data: session } = useSession();
	const [playerKeep, setPlayerKeep] = useState(null);
	const [currencies, setCurrencies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Dialog states
	const [showIconDialog, setShowIconDialog] = useState(false);
	const [showDescDialog, setShowDescDialog] = useState(false);
	const [showNotesDialog, setShowNotesDialog] = useState(false);
	const [showCheckInDialog, setShowCheckInDialog] = useState(false);
	const [showFacilityDialog, setShowFacilityDialog] = useState(false);
	const [showHirelingDialog, setShowHirelingDialog] = useState(false);

	// Edit states
	const [editingFacility, setEditingFacility] = useState(null);
	const [editingHireling, setEditingHireling] = useState(null);
	const [iconUrl, setIconUrl] = useState('');
	const [description, setDescription] = useState('');
	const [notes, setNotes] = useState('');

	// Check permissions
	const canManage = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	// Load player keep data
	const loadPlayerKeep = useCallback(
		async (showLoadingScreen = true) => {
			if (!session?.user?.activeCampaignId) return;

			try {
				if (showLoadingScreen) setLoading(true);
				setError('');

				const [keepResponse, currenciesResponse] = await Promise.all([
					getPlayerKeep(session.user.activeCampaignId),
					getCampaignCurrencies(session.user.activeCampaignId),
				]);

				if (keepResponse.success) {
					setPlayerKeep(keepResponse.data);
					setIconUrl(keepResponse.data.iconUrl || '');
					setDescription(keepResponse.data.description || '');
					setNotes(keepResponse.data.notes || '');
				} else {
					setError(keepResponse.error || 'Failed to load player keep');
				}
				if (currenciesResponse.success) {
					setCurrencies(currenciesResponse.data || []);
				}
			} catch (error) {
				console.error('Error loading player keep:', error);
				setError('Failed to load player keep');
			} finally {
				if (showLoadingScreen) setLoading(false);
			}
		},
		[session?.user?.activeCampaignId]
	);

	useEffect(() => {
		loadPlayerKeep();
	}, [loadPlayerKeep]);

	// Handle icon update
	const handleUpdateIcon = async () => {
		if (!playerKeep?.id || !iconUrl.trim()) return;

		try {
			const response = await updatePlayerKeepIcon(playerKeep.id, iconUrl.trim());

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
				setShowIconDialog(false);
			} else {
				alert(response.error || 'Failed to update icon');
			}
		} catch (error) {
			console.error('Error updating icon:', error);
			alert('Failed to update icon');
		}
	};

	// Handle description update
	const handleUpdateDescription = async () => {
		if (!playerKeep?.id) return;

		try {
			const response = await updatePlayerKeepDescription(playerKeep.id, description.trim());

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
				setShowDescDialog(false);
			} else {
				alert(response.error || 'Failed to update description');
			}
		} catch (error) {
			console.error('Error updating description:', error);
			alert('Failed to update description');
		}
	};

	// Handle notes update
	const handleUpdateNotes = async () => {
		if (!playerKeep?.id) return;

		try {
			const response = await updatePlayerKeepNotes(playerKeep.id, notes.trim());

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
				setShowNotesDialog(false);
			} else {
				alert(response.error || 'Failed to update notes');
			}
		} catch (error) {
			console.error('Error updating notes:', error);
			alert('Failed to update notes');
		}
	};

	// Handle facility operations
	const handleFacilitySubmit = async (facilityData) => {
		try {
			const response = editingFacility
				? await updateFacility(editingFacility.id, facilityData)
				: await createFacility({ ...facilityData, playerKeepId: playerKeep.id });

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
				setShowFacilityDialog(false);
				setEditingFacility(null);
			} else {
				alert(response.error || 'Failed to save facility');
			}
		} catch (error) {
			console.error('Error saving facility:', error);
			alert('Failed to save facility');
		}
	};

	const handleDeleteFacility = async (facilityId) => {
		if (!confirm('Are you sure you want to delete this facility?')) return;

		try {
			const response = await deleteFacility(facilityId);

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
			} else {
				alert(response.error || 'Failed to delete facility');
			}
		} catch (error) {
			console.error('Error deleting facility:', error);
			alert('Failed to delete facility');
		}
	};

	// Handle hireling operations
	const handleHirelingSubmit = async (hirelingData) => {
		try {
			const response = editingHireling
				? await updateHireling(editingHireling.id, hirelingData)
				: await createHireling({ ...hirelingData, playerKeepId: playerKeep.id });

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
				setShowHirelingDialog(false);
				setEditingHireling(null);
			} else {
				alert(response.error || 'Failed to save hireling');
			}
		} catch (error) {
			console.error('Error saving hireling:', error);
			alert('Failed to save hireling');
		}
	};

	const handleDeleteHireling = async (hirelingId) => {
		if (!confirm('Are you sure you want to delete this hireling?')) return;

		try {
			const response = await deleteHireling(hirelingId);

			if (response.success) {
				await loadPlayerKeep(false); // Don't show loading screen on refresh
			} else {
				alert(response.error || 'Failed to delete hireling');
			}
		} catch (error) {
			console.error('Error deleting hireling:', error);
			alert('Failed to delete hireling');
		}
	};

	// Calculate weekly production totals by currency
	const weeklyTotals = useMemo(() => {
		if (!playerKeep) return {};

		const totals = {};

		// Calculate facility costs and profits
		playerKeep.facilities?.forEach((facility) => {
			if (facility.upkeepAmount && facility.upkeepCurrency) {
				if (!totals[facility.upkeepCurrency]) {
					totals[facility.upkeepCurrency] = { upkeep: 0, profit: 0 };
				}
				totals[facility.upkeepCurrency].upkeep += facility.upkeepAmount;
			}

			if (facility.profitAmount && facility.profitCurrency) {
				if (!totals[facility.profitCurrency]) {
					totals[facility.profitCurrency] = { upkeep: 0, profit: 0 };
				}
				totals[facility.profitCurrency].profit += facility.profitAmount;
			}
		});

		// Calculate hireling costs and profits
		playerKeep.hirelings?.forEach((hireling) => {
			if (hireling.salaryAmount && hireling.salaryCurrency) {
				if (!totals[hireling.salaryCurrency]) {
					totals[hireling.salaryCurrency] = { upkeep: 0, profit: 0 };
				}
				totals[hireling.salaryCurrency].upkeep += hireling.salaryAmount;
			}

			if (hireling.profitAmount && hireling.profitCurrency) {
				if (!totals[hireling.profitCurrency]) {
					totals[hireling.profitCurrency] = { upkeep: 0, profit: 0 };
				}
				totals[hireling.profitCurrency].profit += hireling.profitAmount;
			}
		});

		// Calculate net for each currency
		Object.keys(totals).forEach((currency) => {
			totals[currency].net = totals[currency].profit - totals[currency].upkeep;
		});

		return totals;
	}, [playerKeep]);

	if (loading) {
		return (
			<div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
				<div className={`text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Loading player keep...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
				<div className={`text-lg ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${session?.user?.darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
			<div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
				{/* Header Section */}
				<Card className={`border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<CardHeader className="pb-3 sm:pb-4">
						<CardTitle className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
							<Castle className="inline-block mr-2 sm:mr-3 w-8 h-8 sm:w-10 sm:h-10" />
							Player Keep
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 sm:space-y-4">
						{/* Keep Icon and Description */}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
							{/* Icon */}
							<div className="flex-shrink-0">
								{playerKeep?.iconUrl ? (
									<img
										src={playerKeep.iconUrl}
										alt="Player Keep"
										className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover shadow-lg"
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
								) : (
									<div
										className={`w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex items-center justify-center shadow-lg ${
											session?.user?.darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-100 to-blue-100'
										}`}
									>
										<Castle className={`w-12 h-12 sm:w-16 sm:h-16 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
									</div>
								)}
							</div>

							{/* Description */}
							<div className="flex-1 min-w-0">
								{playerKeep?.description ? (
									<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{playerKeep.description}</p>
								) : (
									<p className={`text-sm sm:text-base italic ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No description set</p>
								)}
							</div>

							{/* Action Buttons */}
							{canManage && (
								<div className="flex flex-row sm:flex-col gap-2">
									<Dialog open={showIconDialog} onOpenChange={setShowIconDialog}>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className={
													session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-purple-200 hover:bg-purple-50'
												}
											>
												<ImageIcon size={16} className="mr-2" />
												Icon
											</Button>
										</DialogTrigger>
										<DialogContent className={`max-w-xs sm:max-w-md ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
											<DialogHeader>
												<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>Update Keep Icon</DialogTitle>
											</DialogHeader>
											<div className="space-y-4 pt-4">
												<div>
													<Label htmlFor="iconUrl" className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}>
														Icon URL
													</Label>
													<Input
														id="iconUrl"
														value={iconUrl}
														onChange={(e) => setIconUrl(e.target.value)}
														placeholder="https://example.com/icon.png"
														className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
													/>
												</div>
												<Button
													onClick={handleUpdateIcon}
													className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
												>
													Update Icon
												</Button>
											</div>
										</DialogContent>
									</Dialog>

									<Dialog open={showDescDialog} onOpenChange={setShowDescDialog}>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className={
													session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-purple-200 hover:bg-purple-50'
												}
											>
												<Edit size={16} className="mr-2" />
												Description
											</Button>
										</DialogTrigger>
										<DialogContent className={`max-w-xs sm:max-w-lg ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
											<DialogHeader>
												<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>Update Keep Description</DialogTitle>
											</DialogHeader>
											<div className="space-y-4 pt-4">
												<div>
													<Label htmlFor="description" className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}>
														Description
													</Label>
													<Textarea
														id="description"
														value={description}
														onChange={(e) => setDescription(e.target.value)}
														placeholder="Describe your player keep..."
														rows={4}
														className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
													/>
												</div>
												<Button
													onClick={handleUpdateDescription}
													className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
												>
													Update Description
												</Button>
											</div>
										</DialogContent>
									</Dialog>

									<Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
										<DialogContent className={`max-w-xs sm:max-w-lg ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
											<DialogHeader>
												<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>Update Keep Notes</DialogTitle>
											</DialogHeader>
											<div className="space-y-4 pt-4">
												<div>
													<Label htmlFor="notes" className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}>
														Notes
													</Label>
													<Textarea
														id="notes"
														value={notes}
														onChange={(e) => setNotes(e.target.value)}
														placeholder="Add notes about custom requests, craftable items, player needs, etc..."
														rows={8}
														className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
													/>
												</div>
												<Button
													onClick={handleUpdateNotes}
													className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
												>
													Update Notes
												</Button>
											</div>
										</DialogContent>
									</Dialog>

									<CheckInDialog
										open={showCheckInDialog}
										onOpenChange={setShowCheckInDialog}
										playerKeep={playerKeep}
										currencies={currencies}
										onSuccess={() => loadPlayerKeep(false)}
										darkMode={session?.user?.darkMode}
									/>

									<Button
										onClick={() => setShowCheckInDialog(true)}
										variant="outline"
										size="sm"
										className={`${
											session?.user?.darkMode
												? 'border-purple-600 text-purple-400 hover:bg-purple-900/50'
												: 'border-purple-200 text-purple-600 hover:bg-purple-50'
										}`}
									>
										<Clock size={16} className="mr-2" />
										Record Return
									</Button>
								</div>
							)}
						</div>

						{/* Weekly Production Summary */}
						{Object.keys(weeklyTotals).length > 0 && (
							<div className={`mt-4 pt-4 border-t ${session?.user?.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
								<div className="flex flex-wrap items-center gap-3">
									<span className={`text-xs font-medium ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Weekly Production:</span>
									{Object.entries(weeklyTotals).map(([currency, data]) => {
										const isPositive = data.net > 0;
										const isNegative = data.net < 0;
										const isZero = data.net === 0;

										return (
											<div
												key={currency}
												className={`flex items-center gap-1 text-xs font-medium ${
													isPositive
														? session?.user?.darkMode
															? 'text-green-400'
															: 'text-green-600'
														: isNegative
															? session?.user?.darkMode
																? 'text-red-400'
																: 'text-red-600'
															: session?.user?.darkMode
																? 'text-gray-400'
																: 'text-gray-600'
												}`}
											>
												{isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : null}
												<span>
													{isPositive ? '+' : ''}
													{data.net.toFixed(2)} {currency}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
				{/* Facilities and Hirelings - Side by Side */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Facilities Section */}
					<Card className={`border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<CardTitle className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
								<Castle className="inline-block mr-2 w-6 h-6" />
								Facilities
							</CardTitle>
							{canManage && (
								<Button
									onClick={() => {
										setEditingFacility(null);
										setShowFacilityDialog(true);
									}}
									size="sm"
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
								>
									<Plus size={16} className="mr-1" />
									Add
								</Button>
							)}
						</CardHeader>
						<CardContent>
							{playerKeep?.facilities && playerKeep.facilities.length > 0 ? (
								<div className="grid grid-cols-1 gap-3">
									{playerKeep.facilities.map((facility) => (
										<Card
											key={facility.id}
											className={`border cursor-pointer transition-all hover:shadow-lg ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300'}`}
											onClick={() => {
												setEditingFacility(facility);
												setShowFacilityDialog(true);
											}}
										>
											<CardHeader className="pb-3">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1">
														<CardTitle className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{facility.name}
														</CardTitle>
														{facility.description && (
															<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{facility.description}</p>
														)}
													</div>
													{canManage && (
														<div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
															<Button
																onClick={() => {
																	setEditingFacility(facility);
																	setShowFacilityDialog(true);
																}}
																variant="ghost"
																size="sm"
																className={`h-8 w-8 p-0 ${session?.user?.darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
															>
																<Edit size={16} />
															</Button>
															<Button
																onClick={() => handleDeleteFacility(facility.id)}
																variant="ghost"
																size="sm"
																className={`h-8 w-8 p-0 ${session?.user?.darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
															>
																<Trash size={16} />
															</Button>
														</div>
													)}
												</div>
											</CardHeader>
											<CardContent className="space-y-2">
												{facility.upkeepAmount && facility.upkeepCurrency && (
													<div className="flex items-center justify-between text-sm">
														<span className={`flex items-center ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>
															<TrendingDown size={14} className="mr-1" />
															Upkeep:
														</span>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{facility.upkeepAmount} {facility.upkeepCurrency}/week
														</span>
													</div>
												)}
												{facility.profitAmount && facility.profitCurrency && (
													<div className="flex items-center justify-between text-sm">
														<span className={`flex items-center ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>
															<TrendingUp size={14} className="mr-1" />
															Profit:
														</span>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{facility.profitAmount} {facility.profitCurrency}/week
														</span>
													</div>
												)}
												{facility.craftingItems && facility.craftingItems.length > 0 && (
													<div className="flex items-center justify-between text-sm">
														<span className={`flex items-center ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
															<Clock size={14} className="mr-1" />
															Crafting:
														</span>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{facility.craftingItems.length} {facility.craftingItems.length === 1 ? 'item' : 'items'}
														</span>
													</div>
												)}
												{facility.recurringItems && facility.recurringItems.length > 0 && (
													<div className="flex items-center justify-between text-sm">
														<span className={`flex items-center ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>
															<Package size={14} className="mr-1" />
															Produces:
														</span>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{facility.recurringItems.length} {facility.recurringItems.length === 1 ? 'item' : 'items'}
														</span>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No facilities added yet</p>
							)}
						</CardContent>
					</Card>
					{/* Hirelings Section */}
					<Card className={`border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<CardTitle className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
								<Users className="inline-block mr-2 w-6 h-6" />
								Hirelings
							</CardTitle>
							{canManage && (
								<Button
									onClick={() => {
										setEditingHireling(null);
										setShowHirelingDialog(true);
									}}
									size="sm"
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
								>
									<Plus size={16} className="mr-1" />
									Add
								</Button>
							)}
						</CardHeader>
						<CardContent>
							{playerKeep?.hirelings && playerKeep.hirelings.length > 0 ? (
								<div className="grid grid-cols-1 gap-3">
									{playerKeep.hirelings.map((hireling) => (
										<Card
											key={hireling.id}
											className={`border cursor-pointer transition-all hover:shadow-lg ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300'}`}
											onClick={() => {
												setEditingHireling(hireling);
												setShowHirelingDialog(true);
											}}
										>
											<CardHeader className="pb-3">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1">
														<CardTitle className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{hireling.name}
														</CardTitle>
														{hireling.description && (
															<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{hireling.description}</p>
														)}
													</div>
													{canManage && (
														<div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
															<Button
																onClick={() => {
																	setEditingHireling(hireling);
																	setShowHirelingDialog(true);
																}}
																variant="ghost"
																size="sm"
																className={`h-8 w-8 p-0 ${session?.user?.darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
															>
																<Edit size={16} />
															</Button>
															<Button
																onClick={() => handleDeleteHireling(hireling.id)}
																variant="ghost"
																size="sm"
																className={`h-8 w-8 p-0 ${session?.user?.darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
															>
																<Trash size={16} />
															</Button>
														</div>
													)}
												</div>
											</CardHeader>
											<CardContent className="space-y-2">
												{hireling.salaryAmount && hireling.salaryCurrency && (
													<div className="flex items-center justify-between text-sm">
														<span className={`flex items-center ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>
															<TrendingDown size={14} className="mr-1" />
															Salary:
														</span>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{hireling.salaryAmount} {hireling.salaryCurrency}/week
														</span>
													</div>
												)}
												{hireling.profitAmount && hireling.profitCurrency && (
													<div className="flex items-center justify-between text-sm">
														<span className={`flex items-center ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>
															<TrendingUp size={14} className="mr-1" />
															Profit:
														</span>
														<span className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{hireling.profitAmount} {hireling.profitCurrency}/week
														</span>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hirelings added yet</p>
							)}
						</CardContent>
					</Card>
				</div>
				{/* Keep Notes Section - Only show if has notes or user can manage */}
				{(playerKeep?.notes || canManage) && (
					<Card className={`${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} mb-4`}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className={`flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Keep Notes</CardTitle>
								{canManage && (
									<Button
										onClick={() => setShowNotesDialog(true)}
										variant="outline"
										size="sm"
										className={`flex items-center gap-1 ${session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
									>
										<Edit size={14} />
										Edit
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{playerKeep?.notes ? (
								<div className={`whitespace-pre-wrap ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{playerKeep.notes}</div>
							) : (
								<p className={`text-center py-8 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									No notes yet. Click Edit to add notes for custom requests, items, or other information.
								</p>
							)}
						</CardContent>
					</Card>
				)}
				{/* History Section */}
				<Card className={`${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} mb-4`}>
					<CardHeader className="pb-3">
						<CardTitle className={`flex items-center gap-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
							<Clock size={24} />
							Check-In History
						</CardTitle>
					</CardHeader>
					<CardContent>
						<HistorySection checkIns={playerKeep?.checkIns || []} currencies={currencies} darkMode={session?.user?.darkMode} />
					</CardContent>
				</Card>{' '}
				{/* Facility Dialog */}
				<FacilityDialog
					open={showFacilityDialog}
					onOpenChange={setShowFacilityDialog}
					facility={editingFacility}
					currencies={currencies}
					onSubmit={handleFacilitySubmit}
					darkMode={session?.user?.darkMode}
					viewOnly={!canManage}
				/>
				{/* Hireling Dialog */}
				<HirelingDialog
					open={showHirelingDialog}
					onOpenChange={setShowHirelingDialog}
					hireling={editingHireling}
					currencies={currencies}
					onSubmit={handleHirelingSubmit}
					darkMode={session?.user?.darkMode}
					viewOnly={!canManage}
				/>
			</div>
		</div>
	);
}
