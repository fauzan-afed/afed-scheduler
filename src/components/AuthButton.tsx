'use client';

import React from 'react';
import { useAuth } from '@/hooks/usePocketBase';
import Avatar from 'react-nice-avatar';

export default function AuthButton() {
    const { user, logout } = useAuth();

    if (!user) {
        return null; // Don't show anything if not logged in
    }

    return (
        <div className="auth-button-container">
            <div className="user-info">
                <Avatar
                    className="user-avatar-small"
                    {...user.avatarConfig}
                    style={{ width: '32px', height: '32px' }}
                />
                <span className="user-name">{user.name}</span>
            </div>
            <button
                className="auth-logout-btn"
                onClick={logout}
                title="Logout"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
            </button>
        </div>
    );
}
