'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Shield, Sparkles } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SignInContent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/redirect';

	useEffect(() => {
		if (status === 'authenticated') {
			router.replace(callbackUrl);
		}
	}, [status, router, callbackUrl]);

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
					<p className="text-white">Loading...</p>
				</div>
			</div>
		);
	}

	if (status === 'authenticated') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
				<div className="text-center text-white">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
					<p>Redirecting...</p>
				</div>
			</div>
		);
	}

	const handleSignIn = () => {
		signIn('google', { callbackUrl });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
			{/* Background Effects */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
				<div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
			</div>

			<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					{/* Main Sign In Card */}
					<Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
						<CardHeader className="text-center pb-6">
							<div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
								<Shield className="w-8 h-8 text-purple-600" />
							</div>
							<CardTitle className="text-2xl font-bold text-gray-900 mb-2">Welcome to D&D Master</CardTitle>
							<CardDescription className="text-gray-600">Sign in to access your private adventure hub</CardDescription>
						</CardHeader>

						<CardContent className="space-y-6">
							{/* Hero Section */}
							<div className="text-center py-4">
								<div className="flex justify-center items-center gap-2 mb-4">
									<span className="text-2xl">⚔️</span>
									<span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
										Your Adventure Awaits
									</span>
									<span className="text-2xl">🛡️</span>
								</div>
								<p className="text-sm text-gray-600">Access campaigns, track quests, and manage your D&D world</p>
							</div>

							{/* Sign In Button */}
							<div className="space-y-4">
								<Button
									onClick={handleSignIn}
									size="lg"
									className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
								>
									<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
										<path
											fill="currentColor"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="currentColor"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="currentColor"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="currentColor"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									Sign In with Google
								</Button>
							</div>

							{/* Features Preview */}
							<div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
								<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-purple-600" />
									What's Inside
								</h3>
								<div className="text-sm text-gray-600 space-y-1">
									<p>• Campaign management and quest tracking</p>
									<p>• D&D rules and creature glossary</p>
									<p>• Player and DM dashboard tools</p>
									<p>• Real-time updates and notes</p>
								</div>
							</div>

							{/* Navigation */}
							<div className="flex gap-3 pt-2">
								<Button variant="outline" asChild className="flex-1 border-gray-300 hover:bg-gray-50">
									<Link href="/">
										<Home className="w-4 h-4 mr-2" />
										Home
									</Link>
								</Button>
								<Button variant="outline" onClick={() => window.history.back()} className="flex-1 border-gray-300 hover:bg-gray-50">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Go Back
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* D&D Branding */}
					<div className="mt-8 text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 transition-colors">
							<Shield className="w-5 h-5" />
							<span className="font-bold">D&D Master</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function SignIn() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
						<p className="text-white">Loading...</p>
					</div>
				</div>
			}
		>
			<SignInContent />
		</Suspense>
	);
}
