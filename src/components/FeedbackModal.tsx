'use client';

import React, { useState } from 'react';
import { CurrentUser } from '@/hooks/usePocketBase';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: FeedbackData) => Promise<{ success: boolean; error?: string }>;
    currentUser: CurrentUser | null;
}

export interface FeedbackData {
    type: 'issue' | 'idea' | 'question' | 'other';
    category: 'bug' | 'feature' | 'ui' | 'performance' | 'other';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    email?: string;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit, currentUser }: FeedbackModalProps) {
    const [formData, setFormData] = useState<FeedbackData>({
        type: 'issue',
        category: 'bug',
        title: '',
        description: '',
        priority: 'medium',
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await onSubmit(formData);

        if (result.success) {
            alert('Thank you for your feedback! We\'ll review it shortly.');
            onClose();
            // Reset form
            setFormData({
                type: 'issue',
                category: 'bug',
                title: '',
                description: '',
                priority: 'medium',
                email: '',
            });
        } else {
            alert('Failed to submit feedback: ' + (result.error || 'Unknown error'));
        }

        setIsSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content feedback-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Submit Feedback</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-group">
                        <label htmlFor="type">Type *</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="issue">Issue</option>
                            <option value="idea">Idea</option>
                            <option value="question">Question</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="bug">Bug</option>
                            <option value="feature">Feature Request</option>
                            <option value="ui">UI/UX</option>
                            <option value="performance">Performance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority *</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Brief summary of your feedback"
                            required
                            maxLength={255}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please provide detailed information..."
                            required
                            minLength={10}
                            maxLength={5000}
                            rows={6}
                            disabled={isSubmitting}
                        />
                    </div>

                    {!currentUser && (
                        <div className="form-group">
                            <label htmlFor="email">Email (optional)</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="For updates on your feedback"
                                disabled={isSubmitting}
                            />
                            <small>Leave your email if you want us to follow up with you</small>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
