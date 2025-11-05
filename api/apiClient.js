// Api/apiClient.js
const BASE_URL = "https://v2.api.noroff.dev";

/**
 * Makes an HTTP request to the Noroff API.
 * Handles GET, POST, PUT, and DELETE requests.
 *
 * @async
 * @param {string} endpoint - The API endpoint (e.g., "/auth/login").
 * @param {Object} [options={}] - Additional fetch options.
 * @param {string} [options.method] - HTTP method ("GET", "POST", "PUT", "DELETE").
 * @param {Object} [options.headers] - Custom headers.
 * @param {Object} [options.body] - Request body for POST/PUT requests.
 * @returns {Promise<Object|null>} - Parsed JSON response or null for 204 No Content.
 * @throws {Error} - Throws if the response is not OK or network fails.
 */
async function apiClient(endpoint, options = {}) {
  const { body, ...customOptions } = options;

  const headers = { "Content-Type": "application/json" };

  const config = {
    method: body ? "POST" : "GET",
    ...customOptions,
    headers: { ...headers, ...customOptions.headers },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.errors?.[0]?.message || `API error: ${response.status}`
      );
    }

    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Sends a GET request to the API.
 * @param {string} endpoint - API endpoint.
 * @returns {Promise<Object|null>}
 */
export const get = (endpoint) => apiClient(endpoint);

/**
 * Sends a POST request to the API.
 * @param {string} endpoint - API endpoint.
 * @param {Object} body - Request payload.
 * @returns {Promise<Object|null>}
 */
export const post = (endpoint, body) => apiClient(endpoint, { body });

/**
 * Sends a PUT request to the API.
 * @param {string} endpoint - API endpoint.
 * @param {Object} body - Request payload.
 * @returns {Promise<Object|null>}
 */
export const put = (endpoint, body) =>
  apiClient(endpoint, { method: "PUT", body });

/**
 * Sends a DELETE request to the API.
 * @param {string} endpoint - API endpoint.
 * @returns {Promise<Object|null>}
 */
export const del = (endpoint) => apiClient(endpoint, { method: "DELETE" });
