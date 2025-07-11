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

    // Process the request first
    const result = await storage.processListingFeatureUpgradeRequest(requestId, status, adminId, remarks);

    // Fetch additional details needed for notifications
    const [requestDetails, listing, user, adminUser] = await Promise.all([
      storage.getListingFeatureUpgradeRequest(requestId),
      storage.getCarListingById(result.listing_id),
      storage.getUser(result.requested_by),
      storage.getUser(adminId)
    ]);

    // Send appropriate notifications based on status
    if (status === 'approved') {
      // Send approval notification to user
      await notificationService.sendFeaturedAdConfirmation(
        user.email,
        {
          firstName: user.first_name || 'Customer',
          listingTitle: listing.title || 'Your listing',
          featureDuration: requestDetails.duration_days ? `${requestDetails.duration_days} days` : '7 days',
          featureBenefits: [
            'Premium placement in search results',
            'Increased visibility on homepage',
            'Priority in customer recommendations'
          ]
        }
      );

      // Send admin confirmation

    } else if (status === 'rejected') {
      // Send rejection notification to user
      await notificationService.sendListingRejectedEmail(
        user.email,
        {
          firstName: user.first_name || 'Customer',
          listingTitle: listing.title || 'Your listing',
          rejectionReason: remarks || 'Does not meet our featuring requirements',
          resubmissionInstructions: 'Please review our guidelines and submit a new request if applicable',
          listing
        }
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Feature upgrade approval error:', error);
    res.status(500).json({ message: "Failed to process feature upgrade", error });
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
