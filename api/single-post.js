document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const username = params.get("user");

  const token = localStorage.getItem("accessToken");
  const apiKey = localStorage.getItem("noroffApiKey");

  const postContainer = document.getElementById("postContainer");
  const postTitle = document.getElementById("postTitle");
  const postBody = document.getElementById("postBody");
  const postImage = document.getElementById("postImage");

  /**
   * Sets up header links based on login status
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

  if (!postId && !username) {
    postContainer.innerHTML = "<p>Post not found.</p>";
    return;
  }

  /**
   * Fetches a single post by ID or user's first post
   * @param {string} id - Post ID
   * @param {string} user - Username
   * @returns {Promise<Object|null>} Post object or null
   */
  async function fetchSinglePost(id, user) {
    try {
      if (id) {
        const res = await fetch(
          `https://v2.api.noroff.dev/social/posts/${id}?_author=true&_comments=true&_reactions=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Noroff-API-Key": apiKey,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.data) return data.data;
      }

      if (user) {
        const res = await fetch(
          `https://v2.api.noroff.dev/social/profiles/${user}?_posts=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Noroff-API-Key": apiKey,
            },
          }
        );
        const data = await res.json();
        if (!res.ok || !data.data?.posts)
          throw new Error("No posts found for this user.");
        if (id)
          return data.data.posts.find((p) => p.id === id) || data.data.posts[0];
        return data.data.posts[0];
      }

      throw new Error("Post not found");
    } catch (err) {
      alert(`Error fetching post: ${err.message}`);
      return null;
    }
  }

  const post = await fetchSinglePost(postId, username);

  if (!post) {
    postContainer.innerHTML = "<p>Post not found.</p>";
    return;
  }

  // Render post content
  postTitle.textContent = post.title || "Untitled";
  postBody.textContent = post.body || "";

  if (post.media?.url) {
    postImage.src = post.media.url;
    postImage.alt = post.media.alt || post.title || "";
    postImage.classList.remove("hidden");
  } else {
    postImage.classList.add("hidden");
  }

  // Display comment and reaction counts
  if (post._count) {
    const countsDiv = document.createElement("div");
    countsDiv.className = "text-gray-500 text-sm mt-4";
    countsDiv.textContent = `${post._count.comments} comments • ${post._count.reactions} reactions`;
    postContainer.appendChild(countsDiv);
  }
});
