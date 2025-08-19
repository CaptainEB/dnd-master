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
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
				<div className="text-center text-white">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<h1 className="text-2xl sm:text-3xl font-bold mb-2">
						<span className="bg-gradient-to-r from-yellow-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">D&D Master</span>
					</h1>
					<p className="text-purple-200">Loading your adventure hub...</p>
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
				<div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
					<div className="text-center text-white">
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 opacity-0 animate-fade-in">
							Welcome back, <span className="text-yellow-400">{session.user.email?.split('@')[0]}</span>!
						</h1>
						<p className="text-lg sm:text-xl md:text-2xl text-purple-200 mb-6 sm:mb-8 opacity-0 animate-fade-in animation-delay-300">
							Your adventures await...
						</p>
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
				<div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 md:-top-40 md:-right-40 md:w-80 md:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				<div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 md:-bottom-40 md:-left-40 md:w-80 md:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				<div className="absolute top-20 left-1/2 w-40 h-40 sm:w-60 sm:h-60 md:top-40 md:w-80 md:h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
			</div>

			<div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20">
				<div className="text-center mb-12 sm:mb-16">
					<div className="mb-6 sm:mb-8">
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 opacity-0 animate-fade-in">
							<span className="inline-block animate-pulse">⚔️</span>
							<span className="bg-gradient-to-r from-yellow-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">D&D Master</span>
							<span className="inline-block animate-pulse">🛡️</span>
						</h1>
						<p className="text-lg sm:text-xl md:text-2xl text-purple-200 opacity-0 animate-fade-in animation-delay-300">
							Your private adventure hub awaits
						</p>
					</div>

					<div className="relative mb-8 sm:mb-12">
						<div className="absolute left-1/4 top-0 animate-bounce">
							<Sparkles className="text-yellow-400 h-6 w-6 sm:h-8 sm:w-8" />
						</div>
						<div className="absolute right-1/4 top-8 animate-bounce">
							<Scroll className="text-blue-300 h-5 w-5 sm:h-6 sm:w-6" />
						</div>
						<div className="absolute left-1/3 top-16 animate-bounce">
							<Shield className="text-purple-300 h-6 w-6 sm:h-7 sm:w-7" />
						</div>
					</div>

					<div className="opacity-0 animate-fade-in animation-delay-700">
						<SignInButton />
					</div>

					<p className="text-purple-300 text-xs sm:text-sm mt-4 sm:mt-6 opacity-0 animate-fade-in animation-delay-1000 px-2">
						🔐 Private access only - Contact your DM if you need an invitation
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto opacity-0 animate-fade-in animation-delay-1000">
					<Card className="bg-white/10 backdrop-blur-md border-purple-300/30 text-white p-4 sm:p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
						<div className="text-center">
							<Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300 mx-auto mb-3 sm:mb-4" />
							<h3 className="text-base sm:text-lg font-semibold mb-2">Campaign Management</h3>
							<p className="text-purple-200 text-xs sm:text-sm">Organize your adventures and keep track of your party's progress</p>
						</div>
					</Card>

					<Card className="bg-white/10 backdrop-blur-md border-purple-300/30 text-white p-4 sm:p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
						<div className="text-center">
							<Scroll className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-300 mx-auto mb-3 sm:mb-4" />
							<h3 className="text-base sm:text-lg font-semibold mb-2">Quest Tracking</h3>
							<p className="text-purple-200 text-xs sm:text-sm">Never lose track of your quests, rewards, and adventure notes</p>
						</div>
					</Card>

					<Card className="bg-white/10 backdrop-blur-md border-purple-300/30 text-white p-4 sm:p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform sm:col-span-2 lg:col-span-1">
						<div className="text-center">
							<Sword className="h-10 w-10 sm:h-12 sm:w-12 text-red-300 mx-auto mb-3 sm:mb-4" />
							<h3 className="text-base sm:text-lg font-semibold mb-2">Rules & Updates</h3>
							<p className="text-purple-200 text-xs sm:text-sm">Stay updated with house rules and campaign announcements</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
