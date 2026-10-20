import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    isCurrent: { type: Boolean, default: true },
    description: { type: String, default: '', trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.start_date = ret.startDate;
        ret.end_date = ret.endDate;
        ret.is_current = ret.isCurrent ? 1 : 0;
        ret.display_order = ret.displayOrder;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
