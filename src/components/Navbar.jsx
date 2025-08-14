'use client';

import { LayoutDashboard, Sword, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ActiveCampaignSelector from './ActiveCampaignSelector';
import SignOutButton from './SignOutButton';

export default function Navbar() {
	const { data: session, status } = useSession();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo/Brand */}
					<div className="flex items-center gap-2">
						<Sword className="h-8 w-8 text-purple-600" />
						<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">D&D Master</span>
					</div>

					{/* Right side - Show content based on auth state */}
					{isMounted && (
						<div className="flex items-center gap-4">
							{status === 'loading' && <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>}

							{status === 'authenticated' && session?.user && (
								<>
									{/* Active Campaign Selector */}
									<ActiveCampaignSelector />

									{/* Dashboard Button */}
									<Link
										href={session.user.role === 'ADMIN' ? '/admin/dashboard' : session.user.role === 'DM' ? '/dm/dashboard' : '/player/dashboard'}
										className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
									>
										<LayoutDashboard size={16} />
										<span className="hidden sm:inline">Dashboard</span>
									</Link>

									{/* User Info */}
									<div className="flex items-center gap-3">
										{session.user.avatarUrl ? (
											<img src={session.user.avatarUrl} alt="Profile" className="h-8 w-8 rounded-full border-2 border-purple-200" />
										) : (
											<div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
												<User size={16} className="text-purple-600" />
											</div>
										)}
										<div className="hidden sm:block">
											<p className="text-sm font-medium text-gray-700">{session.user.email}</p>
											<p className="text-xs text-gray-500 capitalize">{session.user.role?.toLowerCase()}</p>
										</div>
									</div>

									{/* Sign Out Button */}
									<SignOutButton />
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
