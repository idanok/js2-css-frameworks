import { sanitize, injectMetaDescription, setupShareButton, initHeaderLinks } from './viewHelpers.js';

// ------------------
// Access check
// ------------------
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const postId = new URLSearchParams(window.location.search).get("id");

if (!token || !userName || !postId) {
    alert("You must be logged in and have a valid post ID to view.");
    window.location.href = "../account/login.html";
}

// ------------------
// Load single post
// ------------------
async function loadPost(postId, userName) {
    const postTitleEl = document.getElementById("postTitle");
    const postBodyEl = document.getElementById("postBody");
    const postImageEl = document.getElementById("postImage");

    // Show loading state
    if (postTitleEl) postTitleEl.textContent = "Loading...";
    if (postBodyEl) postBodyEl.textContent = "";

    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`);
        const { data: post } = await response.json();

        if (!response.ok || !post) throw new Error("Failed to load the post.");

        // Populate content
        postTitleEl?.textContent = sanitize(post.title);
        postBodyEl?.textContent = sanitize(post.body);

        if (post.media?.url) {
            postImageEl.src = sanitize(post.media.url);
            postImageEl.alt = sanitize(post.media.alt || post.title);
            postImageEl.classList.remove("hidden");
        } else {
            postImageEl?.classList.add("hidden");
        }

        // Setup share button
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${post.id}`;
        setupShareButton(shareUrl);

        // Inject meta description (truncated for SEO)
        const metaDesc = post.body?.slice(0, 160) || post.title || "Blog post";
        injectMetaDescription({ title: post.title, body: metaDesc });

    } catch (error) {
        console.error(error);
        postTitleEl?.textContent = "Unable to load post.";
        postBodyEl?.textContent = "Sorry, we couldn’t retrieve the post content.";
        postImageEl?.classList.add("hidden");
        alert("There was an error loading the post. Please try again later.");
    }
}

// ------------------
// DOM ready
// ------------------
document.addEventListener("DOMContentLoaded", () => {
    // Initialize header links
    initHeaderLinks();

    // Load post content
    loadPost(postId, userName);
});

