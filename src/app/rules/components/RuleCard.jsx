'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RuleCard = ({ rule, session, viewMode, canEdit, onEdit, onDelete, formatDate }) => {
	return (
		<Card
			key={rule.id}
			id={`rule-${rule.id}`}
			className={`backdrop-blur-sm hover:shadow-md transition-shadow ${
				session?.user?.darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-purple-200'
			}`}
		>
			<CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
					<CardTitle className={`text-lg sm:text-xl leading-tight ${session?.user?.darkMode ? 'text-white' : 'text-gray-800'}`}>
						{rule.title}
					</CardTitle>
					{viewMode === 'edit' && canEdit && (
						<div className="flex items-center gap-2 flex-shrink-0">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(rule)}
								className={`text-xs sm:text-sm ${
									session?.user?.darkMode
										? 'border-purple-400/50 hover:bg-purple-900/30 text-purple-400 hover:text-purple-300'
										: 'border-purple-200 hover:bg-purple-50 text-purple-600'
								}`}
							>
								<Edit className="h-3 w-3 sm:h-4 sm:w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onDelete(rule.id)}
								className={`text-xs sm:text-sm ${
									session?.user?.darkMode
										? 'border-red-400/50 hover:bg-red-900/30 text-red-400 hover:text-red-300'
										: 'border-red-200 hover:bg-red-50 text-red-600'
								}`}
							>
								<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
							</Button>
						</div>
					)}
				</div>
				<div
					className={`flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm ${session?.user?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
				>
					<div className="flex items-center gap-2 flex-wrap">
						<Badge
							variant="outline"
							className={`text-xs ${session?.user?.darkMode ? 'border-purple-400/50 text-purple-400' : 'border-purple-200 text-purple-700'}`}
						>
							{rule.category}
						</Badge>
						<span className="hidden sm:inline">•</span>
						<span className="text-xs">
							By {rule.author.characterName || rule.author.username || rule.author.email?.split('@')[0] || 'Unknown User'}
						</span>
						<span className="hidden sm:inline">•</span>
						<span className="text-xs">{formatDate(rule.createdAt)}</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
				<div className={`p-3 sm:p-4 rounded-lg ${session?.user?.darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50'}`}>
					<div
						className={`prose prose-sm max-w-none ${
							session?.user?.darkMode
								? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-gray-900 prose-blockquote:border-purple-500 prose-li:text-gray-300 prose-ul:text-gray-300 prose-ol:text-gray-300'
								: 'prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:text-purple-600 prose-blockquote:border-purple-300'
						}`}
					>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.content}</ReactMarkdown>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default RuleCard;
