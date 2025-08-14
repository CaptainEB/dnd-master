'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
	const handleSignOut = () => {
		signOut({ callbackUrl: '/' });
	};

	return (
		<Button
			onClick={handleSignOut}
			variant="outline"
			size="sm"
			className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
		>
			<LogOut size={16} />
			Sign Out
		</Button>
	);
}
