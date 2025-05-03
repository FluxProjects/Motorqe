import Stripe from 'stripe';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

// Create a custom type for the expanded invoice
interface StripeInvoiceWithPaymentIntent extends Stripe.Invoice {
  payment_intent: string | Stripe.PaymentIntent;
  subscription: string | Stripe.Subscription;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development', {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

export const paymentService = {
  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(userId: number, email: string, name?: string): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId: userId.toString() }
      });
      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create payment customer');
    }
  },

  /**
   * Create payment intent for one-time payments
   */
  async createPaymentIntent(
    userId: number,
    amount: number, 
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ) {
    try {
      // Convert amount to cents
      const stripeAmount = Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          ...metadata,
          userId: userId.toString(),
          transactionId: uuidv4() // Unique ID for tracking
        }
      });

      // Create transaction record in database
      await storage.createTransaction({
        userId,
        amount: amount,
        currency,
        description: metadata.description || 'One-time payment',
        paymentMethod: 'stripe',
        paymentId: paymentIntent.id,
        status: 'pending',
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          ...metadata
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  /**
   * Create subscription for a user
   */
  async createSubscription(
    userId: number,
    planId: number,
    paymentMethodId: string,
    customerId?: string
  ) {
    try {
      // Get the plan details
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) throw new Error('Subscription plan not found');

      if (!plan.stripePriceId) {
        throw new Error('Stripe price ID not configured for this plan');
      }

      // Create customer if not exists
      let stripeCustomerId = customerId;
      if (!stripeCustomerId) {
        const user = await storage.getUser(userId);
        if (!user) throw new Error('User not found');
        stripeCustomerId = await this.createCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      // Set as default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.stripePriceId }], // You'll need to store Stripe price IDs with your plans
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId.toString(),
          planId: planId.toString()
        }
      });

      const invoice = subscription.latest_invoice as StripeInvoiceWithPaymentIntent;
      // Type guard for latest_invoice
      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;

      // Create user subscription in database
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.durationDays);

  
      
      const paymentIntentId = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id;

      if (!paymentIntentId) throw new Error('Payment intent not found');

      const userSubscription = await storage.createUserSubscription({
        userId,
        planId,
        startDate,
        endDate,
        isActive: true,
        autoRenew: true,
        paymentMethod: 'stripe',
        paymentId: subscription.id
      });

      // Record transaction
      await storage.createTransaction({
        userId,
        subscriptionId: userSubscription.id,
        amount: plan.price,
        currency: plan.currency || 'usd',
        description: `Subscription for ${plan.name}`,
        paymentMethod: 'stripe',
        paymentId: subscription.id,
        status: 'completed',
        metadata: {
          stripeSubscriptionId: subscription.id,
          stripeInvoiceId: latestInvoice.id,
        }
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: (invoice.payment_intent as Stripe.PaymentIntent)?.client_secret,
        userSubscription
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  },

  /**
   * Create payment intent for listing promotion
   */
  async createListingPromotionPayment(
    userId: number,
    listingId: number,
    packageId: number
  ) {
    try {
      const promotionPackage = await storage.getPromotionPackage(packageId);
      if (!promotionPackage) throw new Error('Promotion package not found');

      const listing = await storage.getCarListingById(listingId);
      if (!listing) throw new Error('Listing not found');

      return this.createPaymentIntent(
        userId,
        promotionPackage.price,
        promotionPackage.currency || 'usd',
        {
          type: 'listing_promotion',
          listingId: listingId.toString(),
          packageId: packageId.toString(),
          description: `Promotion for listing #${listingId} (${promotionPackage.name})`
        }
      );
    } catch (error) {
      console.error('Error creating promotion payment:', error);
      throw error;
    }
  },

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(paymentIntentId: string) {
    try {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not completed');
      }

      // Update transaction status
      await storage.updateTransactionStatus(
        Number(paymentIntentId),
        'completed'
      );

      // Handle different payment types
      const metadata = paymentIntent.metadata;
      const userId = parseInt(metadata.userId || '0');

      if (metadata.type === 'listing_promotion') {
        const listingId = parseInt(metadata.listingId || '0');
        const packageId = parseInt(metadata.packageId || '0');

        if (listingId && packageId) {
          const packageData = await storage.getPromotionPackage(packageId);
          if (!packageData) return;

          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + packageData.durationDays);

          await storage.createListingPromotion({
            listingId,
            packageId,
            startDate,
            endDate,
            transactionId: Number(paymentIntentId),
            isActive: true
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling successful payment:', error);
      await storage.updateTransactionStatus(
        Number(paymentIntentId),
        'failed',
        { 
          error: error instanceof Error ? error.message : 'Payment processing failed' 
        }
      );
      throw error;
    }
  },

  /**
   * Webhook handler for Stripe events
   */
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleSuccessfulPayment(paymentIntent.id);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleSubscriptionPayment(invoice);
          break;

        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionCancellation(subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  },

  /**
   * Handle subscription payment renewal
   */
  async handleSubscriptionPayment(invoice: Stripe.Invoice) {

    const expandedInvoice = invoice as StripeInvoiceWithPaymentIntent;


  const subscriptionId = typeof expandedInvoice.subscription === 'string'
    ? expandedInvoice.subscription
    : expandedInvoice.subscription?.id;

    const paymentIntentId = typeof expandedInvoice.payment_intent === 'string' 
    ? expandedInvoice.payment_intent 
    : expandedInvoice.payment_intent?.id;
  
  if (!paymentIntentId) return;

  // Ensure subscription is available

  if (!subscriptionId) return;

  const amount = invoice.amount_paid / 100; // Convert to dollars

    // Find the user subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = parseInt(subscription.metadata.userId || '0');
    const planId = parseInt(subscription.metadata.planId || '0');

    if (!userId || !planId) return;

    // Record transaction
    await storage.createTransaction({
      userId,
      subscriptionId: Number(subscriptionId),
      amount,
      currency: invoice.currency,
      description: `Subscription renewal`,
      paymentMethod: 'stripe',
      paymentId: paymentIntentId,
      status: 'completed',
      metadata: {
        stripeInvoiceId: invoice.id
      }
    });

    // Update subscription end date
    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) return;

    const userSubscriptions = await storage.getUserSubscriptions(userId, true);
    const activeSubscription = userSubscriptions.find(sub => sub.paymentId === subscriptionId);

    if (activeSubscription) {
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + plan.durationDays);
      await storage.updateUserSubscription(activeSubscription.id, { endDate: newEndDate });
    }
  },

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCancellation(subscription: Stripe.Subscription) {
    const userId = parseInt(subscription.metadata.userId || '0');
    if (!userId) return;

    const userSubscriptions = await storage.getUserSubscriptions(userId, true);
    const activeSubscription = userSubscriptions.find(sub => sub.paymentId === subscription.id);

    if (activeSubscription) {
      await storage.cancelUserSubscription(activeSubscription.id);
    }
  },

  /**
   * Get customer payment methods
   */
  async getCustomerPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      await stripe.subscriptions.cancel(subscriptionId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }
};