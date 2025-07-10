import { Express } from "express";

import { authRoutes } from "./authRoutes";
import { carPartsRoutes } from "./carPartsRoutes";
import { carTyresRoutes } from "./carTyresRoutes";
import { listingFeatureUpgradeRequestRoutes } from "./listingFeatureUpgradeRequestRoutes";
import { listingPackageUpgradeRequestRoutes } from "./listingPackageUpgradeRequestRoutes";
import { userRoutes } from "./userRoutes";

export function registerAppRoutes(app: Express) {
    
    app.use("/api/auth", authRoutes);

    app.use("/api/car-parts", carPartsRoutes);
    app.use("/api/car-tyres", carTyresRoutes);

    app.use("/api/listing-feature-upgrade", listingFeatureUpgradeRequestRoutes)
    app.use("/api/listing-package-upgrade", listingPackageUpgradeRequestRoutes)

    app.use("/api/users", userRoutes);

    // Add others as you modularize
}
