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
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Set Page Background</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{form.formState.errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{form.formState.errors.root.message}</div>}

						<div className="space-y-2">
							<p className="text-sm text-gray-600">
								Paste a direct image link from Imgur, Discord, or other image hosting services. The image will appear as a subtle background behind
								all page content.
							</p>
							<p className="text-xs text-gray-500">Tip: Right-click an image and select "Copy image address" to get the direct link.</p>
						</div>

						<FormField
							control={form.control}
							name="backgroundUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Image URL</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="https://i.imgur.com/example.jpg"
											onChange={(e) => {
												field.onChange(e);
												handleUrlChange(e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Preview */}
						{previewUrl && (
							<div className="space-y-2">
								<label className="text-sm font-medium">Preview</label>
								<div
									className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 bg-cover bg-center bg-no-repeat relative"
									style={{ backgroundImage: `url(${previewUrl})` }}
								>
									<div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg flex items-center justify-center">
										<span className="text-white text-sm">Background Preview (shown at full opacity)</span>
									</div>
								</div>
								<p className="text-xs text-gray-500">Actual background will be much more subtle (15% opacity)</p>
							</div>
						)}

						<div className="flex justify-between pt-4">
							<div>
								{currentBackground && (
									<Button type="button" variant="outline" onClick={handleClearBackground} className="text-red-600 hover:text-red-700">
										Remove Background
									</Button>
								)}
							</div>
							<div className="flex gap-2">
								<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? 'Saving...' : 'Set Background'}
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
