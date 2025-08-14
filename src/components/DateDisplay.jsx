'use client';

import { useEffect, useState } from 'react';

export function DateDisplay({ date, format = 'date' }) {
	const [formattedDate, setFormattedDate] = useState('');
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		if (date) {
			const dateObj = typeof date === 'string' ? new Date(date) : date;
			if (format === 'date') {
				setFormattedDate(dateObj.toLocaleDateString());
			} else if (format === 'datetime') {
				setFormattedDate(dateObj.toLocaleString());
			} else if (format === 'time') {
				setFormattedDate(dateObj.toLocaleTimeString());
			}
		}
	}, [date, format]);

	// Prevent hydration mismatch by not rendering until mounted
	if (!isMounted) {
		return <span>Loading...</span>;
	}

	return <span>{formattedDate}</span>;
}
