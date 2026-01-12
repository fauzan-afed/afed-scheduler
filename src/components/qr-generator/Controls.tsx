'use client';

import React from 'react';

type PaperSize = 'a4' | 'letter';
type Layout = '2x2' | '2x3' | '3x3';

interface ControlsProps {
    paperSize: PaperSize;
    layout: Layout;
    onPaperSizeChange: (size: PaperSize) => void;
    onLayoutChange: (layout: Layout) => void;
    onPrint: () => void;
    onRegenerate: () => void;
    isGenerating: boolean;
    roomCount: number;
}

export default function Controls({
    paperSize,
    layout,
    onPaperSizeChange,
    onLayoutChange,
    onPrint,
    onRegenerate,
    isGenerating,
    roomCount
}: ControlsProps) {
    return (
        <div className="qr-controls no-print">
            <div className="qr-controls-row">
                <div className="qr-control-group">
                    <label htmlFor="paper-size" className="qr-control-label">
                        Paper Size
                    </label>
                    <select
                        id="paper-size"
                        className="qr-control-select"
                        value={paperSize}
                        onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
                    >
                        <option value="a4">A4 (210 × 297 mm)</option>
                        <option value="letter">Letter (8.5 × 11 in)</option>
                    </select>
                </div>

                <div className="qr-control-group">
                    <label htmlFor="layout" className="qr-control-label">
                        Layout
                    </label>
                    <select
                        id="layout"
                        className="qr-control-select"
                        value={layout}
                        onChange={(e) => onLayoutChange(e.target.value as Layout)}
                    >
                        <option value="2x2">2×2 Grid (4 labels)</option>
                        <option value="2x3">2×3 Grid (6 labels)</option>
                        <option value="3x3">3×3 Grid (9 labels)</option>
                    </select>
                </div>
            </div>

            <div className="qr-controls-actions">
                <button
                    className="qr-btn qr-btn-secondary"
                    onClick={onRegenerate}
                    disabled={isGenerating}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    {isGenerating ? 'Generating...' : 'Regenerate QRs'}
                </button>

                <button className="qr-btn qr-btn-primary" onClick={onPrint}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.198-.54-1.14-1.196l.228-2.523m11.228 0H8.343m0 0l-.96-7.5a1.125 1.125 0 011.123-1.25h8.72c.662 0 1.198.54 1.14 1.196l-.96 7.5" />
                    </svg>
                    Print Labels ({roomCount})
                </button>
            </div>

            <div className="qr-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>Tip: Use your browser's print dialog to save as PDF</span>
            </div>
        </div>
    );
}
