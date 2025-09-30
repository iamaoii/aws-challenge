function setupLoginForm() {
  if (isAuthenticated()) {
    window.location.href = "dashboard.html";
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    await handleFormSubmit(e.target, async () => {
      const response = await authAPI.login(credentials);
      setToken(response.access_token);
      showAlert("Login successful!", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    });
  });
}

// Initialize login form on page load
document.addEventListener("DOMContentLoaded", setupLoginForm);