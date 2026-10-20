import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    portfolioTitle: { type: String, default: 'Kenechukwu Asogwa | Mobile & Software Developer' },
    metaDescription: { type: String, default: 'Portfolio of Kenechukwu Asogwa, Mobile & Software Developer based in Nigeria.' },
    accentColor: { type: String, default: '#6366f1' },
    footerText: { type: String, default: '© 2024 Kenechukwu Asogwa. All rights reserved.' },
    analyticsId: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.portfolio_title = ret.portfolioTitle;
        ret.meta_description = ret.metaDescription;
        ret.accent_color = ret.accentColor;
        ret.footer_text = ret.footerText;
        ret.analytics_id = ret.analyticsId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
