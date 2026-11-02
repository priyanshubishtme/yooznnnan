/**
 * Centralized API configuration for Yojana Sahayak frontend.
 * Uses an explicit API URL when provided, otherwise the deployed Render API
 * outside local development and same-origin requests during local development.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.DEV ? '' : 'https://yooznnnan.onrender.com');

export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;
