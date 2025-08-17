'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const error = searchParams.get('error');

	const getErrorMessage = (error) => {
		switch (error) {
			case 'Configuration':
				return 'There is a problem with the server configuration.';
			case 'AccessDenied':
				return 'Access denied. You do not have permission to sign in.';
			case 'Verification':
				return 'The verification token has expired or has already been used.';
			case 'Default':
			default:
				return 'An error occurred during authentication.';
		}
	};

	return (
		<div className={`min-h-screen ${session?.user?.darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center px-4`}>
			<Card className={`w-full max-w-md ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
				<CardHeader className="text-center">
					<CardTitle className={`text-2xl font-bold ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>Authentication Error</CardTitle>
					<CardDescription className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>
						Something went wrong during the authentication process.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className={`p-4 rounded-md ${session?.user?.darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
						<p className={`text-sm ${session?.user?.darkMode ? 'text-red-400' : 'text-red-800'}`}>{getErrorMessage(error)}</p>
					</div>

					<div className="space-y-2">
						<Link href="/auth/signin" className="block">
							<Button
								className={`w-full ${
									session?.user?.darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
								}`}
							>
								Try Signing In Again
							</Button>
						</Link>

						<Link href="/" className="block">
							<Button
								variant="outline"
								className={`w-full ${
									session?.user?.darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50'
								}`}
							>
								Return to Home
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
