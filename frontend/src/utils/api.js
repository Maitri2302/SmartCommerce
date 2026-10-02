export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Helper to construct full API URL for endpoints
 */
export const getApiUrl = (endpoint = "") => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

/**
 * Reusable API fetch wrapper with centralized auth and error handling
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Handle 401 Expired or Invalid Token
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:expired"));
    }

    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
