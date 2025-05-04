import { db } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";

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
  password,
  role
}: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}) {

  // Validate input
  if (!email || !password || !firstName || !lastName || !username || !role) {
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
     RETURNING id, first_name as "firstName", last_name as "lastName", username, email, role_id as "roleId"`,
    [email, hashedPassword, username, firstName, lastName, role, null] // Assuming phone is optional or null
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
    } as jwt.SignOptions // Explicit type assertion
  );

  // Return the token and user info (excluding the password)
  const { password: _, ...publicUser } = newUser;

  return {
    token,
    user: publicUser
  };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};