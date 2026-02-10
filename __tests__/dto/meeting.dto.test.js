const { CreateMeetingDTO, UpdateMeetingDTO } = require('../../../src/modules/meeting/dto/meeting.dto');

describe('MeetingDTO', () => {
    describe('CreateMeetingDTO', () => {
        describe('validate', () => {
            it('should validate a valid meeting', () => {
                const dto = new CreateMeetingDTO({
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Team Meeting',
                    description: 'Weekly sync',
                    startTime: '2026-02-15T10:00:00Z',
                    endTime: '2026-02-15T11:00:00Z',
                    location: 'Conference Room A',
                    attendees: ['test@example.com']
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            });

            it('should fail when title is too short', () => {
                const dto = new CreateMeetingDTO({
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'AB',
                    startTime: '2026-02-15T10:00:00Z',
                    endTime: '2026-02-15T11:00:00Z'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Title must be at least 3 characters');
            });

            it('should fail when userId is missing', () => {
                const dto = new CreateMeetingDTO({
                    title: 'Team Meeting',
                    startTime: '2026-02-15T10:00:00Z',
                    endTime: '2026-02-15T11:00:00Z'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('User ID is required');
            });

            it('should fail when start time is missing', () => {
                const dto = new CreateMeetingDTO({
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Team Meeting',
                    endTime: '2026-02-15T11:00:00Z'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Start time is required');
            });

            it('should fail when end time is before start time', () => {
                const dto = new CreateMeetingDTO({
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Team Meeting',
                    startTime: '2026-02-15T11:00:00Z',
                    endTime: '2026-02-15T10:00:00Z'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('End time must be after start time');
            });

            it('should fail when start time is in the past', () => {
                const dto = new CreateMeetingDTO({
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Team Meeting',
                    startTime: '2020-01-01T10:00:00Z',
                    endTime: '2020-01-01T11:00:00Z'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Cannot schedule meetings in the past');
            });

            it('should fail with invalid date format', () => {
                const dto = new CreateMeetingDTO({
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Team Meeting',
                    startTime: 'invalid-date',
                    endTime: '2026-02-15T11:00:00Z'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Invalid start time format');
            });
        });
    });

    describe('UpdateMeetingDTO', () => {
        describe('validate', () => {
            it('should validate a valid update', () => {
                const dto = new UpdateMeetingDTO({
                    title: 'Updated Meeting',
                    location: 'Room B'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            });

            it('should fail when title is too short', () => {
                const dto = new UpdateMeetingDTO({
                    title: 'AB'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Title must be at least 3 characters');
            });

            it('should fail with invalid status', () => {
                const dto = new UpdateMeetingDTO({
                    status: 'invalid_status'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Invalid status. Must be: scheduled, cancelled, or completed');
            });

            it('should validate with valid status', () => {
                const dto = new UpdateMeetingDTO({
                    status: 'completed'
                });

                const validation = dto.validate();

                expect(validation.isValid).toBe(true);
            });
        });

        describe('getUpdateData', () => {
            it('should return only provided fields', () => {
                const dto = new UpdateMeetingDTO({
                    title: 'Updated Title',
                    location: 'New Location'
                });

                const updateData = dto.getUpdateData();

                expect(updateData).toEqual({
                    title: 'Updated Title',
                    location: 'New Location'
                });
                expect(updateData.description).toBeUndefined();
            });

            it('should include all provided fields', () => {
                const dto = new UpdateMeetingDTO({
                    title: 'Updated Title',
                    description: 'New Description',
                    location: 'New Location',
                    status: 'completed'
                });

                const updateData = dto.getUpdateData();

                expect(updateData).toEqual({
                    title: 'Updated Title',
                    description: 'New Description',
                    location: 'New Location',
                    status: 'completed'
                });
            });
        });
    });
});
