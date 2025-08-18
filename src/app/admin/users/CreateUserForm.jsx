'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createUser } from '../components/actions';

const createUserSchema = z.object({
	email: z.string().email('Invalid email address'),
	role: z.enum(['USER', 'ADMIN'], {
		required_error: 'Please select a role',
	}),
	username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
});

export default function CreateUserForm({ onUserCreated }) {
	const { data: session } = useSession();
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
				// Call the parent component's refresh function instead of router.refresh()
				if (onUserCreated) {
					onUserCreated();
				}
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
				<Button className={`${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
					<UserPlus className="h-4 w-4 mr-2" />
					Add User
				</Button>
			</DialogTrigger>
			<DialogContent className={`sm:max-w-[425px] ${session?.user?.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
				<DialogHeader>
					<DialogTitle className={session?.user?.darkMode ? 'text-white' : 'text-gray-900'}>Create New User</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Email</FormLabel>
									<FormControl>
										<Input
											placeholder="user@example.com"
											type="email"
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
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Preferred Username</FormLabel>
									<FormControl>
										<Input
											placeholder="johndoe"
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
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={session?.user?.darkMode ? 'text-gray-300' : 'text-gray-900'}>Role</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger
												className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
											>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className={session?.user?.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
											<SelectItem
												value="USER"
												className={session?.user?.darkMode ? 'text-white hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-100'}
											>
												User
											</SelectItem>
											<SelectItem
												value="ADMIN"
												className={session?.user?.darkMode ? 'text-white hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-100'}
											>
												Administrator
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{form.formState.errors.root && (
							<div className={`text-sm p-3 rounded-md ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50'}`}>
								{form.formState.errors.root.message}
							</div>
						)}

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();
									setOpen(false);
								}}
								disabled={isLoading}
								className={
									session?.user?.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								className={`${session?.user?.darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'}`}
							>
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
