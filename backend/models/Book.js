const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    year: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

bookSchema.index({ subject: 1 });
bookSchema.index({ year: 1 });
bookSchema.index({ uploadedBy: 1 });
bookSchema.index({ title: 'text', author: 'text', subject: 'text' });

module.exports = mongoose.model('Book', bookSchema);
