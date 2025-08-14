'use client';

import SignInButton from '@/components/SignInButton';
import { Card } from '@/components/ui/card';
import { Scroll, Shield, Sparkles, Sword, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
	const { data: session, status } = useSession();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Prevent hydration mismatch by not rendering session-dependent content until mounted
	if (!isMounted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
				{/* Loading skeleton that matches server render */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
					<div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				</div>

				<div className="relative z-10 container mx-auto px-4 py-20">
					<div className="text-center mb-16">
						<div className="mb-8">
							<h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
								<span className="inline-block animate-pulse">⚔️</span>
								<span className="bg-gradient-to-r from-yellow-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">D&D Master</span>
								<span className="inline-block animate-pulse">🛡️</span>
							</h1>
							<p className="text-xl md:text-2xl text-purple-200">Your private adventure hub awaits</p>
						</div>
						<div className="mb-12">
							<div className="animate-pulse w-32 h-10 bg-purple-600 rounded-lg mx-auto"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
			</div>
		);
	}

	if (session) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center text-white">
						<h1 className="text-4xl md:text-6xl font-bold mb-6 opacity-0 animate-fade-in">
							Welcome back, <span className="text-yellow-400">{session.user.email?.split('@')[0]}</span>!
						</h1>
						<p className="text-xl md:text-2xl text-purple-200 mb-8 opacity-0 animate-fade-in animation-delay-300">Your adventures await...</p>
						<div className="inline-block animate-bounce">⚔️</div>
					</div>
				</div>
			</div>
		);
	}

	// Default return for unauthenticated users (after mount)
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				<div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
			</div>

			<div className="relative z-10 container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<div className="mb-8">
						<h1 className="text-5xl md:text-7xl font-bold text-white mb-4 opacity-0 animate-fade-in">
							<span className="inline-block animate-pulse">⚔️</span>
							<span className="bg-gradient-to-r from-yellow-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">D&D Master</span>
							<span className="inline-block animate-pulse">🛡️</span>
						</h1>
						<p className="text-xl md:text-2xl text-purple-200 opacity-0 animate-fade-in animation-delay-300">Your private adventure hub awaits</p>
					</div>

					<div className="relative mb-12">
						<div className="absolute left-1/4 top-0 animate-bounce">
							<Sparkles className="text-yellow-400 h-8 w-8" />
						</div>
						<div className="absolute right-1/4 top-8 animate-bounce">
							<Scroll className="text-blue-300 h-6 w-6" />
						</div>
						<div className="absolute left-1/3 top-16 animate-bounce">
							<Shield className="text-purple-300 h-7 w-7" />
						</div>
					</div>

					<div className="opacity-0 animate-fade-in animation-delay-700">
						<SignInButton />
					</div>

					<p className="text-purple-300 text-sm mt-6 opacity-0 animate-fade-in animation-delay-1000">
						🔐 Private access only - Contact your DM if you need an invitation
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto opacity-0 animate-fade-in animation-delay-1000">
					<Card className="bg-white/10 backdrop-blur-md border-purple-300/30 text-white p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
						<div className="text-center">
							<Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Campaign Management</h3>
							<p className="text-purple-200 text-sm">Organize your adventures and keep track of your party's progress</p>
						</div>
					</Card>

					<Card className="bg-white/10 backdrop-blur-md border-purple-300/30 text-white p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
						<div className="text-center">
							<Scroll className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Quest Tracking</h3>
							<p className="text-purple-200 text-sm">Never lose track of your quests, rewards, and adventure notes</p>
						</div>
					</Card>

					<Card className="bg-white/10 backdrop-blur-md border-purple-300/30 text-white p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
						<div className="text-center">
							<Sword className="h-12 w-12 text-red-300 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Rules & Updates</h3>
							<p className="text-purple-200 text-sm">Stay updated with house rules and campaign announcements</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
