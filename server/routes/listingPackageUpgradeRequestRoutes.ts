import { Router } from "express";
import { storage } from "server/storage";
import type { Request, Response } from "express";

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
    const result = await storage.processListingPackageUpgradeRequest(requestId, status, adminId, remarks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to process package upgrade", error });
  }
});

listingPackageUpgradeRequestRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newRequest = await storage.createListingPackageUpgradeRequest(req.body);
    res.status(201).json(newRequest);
  } catch (error) {
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
