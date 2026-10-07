'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaySquare, Search, X, Plus, Trash2, ExternalLink, GraduationCap, Play, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GradeFilterDropdown from '../components/GradeFilterDropdown';
import { useAuth } from '../context/AuthContext';

const SCHOOL_YEARS = [
  { value: 'all', label: 'جميع السنوات' },
  { value: 'اولى ثانوي', label: 'أولى ثانوي' },
  { value: 'تانية ثانوي', label: 'تانية ثانوي' },
  { value: 'تانية بكالوريا', label: 'تانية بكالوريا' },
];

export default function VideosPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeGrade, setActiveGrade] = useState('all');
  const [openModal, setOpenModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Add Video Form state for Admin
  const [form, setForm] = useState({
    title: '',
    url: '',
    instructor: '',
    subject: '',
    schoolYear: 'جميع السنوات',
    duration: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/videos`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos();
    }
  }, [isAuthenticated]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) {
      setFormError('يرجى إدخال عنوان الفيديو');
      return;
    }
    if (!form.url.trim()) {
      setFormError('يرجى إدخال رابط الفيديو');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'فشل إضافة الفيديو');
        return;
      }
      setOpenModal(false);
      setForm({
        title: '',
        url: '',
        instructor: '',
        subject: '',
        schoolYear: 'جميع السنوات',
        duration: '',
        description: '',
      });
      fetchVideos();
    } catch {
      setFormError('حدث خطأ أثناء إضافة الفيديو');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id, e) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    try {
      const res = await fetch(`${API}/api/videos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch {}
  };

  const filtered = videos.filter((v) => {
    const matchGrade =
      activeGrade === 'all' ||
      v.schoolYear === activeGrade ||
      v.schoolYear === 'جميع السنوات';
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.title?.toLowerCase().includes(q) ||
      v.instructor?.toLowerCase().includes(q) ||
      v.subject?.toLowerCase().includes(q);
    return matchGrade && matchSearch;
  });

  if (authLoading) {
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
        <header className="bg-white border-b border-neutral-200 px-6 md:px-8 py-5 sticky top-0 z-20 shadow-xs">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <PlaySquare size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">الفيديوهات التعليمية</h1>
                  <p className="text-xs text-slate-500">
                    {videos.length === 0
                      ? 'لا توجد فيديوهات مضافة بعد'
                      : `${videos.length} محاضرة متاحة`}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Bar: Full width search at right, choices dropdown behind adding button */}
            <div className="flex items-center gap-3 w-full">
              {/* Search input - takes full width */}
              <div className="relative flex-1 min-w-0 group">
                <Search size={18} className="absolute inset-y-0 end-4 my-auto text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالعنوان أو الأستاذ أو المادة…"
                  className="w-full pe-11 ps-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none search-input-animated"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Hand-made Choices Dropdown */}
              <GradeFilterDropdown
                value={activeGrade}
                onChange={setActiveGrade}
                className="w-48 sm:w-56 shrink-0"
              />

              {/* Add Button */}
              {isAdmin && (
                <button
                  onClick={() => setOpenModal(true)}
                  className="shrink-0 flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <Plus size={16} />
                  إضافة فيديو
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mb-3" />
              <p className="text-sm text-neutral-500">جارٍ جلب الفيديوهات…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 flex flex-col items-center justify-center text-center my-8">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <PlaySquare size={32} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">
                {search ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد فيديوهات تعليمية مضافة حالياً'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-md">
                {isAdmin
                  ? 'يمكنك كمدير للمنصة إضافة فيديوهات تعليمية جديدة عبر زر "إضافة فيديو" بالأعلى.'
                  : 'سيقوم الأساتذة وإدارة المنصة بنشر المحاضرات والفيديوهات قريباً.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setOpenModal(true)}
                  className="mt-5 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  إضافة فيديو جديد
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((video) => (
                <div
                  key={video._id}
                  onClick={() => setSelectedVideo(video)}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:border-neutral-400 hover:shadow-md transition-all flex flex-col cursor-pointer group"
                >
                  {/* Thumbnail / Header */}
                  <div className="relative h-40 bg-neutral-900 flex items-center justify-center overflow-hidden">
                    <PlaySquare size={44} className="text-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play size={20} className="text-white ms-0.5" fill="white" />
                      </div>
                    </div>
                    {video.schoolYear && (
                      <span className="absolute top-3 end-3 text-[10px] font-bold bg-black/60 text-white rounded-full px-2.5 py-0.5">
                        {video.schoolYear}
                      </span>
                    )}
                    {video.duration && (
                      <span className="absolute bottom-3 start-3 text-[10px] font-mono font-bold bg-black/60 text-white rounded px-2 py-0.5">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {video.subject && (
                        <p className="text-[11px] font-semibold text-neutral-500 mb-1">
                          {video.subject}
                        </p>
                      )}
                      <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-neutral-700 transition-colors">
                        {video.title}
                      </h3>
                      {video.instructor && (
                        <p className="text-xs text-neutral-500">
                          {video.instructor}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">مشاهدة الشرح</span>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteVideo(video._id, e)}
                          title="حذف الفيديو"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 truncate max-w-md">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                {selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') ? (
                  <iframe
                    src={selectedVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title={selectedVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <PlaySquare size={40} className="text-neutral-500 mb-3" />
                    <p className="text-sm font-bold text-white mb-2">{selectedVideo.title}</p>
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-neutral-200 transition-colors"
                    >
                      <ExternalLink size={14} /> فتح الرابط الخارجي
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{selectedVideo.instructor || 'مدرس المادة'}</span>
                <span>{selectedVideo.schoolYear}</span>
              </div>
              {selectedVideo.description && (
                <p className="text-xs text-neutral-600 mt-3 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Video Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenModal(false)}>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <h3 className="text-base font-bold text-neutral-900">إضافة فيديو جديد</h3>
              <button onClick={() => setOpenModal(false)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
              {formError && (
                <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                  {formError}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">عنوان الفيديو *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: شرح درس الدوال الحقيقية"
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">رابط الفيديو (YouTube / مباشر) *</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  dir="ltr"
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900 text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">المادة</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="مثال: الرياضيات"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">اسم الأستاذ</label>
                  <input
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    placeholder="مثال: أ. أحمد علي"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">السنة الدراسية</label>
                  <select
                    value={form.schoolYear}
                    onChange={(e) => setForm({ ...form, schoolYear: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="جميع السنوات">جميع السنوات</option>
                    <option value="اولى ثانوي">أولى ثانوي</option>
                    <option value="تانية ثانوي">تانية ثانوي</option>
                    <option value="تانية بكالوريا">تانية بكالوريا</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">المدة (اختياري)</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="مثال: 35:00"
                    dir="ltr"
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900 text-left"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">الوصف (اختياري)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="وصف محتوى الفيديو والمحاور المشروحة..."
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-neutral-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'جارٍ الإضافة...' : 'إضافة الفيديو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
