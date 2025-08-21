import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function CreateInfoDialog({ open, onOpenChange, form, onSubmit, session }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add New Information</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{form.formState.errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{form.formState.errors.root.message}</div>}

						<FormField
							control={form.control}
							name="title"
							rules={{ required: 'Title is required' }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter a descriptive title..." />
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
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} placeholder="Brief description of this information..." rows={2} />
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
									<FormLabel>Category</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
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
									<FormLabel>Order (for sorting within category)</FormLabel>
									<FormControl>
										<Input {...field} type="number" min="0" placeholder="0" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
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
									<FormLabel>Content (Markdown Supported)</FormLabel>
									<FormControl>
										<Textarea {...field} placeholder="Enter detailed information here using markdown..." rows={10} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Creating...' : 'Create Info'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
