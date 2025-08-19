/** @type {import('next').NextConfig} */
const nextConfig = {
	// Suppress hydration warnings caused by browser extensions (like Grammarly)
	onRecoverableError: (error) => {
		// Suppress hydration warnings for browser extension attributes
		if (
			error.message &&
			error.message.includes('Hydration failed') &&
			(error.message.includes('data-new-gr-c-s-check-loaded') ||
				error.message.includes('data-gr-ext-installed') ||
				error.message.includes('grammarly'))
		) {
			return;
		}
		// Log other errors normally
		console.error('Recoverable error:', error);
	},
};

export default nextConfig;
