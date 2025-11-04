// ------------------
// Retrieve credentials
// ------------------
const token = localStorage.getItem("accessToken");
const apiKey = localStorage.getItem("noroffApiKey");
const userName = localStorage.getItem("userName");

// Redirect if not logged in
if (!token || !userName) {
  alert("You must be logged in to access this page.");
  window.location.href = "../account/login.html";
  throw new Error("Access denied. User not authenticated.");
}

// ------------------
// Initialize header links
// ------------------
/**
 * Sets up the logout link in the header for authenticated users
 */
function initHeaderLinks() {
  const headerRight = document.getElementById("headerRight");
  if (!headerRight) return;

  headerRight.innerHTML = "";

  const logoutLink = document.createElement("a");
  logoutLink.href = "#";
  logoutLink.textContent = "Log Out";
  logoutLink.className = "hover:underline font-semibold";
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("noroffApiKey");
    window.location.href = "../account/login.html";
  });

  headerRight.appendChild(logoutLink);
}

// ------------------
// URL validation
// ------------------
/**
 * Checks if a string is a valid URL
 * @param {string} string
 * @returns {boolean}
 */
function isValidUrl(string) {
  try {
    return Boolean(new URL(string));
  } catch {
    return false;
  }
}

// ------------------
// Fetch current profile
// ------------------
/**
 * Fetches the current user's profile from the API
 * @async
 * @returns {Promise<Object>} Profile data
 * @throws Will throw an error if fetch fails
 */
async function fetchProfile() {
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${userName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    const data = await res.json();

    if (!res.ok)
      throw new Error(data?.errors?.[0]?.message || "Failed to fetch profile");
    return data.data;
  } catch (err) {
    alert(`Error fetching profile: ${err.message}`);
    throw err;
  }
}

// ------------------
// Render profile
// ------------------
/**
 * Renders profile data on the page and pre-fills the edit form
 * @param {Object} profile
 */
function renderProfile(profile) {
  const profileNameEl = document.getElementById("profileName");
  const profileUsernameEl = document.getElementById("profileUsername");
  const profileBioEl = document.getElementById("profileBio");
  const profileEmailEl = document.getElementById("profileEmail");
  const profileJoinedEl = document.getElementById("profileJoined");
  const imgEl = document.getElementById("profileImage");

  if (
    !profileNameEl ||
    !profileUsernameEl ||
    !profileBioEl ||
    !profileEmailEl ||
    !profileJoinedEl ||
    !imgEl
  )
    return;

  profileNameEl.textContent = profile.name;
  profileUsernameEl.textContent = `@${profile.name}`;
  profileBioEl.textContent = profile.bio || "";
  profileEmailEl.textContent = profile.email;
  profileJoinedEl.textContent = new Date(profile.created).toLocaleDateString();

  imgEl.src = profile.avatar?.url || "https://via.placeholder.com/150";
  imgEl.alt = profile.avatar?.alt || profile.name;

  // Prefill edit form
  const bioInput = document.getElementById("bio");
  const avatarUrlInput = document.getElementById("avatarUrl");
  if (bioInput) bioInput.value = profile.bio || "";
  if (avatarUrlInput) avatarUrlInput.value = profile.avatar?.url || "";
}

// ------------------
// Update profile
// ------------------
/**
 * Sends updated profile data to the API
 * @async
 * @param {Object} update
 */
async function updateProfile(update) {
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${userName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      }
    );

    const data = await res.json();

    if (!res.ok)
      throw new Error(data?.errors?.[0]?.message || "Failed to update profile");

    alert("Profile updated successfully!");
    renderProfile(data.data);
  } catch (err) {
    alert(`Error updating profile: ${err.message}`);
  }
}

// ------------------
// DOMContentLoaded
// ------------------
document.addEventListener("DOMContentLoaded", async () => {
  initHeaderLinks();

  // Load profile
  try {
    const profile = await fetchProfile();
    renderProfile(profile);
  } catch {
    alert("Unable to load profile. Please refresh or log in again.");
    return;
  }

  // Handle edit form submission
  const form = document.getElementById("editProfileForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bio = document.getElementById("bio")?.value.trim() || "";
    const avatarUrl = document.getElementById("avatarUrl")?.value.trim() || "";

    const update = {};

    if (bio) update.bio = bio;

    if (avatarUrl) {
      if (!isValidUrl(avatarUrl)) {
        alert("Avatar URL must be a valid URL");
        return;
      }
      update.avatar = { url: avatarUrl, alt: `Avatar for ${userName}` };
    }

    if (!Object.keys(update).length) {
      alert("Please provide at least one field to update");
      return;
    }

    await updateProfile(update);
  });
});
