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

// Get the current ID token
export function getIdToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("idToken");
}

// Sign out - remove all tokens
export function signOut(): void {
  if (typeof window === "undefined") return;

  // Remove all authentication tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");

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
    throw new Error("No access token available");
  }

  // Add Authorization header to the request
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
