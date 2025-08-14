'use client';

import { Card } from '@/components/ui/card';
import { BookOpen, Plus, Scroll, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DMDashboard() {
	const { data: session } = useSession();

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Dungeon Master Dashboard</h1>
					<p className="text-gray-600">Welcome back, DM {session?.user?.email?.split('@')[0]}! Ready to guide your players on epic adventures?</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<Scroll className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">My Campaigns</h3>
								<p className="text-sm text-gray-600">3 active campaigns</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Users className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Players</h3>
								<p className="text-sm text-gray-600">12 total players</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<BookOpen className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Sessions</h3>
								<p className="text-sm text-gray-600">Next: Tomorrow</p>
							</div>
						</div>
					</Card>
				</div>

				<div className="grid lg:grid-cols-2 gap-6">
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
							<button className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
								<Plus size={16} />
								New Campaign
							</button>
						</div>
						<div className="space-y-3">
							<div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
								<h4 className="font-medium text-gray-900">The Lost Kingdom</h4>
								<p className="text-sm text-gray-600 mt-1">5 players • Level 8-10 • Next session: Tomorrow</p>
								<div className="flex gap-2 mt-3">
									<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
									<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Weekly</span>
								</div>
							</div>
							<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
								<h4 className="font-medium text-gray-900">Curse of Strahd</h4>
								<p className="text-sm text-gray-600 mt-1">4 players • Level 3-5 • Next session: Friday</p>
								<div className="flex gap-2 mt-3">
									<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
									<span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Bi-weekly</span>
								</div>
							</div>
							<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
								<h4 className="font-medium text-gray-900">Dragon Heist</h4>
								<p className="text-sm text-gray-600 mt-1">3 players • Level 1-3 • Next session: TBD</p>
								<div className="flex gap-2 mt-3">
									<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Planning</span>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">DM Tools</h3>
						<div className="space-y-3">
							<button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">📝 Session Notes</button>
							<button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">🎲 Random Generators</button>
							<button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">📊 Player Statistics</button>
							<button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">🗺️ Campaign Maps</button>
							<button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">⚔️ Combat Tracker</button>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
