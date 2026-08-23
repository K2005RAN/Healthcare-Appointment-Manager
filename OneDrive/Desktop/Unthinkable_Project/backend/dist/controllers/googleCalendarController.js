"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarController = void 0;
const googleCalendarService_1 = require("../integrations/googleCalendarService");
const GoogleCalendarConnection_1 = require("../models/GoogleCalendarConnection");
class GoogleCalendarController {
    static async getConnectUrl(req, res, next) {
        try {
            const userId = req.user.userId;
            const url = googleCalendarService_1.GoogleCalendarService.getAuthUrl(userId);
            return res.status(200).json({
                success: true,
                data: { url },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async handleCallback(req, res, next) {
        try {
            const { code, state } = req.query;
            const userId = state || req.user?.userId;
            if (!code || !userId) {
                return res.status(400).send('OAuth callback code or state parameter missing');
            }
            await googleCalendarService_1.GoogleCalendarService.handleOAuthCallback(code, userId);
            return res.send('<h2>Google Calendar Connected Successfully! You can close this window.</h2>');
        }
        catch (error) {
            next(error);
        }
    }
    static async disconnect(req, res, next) {
        try {
            const userId = req.user.userId;
            await GoogleCalendarConnection_1.GoogleCalendarConnection.findOneAndDelete({ userId });
            return res.status(200).json({
                success: true,
                message: 'Google Calendar disconnected',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const conn = await GoogleCalendarConnection_1.GoogleCalendarConnection.findOne({ userId });
            return res.status(200).json({
                success: true,
                data: { isConnected: !!conn },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GoogleCalendarController = GoogleCalendarController;
//# sourceMappingURL=googleCalendarController.js.map