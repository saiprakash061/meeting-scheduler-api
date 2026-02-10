const express = require('express');
const router = express.Router();
const meetingController = require('../interface/meeting.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

router.post('/', meetingController.createMeeting);

router.get('/', meetingController.listMeetings);

router.get('/:id', meetingController.getMeeting);

router.put('/:id', meetingController.updateMeeting);

router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;


