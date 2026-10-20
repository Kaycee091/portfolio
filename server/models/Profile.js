import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: 'Kenechukwu Asogwa' },
    professionalTitle: { type: String, default: 'Mobile & Software Developer' },
    location: { type: String, default: 'Nigeria' },
    tagline: { type: String, default: 'Building digital products that solve real problems.' },
    heroIntro: { type: String, default: "Hi, I'm Kenechukwu 👋" },
    aboutHeading: { type: String, default: 'About Me' },
    aboutDescription: { type: String, default: '' },
    aboutExtra: { type: String, default: '' },
    profilePicture: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        // Provide snake_case aliases for frontend backwards compatibility
        ret.full_name = ret.fullName;
        ret.professional_title = ret.professionalTitle;
        ret.hero_intro = ret.heroIntro;
        ret.about_heading = ret.aboutHeading;
        ret.about_description = ret.aboutDescription;
        ret.about_extra = ret.aboutExtra;
        ret.profile_picture = ret.profilePicture;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
