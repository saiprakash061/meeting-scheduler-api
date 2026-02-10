const meetingService = require('../service/meeting.service');
const { asyncHandler } = require('../../../utils/async.util');

class MeetingController {
    // POST /meetings - Create a new meeting
    createMeeting = asyncHandler(async (req, res) => {
        // If authenticated, use the authenticated user's ID
        const meetingData = {
            ...req.body,
            userId: req.user ? req.user.id : req.body.userId
        };

        const meeting = await meetingService.createMeeting(meetingData);

        res.status(201).json({
            success: true,
            message: 'Meeting created successfully',
            data: meeting
        });
    });

    // GET /meetings/:id - Get meeting by ID
    getMeeting = asyncHandler(async (req, res) => {
        const meeting = await meetingService.getMeetingById(req.params.id);

        res.status(200).json({
            success: true,
            data: meeting
        });
    });

    // GET /meetings - List all meetings with filters
    listMeetings = asyncHandler(async (req, res) => {
        const { userId, startDate, endDate, status, page = 1, limit = 1 } = req.query;

        const filters = {};
        if (userId) filters.userId = userId;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (status) filters.status = status;

        const result = await meetingService.listMeetings(filters, page, limit);

        res.status(200).json({
            success: true,
            data: result.meetings,
            pagination: result.pagination
        });
    });

    // PUT /meetings/:id - Update a meeting
    updateMeeting = asyncHandler(async (req, res) => {
        const meeting = await meetingService.updateMeeting(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Meeting updated successfully',
            data: meeting
        });
    });

    // DELETE /meetings/:id - Delete a meeting (soft delete)
    deleteMeeting = asyncHandler(async (req, res) => {
        const result = await meetingService.deleteMeeting(req.params.id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    });

    // GET /users/:userId/meetings - Get all meetings for a specific user
    getUserMeetings = asyncHandler(async (req, res) => {
        const { page = 1, limit = 1 } = req.query;
        const result = await meetingService.getUserMeetings(req.params.userId, page, limit);

        res.status(200).json({
            success: true,
            data: result.meetings,
            pagination: result.pagination
        });
    });
}

module.exports = new MeetingController();
