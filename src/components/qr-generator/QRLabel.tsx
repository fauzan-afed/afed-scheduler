'use client';

import React from 'react';

interface Room {
    id: string;
    name: string;
    modelPath?: string;
    capacity?: number;
    floorLevel?: string;
    isActive?: boolean;
}

interface QRLabelProps {
    room: Room;
    qrCode?: string;
    baseUrl?: string;
}

export default function QRLabel({ room, qrCode, baseUrl = 'http://167.172.87.156:3001' }: QRLabelProps) {
    const roomUrl = `${baseUrl}/?room=${room.id}`;

    return (
        <div className="qr-label">
            <div className="qr-header">
                <div className="qr-logo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#481267" />
                        <path d="M7 8h10M7 12h7M7 16h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h2 className="qr-brand">AFED MEETING ROOM</h2>
            </div>

            <div className="qr-code">
                {qrCode ? (
                    <img src={qrCode} alt={`QR code for ${room.name}`} />
                ) : (
                    <div className="qr-placeholder">Loading...</div>
                )}
            </div>

            <h1 className="room-name">{room.name}</h1>
            {room.floorLevel && (
                <p className="room-floor">Floor {room.floorLevel}</p>
            )}

            <hr className="qr-divider" />

            <p className="qr-instructions">
                Scan to view schedule & book
            </p>

            <p className="qr-url">{roomUrl}</p>
        </div>
    );
}
