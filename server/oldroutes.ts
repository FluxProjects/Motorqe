import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { notificationService } from "./services/notification";
import { paymentService } from "./services/payment";
import { InsertBannerAd, InsertBlogPost, InsertHeroSlider, InsertPromotionPackage, InsertReview, InsertServicePromotionPackage, InsertShowroom, InsertStaticContent, ShowroomService } from "@shared/schema";
import { Role, roleIdMapping } from "@shared/permissions";
import multer from "multer";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { extractFiltersFromQuery } from "./services/carFilter";


export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with dummy data

  app.get("/api/get-users", async (req, res) => {
    try {
      const { search, role, status, isEmailVerified, sortBy } = req.query;

      console.log("Incoming request with filters:");
      console.log("Search:", search);
      console.log("Role:", role);
      console.log("Status:", status);
      console.log("Email Verified:", isEmailVerified);
      console.log("SortBy:", sortBy);

      // Convert role string to roleId
      let finalRole: string | undefined = undefined;
      if (typeof role === "string" && role !== "all") {
        const id = roleIdMapping[role as Role];
        if (id) finalRole = String(id);
      }

      // Convert email verification filter to boolean
      let emailVerified: boolean | undefined = undefined;
      if (typeof isEmailVerified === "string" && isEmailVerified !== "all") {
        emailVerified = isEmailVerified === "true" || isEmailVerified === "verified";
      }

      const users = await storage.getFilteredUsers({
        search: typeof search === "string" ? search : undefined,
        role: finalRole,
        status: typeof status === "string" && status !== "all" ? status : undefined,
        isEmailVerified: emailVerified,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
      });

      console.log(`Found ${users.length} users matching filters`);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * ROLES
   */
  app.get("/api/roles", async (_req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles", error });
    }
  });

  /**
 * USER ROLE SWITCH ROUTES
 */
  app.get("/api/user-role-switches/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const switches = await storage.getUserRoleSwitches(userId);
      res.json(switches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role switches", error });
    }
  });

  app.post("/api/user-role-switches", async (req, res) => {
    try {
      const switchData = req.body;
      const created = await storage.createUserRoleSwitch(switchData);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to create role switch", error });
    }
  });

  app.post("/api/user-role-switches/activate", async (req, res) => {
    try {
      const { userId, role } = req.body;
      await storage.activateUserRole(userId, role);
      res.status(200).json({ message: "Role activated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate role", error });
    }
  });

  app.post("/api/user-role-switches/deactivate", async (req, res) => {
    try {
      const { userId, role } = req.body;
      await storage.deactivateUserRole(userId, role);
      res.status(200).json({ message: "Role deactivated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate role", error });
    }
  });

  app.get("/api/user-role-switches/active/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const activeRole = await storage.getActiveUserRole(userId);
      res.json({ activeRole });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active role", error });
    }
  });

  // Showrooms
  app.get("/api/showrooms", async (_req, res) => {
    try {
      const showrooms = await storage.getAllShowrooms();
      res.json(showrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showrooms", error });
    }
  });

  app.get("/api/showroomsgarages", async (req, res) => {
    const isMainOnly = req.query.main === "true";

    try {
      const showrooms = await storage.getAllShowroomsGarages(isMainOnly);
      res.json(showrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showrooms", error });
    }
  });


  app.get("/api/garages", async (_req, res) => {
    try {
      const garages = await storage.getAllGarages();
      res.json(garages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch garages", error });
    }
  });

  app.get("/api/showrooms/service/makes", async (_req, res) => {
    try {
      const showroomsmakes = await storage.getAllShowroomsMakes();
      res.json(showroomsmakes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showrooms service makes", error });
    }
  });

  app.get("/api/showrooms/user/:userId", async (req, res) => {
    try {
      const showrooms = await storage.getShowroomsByUser(Number(req.params.userId));
      res.json(showrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user showrooms", error });
    }
  });

  app.get("/api/garages/user/:userId", async (req, res) => {
    try {
      const garages = await storage.getGaragesByUser(Number(req.params.userId));
      res.json(garages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user garages", error });
    }
  });

  app.get("/api/showrooms/:id", async (req, res) => {
    try {
      const showroom = await storage.getShowroom(Number(req.params.id));
      showroom ? res.json(showroom) : res.status(404).json({ message: "Showroom not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showroom", error });
    }
  });

  app.get("/api/garages/:id", async (req, res) => {
    try {
      const garage = await storage.getGarage(Number(req.params.id));
      garage ? res.json(garage) : res.status(404).json({ message: "Garage not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Garage", error });
    }
  });

  // Get all services for a showroom
  app.get("/api/showrooms/:id/services", async (req, res) => {
    const showroomId = Number(req.params.id);
    console.log(`Fetching services for showroom ID: ${showroomId}`);

    try {
      const services = await storage.getShowroomServicesByShowroomId(showroomId);
      console.log(`Retrieved ${services.length} services for showroom ID ${showroomId}`);
      res.json(services);
    } catch (error) {
      console.error("Failed to fetch showroom services:", error);
      res.status(500).json({ message: "Failed to fetch showroom services", error });
    }
  });

  //Get all makes/brands for a showroom
  app.get("/api/showrooms/:id/makes", async (req, res) => {
    const showroomId = Number(req.params.id);
    console.log(`Fetching makes for showroom ID: ${showroomId}`);

    try {
      const makes = await storage.getShowroomMakes(showroomId);
      console.log(`Retrieved ${makes.length} makes for showroom ID ${showroomId}`);
      res.json(makes);
    } catch (error) {
      console.error("Failed to fetch showroom makes:", error);
      res.status(500).json({ message: "Failed to fetch showroom makes", error });
    }
  });

  app.get("/api/garages/:id/makes", async (req, res) => {
    const garageId = Number(req.params.id);
    console.log(`Fetching makes for garage ID: ${garageId}`);

    try {
      const makes = await storage.getGarageMakes(garageId);
      console.log(`Retrieved ${makes.length} makes for garages ID ${garageId}`);

      if (!makes || makes.length === 0) {
        return res.status(404).json({ message: "No makes found for this garage" });
      }
      res.json(makes);
    } catch (error) {
      console.error("Failed to fetch garage makes:", error);
      res.status(500).json({ message: "Failed to fetch garage makes", error });
    }
  });

  // Get showroom car listings
  app.get("/api/showrooms/:id/cars", async (req, res) => {
    const showroomId = Number(req.params.id);
    console.log(`Fetching car listings for showroom ID: ${showroomId}`);

    try {
      const listings = await storage.getAllCarListings({ id: showroomId });
      console.log(`Retrieved ${listings.length} car listings for showroom ID ${showroomId}`);
      res.json(listings);
    } catch (error) {
      console.error("Failed to fetch showroom car listings:", error);
      res.status(500).json({ message: "Failed to fetch showroom car listings", error });
    }
  });

  // POST create showroom
  app.post("/api/showrooms", async (req, res) => {
    try {
      // Ensure user is authenticated
      const showroomData: InsertShowroom = {
        ...req.body,
        user_id: req.body.userId // Get user ID from authenticated session
      };

      const newShowroom = await storage.createShowroom(showroomData);
      res.status(201).json(newShowroom);
    } catch (error) {
      console.error("Showroom creation error:", error);
      res.status(500).json({ message: "Failed to create showroom", error });
    }
  });

  // PUT update showroom
  app.put("/api/showrooms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates: Partial<InsertShowroom> = req.body;
      const updatedShowroom = await storage.updateShowroom(Number(id), updates);

      if (!updatedShowroom) {
        return res.status(404).json({ message: "Showroom not found" });
      }

      res.json(updatedShowroom);
    } catch (error) {
      res.status(500).json({ message: "Failed to update showroom", error });
    }
  });

  // DELETE showroom
  app.delete("/api/showrooms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteShowroom(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete showroom", error });
    }
  });

  /**
   * CAR DATA
   */
  // Get all car categories
  app.get("/api/car-categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCarCategories();
      console.log("Fetched car categories from Routes:", categories);
      res.json(categories);
    } catch (error) {
      console.error("❌ Error fetching car categories from route:");
      console.error("Type:", typeof error);
      console.error("Instance:", error instanceof Error);
      console.dir(error, { depth: null });
      res.status(500).json({ message: "Failed to fetch car categories" });
    }
  });

  // Get all Car Engine Capacities
  app.get("/api/car-enginecapacities", async (_req, res) => {
    try {
      const carenginecapacities = await storage.getAllEngineCapacities();
      console.log("Fetched car carenginecapacities from Routes:", carenginecapacities);
      res.json(carenginecapacities);
    } catch (error) {
      console.error("❌ Error fetching car carenginecapacities from route:");
      console.error("Type:", typeof error);
      console.error("Instance:", error instanceof Error);
      console.dir(error, { depth: null });
      res.status(500).json({ message: "Failed to fetch car carenginecapacities" });
    }
  });

  // Get all car makes
  app.get("/api/car-makes", async (_req, res) => {
    try {
      const makes = await storage.getAllCarMakes();
      console.log("Fetched car makes from Routes:", makes);
      res.json(makes);
    } catch (error) {
      console.error("❌ Error fetching car makes from route:");
      console.error("Type:", typeof error);
      console.error("Instance:", error instanceof Error);
      console.dir(error, { depth: null });
      res.status(500).json({ message: "Failed to fetch car makes" });
    }
  });

  app.get("/api/car-models", async (req, res) => {
    try {
      const makeId = Number(req.query.makeId);
      if (!makeId) return res.status(400).json({ message: "makeId is required" });
      const data = await storage.getCarModelsByMake(makeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models", error });
    }
  });

  // ✅ Corrected make detail route
  app.get("/api/car-makes/:id", async (req, res) => {
    try {
      const makeId = Number(req.params.id);
      if (isNaN(makeId)) {
        return res.status(400).json({ error: "Invalid make ID" });
      }

      console.log(`[API] Fetching make with ID: ${makeId}`);
      const make = await storage.getCarMake(makeId); // <-- FIXED

      if (!make) {
        console.log(`[API] Make not found: ${makeId}`);
        return res.status(404).json({ error: "Make not found" });
      }

      console.log(`[API] Returning make:`, make);
      return res.json(make);
    } catch (error) {
      console.error(`[API ERROR] Failed to fetch make:`, error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fetch all models for a specific make
  app.get("/api/car-makes/:id/models", async (req, res) => {
    try {
      const makeId = Number(req.params.id);
      if (isNaN(makeId)) {
        return res.status(400).json({ error: "Invalid make ID" });
      }

      console.log(`[API] Fetching models for make ID: ${makeId}`);
      const models = await storage.getCarModelsByMake(makeId);

      return res.json(models || []);
    } catch (error) {
      console.error(`[API ERROR] Failed to fetch models:`, error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single car model
  app.get("/api/car-model/:id", async (req, res) => {
    try {
      const model = await storage.getCarModel(Number(req.params.id));
      console.log("model id to get model", model);
      if (!model) return res.status(404).json({ message: "Model not found" });
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model", error });
    }
  });

  // Car Features
  app.get("/api/car-features", async (_req, res) => {
    try {
      const features = await storage.getAllCarFeatures();
      res.json(features);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car features", error });
    }
  });

  app.post("/api/car-features", async (req, res) => {
    try {
      const newFeature = await storage.createCarFeature(req.body);
      res.status(201).json(newFeature);
    } catch (error) {
      res.status(500).json({ message: "Failed to create car feature", error });
    }
  });

  // GET all engine capacities
  app.get("/api/engine-capacities", async (_req, res) => {
    try {
      const capacities = await storage.getAllEngineCapacities();
      res.json(capacities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch engine capacities", error });
    }
  });

  // GET a single engine capacity by ID
  app.get("/api/engine-capacities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const capacity = await storage.getEngineCapacity(id);
      if (!capacity) {
        return res.status(404).json({ message: "Engine capacity not found" });
      }
      res.json(capacity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch engine capacity", error });
    }
  });

  // POST - create new engine capacity
  app.post("/api/engine-capacities", async (req, res) => {
    try {
      const newCapacity = await storage.createEngineCapacity(req.body);
      res.status(201).json(newCapacity);
    } catch (error) {
      res.status(500).json({ message: "Failed to create engine capacity", error });
    }
  });

  // PUT - update engine capacity by ID
  app.put("/api/engine-capacities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateEngineCapacity(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Engine capacity not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update engine capacity", error });
    }
  });

  // DELETE - remove engine capacity by ID
  app.delete("/api/engine-capacities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEngineCapacity(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete engine capacity", error });
    }
  });

  const filterKeys = [
    "user_id",
    "price_from",
    "price_to",
    "year_from",
    "year_to",
    "make_id",
    "model_id",
    "category_id",
    "miles_from",
    "miles_to",
    "fuel_type",
    "transmission",
    "car_engine_capacities",
    "cylinder_count",
    "condition",
    "location",
    "color",
    "interior_color",
    "tinted",
    "status",
    "is_featured",
    "is_imported",
    "is_inspected",
    "owner_type",
    "has_warranty",
    "has_insurance",
    "is_business",
    "updated_from",
    "updated_to",
    "is_active",
  ];

  // Car Listings


  app.get("/api/car-featured", async (req, res) => {
    try {
      const featuredlistings = await storage.getCarFeaturedListings(req.query);
      console.log("Fetched car featured listings from Routes:", featuredlistings);
      res.json(featuredlistings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });

  app.get('/api/listings/:id/similar', async (req, res) => {
    try {
      const listingId = req.params.id;
      // allow an optional `limit` query param, defaulting to 5
      const limit = req.query.limit
        ? Number(req.query.limit)
        : 5;

      console.log('Inside getSimilarCarListings route');
      console.log('Params:', { listingId, limit });

      const similar = await storage.getSimilarCarListings(listingId, limit);

      console.log('Similar listings result:', similar);
      res.json(similar);
    } catch (error) {
      console.error('Failed to fetch similar listings:', error);
      res
        .status(500)
        .json({ message: 'Failed to fetch similar listings', error });
    }
  });

  // Express.js route for getting car count based on filters
  app.get('/api/cars/count', async (req, res) => {
    try {
      // Get all query parameters
      const filters = req.query;

      console.log('Inside getCarCount route');
      console.log('Filters:', filters);

      // Get count from storage
      const count = await storage.searchCarsCount(filters);

      console.log('Car count result:', count);
      res.json({ count });
    } catch (error) {
      console.error('Failed to fetch car count:', error);
      res
        .status(500)
        .json({ message: 'Failed to fetch car count', error });
    }
  });

  app.get("/api/car-listings/status-counts", async (req, res) => {
    try {
      console.log("➡️ Fetching listing status counts...");
      const counts = await storage.getListingStatusCounts();
      console.log("✅ Counts fetched:", counts);
      res.json(counts);
    } catch (error) {
      console.error("❌ Error fetching listing status counts:", error);
      res.status(500).json({
        message: "Failed to fetch listing status counts",
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  app.get("/api/car-listings", async (req, res) => {
    console.log("Received request to /api/car-listings with query:", req.query);
    try {
      const filters = extractFiltersFromQuery(req.query);

      console.log("Extracted filters:", filters);

      const listings = await storage.getAllCarListings(filters);

      console.log("Retrieved listings count:", listings.length);

      res.json(listings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });

  app.post("/api/car-listings", async (req, res) => {
    try {
      console.log("👉 Received POST /api/car-listings");
      console.log("📦 Payload:", req.body);

      const {
        featureIds = [],
        package_id,
        start_date,
        end_date,
        ...listingData
      } = req.body;

      console.log("🛠 Creating car listing with data:", listingData);
      const created = await storage.createCarListing(listingData);
      console.log("✅ Listing created with ID:", created.id);

      if (featureIds.length) {
        console.log("➕ Adding features:", featureIds);
        await storage.bulkAddFeaturesToListing(created.id, featureIds);
        console.log("✅ Features added");
      }

      if (package_id && start_date && end_date) {
        console.log("📣 Fetching promotion package details for package_id:", package_id);
        const pkg = await storage.getPromotionPackage(package_id);
        if (!pkg) {
          throw new Error("Promotion package not found");
        }

        // Update listing with refresh_left and last_refresh
        await storage.updateCarListing(created.id, {
          refresh_left: pkg.no_of_refresh ?? 0,
        });
        console.log("✅ Listing updated with package refresh_left and last_refresh");

        console.log("📣 Creating promotion with:", {
          listingId: created.id,
          packageId: package_id,
          startDate: start_date,
          endDate: end_date,
        });
        await storage.createListingPromotion({
          listingId: created.id,
          packageId: package_id,
          startDate: start_date,
          endDate: end_date,
          transactionId: null,
          isActive: true,
        });
        console.log("✅ Promotion created");
      }


      const fullListing = await storage.getCarListingById(created.id);
      console.log("📤 Returning full listing");
      res.status(201).json(fullListing);
    } catch (error) {
      console.error("❌ Failed to create listing:", error);
      res.status(500).json({ message: "Failed to create listing", error });
    }
  });

  app.get("/api/car-listings/:id", async (req, res) => {
    try {

      const listingId = Number(req.params.id);

      console.log("➡️ Requested listingId:", listingId);
      const listing = await storage.getCarListingById(listingId);

      if (listing) {
        console.log("Fetched Car Listing:", listing); // ✅ log the full response

        res.json(listing);
      } else {
        console.log(`Listing with ID ${req.params.id} not found`);
        res.status(404).json({ message: "Listing not found" });
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing", error });
    }
  });

  app.put("/api/car-listings/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      console.log(`👉 Received PUT /api/car-listings/${id}`);
      console.log("📝 Payload:", req.body);

      const {
        featureIds = [],
        package_id,
        start_date,
        end_date,
        ...updates
      } = req.body;

      // Validate dates if provided
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate >= endDate) {
          throw new Error("End date must be after start date");
        }

      }

      console.log("🛠 Updating car listing:", updates);
      const updated = await storage.updateCarListing(id, updates);
      if (!updated) {
        console.warn("⚠️ Listing not found for ID:", id);
        return res.status(404).json({ message: "Listing not found" });
      }
      console.log("✅ Listing updated");

      console.log("🧹 Clearing existing features");
      await storage.clearFeaturesForListing(id);

      if (featureIds.length) {
        console.log("➕ Re-adding features:", featureIds);
        await storage.bulkAddFeaturesToListing(id, featureIds);
        console.log("✅ Features re-added");
      }

      if (package_id && start_date && end_date) {
        console.log("📣 Fetching promotion package details for package_id:", package_id);
        const pkg = await storage.getPromotionPackage(package_id);
        if (!pkg) {
          throw new Error("Promotion package not found");
        }

        // Update listing with refresh_left and last_refresh
        await storage.updateCarListing(id, {
          refresh_left: pkg.no_of_refresh ?? 0,
        });
        console.log("✅ Listing updated with package refresh_left and last_refresh");

        console.log("🔍 Checking for existing active promotions");
        const activePromotions = await storage.getActiveListingPromotions(id);
        if (activePromotions.length > 0) {
          console.log("🔄 Updating existing promotion instead of creating new one");
          const promotionToUpdate = activePromotions[0];
          await storage.updateListingPromotion(promotionToUpdate.id, {
            packageId: package_id,
            startDate: start_date,
            endDate: end_date,
          });
        } else {
          console.log("📣 Creating new promotion with:", {
            listingId: id,
            packageId: package_id,
            startDate: start_date,
            endDate: end_date,
          });
          await storage.createListingPromotion({
            listingId: id,
            packageId: package_id,
            startDate: start_date,
            endDate: end_date,
            transactionId: null,
            isActive: true,
          });
        }
        console.log("✅ Promotion updated");
      }

      const fullListing = await storage.getCarListingById(id);
      console.log("📤 Returning updated full listing");
      res.json(fullListing);
    } catch (error: any) {
      console.error("❌ Failed to update listing:", error);
      const statusCode = error.message.includes("date") ? 400 : 500;
      res.status(statusCode).json({
        message: error.message || "Failed to update listing",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  app.put('/api/car-listings/:id/refresh', async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const car = await storage.getCarListingById(carId);

      if (!car) {
        return res.status(404).json({ error: 'Car listing not found' });
      }

      const refreshLeft = parseInt(car.refresh_left ?? '0');
      if (refreshLeft <= 0) {
        return res.status(400).json({ error: 'No refreshes remaining' });
      }

      const updatedCar = await storage.updateCarListing(carId, {
        refresh_left: (refreshLeft - 1).toString(),
      });


      res.json(updatedCar);
    } catch (error) {
      console.error('Error refreshing listing:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put("/api/car-listings/:id/actions", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { action, reason, featured, package_id, refresh_left } = req.body;

      console.log("Action Recieved in route:", action);
      // Validate action
      const validActions = ['pending', 'draft', 'publish', 'active', 'approve', 'reject', 'feature', 'sold', 'delete', 'upgrade'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      // Get current listing
      const listing = await storage.getCarListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Prepare updates based on action
      let updates: any = {};

      switch (action) {
        case 'draft':
          updates.status = 'draft';
          break;
        case 'publish':
        case 'active':
        case 'approve':
          updates.status = 'active';
          break;
        case 'pending':
          updates.status = 'pending';
          break;
        case 'reject':
          updates.status = 'reject';
          break;
        case 'feature':
          updates.is_featured = featured;
          break;
        case 'sold':
          updates.status = 'sold';
          break;
        case 'delete':
          // Soft delete implementation
          updates.deleted_at = new Date();
          break;
        case 'upgrade':
          if (!package_id) {
            return res.status(400).json({ message: "package_id is required for upgrade action" });
          }

          updates.upgradePackageId = package_id;
          if (refresh_left) {
            updates.refresh_left = Number(refresh_left); // ensure it's an integer
          }
          break;
      }

      // Apply updates
      const updated = await storage.updateCarListing(id, updates);

      if (action === 'approve') {
        const user = await storage.getUser(listing.user_id); // adjust to your schema
        if (user && user.email) {
          const baseUrl = process.env.BASE_URL || "https://localhost:4000";
          await notificationService.sendListingApprovedEmail(
            user.email,
            {
              firstName: user.first_name || 'Customer',
              listingTitle: listing.title,
              listingLink: `${baseUrl}/cars/${listing.id}`,
              listing: listing // or `updated` if you want updated data
            }
          );
        }
      }

      if (action === 'reject') {
        const user = await storage.getUser(listing.user_id); // adjust based on your schema
        if (user && user.email) {
          const baseUrl = process.env.BASE_URL || "https://localhost:4000";
          await notificationService.sendListingRejectedEmail(
            user.email,
            {
              firstName: user.first_name || 'Customer',
              listingTitle: listing.title,
              reason: reason || '', // if provided in req.body
              listingLink: `${baseUrl}/sell-car/${listing.id}`,
              listing: listing // or updated if you want updated data
            }
          );
        }
      }

      res.json({
        success: true,
        listing: updated
      });

    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to perform action"
      });
    }
  });

  app.delete("/api/car-listings/:id", async (req, res) => {
    try {
      await storage.deleteCarListing(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete listing", error });
    }
  });

  // Car Listing Features
  app.get("/api/car-listings/:id/features", async (req, res) => {
    try {
      const listingId = Number(req.params.id);
      console.log(`📥 GET /api/car-listings/${listingId}/features`);

      // Get feature IDs associated with the listing
      const featureIds = await storage.getFeaturesForListing(listingId);
      console.log("🔍 Retrieved feature IDs:", featureIds);

      // Fetch details for each feature
      const featuresWithDetails = await Promise.all(
        featureIds.map(async (featureObject) => {
          console.log("➡️ Fetching details for feature ID:", featureObject.feature_id);
          const features = await storage.getCarFeature(featureObject.feature_id);

          if (features) {
            console.log("✅ Feature found:", features);
            return {
              id: features.id,
              name: features.name,
              nameAr: features.nameAr,
            };
          } else {
            console.warn("⚠️ Feature not found for ID:", featureObject.feature_id);
            return null;
          }
        })
      );

      // Filter out nulls
      const filteredFeatures = featuresWithDetails.filter((feature) => feature !== null);
      console.log("📦 Final feature list:", filteredFeatures);

      res.json(filteredFeatures);
    } catch (error) {
      console.error("❌ Error fetching listing features:", error);
      res.status(500).json({ message: "Failed to fetch listing features", error });
    }
  });


  app.post("/api/car-listings/:id/features", async (req, res) => {
    try {
      const { featureId } = req.body;
      const listingId = Number(req.params.id);
      const listingFeature = await storage.addFeatureToListing(listingId, featureId);
      res.status(201).json(listingFeature);
    } catch (error) {
      res.status(500).json({ message: "Failed to add feature to listing", error });
    }
  });

  app.delete("/api/car-listings/:listingId/features/:featureId", async (req, res) => {
    try {
      await storage.removeFeatureFromListing(
        Number(req.params.listingId),
        Number(req.params.featureId)
      );
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove feature from listing", error });
    }
  });

  /**
 * SERVICE DATA
 */

  // get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/featured", async (req, res) => {
    try {
      console.log("inside features service route");
      const services = await storage.getAllFeaturedServices();
      res.json(services);
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // get single service
  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid service ID" });

      const service = await storage.getService(id);
      if (!service) return res.status(404).json({ message: "Service not found" });

      res.json(service);
    } catch (error) {
      console.error("❌ Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });



  // Get all services for a specific make
  app.get("/api/services/makes/:id", async (req, res) => {
    const makeId = Number(req.params.id);
    console.log(`Fetching services for make ID: ${makeId}`);

    try {
      const services = await storage.getServicesByMake(makeId);
      console.log(`Retrieved ${services.length} services for make ID ${makeId}`);
      res.json(services);
    } catch (error) {
      console.error("Failed to fetch services for make:", error);
      res.status(500).json({
        message: "Failed to fetch services for make",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const newService = await storage.createService(req.body);
      res.status(201).json(newService);
    } catch (error) {
      console.error("❌ Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/service/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid service ID" });

      const updated = await storage.updateService(id, req.body);
      if (!updated) return res.status(404).json({ message: "Service not found" });

      res.json(updated);
    } catch (error) {
      console.error("❌ Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/service/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid service ID" });

      await storage.deleteService(id);
      res.status(204).send();
    } catch (error) {
      console.error("❌ Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });


  /**
* SHOWROOM SERVICE DATA
*/

  app.get("/api/showroom/services/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid service ID" });

      const service = await storage.getShowroomServiceByServiceId(id);
      if (!service) return res.status(404).json({ message: "Service not found" });
      await storage.createShowroomServiceInteraction(id, "visits");

      res.json(service);
    } catch (error) {
      console.error("❌ Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Showroom Services Listings
  app.get("/api/showroom/services", async (req, res) => {
    console.log("Received request to /api/showroom/services with query:", req.query);
    try {
      const filters: any = {};
      console.log("Initial filters object:", filters);

      // Showroom ID
      if (req.query.showroom_id) {
        console.log("Processing showroom_id filter with value:", req.query.showroom_id);
        const showroomId = parseInt(req.query.showroom_id as string, 10);
        if (!isNaN(showroomId)) {
          filters.showroom_id = showroomId;
          console.log("Added showroom_id filter:", showroomId);
        } else {
          console.log("Invalid showroom_id - not a number");
        }
      } else {
        console.log("No showroom_id filter");
      }

      // Service ID
      if (req.query.service_id) {
        console.log("Processing service_id filter with value:", req.query.service_id);
        const serviceId = parseInt(req.query.service_id as string, 10);
        if (!isNaN(serviceId)) {
          filters.service_id = serviceId;
          console.log("Added service_id filter:", serviceId);
        } else {
          console.log("Invalid service_id - not a number");
        }
      } else {
        console.log("No service_id filter");
      }

      // Price Range
      if (req.query.price_from && req.query.price_to) {
        console.log("Processing price range filter with values:", req.query.price_from, "to", req.query.price_to);
        const priceFrom = parseFloat(req.query.price_from as string);
        const priceTo = parseFloat(req.query.price_to as string);

        if (isNaN(priceFrom) || isNaN(priceTo)) {
          console.log("Invalid price filter - not a number");
          return res.status(400).json({ message: 'Invalid price filter' });
        }

        filters.price_from = priceFrom;
        filters.price_to = priceTo;
        console.log("Added price range filter:", filters.price_from, "to", filters.price_to);
      } else {
        console.log("No price range filter or incomplete range");
      }

      // Duration Range
      if (req.query.duration_from && req.query.duration_to) {
        console.log("Processing duration range filter with values:", req.query.duration_from, "to", req.query.duration_to);
        const durationFrom = parseInt(req.query.duration_from as string, 10);
        const durationTo = parseInt(req.query.duration_to as string, 10);

        if (isNaN(durationFrom) || isNaN(durationTo)) {
          console.log("Invalid duration filter - not a number");
          return res.status(400).json({ message: 'Invalid duration filter' });
        }

        filters.duration_from = durationFrom;
        filters.duration_to = durationTo;
        console.log("Added duration range filter:", filters.duration_from, "to", filters.duration_to);
      } else {
        console.log("No duration range filter or incomplete range");
      }

      // Status
      if (req.query.status && req.query.status !== "all") {
        console.log("Processing status filter with value:", req.query.status);
        filters.status = req.query.status;
        console.log("Added status filter:", req.query.status);
      } else {
        console.log("No status filter or 'all' selected");
      }

      // isActive
      if (req.query.is_active && req.query.is_active !== "all") {
        console.log("Processing is_active filter with value:", req.query.is_active);
        filters.is_active = req.query.is_active === "true";
        console.log("Added is_active filter:", filters.is_active);
      } else {
        console.log("No is_active filter");
      }

      // isFeatured
      if (req.query.is_featured) {
        console.log("Processing is_featured filter with value:", req.query.is_featured);
        filters.is_featured = req.query.is_featured === "true";
        console.log("Added is_featured filter:", filters.is_featured);
      } else {
        console.log("No is_featured filter");
      }

      // Service Type
      if (req.query.service_type && req.query.service_type !== "all") {
        console.log("Processing service_type filter with value:", req.query.service_type);
        filters.service_type = req.query.service_type;
        console.log("Added service_type filter:", req.query.service_type);
      } else {
        console.log("No service_type filter or 'all' selected");
      }

      // Status
      if (req.query.user_id && req.query.user_id !== "all") {
        console.log("Processing user_id filter with value:", req.query.user_id);
        filters.user_id = req.query.user_id;
        console.log("Added user_id filter:", req.query.user_id);
      } else {
        console.log("No user_id filter or 'all' selected");
      }

      // Search Query
      if (req.query.search) {
        console.log("Processing search filter with value:", req.query.search);
        filters.search = req.query.search;
        console.log("Added search filter:", req.query.search);
      } else {
        console.log("No search filter");
      }

      // Date Range
      if (req.query.updated_from && req.query.updated_to) {
        console.log("Processing date range filter with values:", req.query.updated_from, "to", req.query.updated_to);
        filters.updated_from = req.query.updated_from;
        filters.updated_to = req.query.updated_to;
        console.log("Added date range filter:", filters.updated_from, "to", filters.updated_to);
      } else {
        console.log("No date range filter or incomplete range");
      }

      // Sort parameters
      const sortBy = req.query.sort_by as keyof ShowroomService | undefined;

      const validSortFields = ["id", "price", "duration", "created_at"]; // example
      if (sortBy && !validSortFields.includes(sortBy)) {
        return res.status(400).json({ message: "Invalid sort_by field" });
      }


      const sortOrder = req.query.sort_order === 'desc' ? 'desc' : 'asc';

      if (filters.user_id) {
        console.log("Fetching showrooms for user_id:", filters.user_id);
        const userShowrooms = await storage.getGaragesByUser(filters.user_id);
        if (!userShowrooms || userShowrooms.length === 0) {
          console.log("No showrooms found for user_id:", filters.user_id);
          return res.json([]); // return empty result if no showrooms exist
        }

        const showroomIds = userShowrooms.map((s: any) => s.id);
        filters.showroom_ids = showroomIds;
        console.log("User's showroom IDs:", showroomIds);

        delete filters.user_id; // remove user_id to avoid confusion
      }

      console.log("Final filters object before querying storage:", filters);
      const services = await storage.getAllShowroomServices(filters, sortBy, sortOrder);

      if (Array.isArray(services)) {
        console.log("service is an array");
        // Enrich services with additional data if needed
        const enrichedServices = await Promise.all(
          services.map(async (service: any) => {
            try {
              const serviceDetails = await storage.getService(service.service_id);
              const showroomDetails = await storage.getGarage(service.showroom_id);
              console.log("service", service);
              const finalresult = {
                ...service,
                service: serviceDetails.service,
                showroom: showroomDetails,
              }
              console.log("Final result", finalresult);
              return finalresult;
            } catch (error) {
              console.error("Error enriching service data:", error);
              return service;
            }
          })
        );

        res.json(enrichedServices);
      }


    } catch (error) {
      console.error("Failed to fetch showroom services:", error);
      res.status(500).json({ message: "Failed to fetch showroom services", error });
    }
  });

  // Create Showroom Service
  app.post("/api/showroom/services", async (req, res) => {
    console.log("👉 Received POST /api/showroom/services");
    console.log("📦 Payload:", req.body);

    try {
      const {
        showroomId,
        serviceId,
        price,
        currency = 'QAR',
        description,
        descriptionAr,
        availability,
        isFeatured = false,
        isActive = true,
        status = "active",
        package_id,
        start_date,
        end_date
      } = req.body;

      // Validate required fields
      if (!showroomId || !serviceId || price === undefined) {
        console.log("❌ Missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate price is a number
      if (isNaN(parseFloat(price))) {
        console.log("❌ Invalid price value");
        return res.status(400).json({ message: "Price must be a number" });
      }

      // Validate dates if promotion package is provided
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      const packageId = package_id || 1;

      if (packageId) {
        startDate = start_date ? new Date(start_date) : new Date(); // ✅ Default to now
        endDate = end_date ? new Date(end_date) : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

        if (!endDate) {
          console.log("❌ End date is required when package_id is provided");
          return res.status(400).json({ message: "End date is required for promotions" });
        }

        if (startDate >= endDate) {
          console.log("❌ Invalid date range");
          return res.status(400).json({ message: "End date must be after start date" });
        }
      }


      console.log("🛠 Creating showroom service with data:", {
        showroomId,
        serviceId,
        price,
        currency,
        description,
        descriptionAr,
        availability,
        isFeatured,
        isActive,
        status
      });

      const newService = await storage.createShowroomService({
        showroomId,
        serviceId,
        price: parseFloat(price),
        currency,
        description,
        descriptionAr,
        availability,
        isFeatured,
        isActive
      });

      console.log("✅ Service created with ID:", newService.id);

      if (packageId && start_date && end_date) {
        console.log("📣 Creating promotion with:", {
          serviceId: newService.id,
          packageId: packageId,
          startDate: start_date,
          endDate: end_date,
        });

        await storage.createServicePromotion({
          serviceId: newService.id,
          packageId: packageId,
          startDate: start_date,
          endDate: end_date,
          transactionId: null,
          isActive: true,
        });

        console.log("✅ Promotion created");
      }

      // Fetch the full service with promotion details
      const fullService = await storage.getShowroomService(newService.id);
      console.log("📤 Returning full service");
      res.status(201).json(fullService);
    } catch (error) {
      console.error("❌ Failed to create showroom service:", error);
      res.status(500).json({
        message: "Failed to create showroom service",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Update Showroom Service
  app.put("/api/showroom/services/:id", async (req, res) => {
    const serviceId = parseInt(req.params.id, 10);
    console.log(`👉 Received PUT /api/showroom/services/${serviceId}`);
    console.log("📝 Payload:", req.body);

    if (isNaN(serviceId)) {
      console.log("❌ Invalid service ID");
      return res.status(400).json({ message: "Invalid service ID" });
    }

    try {
      const {
        package_id,
        start_date,
        end_date,
        ...updates
      } = req.body;

      // Validate dates if promotion package is provided
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate >= endDate) {
          console.log("❌ Invalid date range");
          return res.status(400).json({ message: "End date must be after start date" });
        }
      }

      // Remove fields that shouldn't be updated directly
      delete updates.id;
      delete updates.created_at;

      // Convert price to number if provided
      if (updates.price !== undefined) {
        updates.price = parseFloat(updates.price);
        if (isNaN(updates.price)) {
          console.log("❌ Invalid price value");
          return res.status(400).json({ message: "Price must be a number" });
        }
      }

      console.log("🛠 Updating showroom service:", updates);
      const updatedService = await storage.updateShowroomService(serviceId, updates);

      if (!updatedService) {
        console.log("⚠️ Service not found");
        return res.status(404).json({ message: "Service not found" });
      }
      console.log("✅ Service updated");

      if (package_id && start_date && end_date) {
        console.log("🔍 Checking for existing active promotions");
        const activePromotions = await storage.getActiveServicePromotions(serviceId);

        if (activePromotions.length > 0) {
          console.log("🔄 Updating existing promotion instead of creating new one");
          const promotionToUpdate = activePromotions[0];

          await storage.updateServicePromotion(promotionToUpdate.id, {
            packageId: package_id,
            startDate: start_date,
            endDate: end_date
          });
        } else {
          console.log("📣 Creating new promotion with:", {
            serviceId: serviceId,
            packageId: package_id,
            startDate: start_date,
            endDate: end_date,
          });

          await storage.createServicePromotion({
            serviceId: serviceId,
            packageId: package_id,
            startDate: start_date,
            endDate: end_date,
            transactionId: null,
            isActive: true,
          });
        }
        console.log("✅ Promotion updated");
      }

      // Fetch the full service with promotion details
      const fullService = await storage.getShowroomService(serviceId);
      console.log("📤 Returning full service");
      res.json(fullService);
    } catch (error: any) {
      console.error("❌ Failed to update showroom service:", error);
      const statusCode = error.message.includes("date") ? 400 : 500;
      res.status(statusCode).json({
        message: error.message || "Failed to update showroom service",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Delete Showroom Service
  app.delete("/api/showroom/services/:id", async (req, res) => {
    const serviceId = parseInt(req.params.id, 10);
    console.log(`Received request to delete showroom service ${serviceId}`);

    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    try {
      await storage.deleteShowroomService(serviceId);
      console.log("Successfully deleted service");
      res.status(204).end();
    } catch (error) {
      console.error("Failed to delete showroom service:", error);
      res.status(500).json({ message: "Failed to delete showroom service", error });
    }
  });

  // Feature/Activate/Deactivate Service (Special Actions)
  app.put("/api/showroom/services/:id/actions", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { action, reason, featured } = req.body;
      console.log(`Received ${action} request for service ${id}`);

      const validActions = ['pending', 'draft', 'publish', 'active', 'approve', 'reject', 'feature', 'delete'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      // Get current listing
      const service = await storage.getShowroomService(id);

      if (!service) {
        return res.status(404).json({ message: "Listing not found" });
      }


      let updates: any = {};

      switch (action) {
        case 'draft':
          updates.status = 'draft';
        case 'publish':
        case 'active':
        case 'approve':
          updates.status = 'active';
          break;
        case 'pending':
          updates.status = 'pending';
          break;
        case 'reject':
          updates.status = 'reject';
          break;
        case 'feature':
          updates.is_featured = 'featured';
          break;
        case 'delete':
          // Soft delete implementation
          updates.deleted_at = new Date();
          break;
      }

      const updated = await storage.updateShowroomService(id, updates);

      res.json({
        success: true,
        service: updated
      });


      console.log(`Successfully ${action}d service:`, service);

    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to perform action"
      });
    }
  });


  app.get("/api/showroom/:id/booking-stats", async (req, res) => {
    try {
      const showroomId = Number(req.params.id);
      if (isNaN(showroomId)) return res.status(400).json({ message: "Invalid showroom ID" });

      const stats = await storage.getShowroomBookingStats(showroomId);
      res.json(stats);
    } catch (error) {
      console.error("❌ Error fetching booking stats:", error);
      res.status(500).json({ message: "Failed to fetch booking stats" });
    }
  });

  app.get("/api/showroom/:id/service-interactions", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid showroom ID" });

      const stats = await storage.getShowroomServiceInteractionStats(id);
      res.json(stats);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch service interactions" });
    }
  });

  app.post("/api/showroom-makes", async (req, res) => {
    try {
      const { showroom_id, make_id } = req.body;

      if (!showroom_id || !make_id) {
        return res.status(400).json({ message: "Missing showroom_id or make_id" });
      }

      const numericShowroomId = Number(showroom_id);
      const numericMakeId = Number(make_id);

      if (isNaN(numericShowroomId) || isNaN(numericMakeId)) {
        return res.status(400).json({ message: "Invalid showroom_id or make_id" });
      }

      const result = await storage.addShowroomMake(numericShowroomId, numericMakeId);


      res.status(201).json(result);
    } catch (error) {
      console.error("❌ Error creating showroom-make entry:", error);
      res.status(500).json({ message: "Failed to create showroom-make entry" });
    }
  });



  app.get("/api/service-bookings", async (req, res) => {
    console.log("Received request to /api/service-bookings with query:", req.query);
    try {
      const filters: any = {};
      console.log("Initial filters object:", filters);

      // Showroom ID
      if (req.query.showroom_id) {
        const showroomId = parseInt(req.query.showroom_id as string, 10);
        if (!isNaN(showroomId)) {
          filters.showroom_id = showroomId;
          console.log("Added showroom_id filter:", showroomId);
        } else {
          console.log("Invalid showroom_id");
        }
      }

      // Service ID
      if (req.query.service_id) {
        const serviceId = parseInt(req.query.service_id as string, 10);
        if (!isNaN(serviceId)) {
          filters.service_id = serviceId;
          console.log("Added service_id filter:", serviceId);
        } else {
          console.log("Invalid service_id");
        }
      }

      // Customer ID 
      if (req.query.customer_id) {
        const customerId = parseInt(req.query.customer_id as string, 10);
        if (!isNaN(customerId)) {
          filters.customer_id = customerId;
          console.log("Added customer_id filter:", customerId);
        } else {
          console.log("Invalid customer_id");
        }
      }

      if (req.query.user_id) {
        const userId = parseInt(req.query.user_id as string, 10);
        if (!isNaN(userId)) {
          filters.user_id = userId;
          console.log("Added user_id filter:", userId);
        } else {
          console.log("Invalid user_id");
        }
      }

      // Status
      if (req.query.status && req.query.status !== "all") {
        filters.status = req.query.status;
        console.log("Added status filter:", req.query.status);
      }

      // Date Range (created_at)
      if (req.query.date_from && req.query.date_to) {
        filters.created_from = req.query.date_from;
        filters.created_to = req.query.date_to;
        console.log("Added date range filter:", filters.created_from, "to", filters.created_to);
      }

      // Sort Parameters
      const sortBy = req.query.sort_by as string;
      const sortOrder = req.query.sort_order === "desc" ? "desc" : "asc";

      const validSortFields = ["id", "created_at", "status"];
      if (sortBy && !validSortFields.includes(sortBy)) {
        return res.status(400).json({ message: "Invalid sort_by field" });
      }

      console.log("Final filters before query:", filters);

      const bookings = await storage.getAllServiceBookings(filters, sortBy, sortOrder);

      const enrichedBookings = await Promise.all(
        bookings.map(async (booking: any) => {
          try {
            const service = await storage.getService(booking.service_id);
            const showroom = await storage.getShowroom(booking.showroom_id);
            const customer = await storage.getUser(booking.customer_id); // Corrected
            const user = await storage.getUser(booking.user_id); // Showroom's user
            return {
              ...booking,
              service,
              showroom,
              customer,
              user,
            };
          } catch (err) {
            console.error("Error enriching booking:", err);
            return booking;
          }
        })
      );

      res.json(enrichedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings", error });
    }
  });

  app.get("/api/service-booking/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getServiceBooking(id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log("booking", booking);

      const service = await storage.getShowroomService(booking.service_id);

      if (!service) {
        return res.status(404).json({ message: "service not found" });
      }

      console.log("service", service);
      const showroom = await storage.getGarage(service.showroom_id);

      if (!showroom) {
        return res.status(404).json({ message: "Garage not found" });
      }

      const customer = await storage.getUser(booking.user_id);

      const user = await storage.getUser(showroom.user_id);

      res.json({ ...booking, service, showroom, customer, user });
    } catch (error) {
      console.error("Failed to fetch booking by ID:", error);
      res.status(500).json({ message: "Failed to fetch booking", error });
    }
  });



  app.post("/api/service-bookings", async (req, res) => {
    try {
      const {
        userId,
        showroomId,
        showroomServiceIds, // Array of service IDs
        servicePrices,      // Array of { serviceId, price, currency }
        scheduledAt,
        notes,
        totalPrice,         // Optional total for backward compatibility
        // Legacy fields (for backward compatibility)
        serviceId: legacyServiceId,
        showroomServiceId: legacyShowroomServiceId,
        price: legacyPrice,
        status: legacyStatus,
      } = req.body;

      console.log("Received service booking request:", req.body);

      // Handle multiple services booking (new format)
      if (Array.isArray(showroomServiceIds) && showroomServiceIds.length > 0) {
        // Validate that servicePrices matches showroomServiceIds
        if (!Array.isArray(servicePrices) || servicePrices.length !== showroomServiceIds.length) {
          return res.status(400).json({
            message: "servicePrices array must match showroomServiceIds length"
          });
        }

        // Create bookings for each service
        const createdBookings = await Promise.all(
          showroomServiceIds.map((serviceId, index) => {
            const servicePrice = servicePrices.find(
              sp => String(sp.serviceId) === String(serviceId)
            ) || { price: legacyPrice ?? 0, currency: '' };


            return storage.createServiceBooking({
              userId,
              serviceId,
              showroomId,
              price: servicePrice.price,
              currency: servicePrice.currency,
              scheduledAt,
              status: "pending", // Default status
              notes,
            });
          })
        );

        console.log("Created multiple service bookings:", createdBookings);
        return res.status(201).json({
          bookings: createdBookings,
          totalPrice: totalPrice || createdBookings.reduce((sum, b) => sum + b.price, 0)
        });
      }

      // Fallback to single booking (backward compatibility)
      const serviceId = legacyServiceId || legacyShowroomServiceId;
      if (!serviceId) {
        return res.status(400).json({
          message: "Either showroomServiceIds or serviceId is required"
        });
      }

      const booking = await storage.createServiceBooking({
        userId,
        serviceId,
        showroomId,
        price: legacyPrice || (servicePrices?.[0]?.price ?? 0),
        currency: servicePrices?.[0]?.currency || '',
        scheduledAt,
        status: legacyStatus || "pending",
        notes,
      });

      console.log("Created single service booking:", booking);
      return res.status(201).json(booking);
    } catch (error) {
      console.error("Failed to create service booking:", error);
      return res.status(500).json({
        message: "Failed to create service booking",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/service-bookings/:id/actions", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { action, reason, scheduledAt } = req.body;

      console.log(`[STEP 1] Received ${action} request for booking ID: ${id}`);
      console.log(`[STEP 2] Request body:`, { action, reason, scheduledAt });

      const validActions = [
        "confirm", "reschedule", "complete", "cancel", "reject", "expire"
      ];

      if (!validActions.includes(action)) {
        console.warn(`[STEP 3] Invalid action: ${action}`);
        return res.status(400).json({ message: "Invalid action" });
      }

      console.log(`[STEP 4] Fetching booking ${id}...`);
      const booking = await storage.getServiceBooking(id);

      if (!booking) {
        console.warn(`[STEP 5] Booking ${id} not found.`);
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log(`[STEP 6] Current booking data:`, booking);

      let updates: any = {};

      switch (action) {
        case "confirm":
          updates.status = "confirmed";
          break;
        case "reschedule":
          if (!scheduledAt) {
            console.warn(`[STEP 7] Missing scheduledAt for reschedule.`);
            return res.status(400).json({ message: "scheduledAt is required for rescheduling" });
          }
          updates.scheduled_at = new Date(scheduledAt);
          updates.status = "rescheduled";
          break;
        case "complete":
          updates.status = "completed";
          updates.completed_at = new Date();
          break;
        case "cancel":
          updates.status = "canceled";
          updates.cancellation_reason = reason || null;
          updates.canceled_at = new Date();
          break;
        case "reject":
          updates.status = "rejected";
          updates.rejection_reason = reason || null;
          break;
        case "expire":
          updates.status = "expired";
          updates.expired_at = new Date();
          break;
      }

      console.log(`[STEP 8] Update payload to apply:`, updates);

      const updatedBooking = await storage.updateServiceBooking(id, updates);

      console.log(`[STEP 9] Successfully updated booking:`, updatedBooking);

      res.json({
        success: true,
        booking: updatedBooking,
      });
    } catch (error: any) {
      console.error(`[ERROR] Failed to perform booking action:`, error);
      res.status(500).json({
        message: error.message || "Failed to perform booking action",
      });
    }
  });

  /**
   * FAVORITES
   */
  app.get("/api/favorites/:userId", async (req, res) => {
    const userId = Number(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId parameter" });
    }

    try {
      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites", error });
    }
  });

  app.post("/api/favorites/check", async (req, res) => {
    try {
      const listingId = req.body.listingId;
      const userId = req.body.userId;
      console.log("listingId", listingId);
      console.log("userId", userId)

      console.log("Raw body values:", req.body); // ✅

      const parsedListingId = parseInt(listingId as string, 10);
      const parsedUserId = parseInt(userId as string, 10);

      console.log("Parsed IDs:", { parsedListingId, parsedUserId }); // ✅

      if (isNaN(parsedListingId) || isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid userId or listingId parameter" });
      }

      const isFav = await storage.isFavorite({
        listingId: parsedListingId,
        userId: parsedUserId,
      });

      return res.json({ isFavorited: isFav });
    } catch (error) {
      console.error("Error checking favorite:", error);
      return res.status(500).json({ message: "Failed to check favorite" });
    }
  });





  app.post("/api/favorites", async (req, res) => {
    try {
      const fav = await storage.addFavorite(req.body);
      res.status(201).json(fav);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite", error });
    }
  });

  app.delete("/api/favorites", async (req, res) => {
    try {
      const fav = await storage.addFavorite(req.body);
      res.status(201).json(fav);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite", error });
    }
  });

  // Static Content
  app.get("/api/static-content", async (_req, res) => {
    try {
      const content = await storage.getAllStaticContents();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch static content", error });
    }
  });

  app.post("/api/static-content", async (req, res) => {
    try {
      const contentData: InsertStaticContent = req.body;
      contentData.author = req.body.user?.id; // Assuming you have authentication
      const content = await storage.createStaticContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to create static content", error });
    }
  });

  app.put("/api/static-content/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: Partial<InsertStaticContent> = req.body;
      updates.updatedAt = new Date();
      const content = await storage.updateStaticContent(id, updates);
      content
        ? res.json(content)
        : res.status(404).json({ message: "Content not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update static content", error });
    }
  });

  app.get("/api/static-content/:key", async (req, res) => {
    try {
      const content = await storage.getStaticContentByKey(req.params.key);
      content ? res.json(content) : res.status(404).json({ message: "Content not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch static content", error });
    }
  });

  app.delete("/api/static-content/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStaticContent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete static content", error });
    }
  });

  // Get all published static content
  app.get("/api/published/static-content", async (_req, res) => {
    try {
      const content = await storage.getAllPublishedStaticContents();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch published static content", error });
    }
  });

  // Get specific published static content by key
  app.get("/api/published/static-content/:key", async (req, res) => {
    try {
      const content = await storage.getPublishedStaticContentByKey(req.params.key);
      content ? res.json(content) : res.status(404).json({ message: "Published content not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch published static content", error });
    }
  });

  app.get('/api/published/static-content/placement/:placement', async (req, res) => {
    const placement = req.params.placement;
    try {
      // Example: fetching from DB
      const pages = await storage.getStaticContentByPlacement(placement);
      // Make sure pages is an array
      if (!Array.isArray(pages)) {
        throw new Error('Invalid DB response');
      }

      res.json(pages);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      res.status(500).json({
        message: 'Failed to fetch content by placement',
        error: err.message || err,
      });
    }
  });



  /**
   * MESSAGES
   */
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const messages = await storage.getMessagesByUser(userId);
      console.log("messages", messages);
      res.json(messages);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch messages", error: error.message });
    }
  });

  app.get("/api/messages/all", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all messages", error: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.sendMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message", error });
    }
  });

  app.post("/api/messages/reply", async (req, res) => {
    try {
      const { originalMessageId, content, senderId, receiverId } = req.body;

      // 1. Get the original message for reference
      const originalMessage = await storage.getMessage(originalMessageId);
      if (!originalMessage) {
        return res.status(404).json({ message: "Original message not found" });
      }

      // 2. Create the reply message
      const replyMessage = await storage.sendReply({
        content,
        sender_id: senderId,
        receiver_id: receiverId,
        type: originalMessage.type, // Keep same type as original
        status: "sent",
        parent_message_id: originalMessageId, // Track thread relationship
        created_at: new Date().toISOString(),
      });

      // 3. Optionally update original message status
      if (originalMessage.status === "unread") {
        await storage.updateMessageStatus(originalMessageId, "read");
      }

      res.status(201).json(replyMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to send reply", error });
    }
  });

  app.patch("/api/messages/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    try {
      const updatedMessage = await storage.updateMessageStatus(Number(id), status);

      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found or status unchanged" });
      }

      res.status(200).json({ message: "Message status updated", data: updatedMessage });
    } catch (error) {
      console.error("❌ Failed to update message status:", error);
      res.status(500).json({ message: "Failed to update message status", error });
    }
  });


  // Search History
  app.get("/api/search-history/:userId", async (req, res) => {
    try {
      const history = await storage.getSearchHistoryByUser(Number(req.params.userId));
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search history", error });
    }
  });

  app.post("/api/search-history", async (req, res) => {
    try {
      const newEntry = await storage.addSearchHistory(req.body);
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to add search history", error });
    }
  });

  app.delete("/api/search-history/:userId", async (req, res) => {
    try {
      await storage.clearUserSearchHistory(Number(req.params.userId));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear search history", error });
    }
  });

  /**
   * REPORTS
   */
  app.get("/api/reports", async (_req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports", error });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const report = await storage.addReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit report", error });
    }
  });

  /**
   * SETTINGS
   */
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings", error });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = await storage.updateSettings(updates);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // --- Email Config routes ---

  app.get("/api/settings/email", async (req, res) => {
    try {
      const emailConfig = await storage.getEmailConfig();
      res.json(emailConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to get email config" });
    }
  });

  app.put("/api/settings/email", async (req, res) => {
    try {
      const configUpdates = req.body;
      await storage.updateEmailConfig(configUpdates);
      res.json({ message: "Email config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update email config" });
    }
  });

  // --- SMS Config routes ---

  app.get("/api/settings/sms-config", async (req, res) => {
    try {
      const smsConfig = await storage.getSmsConfig();
      res.json(smsConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to get SMS config" });
    }
  });

  app.put("/api/settings/sms-config", async (req, res) => {
    try {
      const configUpdates = req.body;
      await storage.updateSmsConfig(configUpdates);
      res.json({ message: "SMS config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update SMS config" });
    }
  });

  // --- Google Maps Config routes ---

  app.get("/settings/google-maps-config", async (req, res) => {
    try {
      const googleMapsConfig = await storage.getGoogleMapsConfig();
      res.json(googleMapsConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to get Google Maps config" });
    }
  });

  app.put("/settings/google-maps-config", async (req, res) => {
    try {
      const configUpdates = req.body;
      await storage.updateGoogleMapsConfig(configUpdates);
      res.json({ message: "Google Maps config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update Google Maps config" });
    }
  });

  // --- Integration Config routes ---

  app.get("/settings/integrations", async (req, res) => {
    try {
      const integrations = await storage.getIntegrationConfig();
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get integrations config" });
    }
  });

  app.put("/settings/integrations", async (req, res) => {
    try {
      const integrationUpdates = req.body;
      await storage.updateIntegrationConfig(integrationUpdates);
      res.json({ message: "Integrations config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update integrations config" });
    }
  });


  /**
   * CONFIGURATION ROUTES
   */
  app.get("/api/config/email", async (_req, res) => {
    try {
      const config = await storage.getEmailConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email config", error });
    }
  });

  app.put("/api/config/email", async (req, res) => {
    try {
      await storage.updateEmailConfig(req.body);
      res.json({ message: "Email config updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update Email config", error });
    }
  });

  app.get("/api/config/sms", async (_req, res) => {
    try {
      const config = await storage.getSmsConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SMS config", error });
    }
  });

  app.put("/api/config/sms", async (req, res) => {
    try {
      await storage.updateSmsConfig(req.body);
      res.json({ message: "SMS config updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update SMS config", error });
    }
  });

  app.get("/api/config/google-maps", async (_req, res) => {
    try {
      const config = await storage.getGoogleMapsConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Google Maps config", error });
    }
  });

  app.put("/api/config/google-maps", async (req, res) => {
    try {
      await storage.updateGoogleMapsConfig(req.body);
      res.json({ message: "Google Maps config updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update Google Maps config", error });
    }
  });

  app.get("/api/config/integrations", async (_req, res) => {
    try {
      const config = await storage.getIntegrationConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Integrations config", error });
    }
  });

  app.put("/api/config/integrations", async (req, res) => {
    try {
      await storage.updateIntegrationConfig(req.body);
      res.json({ message: "Integrations config updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update Integrations config", error });
    }
  });

  /**
   * SUBSCRIPTION PLANS
   */
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly !== 'false'; // Defaults to true
      const plans = await storage.getAllSubscriptionPlans(activeOnly);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans", error });
    }
  });

  app.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlan(Number(req.params.id));
      plan ? res.json(plan) : res.status(404).json({ message: "Plan not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plan", error });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const newPlan = await storage.createSubscriptionPlan(req.body);
      res.status(201).json(newPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription plan", error });
    }
  });

  app.put("/api/subscription-plans/:id", async (req, res) => {
    try {
      const updated = await storage.updateSubscriptionPlan(Number(req.params.id), req.body);
      updated ? res.json(updated) : res.status(404).json({ message: "Plan not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription plan", error });
    }
  });

  app.delete("/api/subscription-plans/:id", async (req, res) => {
    try {
      await storage.deleteSubscriptionPlan(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription plan", error });
    }
  });

  /**
   * USER SUBSCRIPTIONS
   */
  app.get("/api/user-subscriptions/:userId", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly !== 'false'; // Defaults to true
      const subscriptions = await storage.getUserSubscriptions(Number(req.params.userId), activeOnly);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user subscriptions", error });
    }
  });

  app.get("/api/user-subscriptions/active/:userId", async (req, res) => {
    try {
      const subscription = await storage.getUserActiveSubscription(Number(req.params.userId));
      subscription ? res.json(subscription) : res.status(404).json({ message: "No active subscription found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active subscription", error });
    }
  });

  app.post("/api/user-subscriptions", async (req, res) => {
    const { userId, planId, paymentMethodId, customerId } = req.body;

    if (!userId || !planId || !paymentMethodId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {

      const result = await paymentService.createSubscription(
        userId,
        planId,
        paymentMethodId
      );

      res.status(200).json({
        message: "Subscription initiated",
        subscriptionId: result.subscriptionId,
        clientSecret: result.clientSecret,
        userSubscription: result.userSubscription
      });
    } catch (error) {
      console.error("Failed to create subscription:", error);
      res.status(500).json({ message: "Failed to create subscription", error });
    }
  });


  app.put("/api/user-subscriptions/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;

      // Optional: restrict fields that can be updated manually
      const allowedFields = ['autoRenew', 'isActive'];
      const sanitizedUpdates: Record<string, any> = {};

      for (const key of allowedFields) {
        if (updates.hasOwnProperty(key)) {
          sanitizedUpdates[key] = updates[key];
        }
      }

      const updated = await storage.updateUserSubscription(id, sanitizedUpdates);

      if (!updated) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Failed to update user subscription:", error);
      res.status(500).json({ message: "Failed to update user subscription", error });
    }
  });


  app.post("/api/user-subscriptions/:id/cancel", async (req, res) => {
    try {
      const subscriptionId = Number(req.params.id);
      const subscription = await storage.getUserSubscription(subscriptionId, true);

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // Fetch associated transaction to get Stripe subscription ID
      let paymentId: string | undefined;

      if (subscription.transactionId) {
        const transaction = await storage.getTransaction(subscription.transactionId);
        paymentId = transaction?.paymentId;
      }

      // Cancel on Stripe if paymentId is a Stripe subscription ID
      if (paymentId) {
        await paymentService.cancelSubscription(paymentId);
      }

      await storage.cancelUserSubscription(subscriptionId);
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ message: "Failed to cancel subscription", error });
    }
  });

  app.post("/api/user-subscriptions/:id/renew", async (req, res) => {
    try {
      const subscriptionId = Number(req.params.id);
      const subscription = await storage.getUserSubscription(subscriptionId, false);

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      const user = await storage.getUser(subscription.userId);
      const plan = await storage.getSubscriptionPlan(subscription.planId);

      if (!user || !plan) {
        return res.status(400).json({ message: "User or plan not found" });
      }

      const newSubscription = await paymentService.createSubscription(
        user.id,
        plan.id,
        req.body.paymentMethodId, // Or retrieve a saved method
      );

      res.status(201).json(newSubscription);
    } catch (error) {
      console.error("Renewal error:", error);
      res.status(500).json({ message: "Failed to renew subscription", error });
    }
  });



  /**
   * TRANSACTIONS
   */
  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(Number(req.params.userId));
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions", error });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(Number(req.params.id));
      transaction ? res.json(transaction) : res.status(404).json({ message: "Transaction not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction", error });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const newTransaction = await storage.createTransaction(req.body);
      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction", error });
    }
  });

  app.put("/api/transactions/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      await storage.updateTransactionStatus(Number(req.params.id), status);
      res.json({ message: "Transaction status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction status", error });
    }
  });

  /**
   * PROMOTION PACKAGES
   */
  app.get("/api/promotion-packages", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true'; // Defaults to false
      const packages = await storage.getAllPromotionPackages(activeOnly);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotion packages", error });
    }
  });

  app.get("/api/promotion-package/:packageId", async (req, res) => {
    try {
      const promotions = await storage.getPromotionPackage(Number(req.params.packageId));
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package promotions", error });
    }
  });

  app.post("/api/promotion-packages", async (req, res) => {
    try {
      const pkg: InsertPromotionPackage = req.body;
      const createdPackage = await storage.createPromotionPackage(pkg);
      res.status(201).json(createdPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to create promotion package", error });
    }
  });

  app.put("/api/promotion-packages/:packageId", async (req, res) => {
    try {
      const id = Number(req.params.packageId);
      const updates: Partial<InsertPromotionPackage> = req.body;
      const updatedPackage = await storage.updatePromotionPackage(id, updates);
      if (!updatedPackage) {
        return res.status(404).json({ message: "Promotion package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update promotion package", error });
    }
  });

  app.delete("/api/promotion-packages/:packageId", async (req, res) => {
    try {
      const id = Number(req.params.packageId);
      await storage.deletePromotionPackage(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete promotion package", error });
    }
  });

  // Service Promotion Packages

  app.get("/api/promotion-packages/services", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true'; // Defaults to true
      const packages = await storage.getAllServicePromotionPackages(activeOnly);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotion packages", error });
    }
  });

  app.get("/api/promotion-packages/service/:packageId", async (req, res) => {
    try {
      const promotions = await storage.getServicePromotionPackage(Number(req.params.packageId));
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package promotions", error });
    }
  });

  // SERVICE PROMOTION PACKAGES
  app.post("/api/promotion-packages/services", async (req, res) => {
    try {
      const pkg: InsertServicePromotionPackage = req.body;
      const createdPackage = await storage.createServicePromotionPackage(pkg);
      res.status(201).json(createdPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service promotion package", error });
    }
  });

  app.put("/api/promotion-packages/services/:packageId", async (req, res) => {
    try {
      const id = Number(req.params.packageId);
      const updates: Partial<InsertServicePromotionPackage> = req.body;
      const updatedPackage = await storage.updateServicePromotionPackage(id, updates);
      if (!updatedPackage) {
        return res.status(404).json({ message: "Service promotion package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service promotion package", error });
    }
  });

  app.delete("/api/promotion-packages/services/:packageId", async (req, res) => {
    try {
      const id = Number(req.params.packageId);
      await storage.deleteServicePromotionPackage(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service promotion package", error });
    }
  });

  // BULK OPERATIONS (OPTIONAL)
  app.get("/api/promotion-packages/bulk", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const listingPackages = await storage.getAllPromotionPackages(activeOnly);
      const servicePackages = await storage.getAllServicePromotionPackages(activeOnly);
      res.json({ listingPackages, servicePackages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotion packages", error });
    }
  });

  // ACTIVATION/DEACTIVATION (OPTIONAL)
  app.patch("/api/promotion-packages/:packageId/status", async (req, res) => {
    try {
      const id = Number(req.params.packageId);
      const { isActive } = req.body;
      const updatedPackage = await storage.updatePromotionPackage(id, { isActive });
      if (!updatedPackage) {
        return res.status(404).json({ message: "Promotion package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update promotion package status", error });
    }
  });

  app.patch("/api/promotion-packages/services/:packageId/status", async (req, res) => {
    try {
      const id = Number(req.params.packageId);
      const { isActive } = req.body;
      const updatedPackage = await storage.updateServicePromotionPackage(id, { isActive });
      if (!updatedPackage) {
        return res.status(404).json({ message: "Service promotion package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service promotion package status", error });
    }
  });

  /**
   * LISTING PROMOTIONS
   */
  app.get("/api/listing-promotions/:listingId", async (req, res) => {
    try {
      const promotions = await storage.getActiveListingPromotions(Number(req.params.listingId));
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing promotions", error });
    }
  });

  app.post("/api/listing-promotions", async (req, res) => {
    const { userId, listingId, packageId } = req.body;

    if (!userId || !listingId || !packageId) {
      return res.status(400).json({ message: "Missing userId, listingId, or packageId" });
    }

    try {

      // 1. Get promotion package details
      const promotionPackage = await storage.getPromotionPackage(packageId);
      if (!promotionPackage) {
        return res.status(404).json({ message: "Promotion package not found" });
      }
      // Initiate promotion payment (creates Stripe payment intent + pending transaction)

      // const paymentResult = await paymentService.createListingPromotionPayment(
      //   userId,
      //   listingId,
      //   packageId
      // );

      //dummy paymentid
      const paymentId = `ST${Math.floor(10000000 + Math.random() * 90000000)}`;

      const transaction = await storage.createTransaction({
        userId: userId,
        amount: promotionPackage.price,
        currency: promotionPackage.currency || "QAR",
        description: `Listing promotion (${promotionPackage.name}) for listing #${listingId}`,
        paymentMethod: "stripe",
        paymentId: paymentId,
        status: "pending",
        metadata: {
          listingId,
          packageId,
          packageName: promotionPackage.name,
          durationDays: promotionPackage.duration_days
        }
      });

      res.status(200).json({
        message: "Payment intent and transaction created",
        clientSecret: paymentId, // paymentResult.clientSecret,
        paymentIntentId: transaction.id,  // paymentResult.paymentIntentId,
        transaction
      });
    } catch (error: any) {
      console.error("Failed to initiate promotion payment:", error);
      res.status(500).json({ message: "Failed to initiate promotion payment", error: error.message });
    }
  });



  app.post("/api/listing-promotions/:id/deactivate", async (req, res) => {
    try {
      await storage.deactivateListingPromotion(Number(req.params.id));
      res.json({ message: "Promotion deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate promotion", error });
    }
  });

  app.get("/api/featured-listings", async (_req, res) => {
    try {
      const listings = await storage.getFeaturedListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured listings", error });
    }
  });

  app.get('/api/stats/overview', async (req, res) => {
    try {
      console.log("Inside Stat");
      const stats = await storage.getAllStats();
      console.log("stats", stats);
      res.json(stats);

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
    }
  });

  // Get all inspections (with optional filtering)
  app.get("/api/inspections", async (req, res) => {
    try {
      const { status } = req.query;
      const inspections = await storage.getInspections(status as string | undefined);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections", error });
    }
  });

  // Get single inspection by ID
  app.get("/api/inspections/:id", async (req, res) => {
    try {
      const inspection = await storage.getInspectionById(Number(req.params.id));
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspection", error });
    }
  });

  // Create new inspection
  app.post("/api/inspections", async (req, res) => {
    try {
      // Get user ID from session or token

      const newInspection = await storage.createInspection({
        userId: req.body.userId || '0',
        carMake: req.body.car_make || req.body.make || 'Unknown',
        carModel: req.body.car_model || req.body.model || 'Unknown',
        carYear: req.body.year ? Number(req.body.year) : new Date().getFullYear(),
        price: req.body.price ? Number(req.body.price) : 0,
        additionalNotes: req.body.notes || req.body.additional_notes || null,
        fullName: req.body.fullName || req.body.name || '',
        email: req.body.email || '',
        phone: req.body.phone || '',
        createdAt: null
      });

      res.status(201).json(newInspection);
    } catch (error) {
      console.error('Inspection creation error:', error);
      res.status(500).json({ message: "Failed to create inspection", error: error.message });
    }
  });
  // Update inspection status
  app.put("/api/inspections/:id/status", async (req, res) => {
    try {
      const updated = await storage.updateInspectionStatus(
        Number(req.params.id),
        req.body.status
      );
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inspection status", error });
    }
  });

  // Delete inspection
  app.delete("/api/inspections/:id", async (req, res) => {
    try {
      await storage.deleteInspection(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inspection", error });
    }
  });

  // Hero Sliders Routes
  app.get("/api/hero-sliders", async (_req, res) => {
    try {
      const sliders = await storage.getAllHeroSliders();
      res.json(sliders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero sliders", error });
    }
  });

  app.post("/api/hero-sliders", async (req, res) => {
    try {
      const sliderData: InsertHeroSlider = req.body;
      const slider = await storage.createHeroSlider(sliderData);
      res.status(201).json(slider);
    } catch (error) {
      res.status(500).json({ message: "Failed to create hero slider", error });
    }
  });

  app.put("/api/hero-sliders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: Partial<InsertHeroSlider> = req.body;
      updates.updated_at = new Date();
      const slider = await storage.updateHeroSlider(id, updates);
      slider
        ? res.json(slider)
        : res.status(404).json({ message: "Slider not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update hero slider", error });
    }
  });

  app.delete("/api/hero-sliders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHeroSlider(id);
      success
        ? res.status(204).send()
        : res.status(404).json({ message: "Slider not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hero slider", error });
    }
  });

  // Blog Posts Routes
  app.get("/api/blog-posts", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts", error });
    }
  });

  app.post("/api/blog-posts", async (req, res) => {
    try {
      const postData: InsertBlogPost = req.body;
      postData.authorId = req.body.user?.id; // Assuming authentication
      postData.authorName = req.body.user?.name;
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blog post", error });
    }
  });

  app.put("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: Partial<InsertBlogPost> = req.body;
      updates.updatedAt = new Date();
      const post = await storage.updateBlogPost(id, updates);
      post
        ? res.json(post)
        : res.status(404).json({ message: "Blog post not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update blog post", error });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      success
        ? res.status(204).send()
        : res.status(404).json({ message: "Blog post not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post", error });
    }
  });

  // =============================================
  // BANNER ADS ROUTES
  // =============================================

  app.get("/api/banner-ads", async (_req, res) => {
    try {
      const banners = await storage.getAllBannerAds();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banner ads", error });
    }
  });

  app.post("/api/banner-ads", async (req, res) => {
    try {

      const bannerData = req.body;
      console.log("bannerData", bannerData);
      const imageFile = req.body.imageUrl;
      console.log("imageFile", imageFile);

      if (!imageFile) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const newBanner = await storage.createBannerAd({
        title: bannerData.title,
        titleAr: bannerData.titleAr,
        imageUrl: bannerData.imageUrl,
        link: bannerData.link,
        position: bannerData.position || 'top',
        isActive: bannerData.isActive !== 'false',
        startDate: new Date(bannerData.startDate),
        endDate: new Date(bannerData.endDate),
      });

      res.status(201).json(newBanner);
    } catch (error) {
      res.status(500).json({ message: "Failed to create banner ad", error });
    }
  });

  app.put("/api/banner-ads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: Partial<InsertBannerAd> = req.body;
      const imageFile = req.body.image_url;

      // If new image uploaded, update the image URL
      if (imageFile) {
        const imageUrl = await storage.uploadBannerImage(imageFile);
        updates.imageUrl = imageUrl;
        // Optionally delete old image from storage
      }

      // Convert date strings to Date objects if present
      if (updates.startDate) updates.startDate = new Date(updates.startDate);
      if (updates.endDate) updates.endDate = new Date(updates.endDate);

      updates.updatedAt = new Date();

      const updatedBanner = await storage.updateBannerAd(id, updates);
      updatedBanner
        ? res.json(updatedBanner)
        : res.status(404).json({ message: "Banner not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update banner ad", error });
    }
  });

  app.delete("/api/banner-ads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid banner ID" });
      }

      // Check if banner exists
      const banner = await storage.getBannerAdById(id);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      // Delete banner from database
      await storage.deleteBannerAd(id);

      // Attempt to delete image (failure shouldn't block response)
      try {
        await storage.deleteBannerImage(banner.image_url);
      } catch (imageError) {
        console.warn("Banner record deleted, but image deletion failed:", imageError);
        // Consider adding to error tracking system
      }

      return res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting banner ad:", error);
      return res.status(500).json({
        message: "Failed to delete banner ad",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });


  // Set up multer for memory storage (buffer access)
  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      // Upload the file using your storage method
      const url = await storage.uploadSingleFile(file);

      res.status(200).json({ url });
    } catch (error) {
      console.error("Failed to upload image:", error);
      res.status(500).json({
        message: "Failed to upload image",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });


  // Reviews

  // Assuming you already have your Express app and storage instance initialized

  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews", error });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const review = await storage.getReviewById(id);
      review
        ? res.json(review)
        : res.status(404).json({ message: "Review not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch review", error });
    }
  });

  app.get("/api/reviews/showroom/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviews = await storage.getReviewsByShowroomId(id);

      if (reviews) {
        res.json(reviews);
      } else {
        res.status(404).json({ message: "Reviews not found for this showroom" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews", error });
    }
  });


  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData: InsertReview = req.body;// Optional: set author if available
      const newReview = await storage.createReview(reviewData);
      res.status(201).json(newReview);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review", error });
    }
  });

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: Partial<InsertReview> = req.body;
      updates.updatedAt = new Date();
      const updatedReview = await storage.updateReview(id, updates);
      updatedReview
        ? res.json(updatedReview)
        : res.status(404).json({ message: "Review not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update review", error });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReview(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review", error });
    }
  });


  app.post("/api/send-service-booking-email", async (req, res) => {
    try {
      const { customerEmail, data } = req.body;
      await notificationService.sendServiceBookingEmail(customerEmail, data);
      res.json({ message: "Customer service booking email sent successfully." });
    } catch (error) {
      console.error("Failed to send customer service booking email:", error);
      res.status(500).json({ message: "Failed to send customer service booking email", error });
    }
  });

  app.post("/api/send-booking-confirmed-email", async (req, res) => {
    try {
      const { garageEmail, data } = req.body;
      await notificationService.sendBookingConfirmedEmail(garageEmail, data);
      res.json({ message: "Garage booking confirmed email sent successfully." });
    } catch (error) {
      console.error("Failed to send garage booking confirmed email:", error);
      res.status(500).json({ message: "Failed to send garage booking confirmed email", error });
    }
  });

  app.post("/api/send-pending-approval-email", async (req, res) => {
    try {
      const { userEmail, data } = req.body;
      await notificationService.sendPendingApprovalEmail(userEmail, data);
      res.json({ message: "Pending approval email sent successfully." });
    } catch (error) {
      console.error("Failed to send pending approval email:", error);
      res.status(500).json({ message: "Failed to send pending approval email", error });
    }
  });

  app.post("/api/send-edit-request-email", async (req, res) => {
    try {
      const { userEmail, data } = req.body;
      await notificationService.sendEditRequestEmail(userEmail, data);
      res.json({ message: "Edit request email sent successfully." });
    } catch (error) {
      console.error("Failed to send edit request email:", error);
      res.status(500).json({ message: "Failed to send edit request email", error });
    }
  });

  app.post("/api/send-featured-ad-confirmation", async (req, res) => {
    try {
      const { userEmail, data } = req.body;
      await notificationService.sendFeaturedAdConfirmation(userEmail, data);
      res.json({ message: "Featured ad confirmation email sent successfully." });
    } catch (error) {
      console.error("Failed to send featured ad confirmation email:", error);
      res.status(500).json({ message: "Failed to send featured ad confirmation email", error });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}

