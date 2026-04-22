/**
 * Central configuration for the mobile application.
 * Location: /mobile/app/config/index.ts
 */

const DEFAULT_API_URL = 'https://express-cart-4w3k.onrender.com/api';

export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
};
