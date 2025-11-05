// ------------------
// Auth helpers
// ------------------

/**
 * Protects a page by redirecting unauthenticated users to login.
 */
export function protectPage() {
  const token = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  if (!token || !userName) {
    alert("You must be logged in to view this page.");
    window.location.href = "../account/login.html";
  }
}

/**
 * Sets up the logout link in the header.
 */
export function setupLogoutLink() {
  const headerRight = document.getElementById("headerRight");
  if (!headerRight) return;

  headerRight.innerHTML = "";

  const logout = document.createElement("a");
  logout.href = "#";
  logout.textContent = "Log Out";
  logout.title = "Log out";
  logout.setAttribute("aria-label", "Log out and return to login page");

  logout.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "../account/login.html";
  });

  headerRight.appendChild(logout);
}

// ------------------
// Profile rendering helpers
// ------------------

/**
 * Renders a user profile into a given container.
 * @param {Object} profile - User profile data.
 * @param {HTMLElement} container - Container to render profile into.
 * @param {string} token - Bearer token for API requests.
 */
export function renderProfileInfo(profile, container, token) {
  container.innerHTML = `
    <div class="flex flex-col items-center gap-4">
      <img src="${profile.avatar?.url || "https://via.placeholder.com/150"}" 
           alt="${
             profile.name
           }" class="w-32 h-32 rounded-full object-cover border" />
      <h1 class="text-3xl font-bold text-[#455F7D]">${profile.name}</h1>
      <p class="text-gray-600">@${profile.email}</p>
      <button id="followBtn" class="bg-[#F28C8C] hover:bg-[#e06b6b] text-white font-semibold py-2 px-4 rounded transition">
        Follow
      </button>
    </div>
  `;

  const followBtn = document.getElementById("followBtn");
  if (!followBtn) return;

  followBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${profile.name}/follow`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to follow user.");

      followBtn.textContent = "Following";
      followBtn.disabled = true;
      followBtn.classList.replace("bg-[#F28C8C]", "bg-green-500");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  });
}

// ------------------
// Posts rendering helpers
// ------------------

/**
 * Renders a list of posts in a container using a template.
 * @param {Array<Object>} posts - Array of post objects.
 * @param {HTMLElement} container - Container to render posts into.
 */
export function renderUserPosts(posts, container) {
  const template = document.getElementById("postCardTemplate");
  if (!template) return;

  container.innerHTML = "";

  posts.forEach((post) => {
    const clone = template.content.cloneNode(true);

    const img = clone.querySelector("img");
    if (img) {
      img.src = post.media?.url || "https://via.placeholder.com/300x200";
      img.alt = post.media?.alt || post.title;
    }

    const title = clone.querySelector("h3");
    if (title) title.textContent = post.title;

    const snippet = clone.querySelector("p");
    if (snippet) snippet.textContent = post.body?.slice(0, 80) + "...";

    const [viewBtn, editBtn] = clone.querySelectorAll("a");
    if (viewBtn) {
      viewBtn.href = `../post/view.html?id=${post.id}`;
      viewBtn.setAttribute("aria-label", `View post titled ${post.title}`);
      viewBtn.setAttribute("title", `View post: ${post.title}`);
    }
    if (editBtn) {
      editBtn.href = `../post/edit.html?id=${post.id}`;
      editBtn.setAttribute("aria-label", `Edit post titled ${post.title}`);
      editBtn.setAttribute("title", `Edit post: ${post.title}`);
    }

    container.appendChild(clone);
  });
}

/**
 * Renders an empty state message in a container.
 * @param {HTMLElement} container - Container element.
 * @param {string} message - Message to display.
 */
export function renderEmptyState(container, message) {
  container.innerHTML = `<p class="text-center text-gray-600">${message}</p>`;
}
