"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const googleapis_1 = require("googleapis");
const env_1 = require("../config/env");
const GoogleCalendarConnection_1 = require("../models/GoogleCalendarConnection");
const CalendarEvent_1 = require("../models/CalendarEvent");
class GoogleCalendarService {
    static createOAuthClient() {
        return new googleapis_1.google.auth.OAuth2(env_1.env.GOOGLE_CLIENT_ID, env_1.env.GOOGLE_CLIENT_SECRET, env_1.env.GOOGLE_REDIRECT_URI);
    }
    static getAuthUrl(userId) {
        const oauth2Client = this.createOAuthClient();
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['https://www.googleapis.com/auth/calendar.events'],
            state: userId,
        });
    }
    static async handleOAuthCallback(code, userId) {
        const oauth2Client = this.createOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.access_token) {
            throw new Error('Failed to obtain Google access token');
        }
        const expiresAt = new Date(tokens.expiry_date || Date.now() + 3600 * 1000);
        await GoogleCalendarConnection_1.GoogleCalendarConnection.findOneAndUpdate({ userId }, {
            userId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || '',
            expiresAt,
            scope: tokens.scope,
        }, { upsert: true, new: true });
        return { connected: true };
    }
    static async syncAppointmentEvent(data) {
        try {
            const conn = await GoogleCalendarConnection_1.GoogleCalendarConnection.findOne({ userId: data.userId });
            if (!conn || !conn.accessToken) {
                return {
                    success: false,
                    message: 'Calendar sync unavailable. Google Calendar is not connected.',
                };
            }
            // Check for mock credentials during local development
            if (env_1.env.GOOGLE_CLIENT_ID === 'mock_google_client_id' || env_1.env.GOOGLE_CLIENT_ID === 'dev_google_client_id') {
                const mockEventId = `mock_evt_${Date.now()}`;
                await CalendarEvent_1.CalendarEvent.create({
                    appointmentId: data.appointmentId,
                    userId: data.userId,
                    googleEventId: mockEventId,
                    status: 'SYNCED',
                });
                console.log(`[Google Calendar Sync Simulated] Event Created: ${mockEventId}`);
                return { success: true, googleEventId: mockEventId };
            }
            const oauth2Client = this.createOAuthClient();
            oauth2Client.setCredentials({
                access_token: conn.accessToken,
                refresh_token: conn.refreshToken,
            });
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: data.summary,
                    description: data.description,
                    start: { dateTime: data.startTime.toISOString() },
                    end: { dateTime: data.endTime.toISOString() },
                },
            });
            const googleEventId = response.data.id || '';
            await CalendarEvent_1.CalendarEvent.create({
                appointmentId: data.appointmentId,
                userId: data.userId,
                googleEventId,
                status: 'SYNCED',
            });
            return { success: true, googleEventId };
        }
        catch (error) {
            console.error('[Google Calendar Sync Error]:', error.message || error);
            return {
                success: false,
                message: 'Calendar sync unavailable. Your appointment is still confirmed.',
            };
        }
    }
}
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=googleCalendarService.js.map