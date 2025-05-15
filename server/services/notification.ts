import { storage } from '../storage';
import { type InsertMessage } from '@shared/schema';

class NotificationService {
  async createListingNotifications(
    listingId: number,
    userId: number,
    customerEmail: string,
    customerPhone: string
  ): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Current timestamp for sentAt
    const now = new Date();

    // Create customer email notification
    const customerEmailNotification: InsertMessage = {
      senderId: userId, // The user who triggered the notification
      receiverId: 0, // System or admin ID if applicable, or use a default
      recipientType: 'customer',
      type: 'email',
      status: 'pending',
      content: 'Your appointment has been confirmed.',
      listingId,
      sentAt: now,
    };
    await storage.createNotification(customerEmailNotification);

    // Create customer SMS notification
    const customerSmsNotification: InsertMessage = {
      senderId: userId,
      receiverId: 0, // System or admin ID if applicable, or use a default
      recipientType: 'customer',
      type: 'sms',
      status: 'pending',
      content: 'Your appointment has been confirmed.',
      listingId,
      sentAt: now,
    };
    await storage.createNotification(customerSmsNotification);

    // Create salon notifications based on preferences
    if (user.emailNotifications && user.notificationEmail) {
      const userEmailNotification: InsertMessage = {
        senderId: userId,
        receiverId: userId, // Notifying the same user
        recipientType: 'user',
        type: 'email',
        status: 'pending',
        content: 'New appointment booked.',
        listingId,
        sentAt: now,
      };
      await storage.createNotification(userEmailNotification);
    }

    if (user.smsNotifications && user.notificationPhone) {
      const userSmsNotification: InsertMessage = {
        senderId: userId,
        receiverId: userId, // Notifying the same user
        recipientType: 'user',
        type: 'sms',
        status: 'pending',
        content: 'New appointment booked.',
        listingId,
        sentAt: now,
      };
      await storage.createNotification(userSmsNotification);
    }
  }

  async processNotifications(): Promise<void> {
    const pendingNotifications = await storage.getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        if (notification.type === 'email') {
          // TODO: Implement actual email sending
          console.log('Sending email notification:', notification);
          await storage.markNotificationSent(notification.id);
        } else if (notification.type === 'sms') {
          // TODO: Implement actual SMS sending
          console.log('Sending SMS notification:', notification);
          await storage.markNotificationSent(notification.id);
        }
      } catch (error) {
        await storage.markNotificationSent(notification.id, error instanceof Error ? error.message : String(error));
      }
    }
  }

  async createUserRegistrationNotifications(
    userId: number,
    userEmail: string,
    userPhone: string | null
  ): Promise<void> {
    const now = new Date();
    
    // Welcome email notification
    const welcomeEmailNotification: InsertMessage = {
      senderId: 0, // System sender
      receiverId: userId,
      recipientType: 'user',
      type: 'email',
      status: 'pending',
      content: 'Welcome to our platform! Thank you for registering.',
      sentAt: now,
    };
    await storage.createNotification(welcomeEmailNotification);
  
    // Account verification email
    const verificationEmailNotification: InsertMessage = {
      senderId: 0, // System sender
      receiverId: userId,
      recipientType: 'user',
      type: 'email',
      status: 'pending',
      content: 'Please verify your email address to complete registration.',
      sentAt: now,
    };
    await storage.createNotification(verificationEmailNotification);
  
    // SMS welcome notification if phone number exists
    if (userPhone) {
      const welcomeSmsNotification: InsertMessage = {
        senderId: 0, // System sender
        receiverId: userId,
        recipientType: 'user',
        type: 'sms',
        status: 'pending',
        content: 'Welcome! Verify your account to get started.',
        sentAt: now,
      };
      await storage.createNotification(welcomeSmsNotification);
    }
  
    // Admin notification about new user registration
    const adminNotification: InsertMessage = {
      senderId: 0, // System sender
      receiverId: 1, // Assuming admin user ID is 1
      recipientType: 'admin',
      type: 'email',
      status: 'pending',
      content: `New user registered: ${userEmail}`,
      sentAt: now,
    };
    await storage.createNotification(adminNotification);
  }

  async sendOTP(email: string, otp: string): Promise<void> {
  // In a real app, implement your email sending logic here
  console.log(`OTP for ${email}: ${otp}`); // For development only
  }


}

export const notificationService = new NotificationService();