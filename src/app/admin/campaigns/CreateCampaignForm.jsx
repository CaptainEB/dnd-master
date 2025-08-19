'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createCampaign } from '../components/actions';

const campaignSchema = z.object({
	name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be less than 100 characters'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export default function CreateCampaignForm() {
	const { data: session } = useSession();
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
				<Button className={`text-sm ${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
					<Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
					<span className="hidden sm:inline">Create Campaign</span>
					<span className="sm:hidden">Create</span>
				</Button>
			</DialogTrigger>
			<DialogContent className={`mx-3 sm:mx-0 sm:max-w-[425px] ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={`text-base sm:text-lg ${session?.user?.darkMode ? 'text-white' : 'text-gray-900'}`}>
						Create New Campaign
					</DialogTitle>
					<DialogDescription className={`text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
						Create a new D&D campaign. You can add members and content later.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Campaign Name *</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter campaign name..."
											{...field}
											className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
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
									<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter campaign description..."
											rows={3}
											{...field}
											className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root && (
							<div className={`text-sm p-2 sm:p-3 rounded-md ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50'}`}>
								{form.formState.errors.root.message}
							</div>
						)}
						<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isLoading}
								size="sm"
								className={`text-sm ${
									session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
								}`}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								size="sm"
								className={`text-sm ${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'}`}
							>
								{isLoading ? <span className="hidden sm:inline">Creating...</span> : <span className="hidden sm:inline">Create Campaign</span>}
								{isLoading ? <span className="sm:hidden">...</span> : <span className="sm:hidden">Create</span>}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
