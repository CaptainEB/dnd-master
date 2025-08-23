'use client';

import { DateDisplay } from '@/components/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, FileText, Shield, StickyNote, UserPlus, Users } from 'lucide-react';
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
	const [avatarErrors, setAvatarErrors] = useState({});

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

	const handleAvatarError = (userId) => {
		setAvatarErrors((prev) => ({ ...prev, [userId]: true }));
	};

	const loadUsers = async () => {
		setLoading(true);
		try {
			const result = await getAllUsers();
			if (result.success) {
				setUsers(result.data);
				setError(null);
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError('Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	const refreshUsers = () => {
		loadUsers();
	};

	useEffect(() => {
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

	return (
		<div
			className={`min-h-screen pt-16 ${session?.user?.darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}
		>
			<div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<Link
						href="/admin/dashboard"
						className={`flex items-center gap-2 mb-4 text-sm sm:text-base ${session?.user?.darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
					>
						<ArrowLeft size={16} className="sm:w-5 sm:h-5" />
						Back to Dashboard
					</Link>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
						<div>
							<h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
							<p className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								Manage all users and their permissions
							</p>
						</div>
						<CreateUserForm onUserCreated={refreshUsers} />
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
								<Shield className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-red-300' : 'text-red-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Admins</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>{adminCount}</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
								<Users className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Regular Users</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
									{users.length - adminCount}
								</p>
							</div>
						</div>
					</Card>

					<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
						<div className="flex items-center gap-3 sm:gap-4">
							<div className={`p-2 sm:p-3 rounded-lg ${session?.user?.darkMode ? 'bg-cyan-800' : 'bg-purple-100'}`}>
								<Users className={`h-5 w-5 sm:h-6 sm:w-6 ${session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'}`} />
							</div>
							<div>
								<h3 className={`font-semibold text-sm sm:text-base ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Total Users</h3>
								<p className={`text-xl sm:text-2xl font-bold ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>{users.length}</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Users List */}
				<Card className={`p-4 sm:p-6 border-0 shadow-lg backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
					<h3 className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>All Users</h3>
					<div className="flex flex-col gap-4 sm:gap-6">
						{users.length > 0 ? (
							users.map((user) => (
								<Link key={user.id} href={`/admin/users/${user.id}`}>
									<div
										className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 rounded-lg transition-colors cursor-pointer ${
											session?.user?.darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
										}`}
									>
										<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
											{user.avatarUrl && !avatarErrors[user.id] ? (
												<img
													src={user.avatarUrl}
													alt="Avatar"
													className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0"
													onError={() => handleAvatarError(user.id)}
												/>
											) : (
												<div
													className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
														session?.user?.darkMode ? 'bg-cyan-800' : 'bg-purple-100'
													}`}
												>
													<User size={16} className={`sm:w-5 sm:h-5 ${session?.user?.darkMode ? 'text-cyan-300' : 'text-purple-600'}`} />
												</div>
											)}
											<div className="min-w-0 flex-1">
												<h4 className={`font-medium text-sm sm:text-base truncate ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
													{user.email}
												</h4>
												<div
													className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
												>
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
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
										<div
											className={`flex items-center justify-between sm:justify-end gap-4 sm:gap-6 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
										>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<Users size={12} className="sm:w-3.5 sm:h-3.5" />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
														{user._count.campaignMembers}
													</span>
												</div>
												<span className="hidden sm:inline">Campaigns</span>
												<span className="sm:hidden">Camps</span>
											</div>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<FileText size={12} className="sm:w-3.5 sm:h-3.5" />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
														{user._count.updates}
													</span>
												</div>
												<span className="hidden sm:inline">Updates</span>
												<span className="sm:hidden">Updates</span>
											</div>
											<div className="text-center">
												<div className="flex items-center gap-1 mb-1">
													<StickyNote size={12} className="sm:w-3.5 sm:h-3.5" />
													<span className={`font-medium ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
														{user._count.notes}
													</span>
												</div>
												<span className="hidden sm:inline">Notes</span>
												<span className="sm:hidden">Notes</span>
											</div>
										</div>
									</div>
								</Link>
							))
						) : (
							<div className={`text-center py-8 sm:py-12 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								<User className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
								<h4 className={`text-base sm:text-lg font-medium mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
									No users found
								</h4>
								<p className="text-sm">Create your first user to get started</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
