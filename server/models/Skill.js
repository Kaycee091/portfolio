import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'Mobile', trim: true },
    proficiency: { type: Number, min: 0, max: 100, default: 90 },
    icon: { type: String, default: null },
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

export const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
