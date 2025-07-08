import { Router } from "express";
import { storage } from "server/storage";
import type { Request, Response } from "express";

export const carPartsRoutes = Router();

carPartsRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const parts = await storage.getAllCarParts();
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car parts", error });
  }
});

carPartsRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const part = await storage.getCarPart(Number(req.params.id));
    if (!part) return res.status(404).json({ message: "Car part not found" });
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car part", error });
  }
});

carPartsRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newPart = await storage.createCarPart(req.body);
    res.status(201).json(newPart);
  } catch (error) {
    res.status(500).json({ message: "Failed to create car part", error });
  }
});

carPartsRoutes.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedPart = await storage.updateCarPart(Number(req.params.id), req.body);
    if (!updatedPart) return res.status(404).json({ message: "Car part not found" });
    res.json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update car part", error });
  }
});

carPartsRoutes.delete("/:id", async (req: Request, res: Response) => {
  try {
    await storage.deleteCarPart(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car part", error });
  }
});
