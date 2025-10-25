'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateMerchant } from '../../admin/components/actions';

export default function EditMerchantDialog({ open, onOpenChange, merchant, session, onMerchantUpdated }) {
	const form = useForm({
		defaultValues: {
			name: '',
			city: '',
			location: '',
			description: '',
		},
	});

	// Update form when merchant changes
	useEffect(() => {
		if (merchant) {
			form.reset({
				name: merchant.name || '',
				city: merchant.city || '',
				location: merchant.location || '',
				description: merchant.description || '',
			});
		}
	}, [merchant, form]);

	const onSubmit = async (data) => {
		try {
			const result = await updateMerchant(merchant.id, data);
			if (result.success) {
				onMerchantUpdated(result.data);
				onOpenChange(false);
			} else {
				form.setError('root', { message: result.error });
			}
		} catch (error) {
			form.setError('root', { message: 'An unexpected error occurred' });
		}
	};

	if (!merchant) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`sm:max-w-lg overflow-y-auto max-h-[90vh] ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
			>
				<DialogHeader>
					<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-900'}>Edit Merchant</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-32 sm:pb-4">
						{form.formState.errors.root && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-700 text-sm">{form.formState.errors.root.message}</p>
							</div>
						)}

						<FormField
							control={form.control}
							name="name"
							rules={{ required: 'Merchant name is required' }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Merchant Name</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="e.g., Gandalf's General Goods"
											className={
												session?.user?.darkMode
													? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
													: 'border-gray-300 focus:border-purple-500'
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="city"
							rules={{ required: 'City is required' }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="e.g., Waterdeep"
											className={
												session?.user?.darkMode
													? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
													: 'border-gray-300 focus:border-purple-500'
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location (Optional)</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="e.g., Market Square, North Gate"
											className={
												session?.user?.darkMode
													? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
													: 'border-gray-300 focus:border-purple-500'
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Describe the merchant, their appearance, personality, or specialties..."
											rows={3}
											className={
												session?.user?.darkMode
													? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
													: 'border-gray-300 focus:border-purple-500'
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className={
									session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
							>
								{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
