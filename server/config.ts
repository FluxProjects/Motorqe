// server/config.ts

import dotenv from "dotenv";

dotenv.config();

interface Config {
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    DATABASE_URL: string;
}

export const config: Config = {
    JWT_SECRET: process.env.JWT_SECRET || "your-default-secret", // make sure to set a strong secret in .env
    JWT_EXPIRES_IN: "1d", // 1 day or however you want
    DATABASE_URL: process.env.DATABASE_URL || "",
};
