// Authentication utilities

// Declare getToken and removeToken functions
function getToken() {
  return localStorage.getItem("jwtToken")
}

function removeToken() {
  localStorage.removeItem("jwtToken")
}

// Check if user is authenticated
function isAuthenticated() {
  const token = getToken()
  if (!token) return false

  try {
    // Basic JWT validation (check if token exists and is not expired)
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000

    if (payload.exp < currentTime) {
      removeToken()
      return false
    }

    return true
  } catch (error) {
    removeToken()
    return false
  }
}

// Get current user info from JWT
function getCurrentUser() {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    }
  } catch (error) {
    return null
  }
}

// Logout function
function logout() {
  removeToken()
  window.location.href = "../index.html"
}

// Authentication guard for protected pages
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "../index.html"
    return false
  }
  return true
}

// Show/hide elements based on auth status
function updateAuthUI() {
  const user = getCurrentUser()
  const userNameElements = document.querySelectorAll(".user-name")
  const authElements = document.querySelectorAll(".auth-required")

  if (user) {
    userNameElements.forEach((el) => (el.textContent = user.name))
    authElements.forEach((el) => (el.style.display = "block"))
  } else {
    authElements.forEach((el) => (el.style.display = "none"))
  }
}

// Handle form submissions with loading states
async function handleFormSubmit(form, submitHandler) {
  const submitBtn = form.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent

  try {
    submitBtn.disabled = true
    submitBtn.textContent = "Loading..."

    await submitHandler()
  } catch (error) {
    showAlert(error.message, "error")
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = originalText
  }
}

// Show alert messages
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type}`
  alertDiv.textContent = message

  const container = document.querySelector(".container") || document.body
  container.insertBefore(alertDiv, container.firstChild)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}
