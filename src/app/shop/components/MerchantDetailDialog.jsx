'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, MapPin, Package, ShoppingBag, Store, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteMerchant } from '../../admin/components/actions';
import EditMerchantDialog from './EditMerchantDialog';
import EditStockDialog from './EditStockDialog';

export default function MerchantDetailDialog({ open, onOpenChange, merchant, session, onMerchantUpdated, onMerchantDeleted }) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [stockDialogOpen, setStockDialogOpen] = useState(false);

	// Check permissions
	const canEdit = session?.user?.role === 'ADMIN' || session?.user?.campaignRole === 'DM';

	if (!merchant) return null;

	// Group stock by type
	const stapleItems = merchant.stockItems.filter((item) => item.type === 'STAPLE');
	const rotatingItems = merchant.stockItems.filter((item) => item.type === 'ROTATING');

	const handleDelete = async () => {
		if (!confirm(`Are you sure you want to delete ${merchant.name}? This will also delete all their stock items.`)) {
			return;
		}

		try {
			const result = await deleteMerchant(merchant.id);
			if (result.success) {
				onMerchantDeleted(merchant.id);
			} else {
				alert('Failed to delete merchant: ' + result.error);
			}
		} catch (error) {
			alert('Error deleting merchant: ' + error.message);
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
			console.error('Error processing currency in MerchantDetailDialog formatPrice:', error);
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

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					className={`sm:max-w-4xl max-h-[80vh] overflow-y-auto ${
						session?.user?.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
					}`}
				>
					<DialogHeader>
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 pr-8">
							<div className="min-w-0 flex-1">
								<DialogTitle className={`text-xl mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
									<div className="flex items-center gap-2">
										<Store className="h-6 w-6 text-purple-500" />
										{merchant.name}
									</div>
								</DialogTitle>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1">
										<MapPin className={`h-4 w-4 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
										<span className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}>
											{merchant.city}
											{merchant.location && ` • ${merchant.location}`}
										</span>
									</div>
								</div>
							</div>

							{/* Action Buttons for DM/Admin */}
							{canEdit && (
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-0">
									<Button
										size="sm"
										variant="outline"
										onClick={() => setEditDialogOpen(true)}
										className={`text-xs sm:text-sm ${
											session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
										}`}
									>
										<Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
										<span className="hidden sm:inline">Edit Info</span>
										<span className="sm:hidden">Edit</span>
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={handleDelete}
										className="text-xs sm:text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
									>
										<Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
										Delete
									</Button>
								</div>
							)}
						</div>
					</DialogHeader>

					<div className="space-y-6">
						{/* Description */}
						{merchant.description && (
							<div>
								<h3 className={`font-medium mb-2 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>About</h3>
								<p className={`text-sm leading-relaxed ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{merchant.description}</p>
							</div>
						)}

						{/* Stock Management Button for DM/Admin */}
						{canEdit && (
							<div className="flex justify-center py-2 border-y border-gray-200 dark:border-gray-600">
								<Button
									onClick={() => setStockDialogOpen(true)}
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
								>
									<Package className="h-4 w-4 mr-2" />
									Edit Stock
								</Button>
							</div>
						)}

						{/* Stock Display */}
						<div className="space-y-6">
							{/* Staple Stock */}
							{stapleItems.length > 0 && (
								<div>
									<div className="flex items-center gap-2 mb-3">
										<h3 className={`font-medium ${session?.user?.darkMode ? 'text-green-400' : 'text-green-700'}`}>Staple Stock</h3>
										<Badge
											variant="outline"
											className={`${session?.user?.darkMode ? 'border-green-500 text-green-400' : 'border-green-600 text-green-700'}`}
										>
											Always Available
										</Badge>
									</div>
									<div className="grid gap-3 sm:grid-cols-2">
										{stapleItems.map((item) => (
											<div
												key={item.id}
												className={`p-3 rounded-lg border ${
													session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
												}`}
											>
												<div className="flex items-start justify-between">
													<div className="min-w-0 flex-1">
														<h4 className={`font-medium mb-1 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>{item.itemName}</h4>
														{item.description && (
															<p className={`text-sm mb-2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
														)}
														<div className="flex items-center gap-4 text-sm">
															<span className={`font-medium ${session?.user?.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
																{formatPrice(item.price, item.currency)}
															</span>
															{item.quantity !== null && (
																<span className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>Qty: {item.quantity}</span>
															)}
															{!item.available && (
																<Badge variant="secondary" className="text-xs">
																	Unavailable
																</Badge>
															)}
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Rotating Stock */}
							{rotatingItems.length > 0 && (
								<div>
									<div className="flex items-center gap-2 mb-3">
										<h3 className={`font-medium ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Rotating Stock</h3>
										<Badge
											variant="outline"
											className={`${session?.user?.darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700'}`}
										>
											Limited Time
										</Badge>
									</div>
									<div className="grid gap-3 sm:grid-cols-2">
										{rotatingItems.map((item) => (
											<div
												key={item.id}
												className={`p-3 rounded-lg border ${
													session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
												}`}
											>
												<div className="flex items-start justify-between">
													<div className="min-w-0 flex-1">
														<h4 className={`font-medium mb-1 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>{item.itemName}</h4>
														{item.description && (
															<p className={`text-sm mb-2 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
														)}
														<div className="flex items-center gap-4 text-sm">
															<span className={`font-medium ${session?.user?.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
																{formatPrice(item.price, item.currency)}
															</span>
															{item.quantity !== null && (
																<span className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>Qty: {item.quantity}</span>
															)}
															{!item.available && (
																<Badge variant="secondary" className="text-xs">
																	Unavailable
																</Badge>
															)}
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* No Stock Message */}
							{merchant.stockItems.length === 0 && (
								<div className="text-center py-8">
									<ShoppingBag className={`h-12 w-12 mx-auto mb-3 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
									<h3 className={`font-medium mb-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No Stock Available</h3>
									<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
										{canEdit ? 'Click "Edit Stock" to add items' : 'This merchant currently has no items for sale'}
									</p>
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Merchant Dialog */}
			<EditMerchantDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				merchant={merchant}
				session={session}
				onMerchantUpdated={onMerchantUpdated}
			/>

			{/* Edit Stock Dialog */}
			<EditStockDialog
				open={stockDialogOpen}
				onOpenChange={setStockDialogOpen}
				merchant={merchant}
				session={session}
				onMerchantUpdated={onMerchantUpdated}
			/>
		</>
	);
}
