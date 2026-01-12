'use client';

import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import QRLabel from './QRLabel';
import Controls from './Controls';
import AuthButton from '../AuthButton';
import pb from '@/lib/pocketbase';

interface Room {
    id: string;
    name: string;
    modelPath?: string;
    capacity?: number;
    floorLevel?: string;
    isActive?: boolean;
}

type PaperSize = 'a4' | 'letter';
type Layout = '2x2' | '2x3' | '3x3';

interface QRGeneratorPageProps {
    baseUrl?: string;
}

export default function QRGeneratorPage({ baseUrl = 'http://167.172.87.156:3000' }: QRGeneratorPageProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map());
    const [paperSize, setPaperSize] = useState<PaperSize>('a4');
    const [layout, setLayout] = useState<Layout>('2x3');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch rooms from PocketBase
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const result = await pb.collection('rooms').getList(1, 50, {
                    filter: 'isActive = true',
                    sort: '+name',
                });

                const roomsData: Room[] = result.items.map(room => ({
                    id: room.id,
                    name: room.name,
                    modelPath: room.modelPath,
                    capacity: room.capacity,
                    floorLevel: room.floorLevel,
                    isActive: room.isActive,
                }));

                setRooms(roomsData);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const generateQRCodes = useCallback(async () => {
        setIsGenerating(true);
        const newQrCodes = new Map<string, string>();

        for (const room of rooms) {
            const url = `${baseUrl}/?room=${room.id}`;
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    width: 512,
                    margin: 2,
                    color: {
                        dark: '#481267',   // Brand purple
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                });
                newQrCodes.set(room.id, dataUrl);
            } catch (error) {
                console.error(`Failed to generate QR for ${room.name}:`, error);
            }
        }

        setQrCodes(newQrCodes);
        setIsGenerating(false);
    }, [rooms, baseUrl]);

    useEffect(() => {
        if (rooms.length > 0 && qrCodes.size === 0) {
            generateQRCodes();
        }
    }, [rooms, qrCodes.size, generateQRCodes]);

    const handlePrint = () => {
        window.print();
    };

    const getLayoutClasses = () => {
        const layouts = {
            '2x2': 'grid-cols-2 grid-rows-2',
            '2x3': 'grid-cols-2 grid-rows-3',
            '3x3': 'grid-cols-3 grid-rows-3'
        };
        return layouts[layout];
    };

    return (
        <main className="qr-generator-page">
            <div className="qr-generator-container">
                <header className="qr-generator-header">
                    <div>
                        <h1 className="qr-generator-title">QR Code Generator</h1>
                        <p className="qr-generator-subtitle">Generate and print QR codes for meeting rooms</p>
                    </div>
                    <AuthButton />
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner" />
                        <p style={{ color: '#481267', marginTop: '16px' }}>Loading rooms...</p>
                    </div>
                ) : (
                    <>
                <Controls
                    paperSize={paperSize}
                    layout={layout}
                    onPaperSizeChange={setPaperSize}
                    onLayoutChange={setLayout}
                    onPrint={handlePrint}
                    onRegenerate={generateQRCodes}
                    isGenerating={isGenerating}
                    roomCount={rooms.length}
                />

                <div className="print-preview-section">
                    <h2 className="preview-section-title">Print Preview</h2>
                    <div className={`qr-labels-grid ${getLayoutClasses()}`} data-layout={layout}>
                        {rooms.map((room) => (
                            <QRLabel
                                key={room.id}
                                room={room}
                                qrCode={qrCodes.get(room.id)}
                                baseUrl={baseUrl}
                            />
                        ))}
                    </div>
                </div>
                    </>
                )}
            </div>
        </main>
    );
}
