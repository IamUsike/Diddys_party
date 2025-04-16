// Function to get a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Check if user is authenticated
function isAuthenticated() {
  return getCookie("accessToken") !== null;
}

// Show form or error message based on auth status
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("partyForm");
  const errorMessage = document.getElementById("error-message");

  if (isAuthenticated()) {
    form.style.display = "block";
    errorMessage.style.display = "none";
  } else {
    form.style.display = "none";
    errorMessage.style.display = "block";
  }
});
