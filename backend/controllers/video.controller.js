const Video = require('../models/Video');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const getVideos = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.schoolYear && req.query.schoolYear !== 'all' && req.query.schoolYear !== 'جميع السنوات') {
      filter.schoolYear = { $in: [req.query.schoolYear, 'جميع السنوات'] };
    }

    if (req.query.subject && typeof req.query.subject === 'string') {
      filter.subject = req.query.subject.slice(0, 100);
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const safe = req.query.search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { instructor: { $regex: safe, $options: 'i' } },
        { subject: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate('uploadedBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(filter),
    ]);

    res.json({
      videos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const createVideoValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('عنوان الفيديو مطلوب'),
  body('url').trim().isURL().withMessage('يرجى إدخال رابط فيديو صالح'),
  body('instructor').optional().trim().isLength({ max: 150 }).withMessage('اسم الأستاذ لا يتجاوز 150 حرفاً'),
  body('subject').optional().trim().isLength({ max: 100 }).withMessage('المادة لا تتجاوز 100 حرف'),
  body('schoolYear').optional().isIn(['جميع السنوات', 'اولى ثانوي', 'تانية ثانوي', 'تانية بكالوريا']).withMessage('السنة الدراسية غير صالحة'),
  body('duration').optional().trim(),
  body('description').optional().trim().isLength({ max: 2000 }),
];

const createVideo = [
  ...createVideoValidation,
  validate,
  async (req, res, next) => {
    try {
      const { title, url, instructor, subject, schoolYear, duration, description } = req.body;

      const video = await Video.create({
        title,
        url,
        instructor: instructor || '',
        subject: subject || '',
        schoolYear: schoolYear || 'جميع السنوات',
        duration: duration || '',
        description: description || '',
        uploadedBy: req.user._id,
      });

      res.status(201).json({ video });
    } catch (err) {
      next(err);
    }
  },
];

const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'الفيديو غير موجود' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الفيديو بنجاح' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getVideos, createVideo, deleteVideo };
