import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.file_path = ret.filePath;
        ret.original_name = ret.originalName;
        ret.file_size = ret.fileSize;
        ret.is_active = ret.isActive ? 1 : 0;
        ret.uploaded_at = ret.uploadedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CV = mongoose.models.CV || mongoose.model('CV', cvSchema);
