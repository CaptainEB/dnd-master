'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, Plus, Search, ShoppingBag, Store } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getCampaignMerchants } from '../admin/components/actions';
import CreateMerchantDialog from './components/CreateMerchantDialog';
import CurrencyManagementDialog from './components/CurrencyManagementDialog';
import MerchantDetailDialog from './components/MerchantDetailDialog';

export default function ShopPage() {
	const { data: session, status } = useSession();
	const [merchants, setMerchants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCity, setSelectedCity] = useState('all');

	// Dialog states
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);
	const [selectedMerchant, setSelectedMerchant] = useState(null);
	const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);

	// Check permissions
	const canEdit = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	// Fetch merchants
	useEffect(() => {
		async function fetchMerchants() {
			if (!session?.user?.activeCampaignId) return;

			try {
				const result = await getCampaignMerchants(session.user.activeCampaignId);
				if (result.success) {
					setMerchants(result.data);
				} else {
					console.error('Failed to fetch merchants:', result.error);
				}
			} catch (error) {
				console.error('Error fetching merchants:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchMerchants();
	}, [session?.user?.activeCampaignId]);

	// Filter merchants
	const filteredMerchants = merchants.filter((merchant) => {
		const matchesSearch =
			merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			merchant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
			merchant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			merchant.stockItems.some(
				(item) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase())
			);

		const matchesCity = selectedCity === 'all' || merchant.city === selectedCity;

		return matchesSearch && matchesCity;
	});

	// Group merchants by city
	const groupedMerchants = {};
	filteredMerchants.forEach((merchant) => {
		if (!groupedMerchants[merchant.city]) {
			groupedMerchants[merchant.city] = [];
		}
		groupedMerchants[merchant.city].push(merchant);
	});

	// Sort cities and merchants within cities
	Object.keys(groupedMerchants).forEach((city) => {
		groupedMerchants[city].sort((a, b) => a.name.localeCompare(b.name));
	});

	// Get unique cities for filter
	const cities = ['all', ...new Set(merchants.map((merchant) => merchant.city))].sort();

	// Handle merchant click
	const handleMerchantClick = (merchant) => {
		setSelectedMerchant(merchant);
		setDetailDialogOpen(true);
	};

	// Handle merchant creation
	const handleMerchantCreated = (newMerchant) => {
		setMerchants([...merchants, newMerchant]);
	};

	// Handle merchant update
	const handleMerchantUpdated = (updatedMerchant) => {
		setMerchants(merchants.map((m) => (m.id === updatedMerchant.id ? updatedMerchant : m)));
		// Also update selectedMerchant if it's the same merchant
		if (selectedMerchant && selectedMerchant.id === updatedMerchant.id) {
			setSelectedMerchant(updatedMerchant);
		}
	};

	// Handle merchant deletion
	const handleMerchantDeleted = (deletedMerchantId) => {
		setMerchants(merchants.filter((m) => m.id !== deletedMerchantId));
		setDetailDialogOpen(false);
		setSelectedMerchant(null);
	};

	// Back to top functionality
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	if (status === 'loading' || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading shops...</p>
				</div>
			</div>
		);
	}

	if (status === 'unauthenticated') {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
					<p className="text-gray-600">Please sign in to view shops.</p>
				</div>
			</div>
		);
	}

	if (!session?.user?.activeCampaignId) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">No Active Campaign</h1>
					<p className="text-gray-600">Join or create a campaign to view shops.</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen pt-28 px-3 sm:px-4 lg:px-8 py-6 sm:py-8 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
			}`}
		>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
						<div className="min-w-0 flex-1">
							<h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
								Shops & Merchants
							</h1>
							<p className="text-sm sm:text-base font-medium text-purple-600">{session.user.activeCampaignName}</p>
						</div>

						{/* Action Buttons */}
						{canEdit && (
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
								<Button
									onClick={() => setCreateDialogOpen(true)}
									className={`text-xs sm:text-sm px-3 sm:px-4 ${
										session?.user?.darkMode
											? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
											: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
									}`}
								>
									<Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
									Add Merchant
								</Button>
								<Button
									onClick={() => setCurrencyDialogOpen(true)}
									variant="outline"
									className={`text-xs sm:text-sm px-3 sm:px-4 ${
										session?.user?.darkMode
											? 'border-purple-400/50 hover:bg-purple-900/30 text-purple-400 hover:text-purple-300'
											: 'border-purple-200 hover:bg-purple-50 text-purple-600'
									}`}
								>
									<Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
									Add Currency
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Search and Filter */}
				<div className="mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
					<div className="flex-1 relative">
						<Search
							className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'}`}
						/>
						<Input
							placeholder="Search merchants, cities, or items..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className={`pl-10 text-sm sm:text-base ${
								session?.user?.darkMode
									? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400'
									: 'border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm'
							}`}
						/>
					</div>

					<Select value={selectedCity} onValueChange={setSelectedCity}>
						<SelectTrigger
							className={`w-full sm:w-48 text-sm sm:text-base ${
								session?.user?.darkMode
									? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-800/80 backdrop-blur-sm text-white'
									: 'border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm'
							}`}
						>
							<SelectValue placeholder="Filter by city" />
						</SelectTrigger>
						<SelectContent className={session?.user?.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}>
							{cities.map((city) => (
								<SelectItem
									key={city}
									value={city}
									className={
										session?.user?.darkMode
											? 'text-gray-200 hover:bg-gray-700 focus:bg-gray-700'
											: 'text-gray-800 hover:bg-gray-100 focus:bg-gray-100'
									}
								>
									{city === 'all' ? 'All Cities' : city}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Merchants List */}
				{Object.keys(groupedMerchants).length === 0 ? (
					<div className="text-center py-12">
						<Store className={`h-16 w-16 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
						<h3 className={`text-lg font-medium mb-2 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
							{searchTerm || selectedCity !== 'all' ? 'No merchants found' : 'No merchants yet'}
						</h3>
						<p className={`${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
							{searchTerm || selectedCity !== 'all'
								? 'Try adjusting your search or filter'
								: canEdit
									? 'Create your first merchant to get started'
									: 'Ask your DM to add some merchants'}
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{Object.keys(groupedMerchants)
							.sort()
							.map((city) => (
								<div key={city} className="space-y-4">
									{/* City Header */}
									<div className="flex items-center gap-3">
										<h2 className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{city}</h2>
										<div className={`flex-1 h-px ${session?.user?.darkMode ? 'bg-gray-600' : 'bg-purple-200'}`}></div>
										<Badge
											variant="secondary"
											className={`${session?.user?.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-purple-100 text-purple-700'}`}
										>
											{groupedMerchants[city].length} merchant{groupedMerchants[city].length !== 1 ? 's' : ''}
										</Badge>
									</div>

									{/* Merchants Grid */}
									<div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
										{groupedMerchants[city].map((merchant) => (
											<div
												key={merchant.id}
												className={`p-4 sm:p-6 rounded-lg border cursor-pointer transition-all duration-200 ${
													session?.user?.darkMode
														? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 hover:border-purple-500'
														: 'bg-white/80 border-purple-200 hover:bg-purple-50/80 hover:border-purple-400'
												} backdrop-blur-sm hover:shadow-lg`}
												onClick={() => handleMerchantClick(merchant)}
											>
												{/* Merchant Header */}
												<div className="flex items-start justify-between mb-3">
													<div className="min-w-0 flex-1">
														<h3 className={`font-semibold text-lg mb-1 truncate ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
															{merchant.name}
														</h3>
														{merchant.location && (
															<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{merchant.location}</p>
														)}
													</div>
													<ShoppingBag className={`h-5 w-5 flex-shrink-0 ml-2 ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
												</div>

												{/* Description */}
												{merchant.description && (
													<p className={`text-sm mb-4 line-clamp-2 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
														{merchant.description}
													</p>
												)}

												{/* Stock Preview */}
												{merchant.stockItems.length > 0 && (
													<div className="space-y-2">
														<h4 className={`text-sm font-medium ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Featured Items:</h4>
														<div className="space-y-1">
															{merchant.stockItems.slice(0, 3).map((item) => {
																// Format price safely
																const formatCurrencyDisplay = (price, currency) => {
																	let currencyDisplay = 'GP';
																	if (currency && typeof currency === 'object') {
																		currencyDisplay = currency.abbreviation || currency.name || 'GP';
																	} else if (currency && typeof currency === 'string') {
																		currencyDisplay = currency;
																	}
																	return `${price} ${currencyDisplay}`;
																};

																return (
																	<div key={item.id} className="flex items-center justify-between text-sm">
																		<span className={`truncate ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.itemName}</span>
																		<span
																			className={`font-medium ml-2 flex-shrink-0 ${session?.user?.darkMode ? 'text-amber-400' : 'text-amber-600'}`}
																		>
																			{formatCurrencyDisplay(item.price, item.currency)}
																		</span>
																	</div>
																);
															})}
															{merchant.stockItems.length > 3 && (
																<p className={`text-xs ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
																	+{merchant.stockItems.length - 3} more items
																</p>
															)}
														</div>
													</div>
												)}

												{/* Stock Summary */}
												<div className="flex items-center justify-between mt-4 pt-3 border-t border-inherit">
													<div className="flex gap-2">
														{merchant.stockItems.filter((item) => item.type === 'STAPLE').length > 0 && (
															<Badge
																variant="outline"
																className={`text-xs ${
																	session?.user?.darkMode ? 'border-green-500 text-green-400' : 'border-green-600 text-green-700'
																}`}
															>
																{merchant.stockItems.filter((item) => item.type === 'STAPLE').length} Staple
															</Badge>
														)}
														{merchant.stockItems.filter((item) => item.type === 'ROTATING').length > 0 && (
															<Badge
																variant="outline"
																className={`text-xs ${session?.user?.darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700'}`}
															>
																{merchant.stockItems.filter((item) => item.type === 'ROTATING').length} Rotating
															</Badge>
														)}
													</div>
													<span className={`text-xs ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Click for details</span>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
					</div>
				)}

				{/* Back to Top Button */}
				{(searchTerm || Object.keys(groupedMerchants).length > 0) && (
					<div className="fixed bottom-6 right-6">
						<button
							onClick={scrollToTop}
							className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
								session?.user?.darkMode
									? 'bg-gray-800 hover:bg-gray-700 text-purple-400 border border-gray-600'
									: 'bg-white hover:bg-purple-50 text-purple-600 border border-purple-200'
							} hover:shadow-xl hover:scale-105`}
							aria-label="Back to top"
						>
							<ArrowUp className="h-5 w-5" />
						</button>
					</div>
				)}

				{/* Dialogs */}
				<CreateMerchantDialog
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
					session={session}
					onMerchantCreated={handleMerchantCreated}
				/>

				<MerchantDetailDialog
					open={detailDialogOpen}
					onOpenChange={setDetailDialogOpen}
					merchant={selectedMerchant}
					session={session}
					onMerchantUpdated={handleMerchantUpdated}
					onMerchantDeleted={handleMerchantDeleted}
				/>

				<CurrencyManagementDialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen} />
			</div>
		</div>
	);
}
