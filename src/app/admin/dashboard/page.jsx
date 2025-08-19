'use client';

import { Card } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminDashboard() {
	const { data: session } = useSession();

	// Check if user is admin
	if (session && session.user.role !== 'ADMIN') {
		return (
			<div
				className={`min-h-screen pt-16 flex items-center justify-center ${
					session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-blue-50'
				}`}
			>
				<div className="text-center">
					<h1 className={`text-2xl font-bold mb-4 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Access Denied</h1>
					<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>You need admin privileges to access this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen pt-16 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-blue-50'
			}`}
		>
			<div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
					<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
						Welcome back, {session?.user?.email?.split('@')[0]}! Manage your D&D Master platform.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
					<Link href="/admin/users">
						<Card
							className={`p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer ${
								session?.user?.darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-purple-50'
							}`}
						>
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
									<Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
								</div>
								<div className="min-w-0">
									<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Users</h3>
									<p className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage all users</p>
								</div>
							</div>
						</Card>
					</Link>

					<Link href="/admin/campaigns">
						<Card
							className={`p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer ${
								session?.user?.darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50'
							}`}
						>
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
									<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
								</div>
								<div className="min-w-0">
									<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaigns</h3>
									<p className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>All campaigns</p>
								</div>
							</div>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
}
