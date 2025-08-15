'use client';

import { Card } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminDashboard() {
	const { data: session } = useSession();

	return (
		<div
			className={`min-h-screen pt-16 ${
				session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-blue-50'
			}`}
		>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
					<p className={`${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
						Welcome back, {session?.user?.email?.split('@')[0]}! Manage your D&D Master platform.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6 mb-8">
					<Link href="/admin/users">
						<Card
							className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
								session?.user?.darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-purple-50'
							}`}
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-purple-100 rounded-lg">
									<Users className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Users</h3>
									<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage all users</p>
								</div>
							</div>
						</Card>
					</Link>

					<Link href="/admin/campaigns">
						<Card
							className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
								session?.user?.darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50'
							}`}
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-100 rounded-lg">
									<Shield className="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Campaigns</h3>
									<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>All campaigns</p>
								</div>
							</div>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
}
