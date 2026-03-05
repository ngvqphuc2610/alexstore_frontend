import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function BuyerFooter() {
    return (
        <footer className="border-t bg-white">
            <div className="container mx-auto px-4 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

                    {/* Brand & Info */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <ShoppingBag className="h-7 w-7 text-primary" />
                            <span className="text-2xl font-black tracking-tighter text-gray-900">AlexStore<span className="text-primary">.</span></span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            Mạng lưới mua sắm trực tuyến hàng đầu, mang đến trải nghiệm tuyệt vời và sản phẩm chất lượng trong từng cú nhấp chuột.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-primary hover:text-white transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-primary hover:text-white transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-primary hover:text-white transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-primary hover:text-white transition-colors">
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Liên kết hữu ích</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">Trang chủ</Link></li>
                            <li><Link href="/products" className="text-sm text-gray-500 hover:text-primary transition-colors">Sản phẩm</Link></li>
                            <li><Link href="/categories" className="text-sm text-gray-500 hover:text-primary transition-colors">Danh mục</Link></li>
                            <li><Link href="/about" className="text-sm text-gray-500 hover:text-primary transition-colors">Giới thiệu về chúng tôi</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Chăm sóc khách hàng</h3>
                        <ul className="space-y-3">
                            <li><Link href="/faq" className="text-sm text-gray-500 hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
                            <li><Link href="/shipping" className="text-sm text-gray-500 hover:text-primary transition-colors">Chính sách giao hàng</Link></li>
                            <li><Link href="/returns" className="text-sm text-gray-500 hover:text-primary transition-colors">Chính sách đổi trả</Link></li>
                            <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">Bảo mật thông tin</Link></li>
                            <li><Link href="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm text-gray-500">Xuan Dong, Cam My, Dong Nai</span>
                            </li>
                            <li className="flex gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm text-gray-500">+84 393 102 373</span>
                            </li>
                            <li className="flex gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm text-gray-500">alexnguyenplus2610@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} AlexStore. Tất cả các quyền được bảo lưu.
                    </p>
                    <div className="flex gap-2">
                        {/* Payment methods mock */}
                        <div className="h-8 w-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-gray-400">VISA</div>
                        <div className="h-8 w-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-gray-400">MC</div>
                        <div className="h-8 w-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-gray-400">PAYPAL</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
