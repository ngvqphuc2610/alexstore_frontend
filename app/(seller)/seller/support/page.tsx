'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
    LifeBuoy,
    Send,
    History,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const supportSchema = z.object({
    type: z.string().min(1, 'Vui lòng chọn loại yêu cầu'),
    title: z.string().min(5, 'Tiêu đề phải ít nhất 5 ký tự').max(100),
    description: z.string().min(20, 'Nội dung phải ít nhất 20 ký tự'),
});

type SupportFormValues = z.infer<typeof supportSchema>;

export default function SupportPage() {
    const [view, setView] = useState<'form' | 'history'>('form');

    const form = useForm<SupportFormValues>({
        resolver: zodResolver(supportSchema),
        defaultValues: {
            type: '',
            title: '',
            description: '',
        },
    });

    const { data: myRequests, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
        queryKey: ['support-requests', 'me'],
        queryFn: async () => {
            const res = await fetch('/api/proxy/support/me');
            if (!res.ok) throw new Error('Failed to fetch history');
            return res.json();
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: SupportFormValues) => {
            const res = await fetch('/api/proxy/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error('Không thể gửi yêu cầu');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Yêu cầu đã được gửi thành công!');
            form.reset();
            refetchHistory();
            setView('history');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        },
    });

    function onSubmit(values: SupportFormValues) {
        mutation.mutate(values);
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Chờ xử lý</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Đang xử lý</Badge>;
            case 'RESOLVED':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Đã giải quyết</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Từ chối</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <LifeBuoy className="h-8 w-8 text-primary" />
                        Hỗ trợ & Liên hệ Admin
                    </h1>
                    <p className="text-gray-500 mt-1">Gửi yêu cầu hỗ trợ hoặc báo lỗi hệ thống cho chúng tôi.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                    <Button
                        variant={view === 'form' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setView('form')}
                        className={view === 'form' ? 'bg-white shadow-sm' : ''}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Gửi yêu cầu
                    </Button>
                    <Button
                        variant={view === 'history' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setView('history')}
                        className={view === 'history' ? 'bg-white shadow-sm' : ''}
                    >
                        <History className="h-4 w-4 mr-2" />
                        Lịch sử ({myRequests?.length || 0})
                    </Button>
                </div>
            </div>

            {view === 'form' ? (
                <Card className="border-none shadow-xl shadow-gray-200/50">
                    <CardHeader className="bg-slate-50 border-b rounded-t-xl py-6">
                        <CardTitle className="text-xl">フォーム Hỗ trợ</CardTitle>
                        <CardDescription>
                            Vui lòng điền đầy đủ thông tin bên dưới, chúng tôi sẽ phản hồi sớm nhất có thể.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Loại yêu cầu</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Chọn loại yêu cầu" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CATEGORY_REG">Đăng ký danh mục sản phẩm</SelectItem>
                                                    <SelectItem value="PRODUCT_APPROVAL">Yêu cầu duyệt sản phẩm</SelectItem>
                                                    <SelectItem value="TECH_SUPPORT">Hỗ trợ kỹ thuật</SelectItem>
                                                    <SelectItem value="BUG_REPORT">Báo lỗi hệ thống</SelectItem>
                                                    <SelectItem value="COMPLAINT">Khiếu nại</SelectItem>
                                                    <SelectItem value="OTHER">Khác</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu đề</FormLabel>
                                            <FormControl>
                                                <Input className="h-12" placeholder="VD: Yêu cầu thêm danh mục Gia dụng" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Nội dung chi tiết</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Mô tả chi tiết yêu cầu của bạn..."
                                                    className="min-h-[150px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Vui lòng cung cấp đầy đủ thông tin để admin xử lý nhanh hơn.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full h-12 text-lg" disabled={mutation.isPending}>
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Gửi yêu cầu tới Admin
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {isLoadingHistory ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                        </div>
                    ) : myRequests?.data?.length === 0 ? (
                        <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center">
                            <History className="h-16 w-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900">Chưa có yêu cầu nào</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                Bạn chưa gửi bất kỳ yêu cầu hỗ trợ nào trước đây.
                            </p>
                            <Button variant="outline" className="mt-6" onClick={() => setView('form')}>
                                Gửi yêu cầu đầu tiên
                            </Button>
                        </Card>
                    ) : (
                        myRequests?.data?.map((req: any) => (
                            <Card key={req.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(req.status)}
                                                <span className="text-xs text-gray-400">
                                                    #{req.id} • {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mt-1">{req.title}</h3>
                                        </div>
                                        <Badge variant="secondary" className="capitalize">
                                            {req.type.toLowerCase().replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-4 border border-gray-100">
                                        {req.description}
                                    </div>

                                    {req.adminReply && (
                                        <div className="relative mt-6 pt-6 border-t border-dashed">
                                            <div className="absolute -top-3 left-6 px-2 bg-white text-xs font-semibold text-primary flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                Phản hồi từ Admin
                                            </div>
                                            <div className="p-4 rounded-lg bg-primary/5 text-sm text-primary border border-primary/10">
                                                {req.adminReply}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Clock, title: "Hỗ trợ 24/7", desc: "Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến." },
                    { icon: CheckCircle2, title: "Xử lý nhanh chóng", desc: "Cam kết xử lý yêu cầu trong vòng 24 giờ làm việc." },
                    { icon: AlertCircle, title: "Bảo mật thông tin", desc: "Thông tin của bạn luôn được bảo vệ an toàn." }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-50">
                        <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
