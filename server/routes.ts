import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { notificationService } from "./services/notification";
import { paymentService } from "./services/payment";
import { loginUser, registerUser } from "./services/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with dummy data

  /**
   * AUTHENTICATION ROUTES
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      console.log("Req:", req);
      console.log("Cookies:", req.cookies);
      console.log("Authorization header:", req.headers.authorization);

      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      console.log("Token used for verification:", token);

      if (!token) {
        return res.status(200).json(null);
      }

      const user = await verifyToken(token);
      console.log("User after verifyToken:", user);

      if (!user) {
        return res.status(200).json(null);
      }

      res.cookie('token', token, {
        httpOnly: true,
        secure: false, //process.env.NODE_ENV === 'production', // Enable secure cookie in production
        sameSite: 'strict', // Adjust as needed
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json(user);
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Failed to authenticate", error });
    }
  });


  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request recieved from", email);
    try {
      const { token, user } = await loginUser(email, password);
      res.json({ token, user });
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  })

  app.post("/api/auth/register", async (req, res) => {
    const { firstName, lastName, username, email, password, confirmPassword, role, termsAgreement } = req.body;
    console.log("Registration request received from", email);

    // Basic validation (you can add more as needed)
    if (!email || !password || !confirmPassword || !termsAgreement) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
      // You should add your own user validation logic here (e.g., check if email or username already exists)
      const { token, user } = await registerUser({
        firstName,
        lastName,
        username,
        email,
        password,
        role,
      });

      res.status(201).json({ token, user });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(500).json({ message: err.message || "An unexpected error occurred" });
    }
  });


  app.post("/api/auth/logout", async (_req: Request, res: Response) => {
    try {
      // Clear auth cookie
      res.clearCookie('token');
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed", error });
    }
  });

  /**
   * USER ROUTES
   */
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      user ? res.json(user) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  app.get("/api/get-users", async (req, res) => {
    try {
      const { search, role, status, sortBy } = req.query;

      console.log("Incoming request with filters:");
      console.log("Search:", search);
      console.log("Role:", role);
      console.log("Status:", status);
      console.log("SortBy:", sortBy);

      // Assuming you have a function like this in your storage layer:
      const users = await storage.getFilteredUsers({
        search: search as string,
        role: role as string,
        status: status as string,
        sortBy: sortBy as string,
      });

      console.log("Filtered users:", users);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });




  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      user ? res.json(user) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const newUser = await storage.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user", error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updated = await storage.updateUser(Number(req.params.id), req.body);
      updated ? res.json(updated) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
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

  app.get("/api/showrooms/user/:userId", async (req, res) => {
    try {
      const showrooms = await storage.getShowroomsByUser(Number(req.params.userId));
      res.json(showrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user showrooms", error });
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

  // In your backend route handler
  app.get("/api/car-makes/:id", async (req, res) => {
    try {
      const makeId = Number(req.params.id);
      if (isNaN(makeId)) {
        return res.status(400).json({ error: "Invalid make ID" });
      }

      console.log(`[API] Fetching make with ID: ${makeId}`);
      const make = await storage.getCarModel(makeId);

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

  // Get single car model
  app.get("/api/car-models/:id", async (req, res) => {
    try {
      const model = await storage.getCarModel(Number(req.params.id));
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

  app.get("/api/car-listings", async (req, res) => {
    try {
      const filters: any = {};

      if (req.query.make) {
        const makeId = parseInt(req.query.make as string, 10);
        if (!isNaN(makeId)) filters.make_id = makeId;
      }

      // Repeat as needed for other filterable fields (e.g., category, status)
      if (req.query.category) {
        const catId = parseInt(req.query.category as string, 10);
        if (!isNaN(catId)) filters.category_id = catId;
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const listings = await storage.getAllCarListings(filters);
      res.json(listings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);  // Add logging
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });


  app.get("/api/car-featured", async (req, res) => {
    try {
      const featuredlistings = await storage.getCarFeaturedListings(req.query);
      console.log("Fetched car featured listings from Routes:", featuredlistings);
      res.json(featuredlistings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });

  app.get("/api/car-listings/:id", async (req, res) => {
    try {
      const listing = await storage.getCarListingById(Number(req.params.id));
      listing ? res.json(listing) : res.status(404).json({ message: "Listing not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing", error });
    }
  });

  app.post("/api/car-listings", async (req, res) => {
    try {
      const created = await storage.createCarListing(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to create listing", error });
    }
  });

  app.put("/api/car-listings/:id", async (req, res) => {
    try {
      const updated = await storage.updateCarListing(Number(req.params.id), req.body);
      updated ? res.json(updated) : res.status(404).json({ message: "Listing not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update listing", error });
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
      const features = await storage.getFeaturesForListing(Number(req.params.id));
      res.json(features);
    } catch (error) {
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
app.get("/api/services", async (_req, res) => {
  try {
    const services = await storage.getAllServices();
    res.json(services);
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

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

app.post("/api/services", async (req, res) => {
  try {
    const newService = await storage.createService(req.body);
    res.status(201).json(newService);
  } catch (error) {
    console.error("❌ Error creating service:", error);
    res.status(500).json({ message: "Failed to create service" });
  }
});

app.put("/api/services/:id", async (req, res) => {
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

app.delete("/api/services/:id", async (req, res) => {
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
   * FAVORITES
   */
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(Number(req.params.userId));
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites", error });
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
      const { userId, listingId } = req.body;
      if (!userId || !listingId) return res.status(400).json({ message: "userId and listingId are required" });
      await storage.removeFavorite(userId, listingId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite", error });
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

  app.get("/api/static-content/:key", async (req, res) => {
    try {
      const content = await storage.getStaticContentByKey(req.params.key);
      content ? res.json(content) : res.status(404).json({ message: "Content not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch static content", error });
    }
  });

  /**
   * MESSAGES
   */
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(Number(req.params.userId));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error });
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
      const { key, value } = req.body;
      if (!key || value === undefined) return res.status(400).json({ message: "key and value required" });
      const updated = await storage.updateSettings(key, value);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting", error });
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
    try {
      const newSubscription = await storage.createUserSubscription(req.body);
      res.status(201).json(newSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user subscription", error });
    }
  });

  app.put("/api/user-subscriptions/:id", async (req, res) => {
    try {
      const updated = await storage.updateUserSubscription(Number(req.params.id), req.body);
      updated ? res.json(updated) : res.status(404).json({ message: "Subscription not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user subscription", error });
    }
  });

  app.post("/api/user-subscriptions/:id/cancel", async (req, res) => {
    try {
      await storage.cancelUserSubscription(Number(req.params.id));
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel subscription", error });
    }
  });

  app.post("/api/user-subscriptions/:id/renew", async (req, res) => {
    try {
      const renewed = await storage.renewUserSubscription(Number(req.params.id));
      res.json(renewed);
    } catch (error) {
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
      const activeOnly = req.query.activeOnly !== 'false'; // Defaults to true
      const packages = await storage.getAllPromotionPackages(activeOnly);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotion packages", error });
    }
  });

  // ... (add similar CRUD routes for promotion packages like we did for subscription plans)

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
    try {
      const newPromotion = await storage.createListingPromotion(req.body);
      res.status(201).json(newPromotion);
    } catch (error) {
      res.status(500).json({ message: "Failed to create listing promotion", error });
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

  /**
   * SERVICE PACKAGES
   */
  app.get("/api/service-packages", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly !== 'false'; // Defaults to true
      const packages = await storage.getAllServicePackages(activeOnly);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service packages", error });
    }
  });

  // ... (add similar CRUD routes for service packages)

  /**
   * SHOWROOM SERVICE SUBSCRIPTIONS
   */
  app.get("/api/showroom-service-subscriptions/:showroomId", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly !== 'false'; // Defaults to true
      const subscriptions = await storage.getShowroomServiceSubscriptions(
        Number(req.params.showroomId),
        activeOnly
      );
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service subscriptions", error });
    }
  });

  app.post("/api/showroom-service-subscriptions", async (req, res) => {
    try {
      const newSubscription = await storage.createShowroomServiceSubscription(req.body);
      res.status(201).json(newSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service subscription", error });
    }
  });

  app.post("/api/showroom-service-subscriptions/:id/deactivate", async (req, res) => {
    try {
      await storage.deactivateShowroomServiceSubscription(Number(req.params.id));
      res.json({ message: "Service subscription deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate service subscription", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}