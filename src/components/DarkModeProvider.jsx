'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function DarkModeProvider({ children }) {
	const { data: session } = useSession();

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const body = document.body;

			if (session?.user?.darkMode) {
				body.classList.add('dark');
			} else {
				body.classList.remove('dark');
			}
		}
	}, [session?.user?.darkMode]);

	return <>{children}</>;
}
