/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
export const sanitize = (str) => {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
};

/**
 * Set ARIA label and title attributes for an element
 * @param {string} id - The element's ID
 * @param {string} label - ARIA label
 * @param {string} title - Title attribute
 */
export const setAria = (id, label, title) => {
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute("aria-label", label);
    el.setAttribute("title", title);
  }
};

/**
 * Replace header links with a Log Out link for logged-in users
 */
export const setupLogoutLink = () => {
  const headerRight = document.getElementById("headerRight");
  if (!headerRight) return;

  // Remove existing login/signup links
  ["loginLink", "signUpLink", "divider"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });

  const logout = document.createElement("a");
  logout.href = "#";
  logout.textContent = "Log Out";
  logout.classList.add("hover:underline", "font-semibold");
  logout.setAttribute("aria-label", "Log out and return to login page");
  logout.setAttribute("title", "Log out");

  logout.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    location.href = "../account/login.html";
  });

  headerRight.appendChild(logout);
};

/**
 * Setup accessibility labels for post editing form inputs
 */
export const setupAccessibility = () => {
  setAria("title", "Post title", "Edit the title");
  setAria("body", "Post content", "Edit the content");
  setAria("imageUrl", "Image URL", "Update image URL");
  setAria("imageAlt", "Image description", "Update image description");
};
