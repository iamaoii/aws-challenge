// Authentication utilities

// Check if user is authenticated
function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
  
      if (payload.exp < currentTime) {
        removeToken();
        return false;
      }
  
      return true;
    } catch (error) {
      removeToken();
      return false;
    }
  }
  
  // Get current user info from JWT
  function getCurrentUser() {
    const token = getToken();
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    } catch (error) {
      return null;
    }
  }
  
  // Logout function
  function logout() {
    removeToken();
    window.location.href = "../index.html";
  }
  
  // Authentication guard for protected pages
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = "../index.html";
      return false;
    }
    return true;
  }
  
  // Show/hide elements based on auth status
  function updateAuthUI() {
    const user = getCurrentUser();
    const userNameElements = document.querySelectorAll(".user-name");
    const authElements = document.querySelectorAll(".nav-auth");
    const navLinks = document.querySelectorAll(".nav-links");
  
    if (user) {
      userNameElements.forEach((el) => (el.textContent = user.name));
      authElements.forEach((el) => (el.style.display = "none"));
      navLinks.forEach((el) => {
        el.innerHTML = `
          <li><a href="dashboard.html">Home</a></li>
          <li><a href="my-events.html">My Events</a></li>
          <li><a href="create-event.html">Create Event</a></li>
          <li><a href="#" onclick="logout()">Logout</a></li>
        `;
      });
    } else {
      authElements.forEach((el) => (el.style.display = "flex"));
      navLinks.forEach((el) => {
        el.innerHTML = `
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        `;
      });
    }
  }
  
  // Handle form submissions with loading states
  async function handleFormSubmit(form, submitHandler) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
  
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Loading...";
  
      await submitHandler();
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  // Show alert messages
  function showAlert(message, type = "error") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      border-radius: 0.5rem;
      color: white;
      background: ${type === "success" ? "#22c55e" : type === "info" ? "#3b82f6" : "#ef4444"};
      z-index: 1000;
    `;
    alertDiv.textContent = message;
  
    const container = document.querySelector(".container") || document.body;
    container.appendChild(alertDiv);
  
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }