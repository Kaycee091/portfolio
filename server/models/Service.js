import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    icon: { type: String, default: 'smartphone' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.display_order = ret.displayOrder;
        ret.is_active = ret.isActive ? 1 : 0;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
