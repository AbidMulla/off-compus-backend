const mongoose = require('mongoose');

// Job Management Schema
const jobManagementSchema = new mongoose.Schema({
    // Job Details
    job_title: {
        type: String,
        maxlength: 255,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        maxlength: 255,
        lowercase: true,
        trim: true
    },
    job_description: {
        type: String,
        maxlength: 5000
    },
    job_profile: {
        type: String,
        maxlength: 1000
    },
    company: {
        type: String,
        maxlength: 255,
        trim: true
    },
    location: {
        type: String,
        maxlength: 255,
        trim: true
    },

    // Candidate/Job Specifics
    batch: {
        type: [String]
    },
    degrees: {
        type: [String]
    },
    min_salary: {
        type: Number,
        min: 0
    },
    max_salary: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    salary_type: {
        type: String,
    },
    job_type: {
        type: String
    },
    employment_type: {
        type: String
    },

    // Job Lifecycle & Metadata
    job_post_date: {
        type: Date,
        default: Date.now
    },
    job_post_time: {
        type: String,
        maxlength: 10
    },
    job_expire_date: {
        type: Date
    },
    job_expire_time: {
        type: String,
        maxlength: 10
    },
    status: {
        type: String,
        default: 'Draft'
    },

    // Multiple titles and descriptions with sub-schema
    title_and_description_json: {
        type: [{
          title: {
            type: String,
            maxlength: 255,
            trim: true
          },
          description: [{
            type: String,
            maxlength: 2000
          }],
          type: {
            type: String,
            maxlength: 50
          },
          order: {
            type: Number,
            default: 0
          }
        }],
        default: []
      },
    // Application and Analytics
    apply_link: {
        type: String,
        maxlength: 500
    },
    no_of_viewed_job: {
        type: Number,
        default: 0,
        min: 0
    },
    no_of_click_apply_link: {
        type: Number,
        default: 0,
        min: 0
    },

    // Soft delete and metadata
    is_deleted: {
        type: Boolean,
        default: false
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    is_urgent: {
        type: Boolean,
        default: false
    },

    // Additional job requirements
    experience_type: {
        type: String,
        default: 'Both'
    },

    // Admin and tracking
    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    last_modified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    meta_title: {
        type: String,
        maxlength: 500
    },
    meta_description: {
        type: String,
        maxlength: 500
    },
    meta_keywords: {
        type: [String],
        default: []
    },
    
    // SEO metadata for search engines
    seo_title: {
        type: String,
        maxlength: 255,
        trim: true
    },
    seo_description: {
        type: String,
        maxlength: 500,
        trim: true
    },
    seo_keywords: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    
    // OpenGraph metadata for social media sharing
    og_title: {
        type: String,
        maxlength: 255,
        trim: true
    },
    og_description: {
        type: String,
        maxlength: 500,
        trim: true
    },
    og_image: {
        type: String,
        maxlength: 500
    },
    og_image_width: {
        type: Number,
        default: 1200
    },
    og_image_height: {
        type: Number,
        default: 630
    },
    og_image_alt: {
        type: String,
        maxlength: 255,
        trim: true
    },
    og_url: {
        type: String,
        maxlength: 500
    },
    og_site_name: {
        type: String,
        maxlength: 255,
        trim: true
    },
    og_locale: {
        type: String,
        default: 'en_US',
        maxlength: 10
    },
    og_type: {
        type: String,
        default: 'website',
        maxlength: 50
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted salary display
jobManagementSchema.virtual('formatted_salary').get(function () {
    if (!this.min_salary && !this.max_salary) {
        return 'Not specified';
    }

    const min = this.min_salary || 0;
    const max = this.max_salary;
    const currency = this.currency || 'INR';

    if (max && max > min) {
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else {
        return `${currency} ${min.toLocaleString()}+`;
    }
});

// Virtual for job status
jobManagementSchema.virtual('is_active').get(function () {
    const now = new Date();
    return this.status === 'Active' && this.job_expire_date > now && !this.is_deleted;
});

// Virtual for days until expiry
jobManagementSchema.virtual('days_until_expiry').get(function () {
    const now = new Date();
    const diffTime = this.job_expire_date - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for OpenGraph metadata
jobManagementSchema.virtual('openGraph').get(function () {
    return {
        title: this.og_title || this.job_title,
        description: this.og_description || this.meta_description || this.job_description?.substring(0, 160),
        url: this.og_url || `${process.env.FRONTEND_URL || 'https://yourwebsite.com'}/job-details/${this.slug}`,
        siteName: this.og_site_name || 'Your Career Portal',
        images: this.og_image ? [{
            url: this.og_image,
            width: this.og_image_width || 1200,
            height: this.og_image_height || 630,
            alt: this.og_image_alt || this.job_title
        }] : [],
        locale: this.og_locale || 'en_US',
        type: this.og_type || 'website'
    };
});

// Pre-save middleware to generate slug
jobManagementSchema.pre('save', function (next) {
    if (this.isModified('job_title') && !this.slug) {
        this.slug = this.job_title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    next();
});

// Pre-save middleware to update status based on expiry
jobManagementSchema.pre('save', function (next) {
    const now = new Date();
    if (this.job_expire_date && this.job_expire_date <= now && this.status === 'Active') {
        this.status = 'Expired';
    }
    next();
});

// Indexes for better performance
jobManagementSchema.index({ job_title: 'text', job_description: 'text', company: 'text' });
jobManagementSchema.index({ status: 1, is_deleted: 1 });
jobManagementSchema.index({ job_expire_date: 1 });
jobManagementSchema.index({ location: 1 });
jobManagementSchema.index({ company: 1 });
jobManagementSchema.index({ batch: 1 });
jobManagementSchema.index({ degrees: 1 });
jobManagementSchema.index({ job_type: 1 });
jobManagementSchema.index({ employment_type: 1 });
jobManagementSchema.index({ posted_by: 1 });
jobManagementSchema.index({ slug: 1 });
jobManagementSchema.index({ is_featured: 1, status: 1 });
jobManagementSchema.index({ created_at: -1 });
jobManagementSchema.index({ seo_title: 1 });
jobManagementSchema.index({ seo_keywords: 1 });
jobManagementSchema.index({ og_title: 1 });
jobManagementSchema.index({ og_image: 1 });


// Instance methods
jobManagementSchema.methods.incrementViewCount = function () {
    this.no_of_viewed_job += 1;
    return this.save();
};

jobManagementSchema.methods.incrementApplyCount = function () {
    this.no_of_click_apply_link += 1;
    return this.save();
};

// Create the model with custom collection name
const JobManagement = mongoose.model('JobManagement', jobManagementSchema, 'job-managements');

module.exports = {
    JobManagement
};
