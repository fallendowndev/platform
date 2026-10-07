const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middlewares/validate');

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
  maxAge,
});

const issueTokens = (res, user) => {
  const payload = { id: user._id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

  const accessMaxAge = 15 * 60 * 1000;
  const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie('accessToken', accessToken, cookieOptions(accessMaxAge));
  res.cookie('refreshToken', refreshToken, cookieOptions(refreshMaxAge));

  return refreshToken;
};

const SCHOOL_YEARS = ['اولى ثانوي', 'تانية ثانوي', 'تانية بكالوريا'];

const registerValidation = [
  body('username').trim().isLength({ min: 2, max: 50 }).withMessage('يجب أن يكون اسم المستخدم بين 2 و 50 حرفاً'),
  body('email').trim().isEmail().normalizeEmail().withMessage('يرجى إدخال بريد إلكتروني صالح'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('يجب أن تكون كلمة المرور 8 أحرف على الأقل'),
  body('userType').optional().isIn(['student', 'teacher']).withMessage('نوع الحساب غير صالح'),
  body('schoolYear').custom((val, { req }) => {
    const userType = req.body.userType || 'student';
    if (userType === 'student') {
      if (!val || !SCHOOL_YEARS.includes(val)) {
        throw new Error('يرجى اختيار سنة دراسية صحيحة');
      }
    }
    return true;
  }),
];

const loginValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('يرجى إدخال بريد إلكتروني صالح'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
];

const register = [
  ...registerValidation,
  validate,
  async (req, res, next) => {
    try {
      const { username, email, password, schoolYear, userType } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل' });
      }

      // First registered user becomes admin and auto-approved
      const usersCount = await User.countDocuments();
      const role = usersCount === 0 ? 'admin' : 'user';
      const isApproved = usersCount === 0;
      const finalUserType = userType === 'teacher' ? 'teacher' : 'student';
      const finalSchoolYear = finalUserType === 'teacher' ? undefined : schoolYear;

      const user = await User.create({
        username,
        email,
        password,
        role,
        userType: finalUserType,
        schoolYear: finalSchoolYear,
        isApproved,
      });

      if (isApproved) {
        const refreshToken = issueTokens(res, user);
        await User.findByIdAndUpdate(user._id, { refreshToken });
      }

      res.status(201).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          userType: user.userType,
          schoolYear: user.schoolYear,
          isApproved: user.isApproved,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

const login = [
  ...loginValidation,
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password +refreshToken');
      if (!user) {
        return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const match = await user.comparePassword(password);
      if (!match) {
        return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      // Check if user is approved by admin
      if (user.role !== 'admin' && !user.isApproved) {
        return res.status(403).json({
          message: 'حسابك قيد المراجعة، يرجى انتظار موافقة إدارة المنصة',
          code: 'ACCOUNT_PENDING',
        });
      }

      const refreshToken = issueTokens(res, user);
      await User.findByIdAndUpdate(user._id, { refreshToken });

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          userType: user.userType,
          schoolYear: user.schoolYear,
          isApproved: user.isApproved,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch {
        // Token invalid/expired — still clear cookies
      }
    }

    res.clearCookie('accessToken', cookieOptions(0));
    res.clearCookie('refreshToken', cookieOptions(0));
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      userType: req.user.userType,
      schoolYear: req.user.schoolYear,
      isApproved: req.user.isApproved,
      createdAt: req.user.createdAt,
    },
  });
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'يرجى تسجيل الدخول للمتابعة' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie('accessToken', cookieOptions(0));
      res.clearCookie('refreshToken', cookieOptions(0));
      return res.status(401).json({ message: 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      res.clearCookie('accessToken', cookieOptions(0));
      res.clearCookie('refreshToken', cookieOptions(0));
      return res.status(401).json({ message: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً' });
    }

    if (user.role !== 'admin' && !user.isApproved) {
      res.clearCookie('accessToken', cookieOptions(0));
      res.clearCookie('refreshToken', cookieOptions(0));
      return res.status(403).json({ message: 'حسابك قيد المراجعة من قبل الإدارة', code: 'ACCOUNT_PENDING' });
    }

    const newRefreshToken = issueTokens(res, user);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.json({ message: 'تم تجديد الجلسة بنجاح' });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all users with approval state
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('username email role userType schoolYear isApproved createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Admin: Approve user
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('username email role userType schoolYear isApproved');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json({ message: 'تم تفعيل الحساب بنجاح', user });
  } catch (err) {
    next(err);
  }
};

// Admin: Toggle approve user
const toggleApproveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    user.isApproved = !user.isApproved;
    await user.save();
    res.json({ message: user.isApproved ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', user });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete user
const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  me,
  refresh,
  getUsers,
  approveUser,
  toggleApproveUser,
  deleteUser,
};
