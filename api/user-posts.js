/**
 * Initializes the user posts page:
 * - Sets up header links based on login status
 * - Fetches social and blog posts for the selected user
 * - Merges, sorts, and renders posts
 * - Adds search functionality
 */
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("accessToken");
  const apiKey = localStorage.getItem("noroffApiKey");
  const selectedUser = localStorage.getItem("selectedUser");

  const postsContainer = document.getElementById("postsContainer");
  const searchInput = document.getElementById("searchPostsInput");
  const errorMessage = document.getElementById("errorMessage");

  /**
   * Sets up header navigation links based on login status.
   */
  const initHeaderLinks = () => {
    const headerRight = document.getElementById("headerRight");
    if (!headerRight) return;

    headerRight.innerHTML = "";

    if (token) {
      const logoutLink = document.createElement("a");
      logoutLink.href = "#";
      logoutLink.textContent = "Log Out";
      logoutLink.title = "Log out and return to login page";
      logoutLink.setAttribute("aria-label", "Log out");
      logoutLink.className = "hover:underline font-semibold";

      logoutLink.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("selectedUser");
        window.location.href = "../account/login.html";
      });

      headerRight.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement("a");
      loginLink.href = "../account/login.html";
      loginLink.textContent = "Log In";
      loginLink.className = "hover:underline";

      const divider = document.createElement("span");
      divider.textContent = "|";

      const signUpLink = document.createElement("a");
      signUpLink.href = "../account/register.html";
      signUpLink.textContent = "Sign Up";
      signUpLink.className = "hover:underline";

      headerRight.append(loginLink, divider, signUpLink);
    }
  };

  initHeaderLinks();

  if (!selectedUser) {
    if (errorMessage) errorMessage.textContent = "No user selected.";
    return;
  }

  /**
   * Fetches social posts for a given username.
   * @param {string} username - Username to fetch posts for.
   * @returns {Promise<Array>} List of social posts.
   */
  async function fetchSocialPosts(username) {
    if (!token || !apiKey) return [];

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${username}/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.errors?.[0]?.message || "Failed to fetch social posts"
        );
      return data.data || [];
    } catch (err) {
      alert("Unable to load social posts. Please try again later.");
      return [];
    }
  }

  /**
   * Fetches blog posts for a given username.
   * @param {string} username - Username to fetch posts for.
   * @returns {Promise<Array>} List of blog posts.
   */
  async function fetchBlogPosts(username) {
    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/blog/posts/${username}`
      );
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      alert("Unable to load blog posts. Please try again later.");
      return [];
    }
  }

  /**
   * Combines and sorts posts from multiple sources by creation date.
   * @param {Array} socialPosts - Social posts.
   * @param {Array} blogPosts - Blog posts.
   * @returns {Array} Sorted posts.
   */
  function mergeAndSortPosts(socialPosts, blogPosts) {
    const allPosts = [...socialPosts, ...blogPosts];
    return allPosts.sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  /**
   * Renders a list of posts to the page.
   * @param {Array} posts - Posts to render.
   */
  function renderPosts(posts) {
    postsContainer.innerHTML = "";

    if (!posts.length) {
      postsContainer.innerHTML = "<p>This user hasn’t posted anything yet.</p>";
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow";

      card.addEventListener("click", () => {
        const postUser = post.owner || null;
        const url = new URL(
          "../social/single-post.html",
          window.location.origin
        );
        url.searchParams.set("id", post.id);
        if (postUser) url.searchParams.set("user", postUser);
        window.location.href = url.toString();
      });

      const title = document.createElement("h3");
      title.className = "font-bold text-lg mb-2 text-[#455F7D]";
      title.textContent = post.title;

      const body = document.createElement("p");
      body.className = "text-gray-700 mb-2";
      body.textContent = post.body?.slice(0, 150) + "...";

      if (post.media?.url) {
        const img = document.createElement("img");
        img.src = post.media.url;
        img.alt = post.media.alt || post.title;
        img.className = "w-full h-auto rounded mb-2";
        card.appendChild(img);
      }

      card.appendChild(title);
      card.appendChild(body);
      postsContainer.appendChild(card);
    });
  }

  // Fetch, merge, and render posts
  const [socialPosts, blogPosts] = await Promise.all([
    fetchSocialPosts(selectedUser),
    fetchBlogPosts(selectedUser),
  ]);

  const allPosts = mergeAndSortPosts(socialPosts, blogPosts);
  renderPosts(allPosts);

  // Search filter
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      if (!query) return renderPosts(allPosts);

      const filteredPosts = allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.body?.toLowerCase().includes(query)
      );

      renderPosts(filteredPosts);
    });
  }
});
