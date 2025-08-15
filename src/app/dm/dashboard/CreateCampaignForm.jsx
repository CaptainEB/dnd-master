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
import { useSession } from 'next-auth/react';
import * as z from 'zod';
import { createCampaign } from '../../admin/components/actions';

const campaignSchema = z.object({
	name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be less than 100 characters'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export default function CreateCampaignForm() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { data: session } = useSession();
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
				<Button className={`${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
					<Plus className="h-4 w-4 mr-2" />
					Create Campaign
				</Button>
			</DialogTrigger>
			<DialogContent className={`sm:max-w-[425px] ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-900'}>Create New Campaign</DialogTitle>
					<DialogDescription className={session?.user?.darkMode ? 'text-gray-400' : 'text-gray-600'}>Create a new D&D campaign. You'll be automatically added as the DM.</DialogDescription>
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
						{form.formState.errors.root && <div className={`text-sm ${session?.user?.darkMode ? 'text-red-400' : 'text-red-600'}`}>{form.formState.errors.root.message}</div>}
						<DialogFooter>
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setOpen(false)} 
								disabled={isLoading}
								className={session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
							>
								Cancel
							</Button>
							<Button 
								type="submit" 
								disabled={isLoading} 
								className={`${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'}`}
							>
								{isLoading ? 'Creating...' : 'Create Campaign'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
