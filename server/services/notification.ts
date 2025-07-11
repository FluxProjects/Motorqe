import { storage } from '../storage';
import { AdminCarListing, CarListing, type InsertMessage } from '@shared/schema';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type EmailParams = {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
};


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

    for (const notifi of pendingNotifications) {
      try {
        if (notifi.type === 'email') {
          // TODO: Implement actual email sending
          console.log('Sending email notification:', notifi);

          const content = JSON.parse(notifi.content);
          if (notifi.receiverId === null) {
            throw new Error("Receiver ID is missing in the notification.");
          }
          await this.sendEmail({
            to: await this.getRecipientEmail(notifi.receiverId),
            subject: content.subject,
            template: content.template,
            context: content.context
          });
          await storage.markNotificationSent(notifi.id);
        } else if (notifi.type === 'sms') {
          // TODO: Implement actual SMS sending
          console.log('Sending SMS notification:', notifi);
          await storage.markNotificationSent(notifi.id);
        }
      } catch (error) {
        await storage.markNotificationSent(notifi.id, error instanceof Error ? error.message : String(error));
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

  

  private async sendEmail(params: EmailParams): Promise<void> {
    try {
      console.log('Creating transporter...');
      const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
          user: 'noreply@motorqe.com',
          pass: 'adminmotorqe25!@!',
        },
      });
      console.log('Transporter created');

      console.log('Loading template...');
      const templatePath = path.join(__dirname, '..', 'templates', `${params.template}.html`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      console.log('Template loaded');

      console.log('Compiling template...');
      const template = handlebars.compile(templateSource);
      const html = template(params.context);
      console.log('Template compiled');

      console.log('Preparing mail options...');
      const mailOptions = {
        from: '"Motorqe" <noreply@motorqe.com>',
        to: params.to,
        subject: params.subject,
        html: html,
      };
      console.log('Mail options prepared');

      console.log('Sending email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent. Message ID:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private async getRecipientEmail(userId: number): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return user.email;
  }

  async sendRegistrationEmail(to: string, context: {
    firstName: string;
    verificationLink: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Motorqe - Verify Your Account',
      template: 'registration-email',
      context
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, context: {
    firstName: string;
    resetLink: string;
    expiryHours: number;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context
    });
  }

  /**
   * Send plan confirmation email
   */
  async sendPlanConfirmationEmail(to: string, context: {
    firstName: string;
    planName: string;
    amount: string;
    billingCycle: string;
    features: string[];
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Plan Subscription Confirmation',
      template: 'plan-confirmation',
      context
    });
  }

  /**
   * Send pending approval notification for car listing
   */
  async sendPendingApprovalEmail(to: string, context: {
    firstName: string;
    listingTitle: string;
    submissionDate: string;
    approvalTimeframe: string;
    listing: AdminCarListing;
    additionalContext: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Listing is Under Review',
      template: 'pending-approval',
      context
    });
  }

  /**
   * Send listing approved notification
   */
  async sendListingApprovedEmail(to: string, context: {
    firstName: string;
    listingTitle: string;
    listingLink: string;
    listing: AdminCarListing;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Listing Has Been Approved!',
      template: 'listing-approved',
      context
    });
  }

  /**
   * Send listing rejected notification
   */
  async sendListingRejectedEmail(to: string, context: {
    firstName: string;
    listingTitle: string;
    listingLink: string;
    rejectionReason: string;
    resubmissionInstructions: string;
    listing: AdminCarListing;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Listing Requires Modifications',
      template: 'listing-rejected',
      context
    });
  }

  /**
   * Send edit request notification
   */
  async sendEditRequestEmail(to: string, context: {
    firstName: string;
    listingTitle: string;
    adminComments: string;
    editLink: string;
    listing: AdminCarListing;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Edit Request for Your Listing',
      template: 'edit-request',
      context
    });
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmedEmail(to: string, context: {
    firstName: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    location: string;
    contactPhone: string;
    cancellationPolicy: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Booking Confirmation',
      template: 'booking-confirmed',
      context
    });
  }

  /**
   * Send booking rejected/edited notification
   */
  async sendBookingRejectedEmail(to: string, context: {
    firstName: string;
    serviceName: string;
    rejectionReason: string;
    alternativeOptions?: string[];
    contactInfo: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Update Regarding Your Booking Request',
      template: 'booking-rejected',
      context
    });
  }

  /**
   * Send category request notification (garage service)
   */
  async sendCategoryRequestEmail(to: string, context: {
    firstName: string;
    categoryName: string;
    requestDetails: string;
    approvalTimeframe: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'New Service Category Request',
      template: 'category-request',
      context
    });
  }

  /**
   * Send service booking confirmation (garage)
   */
  async sendServiceBookingEmail(to: string, context: {
    firstName: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    garageName: string;
    garageAddress: string;
    contactPhone: string;
    preparationInstructions?: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Garage Service Booking Confirmation',
      template: 'service-booking',
      context
    });
  }

   /**
   * Send service complete confirmation (garage)
   */
  async createServiceCompletionNotifications(
    listingId: number,
    showroomOwnerId: number | null,
    customerId: number,
    customerEmail: string,
    customerPhone: string | null,
    showroomName: string,
    customerName: string,
    reviewLink: string
  ): Promise<void> {
    const now = new Date();
    console.log('Starting createServiceCompletionNotifications');

    // 1. Customer email notification
    console.log('Creating customer email notification...');
    const customerEmailNotification: InsertMessage = {
      senderId: showroomOwnerId,
      receiverId: customerId,
      recipientType: 'customer',
      type: 'email',
      status: 'active',
      content: JSON.stringify({
        subject: `How was your experience at ${showroomName}?`,
        template: 'service-review',
        context: {
          firstName: customerName,
          showroomName: showroomName,
          reviewLink: reviewLink
        }
      }),
      listingId,
      sentAt: now,
    };
    const newNotification = await storage.createNotification(customerEmailNotification);
    console.log('Customer email notification created with ID:', newNotification);

    try {

      await this.sendEmail({
        to: customerEmail,
        subject: `How was your experience at ${showroomName}?`,
        template: 'service-review',
        context: {
          firstName: customerName,
          showroomName,
          reviewLink,
        },
      });

      await storage.markNotificationSent(newNotification.id);
    } catch (error) {
      console.error(`Failed to send notification ${newNotification.id}:`, error);
      // Save the error, but don’t mark as sent
      await storage.markNotificationSent(newNotification.id, error.message || 'Unknown error');
    }

    // 2. Customer SMS notification
    if (customerPhone) {
      console.log('Creating customer SMS notification...');
      const customerSmsNotification: InsertMessage = {
        senderId: showroomOwnerId,
        receiverId: customerId,
        recipientType: 'customer',
        type: 'sms',
        status: 'active',
        content: `Thank you for choosing ${showroomName}! Rate your experience: ${reviewLink}`,
        listingId,
        sentAt: now,
      };
      await storage.createNotification(customerSmsNotification);
      console.log('Customer SMS notification created');
    } else {
      console.log('Customer phone not available. Skipping SMS notification.');
    }

    // 3. Showroom owner notifications
    console.log('Fetching showroom owner...');
    const showroomOwner = await storage.getUser(showroomOwnerId);

    if (showroomOwner) {
      console.log('Showroom owner found:', showroomOwner);

      if (showroomOwner.emailNotifications && showroomOwner.notificationEmail) {
        console.log('Creating owner email notification...');
        const ownerEmailNotification: InsertMessage = {
          senderId: customerId,
          receiverId: showroomOwnerId,
          recipientType: 'user',
          type: 'email',
          status: 'pending',
          content: JSON.stringify({
            subject: `Service completed for booking #${listingId}`,
            template: 'service-completed-owner',
            context: {
              bookingId: listingId,
              customerName: customerName
            }
          }),
          listingId,
          sentAt: now,
        };
        await storage.createNotification(ownerEmailNotification);
        console.log('Owner email notification created');

        await this.sendEmail({
          to: showroomOwner.notificationEmail,
          subject: `Service completed for booking #${listingId}`,
          template: 'service-completed-owner',
          context: {
            bookingId: listingId,
            customerName: customerName
          }
        });


      } else {
        console.log('Owner email notifications disabled or email missing');
      }

      if (showroomOwner.smsNotifications && showroomOwner.notificationPhone) {
        console.log('Creating owner SMS notification...');
        const ownerSmsNotification: InsertMessage = {
          senderId: customerId,
          receiverId: showroomOwnerId,
          recipientType: 'user',
          type: 'sms',
          status: 'active',
          content: `Service completed for booking #${listingId}`,
          listingId,
          sentAt: now,
        };
        await storage.createNotification(ownerSmsNotification);
        console.log('Owner SMS notification created');
      } else {
        console.log('Owner SMS notifications disabled or phone missing');
      }
    } else {
      console.log('Showroom owner not found. Skipping owner notifications.');
    }

    console.log('Finished createServiceCompletionNotifications');
  }

  /**
   * Send featured ad confirmation
   */
  async sendFeaturedAdConfirmation(to: string, context: {
    firstName: string;
    listingTitle: string;
    featureDuration: string;
    featureBenefits: string[];
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Ad is Now Featured!',
      template: 'feature-ad',
      context
    });
  }

  /**
   * Send plan upgrade notification
   */
  async sendPlanUpgradeEmail(to: string, context: {
    firstName: string;
    oldPlanName: string;
    oldPlanFeatures: any[];
    newPlanName: string;
    upgradeBenefits: string[];
    effectiveDate: string;
    priceDifference?: string;
    listing?: AdminCarListing;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Plan Has Been Upgraded!',
      template: 'plan-upgrade',
      context
    });
  }

  /**
   * Send plan expired notification
   */
  async sendPlanExpiredEmail(to: string, context: {
    firstName: string;
    expiredPlanName: string;
    renewalOptions: {
      planName: string;
      price: string;
      features: string[];
    }[];
    renewalDeadline: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Plan Has Expired',
      template: 'plan-expired',
      context
    });
  }

}



export const notificationService = new NotificationService();