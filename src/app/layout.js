import DarkModeProvider from '@/components/DarkModeProvider';
import Navbar from '@/components/Navbar';
import SecondaryNavbar from '@/components/SecondaryNavbar';
import SessionProvider from '@/components/SessionProvider';
import { getServerSession } from 'next-auth/next';
import { Geist, Geist_Mono } from 'next/font/google';
import { authOptions } from './api/auth/[...nextauth]/route';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata = {
	title: 'D&D Master - Your Adventure Hub',
	description: 'Private D&D campaign management for your party',
};

export default async function RootLayout({ children }) {
	const session = await getServerSession(authOptions);

	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
				<SessionProvider session={session}>
					<DarkModeProvider>
						<Navbar />
						<SecondaryNavbar />
						{children}
					</DarkModeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
