const modeButton = document.getElementById("modeBtn");

// Check stored theme, default to light if not set
let isLightMode = localStorage.getItem("theme") !== "dark";

function applyTheme() {
  if (isLightMode) {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  } else {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  }
}

// Apply the saved theme on page load
document.addEventListener("DOMContentLoaded", () => {
  isLightMode = localStorage.getItem("theme") !== "dark";
  applyTheme();
});

modeButton.addEventListener("click", function () {
  isLightMode = !isLightMode; // Toggle mode
  localStorage.setItem("theme", isLightMode ? "light" : "dark"); // Save preference
  applyTheme(); // Apply changes
});
