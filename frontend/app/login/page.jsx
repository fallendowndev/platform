'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EASE = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

function FieldError({ id, message }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key="field-error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="overflow-hidden"
        >
          <motion.p
            id={id}
            role="alert"
            initial={{ y: -6 }}
            animate={{ y: 0 }}
            exit={{ y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="pt-2 text-sm text-red-600"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputBase =
  'w-full py-3.5 rounded-xl border bg-white text-base text-neutral-900 outline-none transition-colors duration-150 focus:ring-2';
const inputNormal =
  'border-neutral-300 placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-black/10';
const inputInvalid =
  'border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const clearError = (field) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = { email: '', password: '' };
    if (!email.trim()) next.email = 'يرجى إدخال البريد الإلكتروني';
    if (!password) next.password = 'يرجى إدخال كلمة المرور';

    if (next.email || next.password) {
      setErrors(next);
      return;
    }

    setErrors(next);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.ok) {
      setErrors({ email: '', password: result.message });
      return;
    }

    router.replace('/dashboard');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-white px-6 py-10"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <motion.div variants={item} className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-snug mb-3">
            كل يوم جديد فرصة لتتعلّم شيئًا جديدًا
          </h1>
          <p className="text-base text-neutral-500">مرحبًا بعودتك</p>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <motion.div variants={item} className="flex flex-col">
            <label htmlFor="email" className="mb-2 text-sm font-semibold text-neutral-700">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <span
                className={`absolute inset-y-0 right-4 flex items-center pointer-events-none transition-colors duration-150 ${
                  errors.email ? 'text-red-500' : 'text-neutral-400'
                }`}
              >
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                placeholder="ادخل بريدك الإلكتروني"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`${inputBase} pr-11 pl-4 text-right ${errors.email ? inputInvalid : inputNormal}`}
                dir="ltr"
              />
            </div>
            <FieldError id="email-error" message={errors.email} />
          </motion.div>

          <motion.div variants={item} className="flex flex-col">
            <label htmlFor="password" className="mb-2 text-sm font-semibold text-neutral-700">
              كلمة المرور
            </label>
            <div className="relative">
              <span
                className={`absolute inset-y-0 right-4 flex items-center pointer-events-none transition-colors duration-150 ${
                  errors.password ? 'text-red-500' : 'text-neutral-400'
                }`}
              >
                <Lock size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                placeholder="كلمة المرور"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`${inputBase} pr-11 pl-11 ${errors.password ? inputInvalid : inputNormal}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute inset-y-0 left-4 flex items-center cursor-pointer text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FieldError id="password-error" message={errors.password} />
          </motion.div>

          <motion.button
            variants={item}
            whileTap={loading ? undefined : { scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="mt-1 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-neutral-900 text-white text-base font-semibold cursor-pointer transition-colors duration-150 hover:bg-neutral-700 disabled:bg-neutral-500 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </motion.button>

          <motion.p variants={item} className="text-center text-sm text-neutral-500">
            ليس لديك حساب؟{' '}
            <a href="/register" className="text-neutral-900 font-semibold hover:underline">
              إنشاء حساب
            </a>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}