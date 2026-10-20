import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    technologies: { type: [String], default: [] },
    liveUrl: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true },
    image: { type: String, default: null }, // main image URL/path
    screenshots: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    category: { type: String, default: 'Mobile' },
    apkFile: { type: String, default: null }, // uploaded .apk file path
    apkUrl: { type: String, default: '', trim: true }, // external APK download link
    playStoreUrl: { type: String, default: '', trim: true }, // Google Play Store link
    appStoreUrl: { type: String, default: '', trim: true }, // Apple App Store link
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        // Snake_case aliases for backwards compatibility with existing UI
        ret.live_url = ret.liveUrl;
        ret.github_url = ret.githubUrl;
        ret.main_image = ret.image;
        ret.is_featured = ret.featured ? 1 : 0;
        ret.is_published = ret.published ? 1 : 0;
        ret.display_order = ret.displayOrder;
        ret.apk_file = ret.apkFile;
        ret.apk_url = ret.apkUrl;
        ret.play_store_url = ret.playStoreUrl;
        ret.app_store_url = ret.appStoreUrl;
        ret.images = (ret.screenshots || []).map((img, i) => ({
          id: i + 1,
          image_path: img,
          display_order: i + 1,
        }));
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
