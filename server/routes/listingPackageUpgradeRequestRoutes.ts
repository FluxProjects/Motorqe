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

    // 1️⃣ Get the original request details before processing
    const requestDetails = await storage.getListingPackageUpgradeRequest(requestId);
    if (!requestDetails) {
      return res.status(404).json({ message: `Request with id ${requestId} not found.` });
    }

    // 2️⃣ Get current active promotion BEFORE processing to capture the previous plan
    const activePromotionBefore = await storage.getListingPromotionsByListingId(requestDetails.listing_id);

    console.log("activePromotionBefore", activePromotionBefore);

    // 3️⃣ Process the request
    const { success, data } = await storage.processListingPackageUpgradeRequest(requestId, status, adminId, remarks);
    console.log("✅ processListingPackageUpgradeRequest result:", data);

    // 4️⃣ Fetch additional details for notifications if approved
    if (status === 'approved') {
      const [listing, user, newPackage] = await Promise.all([
        storage.getCarListingById(data.request.listing_id),
        storage.getUser(data.request.requested_by),
        storage.getPromotionPackage(data.request.requested_package_id)
      ]);

      // 5️⃣ Determine previous plan details using promotion BEFORE upgrade
      const currentPackage = await storage.getPromotionPackage(activePromotionBefore[0].package_id);


      console.log("currentPackage", currentPackage);

      if (!listing) {
        console.error(`❌ Listing with ID ${data.request.listing_id} not found. Aborting.`);
        return res.status(404).json({ message: `Listing with ID ${data.request.listing_id} not found.` });
      }

      if (!user) {
        console.error(`❌ User with ID ${data.request.requested_by} not found. Aborting.`);
        return res.status(404).json({ message: `User with ID ${data.request.requested_by} not found.` });
      }

      if (!currentPackage) {
      console.error(`❌ Package with ID ${activePromotionBefore.package_id} not found. Aborting.`);
      return res.status(404).json({ message: `Package with ID ${activePromotionBefore.package_id} not found` });
    }

        const oldPlanName = currentPackage.name || 'Current Package';
        const oldPlanFeatures = [
          `Duration: ${currentPackage.duration_days ?? 'N/A'} days`,
          `Refreshes: ${currentPackage.no_of_refresh ?? 'N/A'}`,
          `Featured Duration: ${currentPackage.feature_duration ?? 0} days`
        ];
        const oldPlanPrice = `$${currentPackage.price ?? 0}`;


       if (!user) {
      console.error(`❌ User with ID ${data.request.requested_by} not found. Aborting.`);
      return res.status(404).json({ message: `User with ID ${data.request.requested_by} not found` });
    }

      // 6️⃣ Send upgrade email
      await notificationService.sendPlanUpgradeEmail(
        user.email,
        {
          firstName: user.first_name || 'Customer',
          oldPlanName,
          oldPlanFeatures,
          oldPlanPrice,
          newPlanName: newPackage?.name || 'Upgraded Package',
          upgradeBenefits: [
            `Duration: ${newPackage?.duration_days} days`,
            `Refreshes: ${newPackage?.no_of_refresh}`,
            `Featured Duration: ${newPackage?.feature_duration ?? 0} days`
          ],
          newPlanPrice: `$${newPackage?.price ?? 0}`,
          priceDifference: `$${(newPackage?.price || 0) - (currentPackage?.price || 0)}`,
          effectiveDate: new Date().toLocaleDateString(),
          billingCycle: 'One-time',
          nextPaymentDate: 'N/A',
          listing
        }
      );
    }

    if (status === 'rejected') {
        const [listing, user] = await Promise.all([
          storage.getCarListingById(data.request.listing_id),
          storage.getUser(data.request.requested_by)
        ]);

        if (!listing) {
          console.error(`❌ Listing with ID ${data.request.listing_id} not found. Aborting.`);
          return res.status(404).json({ message: `Listing with ID ${data.request.listing_id} not found.` });
        }

        if (!user) {
          console.error(`❌ User with ID ${data.request.requested_by} not found. Aborting.`);
          return res.status(404).json({ message: `User with ID ${data.request.requested_by} not found.` });
        }

        const rejectionReason = remarks || 'No specific reason provided.';
        const resubmissionInstructions = 'Please review your package request and submit the required corrections for re-evaluation.';
        const listingLink = `${process.env.FRONTEND_URL}/sell-car/${listing.id}`;

        await notificationService.sendListingRejectedEmail(user.email, {
          firstName: user.first_name || 'Customer',
          listingTitle: listing.title || 'Your Listing',
          listingLink,
          rejectionReason,
          resubmissionInstructions,
          listing
        });
    }

    // 7️⃣ Return to frontend
    return res.json({
      success,
      data
    });

  } catch (error) {
    console.error('❌ Package upgrade approval error:', error);
    return res.status(500).json({ message: "Failed to process package upgrade", error: error.message });
  }
});


// POST create a new package upgrade request
listingPackageUpgradeRequestRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newRequest = await storage.createListingPackageUpgradeRequest(req.body);
    console.log("newrequest", newRequest);
    // Fetch additional details for notification
    const [listing, user, currentPackages, newPackage] = await Promise.all([
      storage.getCarListingById(newRequest.listing_id),
      storage.getUser(newRequest.requested_by),
      storage.getListingPromotionsByListingId(newRequest.listing_id),
      storage.getPromotionPackage(newRequest.requested_package_id)
    ]);

        const currentPackage = currentPackages[0];

    
    if (!user) {
      console.error(`❌ User with ID ${newRequest.requested_by} not found. Aborting.`);
      return res.status(404).json({ message: `User with ID ${newRequest.requested_by} not found` });
    }

    if (!listing) {
      console.error(`❌ Listing with ID ${newRequest.listing_id} not found. Aborting.`);
      return res.status(404).json({ message: `Listing with ID ${newRequest.listing_id} not found` });
    }

    if (!newPackage) {
      console.error(`❌ Promotion Package with ID ${newRequest.requested_package_id} not found. Aborting.`);
      return res.status(404).json({ message: `Promotion Package with ID ${newRequest.requested_package_id} not found` });
    }

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
