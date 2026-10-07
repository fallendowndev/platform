const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  me,
  refresh,
  getUsers,
  approveUser,
  toggleApproveUser,
  deleteUser,
} = require('../controllers/auth.controller');
const isAuth = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'تم تجاوز عدد محاولات إنشاء الحساب، يرجى المحاولة بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'تم تجاوز عدد الطلبات، يرجى الانتظار قليلاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', isAuth, me);
router.post('/refresh', refreshLimiter, refresh);

// Admin routes
router.get('/users', isAuth, isAdmin, getUsers);
router.patch('/users/:id/approve', isAuth, isAdmin, approveUser);
router.patch('/users/:id/toggle-approve', isAuth, isAdmin, toggleApproveUser);
router.delete('/users/:id', isAuth, isAdmin, deleteUser);

module.exports = router;
