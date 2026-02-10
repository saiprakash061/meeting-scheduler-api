const Meeting = require('../model/meeting.model');
const User = require('../model/user.model');
const { CreateMeetingDTO, UpdateMeetingDTO, MeetingResponseDTO } = require('../dto/meeting.dto');
const { AppError } = require('../../../utils/error.util');
const logger = require('../../../utils/logger.util');

class MeetingService {
    /**
     * Check for time conflicts with existing meetings
     * Conflict condition: existing.start < new.end AND existing.end > new.start
     */
    async checkTimeConflict(userId, startTime, endTime, excludeMeetingId = null) {
        // Ensure inputs are Date objects
        const start = new Date(startTime);
        const end = new Date(endTime);

        const query = {
            userId,
            status: { $ne: 'cancelled' },
            deletedAt: null,
            // Conflict condition: (Existing Start < New End) AND (Existing End > New Start)
            startTime: { $lt: end },
            endTime: { $gt: start }
        };

        // Exclude the current meeting when updating
        if (excludeMeetingId) {
            query._id = { $ne: excludeMeetingId };
        }

        const conflictingMeeting = await Meeting.findOne(query);

        if (conflictingMeeting) {
            throw new AppError(
                `Time slot already booked. Conflict with meeting: "${conflictingMeeting.title}" (${conflictingMeeting.startTime} - ${conflictingMeeting.endTime})`,
                400
            );
        }

        return false;
    }

    async createMeeting(meetingData) {
        try {
            const createMeetingDTO = new CreateMeetingDTO(meetingData);
            const validation = createMeetingDTO.validate();

            if (!validation.isValid) {
                throw new AppError(validation.errors.join(', '), 400);
            }

            // Verify user exists
            const user = await User.findById(createMeetingDTO.userId).notDeleted();
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Check for time conflicts
            await this.checkTimeConflict(
                createMeetingDTO.userId,
                createMeetingDTO.startTime,
                createMeetingDTO.endTime
            );

            const meeting = await Meeting.create({
                userId: createMeetingDTO.userId,
                title: createMeetingDTO.title,
                description: createMeetingDTO.description,
                startTime: createMeetingDTO.startTime,
                endTime: createMeetingDTO.endTime,
                location: createMeetingDTO.location,
                attendees: createMeetingDTO.attendees,
                status: 'scheduled'
            });

            logger.info(`Meeting created: ${meeting._id} for user: ${createMeetingDTO.userId}`);
            return new MeetingResponseDTO(meeting.toObject());
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid user ID', 400);
            }
            logger.error(`Error creating meeting: ${error.message}`);
            throw error;
        }
    }

    async getMeetingById(meetingId) {
        try {
            const meeting = await Meeting.findById(meetingId)
                .notDeleted()
                .populate('userId', 'name email');

            if (!meeting) {
                throw new AppError('Meeting not found', 404);
            }

            const meetingObj = meeting.toObject();
            if (meetingObj.userId) {
                meetingObj.user = {
                    id: meetingObj.userId._id,
                    name: meetingObj.userId.name,
                    email: meetingObj.userId.email
                };
            }

            return new MeetingResponseDTO(meetingObj);
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid meeting ID', 400);
            }
            logger.error(`Error fetching meeting: ${error.message}`);
            throw error;
        }
    }

    async listMeetings(filters = {}, page = 1, limit = 1) {
        try {
            const { userId, startDate, endDate, status } = filters;
            const skip = (page - 1) * limit;

            const query = { deletedAt: null };

            if (userId) {
                query.userId = userId;
            }

            if (status) {
                query.status = status;
            }

            // Date range filtering
            if (startDate || endDate) {
                query.startTime = {};
                if (startDate) {
                    query.startTime.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.startTime.$lte = new Date(endDate);
                }
            }

            const [meetings, total] = await Promise.all([
                Meeting.find(query)
                    .populate('userId', 'name email')
                    .limit(parseInt(limit))
                    .skip(skip)
                    .sort({ startTime: 1 }),
                Meeting.countDocuments(query)
            ]);

            const formattedMeetings = meetings.map(meeting => {
                const meetingObj = meeting.toObject();
                if (meetingObj.userId) {
                    meetingObj.user = {
                        id: meetingObj.userId._id,
                        name: meetingObj.userId.name,
                        email: meetingObj.userId.email
                    };
                }
                return new MeetingResponseDTO(meetingObj);
            });

            return {
                meetings: formattedMeetings,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error(`Error listing meetings: ${error.message}`);
            throw error;
        }
    }

    async updateMeeting(meetingId, updateData) {
        try {
            const meeting = await Meeting.findById(meetingId).notDeleted();

            if (!meeting) {
                throw new AppError('Meeting not found', 404);
            }

            const updateMeetingDTO = new UpdateMeetingDTO(updateData);
            const validation = updateMeetingDTO.validate();

            if (!validation.isValid) {
                throw new AppError(validation.errors.join(', '), 400);
            }

            const dataToUpdate = updateMeetingDTO.getUpdateData();

            // If updating time, check for conflicts
            if (dataToUpdate.startTime || dataToUpdate.endTime) {
                const newStartTime = dataToUpdate.startTime || meeting.startTime;
                const newEndTime = dataToUpdate.endTime || meeting.endTime;

                await this.checkTimeConflict(
                    meeting.userId,
                    newStartTime,
                    newEndTime,
                    meetingId // Exclude current meeting from conflict check
                );
            }

            // Update meeting fields
            Object.keys(dataToUpdate).forEach(key => {
                if (dataToUpdate[key] !== undefined) {
                    meeting[key] = dataToUpdate[key];
                }
            });

            await meeting.save();
            logger.info(`Meeting updated: ${meetingId}`);

            // Fetch updated meeting with user info
            const updatedMeeting = await Meeting.findById(meetingId)
                .populate('userId', 'name email');

            const meetingObj = updatedMeeting.toObject();
            if (meetingObj.userId) {
                meetingObj.user = {
                    id: meetingObj.userId._id,
                    name: meetingObj.userId.name,
                    email: meetingObj.userId.email
                };
            }

            return new MeetingResponseDTO(meetingObj);
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid meeting ID', 400);
            }
            logger.error(`Error updating meeting: ${error.message}`);
            throw error;
        }
    }

    async deleteMeeting(meetingId) {
        try {
            const meeting = await Meeting.findById(meetingId).notDeleted();

            if (!meeting) {
                throw new AppError('Meeting not found', 404);
            }

            await meeting.softDelete();
            logger.info(`Meeting deleted: ${meetingId}`);

            return { message: 'Meeting deleted successfully' };
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid meeting ID', 400);
            }
            logger.error(`Error deleting meeting: ${error.message}`);
            throw error;
        }
    }

    async getUserMeetings(userId, page = 1, limit = 1) {
        try {
            // Verify user exists
            const user = await User.findById(userId).notDeleted();
            if (!user) {
                throw new AppError('User not found', 404);
            }

            return await this.listMeetings({ userId }, page, limit);
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid user ID', 400);
            }
            logger.error(`Error fetching user meetings: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new MeetingService();
