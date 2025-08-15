'use client';

import { BookOpen, ClipboardList, FileText, Scroll } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SecondaryNavbar() {
	const pathname = usePathname();
	const { data: session, status } = useSession();

	// Only show secondary nav if user is authenticated and has an active campaign
	if (status === 'loading' || status === 'unauthenticated' || !session?.user?.activeCampaignId) {
		return null;
	}

	const navItems = [
		{
			name: 'Updates',
			href: '/updates',
			icon: ClipboardList,
		},
		{
			name: 'Rules',
			href: '/rules',
			icon: BookOpen,
		},
		{
			name: 'Notes',
			href: '/notes',
			icon: FileText,
		},
		{
			name: 'Quests',
			href: '/quests',
			icon: Scroll,
		},
	];

	return (
		<nav
			className={`border-b sticky top-16 z-40 h-12 ${
				session?.user?.darkMode
					? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700'
					: 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100'
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center h-12 gap-8">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
									session?.user?.darkMode
										? `hover:bg-gray-700/50 ${
												isActive ? 'bg-gray-700/80 text-purple-300 shadow-sm border border-purple-500' : 'text-gray-300 hover:text-purple-400'
											}`
										: `hover:bg-white/50 ${
												isActive ? 'bg-white/80 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:text-purple-600'
											}`
								}`}
							>
								<Icon size={16} />
								{item.name}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
