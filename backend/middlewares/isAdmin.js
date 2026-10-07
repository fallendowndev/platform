const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح لك بالوصول إلى هذا المحتوى' });
  }
  next();
};

module.exports = isAdmin;
