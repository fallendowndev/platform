'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SchoolYearDropdown from '../components/SchoolYearDropdown';

const EASE = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

function Collapse({ show, children }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="collapse"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: -6 }}
            animate={{ y: 0 }}
            exit={{ y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FieldError({ id, message }) {
  return (
    <Collapse show={!!message}>
      <p id={id} role="alert" className="pt-2 text-sm text-red-600">
        {message}
      </p>
    </Collapse>
  );
}

function Field({ label, id, error, className = '', children }) {
  return (
    <motion.div variants={item} className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-2 text-sm font-semibold text-neutral-700">
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </motion.div>
  );
}

function TextInput({ id, type = 'text', value, onChange, placeholder, error, autoComplete, icon: Icon, rightSlot, ltr }) {
  return (
    <div className="relative">
      <span
        className={`absolute inset-y-0 right-4 flex items-center pointer-events-none transition-colors duration-150 ${
          error ? 'text-red-500' : 'text-neutral-400'
        }`}
      >
        <Icon size={18} />
      </span>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        dir={ltr ? 'ltr' : undefined}
        className={[
          'w-full py-3.5 pr-11 rounded-xl border bg-white text-base text-neutral-900 outline-none',
          'transition-colors duration-150 focus:ring-2',
          rightSlot ? 'pl-11' : 'pl-4',
          ltr ? 'text-right' : '',
          error
            ? 'border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-neutral-300 placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-black/10',
        ].join(' ')}
      />
      {rightSlot}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [userType, setUserType] = useState('student'); // 'student' or 'teacher'
  const [form, setForm] = useState({ username: '', email: '', password: '', schoolYear: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError = (key) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    clearError(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    const errs = {};
    if (!form.username.trim()) errs.username = 'يرجى إدخال الاسم الكامل';
    if (!form.email.trim()) errs.email = 'يرجى إدخال البريد الإلكتروني';
    if (form.password.length < 8) errs.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (userType === 'student' && !form.schoolYear) {
      errs.schoolYear = 'يرجى اختيار السنة الدراسية';
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      userType,
      schoolYear: userType === 'student' ? form.schoolYear : undefined,
    };
    const result = await register(payload);
    setLoading(false);

    if (!result.ok) {
      if (result.errors) {
        const mapped = {};
        result.errors.forEach((err) => {
          mapped[err.field] = err.message;
        });
        setFieldErrors(mapped);
      } else {
        setGlobalError(result.message);
      }
      return;
    }

    if (result.user?.role === 'admin' && result.user?.isApproved) {
      router.replace('/dashboard');
    } else {
      router.replace('/confirmation');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-white px-6 py-10">
      <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-md">
        <motion.div variants={item} className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-snug mb-3">
            ابدأ رحلتك التعليمية اليوم وابنِ مستقبلك بالعلم
          </h1>
          <p className="text-base text-neutral-500">أنشئ حسابك في دقائق وانضم إلينا</p>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* User Type Selector Buttons (Student / Teacher) */}
          <motion.div variants={item} className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-neutral-700">نوع الحساب</span>
            <div className="flex w-full border border-neutral-300 rounded-2xl overflow-hidden p-1 bg-neutral-50">
              <button
                type="button"
                onClick={() => {
                  setUserType('student');
                  clearError('schoolYear');
                }}
                className={`cursor-pointer w-full text-center py-2.5 rounded-xl text-base font-semibold transition-all duration-150 ${
                  userType === 'student'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                طالب
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType('teacher');
                  clearError('schoolYear');
                  setForm((f) => ({ ...f, schoolYear: '' }));
                }}
                className={`cursor-pointer w-full text-center py-2.5 rounded-xl text-base font-semibold transition-all duration-150 ${
                  userType === 'teacher'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                أستاذ
              </button>
            </div>
          </motion.div>

          <Field label="الاسم الكامل" id="username" error={fieldErrors.username}>
            <TextInput
              id="username"
              value={form.username}
              onChange={set('username')}
              placeholder="ادخل اسمك الكامل"
              autoComplete="name"
              icon={User}
              error={fieldErrors.username}
            />
          </Field>

          <Field label="البريد الإلكتروني" id="email" error={fieldErrors.email}>
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="ادخل بريدك الإلكتروني"
              autoComplete="email"
              icon={Mail}
              ltr
              error={fieldErrors.email}
            />
          </Field>

          <Field label="كلمة المرور" id="password" error={fieldErrors.password}>
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="8 أحرف على الأقل"
              autoComplete="new-password"
              icon={Lock}
              error={fieldErrors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  className="absolute inset-y-0 left-4 flex items-center cursor-pointer text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </Field>

          {/* School Year Dropdown only if Student */}
          {userType === 'student' && (
            <motion.div variants={item} className="relative z-20 flex flex-col">
              <span className="mb-2 text-sm font-semibold text-neutral-700">السنة الدراسية</span>
              <SchoolYearDropdown
                value={form.schoolYear}
                onChange={(v) => {
                  setForm((f) => ({ ...f, schoolYear: v }));
                  clearError('schoolYear');
                }}
                error={fieldErrors.schoolYear}
              />
              <FieldError id="schoolYear-error" message={fieldErrors.schoolYear} />
            </motion.div>
          )}

          <Collapse show={!!globalError}>
            <p role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {globalError}
            </p>
          </Collapse>

          <motion.button
            variants={item}
            whileTap={loading ? undefined : { scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-neutral-900 text-white text-base font-semibold cursor-pointer transition-colors duration-150 hover:bg-neutral-700 disabled:bg-neutral-500 disabled:cursor-not-allowed mt-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </motion.button>

          <motion.p variants={item} className="text-center text-sm text-neutral-500">
            لديك حساب بالفعل؟{' '}
            <a href="/login" className="text-neutral-900 font-semibold hover:underline">
              تسجيل الدخول
            </a>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}