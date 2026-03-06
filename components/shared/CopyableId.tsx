'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CopyableIdProps {
    id: string;
    className?: string;
    shorten?: boolean;
}

export function CopyableId({ id, className, shorten = true }: CopyableIdProps) {
    const [copied, setCopied] = useState(false);

    const displayId = shorten && id.length > 12
        ? `${id.slice(0, 4)}...${id.slice(-4)}`
        : id;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            toast.success('Đã sao chép ID');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Không thể sao chép ID');
        }
    };

    return (
        <div className={cn("flex items-center gap-1.5 font-mono text-xs", className)}>
            <span className="text-muted-foreground">{displayId}</span>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{copied ? 'Đã sao chép!' : 'Sao chép ID'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
