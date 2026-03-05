'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

const SELLER_TYPES = [
    { value: 'STANDARD', label: 'Standard', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { value: 'MALL', label: 'Mall', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { value: 'PRO', label: 'Pro', color: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
];

interface SellerTypeCheckboxesProps {
    value: string[];
    onChange: (types: string[]) => void;
    showHint?: boolean;
}

export function SellerTypeCheckboxes({ value, onChange, showHint = true }: SellerTypeCheckboxesProps) {
    const toggle = (type: string) => {
        const next = value.includes(type)
            ? value.filter(t => t !== type)
            : [...value, type];
        onChange(next);
    };

    return (
        <div className="space-y-2">
            <Label>Loại Seller được phép</Label>
            <div className="flex flex-wrap gap-2">
                {SELLER_TYPES.map(({ value: type, label, color }) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => toggle(type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer
                            ${value.includes(type)
                                ? `${color} border-current ring-1 ring-current/20`
                                : 'bg-muted/30 border-transparent hover:bg-muted/60 text-muted-foreground'
                            }`}
                    >
                        <div className={`h-3.5 w-3.5 rounded border-2 flex items-center justify-center transition-colors
                            ${value.includes(type) ? 'border-current bg-current' : 'border-muted-foreground/40'}`}>
                            {value.includes(type) && (
                                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        {label}
                    </button>
                ))}
            </div>
            {showHint && (
                <p className="text-[0.78rem] text-muted-foreground/70 italic">
                    Nếu không chọn, chỉ Admin có thể thấy danh mục này.
                </p>
            )}
        </div>
    );
}
