const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    schoolYear: {
      type: String,
      enum: ['جميع السنوات', 'اولى ثانوي', 'تانية ثانوي', 'تانية بكالوريا'],
      default: 'جميع السنوات',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ schoolYear: 1 });
videoSchema.index({ subject: 1 });
videoSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Video', videoSchema);
