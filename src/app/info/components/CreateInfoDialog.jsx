import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function CreateInfoDialog({ open, onOpenChange, form, onSubmit, session }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`max-w-xs sm:max-w-lg lg:max-w-2xl w-[95vw] sm:w-full mx-2 sm:mx-auto border-0 shadow-xl backdrop-blur-sm overflow-y-auto max-h-[90vh] ${session?.user?.darkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}
			>
				<DialogHeader>
					<DialogTitle className={`text-lg sm:text-xl ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Information</DialogTitle>
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

						<FormField
							control={form.control}
							name="title"
							rules={{ required: 'Title is required' }}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Title *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Enter a descriptive title..."
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-purple-200'} focus:border-purple-500 focus:ring-purple-500`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							rules={{ required: 'Description is required' }}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Description *
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Brief description of this information..."
											rows={2}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-purple-200'} focus:border-purple-500 focus:ring-purple-500`}
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
									<FormLabel className={`text-sm sm:text-base font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Category
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger
												className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-purple-200'}`}
											>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="General">General</SelectItem>
											<SelectItem value="World Lore">World Lore</SelectItem>
											<SelectItem value="Character Creation">Character Creation</SelectItem>
											<SelectItem value="Setting">Setting</SelectItem>
											<SelectItem value="NPCs">NPCs</SelectItem>
											<SelectItem value="Locations">Locations</SelectItem>
											<SelectItem value="History">History</SelectItem>
											<SelectItem value="Culture">Culture</SelectItem>
											<SelectItem value="Religion">Religion</SelectItem>
											<SelectItem value="Politics">Politics</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="order"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Order (for sorting within category)
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min="0"
											placeholder="0"
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											className={`text-sm sm:text-base ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-purple-200'} focus:border-purple-500 focus:ring-purple-500`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="body"
							rules={{ required: 'Body content is required' }}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={`text-sm sm:text-base font-medium ${session?.user?.darkMode ? 'text-white' : 'text-gray-700'}`}>
										Content (Markdown Supported) *
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter detailed information here using markdown..."
											rows={10}
											className={`text-sm sm:text-base min-h-32 sm:min-h-40 ${session?.user?.darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-purple-200'} focus:border-purple-500 focus:ring-purple-500`}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base"
							>
								{form.formState.isSubmitting ? 'Creating...' : 'Create Info'}
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
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
