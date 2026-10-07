'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircle, Mail, GraduationCap, Calendar, ShieldCheck,
  BookOpen, PlaySquare, BookMarked
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-neutral-100 text-neutral-900">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-neutral-100 text-neutral-800">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-neutral-800 truncate">{title}</p>
        {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [openedBooks, setOpenedBooks] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    try {
      const vids = JSON.parse(localStorage.getItem('platform_watched_videos') || '[]');
      setWatchedVideos(vids);
      const books = JSON.parse(localStorage.getItem('platform_opened_books') || '[]');
      setOpenedBooks(books);
    } catch {}
  }, []);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const initials = user?.username
    ? user.username.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-6 md:px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
              <UserCircle size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">ملفك الشخصي</h1>
              <p className="text-xs text-neutral-500">بياناتك وسجل نشاطك</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
            <div className="h-28 bg-neutral-900 relative">
              <div className="absolute -bottom-8 start-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border-4 border-white flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {initials}
                </div>
              </div>
              {isAdmin && (
                <span className="absolute top-4 end-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 rounded-full px-3 py-1">
                  <ShieldCheck size={13} /> مدير المنصة
                </span>
              )}
            </div>

            <div className="pt-12 pb-6 px-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900">{user.username}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {user.userType === 'teacher' ? 'أستاذ' : 'طالب'}
                </span>
              </div>
              {user.schoolYear && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-full px-3 py-1">
                  <GraduationCap size={13} /> {user.schoolYear}
                </span>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                  <Mail size={16} className="text-neutral-400 shrink-0" />
                  <span className="truncate" dir="ltr">{user.email}</span>
                </div>
                {joinDate && (
                  <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                    <Calendar size={16} className="text-neutral-400 shrink-0" />
                    <span>انضم في {joinDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={PlaySquare}
              label="فيديو مشاهَد"
              value={watchedVideos.length}
            />
            <StatCard
              icon={BookOpen}
              label="كتاب مفتوح"
              value={openedBooks.length}
            />
            <StatCard
              icon={BookMarked}
              label="السنة الدراسية"
              value={user.userType === 'teacher' ? 'أستاذ' : (user.schoolYear ? user.schoolYear.split(' ')[0] : '—')}
            />
          </div>

          {/* Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Watched Videos */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <PlaySquare size={16} className="text-neutral-900" /> الفيديوهات المشاهَدة
                </h3>
                <span className="text-[11px] font-bold text-neutral-700 bg-neutral-100 rounded-full px-2.5 py-0.5">
                  {watchedVideos.length}
                </span>
              </div>
              {watchedVideos.length === 0 ? (
                <div className="py-8 text-center">
                  <PlaySquare size={24} className="text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">لم تشاهد أي فيديو بعد</p>
                  <a href="/videos" className="inline-block mt-2 text-xs font-bold text-neutral-900 hover:underline">ابدأ الآن ←</a>
                </div>
              ) : (
                <div>
                  {watchedVideos.slice(0, 6).map((v, i) => (
                    <ActivityItem
                      key={i}
                      icon={PlaySquare}
                      title={v.title}
                      subtitle={v.date ? new Date(v.date).toLocaleDateString('ar-EG') : ''}
                    />
                  ))}
                  {watchedVideos.length > 6 && (
                    <p className="text-[10px] text-neutral-400 text-center pt-2">+{watchedVideos.length - 6} آخرون</p>
                  )}
                </div>
              )}
            </div>

            {/* Opened Books */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-neutral-900" /> الكتب المفتوحة
                </h3>
                <span className="text-[11px] font-bold text-neutral-700 bg-neutral-100 rounded-full px-2.5 py-0.5">
                  {openedBooks.length}
                </span>
              </div>
              {openedBooks.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen size={24} className="text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">لم تفتح أي كتاب بعد</p>
                  <a href="/books" className="inline-block mt-2 text-xs font-bold text-neutral-900 hover:underline">ابدأ الآن ←</a>
                </div>
              ) : (
                <div>
                  {openedBooks.slice(0, 6).map((b, i) => (
                    <ActivityItem
                      key={i}
                      icon={BookOpen}
                      title={b.title}
                      subtitle={b.date ? new Date(b.date).toLocaleDateString('ar-EG') : ''}
                    />
                  ))}
                  {openedBooks.length > 6 && (
                    <p className="text-[10px] text-neutral-400 text-center pt-2">+{openedBooks.length - 6} آخرون</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
