'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { notificationsService } from '@/services/notifications.service';

interface EmailLog {
    id: string;
    to: string;
    subject: string;
    template: string;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
    sentAt: string;
}

export function EmailLogsList() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['email-logs', page],
        queryFn: () => notificationsService.getEmailLogs(page, limit)
    });

    const logs: EmailLog[] = data?.data || [];
    const meta = data?.meta || { total: 0, lastPage: 1 };

    return (
        <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    Lịch sử Email
                </CardTitle>
                <CardDescription>
                    Tổng cộng {meta.total} email đã được gửi từ hệ thống.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="w-[200px]">Người nhận</TableHead>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thời gian</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Không có lịch sử email nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium">{log.to}</TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={log.subject}>
                                            {log.subject}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                                {log.template}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {log.status === 'SUCCESS' ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Thành công</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400" title={log.error}>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Thất bại</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm">
                                                    {format(new Date(log.sentAt), 'dd/MM/yyyy', { locale: vi })}
                                                </span>
                                                <span className="text-[10px] opacity-70">
                                                    {format(new Date(log.sentAt), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Trang {page} / {meta.lastPage}
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= meta.lastPage || isLoading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
