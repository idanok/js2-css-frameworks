import { setupLogoutLink } from "./usersHelpers.js";
setupLogoutLink();

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("accessToken");
  const apiKey = localStorage.getItem("noroffApiKey");
  const myUser = localStorage.getItem("userName");

  const usersGrid = document.getElementById("usersGrid");
  const errorMessage = document.getElementById("errorMessage");
  const searchInput = document.getElementById("searchUsers");

  if (!token || !apiKey || !myUser) {
    if (errorMessage)
      errorMessage.textContent =
        "Missing token, API key, or username. Please log in again.";
    return;
  }

  let allUsers = [];
  let myFollowing = [];

  /** --- Button Helpers --- */
  const setBtnState = (btn, text, colorClass) => {
    btn.textContent = text;
    btn.disabled = false;
    btn.className =
      btn.className.replace(/bg-\S+/g, "").trim() + ` ${colorClass}`;
  };

  const setBtnLoading = (btn, msg = "…") => {
    btn._prevText = btn.textContent;
    btn.textContent = msg;
    btn.disabled = true;
  };

  /** --- API Calls --- */
  const fetchMyFollowing = async () => {
    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${myUser}?_following=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
        }
      );
      const data = await res.json();
      myFollowing = res.ok
        ? (data.data?.following || []).map((u) => u.name)
        : [];
    } catch {
      myFollowing = [];
      alert("Unable to load following list.");
    }
  };

  const apiFollow = async (username) => {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${username}/follow`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(
        data?.errors?.[0]?.message || `Follow failed (${res.status})`
      );
    return data;
  };

  const apiUnfollow = async (username) => {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${username}/unfollow`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(
        data?.errors?.[0]?.message || `Unfollow failed (${res.status})`
      );
    return data;
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://v2.api.noroff.dev/social/profiles", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.errors?.[0]?.message || `Failed to fetch users (${res.status})`
        );
      allUsers = data.data || [];
      await fetchMyFollowing();
      renderUsers(allUsers);
    } catch (err) {
      if (errorMessage)
        errorMessage.textContent = `Error fetching users: ${err.message}`;
      alert("Unable to load users.");
    }
  };

  /** --- Render Users --- */
  const renderUsers = (users) => {
    usersGrid.innerHTML = "";
    if (!users?.length) {
      usersGrid.innerHTML = `<p class="text-center text-gray-600 col-span-full">No users found.</p>`;
      return;
    }

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow-md p-4 flex flex-col justify-between";

      const left = document.createElement("div");
      left.className = "flex items-center gap-4 mb-4";

      const img = document.createElement("img");
      img.src = user.avatar?.url || "https://via.placeholder.com/80";
      img.alt = user.avatar?.alt || user.name;
      img.className = "w-16 h-16 rounded-full object-cover border";

      const info = document.createElement("div");
      info.innerHTML = `<h2 class="font-bold text-lg text-[#455F7D]">${user.name}</h2>
                        <p class="text-sm text-gray-600">@${user.email}</p>`;

      left.append(img, info);

      const actions = document.createElement("div");
      actions.className = "flex gap-2 mt-auto";

      const viewBtn = document.createElement("button");
      viewBtn.dataset.username = user.name;
      viewBtn.className =
        "viewPostsBtn bg-[#455F7D] hover:bg-[#374c62] text-white text-sm font-semibold py-1.5 px-3 rounded transition";
      viewBtn.textContent = "View Posts";
      actions.appendChild(viewBtn);

      if (user.name !== myUser) {
        const isFollowing = myFollowing.includes(user.name);
        const followBtn = document.createElement("button");
        followBtn.dataset.username = user.name;
        followBtn.className = `followBtn text-white text-sm font-semibold py-1.5 px-3 rounded transition ${
          isFollowing ? "bg-green-500" : "bg-[#F28C8C]"
        }`;
        followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
        actions.appendChild(followBtn);
      }

      card.append(left, actions);
      usersGrid.appendChild(card);
    });

    attachButtons();
  };

  /** --- Button Events --- */
  const attachButtons = () => {
    document.querySelectorAll(".viewPostsBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem("selectedUser", btn.dataset.username);
        window.location.href = "../social/user-posts.html";
      });
    });

    document.querySelectorAll(".followBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const username = btn.dataset.username;
        const currentlyFollowing = myFollowing.includes(username);
        if (btn.disabled) return;

        try {
          setBtnLoading(btn, "Saving…");
          if (!currentlyFollowing) {
            await apiFollow(username);
            if (!myFollowing.includes(username)) myFollowing.push(username);
            setBtnState(btn, "Unfollow", "bg-green-500");
          } else {
            await apiUnfollow(username);
            myFollowing = myFollowing.filter((u) => u !== username);
            setBtnState(btn, "Follow", "bg-[#F28C8C]");
          }
        } catch (err) {
          btn.disabled = false;
          btn.textContent = currentlyFollowing ? "Unfollow" : "Follow";
          alert(err.message || "Action failed");
        }
      });
    });
  };

  /** --- Search Users --- */
  if (searchInput) {
    searchInput.addEventListener("input", async (e) => {
      const q = e.target.value.trim();
      if (!q) return renderUsers(allUsers);

      try {
        const res = await fetch(
          `https://v2.api.noroff.dev/social/profiles/search?q=${encodeURIComponent(
            q
          )}`,
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
            data?.errors?.[0]?.message || `Search failed (${res.status})`
          );
        renderUsers(data.data || []);
      } catch (err) {
        if (errorMessage)
          errorMessage.textContent = `Search error: ${err.message}`;
      }
    });
  }

  // Initialize
  fetchUsers();
});
