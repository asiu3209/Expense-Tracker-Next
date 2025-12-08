// Helper functions for working with authentication tokens

// Check if user is currently signed in
export function isAuthenticated(): boolean {
  // Check if we have an access token in localStorage
  if (typeof window === "undefined") return false; // Server-side check

  const token = localStorage.getItem("accessToken");
  return !!token; // !! converts to boolean (null becomes false, string becomes true)
}

// Get the current access token
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("accessToken");
}

// Get user information from localStorage
export function getUserInfo(): {
  id: string;
  email: string;
  name: string;
} | null {
  if (typeof window === "undefined") return null;

  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
}

// Save authentication data after successful sign-in
export function saveAuthData(
  token: string,
  user: { id: string; email: string; name: string }
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("accessToken", token);
  localStorage.setItem("userInfo", JSON.stringify(user));
}

// Sign out - remove all tokens and redirect
export function signOut(): void {
  if (typeof window === "undefined") return;

  // Remove all authentication tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userInfo");

  // Redirect to sign-in page
  window.location.href = "/signin";
}

// Make an authenticated API request
// This helper automatically adds the Authorization header
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  // Merge authorization header with any existing headers
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
