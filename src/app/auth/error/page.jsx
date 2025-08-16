'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home, LogIn, Shield, UserX } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get('error');

	// Define error types and their corresponding messages
	const errorConfig = {
		Configuration: {
			icon: AlertTriangle,
			title: 'Configuration Error',
			description: 'There was a problem with the server configuration.',
			message: 'Our authentication system is experiencing technical difficulties. Please try again later or contact support.',
			color: 'text-red-500',
			bgColor: 'bg-red-50',
		},
		AccessDenied: {
			icon: UserX,
			title: 'Access Denied',
			description: 'You do not have permission to sign in.',
			message: 'Your account is not authorized to access this application. Please contact an administrator to request access.',
			color: 'text-orange-500',
			bgColor: 'bg-orange-50',
		},
		Verification: {
			icon: Shield,
			title: 'Verification Failed',
			description: 'The verification token is invalid or has expired.',
			message: 'The verification link you used is invalid or has expired. Please request a new sign-in link.',
			color: 'text-yellow-500',
			bgColor: 'bg-yellow-50',
		},
		Default: {
			icon: AlertTriangle,
			title: 'Authentication Error',
			description: 'An unexpected error occurred during sign-in.',
			message: 'Something went wrong while trying to sign you in. Please try again or contact support if the problem persists.',
			color: 'text-red-500',
			bgColor: 'bg-red-50',
		},
	};

	// Get the appropriate error configuration
	const config = errorConfig[error] || errorConfig.Default;
	const IconComponent = config.icon;

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Main Error Card */}
				<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
					<CardHeader className="text-center pb-6">
						<div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
							<IconComponent className={`w-8 h-8 ${config.color}`} />
						</div>
						<CardTitle className="text-2xl font-bold text-gray-900">{config.title}</CardTitle>
						<CardDescription className="text-gray-600">{config.description}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center">
							<p className="text-gray-700 leading-relaxed">{config.message}</p>
						</div>

						{/* Error Code Display */}
						{error && (
							<div className="bg-gray-50 rounded-lg p-3 border">
								<p className="text-sm text-gray-600">
									<span className="font-medium">Error Code:</span> <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">{error}</code>
								</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="space-y-3">
							<Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
								<Link href="/auth/signin">
									<LogIn className="w-4 h-4 mr-2" />
									Try Sign In Again
								</Link>
							</Button>

							<div className="grid grid-cols-2 gap-3">
								<Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50">
									<Link href="/">
										<Home className="w-4 h-4 mr-2" />
										Home
									</Link>
								</Button>
								<Button variant="outline" onClick={() => window.history.back()} className="border-gray-300 hover:bg-gray-50">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Go Back
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Additional Help Information */}
				<div className="mt-6 text-center">
					<Card className="bg-white/60 backdrop-blur-sm border-purple-200">
						<CardContent className="pt-4">
							<h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
							<div className="text-sm text-gray-600 space-y-1">
								{error === 'AccessDenied' ? (
									<>
										<p>• Contact your administrator to request access</p>
										<p>• Ensure you're using the correct Google account</p>
										<p>• Check if your account has been activated</p>
									</>
								) : (
									<>
										<p>• Make sure you have a stable internet connection</p>
										<p>• Try clearing your browser cache and cookies</p>
										<p>• Contact support if the problem persists</p>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* D&D Branding */}
				<div className="mt-8 text-center">
					<Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
						<Shield className="w-5 h-5" />
						<span className="font-bold">D&D Master</span>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function AuthError() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
						<p className="text-gray-600">Loading...</p>
					</div>
				</div>
			}
		>
			<ErrorContent />
		</Suspense>
	);
}
