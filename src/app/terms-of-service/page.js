'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import { Gavel, Loader2 } from 'lucide-react';

export default function TermsOfServicePage() {
    const [legalConfig, setLegalConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLegal = async () => {
            try {
                const res = await fetch('/api/config/legal');
                const data = await res.json();
                if (data.success) {
                    setLegalConfig(data.data);
                }
            } catch (error) {
                console.error('Error fetching legal config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLegal();
    }, []);

    const termsOfService = legalConfig?.terms_of_service || {
        title: 'Điều khoản sử dụng',
        content: '<p>Đang tải nội dung...</p>'
    };

    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <SectionHeading
                    title={termsOfService.title}
                    subtitle="Quy định và điều kiện khi sử dụng dịch vụ của chúng tôi"
                    icon={Gavel}
                />

                <div className="mt-12 bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-muted-foreground animate-pulse">Đang tải điều khoản...</p>
                        </div>
                    ) : (
                        <div
                            className="legal-content"
                            dangerouslySetInnerHTML={{ __html: termsOfService.content }}
                        />
                    )}
                </div>

                <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-xl">
                    <p className="text-sm text-center text-muted-foreground">
                        Bằng việc đặt hàng tại website, bạn đồng ý với các Điều khoản sử dụng này.
                    </p>
                </div>
            </div>
        </main>
    );
}
