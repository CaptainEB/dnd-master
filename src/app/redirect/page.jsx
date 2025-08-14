'use client';

import { Shield, Sword, User, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === 'loading') return;
		else if (status === 'unauthenticated') {
			router.replace('/');
		} else if (status === 'authenticated') {
			const role = session?.user?.role;
			switch (role) {
				case 'ADMIN':
					router.replace('/admin/dashboard');
					break;
				case 'DM':
					router.replace('/dm/dashboard');
					break;
				case 'PLAYER':
					router.replace('/player/dashboard');
					break;
				default:
					router.replace('/');
			}
		}
	}, [status, session, router]);

	const getRoleIcon = () => {
		const role = session?.user?.role;
		switch (role) {
			case 'ADMIN':
				return <Shield className="w-8 h-8 text-purple-600" />;
			case 'DM':
				return <Users className="w-8 h-8 text-purple-600" />;
			case 'PLAYER':
				return <User className="w-8 h-8 text-purple-600" />;
			default:
				return <Sword className="w-8 h-8 text-purple-600" />;
		}
	};

	const getRoleText = () => {
		const role = session?.user?.role;
		switch (role) {
			case 'ADMIN':
				return 'Redirecting to Admin Dashboard...';
			case 'DM':
				return 'Redirecting to DM Dashboard...';
			case 'PLAYER':
				return 'Redirecting to Player Dashboard...';
			default:
				return 'Redirecting to Home...';
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
			<div className="max-w-md mx-auto px-4">
				<main className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-purple-300/30 p-8 text-center">
					<header className="mb-6">
						<div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">{getRoleIcon()}</div>
						<h1 className="text-2xl font-bold text-white mb-2">D&D Master</h1>
						<p className="text-purple-200">Preparing your adventure</p>
					</header>

					<section className="mb-6" aria-live="polite">
						<div className="flex items-center justify-center mb-4">
							<div className="w-8 h-8 border-3 border-purple-300 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
						</div>
						<p className="text-purple-100 font-medium">{getRoleText()}</p>
						{session?.user?.email && <p className="text-purple-200 mt-2">Welcome, {session.user.email.split('@')[0]}!</p>}
					</section>

					<footer className="text-sm text-purple-300">
						<p>Please wait while we set up your dashboard...</p>
					</footer>
				</main>
			</div>
		</div>
	);
}
