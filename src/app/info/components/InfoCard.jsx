import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function InfoCard({ info, session, canEdit, onEdit, onDelete, formatDate }) {
	return (
		<Card
			id={`info-${info.id}`}
			className={`backdrop-blur-sm border ${
				session?.user?.darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-purple-200'
			} scroll-mt-32`}
		>
			<CardHeader>
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
					<div className="flex-1 min-w-0">
						<CardTitle className={`text-lg sm:text-xl mb-2 ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>{info.title}</CardTitle>
						<p className={`text-sm sm:text-base mb-3 ${session?.user?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{info.description}</p>
						<div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
							{info.category && (
								<span
									className={`px-2 py-1 rounded-full ${
										session?.user?.darkMode
											? 'bg-purple-900/50 text-purple-300 border border-purple-700'
											: 'bg-purple-100 text-purple-700 border border-purple-200'
									}`}
								>
									{info.category}
								</span>
							)}
							<span className={`${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Added {formatDate(info.createdAt)}</span>
							{info.author && (
								<span className={`${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									by {info.author.characterName || info.author.username || info.author.email}
								</span>
							)}
						</div>
					</div>

					{/* Edit/Delete buttons */}
					{canEdit && (
						<div className="flex gap-2 flex-shrink-0">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(info)}
								className={`text-xs sm:text-sm ${
									session?.user?.darkMode
										? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
										: 'border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-900'
								}`}
							>
								<Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
								Edit
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onDelete(info.id)}
								className={`text-xs sm:text-sm border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-400 ${
									session?.user?.darkMode ? 'hover:bg-red-900/20 hover:border-red-600' : ''
								}`}
							>
								<Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
								Delete
							</Button>
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent>
				<div
					className={`prose prose-sm sm:prose max-w-none ${
						session?.user?.darkMode
							? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-gray-900 prose-blockquote:border-purple-500 prose-li:text-gray-300 prose-ul:text-gray-300 prose-ol:text-gray-300'
							: 'prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:text-purple-600 prose-blockquote:border-purple-300'
					}`}
				>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{info.body}</ReactMarkdown>
				</div>
			</CardContent>
		</Card>
	);
}
