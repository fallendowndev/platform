const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.error(err);
  } else {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ message: 'بيانات غير صالحة' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'معرف غير صالح' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'هذا العنصر موجود مسبقاً' });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'حدث خطأ داخلي في الخادم';

  res.status(status).json({ message });
};

module.exports = errorHandler;
