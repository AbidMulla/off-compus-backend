const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 100,
        required: true,
        trim: true
    },
    username: {
        type: String,
        maxlength: 100,
        unique: true,
        sparse: true, // Allow multiple null values
        trim: true
    },
    email: {
        type: String,
        maxlength: 320,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        maxlength: 255,
        required: true,
        minlength: 6
    },
    mobile_no: {
        type: String,
        maxlength: 25,
        trim: true
    },
    mobile_no_code: {
        type: String,
        maxlength: 10,
        trim: true
    },
    auth_provider: {
        type: String,
        maxlength: 50,
        enum: ['manual', 'google', 'facebook', 'twitter', 'github', 'apple', 'microsoft'],
        default: 'manual'
    },
    is_email_verified: {
        type: Boolean,
        default: false
    },
    is_mobile_verified: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    otp_code: {
        type: String,
        maxlength: 10
    },
    otp_expire_at: {
        type: Date
    },
    profile_pic_url: {
        type: String,
        maxlength: 255
    },
    bio: {
        type: String,
        maxlength: 1000
    },
    gender: {
        type: String,
        maxlength: 10
    },
    date_of_birth: {
        type: Date
    },
    country: {
        type: String,
        maxlength: 50
    },
    state: {
        type: String,
        maxlength: 100
    },
    city: {
        type: String,
        maxlength: 100
    },
    zipcode: {
        type: String,
        maxlength: 10
    },
    address: {
        type: String,
        maxlength: 500
    },
    profession: {
        type: String,
        maxlength: 50
    },
    qualification: {
        type: String,
        maxlength: 40
    },
    experience: {
        type: String,
        maxlength: 25
    },
    skill: {
        type: String,
        maxlength: 225
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    secret: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});



// Role Schema
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 255,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 1000
    },
    role_type: {
        type: String,
        maxlength: 50,
        default: 'user'
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// User Role Schema (Many-to-Many relationship)
const userRoleSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    }
}, {
    timestamps: true
});

// Token Schema
const tokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        maxlength: 255,
        required: true,
        unique: true
    },
    expires_at: {
        type: Date,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Create models
const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);
const UserRole = mongoose.model('UserRole', userRoleSchema);
const Token = mongoose.model('Token', tokenSchema);

module.exports = {
    User,
    Role,
    UserRole,
    Token
};
