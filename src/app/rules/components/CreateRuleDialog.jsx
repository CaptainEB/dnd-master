'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

const CreateRuleDialog = ({ open, onOpenChange, form, onSubmit, session }) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`w-[95vw] max-w-2xl mx-auto border-0 shadow-xl backdrop-blur-sm ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
			>
				<DialogHeader>
					<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Create New Rule</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</FormLabel>
										<FormControl>
											<Input
												className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</FormLabel>
										<FormControl>
											<Input
												className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
										Content (Markdown Supported)
									</FormLabel>
									<FormControl>
										<Textarea
											rows={6}
											className={`text-xs sm:text-sm font-mono max-h-60 sm:max-h-80 overflow-y-auto resize-none ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
											placeholder="Enter your rule content here. You can use markdown formatting..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="order"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
										Order (for sorting within category)
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 bg-gray-700 text-white' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}`}
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root && (
							<div
								className={`text-sm p-3 rounded-lg border ${session?.user?.darkMode ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200'}`}
							>
								{form.formState.errors.root.message}
							</div>
						)}
						<div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								className={`order-2 sm:order-1 ${
									session?.user?.darkMode
										? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
										: 'border-gray-300 hover:bg-gray-50 text-gray-700'
								}`}
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className={`order-1 sm:order-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white`}
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
										Create Rule
									</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateRuleDialog;
