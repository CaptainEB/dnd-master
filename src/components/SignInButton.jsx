'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export default function SignInButton() {
	const handleSignIn = () => {
		signIn('google');
	};

	return (
		<Button
			onClick={handleSignIn}
			size="lg"
			className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
		>
			🎲 Sign In with Google
		</Button>
	);
}
