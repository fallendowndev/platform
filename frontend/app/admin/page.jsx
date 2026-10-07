'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Users, BookOpen, PlaySquare, Trash2,
  Plus, Search, X, Upload, FileText, CheckCircle2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [tab, setTab] = useState('users'); // 'users' | 'books' | 'videos'

  // Data states
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [search, setSearch] = useState('');

  // Modals & form states
  const [bookModal, setBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({ title: '', author: '', subject: '', year: '' });
  const [bookFile, setBookFile] = useState(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');

  const [videoModal, setVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: '', url: '', instructor: '', subject: '', schoolYear: 'جميع السنوات', duration: '', description: ''
  });
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoError, setVideoError] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const res = await fetch(`${API}/api/auth/users`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
    setLoadingData(false);
  };

  const fetchBooks = async () => {
    setLoadingData(true);
    try {
      const res = await fetch(`${API}/api/books?limit=50`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch {}
    setLoadingData(false);
  };

  const fetchVideos = async () => {
    setLoadingData(true);
    try {
      const res = await fetch(`${API}/api/videos?limit=50`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch {}
    setLoadingData(false);
  };

  useEffect(() => {
    if (isAdmin) {
      if (tab === 'users') fetchUsers();
      if (tab === 'books') fetchBooks();
      if (tab === 'videos') fetchVideos();
    }
  }, [isAdmin, tab]);

  const handleDeleteUser = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const res = await fetch(`${API}/api/auth/users/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchUsers();
    } catch {}
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      const res = await fetch(`${API}/api/books/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchBooks();
    } catch {}
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    try {
      const res = await fetch(`${API}/api/videos/${id}`, { method: 'DELETE', credentials: 'include' });
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

  if (authLoading || !isAdmin) {
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
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">لوحة إدارة المنصة</h1>
                <p className="text-xs text-neutral-500">إدارة المستخدمين، الكتب، والمحاضرات</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tab === 'books' && (
                <button
                  onClick={() => setBookModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload size={14} /> إضافة كتاب
                </button>
              )}
              {tab === 'videos' && (
                <button
                  onClick={() => setVideoModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} /> إضافة فيديو
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 max-w-6xl mx-auto w-full border-b border-neutral-200">
            <button
              onClick={() => { setTab('users'); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                tab === 'users'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Users size={16} /> المستخدمون ({users.length})
            </button>
            <button
              onClick={() => { setTab('books'); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                tab === 'books'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <BookOpen size={16} /> الكتب والمنهج ({books.length})
            </button>
            <button
              onClick={() => { setTab('videos'); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                tab === 'videos'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <PlaySquare size={16} /> الفيديوهات ({videos.length})
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-neutral-900">جميع الحسابات المسجلة</h2>
                <span className="text-xs text-neutral-500">{users.length} مستخدم</span>
              </div>
              {loadingData ? (
                <div className="p-12 text-center text-xs text-neutral-500">جارٍ التحميل…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
                      <tr>
                        <th className="p-3.5">الاسم</th>
                        <th className="p-3.5">البريد الإلكتروني</th>
                        <th className="p-3.5">نوع الحساب</th>
                        <th className="p-3.5">السنة الدراسية / الدور</th>
                        <th className="p-3.5">تاريخ التسجيل</th>
                        <th className="p-3.5 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-neutral-900">{u.username}</td>
                          <td className="p-3.5 text-neutral-600 font-mono" dir="ltr">{u.email}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              u.userType === 'teacher' ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {u.userType === 'teacher' ? 'أستاذ' : 'طالب'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {u.role === 'admin' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-900 text-white">مدير المنصة</span>
                            ) : (
                              u.schoolYear || '—'
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '—'}
                          </td>
                          <td className="p-3.5 text-center">
                            {u._id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                title="حذف المستخدم"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BOOKS TAB */}
          {tab === 'books' && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-neutral-900">الكتب والمقررات المرفوعة</h2>
                <button
                  onClick={() => setBookModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} /> إضافة كتاب
                </button>
              </div>
              {loadingData ? (
                <div className="p-12 text-center text-xs text-neutral-500">جارٍ التحميل…</div>
              ) : books.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">لا توجد كتب مرفوعة حالياً.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
                      <tr>
                        <th className="p-3.5">عنوان الكتاب</th>
                        <th className="p-3.5">الكاتب / المدرس</th>
                        <th className="p-3.5">المادة</th>
                        <th className="p-3.5">الحجم</th>
                        <th className="p-3.5 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {books.map((b) => (
                        <tr key={b._id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-neutral-900">{b.title}</td>
                          <td className="p-3.5 text-neutral-600">{b.author || '—'}</td>
                          <td className="p-3.5 text-neutral-600">{b.subject || '—'}</td>
                          <td className="p-3.5 text-neutral-500 font-mono">
                            {b.size ? `${(b.size / (1024 * 1024)).toFixed(1)} MB` : '—'}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteBook(b._id)}
                              title="حذف الكتاب"
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIDEOS TAB */}
          {tab === 'videos' && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-neutral-900">الفيديوهات والمحاضرات المضافة</h2>
                <button
                  onClick={() => setVideoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} /> إضافة فيديو
                </button>
              </div>
              {loadingData ? (
                <div className="p-12 text-center text-xs text-neutral-500">جارٍ التحميل…</div>
              ) : videos.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">لا توجد فيديوهات مضافة حالياً.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
                      <tr>
                        <th className="p-3.5">عنوان الفيديو</th>
                        <th className="p-3.5">الأستاذ</th>
                        <th className="p-3.5">المادة</th>
                        <th className="p-3.5">السنة الدراسية</th>
                        <th className="p-3.5 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {videos.map((v) => (
                        <tr key={v._id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-neutral-900">{v.title}</td>
                          <td className="p-3.5 text-neutral-600">{v.instructor || '—'}</td>
                          <td className="p-3.5 text-neutral-600">{v.subject || '—'}</td>
                          <td className="p-3.5 text-neutral-500">{v.schoolYear || 'جميع السنوات'}</td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteVideo(v._id)}
                              title="حذف الفيديو"
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Upload Book Modal */}
      {bookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBookModal(false)}>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <h3 className="text-base font-bold text-neutral-900">رفع كتاب أكاديمي جديد (PDF)</h3>
              <button onClick={() => setBookModal(false)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadBook} className="flex flex-col gap-4">
              {bookError && (
                <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                  {bookError}
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">عنوان الكتاب *</label>
                <input
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="مثال: الرياضيات المتقدمة"
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">المؤلف / المدرس</label>
                  <input
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="مثال: د. أحمد"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">المادة</label>
                  <input
                    value={bookForm.subject}
                    onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
                    placeholder="مثال: الفيزياء"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">ملف الكتاب (PDF) *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setBookFile(e.target.files[0] || null)}
                  className="px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-700 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setBookModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={bookSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {bookSubmitting ? 'جارٍ الرفع...' : 'رفع الكتاب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVideoModal(false)}>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <h3 className="text-base font-bold text-neutral-900">إضافة فيديو جديد</h3>
              <button onClick={() => setVideoModal(false)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
              {videoError && (
                <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                  {videoError}
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">عنوان الفيديو *</label>
                <input
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="عنوان المحاضرة أو الدرس"
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">رابط الفيديو *</label>
                <input
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  dir="ltr"
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 text-left"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">المادة</label>
                  <input
                    value={videoForm.subject}
                    onChange={(e) => setVideoForm({ ...videoForm, subject: e.target.value })}
                    placeholder="مثال: العلوم"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">الأستاذ</label>
                  <input
                    value={videoForm.instructor}
                    onChange={(e) => setVideoForm({ ...videoForm, instructor: e.target.value })}
                    placeholder="اسم الأستاذ"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setVideoModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={videoSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
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
