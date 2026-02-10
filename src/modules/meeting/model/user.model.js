const { mongoose } = require('../../../config/database.config');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe user data (without password)
userSchema.methods.toSafeObject = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.deletedAt;
    delete userObject.__v;
    return userObject;
};

// Query helper for non-deleted users
userSchema.query.notDeleted = function () {
    return this.where({ deletedAt: null });
};

// Soft delete method
userSchema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    return await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
