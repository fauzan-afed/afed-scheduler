'use client';

import React from 'react';
import AuthButton from './AuthButton';

interface HeaderProps {
    date: Date;
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev?: () => void;
    onNext?: () => void;
    onDateChange?: (date: Date) => void;
    onFeedbackClick?: () => void;
}

export default function Header({ date, canGoPrev, canGoNext, onPrev, onNext, onDateChange, onFeedbackClick }: HeaderProps) {
    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric'
        };
        const dateStr = date.toLocaleDateString('en-US', options);

        if (isToday) return `Today, ${dateStr}`;
        if (isTomorrow) return `Tomorrow, ${dateStr}`;
        return dateStr;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onDateChange && e.target.value) {
            const selectedDate = new Date(e.target.value);
            selectedDate.setHours(0, 0, 0, 0);
            onDateChange(selectedDate);
        }
    };

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <header className="header">
            {canGoPrev ? (
                <button className="header-btn" onClick={onPrev} aria-label="Previous day">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            ) : (
                <div className="header-btn-placeholder" />
            )}

            {onFeedbackClick && (
                <button
                    className="header-info-btn"
                    onClick={onFeedbackClick}
                    aria-label="Submit feedback"
                    title="Report an issue or share an idea"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                </button>
            )}

            <div className="header-date-container">
                <span className="header-date">{formatDate(date)}</span>
                {onDateChange && (
                    <input
                        type="date"
                        className="header-date-picker"
                        value={formatDateForInput(date)}
                        onChange={handleDateChange}
                        aria-label="Select date"
                    />
                )}
            </div>

            <AuthButton />

            {canGoNext ? (
                <button className="header-btn" onClick={onNext} aria-label="Next day">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            ) : (
                <div className="header-btn-placeholder" />
            )}
        </header>
    );
}
