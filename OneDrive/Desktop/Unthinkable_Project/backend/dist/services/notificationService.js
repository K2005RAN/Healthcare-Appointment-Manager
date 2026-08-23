"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = require("../models/Notification");
const emailService_1 = require("../integrations/emailService");
const apiError_1 = require("../utils/apiError");
class NotificationService {
    /**
     * Queue a notification record and execute dispatch.
     */
    static async sendNotification(data) {
        const notification = await Notification_1.Notification.create({
            userId: data.userId,
            appointmentId: data.appointmentId,
            type: data.type,
            channel: 'EMAIL',
            recipient: data.recipient,
            subject: data.subject,
            body: data.body,
            status: Notification_1.NotificationStatus.PENDING,
            attemptCount: 0,
        });
        // Execute immediately
        this.processNotification(notification._id.toString());
        return notification;
    }
    /**
     * Process and send notification with exponential backoff retry handling.
     */
    static async processNotification(notificationId) {
        const notification = await Notification_1.Notification.findById(notificationId);
        if (!notification)
            return false;
        notification.status = Notification_1.NotificationStatus.PROCESSING;
        notification.attemptCount += 1;
        notification.lastAttemptAt = new Date();
        await notification.save();
        try {
            await emailService_1.EmailService.sendEmail({
                to: notification.recipient,
                subject: notification.subject,
                html: notification.body,
            });
            notification.status = Notification_1.NotificationStatus.SENT;
            notification.nextRetryAt = undefined;
            notification.error = undefined;
            await notification.save();
            return true;
        }
        catch (error) {
            console.error(`[Notification Process Failed] ID: ${notificationId}, Attempt: ${notification.attemptCount}`, error.message);
            const maxRetries = 4;
            if (notification.attemptCount >= maxRetries) {
                notification.status = Notification_1.NotificationStatus.FAILED;
                notification.error = `Max retries (${maxRetries}) exceeded: ${error.message}`;
                notification.nextRetryAt = undefined;
            }
            else {
                notification.status = Notification_1.NotificationStatus.PENDING;
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
    static async retryFailedNotification(notificationId) {
        const notification = await Notification_1.Notification.findById(notificationId);
        if (!notification)
            throw apiError_1.ApiError.notFound('Notification not found');
        notification.status = Notification_1.NotificationStatus.PENDING;
        notification.attemptCount = 0; // reset counter for manual admin retry
        await notification.save();
        return this.processNotification(notificationId);
    }
    /**
     * Returns list of failed notifications for Admin Monitoring.
     */
    static async getFailedNotifications(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const notifications = await Notification_1.Notification.find({ status: Notification_1.NotificationStatus.FAILED })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email');
        const total = await Notification_1.Notification.countDocuments({ status: Notification_1.NotificationStatus.FAILED });
        return { notifications, total, page, limit };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map