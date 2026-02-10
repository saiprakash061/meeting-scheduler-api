const { mongoose } = require('../../../config/database.config');

const meetingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
        validate: {
            validator: function (value) {
                return value > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    location: {
        type: String,
        trim: true
    },
    attendees: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'cancelled', 'completed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'scheduled'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

meetingSchema.index({ userId: 1 });
meetingSchema.index({ startTime: 1, endTime: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ userId: 1, startTime: 1, endTime: 1 });

meetingSchema.query.notDeleted = function () {
    return this.where({ deletedAt: null });
};

meetingSchema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    return await this.save();
};

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;


