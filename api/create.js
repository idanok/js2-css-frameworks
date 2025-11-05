import {
  protectPage,
  setupLogoutLink,
  setupCreatePostForm,
} from "./createHelpers.js";

document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  setupLogoutLink();
  setupCreatePostForm();
});
