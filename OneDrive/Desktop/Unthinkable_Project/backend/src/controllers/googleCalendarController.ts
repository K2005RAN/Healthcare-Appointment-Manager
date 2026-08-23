import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { GoogleCalendarService } from '../integrations/googleCalendarService';
import { GoogleCalendarConnection } from '../models/GoogleCalendarConnection';

export class GoogleCalendarController {
  static async getConnectUrl(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const url = GoogleCalendarService.getAuthUrl(userId);
      return res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleCallback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query;
      const userId = (state as string) || req.user?.userId;

      if (!code || !userId) {
        return res.status(400).send('OAuth callback code or state parameter missing');
      }

      await GoogleCalendarService.handleOAuthCallback(code as string, userId);
      return res.send('<h2>Google Calendar Connected Successfully! You can close this window.</h2>');
    } catch (error) {
      next(error);
    }
  }

  static async disconnect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await GoogleCalendarConnection.findOneAndDelete({ userId });
      return res.status(200).json({
        success: true,
        message: 'Google Calendar disconnected',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conn = await GoogleCalendarConnection.findOne({ userId });
      return res.status(200).json({
        success: true,
        data: { isConnected: !!conn },
      });
    } catch (error) {
      next(error);
    }
  }
}
