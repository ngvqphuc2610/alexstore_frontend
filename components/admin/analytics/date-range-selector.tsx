'use client';

import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export interface DateRange {
    range: string;
    from?: string;
    to?: string;
}

interface DateRangeSelectorProps {
    value: DateRange;
    onValueChange: (value: DateRange) => void;
}

export function DateRangeSelector({ value, onValueChange }: DateRangeSelectorProps) {
    const [isCustom, setIsCustom] = useState(value.range === 'custom_range');
    const [localFrom, setLocalFrom] = useState(value.from || '');
    const [localTo, setLocalTo] = useState(value.to || '');

    useEffect(() => {
        if (value.range !== 'custom_range') {
            setIsCustom(false);
        } else {
            setIsCustom(true);
        }
    }, [value.range]);

    const handleRangeChange = (newRange: string) => {
        if (newRange === 'custom_range') {
            setIsCustom(true);
            onValueChange({ range: 'custom_range', from: localFrom, to: localTo });
        } else {
            setIsCustom(false);
            onValueChange({ range: newRange });
        }
    };

    const handleCustomDateChange = (type: 'from' | 'to', date: string) => {
        if (type === 'from') {
            setLocalFrom(date);
            onValueChange({ ...value, from: date });
        } else {
            setLocalTo(date);
            onValueChange({ ...value, to: date });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={value.range} onValueChange={handleRangeChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Khoảng thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hôm nay</SelectItem>
                        <SelectItem value="7d">7 ngày qua</SelectItem>
                        <SelectItem value="30d">30 ngày qua</SelectItem>
                        <SelectItem value="this_month">Tháng này</SelectItem>
                        <SelectItem value="last_month">Tháng trước</SelectItem>
                        <SelectItem value="custom_range">Tùy chọn...</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isCustom && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <Input
                        type="date"
                        className="w-[140px] h-9 text-xs"
                        value={localFrom}
                        onChange={(e) => handleCustomDateChange('from', e.target.value)}
                    />
                    <span className="text-muted-foreground text-sm">đến</span>
                    <Input
                        type="date"
                        className="w-[140px] h-9 text-xs"
                        value={localTo}
                        onChange={(e) => handleCustomDateChange('to', e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
