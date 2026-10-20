import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema(
  {
    email: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '', trim: true },
    location: { type: String, default: 'Nigeria', trim: true },
    phone: { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ContactInfo = mongoose.models.ContactInfo || mongoose.model('ContactInfo', contactInfoSchema);
