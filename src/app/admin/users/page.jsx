import { DateDisplay } from '@/components/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, FileText, Shield, StickyNote, User, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { getAllUsers } from '../components/actions';
import CreateUserForm from './CreateUserForm';

export default async function AdminUsersPage() {
	const result = await getAllUsers();

	if (!result.success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
						<p className="text-gray-600">Manage all users and their permissions</p>
					</div>
					<Card className="p-6">
						<p className="text-red-600">Error: {result.error}</p>
					</Card>
				</div>
			</div>
		);
	}

	const users = result.data;
	const adminCount = users.filter((user) => user.role === 'ADMIN').length;
	const dmCount = users.filter((user) => user.role === 'DM').length;
	const playerCount = users.filter((user) => user.role === 'PLAYER').length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
							<p className="text-gray-600">Manage all users and their permissions</p>
						</div>
						<CreateUserForm />
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-red-100 rounded-lg">
								<Shield className="h-6 w-6 text-red-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Admins</h3>
								<p className="text-2xl font-bold text-red-600">{adminCount}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<User className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">DMs</h3>
								<p className="text-2xl font-bold text-blue-600">{dmCount}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Players</h3>
								<p className="text-2xl font-bold text-green-600">{playerCount}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<Users className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Total Users</h3>
								<p className="text-2xl font-bold text-purple-600">{users.length}</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Users List */}
				<Card className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-6">All Users</h3>
					<div className="space-y-4">
						{users.length > 0 ? (
							users.map((user) => (
								<Link key={user.id} href={`/admin/users/${user.id}`}>
									<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
										<div className="flex items-center gap-4">
											{user.avatarUrl ? (
												<img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full" />
											) : (
												<div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
													<User size={20} className="text-purple-600" />
												</div>
											)}
											<div>
												<h4 className="font-medium text-gray-900">{user.email}</h4>
												<div className="flex items-center gap-4 text-sm text-gray-500">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															user.role === 'ADMIN'
																? 'bg-red-100 text-red-800'
																: user.role === 'DM'
																	? 'bg-blue-100 text-blue-800'
																	: 'bg-green-100 text-green-800'
														}`}
													>
														{user.role}
													</span>
													<span className="flex items-center gap-1">
														<Calendar size={12} />
														Joined: <DateDisplay date={user.createdAt} />
													</span>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-6 text-sm text-gray-500">
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<Users size={14} />
													<span className="font-medium text-blue-600">{user._count.campaignMembers}</span>
												</div>
												<span>Campaigns</span>
											</div>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<FileText size={14} />
													<span className="font-medium text-purple-600">{user._count.updates}</span>
												</div>
												<span>Updates</span>
											</div>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<StickyNote size={14} />
													<span className="font-medium text-orange-600">{user._count.notes}</span>
												</div>
												<span>Notes</span>
											</div>
										</div>
									</div>
								</Link>
							))
						) : (
							<div className="text-center py-12 text-gray-500">
								<User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">No users found</h4>
								<p>Create your first user to get started</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
