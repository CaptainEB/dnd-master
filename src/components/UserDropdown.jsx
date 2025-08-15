'use client';

import { updateCharacterName, updateUserProfile, updateUserTheme } from '@/app/admin/components/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Edit, LogOut, Moon, Save, Sun, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function UserDropdown() {
	const { data: session, update } = useSession();
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showCharacterDialog, setShowCharacterDialog] = useState(false);
	const [username, setUsername] = useState(session?.user?.username || '');
	const [characterName, setCharacterName] = useState(session?.user?.characterName || '');
	const [loading, setLoading] = useState(false);
	const [characterLoading, setCharacterLoading] = useState(false);
	const [error, setError] = useState('');
	const [characterError, setCharacterError] = useState('');

	const handleUpdateUsername = async (e) => {
		e.preventDefault();
		if (!username.trim()) {
			setError('Username is required');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const result = await updateUserProfile({ username: username.trim() });

			if (result.success) {
				// Update the session with new username
				await update();
				setShowEditDialog(false);
				setError('');
			} else {
				setError(result.error || 'Failed to update username');
			}
		} catch (err) {
			setError('Failed to update username');
			console.error('Error updating username:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateCharacterName = async (e) => {
		e.preventDefault();
		if (!characterName.trim()) {
			setCharacterError('Character name is required');
			return;
		}

		setCharacterLoading(true);
		setCharacterError('');

		try {
			const result = await updateCharacterName(characterName.trim());

			if (result.success) {
				// Update the session with new character name
				await update();
				setShowCharacterDialog(false);
				setCharacterError('');
			} else {
				setCharacterError(result.error || 'Failed to update character name');
			}
		} catch (err) {
			setCharacterError('Failed to update character name');
			console.error('Error updating character name:', err);
		} finally {
			setCharacterLoading(false);
		}
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: '/' });
	};

	const toggleDarkMode = async () => {
		try {
			const newDarkMode = !session.user.darkMode;
			const result = await updateUserTheme(newDarkMode);

			if (result.success) {
				// Update the session to reflect the new theme
				await update();
			}
		} catch (error) {
			console.error('Error toggling dark mode:', error);
		}
	};

	if (!session?.user) return null;

	const displayName = session.user.username || session.user.email?.split('@')[0] || 'User';

	// Always show character name section with helpful placeholders
	let characterDisplayName;
	let characterNameStyle = `text-xs font-medium ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`;

	if (session.user.characterName) {
		characterDisplayName = session.user.characterName;
		characterNameStyle = `text-xs font-medium ${session?.user?.darkMode ? 'text-cyan-400' : 'text-blue-600'}`;
	} else if (session.user.activeCampaignId) {
		characterDisplayName = 'Set character name';
		characterNameStyle = `text-xs font-medium italic ${session?.user?.darkMode ? 'text-orange-400' : 'text-orange-500'}`;
	} else {
		characterDisplayName = 'No active campaign';
		characterNameStyle = `text-xs font-medium italic ${session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400'}`;
	}

	const hasActiveCampaign = !!session.user.activeCampaignId;

	return (
		<>
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className={`flex items-center gap-3 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
								session?.user?.darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'
							}`}
						>
							{session.user.avatarUrl ? (
								<img
									src={session.user.avatarUrl}
									alt="Profile"
									className="h-8 w-8 rounded-full border-2 border-purple-200 object-cover"
									onError={(e) => {
										e.target.style.display = 'none';
										e.target.nextSibling.style.display = 'flex';
									}}
								/>
							) : null}
							<div className={`h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center ${session.user.avatarUrl ? 'hidden' : ''}`}>
								<User size={16} className="text-purple-600" />
							</div>
							<div className="hidden sm:block text-left">
								<p className={`text-sm font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>{displayName}</p>
								<p className={characterNameStyle}>{characterDisplayName}</p>
								<p className={`text-xs capitalize ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
									{session.user.role?.toLowerCase()}
								</p>
							</div>
							<ChevronDown size={16} className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-400'} />
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent className={`w-64 ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : ''}`} align="end">
						<DropdownMenuLabel className="font-normal">
							<div className="flex items-center gap-3">
								{session.user.avatarUrl ? (
									<img
										src={session.user.avatarUrl}
										alt="Profile"
										className="h-10 w-10 rounded-full border-2 border-purple-200 object-cover"
										onError={(e) => {
											e.target.style.display = 'none';
											e.target.nextSibling.style.display = 'flex';
										}}
									/>
								) : null}
								<div className={`h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center ${session.user.avatarUrl ? 'hidden' : ''}`}>
									<User size={20} className="text-purple-600" />
								</div>
								<div className="flex-1">
									<p className={`font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
									<p className={`text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{session.user.email}</p>
									<p
										className={`text-sm font-medium ${session.user.characterName ? (session?.user?.darkMode ? 'text-cyan-400' : 'text-blue-400') : session.user.activeCampaignId ? (session?.user?.darkMode ? 'text-orange-400' : 'text-orange-400') + ' italic' : (session?.user?.darkMode ? 'text-gray-500' : 'text-gray-400') + ' italic'}`}
									>
										Character: {characterDisplayName}
									</p>
									<p className={`text-xs capitalize ${session?.user?.darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
										{session.user.role?.toLowerCase()}
									</p>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								setShowEditDialog(true);
							}}
							className={session?.user?.darkMode ? 'focus:bg-gray-700 hover:bg-gray-700' : 'focus:bg-gray-50 hover:bg-gray-50'}
						>
							<Edit className="mr-2 h-4 w-4" />
							Change Username
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								if (hasActiveCampaign) {
									setShowCharacterDialog(true);
								}
							}}
							disabled={!hasActiveCampaign}
							className={`${!hasActiveCampaign ? 'opacity-50 cursor-not-allowed' : ''} ${
								session?.user?.darkMode ? 'focus:bg-gray-700 hover:bg-gray-700' : 'focus:bg-gray-50 hover:bg-gray-50'
							}`}
						>
							<User className="mr-2 h-4 w-4" />
							{hasActiveCampaign ? 'Change Character Name' : 'Set Character Name (Need Active Campaign)'}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={toggleDarkMode}
							className={session?.user?.darkMode ? 'focus:bg-gray-700 hover:bg-gray-700' : 'focus:bg-gray-50 hover:bg-gray-50'}
						>
							{session.user.darkMode ? (
								<>
									<Sun className="mr-2 h-4 w-4" />
									Light Mode
								</>
							) : (
								<>
									<Moon className="mr-2 h-4 w-4" />
									Dark Mode
								</>
							)}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => signOut()}
							className={session?.user?.darkMode ? 'focus:bg-gray-700 hover:bg-gray-700' : 'focus:bg-gray-50 hover:bg-gray-50'}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DialogContent className={`max-w-md border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}>
					<DialogHeader>
						<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>Change Username</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpdateUsername} className="space-y-4">
						<div>
							<Label htmlFor="username" className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>
								Username
							</Label>
							<Input
								id="username"
								placeholder="Enter your username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className={
									session?.user?.darkMode
										? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
										: 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'
								}
								required
							/>
						</div>
						{error && <p className="text-sm text-red-600">{error}</p>}
						<div className="flex gap-2 pt-4">
							<Button
								type="submit"
								disabled={loading}
								className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
							>
								<Save className="h-4 w-4 mr-2" />
								{loading ? 'Saving...' : 'Save'}
							</Button>
							<Button
								type="button"
								variant="outline"
								className="border-gray-300 hover:bg-gray-50"
								onClick={() => {
									setShowEditDialog(false);
									setError('');
									setUsername(session?.user?.username || '');
								}}
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={showCharacterDialog} onOpenChange={setShowCharacterDialog}>
				<DialogContent className={`max-w-md border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}>
					<DialogHeader>
						<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-800'}>
							{session?.user?.characterName ? 'Change Character Name' : 'Set Your Character Name'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpdateCharacterName} className="space-y-4">
						<div>
							<Label htmlFor="characterName" className={session?.user?.darkMode ? 'text-gray-200' : 'text-gray-700'}>
								Character Name
							</Label>
							<Input
								id="characterName"
								placeholder={session?.user?.characterName ? 'Enter your character name' : 'e.g., Aragorn, Gandalf, Legolas...'}
								value={characterName}
								onChange={(e) => setCharacterName(e.target.value)}
								className={
									session?.user?.darkMode
										? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
										: 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'
								}
								required
							/>
							<p className={`text-xs mt-1 ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								{session?.user?.characterName
									? 'This is your character name for the current campaign'
									: 'Choose a character name for this campaign - you can have different names for different campaigns!'}
							</p>
						</div>
						{characterError && <p className="text-sm text-red-600">{characterError}</p>}
						<div className="flex gap-2 pt-4">
							<Button
								type="submit"
								disabled={characterLoading}
								className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
							>
								<Save className="h-4 w-4 mr-2" />
								{characterLoading ? 'Saving...' : 'Save Character'}
							</Button>
							<Button
								type="button"
								variant="outline"
								className="border-gray-300 hover:bg-gray-50"
								onClick={() => {
									setShowCharacterDialog(false);
									setCharacterError('');
									setCharacterName(session?.user?.characterName || '');
								}}
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
