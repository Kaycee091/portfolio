import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, default: '', trim: true },
    icon: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.is_active = ret.isActive ? 1 : 0;
        ret.display_order = ret.displayOrder;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SocialLink = mongoose.models.SocialLink || mongoose.model('SocialLink', socialLinkSchema);
