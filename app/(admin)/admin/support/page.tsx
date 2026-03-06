'use client';

import React, { useState } from 'react';
import {
    LifeBuoy,
    Search,
    Filter,
    MoreHorizontal,
    MessageSquare,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    User,
    Mail,
    Calendar,
    ArrowRight,
    Send
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminSupportPage() {
    const queryClient = useQueryClient();
    const [selectedReq, setSelectedReq] = useState<any>(null);
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [statusToUpdate, setStatusToUpdate] = useState<string>('');

    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-support-requests'],
        queryFn: async () => {
            const res = await fetch('/api/proxy/support/admin/all');
            if (!res.ok) throw new Error('Failed to fetch requests');
            return res.json();
        },
    });

    const replyMutation = useMutation({
        mutationFn: async ({ id, adminReply, status }: { id: number, adminReply: string, status: string }) => {
            const res = await fetch(`/api/proxy/support/${id}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminReply, status }),
            });
            if (!res.ok) throw new Error('Không thể gửi phản hồi');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Đã gửi phản hồi thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-support-requests'] });
            setIsReplyOpen(false);
            setReplyText('');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Mới</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Đang xử lý</Badge>;
            case 'RESOLVED':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Đã xong</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Từ chối</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleReply = () => {
        if (!selectedReq || !replyText || !statusToUpdate) {
            toast.error('Vui lòng nhập nội dung và chọn trạng thái');
            return;
        }
        replyMutation.mutate({
            id: selectedReq.id,
            adminReply: replyText,
            status: statusToUpdate
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <LifeBuoy className="h-6 w-6 text-indigo-600" />
                        Quản lý Yêu cầu Hỗ trợ
                    </h1>
                    <p className="text-slate-500 text-sm">Xem và phản hồi các yêu cầu từ người dùng và người bán.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 opacity-20" />
                        </div>
                    ) : requests?.data?.length === 0 ? (
                        <div className="text-center py-20">
                            <LifeBuoy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500">Chưa có yêu cầu hỗ trợ nào.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Người gửi</TableHead>
                                    <TableHead>Chủ đề</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests?.data?.map((req: any) => (
                                    <TableRow key={req.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium">#{req.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{req.user.username}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">{req.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{req.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-[10px] uppercase">
                                                {req.type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                                onClick={() => {
                                                    setSelectedReq(req);
                                                    setReplyText(req.adminReply || '');
                                                    setStatusToUpdate(req.status);
                                                    setIsReplyOpen(true);
                                                }}
                                            >
                                                Phản hồi
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Reply Dialog */}
            <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-indigo-600 text-white p-6">
                        <DialogTitle className="text-xl">Phản hồi yêu cầu #{selectedReq?.id}</DialogTitle>
                        <DialogDescription className="text-indigo-100">
                            Gửi phản hồi và cập nhật trạng thái cho người dùng.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReq && (
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600">
                                        {selectedReq.user.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{selectedReq.user.username}</span>
                                        <span className="text-xs text-slate-500">{new Date(selectedReq.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-sm font-bold text-slate-900 mb-1">{selectedReq.title}</p>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                        "{selectedReq.description}"
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Trạng thái xử lý</label>
                                    <Select value={statusToUpdate} onValueChange={setStatusToUpdate}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Chờ xử lý (Pending)</SelectItem>
                                            <SelectItem value="IN_PROGRESS">Đang xử lý (In Progress)</SelectItem>
                                            <SelectItem value="RESOLVED">Giải quyết (Resolved)</SelectItem>
                                            <SelectItem value="REJECTED">Từ chối (Rejected)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Nội dung phản hồi</label>
                                    <Textarea
                                        className="min-h-[120px] focus-visible:ring-indigo-500"
                                        placeholder="Nhập nội dung phản hồi cho người dùng..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="bg-slate-50 p-4 border-t">
                        <Button variant="ghost" onClick={() => setIsReplyOpen(false)}>Hủy bỏ</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleReply}
                            disabled={replyMutation.isPending}
                        >
                            {replyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gửi phản hồi
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
