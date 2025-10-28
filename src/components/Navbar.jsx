'use client';

import { LayoutDashboard, Sword } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ActiveCampaignSelector from './ActiveCampaignSelector';
import UserDropdown from './UserDropdown';

export default function Navbar() {
	const { data: session, status } = useSession();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<nav
			className={`backdrop-blur-md border-b sticky top-0 z-50 ${
				isMounted && session?.user?.darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/80 border-gray-200'
			}`}
		>
			<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
				<div className="flex justify-between items-center h-14 sm:h-16">
					{/* Logo/Brand */}
					<div className="flex items-center gap-1 sm:gap-2">
						<Sword className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
						<span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
							D&D Master
						</span>
					</div>

					{/* Right side - Show content based on auth state */}
					{isMounted && (
						<div className="flex items-center gap-1 sm:gap-2 md:gap-4">
							{status === 'loading' && (
								<div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
							)}

							{status === 'authenticated' && session?.user && (
								<>
							{/* Active Campaign Selector */}
							<ActiveCampaignSelector />

							{/* Dashboard Button */}
									<Link
										href={
											session.user.role === 'ADMIN' ? '/admin/dashboard' : session.user.campaignRole === 'DM' ? '/dm/dashboard' : '/player/dashboard'
										}
										className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
											session?.user?.darkMode
												? 'text-purple-400 hover:text-purple-300 hover:bg-gray-700/50'
												: 'text-purple-600 hover:text-purple-700 hover:bg-white/50'
										}`}
									>
										<LayoutDashboard size={14} className="sm:w-4 sm:h-4" />
										<span className="hidden sm:inline">Dashboard</span>
									</Link>

									{/* User Dropdown */}
									<UserDropdown />
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
