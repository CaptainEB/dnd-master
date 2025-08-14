import { DateDisplay } from '@/components/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, FileText, Settings, Shield, StickyNote, Trash2, User, Users } from 'lucide-react';
import Link from 'next/link';
import { getUserById } from '../../components/actions';
import CampaignMembershipManager from './CampaignMembershipManager';

export default async function AdminUserDetail({ params }) {
	const { id } = await params;
	const result = await getUserById(id);

	if (!result.success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<Link href="/admin/users" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
							<ArrowLeft size={20} />
							Back to Users
						</Link>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
					</div>
					<Card className="p-6">
						<p className="text-red-600">Error: {result.error}</p>
					</Card>
				</div>
			</div>
		);
	}

	const user = result.data;

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link href="/admin/users" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
						<ArrowLeft size={20} />
						Back to Users
					</Link>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">{user.email}</h1>
							<div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										user.role === 'ADMIN'
											? 'bg-red-100 text-red-800'
											: user.role === 'DM'
												? 'bg-blue-100 text-blue-800'
												: 'bg-green-100 text-green-800'
									}`}
								>
									{user.role}
								</span>
								<div className="flex items-center gap-1">
									<Calendar size={16} />
									Joined: <DateDisplay date={user.createdAt} />
								</div>
								<div className="flex items-center gap-1">
									<Calendar size={16} />
									Updated: <DateDisplay date={user.updatedAt} />
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{user.avatarUrl ? (
								<img src={user.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full" />
							) : (
								<div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
									<User size={24} className="text-purple-600" />
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Shield className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Campaigns</h3>
								<p className="text-2xl font-bold text-blue-600">{user._count.campaignMembers}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<FileText className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Updates</h3>
								<p className="text-2xl font-bold text-purple-600">{user._count.updates}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-orange-100 rounded-lg">
								<StickyNote className="h-6 w-6 text-orange-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Notes</h3>
								<p className="text-2xl font-bold text-orange-600">{user._count.notes}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">DM Roles</h3>
								<p className="text-2xl font-bold text-green-600">{user.campaignMembers?.filter((m) => m.role === 'DM').length || 0}</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Campaign Memberships */}
				<Card className="p-6 mb-8">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Campaign Memberships</h3>
						<CampaignMembershipManager userId={user.id} />
					</div>
					<div className="space-y-4">
						{user.campaignMembers && user.campaignMembers.length > 0 ? (
							user.campaignMembers.map((membership) => (
								<div key={membership.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-4">
										<div className="p-2 bg-blue-100 rounded-lg">
											<Shield size={16} className="text-blue-600" />
										</div>
										<div>
											<h4 className="font-medium text-gray-900">{membership.campaign.name}</h4>
											<p className="text-sm text-gray-600">{membership.campaign.description || 'No description'}</p>
											<div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														membership.role === 'DM' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
													}`}
												>
													{membership.role}
												</span>
												<span className="flex items-center gap-1">
													<Calendar size={12} />
													Joined: <DateDisplay date={membership.joinedAt} />
												</span>
												<span className="flex items-center gap-1">
													<Users size={12} />
													{membership.campaign._count.members} members
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<CampaignMembershipManager
											userId={user.id}
											membershipId={membership.id}
											currentRole={membership.role}
											campaignName={membership.campaign.name}
											mode="edit"
										/>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12 text-gray-500">
								<Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">No campaign memberships</h4>
								<p>This user is not a member of any campaigns yet</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
