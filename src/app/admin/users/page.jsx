'use client';

import { DateDisplay } from '@/components/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, FileText, Shield, StickyNote, User, UserPlus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllUsers } from '../components/actions';
import CreateUserForm from './CreateUserForm';

export default function AdminUsersPage() {
	const { data: session } = useSession();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const result = await getAllUsers();
				if (result.success) {
					setUsers(result.data);
				} else {
					setError(result.error);
				}
			} catch (err) {
				setError('Failed to load users');
			} finally {
				setLoading(false);
			}
		};

		loadUsers();
	}, []);

	if (loading) {
		return (
			<div
				className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
			>
				<div className="container mx-auto px-4 py-8">
					<div className="text-center py-12">
						<div className={`flex flex-col items-center gap-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
							<div
								className={`animate-spin rounded-full h-8 w-8 border-b-2 ${session?.user?.darkMode ? 'border-cyan-400' : 'border-purple-600'}`}
							></div>
							Loading users...
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
			>
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
						<p className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}>Manage all users and their permissions</p>
					</div>
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<p className={session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}>Error: {error}</p>
					</Card>
				</div>
			</div>
		);
	}

	const adminCount = users.filter((user) => user.role === 'ADMIN').length;
	const dmCount = users.filter((user) => user.role === 'DM').length;
	const playerCount = users.filter((user) => user.role === 'PLAYER').length;

	return (
		<div
			className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
		>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link
						href="/admin/dashboard"
						className={`flex items-center gap-2 mb-4 ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
					>
						<ArrowLeft size={20} />
						Back to Dashboard
					</Link>
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className={`text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
							<p className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}>Manage all users and their permissions</p>
						</div>
						<CreateUserForm />
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
								<Shield className={`h-6 w-6 ${session?.user?.darkMode ? 'text-red-300' : 'text-red-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Admins</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>{adminCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
								<User className={`h-6 w-6 ${session?.user?.darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>DMs</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{dmCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
								<Users className={`h-6 w-6 ${session?.user?.darkMode ? 'text-green-300' : 'text-green-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Players</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-green-400' : 'text-green-600'}`}>{playerCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-4">
							<div className={`p-3 rounded-lg ${session?.user?.darkMode ? 'bg-cyan-800' : 'bg-purple-100'}`}>
								<Users className={`h-6 w-6 ${session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Total Users</h3>
								<p className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>{users.length}</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Users List */}
				<Card className={`p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<h3 className={`text-lg font-semibold mb-6 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>All Users</h3>
					<div className="space-y-4">
						{users.length > 0 ? (
							users.map((user) => (
								<Link key={user.id} href={`/admin/users/${user.id}`}>
									<div
										className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
											session?.user?.darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
										}`}
									>
										<div className="flex items-center gap-4">
											{user.avatarUrl ? (
												<img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full" />
											) : (
												<div
													className={`h-12 w-12 rounded-full flex items-center justify-center ${
														session?.user?.darkMode ? 'bg-cyan-800' : 'bg-purple-100'
													}`}
												>
													<User size={20} className={session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'} />
												</div>
											)}
											<div>
												<h4 className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{user.email}</h4>
												<div className={`flex items-center gap-4 text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															user.role === 'ADMIN'
																? session?.user?.darkMode
																	? 'bg-red-800 text-red-300'
																	: 'bg-red-100 text-red-800'
																: user.role === 'DM'
																	? session?.user?.darkMode
																		? 'bg-blue-800 text-blue-300'
																		: 'bg-blue-100 text-blue-800'
																	: session?.user?.darkMode
																		? 'bg-green-800 text-green-300'
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
										<div className={`flex items-center gap-6 text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<Users size={14} />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
														{user._count.campaignMembers}
													</span>
												</div>
												<span>Campaigns</span>
											</div>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<FileText size={14} />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
														{user._count.updates}
													</span>
												</div>
												<span>Updates</span>
											</div>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<StickyNote size={14} />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
														{user._count.notes}
													</span>
												</div>
												<span>Notes</span>
											</div>
										</div>
									</div>
								</Link>
							))
						) : (
							<div className={`text-center py-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								<User className={`h-16 w-16 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
								<h4 className={`text-lg font-medium mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>No users found</h4>
								<p>Create your first user to get started</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
