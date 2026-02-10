class CreateMeetingDTO {
    constructor({ userId, title, description, startTime, endTime, location, attendees }) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.attendees = attendees || [];
    }

    validate() {
        const errors = [];

        if (!this.userId) {
            errors.push('User ID is required');
        }

        if (!this.title || this.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters');
        }

        if (!this.startTime) {
            errors.push('Start time is required');
        }

        if (!this.endTime) {
            errors.push('End time is required');
        }

        const start = new Date(this.startTime);
        const end = new Date(this.endTime);

        if (isNaN(start.getTime())) {
            errors.push('Invalid start time format');
        }

        if (isNaN(end.getTime())) {
            errors.push('Invalid end time format');
        }

        if (start >= end) {
            errors.push('End time must be after start time');
        }

        if (start < new Date()) {
            errors.push('Cannot schedule meetings in the past');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class UpdateMeetingDTO {
    constructor({ title, description, startTime, endTime, location, attendees, status }) {
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.attendees = attendees;
        this.status = status;
    }

    validate() {
        const errors = [];

        if (this.title !== undefined && this.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters');
        }

        if (this.startTime && this.endTime) {
            const start = new Date(this.startTime);
            const end = new Date(this.endTime);

            if (isNaN(start.getTime())) {
                errors.push('Invalid start time format');
            }

            if (isNaN(end.getTime())) {
                errors.push('Invalid end time format');
            }

            if (start >= end) {
                errors.push('End time must be after start time');
            }
        }

        if (this.status && !['scheduled', 'cancelled', 'completed'].includes(this.status)) {
            errors.push('Invalid status. Must be: scheduled, cancelled, or completed');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    getUpdateData() {
        const updateData = {};

        if (this.title !== undefined) updateData.title = this.title;
        if (this.description !== undefined) updateData.description = this.description;
        if (this.startTime !== undefined) updateData.startTime = this.startTime;
        if (this.endTime !== undefined) updateData.endTime = this.endTime;
        if (this.location !== undefined) updateData.location = this.location;
        if (this.attendees !== undefined) updateData.attendees = this.attendees;
        if (this.status !== undefined) updateData.status = this.status;

        return updateData;
    }
}

class MeetingResponseDTO {
    constructor(meeting) {
        this.id = meeting.id || meeting._id; 
        this._id = meeting._id || meeting.id; 

        if (meeting.userId) {
            this.userId = meeting.userId._id || meeting.userId;
        }

        this.title = meeting.title;
        this.description = meeting.description;
        this.startTime = meeting.startTime;
        this.endTime = meeting.endTime;
        this.location = meeting.location;
        this.attendees = meeting.attendees;
        this.status = meeting.status;
        this.createdAt = meeting.createdAt;
        this.updatedAt = meeting.updatedAt;

        if (meeting.user) {
            this.user = {
                id: meeting.user.id || meeting.user._id,
                _id: meeting.user.id || meeting.user._id, 
                name: meeting.user.name,
                email: meeting.user.email
            };
        }
    }
}

module.exports = {
    CreateMeetingDTO,
    UpdateMeetingDTO,
    MeetingResponseDTO
};


