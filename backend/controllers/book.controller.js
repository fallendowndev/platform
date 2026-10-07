const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { body, query, param } = require('express-validator');
const Book = require('../models/Book');
const validate = require('../middlewares/validate');

const ALLOWED_MIME = 'application/pdf';
const ALLOWED_EXT = '.pdf';
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== ALLOWED_MIME) {
    return cb(new Error('يسمح فقط بملفات PDF'));
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ALLOWED_EXT) {
    return cb(new Error('يسمح فقط بملفات PDF'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
});

const validateMagicBytes = (filePath) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    return buf.equals(PDF_MAGIC);
  } catch {
    return false;
  }
};

const safeFilename = (filename) => {
  return path.basename(filename).replace(/[^a-zA-Z0-9._\-\u0600-\u06FF\s]/g, '');
};

const getBooks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.subject && typeof req.query.subject === 'string') {
      filter.subject = req.query.subject.slice(0, 100);
    }

    if (req.query.year && /^\d{4}$/.test(req.query.year)) {
      filter.year = parseInt(req.query.year);
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const safe = req.query.search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { author: { $regex: safe, $options: 'i' } },
        { subject: { $regex: safe, $options: 'i' } },
      ];
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .select('title author description subject year originalName size uploadedBy createdAt')
        .populate('uploadedBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter),
    ]);

    res.json({
      books,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .select('title author description subject year originalName size uploadedBy createdAt')
      .populate('uploadedBy', 'username')
      .lean();

    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود' });
    }

    res.json({ book });
  } catch (err) {
    next(err);
  }
};

const createBookValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('عنوان الكتاب مطلوب (بحد أقصى 200 حرف)'),
  body('author').optional().trim().isLength({ max: 150 }).withMessage('اسم الكاتب لا يتجاوز 150 حرفاً'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('الوصف لا يتجاوز 2000 حرف'),
  body('subject').optional().trim().isLength({ max: 100 }).withMessage('المادة لا تتجاوز 100 حرف'),
  body('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('السنة يجب أن تكون بين 1900 و 2100'),
];

const createBook = [
  upload.single('pdf'),
  ...createBookValidation,
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(422).json({ message: 'ملف PDF مطلوب' });
      }

      const filePath = req.file.path;

      if (!validateMagicBytes(filePath)) {
        fs.unlinkSync(filePath);
        return res.status(422).json({ message: 'ملف غير صالح: يجب أن يكون ملف PDF صحيحاً' });
      }

      const { title, author, description, subject, year } = req.body;

      const book = await Book.create({
        title,
        author: author || '',
        description: description || '',
        subject: subject || '',
        year: year ? parseInt(year) : undefined,
        filename: req.file.filename,
        originalName: safeFilename(req.file.originalname),
        size: req.file.size,
        uploadedBy: req.user._id,
      });

      res.status(201).json({
        book: {
          id: book._id,
          title: book.title,
          author: book.author,
          subject: book.subject,
          year: book.year,
        },
      });
    } catch (err) {
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
      next(err);
    }
  },
];

const updateBookValidation = [
  param('id').isMongoId().withMessage('معرف كتاب غير صالح'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('عنوان الكتاب لا يتجاوز 200 حرف'),
  body('author').optional().trim().isLength({ max: 150 }).withMessage('اسم الكاتب لا يتجاوز 150 حرفاً'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('الوصف لا يتجاوز 2000 حرف'),
  body('subject').optional().trim().isLength({ max: 100 }).withMessage('المادة لا تتجاوز 100 حرف'),
  body('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('السنة يجب أن تكون بين 1900 و 2100'),
];

const updateBook = [
  ...updateBookValidation,
  validate,
  async (req, res, next) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'الكتاب غير موجود' });
      }

      const allowed = ['title', 'author', 'description', 'subject', 'year'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) {
          book[field] = req.body[field];
        }
      });

      await book.save();

      res.json({
        book: {
          id: book._id,
          title: book.title,
          author: book.author,
          description: book.description,
          subject: book.subject,
          year: book.year,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود' });
    }

    const filePath = path.resolve(process.env.UPLOAD_DIR || 'uploads', book.filename);
    await Book.findByIdAndDelete(req.params.id);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }

    res.json({ message: 'تم حذف الكتاب بنجاح' });
  } catch (err) {
    next(err);
  }
};

const streamPDF = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('filename originalName size').lean();
    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود' });
    }

    const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    const filePath = path.join(uploadDir, book.filename);
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(uploadDir + path.sep) && resolvedPath !== uploadDir) {
      return res.status(400).json({ message: 'مسار ملف غير صالح' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: 'الملف غير موجود' });
    }

    const stat = fs.statSync(resolvedPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.originalName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (start >= fileSize || end >= fileSize) {
        return res.status(416).json({ message: 'النطاق المطلوب غير متاح' });
      }

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunkSize);

      const stream = fs.createReadStream(resolvedPath, { start, end });
      stream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      fs.createReadStream(resolvedPath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, streamPDF };
