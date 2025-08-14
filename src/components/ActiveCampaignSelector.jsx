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
		<div className="flex items-center gap-2 px-3 py-2">
			<Shield size={16} className="text-purple-600" />
			<Select value={activeCampaign || 'none'} onValueChange={handleCampaignChange} disabled={loading}>
				<SelectTrigger className="w-48 h-8 border-purple-200 bg-white/50">
					<SelectValue placeholder={loading ? 'Loading...' : 'Select Campaign'} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="none">
						<span className="text-gray-500">No Active Campaign</span>
					</SelectItem>
					{campaigns.map((campaign) => (
						<SelectItem key={campaign.id} value={campaign.id}>
							<div className="flex items-center gap-2">
								<div className={`w-2 h-2 rounded-full ${campaign.userRole === 'DM' ? 'bg-blue-500' : 'bg-green-500'}`} />
								<span>{campaign.name}</span>
								<span className="text-xs text-gray-500">({campaign.userRole})</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
