'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ConfirmationPage() {
  const router = useRouter();

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-900 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl text-center flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
          <Clock size={32} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          تم إنشاء حسابك بنجاح
        </h1>

        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-4">
          الحساب قيد مراجعة الإدارة
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          شكراً لتسجيلك! لا يمكن الوصول إلى محتوى المنصة حتى يتم تفعيل حسابك والموافقة عليه من قبل إدارة المنصة. سيتم إشعارك فور اعتماد الحساب.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            العودة لتسجيل الدخول
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
