const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'يرجى تسجيل الدخول للمتابعة' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ message: 'يرجى تسجيل الدخول للمتابعة' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'انتهت صلاحية الجلسة', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'يرجى تسجيل الدخول للمتابعة' });
  }
};

module.exports = isAuth;
