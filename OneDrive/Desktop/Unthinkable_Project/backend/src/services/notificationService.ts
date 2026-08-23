import { Notification, INotification, NotificationStatus, NotificationType } from '../models/Notification';
import { EmailService } from '../integrations/emailService';
import { ApiError } from '../utils/apiError';

export class NotificationService {
  /**
   * Queue a notification record and execute dispatch.
   */
  static async sendNotification(data: {
    userId: string;
    appointmentId?: string;
    type: NotificationType;
    recipient: string;
    subject: string;
    body: string;
  }): Promise<INotification> {
    const notification = await Notification.create({
      userId: data.userId,
      appointmentId: data.appointmentId,
      type: data.type,
      channel: 'EMAIL',
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      status: NotificationStatus.PENDING,
      attemptCount: 0,
    });

    // Execute immediately
    this.processNotification(notification._id.toString());
    return notification;
  }

  /**
   * Process and send notification with exponential backoff retry handling.
   */
  static async processNotification(notificationId: string): Promise<boolean> {
    const notification = await Notification.findById(notificationId);
    if (!notification) return false;

    notification.status = NotificationStatus.PROCESSING;
    notification.attemptCount += 1;
    notification.lastAttemptAt = new Date();
    await notification.save();

    try {
      await EmailService.sendEmail({
        to: notification.recipient,
        subject: notification.subject,
        html: notification.body,
      });

      notification.status = NotificationStatus.SENT;
      notification.nextRetryAt = undefined;
      notification.error = undefined;
      await notification.save();
      return true;
    } catch (error: any) {
      console.error(`[Notification Process Failed] ID: ${notificationId}, Attempt: ${notification.attemptCount}`, error.message);
      
      const maxRetries = 4;
      if (notification.attemptCount >= maxRetries) {
        notification.status = NotificationStatus.FAILED;
        notification.error = `Max retries (${maxRetries}) exceeded: ${error.message}`;
        notification.nextRetryAt = undefined;
      } else {
        notification.status = NotificationStatus.PENDING;
        notification.error = error.message;

        // Exponential backoff delays in minutes: 1m, 5m, 15m
        const delayMinutes = notification.attemptCount === 1 ? 1 : notification.attemptCount === 2 ? 5 : 15;
        notification.nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      }

      await notification.save();
      return false;
    }
  }

  /**
   * Admin trigger to manually retry a failed notification.
   */
  static async retryFailedNotification(notificationId: string): Promise<boolean> {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw ApiError.notFound('Notification not found');

    notification.status = NotificationStatus.PENDING;
    notification.attemptCount = 0; // reset counter for manual admin retry
    await notification.save();

    return this.processNotification(notificationId);
  }

  /**
   * Returns list of failed notifications for Admin Monitoring.
   */
  static async getFailedNotifications(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ status: NotificationStatus.FAILED })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Notification.countDocuments({ status: NotificationStatus.FAILED });
    return { notifications, total, page, limit };
  }
}
