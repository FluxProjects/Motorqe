import { Router } from "express";
import { storage } from "server/storage";
import type { Request, Response } from "express";

export const carTyresRoutes = Router();

  carTyresRoutes.get("/api/car-tyres", async (_req: Request, res: Response) => {
    try {
      const tyres = await storage.getAllCarTyres();
      res.json(tyres);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car tyres", error });
    }
  });

  carTyresRoutes.get("/api/car-tyres/:id", async (req: Request, res: Response) => {
    try {
      const tyre = await storage.getCarTyre(Number(req.params.id));
      if (!tyre) {
        return res.status(404).json({ message: "Car tyre not found" });
      }
      res.json(tyre);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car tyre", error });
    }
  });

  carTyresRoutes.post("/api/car-tyres", async (req: Request, res: Response) => {
    try {
      const newTyre = await storage.createCarTyre(req.body);
      res.status(201).json(newTyre);
    } catch (error) {
      res.status(500).json({ message: "Failed to create car tyre", error });
    }
  });

  carTyresRoutes.put("/api/car-tyres/:id", async (req: Request, res: Response) => {
    try {
      const updatedTyre = await storage.updateCarTyre(Number(req.params.id), req.body);
      if (!updatedTyre) {
        return res.status(404).json({ message: "Car tyre not found" });
      }
      res.json(updatedTyre);
    } catch (error) {
      res.status(500).json({ message: "Failed to update car tyre", error });
    }
  });

  carTyresRoutes.delete("/api/car-tyres/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteCarTyre(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete car tyre", error });
    }
  });
