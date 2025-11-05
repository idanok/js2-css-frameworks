import { buildUserPostCard, renderEmptyState } from "./postHelpers.js";

const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const apiKey = localStorage.getItem("noroffApiKey");

if (!token || !userName) {
  alert("You must be logged in to access this page.");
  window.location.href = "../account/login.html";
  throw new Error("Access denied. User not authenticated.");
}

/**
 * Ensures the user has a social profile. Creates one if missing.
 */
async function ensureProfileExists() {
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${userName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) return;

    if (res.status === 404) {
      const createRes = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${userName}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avatar: {
              url: "https://via.placeholder.com/150",
              alt: `${userName}'s avatar`,
            },
          }),
        }
      );

      if (!createRes.ok) throw new Error("Failed to create profile");
    } else {
      throw new Error(`Error fetching profile: ${res.status}`);
    }
  } catch (err) {
    alert(
      "There was a problem ensuring your profile exists. Please refresh or log in again."
    );
  }
}

/**
 * Initializes header links (Log Out for authenticated users)
 */
const initHeaderLinks = () => {
  const headerRight = document.getElementById("headerRight");
  ["loginLink", "signUpLink", "divider"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const logoutLink = document.createElement("a");
  logoutLink.href = "#";
  logoutLink.textContent = "Log Out";
  logoutLink.title = "Log out";
  logoutLink.setAttribute("aria-label", "Log out and return to login page");
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "../account/login.html";
  });

  if (headerRight) headerRight.appendChild(logoutLink);
};

/**
 * Initialize the create post button
 */
const initCreateButton = () => {
  const createBtn = document.getElementById("createPostBtn");
  if (!createBtn) return;

  createBtn.setAttribute("aria-label", "Create a new blog post");
  createBtn.setAttribute("title", "New Post");
  createBtn.addEventListener("click", () => {
    window.location.href = "../post/create.html";
  });
};

/**
 * Initialize the view users button
 */
const initViewUsersButton = () => {
  const viewUsersBtn = document.getElementById("viewUsersBtn");
  if (!viewUsersBtn) return;

  viewUsersBtn.addEventListener("click", () => {
    window.location.href = "../social/users.html";
  });
};

/**
 * Initialize search functionality
 */
const initSearch = () => {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = (window.allPosts || []).filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.body?.toLowerCase().includes(query)
    );

    const postGrid = document.getElementById("postGrid");
    postGrid.innerHTML = "";

    if (!filtered.length) {
      postGrid.innerHTML = "<p>No posts found.</p>";
      return;
    }

    filtered.forEach((post) => postGrid.appendChild(buildUserPostCard(post)));
  });
};

/**
 * Fetch and render public posts
 */
const fetchPublicPosts = async () => {
  try {
    const res = await fetch("https://v2.api.noroff.dev/blog/posts/idanok");
    const { data: posts } = await res.json();

    if (posts?.length) {
      window.allPosts = posts;
      renderPosts(posts);
    } else {
      renderEmptyState("No public posts found.");
    }
  } catch {
    renderEmptyState("Unable to load public posts at the moment.");
  }
};

/**
 * Fetch and render private posts for current user
 */
const fetchPrivatePosts = async () => {
  const postGrid = document.getElementById("postGrid");
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/blog/posts/${userName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    const { data: posts } = await res.json();

    if (!posts?.length) return;

    posts
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 12)
      .forEach((post) => postGrid.appendChild(buildUserPostCard(post)));
  } catch {
    postGrid.innerHTML =
      "<p>Error loading your posts. Please try again later.</p>";
  }
};

/**
 * Render posts to the post grid
 * @param {Array} posts - Array of post objects
 */
const renderPosts = (posts) => {
  const postGrid = document.getElementById("postGrid");
  postGrid.innerHTML = "";

  if (!posts.length) {
    renderEmptyState("No blog posts found.");
    return;
  }

  posts.forEach((post) => postGrid.appendChild(buildUserPostCard(post)));
};

// Initialize DOM and fetch posts
document.addEventListener("DOMContentLoaded", async () => {
  initHeaderLinks();
  initCreateButton();
  initViewUsersButton();
  initSearch();

  await ensureProfileExists();

  fetchPublicPosts();
  fetchPrivatePosts();
});
