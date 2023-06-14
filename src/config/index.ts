import { config } from "dotenv";

config();

export const SERVER_PORT = process.env.SERVER_PORT || 8800;
export const SERVER_DOMAIN = process.env.SERVER_DOMAIN || "localhost";
export const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
export const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN || "localhost";
export const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "super_admin@admin.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
export const IMAGE_URL_IP = process.env.IMAGE_URL_IP || "127.0.0.1";
export const SUPERTOKEN_CONNECTIONURL = process.env.SUPERTOKEN_CONNECTIONURL;
export const SUPERTOKEN_CORE_API_KEY = process.env.SUPERTOKEN_CORE_API_KEY;

export const SMTP_HOST: string = process.env.SMTP_HOST || "string";
export const SMTP_PORT: any = process.env.SMTP_PORT;
export const SMTP_USERNAME: string = process.env.SMTP_USERNAME || "any";
export const SMTP_PASSWORD: string = process.env.SMTP_PASSWORD || "any";
export const SMTP_SENDER: string = process.env.SMTP_SENDER || "any";
