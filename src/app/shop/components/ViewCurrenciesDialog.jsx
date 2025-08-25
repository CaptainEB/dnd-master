'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Coins, HelpCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getCampaignCurrencies } from '../../admin/components/actions';

export default function ViewCurrenciesDialog({ open, onOpenChange }) {
	const { data: session } = useSession();
	const [currencies, setCurrencies] = useState([]);
	const [loading, setLoading] = useState(true);

	// Load currencies when dialog opens
	useEffect(() => {
		if (open && session?.user?.activeCampaignId) {
			loadCurrencies();
		}
	}, [open, session?.user?.activeCampaignId]);

	const loadCurrencies = async () => {
		setLoading(true);
		try {
			const result = await getCampaignCurrencies(session.user.activeCampaignId);
			if (result.success) {
				setCurrencies(result.data);
			} else {
				console.error('Failed to load currencies:', result.error);
			}
		} catch (error) {
			console.error('Error loading currencies:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`max-w-2xl max-h-[80vh] overflow-hidden ${session?.user?.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
			>
				<DialogHeader>
					<DialogTitle className={`flex items-center gap-2 text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
						<Coins className="h-5 w-5 text-yellow-500" />
						Campaign Currencies
					</DialogTitle>
				</DialogHeader>

				<div className="overflow-y-auto pr-2">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
						</div>
					) : currencies.length === 0 ? (
						<div className="text-center py-8">
							<Coins className={`h-12 w-12 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
							<p className={`text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								No currencies have been set up for this campaign yet.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								Here are all the currencies used in this campaign:
							</p>

							{currencies.map((currency) => (
								<div
									key={currency.id}
									className={`p-4 rounded-lg border ${session?.user?.darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
								>
									<div className="flex items-start gap-3">
										<div className={`p-2 rounded-full ${session?.user?.darkMode ? 'bg-yellow-800/30' : 'bg-yellow-100'}`}>
											<Coins className={`h-4 w-4 ${session?.user?.darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className={`font-semibold text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{currency.name}</h3>
												<span
													className={`px-2 py-1 rounded text-xs font-mono font-medium ${
														session?.user?.darkMode ? 'bg-purple-800/50 text-purple-300' : 'bg-purple-100 text-purple-700'
													}`}
												>
													{currency.abbreviation}
												</span>
											</div>

											{currency.description && (
												<p className={`text-sm leading-relaxed ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
													{currency.description}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
