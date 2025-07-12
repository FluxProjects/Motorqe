import { Router } from "express";
import { storage } from "../storage";
import type { Request, Response } from "express";
import { generateOTP, generateToken, verifyResetToken, hashPassword, loginUser, registerUser, verifyEmailToken } from "../services/auth";
import { notificationService } from "../services/notification";

export const authRoutes = Router();

// /api/auth/me
authRoutes.get("/me", async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(200).json(null);
        }

        const decoded = verifyEmailToken(token);
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

// /api/auth/login
authRoutes.post("/login", async (req: Request, res: Response) => {
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

// /api/auth/regster
authRoutes.post("/register", async (req: Request, res: Response) => {
    const { firstName, lastName, username, email, phone, password, confirmPassword, role, termsAgreement } = req.body;
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
            phone,
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

// /api/auth/verify-token
authRoutes.get("/verify-token", async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const verificationResult = await verifyEmailToken(token as string);
        
        if (!verificationResult.isValid) {
            return res.status(401).json({ 
                success: false,
                message: verificationResult.message 
            });
        }

        res.json({
            success: true,
            message: verificationResult.message,
            email: verificationResult.email
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to verify token" 
        });
    }
});

// /api/auth/logout
authRoutes.post("/logout", async (_req: Request, res: Response) => {
    try {
        // Clear auth cookie
        res.clearCookie('token');
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed", error });
    }
});

// Request OTP
authRoutes.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    const otp = generateOTP();
    const token = generateToken();

    if (user) {
      await storage.createPasswordResetToken(email, otp, token);

      await notificationService.sendOTP(email, {
        firstName: user.first_name || "Customer",
        otp
      });
    }

    // Always respond with success for security
    return res.json({
      success: true,
      message: "If this email exists, we've sent an OTP",
      token
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// Verify OTP
authRoutes.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otp, token } = req.body;
    if (!email || !otp || !token) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isValid = await storage.verifyPasswordResetToken(email, otp, token);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid OTP or expired" });
    }

    const verificationToken = generateToken();
    await storage.createPasswordResetToken(email, otp, verificationToken);

    return res.json({
      success: true,
      message: "OTP verified",
      verificationToken
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

// Reset Password
authRoutes.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, newPassword, token } = req.body;
    if (!email || !newPassword || !token) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isValid = await verifyResetToken(token);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserPasswordByEmail(email, hashedPassword);

    await storage.invalidateResetToken(token);

    return res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Resend OTP
authRoutes.post("/resend-otp", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    const otp = generateOTP();
    const token = generateToken();

    if (user) {
      await storage.createPasswordResetToken(email, otp, token);

      await notificationService.sendOTP(email, {
        firstName: user.first_name || "Customer",
        otp
      });
    }

    return res.json({
      success: true,
      message: "If this email exists, a new OTP has been sent",
      token
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});
