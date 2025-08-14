'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createUser } from '../components/actions';

const createUserSchema = z.object({
	email: z.string().email('Invalid email address'),
	role: z.enum(['PLAYER', 'DM', 'ADMIN'], {
		required_error: 'Please select a role',
	}),
	username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
});

export default function CreateUserForm() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			email: '',
			role: '',
			username: '',
		},
	});

	const onSubmit = async (values) => {
		setIsLoading(true);
		try {
			const result = await createUser(values);

			if (result.success) {
				form.reset();
				setOpen(false);
				router.refresh(); // Refresh the page to show new user
			} else {
				form.setError('root', {
					type: 'manual',
					message: result.error || 'Failed to create user',
				});
			}
		} catch (error) {
			form.setError('root', {
				type: 'manual',
				message: 'An unexpected error occurred',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-blue-600 hover:bg-blue-700">
					<UserPlus className="h-4 w-4 mr-2" />
					Add User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="user@example.com" type="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Preferred Username</FormLabel>
									<FormControl>
										<Input placeholder="johndoe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="PLAYER">Player</SelectItem>
											<SelectItem value="DM">Dungeon Master</SelectItem>
											<SelectItem value="ADMIN">Administrator</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{form.formState.errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{form.formState.errors.root.message}</div>}

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();
									setOpen(false);
								}}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<UserPlus className="h-4 w-4 mr-2" />
										Create User
									</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
