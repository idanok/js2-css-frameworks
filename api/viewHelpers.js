// ------------------
// Sanitize
// ------------------

/**
 * Sanitize a string to prevent XSS attacks.
 * @param {string} str - The string to sanitize.
 * @returns {string} Sanitized string.
 */
export const sanitize = (str) => {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
};

// ------------------
// SEO helpers
// ------------------

/**
 * Injects or updates the meta description tag for SEO.
 * @param {Object} post - Post object with at least `body` and `title`.
 */
export const injectMetaDescription = (post) => {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  const content =
    post.body?.slice(0, 160).replace(/[\n\r]+/g, " ") ||
    post.title ||
    "Read personal posts on Lifely.";
  meta.content = content;
};

// ------------------
// Share button
// ------------------

/**
 * Sets up a share button that copies the post link to the clipboard.
 * @param {string} link - URL to copy.
 */
export const setupShareButton = (link) => {
  const btn = document.getElementById("shareButton");
  const status = document.getElementById("shareStatus");
  if (!btn || !status) return;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(link);
      status.textContent = "Link copied!";
    } catch (err) {
      console.error(err);
      status.textContent = "Failed to copy link.";
    } finally {
      setTimeout(() => {
        status.textContent = "";
      }, 3000);
    }
  });
};

// ------------------
// Header / Navigation
// ------------------

/**
 * Initializes header links. Replaces login/signup links with a logout link if logged in.
 */
export const initHeaderLinks = () => {
  const headerRight = document.getElementById("headerRight");
  if (!headerRight) return;

  headerRight.innerHTML = "";

  const token = localStorage.getItem("accessToken");

  if (token) {
    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Log Out";
    logoutLink.title = "Log out and return to login page";
    logoutLink.setAttribute("aria-label", "Log out");
    logoutLink.classList.add("hover:underline", "font-semibold");

    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userName");
      window.location.href = "../account/login.html";
    });

    headerRight.appendChild(logoutLink);
  } else {
    const loginLink = document.createElement("a");
    loginLink.href = "../account/login.html";
    loginLink.textContent = "Log In";
    loginLink.classList.add("hover:underline");

    const divider = document.createElement("span");
    divider.textContent = " | ";
    divider.classList.add("text-gray-500");

    const signUpLink = document.createElement("a");
    signUpLink.href = "../account/register.html";
    signUpLink.textContent = "Sign Up";
    signUpLink.classList.add("hover:underline");

    headerRight.append(loginLink, divider, signUpLink);
  }
};
