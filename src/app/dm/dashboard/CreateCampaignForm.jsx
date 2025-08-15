'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createCampaign } from '../../admin/components/actions';

const campaignSchema = z.object({
	name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be less than 100 characters'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export default function CreateCampaignForm() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(campaignSchema),
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			const result = await createCampaign(data);

			if (result.success) {
				form.reset();
				setOpen(false);
				// Refresh the page to show new campaign
				router.refresh();
			} else {
				form.setError('root', { message: result.error });
			}
		} catch (error) {
			form.setError('root', { message: 'An unexpected error occurred' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-purple-600 hover:bg-purple-700">
					<Plus className="h-4 w-4 mr-2" />
					Create Campaign
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Campaign</DialogTitle>
					<DialogDescription>Create a new D&D campaign. You'll be automatically added as the DM.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Campaign Name *</FormLabel>
									<FormControl>
										<Input placeholder="Enter campaign name..." {...field} />
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
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea placeholder="Enter campaign description..." rows={3} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
								{isLoading ? 'Creating...' : 'Create Campaign'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
