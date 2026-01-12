'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SchedulerPage from '@/components/SchedulerPage';
import QRGeneratorPage from '@/components/qr-generator/QRGeneratorPage';

function HomeContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room');

    // If room parameter exists, show scheduler for that room
    // Otherwise, show QR generator page
    if (roomId) {
        return <SchedulerPage roomId={roomId} />;
    }

    return <QRGeneratorPage />;
}

// Loading component
function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px'
        }}>
            <div className="loading-spinner" />
            <p style={{ color: '#481267', fontWeight: 500 }}>Loading...</p>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <HomeContent />
        </Suspense>
    );
}
