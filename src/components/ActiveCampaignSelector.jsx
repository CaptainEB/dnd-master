'use client';

import { getUserCampaigns, updateActiveCampaign } from '@/app/admin/components/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function ActiveCampaignSelector() {
	const { data: session, update } = useSession();
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeCampaign, setActiveCampaign] = useState(null);

	useEffect(() => {
		loadCampaigns();
		// Set initial active campaign from session if available
		if (session?.user?.activeCampaign) {
			setActiveCampaign(session.user.activeCampaign.id);
		}
	}, [session]);

	// Listen for campaign membership changes
	useEffect(() => {
		const handleCampaignMembershipChange = () => {
			loadCampaigns();
		};

		window.addEventListener('campaignMembershipChanged', handleCampaignMembershipChange);

		return () => {
			window.removeEventListener('campaignMembershipChanged', handleCampaignMembershipChange);
		};
	}, []);

	const loadCampaigns = async () => {
		setLoading(true);
		try {
			const result = await getUserCampaigns();
			if (result.success) {
				setCampaigns(result.data);
			}
		} catch (error) {
			console.error('Error loading campaigns:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCampaignChange = async (campaignId) => {
		try {
			const result = await updateActiveCampaign(campaignId === 'none' ? null : campaignId);
			if (result.success) {
				setActiveCampaign(campaignId === 'none' ? null : campaignId);
				// Update the session to reflect the change
				await update();
			} else {
				console.error('Failed to update active campaign:', result.error);
			}
		} catch (error) {
			console.error('Error updating active campaign:', error);
		}
	};

	// Don't show if user has no campaigns
	if (!loading && campaigns.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-2">
			<Shield size={14} className="text-purple-600 sm:w-4 sm:h-4" />
			<Select value={activeCampaign || 'none'} onValueChange={handleCampaignChange} disabled={loading}>
				<SelectTrigger
					className={`w-32 sm:w-40 md:w-48 h-8 text-xs sm:text-sm ${session?.user?.darkMode ? 'border-purple-500 bg-gray-800/50 text-white' : 'border-purple-200 bg-white/50'}`}
				>
					<SelectValue placeholder={loading ? 'Loading...' : 'Select Campaign'} className="truncate" />
				</SelectTrigger>
				<SelectContent className={session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}>
					<SelectItem value="none" className={session?.user?.darkMode ? 'text-gray-400 focus:bg-gray-700' : ''}>
						<span className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}>No Active Campaign</span>
					</SelectItem>
					{campaigns.map((campaign) => (
						<SelectItem key={campaign.id} value={campaign.id} className={session?.user?.darkMode ? 'text-white focus:bg-gray-700' : ''}>
							<div className="flex items-center gap-2">
								<div className={`w-2 h-2 rounded-full ${campaign.userRole === 'DM' ? 'bg-blue-500' : 'bg-green-500'}`} />
								<span>{campaign.name}</span>
								<span className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({campaign.userRole})</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
