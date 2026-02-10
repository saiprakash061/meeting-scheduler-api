const express = require('express');
const router = express.Router();
const meetingController = require('../interface/meeting.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Public (or Private if auth is enforced)
 */
router.post('/', meetingController.createMeeting);

/**
 * @route   GET /api/meetings
 * @desc    List all meetings with optional filters
 * @access  Public
 * @query   userId, startDate, endDate, status, page, limit
 */
router.get('/', meetingController.listMeetings);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Public
 */
router.get('/:id', meetingController.getMeeting);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update a meeting
 * @access  Public (or Private if auth is enforced)
 */
router.put('/:id', meetingController.updateMeeting);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete a meeting (soft delete)
 * @access  Public (or Private if auth is enforced)
 */
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;
