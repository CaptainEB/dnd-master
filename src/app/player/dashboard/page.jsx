'use client';

import { Card } from '@/components/ui/card';
import { BookOpen, Calendar, Shield, Sword, Trophy, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PlayerDashboard() {
	const { data: session } = useSession();

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Player Dashboard</h1>
					<p className="text-gray-600">Welcome back, {session?.user?.email?.split('@')[0]}! Ready for your next adventure?</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<Sword className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">My Characters</h3>
								<p className="text-sm text-gray-600">2 active characters</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Users className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Campaigns</h3>
								<p className="text-sm text-gray-600">Member of 2</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<Calendar className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Next Session</h3>
								<p className="text-sm text-gray-600">Tomorrow at 7PM</p>
							</div>
						</div>
					</Card>
				</div>

				<div className="grid lg:grid-cols-2 gap-6">
					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">My Characters</h3>
						<div className="space-y-4">
							<div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
								<div className="flex items-center gap-3 mb-2">
									<Shield className="h-5 w-5 text-blue-600" />
									<h4 className="font-medium text-gray-900">Thorin Ironbeard</h4>
								</div>
								<p className="text-sm text-gray-600 mb-2">Level 8 Dwarf Fighter</p>
								<div className="flex gap-2">
									<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
									<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">The Lost Kingdom</span>
								</div>
								<div className="mt-3 grid grid-cols-3 gap-2 text-xs">
									<div className="text-center">
										<div className="font-semibold">HP</div>
										<div className="text-gray-600">78/78</div>
									</div>
									<div className="text-center">
										<div className="font-semibold">AC</div>
										<div className="text-gray-600">18</div>
									</div>
									<div className="text-center">
										<div className="font-semibold">EXP</div>
										<div className="text-gray-600">34,000</div>
									</div>
								</div>
							</div>

							<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
								<div className="flex items-center gap-3 mb-2">
									<BookOpen className="h-5 w-5 text-purple-600" />
									<h4 className="font-medium text-gray-900">Lyra Moonwhisper</h4>
								</div>
								<p className="text-sm text-gray-600 mb-2">Level 5 Elf Wizard</p>
								<div className="flex gap-2">
									<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
									<span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Curse of Strahd</span>
								</div>
								<div className="mt-3 grid grid-cols-3 gap-2 text-xs">
									<div className="text-center">
										<div className="font-semibold">HP</div>
										<div className="text-gray-600">32/32</div>
									</div>
									<div className="text-center">
										<div className="font-semibold">AC</div>
										<div className="text-gray-600">12</div>
									</div>
									<div className="text-center">
										<div className="font-semibold">EXP</div>
										<div className="text-gray-600">6,500</div>
									</div>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
						<div className="space-y-3">
							<div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
								<Trophy className="h-5 w-5 text-green-600" />
								<div>
									<p className="text-sm font-medium">Level Up!</p>
									<p className="text-xs text-gray-600">Thorin reached level 8</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
								<Sword className="h-5 w-5 text-blue-600" />
								<div>
									<p className="text-sm font-medium">Epic Battle</p>
									<p className="text-xs text-gray-600">Defeated the Dragon of Shadows</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
								<BookOpen className="h-5 w-5 text-purple-600" />
								<div>
									<p className="text-sm font-medium">New Spell</p>
									<p className="text-xs text-gray-600">Lyra learned Fireball</p>
								</div>
							</div>
						</div>

						<div className="mt-6">
							<h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
							<div className="space-y-2">
								<button className="w-full p-2 text-left bg-purple-50 hover:bg-purple-100 rounded text-sm transition-colors">
									📝 View Character Sheets
								</button>
								<button className="w-full p-2 text-left bg-blue-50 hover:bg-blue-100 rounded text-sm transition-colors">📖 Campaign Notes</button>
								<button className="w-full p-2 text-left bg-green-50 hover:bg-green-100 rounded text-sm transition-colors">🎲 Dice Roller</button>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
