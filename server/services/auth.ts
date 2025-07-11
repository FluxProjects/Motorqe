import { db } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { notificationService } from "./notification";
const { BASE_URL } = config;

export async function loginUser(email: string, password: string) {

  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  console.log("Data recieved at auth.ys for user", email);
  // Validate JWT configuration
  if (!config.JWT_SECRET || typeof config.JWT_SECRET !== 'string') {
    throw new Error("Invalid JWT_SECRET configuration");
  }

  if (!config.JWT_EXPIRES_IN || typeof config.JWT_EXPIRES_IN !== 'string') {
    throw new Error("Invalid JWT_EXPIRES_IN configuration");
  }


  // Use raw SQL query with parameterized values
  const result = await db.query(
    `SELECT id, username, email, phone, password, first_name as "firstName", 
         last_name as "lastName", role_id as "roleId", is_email_verified as "isEmailVerified",
         avatar, email_notifications as "emailNotifications", 
         sms_notifications as "smsNotifications", notification_email as "notificationEmail",
         notification_phone as "notificationPhone", created_at as "createdAt"
         FROM users WHERE email = $1`,
    [email]
  );

  if (result.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result[0];

  console.log("user result form db", user);

  if (!user) {
    throw new Error("Invalid credentials"); // Generic message for security
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials"); // Generic message for security
  }

  // Remove password from user object
  const { password: _, ...publicUser } = user;

  const token = jwt.sign(
    {
      id: user.id,
      roleId: user.roleId
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN
    } as jwt.SignOptions // Explicit type assertion
  );


  return {
    token,
    user: publicUser
  };
}

export async function registerUser({
  firstName,
  lastName,
  username,
  email,
  phone,
  password,
  role
}: {
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}) {
  // Validate input
  if (!email || !password || !firstName || !username || !role) {
    throw new Error("All fields are required");
  }

  // Validate JWT configuration (same as in loginUser function)
  if (!config.JWT_SECRET || typeof config.JWT_SECRET !== 'string') {
    throw new Error("Invalid JWT_SECRET configuration");
  }

  if (!config.JWT_EXPIRES_IN || typeof config.JWT_EXPIRES_IN !== 'string') {
    throw new Error("Invalid JWT_EXPIRES_IN configuration");
  }

  // Check if user already exists (check for email and/or username)
  const result = await db.query(
    `SELECT id FROM users WHERE email = $1 OR username = $2`,
    [email, username]
  );

  if (result.length > 0) {
    throw new Error("Email or username already in use");
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into the database with correct column names
  const insertResult = await db.query(
    `INSERT INTO users (email, password, username, first_name, last_name, role_id, phone) 
     VALUES ($1, $2, $3, $4, $5, (SELECT id FROM roles WHERE name = $6), $7) 
     RETURNING id, first_name as "firstName", last_name as "lastName", username, email, phone, role_id as "roleId"`,
    [email, hashedPassword, username, firstName, lastName, role, phone]
  );

  const newUser = insertResult[0];

  // Generate a JWT token
  const token = jwt.sign(
    {
      id: newUser.id,
      roleId: newUser.roleId
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN
    } as jwt.SignOptions
  );

  // Generate verification token (you can use your existing generateToken function)
  const verificationToken = generateToken();
  const verificationLink = `${BASE_URL}/verify-email?token=${verificationToken}`;

  // Store verification token in database (you'll need to add this to your users table or create a separate table)
  const updateResult = await db.query(
  `UPDATE users SET verification_token = $1 WHERE id = $2 RETURNING verification_token`,
  [verificationToken, newUser.id]
);
console.log("Verification token stored:", updateResult[0]);

  try {
    // Send welcome and verification email using the notification service
    await notificationService.sendRegistrationEmail(email, {
      firstName: firstName,
      verificationLink: verificationLink
    });

    // You can also create a notification record if needed
    await notificationService.createUserRegistrationNotifications(
      newUser.id,
      email,
      phone || null
    );
  } catch (emailError) {
    console.error('Failed to send registration email:', emailError);
    // Don't fail the registration if email fails, just log it
  }

  // Return the token and user info (excluding the password)
  const { password: _, ...publicUser } = newUser;

  return {
    token,
    user: publicUser
  };
};

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function verifyEmailToken(token: string) {
  try {
    // Check if token exists and is not expired
    const result = await db.query(
      `SELECT id, email, is_email_verified as "isEmailVerified" 
       FROM users 
       WHERE verification_token = $1;`,
      [token]
    );

    if (result.length === 0) {
      return { 
        isValid: false, 
        message: "Invalid or expired token",
        redirectUrl: `${BASE_URL}/verify-email/invalid`
      };
    }

    const user = result[0];

    // If email is already verified, no need to verify again
    if (user.isEmailVerified) {
      return { 
        isValid: false, 
        message: "Email already verified",
        redirectUrl: `${BASE_URL}/verify-email/already-verified`
      };
    }

    // Update user as verified and clear the token
    await db.query(
      `UPDATE users 
       SET is_email_verified = true
       WHERE id = $1`,
      [user.id]
    );

    return { 
      isValid: true, 
      message: "Email verified successfully",
      email: user.email,
      redirectUrl: `${BASE_URL}/verify-email/success`
    };
  } catch (error) {
    console.error("Error verifying email token:", error);
    throw new Error("Failed to verify email token");
  }
}


export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function requestPasswordReset(email: string) {
  // Check if user exists
  const result = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (result.length === 0) {
    // Don't reveal if user doesn't exist for security
    return { success: true };
  }

  const user = result[0];
  
  // Generate reset token
  const resetToken = generateToken();
  const resetLink = `${BASE_URL}/api/auth/reset-password?token=${resetToken}`;
  
  // Store token with expiry in database
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  await db.query(
    `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3`,
    [resetToken, expiresAt, user.id]
  );

  try {
    // Send password reset email
    await notificationService.sendPasswordResetEmail(email, {
      firstName: 'User', // You might want to fetch the actual name
      resetLink: resetLink,
      expiryHours: 24
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }

  return { success: true };
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export function generateToken(): string {
  return Array.from(Array(32), () => 
    Math.floor(Math.random() * 36).toString(36)).join(''); // 32-char alphanumeric token
}