import { Router } from "express";
import { storage } from "../storage";
import type { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../services/auth";

export const userRoutes = Router();

userRoutes.get("/:id", async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;

        // Check if it's a comma-separated list of IDs
        const idList = idParam.split(",").map(id => Number(id.trim())).filter(Boolean);

        if (idList.length > 1) {
            // Batch fetch
            const users = await Promise.all(idList.map(id => storage.getUser(id)));
            const filteredUsers = users.filter(Boolean); // Remove nulls (not found)
            res.json(filteredUsers);
        } else {
            // Single user fetch (original behavior)
            const id = Number(idParam);
            const user = await storage.getUser(id);
            user ? res.json(user) : res.status(404).json({ message: "User not found" });
        }

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user(s)", error });
    }
});

userRoutes.get("/username/:username", async (req: Request, res: Response) => {
    try {
        const user = await storage.getUserByUsername(req.params.username);
        user ? res.json(user) : res.status(404).json({ message: "User not found" });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user", error });
    }
});

userRoutes.post("/", async (req: Request, res: Response) => {
    try {
        const newUser = await storage.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: "Failed to create user", error });
    }
});

userRoutes.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await storage.updateUser(Number(req.params.id), req.body);
        updated ? res.json(updated) : res.status(404).json({ message: "User not found" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error });
    }
});

userRoutes.put("/:id/password", async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = Number(req.params.id);

        // Verify current password first
        const user = await storage.getUserWithPassword(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Update password
        const hashedPassword = await hashPassword(newPassword);
        const updated = await storage.updateUserPassword(userId, hashedPassword);

        if (updated) {
            res.json({ success: true });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({
            message: "Failed to update password",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

userRoutes.put("/:id/actions", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { action, reason, role } = req.body;

        console.log("Action received:", action);

        // Define valid actions
        const validActions = ['ban', 'delete', 'promote'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        // Fetch user
        const user = await storage.getUser(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare updates
        const updates: any = {};

        switch (action) {
            case 'ban':
                updates.status = 'suspended';
                updates.suspension_reason = reason || null;
                break;

            case 'delete':
                updates.status = 'removed';
                updates.deleted_at = new Date();
                break;

            case 'promote':
                if (!role) {
                    return res.status(400).json({ message: "Role required for promotion" });
                }
                updates.role = role;
                updates.status = 'active';
                break;
        }

        // Apply updates
        const updated = await storage.updateUser(id, updates);

        res.json({
            success: true,
            user: updated,
        });

    } catch (error: any) {
        res.status(500).json({
            message: error.message || "Failed to perform action",
        });
    }
});

userRoutes.delete("/:id", async (req: Request, res: Response) => {
    try {
        await storage.deleteUser(Number(req.params.id));
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error });
    }
});

