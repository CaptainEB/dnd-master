import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
	const { pathname } = request.nextUrl;

	// Allow access to public routes
	const publicRoutes = [
		'/',
		'/auth/error',
		'/api/auth',
	];

	// Check if current path is public
	const isPublicRoute = publicRoutes.some(route => 
		pathname === route || pathname.startsWith('/api/auth/')
	);

	// Allow access to public routes and API auth routes
	if (isPublicRoute) {
		return NextResponse.next();
	}

	// Get the token from the request
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// If no token, redirect to auth error page
	if (!token) {
		const url = request.nextUrl.clone();
		url.pathname = '/auth/error';
		url.searchParams.set('error', 'AccessDenied');
		return NextResponse.redirect(url);
	}

	// If authenticated, allow access to protected routes
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
