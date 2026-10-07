'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PlaySquare, UserCircle,
  GraduationCap, LogOut, ChevronLeft, ChevronDown,
  ShieldCheck, MoreVertical, X, Users, UserCheck, BookPlus, Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, pendingUsersCount = 0 }) {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(
    activeTab?.startsWith('admin') || false
  );
  const badgeRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (activeTab?.startsWith('admin')) {
      setAdminOpen(true);
    } else {
      setAdminOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    function onClickOutside(e) {
      if (!badgeOpen) return;
      if (
        badgeRef.current && !badgeRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setBadgeOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside, true);
    return () => document.removeEventListener('mousedown', onClickOutside, true);
  }, [badgeOpen]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setBadgeOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    setBadgeOpen(false);
    await logout();
    router.push('/login');
  };

  const handleNavClick = (id) => {
    if (!id.startsWith('admin')) {
      setAdminOpen(false);
    }
    if (setActiveTab) {
      setActiveTab(id);
    } else {
      router.push('/dashboard');
    }
  };

  const initials = user?.username
    ? user.username.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      {/* DESKTOP SIDEBAR - Deep Slate-900 (#0f172a) Primary Color */}
      <aside className="hidden md:flex w-72 shrink-0 h-screen sticky top-0 flex-col justify-between z-30 bg-[#0f172a] text-slate-100 border-l border-slate-800 shadow-xl select-none">
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-3 pb-5 border-b border-slate-800/80 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:bg-blue-500 transition-colors">
              <GraduationCap size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight">النظام الأكاديمي</span>
              <span className="text-xs text-slate-400 font-medium">
                {isAdmin ? 'إدارة المنصة' : user?.userType === 'teacher' ? 'بوابة الأساتذة' : 'بوابة الطلاب'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            {/* Overview */}
            <button
              type="button"
              onClick={() => handleNavClick('overview')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer text-start ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={19} className={activeTab === 'overview' ? 'text-white' : 'text-slate-400'} />
                <span>لوحة التحكم</span>
              </div>
              <ChevronLeft size={15} className={activeTab === 'overview' ? 'text-white/80' : 'text-slate-500'} />
            </button>

            {/* Books */}
            <button
              type="button"
              onClick={() => handleNavClick('books')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer text-start ${
                activeTab === 'books'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={19} className={activeTab === 'books' ? 'text-white' : 'text-slate-400'} />
                <span>الكتب والمنهج</span>
              </div>
              <ChevronLeft size={15} className={activeTab === 'books' ? 'text-white/80' : 'text-slate-500'} />
            </button>

            {/* Videos */}
            <button
              type="button"
              onClick={() => handleNavClick('videos')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer text-start ${
                activeTab === 'videos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <PlaySquare size={19} className={activeTab === 'videos' ? 'text-white' : 'text-slate-400'} />
                <span>الفيديوهات التعليمية</span>
              </div>
              <ChevronLeft size={15} className={activeTab === 'videos' ? 'text-white/80' : 'text-slate-500'} />
            </button>

            {/* Admin Accordion Dropdown */}
            {isAdmin && (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setAdminOpen((prev) => !prev);
                    if (!activeTab.startsWith('admin')) {
                      handleNavClick('admin-users');
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer text-start outline-none ${
                    activeTab.startsWith('admin')
                      ? 'bg-slate-800/90 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={19} className={activeTab.startsWith('admin') ? 'text-blue-400' : 'text-slate-400'} />
                    <span>إدارة المنصة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingUsersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {pendingUsersCount}
                      </span>
                    )}
                    <ChevronLeft
                      size={15}
                      className={`text-slate-400 transition-transform duration-200 ${
                        adminOpen ? '-rotate-90 text-white' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Submenu Dropdown Items with Animation */}
                <AnimatePresence initial={false}>
                  {adminOpen && (
                    <motion.div
                      key="admin-submenu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1 pr-4 mr-2 border-r-2 border-slate-800 pt-1.5 pb-1">
                        <button
                          type="button"
                          onClick={() => handleNavClick('admin-users')}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-start ${
                            activeTab === 'admin-users'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Users size={15} />
                            <span>مراجعة وتفعيل الحسابات</span>
                          </div>
                          {pendingUsersCount > 0 && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              activeTab === 'admin-users' ? 'bg-white text-blue-900' : 'bg-amber-500 text-white'
                            }`}>
                              {pendingUsersCount}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavClick('admin-books')}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-start ${
                            activeTab === 'admin-books'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <BookPlus size={15} />
                          <span>إدارة الكتب والمناهج</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavClick('admin-videos')}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-start ${
                            activeTab === 'admin-videos'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <Video size={15} />
                          <span>إدارة الفيديوهات</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile */}
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer text-start ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCircle size={19} className={activeTab === 'profile' ? 'text-white' : 'text-slate-400'} />
                <span>ملفك الشخصي</span>
              </div>
              <ChevronLeft size={15} className={activeTab === 'profile' ? 'text-white/80' : 'text-slate-500'} />
            </button>
          </nav>
        </div>

        {/* User Profile Trigger at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 relative shrink-0">
          <button
            ref={triggerRef}
            onClick={() => setBadgeOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="text-start min-w-0">
                <div className="text-sm font-bold text-white truncate max-w-[140px]">
                  {user?.username || '...'}
                </div>
                <div className="text-xs text-slate-400 truncate max-w-[140px]">
                  {isAdmin ? 'مدير المنصة' : user?.userType === 'teacher' ? 'أستاذ' : user?.schoolYear || ''}
                </div>
              </div>
            </div>
            <MoreVertical size={16} className="text-slate-400 shrink-0 group-hover:text-white" />
          </button>

          {/* Profile Popup */}
          {badgeOpen && (
            <div
              ref={badgeRef}
              className="absolute bottom-full mb-2 start-3 w-64 z-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 text-white"
              style={{ animation: 'slideUp .2s cubic-bezier(.16,1,.3,1)' }}
            >
              <div className="px-4 py-4 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500/40 bg-slate-800 flex items-center justify-center text-sm font-bold text-blue-400">
                    {initials}
                  </div>
                  <button onClick={() => setBadgeOpen(false)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 cursor-pointer transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="text-sm font-bold text-white">{user?.username}</div>
                <div className="flex items-center gap-2 mt-1">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-900/50 border border-blue-700/50 rounded-full px-2 py-0.5">
                      <ShieldCheck size={10} /> مدير
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {user?.userType === 'teacher' ? 'أستاذ' : user?.schoolYear || 'طالب'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 truncate" dir="ltr">{user?.email}</div>
              </div>
              <div className="p-2 flex flex-col gap-1 bg-slate-900">
                <button
                  onClick={() => { setBadgeOpen(false); handleNavClick('profile'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-start text-slate-200"
                >
                  <UserCircle size={16} className="text-slate-400" />
                  ملفك الشخصي
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { setBadgeOpen(false); handleNavClick('admin-users'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-start text-slate-200"
                  >
                    <ShieldCheck size={16} className="text-slate-400" />
                    لوحة الإدارة
                  </button>
                )}
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-950/40 text-red-400 transition-colors cursor-pointer text-start"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-[#0f172a] border-t border-slate-800 flex items-center justify-around px-2 py-2 shadow-2xl">
        <button
          onClick={() => handleNavClick('overview')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl flex-1 transition-all ${
            activeTab === 'overview' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] leading-tight text-center">الرئيسية</span>
        </button>
        <button
          onClick={() => handleNavClick('books')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl flex-1 transition-all ${
            activeTab === 'books' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-[10px] leading-tight text-center">الكتب</span>
        </button>
        <button
          onClick={() => handleNavClick('videos')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl flex-1 transition-all ${
            activeTab === 'videos' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlaySquare size={20} />
          <span className="text-[10px] leading-tight text-center">الفيديوهات</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => handleNavClick('admin-users')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl flex-1 transition-all ${
              activeTab.startsWith('admin') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={20} />
            <span className="text-[10px] leading-tight text-center">الإدارة</span>
          </button>
        )}
        <button
          onClick={() => handleNavClick('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl flex-1 transition-all ${
            activeTab === 'profile' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCircle size={20} />
          <span className="text-[10px] leading-tight text-center">الملف</span>
        </button>
      </nav>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
