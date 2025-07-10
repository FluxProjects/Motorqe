import { Router } from "express";
import { storage } from "server/storage";
import type { Request, Response } from "express";
import { notificationService } from "server/services/notification";

export const listingPackageUpgradeRequestRoutes = Router();

listingPackageUpgradeRequestRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const requests = status
      ? await storage.getListingPackageUpgradeRequests(status as string | undefined)
      : await storage.getAllListingPackageUpgradeRequest();

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch package upgrade requests",
      error: error instanceof Error ? error.message : error,
    });
  }
});

listingPackageUpgradeRequestRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const request = await storage.getListingPackageUpgradeRequest(Number(req.params.id));
    if (!request) return res.status(404).json({ message: "Package upgrade request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch package upgrade request", error });
  }
});

listingPackageUpgradeRequestRoutes.put('/:id/approve', async (req, res) => {
  try {
    const { status, remarks, adminId } = req.body;
    const requestId = Number(req.params.id);
    
    // First get the request details before processing
    const requestDetails = await storage.getListingPackageUpgradeRequest(requestId);
    
    // Process the request
    const result = await storage.processListingPackageUpgradeRequest(requestId, status, adminId, remarks);
    
    // Fetch additional details needed for notifications
    const [listing, user, currentPackage, newPackage] = await Promise.all([
      storage.getCarListingById(result.listing_id),
      storage.getUser(result.requested_by),
      storage.getListingPromotionsByListingId(result.listing_id),
      storage.getPromotionPackage(requestDetails.requested_package_id)
    ]);
    
    // Rest of your notification code...
    if (status === 'approved') {
      await notificationService.sendPlanUpgradeEmail(
        user.email,
        {
          firstName: user.first_name || 'Customer',
          oldPlanName: currentPackage?.name || 'Current Package',
          newPlanName: newPackage?.name || 'Upgraded Package',
          upgradeBenefits: [
            `Duration: ${newPackage?.duration_days} days (was ${currentPackage?.duration_days})`,
            `Refreshes: ${newPackage?.no_of_refresh} (was ${currentPackage?.no_of_refresh})`,
            `Featured Duration: ${newPackage?.feature_duration} days (was ${currentPackage?.feature_duration || 0})`
          ],
          effectiveDate: new Date().toLocaleDateString(),
          priceDifference: `$${(newPackage?.price || 0) - (currentPackage?.price || 0)}`,
          listing: listing
        }
      );
      // ... rest of the approval code
    }

    res.json(result);

  } catch (error) {
    console.error('Package upgrade approval error:', error);
    res.status(500).json({ message: "Failed to process package upgrade", error });
  }
});

// POST create a new package upgrade request
listingPackageUpgradeRequestRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newRequest = await storage.createListingPackageUpgradeRequest(req.body);
    
    // Fetch additional details for notification
    const [listing, user, currentPackage, newPackage] = await Promise.all([
      storage.getCarListingById(newRequest.listing_id),
      storage.getUser(newRequest.user_id),
      storage.getListingPromotionsByListingId(newRequest.listing_id),
      storage.getPromotionPackage(newRequest.requested_package_id)
    ]);
    
    // Send confirmation to user
    await notificationService.sendPendingApprovalEmail(
      user.email,
      {
        firstName: user.first_name || 'Customer',
        listingTitle: listing.title || 'Your listing',
        approvalTimeframe: 'Our team will review your upgrade request within 2 business days',
        listing: listing,
        additionalContext: `You requested to upgrade from ${currentPackage.name} to ${newPackage.name}`
      }
    );
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Package upgrade request error:', error);
    res.status(500).json({ message: "Failed to create package upgrade request", error });
  }
});

listingPackageUpgradeRequestRoutes.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedRequest = await storage.updateListingPackageUpgradeRequest(Number(req.params.id), req.body);
    if (!updatedRequest) return res.status(404).json({ message: "Package upgrade request not found" });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: "Failed to update package upgrade request", error });
  }
});

listingPackageUpgradeRequestRoutes.delete("/:id", async (req: Request, res: Response) => {
  try {
    await storage.deleteListingPackageUpgradeRequest(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete package upgrade request", error });
  }
});
