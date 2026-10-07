const express = require('express');
const rateLimit = require('express-rate-limit');
const { param } = require('express-validator');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  streamPDF,
} = require('../controllers/book.controller');
const isAuth = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');
const validate = require('../middlewares/validate');

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'تم بلوغ الحد الأقصى لرفع الملفات، يرجى المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

const idValidation = [
  param('id').isMongoId().withMessage('معرف غير صالح'),
  validate,
];

router.get('/', isAuth, getBooks);
router.get('/:id', isAuth, idValidation, getBook);
router.get('/:id/pdf', isAuth, idValidation, streamPDF);
router.post('/', isAuth, isAdmin, uploadLimiter, createBook);
router.put('/:id', isAuth, isAdmin, idValidation, updateBook);
router.delete('/:id', isAuth, isAdmin, idValidation, deleteBook);

module.exports = router;
