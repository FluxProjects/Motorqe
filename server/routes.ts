import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { notificationService } from "./services/notification";
import { paymentService } from "./services/payment";
import { generateOTP, generateToken, hashPassword, loginUser, registerUser, verifyPassword } from "./services/auth";
import { verifyToken } from "./services/auth";
import { InsertShowroom, ShowroomService } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with dummy data

  /**
   * AUTHENTICATION ROUTES
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(200).json(null);
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return res.status(200).json(null);
      }

      const user = await storage.getUser(decoded.id); // Assuming this returns user details
      if (!user) {
        return res.status(200).json(null);
      }

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
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ token, user });
    } catch (err: any) {
      res.status(409).json({ message: err.message });
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
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({ token, user });
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.message === "Email or username already in use") {
        return res.status(409).json({ message: err.message });
      }
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

  app.put("/api/users/:id/password", async (req, res) => {
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

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Security: Don't reveal if email exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          success: true,
          message: "If this email exists, we've sent an OTP",
          token: generateToken() // Return a token anyway for security
        });
      }

      const otp = generateOTP();
      const token = generateToken();

      await storage.createPasswordResetToken(email, otp, token);
      await notificationService.sendOTP(email, otp);

      res.json({
        success: true,
        message: "OTP sent to email",
        token
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { email, otp, token } = req.body;

      if (!email || !otp || !token) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const isValid = await storage.verifyPasswordResetToken(email, otp, token);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      const verificationToken = generateToken();
      await storage.createPasswordResetToken(email, otp, verificationToken);

      res.json({
        success: true,
        message: "OTP verified",
        verificationToken
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, newPassword, token } = req.body;

      if (!email || !newPassword || !token) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Verify token exists and is valid
      const result = await verifyToken(token);

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPasswordByEmail(email, hashedPassword)

      // Invalidate the token
      await storage.invalidateResetToken(token);

      res.json({
        success: true,
        message: "Password reset successfully"
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Resend OTP
  app.post("/api/auth/resend-otp", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const otp = generateOTP();
      const token = generateToken();

      await storage.createPasswordResetToken(email, otp, token);
      await notificationService.sendOTP(email, otp);

      res.json({
        success: true,
        message: "New OTP sent to email",
        token
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Failed to resend OTP" });
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

  app.get("/api/showrooms/:id", async (req, res) => {
    try {
      const showroom = await storage.getShowroom(Number(req.params.id));
      showroom ? res.json(showroom) : res.status(404).json({ message: "Showroom not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showroom", error });
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
        userId: req.body.userId // Get user ID from authenticated session
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


  // Car Listings
  app.get("/api/car-listings", async (req, res) => {
    console.log("Received request to /api/car-listings with query:", req.query);
    try {
      const filters: any = {};
      console.log("Initial filters object:", filters);

      // User Id
      if (req.query.user_id) {
        console.log("Processing userid filter with value:", req.query.user_id);
        filters.user_id = req.query.user_id;
        console.log("Added user filter:", filters.user_id);
      } else {
        console.log("No userid filter");
      }

      // Price Range
      if (req.query.price_from && req.query.price_to) {
        console.log("Processing price range filter with values:", req.query.price_from, "to", req.query.price_to);
        filters.price_from = req.query.price_from;
        filters.price_to = req.query.price_to;
        console.log("Added price range filter:", filters.price_from, "to", filters.price_to);
      } else {
        console.log("No price range filter or incomplete range");
      }

      // Year Range
      if (req.query.year_from && req.query.year_to) {
        console.log("Processing year range filter with values:", req.query.year_from, "to", req.query.year_to);
        const year_from = req.query.year_from;
        const year_to = req.query.year_to;

        const parsedYearFrom = Number(year_from);
        const parsedYearTo = Number(year_to);

        if (
          (year_from && isNaN(parsedYearFrom)) ||
          (year_to && isNaN(parsedYearTo))
        ) {
          console.log("Invalid year filter - not a number");
          return res.status(400).json({ message: 'Invalid year filter' });
        }

        filters.year_from = parsedYearFrom;
        filters.year_to = parsedYearTo;
        console.log("Added year range filter:", filters.year_from, "to", filters.year_to);
      } else {
        console.log("No year range filter or incomplete range");
      }

      // Make
      if (req.query.make && req.query.make !== "all") {
        console.log("Processing make filter with value:", req.query.make);
        const makeId = parseInt(req.query.make as string, 10);
        if (!isNaN(makeId)) {
          filters.make_id = makeId;
          console.log("Added make_id filter:", makeId);
        } else {
          console.log("Invalid make_id - not a number");
        }
      } else {
        console.log("No make filter or 'all' selected");
      }

      // Model
      if (req.query.model && req.query.model !== "all") {
        console.log("Processing model filter with value:", req.query.model);
        const modelId = parseInt(req.query.model as string, 10);
        if (!isNaN(modelId)) {
          filters.model_id = modelId;
          console.log("Added model_id filter:", modelId);
        } else {
          console.log("Invalid model_id - not a number");
        }
      } else {
        console.log("No model filter or 'all' selected");
      }

      // Category
      if (req.query.category && req.query.category !== "all") {
        console.log("Processing category filter with value:", req.query.category);
        const catId = parseInt(req.query.category as string, 10);
        if (!isNaN(catId)) {
          filters.category_id = catId;
          console.log("Added category_id filter:", catId);
        } else {
          console.log("Invalid category_id - not a number");
        }
      } else {
        console.log("No category filter or 'all' selected");
      }

      // Miles Range
      if (req.query.miles_from && req.query.miles_to) {
        console.log("Processing miles range filter with values:", req.query.miles_from, "to", req.query.miles_to);
        filters.miles_from = req.query.miles_from;
        filters.miles_to = req.query.miles_to;
        console.log("Added miles range filter:", filters.miles_from, "to", filters.miles_to);
      } else {
        console.log("No miles range filter or incomplete range");
      }

      // Fuel Type
      if (req.query.fuel_type && req.query.fuel_type !== "all") {
        console.log("Processing fuel type filter with value:", req.query.fuel_type);
        filters.fuel_type = req.query.fuel_type;
      } else {
        console.log("No fuel_type filter or 'all' selected");
      }

      // Transmission
      if (req.query.transmission && req.query.transmission !== "all") {
        console.log("Processing transmission filter with value:", req.query.transmission);
        filters.transmission = req.query.transmission;
        console.log("Added transmission filter:", req.query.transmission);
      } else {
        console.log("No transmission filter or 'all' selected");
      }

      // Car Engine Capacity
      if (req.query.engine_capacity && req.query.engine_capacity !== "all") {
        console.log("Processing car_engine_capacities filter with value:", req.query.car_engine_capacities);
        filters.car_engine_capacities = req.query.engine_capacity;
      } else {
        console.log("No car_engine_capacities filter or 'all' selected");
      }

      // Cylinder Count
      if (req.query.cylinder_count && req.query.cylinder_count !== "all") {
        console.log("Processing cylinder_count filter with value:", req.query.cylinder_count);
        filters.cylinder_count = req.query.cylinder_count;
      } else {
        console.log("No cylinder_count filter or 'all' selected");
      }

      // Condition
      if (req.query.condition && req.query.condition !== "all") {
        console.log("Processing date condition with values:", req.query.condition);
        filters.condition = req.query.condition;
        console.log("Added date range filter:", filters.condition, "to", filters.condition);
      } else {
        console.log("No date condition or incomplete range");
      }

      // Location
      if (req.query.location && req.query.location !== "all") {
        console.log("Processing date location with values:", req.query.location);
        filters.location = req.query.location;
        console.log("Added date range filter:", filters.location, "to", filters.location);
      } else {
        console.log("No date location or incomplete range");
      }

      // Color
      if (req.query.color && req.query.color !== "all") {
        console.log("Processing color filter with value:", req.query.color);
        filters.color = req.query.color;
      } else {
        console.log("No color filter or 'all' selected");
      }

      // Interior Color
      if (req.query.interior_color && req.query.interior_color !== "all") {
        console.log("Processing interior_color filter with value:", req.query.interior_color);
        filters.interior_color = req.query.interior_color;
      } else {
        console.log("No interior_color filter or 'all' selected");
      }

      // Tinted
      if (req.query.tinted && req.query.tinted !== "all") {
        console.log("Processing tinted filter with value:", req.query.tinted);
        filters.tinted = req.query.tinted;
      } else {
        console.log("No tinted filter or 'all' selected");
      }

      // Status
      if (req.query.status && req.query.status !== "all") {
        console.log("Processing status filter with value:", req.query.status);
        filters.status = req.query.status;
        console.log("Added status filter:", req.query.status);
      } else {
        console.log("No status filter or 'all' selected");
      }

      // isFeatured
      if (req.query.is_featured) {
        console.log("Processing is_featured filter with value:", req.query.is_featured);
        filters.is_featured = req.query.is_featured === "true";
        console.log("Added is_featured filter:", filters.is_featured);
      } else {
        console.log("No is_featured filter");
      }

      // isImported
      if (req.query.is_imported) {
        console.log("Processing is_imported filter with value:", req.query.is_imported);
        filters.is_imported = req.query.is_imported === "true";
        console.log("Added is_imported filter:", filters.is_imported);
      } else {
        console.log("No is_imported filter");
      }

      // Owner Type
      if (req.query.owner_type && req.query.owner_type !== "all") {
        console.log("Processing owner_type filter with value:", req.query.owner_type);
        filters.owner_type = req.query.owner_type;
      } else {
        console.log("No owner_type filter or 'all' selected");
      }

      // Has Warranty
      if (req.query.has_warranty) {
        console.log("Processing has_warranty filter with value:", req.query.has_warranty);
        filters.has_warranty = req.query.has_warranty === "true";
        console.log("Added has_warranty filter:", filters.has_warranty);
      } else {
        console.log("No has_warranty filter");
      }

      // Has Insurance
      if (req.query.has_insurance) {
        console.log("Processing has_insurance filter with value:", req.query.has_insurance);
        filters.has_insurance = req.query.has_insurance === "true";
        console.log("Added has_insurance filter:", filters.has_insurance);
      } else {
        console.log("No has_insurance filter");
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

      console.log("Final filters object before querying storage:", filters);
      const listings = await storage.getAllCarListings(filters);
      console.log("Retrieved listings from storage (count):", listings.length);
      console.log("Retrieved listings from storage:", listings);
      res.json(listings);

      // Normalize image URLs (example assumes `image` and `thumbnail`)
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });

  function normalizeUrl(url?: string): string | null {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://yourdomain.com/uploads/${url}`; // Adjust path as needed
  }


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
        console.log("🔍 Checking for existing active promotions");
        const activePromotions = await storage.getActiveListingPromotions(id);

        if (activePromotions.length > 0) {
          console.log("🔄 Updating existing promotion instead of creating new one");
          const promotionToUpdate = activePromotions[0];

          await storage.updateListingPromotion(promotionToUpdate.id, {
            packageId: package_id,
            startDate: start_date,
            endDate: end_date
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

  app.put("/api/car-listings/:id/actions", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { action, reason, featured } = req.body;

      console.log("Action Recieved in route:", action);
      // Validate action
      const validActions = ['pending', 'draft', 'publish', 'active', 'approve', 'reject', 'feature', 'sold', 'delete'];
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
      }

      // Apply updates
      const updated = await storage.updateCarListing(id, updates);

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
  app.get("/api/services", async (_req, res) => {
    try {
      const services = await storage.getAllServices();
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

  app.get("/api/services/featured", async (_req, res) => {
    try {
      const services = await storage.getAllFeaturedServices();
      res.json(services);
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
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
      if (req.query.is_active) {
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
      const sortOrder = req.query.sort_order === 'desc' ? 'desc' : 'asc';

      console.log("Final filters object before querying storage:", filters);
      const services = await storage.getAllShowroomServices(filters, sortBy, sortOrder);

      if (Array.isArray(services)) {
        console.log("service is an array");
        // Enrich services with additional data if needed
        const enrichedServices = await Promise.all(
          services.map(async (service: any) => {
            try {
              const serviceDetails = await storage.getService(service.service_id);
              const showroomDetails = await storage.getShowroom(service.showroom_id);
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
    console.log("Received request to create showroom service:", req.body);
    try {
      const {
        showroomId,
        serviceId,
        price,
        currency = 'USD', // default currency
        description,
        descriptionAr,
        isFeatured = false,
        isActive = true
      } = req.body;

      // Validate required fields
      if (!showroomId || !serviceId || price === undefined) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate price is a number
      if (isNaN(parseFloat(price))) {
        console.log("Invalid price value");
        return res.status(400).json({ message: "Price must be a number" });
      }

      const newService = await storage.createShowroomService({
        showroomId,
        serviceId,
        price: parseFloat(price),
        currency,
        description,
        descriptionAr,
        isFeatured,
        isActive
      });

      console.log("Successfully created service:", newService);
      res.status(201).json(newService);
    } catch (error) {
      console.error("Failed to create showroom service:", error);
      res.status(500).json({ message: "Failed to create showroom service", error });
    }
  });

  // Update Showroom Service
  app.put("/api/showroom/services/:id", async (req, res) => {
    const serviceId = parseInt(req.params.id, 10);
    console.log(`Received request to update showroom service ${serviceId}:`, req.body);

    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    try {
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.id;
      delete updates.created_at;

      // Convert price to number if provided
      if (updates.price !== undefined) {
        updates.price = parseFloat(updates.price);
        if (isNaN(updates.price)) {
          return res.status(400).json({ message: "Price must be a number" });
        }
      }

      const updatedService = await storage.updateShowroomService(serviceId, updates);

      if (!updatedService) {
        console.log("Service not found");
        return res.status(404).json({ message: "Service not found" });
      }

      console.log("Successfully updated service:", updatedService);
      res.json(updatedService);
    } catch (error) {
      console.error("Failed to update showroom service:", error);
      res.status(500).json({ message: "Failed to update showroom service", error });
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
  app.put("/api/showroom/services/:id/:action", async (req, res) => {
    const serviceId = parseInt(req.params.id, 10);
    const action = req.params.action;
    console.log(`Received ${action} request for service ${serviceId}`);

    const validActions = ['feature', 'activate', 'deactivate'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    try {
      let updateField: string;
      let updateValue: boolean;

      switch (action) {
        case 'feature':
          updateField = 'is_featured';
          updateValue = true;
          break;
        case 'activate':
          updateField = 'is_active';
          updateValue = true;
          break;
        case 'deactivate':
          updateField = 'is_active';
          updateValue = false;
          break;
        default:
          return res.status(400).json({ message: "Invalid action" });
      }

      const updatedService = await storage.updateShowroomService(serviceId, {
        [updateField]: updateValue
      });

      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      console.log(`Successfully ${action}d service:`, updatedService);
      res.json(updatedService);
    } catch (error) {
      console.error(`Failed to ${action} service:`, error);
      res.status(500).json({ message: `Failed to ${action} service`, error });
    }
  });



  app.post("/api/service-bookings", async (req, res) => {
    try {
      const { userId, serviceId, price, scheduledAt, status, notes } = req.body;
      console.log("Received new service booking request:", req.body);

      const booking = await storage.createServiceBooking({ userId, serviceId, price, scheduledAt, status, notes });
      console.log("Created service booking:", booking);

      res.status(201).json(booking);
    } catch (error) {
      console.error("Failed to create service booking:", error);
      res.status(500).json({ message: "Failed to create service booking", error });
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

  app.get("/api/static-content/:key", async (req, res) => {
    try {
      const content = await storage.getStaticContentByKey(req.params.key);
      content ? res.json(content) : res.status(404).json({ message: "Content not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch static content", error });
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
      const activeOnly = req.query.activeOnly !== 'false'; // Defaults to true
      const packages = await storage.getAllPromotionPackages(activeOnly);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotion packages", error });
    }
  });

  app.get("/api/promotion-packages/:packageId", async (req, res) => {
    try {
      const promotions = await storage.getPromotionPackage(Number(req.params.packageId));
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package promotions", error });
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

  const httpServer = createServer(app);
  return httpServer;
}