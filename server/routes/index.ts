import { Express } from "express";
import { authRoutes } from "./authroutes";
import { userRoutes } from "./userRoutes";
import { carPartsRoutes } from "./carPartsRoutes";
import { carTyresRoutes } from "./carTyresRoutes";

export function registerAppRoutes(app: Express) {
    
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);

    app.use("/api/car-parts", carPartsRoutes);
    app.use("/api/car-tyres", carTyresRoutes);

    // Add others as you modularize
}
