/**
 * Builds a blog post card from a post object using the template in the DOM.
 *
 * @param {Object} post - The post object containing post data.
 * @param {string} post.id - The unique ID of the post.
 * @param {string} post.title - The title of the post.
 * @param {string} [post.body] - The content/body of the post.
 * @param {Object} [post.media] - Optional media object for the post.
 * @param {string} [post.media.url] - URL of the post image.
 * @param {string} [post.media.alt] - Alt text for the post image.
 * @returns {DocumentFragment} A cloned DOM node ready to append to the post grid.
 */
export const buildUserPostCard = (post) => {
  const template = document.getElementById("postCardTemplate");
  if (!template) return null;

  const clone = template.content.cloneNode(true);

  const img = clone.querySelector("img");
  img.src = post.media?.url || "https://via.placeholder.com/300x200";
  img.alt = post.media?.alt || post.title || "Post image";

  const title = clone.querySelector("h3");
  title.textContent = post.title || "Untitled";

  const snippet = clone.querySelector("p");
  snippet.textContent = `${post.body?.slice(0, 80) || ""}...`;

  const [viewBtn, editBtn] = clone.querySelectorAll("a");

  viewBtn.href = `../post/view.html?id=${post.id}`;
  viewBtn.setAttribute("aria-label", `View post titled ${post.title}`);
  viewBtn.setAttribute("title", `View post: ${post.title}`);

  editBtn.href = `../post/edit.html?id=${post.id}`;
  editBtn.setAttribute("aria-label", `Edit post titled ${post.title}`);
  editBtn.setAttribute("title", `Edit post: ${post.title}`);

  return clone;
};

/**
 * Renders a message in the post grid when there are no posts
 * @param {string} message - The message to display
 */
export const renderEmptyState = (message) => {
  const postGrid = document.getElementById("postGrid");
  if (!postGrid) return;
  postGrid.innerHTML = `<p>${message}</p>`;
};
