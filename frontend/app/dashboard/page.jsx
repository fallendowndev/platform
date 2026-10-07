'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, PlaySquare, UserCircle,
  GraduationCap, ShieldCheck, ArrowLeft, Users, Plus,
  Search, X, Upload, Download, Eye, FileText, Trash2,
  CheckCircle2, Clock, Calendar, Mail, BookMarked,
  Play, ExternalLink, BookPlus, Video, UserCheck, Check, ChevronDown
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GradeFilterDropdown from '../components/GradeFilterDropdown';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SCHOOL_YEARS = [
  { value: 'all', label: 'جميع السنوات' },
  { value: 'اولى ثانوي', label: 'أولى ثانوي' },
  { value: 'تانية ثانوي', label: 'تانية ثانوي' },
  { value: 'تانية بكالوريا', label: 'تانية بكالوريا' },
];

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'books' | 'videos' | 'admin-users' | 'admin-books' | 'admin-videos' | 'profile'

  // Books State
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksSearch, setBooksSearch] = useState('');
  const [booksYear, setBooksYear] = useState('all');
  const [openBook, setOpenBook] = useState(null);
  const [bookModal, setBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({ title: '', author: '', subject: '', year: '' });
  const [bookFile, setBookFile] = useState(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');

  // Videos State
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosSearch, setVideosSearch] = useState('');
  const [videosYear, setVideosYear] = useState('all');
  const [openVideo, setOpenVideo] = useState(null);
  const [videoModal, setVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: '', url: '', instructor: '', subject: '', schoolYear: 'جميع السنوات', duration: '', description: ''
  });
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoError, setVideoError] = useState('');

  // Admin Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Activity tracking
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [openedBooks, setOpenedBooks] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load activities from localStorage
  useEffect(() => {
    try {
      const vids = JSON.parse(localStorage.getItem('platform_watched_videos') || '[]');
      setWatchedVideos(vids);
      const bks = JSON.parse(localStorage.getItem('platform_opened_books') || '[]');
      setOpenedBooks(bks);
    } catch {}
  }, []);

  // Fetch Books
  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const params = new URLSearchParams();
      if (booksSearch) params.set('search', booksSearch);
      if (booksYear !== 'all') params.set('subject', booksYear);
      params.set('limit', '50');

      const res = await fetch(`${API}/api/books?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch {
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, [booksSearch, booksYear]);

  // Fetch Videos
  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    try {
      const res = await fetch(`${API}/api/videos?limit=50`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch {
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }, []);

  // Fetch Users for Admin
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/users`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch {
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
      fetchVideos();
      if (isAdmin) fetchUsers();
    }
  }, [isAuthenticated, isAdmin, fetchBooks, fetchVideos, fetchUsers]);

  // Admin Actions
  const handleToggleApproveUser = async (userId) => {
    try {
      const res = await fetch(`${API}/api/auth/users/${userId}/toggle-approve`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) fetchUsers();
    } catch {}
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const res = await fetch(`${API}/api/auth/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchUsers();
    } catch {}
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      const res = await fetch(`${API}/api/books/${bookId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchBooks();
    } catch {}
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    try {
      const res = await fetch(`${API}/api/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchVideos();
    } catch {}
  };

  const handleUploadBook = async (e) => {
    e.preventDefault();
    setBookError('');
    if (!bookForm.title.trim()) {
      setBookError('يرجى إدخال عنوان الكتاب');
      return;
    }
    if (!bookFile) {
      setBookError('يرجى اختيار ملف PDF');
      return;
    }

    setBookSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', bookForm.title);
      if (bookForm.author) fd.append('author', bookForm.author);
      if (bookForm.subject) fd.append('subject', bookForm.subject);
      if (bookForm.year) fd.append('year', bookForm.year);
      fd.append('pdf', bookFile);

      const res = await fetch(`${API}/api/books`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setBookError(data.message || 'فشل رفع الكتاب');
        return;
      }
      setBookModal(false);
      setBookForm({ title: '', author: '', subject: '', year: '' });
      setBookFile(null);
      fetchBooks();
    } catch {
      setBookError('حدث خطأ أثناء رفع الكتاب');
    } finally {
      setBookSubmitting(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setVideoError('');
    if (!videoForm.title.trim() || !videoForm.url.trim()) {
      setVideoError('يرجى إدخال عنوان ورابط الفيديو');
      return;
    }

    setVideoSubmitting(true);
    try {
      const res = await fetch(`${API}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(videoForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setVideoError(data.message || 'فشل إضافة الفيديو');
        return;
      }
      setVideoModal(false);
      setVideoForm({ title: '', url: '', instructor: '', subject: '', schoolYear: 'جميع السنوات', duration: '', description: '' });
      fetchVideos();
    } catch {
      setVideoError('حدث خطأ أثناء إضافة الفيديو');
    } finally {
      setVideoSubmitting(false);
    }
  };

  // Filtered videos
  const filteredVideos = videos.filter((v) => {
    const matchGrade = videosYear === 'all' || v.schoolYear === videosYear || v.schoolYear === 'جميع السنوات';
    const q = videosSearch.toLowerCase();
    const matchSearch = !q || v.title?.toLowerCase().includes(q) || v.instructor?.toLowerCase().includes(q) || v.subject?.toLowerCase().includes(q);
    return matchGrade && matchSearch;
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">جارٍ التحميل…</p>
        </div>
      </div>
    );
  }

  const roleTitle = isAdmin
    ? 'مدير المنصة'
    : user.userType === 'teacher'
    ? 'أستاذ'
    : user.schoolYear || 'طالب';

  const pendingUsersCount = usersList.filter(u => !u.isApproved && u.role !== 'admin').length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar with Slate-900 Primary Color & Accordion for Admin */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingUsersCount={pendingUsersCount}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                {activeTab === 'overview' && <LayoutDashboard size={20} />}
                {activeTab === 'books' && <BookOpen size={20} />}
                {activeTab === 'videos' && <PlaySquare size={20} />}
                {activeTab === 'admin-users' && <Users size={20} />}
                {activeTab === 'admin-books' && <BookPlus size={20} />}
                {activeTab === 'admin-videos' && <Video size={20} />}
                {activeTab === 'profile' && <UserCircle size={20} />}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {activeTab === 'overview' && 'لوحة التحكم الأكاديمية'}
                  {activeTab === 'books' && 'الكتب والمنهج الدراسي'}
                  {activeTab === 'videos' && 'الفيديوهات التعليمية'}
                  {activeTab === 'admin-users' && 'مراجعة وتفعيل الحسابات'}
                  {activeTab === 'admin-books' && 'إدارة الكتب والمناهج'}
                  {activeTab === 'admin-videos' && 'إدارة الفيديوهات والمحاضرات'}
                  {activeTab === 'profile' && 'ملفك الشخصي'}
                </h1>
                <p className="text-xs text-slate-500">
                  {activeTab === 'overview' && 'نظرة عامة على المحتوى الدراسي'}
                  {activeTab === 'books' && `${books.length} كتاب ومقرر متاح`}
                  {activeTab === 'videos' && `${videos.length} محاضرة متاحة`}
                  {activeTab === 'admin-users' && `${pendingUsersCount} حساب بانتظار الموافقة والتفعيل`}
                  {activeTab === 'admin-books' && `${books.length} كتاب مضاف في المنصة`}
                  {activeTab === 'admin-videos' && `${videos.length} فيديو مسجل في المنصة`}
                  {activeTab === 'profile' && 'بيانات حسابك ونشاطك'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5">
                {isAdmin && <ShieldCheck size={14} className="text-blue-600" />}
                {roleTitle}
              </span>
              {isAdmin && !activeTab.startsWith('admin') && pendingUsersCount > 0 && (
                <button
                  onClick={() => setActiveTab('admin-users')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-full transition-colors cursor-pointer shadow-sm animate-pulse"
                >
                  <Clock size={14} />
                  {pendingUsersCount} بانتظار الموافقة
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Single-Page State Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {/* ── 1. OVERVIEW STATE ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-7 md:p-9 shadow-lg border border-slate-800">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-block text-xs font-medium text-blue-400 mb-2">
                      {user.userType === 'teacher' ? 'لوحة الأستاذ' : 'لوحة الطالب'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                      أهلاً بك، {user.username}
                    </h2>
                    <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                      {user.userType === 'teacher'
                        ? 'يمكنك متابعة المناهج الدراسية، الكتب الأكاديمية والفيديوهات بكل سهولة.'
                        : `السنة الدراسية: ${user.schoolYear || 'عام'} · تابع شروحاتك وكتبك المعتمدة.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('books')}
                      className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen size={16} />
                      تصفح الكتب
                    </button>
                    <button
                      onClick={() => setActiveTab('videos')}
                      className="px-5 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-sm hover:bg-slate-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <PlaySquare size={16} />
                      الفيديوهات
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div
                  onClick={() => setActiveTab('books')}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">الكتب الأكاديمية</p>
                    <p className="text-2xl font-bold text-slate-900">{books.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">تصفح وقراءة الكتب المعتمدة</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('videos')}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">الفيديوهات التعليمية</p>
                    <p className="text-2xl font-bold text-slate-900">{videos.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">محاضرات ودروس موثقة</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <PlaySquare size={24} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('profile')}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">حالة الحساب</p>
                    <p className="text-2xl font-bold text-slate-900">مفعّل</p>
                    <p className="text-[11px] text-slate-400 mt-1">{roleTitle}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>

              {/* Quick Jump Sections */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-900">الأقسام السريعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div
                    onClick={() => setActiveTab('books')}
                    className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer shadow-sm"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        <BookOpen size={22} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">الكتب والمنهج الدراسي</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        استعرض وقراءة الكتب المقررة بصيغة PDF مباشرة.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:-translate-x-1 transition-transform">
                      تصفح الكتب <ArrowLeft size={14} />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('videos')}
                    className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer shadow-sm"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        <PlaySquare size={22} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">الفيديوهات التعليمية</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        مشاهدة شروحات الدروس والمحاضرات المصورة.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:-translate-x-1 transition-transform">
                      مشاهدة الفيديوهات <ArrowLeft size={14} />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab(isAdmin ? 'admin-users' : 'profile')}
                    className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer shadow-sm"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        {isAdmin ? <ShieldCheck size={22} /> : <UserCircle size={22} />}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">
                        {isAdmin ? 'إدارة المنصة والموافقة' : 'الملف الشخصي'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {isAdmin ? 'الموافقة على طلبات الحسابات وإدارة المقررات.' : 'بيانات حسابك ونشاطك المسجل.'}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:-translate-x-1 transition-transform">
                      {isAdmin ? 'فتح إدارة الحسابات' : 'عرض الملف'} <ArrowLeft size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2. BOOKS STATE ────────────────────────────────────── */}
          {activeTab === 'books' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
                {/* Search input - takes full width on right */}
                <div className="relative flex-1 min-w-0 group">
                  <Search size={18} className="absolute inset-y-0 end-4 my-auto text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
                  <input
                    value={booksSearch}
                    onChange={(e) => setBooksSearch(e.target.value)}
                    placeholder="ابحث في الكتب والمناهج بالعنوان أو الكاتب…"
                    className="w-full pe-11 ps-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none search-input-animated"
                  />
                  {booksSearch && (
                    <button
                      onClick={() => setBooksSearch('')}
                      className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Hand-made Choices Dropdown */}
                <GradeFilterDropdown
                  value={booksYear}
                  onChange={setBooksYear}
                  className="w-48 sm:w-56 shrink-0"
                />

                {/* Add Button */}
                {isAdmin && (
                  <button
                    onClick={() => setBookModal(true)}
                    className="shrink-0 flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    <Plus size={16} /> رفع كتاب
                  </button>
                )}
              </div>

              {booksLoading ? (
                <div className="py-20 text-center text-xs text-slate-500">جارٍ جلب الكتب…</div>
              ) : books.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center">
                  <BookOpen size={36} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">لا توجد كتب مضافة حالياً</h3>
                  <p className="text-xs text-slate-500">سيتم إضافة المقررات الدراسية والكتب قريباً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <div key={book._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col">
                      <div className="h-40 bg-slate-900 flex items-center justify-center relative">
                        <BookOpen size={44} className="text-white/10" />
                        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                          <p className="text-white text-xs font-bold leading-snug line-clamp-2">{book.title}</p>
                        </div>
                        {book.subject && (
                          <span className="absolute top-2 end-2 text-[9px] font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
                            {book.subject}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{book.title}</h4>
                          {book.author && <p className="text-xs text-slate-500 mb-1">{book.author}</p>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{fmtSize(book.size)}</span>
                          <div className="flex items-center gap-1.5">
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteBook(book._id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setOpenBook(book)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            >
                              <Eye size={13} /> قراءة
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 3. VIDEOS STATE ───────────────────────────────────── */}
          {activeTab === 'videos' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
                {/* Search input - takes full width on right */}
                <div className="relative flex-1 min-w-0 group">
                  <Search size={18} className="absolute inset-y-0 end-4 my-auto text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
                  <input
                    value={videosSearch}
                    onChange={(e) => setVideosSearch(e.target.value)}
                    placeholder="ابحث في الفيديوهات والشروحات…"
                    className="w-full pe-11 ps-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none search-input-animated"
                  />
                  {videosSearch && (
                    <button
                      onClick={() => setVideosSearch('')}
                      className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Hand-made Choices Dropdown */}
                <GradeFilterDropdown
                  value={videosYear}
                  onChange={setVideosYear}
                  className="w-48 sm:w-56 shrink-0"
                />

                {/* Add Button */}
                {isAdmin && (
                  <button
                    onClick={() => setVideoModal(true)}
                    className="shrink-0 flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    <Plus size={16} /> إضافة فيديو
                  </button>
                )}
              </div>

              {videosLoading ? (
                <div className="py-20 text-center text-xs text-slate-500">جارٍ جلب الفيديوهات…</div>
              ) : filteredVideos.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center">
                  <PlaySquare size={36} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">لا توجد فيديوهات مضافة حالياً</h3>
                  <p className="text-xs text-slate-500">سيتم نشر المحاضرات والفيديوهات قريباً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => (
                    <div
                      key={video._id}
                      onClick={() => setOpenVideo(video)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col cursor-pointer group"
                    >
                      <div className="relative h-40 bg-slate-900 flex items-center justify-center">
                        <PlaySquare size={44} className="text-white/10" />
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                          <Play size={18} className="text-white ms-0.5" fill="white" />
                        </div>
                        {video.schoolYear && (
                          <span className="absolute top-2 end-2 text-[9px] font-bold bg-black/60 text-white rounded-full px-2.5 py-0.5">
                            {video.schoolYear}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {video.subject && <p className="text-[11px] font-semibold text-slate-500 mb-0.5">{video.subject}</p>}
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{video.title}</h4>
                          {video.instructor && <p className="text-xs text-slate-500">{video.instructor}</p>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-blue-600 font-bold">مشاهدة</span>
                          {isAdmin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video._id); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 4. ADMIN: USERS APPROVAL ─────────────────────────── */}
          {activeTab === 'admin-users' && isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">مراجعة وتفعيل الحسابات</h3>
                  <p className="text-xs text-slate-500 mt-0.5">الموافقة على طلبات التسجيل الجديدة للطلاب والأساتذة</p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  تحديث القائمة
                </button>
              </div>

              {usersLoading ? (
                <div className="p-12 text-center text-xs text-slate-500">جارٍ التحميل…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-4">الاسم</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">نوع الحساب</th>
                        <th className="p-4">السنة الدراسية</th>
                        <th className="p-4">حالة الحساب</th>
                        <th className="p-4 text-center">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => {
                        const isPending = !u.isApproved && u.role !== 'admin';
                        return (
                          <tr key={u._id} className={isPending ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                            <td className="p-4 font-bold text-slate-900">{u.username}</td>
                            <td className="p-4 text-slate-600 font-mono" dir="ltr">{u.email}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                                {u.userType === 'teacher' ? 'أستاذ' : 'طالب'}
                              </span>
                            </td>
                            <td className="p-4">{u.schoolYear || '—'}</td>
                            <td className="p-4">
                              {u.role === 'admin' ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white">مدير</span>
                              ) : u.isApproved ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">مفعّل</span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">قيد المراجعة</span>
                              )}
                            </td>
                            <td className="p-4 text-center flex items-center justify-center gap-2">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleToggleApproveUser(u._id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                    u.isApproved
                                      ? 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {u.isApproved ? 'تعطيل' : 'تفعيل الحساب'}
                                </button>
                              )}
                              {u._id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 5. ADMIN: BOOKS MANAGEMENT ───────────────────────── */}
          {activeTab === 'admin-books' && isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">إدارة الكتب والمناهج</h3>
                  <p className="text-xs text-slate-500 mt-0.5">رفع وتعديل وحذف ملفات المقررات الأكاديمية</p>
                </div>
                <button
                  onClick={() => setBookModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={15} /> رفع كتاب جديد
                </button>
              </div>

              {books.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">لا توجد كتب مرفوعة حالياً</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((b) => (
                    <div key={b._id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-slate-300">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{b.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{b.subject || '—'} · {fmtSize(b.size)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBook(b._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 6. ADMIN: VIDEOS MANAGEMENT ──────────────────────── */}
          {activeTab === 'admin-videos' && isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">إدارة الفيديوهات</h3>
                  <p className="text-xs text-slate-500 mt-0.5">إضافة روابط المحاضرات التعليمية وتعيين المواد</p>
                </div>
                <button
                  onClick={() => setVideoModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={15} /> إضافة فيديو جديد
                </button>
              </div>

              {videos.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">لا توجد فيديوهات مضافة حالياً</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((v) => (
                    <div key={v._id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-slate-300">
                      <div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{v.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{v.instructor || v.subject || '—'} · {v.schoolYear}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteVideo(v._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 7. PROFILE STATE ──────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
                  <div className="absolute -bottom-8 start-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center text-xl font-bold text-white shadow-md">
                      {user.username ? user.username[0].toUpperCase() : '?'}
                    </div>
                  </div>
                  {isAdmin && (
                    <span className="absolute top-4 end-4 inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 rounded-full px-3 py-1">
                      <ShieldCheck size={13} /> مدير المنصة
                    </span>
                  )}
                </div>

                <div className="pt-12 pb-6 px-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {user.userType === 'teacher' ? 'أستاذ' : 'طالب'}
                    </span>
                  </div>
                  {user.schoolYear && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <GraduationCap size={13} /> {user.schoolYear}
                    </span>
                  )}

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <span dir="ltr">{user.email}</span>
                    </div>
                    {user.createdAt && (
                      <div className="flex items-center gap-2.5">
                        <Calendar size={16} className="text-slate-400 shrink-0" />
                        <span>انضم في {new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <PlaySquare size={16} className="text-blue-600" /> الفيديوهات المشاهَدة ({watchedVideos.length})
                  </h3>
                  {watchedVideos.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">لم تسجل مشاهدات بعد</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {watchedVideos.slice(0, 5).map((v, i) => (
                        <div key={i} className="py-2 text-xs">
                          <p className="font-semibold text-slate-800 truncate">{v.title}</p>
                          <p className="text-[10px] text-slate-400">{v.date ? new Date(v.date).toLocaleDateString('ar-EG') : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" /> الكتب المفتوحة ({openedBooks.length})
                  </h3>
                  {openedBooks.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">لم تفتح كتباً بعد</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {openedBooks.slice(0, 5).map((b, i) => (
                        <div key={i} className="py-2 text-xs">
                          <p className="font-semibold text-slate-800 truncate">{b.title}</p>
                          <p className="text-[10px] text-slate-400">{b.date ? new Date(b.date).toLocaleDateString('ar-EG') : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── PDF Reader Modal ────────────────────────────────────── */}
      {openBook && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" onClick={() => setOpenBook(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{openBook.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={`${API}/api/books/${openBook._id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Download size={15} />
                </a>
                <button onClick={() => setOpenBook(null)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 overflow-hidden">
              <iframe src={`${API}/api/books/${openBook._id}/pdf`} title={openBook.title} className="w-full h-full min-h-[60vh] border-0" />
            </div>
          </div>
        </div>
      )}

      {/* ── Video Player Modal ──────────────────────────────────── */}
      {openVideo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenVideo(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{openVideo.title}</h3>
              <button onClick={() => setOpenVideo(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                {openVideo.url.includes('youtube.com') || openVideo.url.includes('youtu.be') ? (
                  <iframe
                    src={openVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title={openVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-white">
                    <PlaySquare size={40} className="text-slate-500 mb-3" />
                    <a
                      href={openVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-blue-500"
                    >
                      <ExternalLink size={14} /> فتح الرابط الخارجي
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{openVideo.instructor || 'مدرس المادة'}</span>
                <span>{openVideo.schoolYear}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Book Upload Modal ─────────────────────────────── */}
      {bookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBookModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">رفع كتاب جديد (PDF)</h3>
              <button onClick={() => setBookModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadBook} className="flex flex-col gap-4">
              {bookError && <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">{bookError}</p>}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">عنوان الكتاب *</label>
                <input
                  value={bookForm.title}
                  onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="مثال: الرياضيات"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">الصف الدراسي</label>
                  <select
                    value={bookForm.subject}
                    onChange={e => setBookForm({ ...bookForm, subject: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">اختر الصف...</option>
                    <option value="اولى ثانوي">أولى ثانوي</option>
                    <option value="تانية ثانوي">تانية ثانوي</option>
                    <option value="تانية بكالوريا">تانية بكالوريا</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">المؤلف</label>
                  <input
                    value={bookForm.author}
                    onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="اسم المؤلف"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">ملف PDF *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setBookFile(e.target.files[0] || null)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setBookModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" disabled={bookSubmitting} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer">
                  {bookSubmitting ? 'جارٍ الرفع...' : 'رفع الكتاب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin Video Add Modal ───────────────────────────────── */}
      {videoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVideoModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">إضافة فيديو جديد</h3>
              <button onClick={() => setVideoModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
              {videoError && <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">{videoError}</p>}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">عنوان الفيديو *</label>
                <input
                  value={videoForm.title}
                  onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="عنوان الدرس"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">رابط الفيديو (YouTube) *</label>
                <input
                  value={videoForm.url}
                  onChange={e => setVideoForm({ ...videoForm, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  dir="ltr"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900 text-left"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">المادة</label>
                  <input
                    value={videoForm.subject}
                    onChange={e => setVideoForm({ ...videoForm, subject: e.target.value })}
                    placeholder="المادة"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">السنة الدراسية</label>
                  <select
                    value={videoForm.schoolYear}
                    onChange={e => setVideoForm({ ...videoForm, schoolYear: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="جميع السنوات">جميع السنوات</option>
                    <option value="اولى ثانوي">أولى ثانوي</option>
                    <option value="تانية ثانوي">تانية ثانوي</option>
                    <option value="تانية بكالوريا">تانية بكالوريا</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setVideoModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" disabled={videoSubmitting} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer">
                  {videoSubmitting ? 'جارٍ الإضافة...' : 'إضافة الفيديو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
