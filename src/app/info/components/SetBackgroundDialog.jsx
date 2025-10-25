import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function SetBackgroundDialog({ open, onOpenChange, form, onSubmit, session, currentBackground }) {
	const [previewUrl, setPreviewUrl] = useState(currentBackground || '');

	const handleUrlChange = (value) => {
		setPreviewUrl(value);
		form.setValue('backgroundUrl', value);
	};

	const handleClearBackground = () => {
		setPreviewUrl('');
		form.setValue('backgroundUrl', '');
		onSubmit({ backgroundUrl: '' });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`max-w-xs sm:max-w-lg w-[95vw] sm:w-full mx-2 sm:mx-auto border-0 shadow-xl backdrop-blur-sm overflow-y-auto max-h-[90vh] ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
			>
				<DialogHeader>
					<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Set Page Background</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 pb-32 sm:pb-4">
						{form.formState.errors.root && (
							<div
								className={`text-sm p-3 sm:p-4 rounded-lg border ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200'}`}
							>
								{form.formState.errors.root.message}
							</div>
						)}

						<div className="space-y-2">
							<p className={`text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
								Paste a direct image link from Imgur, Discord, or other image hosting services. The image will appear as a subtle background behind
								all page content.
							</p>
							<p className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								Tip: Right-click an image and select "Copy image address" to get the direct link.
							</p>
						</div>

						<FormField
							control={form.control}
							name="backgroundUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Image URL
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="https://i.imgur.com/example.jpg"
											onChange={(e) => {
												field.onChange(e);
												handleUrlChange(e.target.value);
											}}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-purple-200'} focus:border-purple-500 focus:ring-purple-500`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Preview */}
						{previewUrl && (
							<div className="space-y-2">
								<label className={`text-sm font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>Preview</label>
								<div
									className={`w-full h-32 rounded-lg border-2 border-dashed bg-cover bg-center bg-no-repeat relative ${session?.user?.darkMode ? 'border-gray-600' : 'border-gray-300'}`}
									style={{ backgroundImage: `url(${previewUrl})` }}
								>
									<div
										className={`absolute inset-0 rounded-lg flex items-center justify-center ${session?.user?.darkMode ? 'bg-black bg-opacity-80' : 'bg-black bg-opacity-80'}`}
									>
										<span className="text-white text-xs sm:text-sm px-2 text-center">Background Preview (shown at full opacity)</span>
									</div>
								</div>
								<p className={`text-xs ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									Actual background will be much more subtle (30% opacity)
								</p>
							</div>
						)}

						<div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-4">
							{currentBackground && (
								<Button
									type="button"
									variant="outline"
									onClick={handleClearBackground}
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-red-800 text-red-400 hover:bg-red-900/20 hover:border-red-700' : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'}`}
								>
									Remove Background
								</Button>
							)}
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:justify-end">
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base"
								>
									{form.formState.isSubmitting ? 'Saving...' : 'Set Background'}
								</Button>
								<Button
									type="button"
									variant="outline"
									className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50'}`}
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
