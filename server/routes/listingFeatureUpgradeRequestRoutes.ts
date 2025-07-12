import { Router } from "express";
import { storage } from "server/storage";
import type { Request, Response } from "express";
import { notificationService } from "server/services/notification";

export const listingFeatureUpgradeRequestRoutes = Router();

// GET all feature upgrade requests
listingFeatureUpgradeRequestRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const requests = status
      ? await storage.getListingFeatureUpgradeRequests(status as string | undefined)
      : await storage.getAllListingFeatureUpgradeRequests();

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch feature upgrade requests",
      error: error instanceof Error ? error.message : error,
    });
  }
});


// GET a single feature upgrade request by ID
listingFeatureUpgradeRequestRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const request = await storage.getListingFeatureUpgradeRequest(Number(req.params.id));
    if (!request) return res.status(404).json({ message: "Feature upgrade request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feature upgrade request", error });
  }
});

listingFeatureUpgradeRequestRoutes.put('/:id/approve', async (req, res) => {
  try {
    const { status, remarks, adminId } = req.body;
    const requestId = Number(req.params.id);

    // 1️⃣ Get the original request details before processing
    const requestDetails = await storage.getListingFeatureUpgradeRequest(requestId);
    if (!requestDetails) {
      return res.status(404).json({ message: `Feature upgrade request with id ${requestId} not found.` });
    }

    // 2️⃣ Get current active feature BEFORE processing
    const activeFeatureBefore = await storage.getListingPromotionsByListingId(requestDetails.listing_id);

    console.log("activeFeatureBefore", activeFeatureBefore);

    // 3️⃣ Process the request
    const { success, data } = await storage.processListingFeatureUpgradeRequest(requestId, status, adminId, remarks);
    console.log("✅ processListingFeatureUpgradeRequest result:", data);

    // 4️⃣ If approved, fetch additional details for notifications
    if (status === 'approved') {
      const [listing, user] = await Promise.all([
        storage.getCarListingById(data.request.listing_id),
        storage.getUser(data.request.requested_by),
      ]);

      if (!listing) {
        console.error(`❌ Listing with ID ${data.request.listing_id} not found. Aborting.`);
        return res.status(404).json({ message: `Listing with ID ${data.request.listing_id} not found.` });
      }

      if (!user) {
        console.error(`❌ User with ID ${data.request.requested_by} not found. Aborting.`);
        return res.status(404).json({ message: `User with ID ${data.request.requested_by} not found.` });
      }

      const currentFeature = activeFeatureBefore[0] ?? null;

      const oldFeatureDetails = currentFeature
        ? [
            `Duration: ${currentFeature.duration_days ?? 'N/A'} days`,
            `Price Paid: $${currentFeature.price ?? 'N/A'}`,
            `Featured Until: ${currentFeature.featured_until ? new Date(currentFeature.featured_until).toLocaleDateString() : 'N/A'}`,
          ]
        : ['No active featured plan'];

      const upgradeBenefits = [
        `Duration: ${requestDetails.duration_days ?? 'N/A'} days`,
        `Price: $${requestDetails.price ?? 'N/A'}`,
        `Featured Benefits: Premium placement, increased visibility, priority recommendations`,
      ];

      const priceDifference = currentFeature
        ? `$${(requestDetails.price ?? 0) - (currentFeature.price ?? 0)}`
        : `$${requestDetails.price ?? 0}`;

      // 5️⃣ Send feature upgrade confirmation email
      await notificationService.sendFeaturedAdConfirmation(user.email, {
        firstName: user.first_name || 'Customer',
        listingTitle: listing.title || 'Your listing',
        oldFeatureDetails,
        featureBenefits: upgradeBenefits,
        priceDifference,
        effectiveDate: new Date().toLocaleDateString(),
        billingCycle: 'One-time',
        nextPaymentDate: 'N/A',
        listing,
      });
    }

    // 6️⃣ If rejected, send rejection email
    if (status === 'rejected') {
      const [listing, user] = await Promise.all([
        storage.getCarListingById(data.request.listing_id),
        storage.getUser(data.request.requested_by),
      ]);

      if (!listing) {
        console.error(`❌ Listing with ID ${data.request.listing_id} not found. Aborting.`);
        return res.status(404).json({ message: `Listing with ID ${data.request.listing_id} not found.` });
      }

      if (!user) {
        console.error(`❌ User with ID ${data.request.requested_by} not found. Aborting.`);
        return res.status(404).json({ message: `User with ID ${data.request.requested_by} not found.` });
      }

      const rejectionReason = remarks || 'Does not meet our featuring requirements.';
      const resubmissionInstructions = 'Please review our guidelines and submit a new request if applicable.';
      const listingLink = `${process.env.FRONTEND_URL}/listings/${listing.id}`;

      await notificationService.sendListingRejectedEmail(user.email, {
        firstName: user.first_name || 'Customer',
        listingTitle: listing.title || 'Your listing',
        listingLink,
        rejectionReason,
        resubmissionInstructions,
        listing,
      });
    }

    // 7️⃣ Respond to frontend
    return res.json({
      success,
      data,
    });
  } catch (error) {
    console.error('❌ Feature upgrade approval error:', error);
    return res.status(500).json({ message: "Failed to process feature upgrade", error: error.message });
  }
});


// POST create a new feature upgrade request
listingFeatureUpgradeRequestRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newRequest = await storage.createListingFeatureUpgradeRequest(req.body);

    // Fetch additional details for notification
    const [listing, user] = await Promise.all([
      storage.getCarListingById(newRequest.listing_id),
      storage.getUser(newRequest.requested_by)
    ]);

    if (!listing) {
      throw new Error(`Listing with ID ${newRequest.listing_id} not found`);
    }

    if (!user) {
      throw new Error(`User with ID ${newRequest.requested_by} not found`);
    }


    // Send confirmation to user
    await notificationService.sendPendingApprovalEmail(
      user.email,
      {
        firstName: user.first_name || 'Customer',
        listingTitle: listing.title || 'Your listing',
        approvalTimeframe: 'Our team will review your request within 2 business days',
        submissionDate: listing.created_at.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
        }),
        listing, // pass full object
        additionalContext: ''
      }
    );

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Feature upgrade request error:', error);
    res.status(500).json({ message: "Failed to create feature upgrade request", error });
  }
});

// PUT update a feature upgrade request
listingFeatureUpgradeRequestRoutes.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedRequest = await storage.updateListingFeatureUpgradeRequest(Number(req.params.id), req.body);
    if (!updatedRequest) return res.status(404).json({ message: "Feature upgrade request not found" });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: "Failed to update feature upgrade request", error });
  }
});

// DELETE a feature upgrade request
listingFeatureUpgradeRequestRoutes.delete("/:id", async (req: Request, res: Response) => {
  try {
    await storage.deleteListingFeatureUpgradeRequest(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete feature upgrade request", error });
  }
});
