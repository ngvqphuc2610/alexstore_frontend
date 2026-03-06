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
    Loader2,
    Search,
    Phone,
    Mail,
    HelpCircle,
    ChevronDown
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
    const [openFaq, setOpenFaq] = useState<number | null>(0);

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

    const faqs = [
        {
            q: "Làm thế nào để đổi trả sản phẩm?",
            a: "Bạn có thể gửi yêu cầu đổi trả trong vòng 7 ngày kể từ khi nhận hàng. Vui lòng chọn loại yêu cầu 'Báo lỗi hệ thống' hoặc 'Khiếu nại'."
        },
        {
            q: "Thời gian xử lý yêu cầu là bao lâu?",
            a: "Chúng tôi cam kết phản hồi tất cả các yêu cầu hỗ trợ trong vòng 24 giờ làm việc."
        },
        {
            q: "Làm sao để đăng ký bán hàng?",
            a: "AlexStore hiện đang mở đăng ký cho các nhà bán hàng mới. Vui lòng gửi yêu cầu 'Khác' và để lại số điện thoại liên hệ."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/90 to-primary text-white py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Xin chào, chúng tôi có thể giúp gì cho bạn?</h1>
                    <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto text-lg">Tìm kiếm câu trả lời nhanh chóng trong trung tâm hỗ trợ của AlexStore hoặc gửi tin nhắn trực tiếp cho chúng tôi.</p>

                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Nhập từ khóa tìm kiếm (Ví dụ: Đổi trả, Thanh toán...)"
                            className="w-full h-14 pl-12 pr-4 rounded-full bg-white text-gray-900 shadow-xl border-none text-lg focus-visible:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Contact & FAQ */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Contact Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Phone className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Hotline 24/7</p>
                                        <p className="text-lg font-bold text-gray-900">1900 1234</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email Hỗ Trợ</p>
                                        <p className="text-base font-bold text-gray-900">support@alexstore.vn</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* FAQs */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-white pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <HelpCircle className="h-5 w-5 text-primary" />
                                    Câu hỏi thường gặp (FAQ)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {faqs.map((faq, idx) => (
                                        <div key={idx} className="p-4 bg-white hover:bg-gray-50/50 transition-colors">
                                            <button
                                                className="flex w-full items-center justify-between text-left"
                                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                            >
                                                <span className="font-semibold text-gray-800 text-sm py-1">{faq.q}</span>
                                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                                            </button>
                                            {openFaq === idx && (
                                                <div className="mt-3 text-sm text-gray-500 leading-relaxed pr-6 animate-in slide-in-from-top-2">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Dynamic Form/History */}
                    <div className="lg:col-span-8">
                        <Card className="border-none shadow-xl bg-white overflow-hidden min-h-[600px] flex flex-col">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
                                <button
                                    onClick={() => setView('form')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${view === 'form'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                        }`}
                                >
                                    <Send className="h-4 w-4" />
                                    Gửi yêu cầu mới
                                </button>
                                <button
                                    onClick={() => setView('history')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${view === 'history'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                        }`}
                                >
                                    <History className="h-4 w-4" />
                                    Lịch sử yêu cầu ({myRequests?.data?.length || 0})
                                </button>
                            </div>

                            <div className="flex-1 p-6 md:p-8">
                                {view === 'form' ? (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gửi Yêu Cầu Hỗ Trợ</h2>
                                            <p className="text-gray-500">Vui lòng điền chi tiết vấn đề của bạn. Đội ngũ kỹ thuật sẽ xem xét và phản hồi qua hệ thống này và email của bạn.</p>
                                        </div>

                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="type"
                                                        render={({ field }: { field: any }) => (
                                                            <FormItem className="md:col-span-2">
                                                                <FormLabel className="font-semibold text-gray-700">Loại yêu cầu</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                                                                            <SelectValue placeholder="-- Chọn vấn đề bạn đang gặp phải --" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="CATEGORY_REG">Đăng ký danh mục sản phẩm</SelectItem>
                                                                        <SelectItem value="PRODUCT_APPROVAL">Yêu cầu duyệt sản phẩm</SelectItem>
                                                                        <SelectItem value="TECH_SUPPORT">Hỗ trợ kỹ thuật / Tư vấn</SelectItem>
                                                                        <SelectItem value="BUG_REPORT">Báo lỗi hệ thống / Lỗi web</SelectItem>
                                                                        <SelectItem value="COMPLAINT">Khiếu nại người bán / người mua</SelectItem>
                                                                        <SelectItem value="OTHER">Vấn đề khác</SelectItem>
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
                                                            <FormItem className="md:col-span-2">
                                                                <FormLabel className="font-semibold text-gray-700">Tiêu đề</FormLabel>
                                                                <FormControl>
                                                                    <Input className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" placeholder="Tóm tắt ngắn gọn vấn đề (VD: Lỗi thanh toán VNPay)" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-semibold text-gray-700">Nội dung chi tiết</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Mô tả chi tiết lỗi, các bước bạn đã thực hiện, hoặc mong muốn của bạn..."
                                                                    className="min-h-[160px] resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="pt-2">
                                                    <Button type="submit" className="w-full md:w-auto h-12 px-8 text-base bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all" disabled={mutation.isPending}>
                                                        {mutation.isPending ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                Đang gửi yêu cầu...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Gửi yêu cầu hỗ trợ
                                                                <Send className="ml-2 h-4 w-4" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Lịch Sử Yêu Cầu</h2>
                                                <p className="text-gray-500 text-sm">Theo dõi tiến độ xử lý các yêu cầu của bạn.</p>
                                            </div>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium px-3 py-1">
                                                Tổng cộng: {myRequests?.data?.length || 0}
                                            </Badge>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
                                            {isLoadingHistory ? (
                                                <div className="flex justify-center py-20">
                                                    <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                                                </div>
                                            ) : myRequests?.data?.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                        <History className="h-10 w-10 text-gray-300" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">Trống</h3>
                                                    <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
                                                        Bạn chưa gửi bất kỳ yêu cầu hỗ trợ nào. Lịch sử của bạn sẽ xuất hiện ở đây.
                                                    </p>
                                                    <Button variant="outline" className="mt-6 border-primary text-primary hover:bg-primary/5" onClick={() => setView('form')}>
                                                        Tạo yêu cầu mới
                                                    </Button>
                                                </div>
                                            ) : (
                                                myRequests?.data?.map((req: any) => (
                                                    <div key={req.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 hover:border-primary/30 hover:shadow-md transition-all">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                                        <div className="flex items-start justify-between mb-3 pl-2">
                                                            <div className="flex flex-col gap-1.5">
                                                                <h3 className="text-base font-bold text-gray-900 leading-tight">{req.title}</h3>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                                    <span>Ticket #{req.id}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span className="flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1 opacity-70" />
                                                                        {new Date(req.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span className="text-primary capitalize">{req.type.toLowerCase().replace('_', ' ')}</span>
                                                                </div>
                                                            </div>
                                                            {getStatusBadge(req.status)}
                                                        </div>
                                                        <div className="bg-gray-50/80 rounded-lg p-3.5 text-sm text-gray-600 mb-2 border border-gray-100 ml-2">
                                                            <p className="line-clamp-2">{req.description}</p>
                                                        </div>

                                                        {req.adminReply && (
                                                            <div className="relative mt-4 pt-4 ml-2 border-t border-dashed">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-900 mb-1">Admin AlexStore phản hồi:</p>
                                                                        <p className="text-sm text-gray-700 bg-primary/5 p-3 rounded-lg border border-primary/10">
                                                                            {req.adminReply}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
