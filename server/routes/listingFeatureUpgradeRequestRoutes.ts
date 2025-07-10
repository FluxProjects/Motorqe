import { Router } from "express";
import { storage } from "server/storage";
import type { Request, Response } from "express";

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
    const result = await storage.processListingFeatureUpgradeRequest(requestId, status, adminId, remarks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to process feature upgrade", error });
  }
});

// POST create a new feature upgrade request
listingFeatureUpgradeRequestRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newRequest = await storage.createListingFeatureUpgradeRequest(req.body);
    res.status(201).json(newRequest);
  } catch (error) {
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
