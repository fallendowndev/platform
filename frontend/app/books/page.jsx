'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Search, X, Upload, Download, Eye, Loader2,
  AlertCircle, Plus, FileText, Trash2, ChevronDown
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

// ── Book Card ────────────────────────────────────────────────────
function BookCard({ book, onOpen, onDelete }) {
  const { isAdmin } = useAuth();
  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:border-neutral-400 hover:shadow-md transition-all flex flex-col">
      {/* Cover / Thumbnail */}
      <div className="h-40 bg-neutral-900 flex items-center justify-center relative overflow-hidden">
        <BookOpen size={48} className="text-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-white text-xs font-bold leading-snug line-clamp-3">{book.title}</p>
            {book.author && <p className="text-neutral-400 text-[10px] mt-1">{book.author}</p>}
          </div>
        </div>
        {book.subject && (
          <span className="absolute top-2 end-2 text-[9px] font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
            {book.subject}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 mb-1 line-clamp-2 leading-snug">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-[11px] text-neutral-500 mb-1">{book.author}</p>
          )}
          {book.description && (
            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{book.description}</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            {book.size && <span className="flex items-center gap-0.5"><FileText size={10} />{fmtSize(book.size)}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                onClick={() => onDelete(book._id)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="حذف"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={() => onOpen(book)}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye size={12} /> قراءة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PDF Modal ────────────────────────────────────────────────────
function PdfModal({ book, onClose }) {
  const pdfUrl = `${API}/api/books/${book._id}/pdf`;

  useEffect(() => {
    try {
      const key = 'platform_opened_books';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      if (!stored.find(b => b.id === book._id)) {
        stored.unshift({ id: book._id, title: book.title, date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(stored.slice(0, 50)));
      }
    } catch {}
  }, [book._id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
              <BookOpen size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 truncate">{book.title}</h3>
              {book.author && <p className="text-[11px] text-neutral-500">{book.author}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
              title="فتح في نافذة جديدة"
            >
              <Download size={15} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-neutral-100 overflow-hidden">
          <iframe
            src={pdfUrl}
            title={book.title}
            className="w-full h-full min-h-[60vh]"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Upload Modal (Admin) ─────────────────────────────────────────
function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', author: '', description: '', subject: '', year: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) { setError('يجب اختيار ملف PDF'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });

      const res = await fetch(`${API}/api/books`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'فشل الرفع');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 transition-colors';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">رفع كتاب جديد</h3>
              <p className="text-[11px] text-neutral-500">إضافة مقرر دراسي للمكتبة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">عنوان الكتاب *</label>
            <input required value={form.title} onChange={set('title')} placeholder="مثال: أسس الفيزياء العامة" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">الصف الدراسي</label>
              <select value={form.subject} onChange={set('subject')} className={inputCls}>
                <option value="">اختر الصف...</option>
                <option value="اولى ثانوي">أولى ثانوي</option>
                <option value="تانية ثانوي">تانية ثانوي</option>
                <option value="تانية بكالوريا">تانية بكالوريا</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">سنة النشر</label>
              <input type="number" min="2000" max="2100" value={form.year} onChange={set('year')} placeholder="2026" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">المؤلف / المؤلفون</label>
            <input value={form.author} onChange={set('author')} placeholder="أ.د. اسم المؤلف" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">وصف الكتاب</label>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder="ملخص مختصر عن محتوى الكتاب..." className={inputCls + ' resize-none'} />
          </div>

          {/* File picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">ملف PDF *</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full py-3 rounded-xl border-2 border-dashed text-xs font-semibold transition-colors cursor-pointer ${
                file
                  ? 'border-neutral-900 bg-neutral-100 text-neutral-900'
                  : 'border-neutral-300 hover:border-neutral-400 text-neutral-500'
              }`}
            >
              {file
                ? <span className="flex items-center justify-center gap-2"><FileText size={14} />{file.name} ({fmtSize(file.size)})</span>
                : <span className="flex items-center justify-center gap-2"><Upload size={14} /> اختر ملف PDF (حد أقصى 50 MB)</span>
              }
            </button>
          </div>

          <div className="flex gap-2 pt-2 border-t border-neutral-200">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold transition-colors cursor-pointer">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> جارٍ الرفع…</> : <><Upload size={14} /> رفع الكتاب</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Books Page ──────────────────────────────────────────────
export default function BooksPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeYear, setActiveYear] = useState('all');
  const [openBook, setOpenBook] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (activeYear !== 'all') params.set('subject', activeYear);
      params.set('limit', '50');

      const res = await fetch(`${API}/api/books?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'فشل تحميل الكتب');
      setBooks(data.books || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeYear]);

  useEffect(() => {
    if (isAuthenticated) fetchBooks();
  }, [isAuthenticated, fetchBooks]);

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      const res = await fetch(`${API}/api/books/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchBooks();
    } catch {}
  };

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
                  <BookOpen size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">الكتب والمنهج الدراسي</h1>
                  <p className="text-xs text-slate-500">المقررات المعتمدة بصيغة PDF</p>
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
                  placeholder="ابحث بالعنوان أو الكاتب أو المادة…"
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
                value={activeYear}
                onChange={setActiveYear}
                className="w-48 sm:w-56 shrink-0"
              />

              {/* Add Button */}
              {isAdmin && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="shrink-0 flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <Plus size={16} />
                  إضافة كتاب
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Books Grid */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mb-3" />
              <p className="text-sm text-neutral-500">جارٍ جلب الكتب…</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 flex flex-col items-center justify-center text-center my-8">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">
                {search ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد كتب مضافة حالياً'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-md">
                {isAdmin
                  ? 'يمكنك كمدير للمنصة رفع كتب ومقررات دراسية جديدة عبر زر "إضافة كتاب" بالأعلى.'
                  : 'سيتم نشر الكتب والمقررات الدراسية المعتمدة قريباً.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-5 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  إضافة كتاب جديد
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((b) => (
                <BookCard
                  key={b._id}
                  book={b}
                  onOpen={setOpenBook}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {openBook && <PdfModal book={openBook} onClose={() => setOpenBook(null)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchBooks} />}
    </div>
  );
}
