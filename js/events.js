// Events management functionality

let allEvents = []
const userRegistrations = new Set()

// Declare API variables
const eventsAPI = {
  getAll: async () => {
    // Mock implementation for demonstration
    return [
      { id: 1, title: "Event 1", date: "2023-10-01T12:00:00", location: "Location 1", description: "Description 1" },
      { id: 2, title: "Event 2", date: "2023-10-02T14:00:00", location: "Location 2", description: "Description 2" },
    ]
  },
  register: async (eventId) => {
    // Mock implementation for demonstration
    console.log(`Registered for event ${eventId}`)
  },
  unregister: async (eventId) => {
    // Mock implementation for demonstration
    console.log(`Unregistered from event ${eventId}`)
  },
}

const usersAPI = {
  getMyEvents: async (userId) => {
    // Mock implementation for demonstration
    return [{ id: 1 }, { id: 2 }]
  },
}

// Declare utility functions
const getCurrentUser = () => {
  // Mock implementation for demonstration
  return { id: 1 }
}

const showAlert = (message, type) => {
  // Mock implementation for demonstration
  console.log(`Alert (${type}): ${message}`)
}

// Load all events from API
async function loadEvents() {
  const loadingSpinner = document.getElementById("loadingSpinner")
  const eventsContainer = document.getElementById("eventsContainer")
  const noEvents = document.getElementById("noEvents")

  try {
    loadingSpinner.style.display = "block"
    eventsContainer.style.display = "none"
    noEvents.style.display = "none"

    const events = await eventsAPI.getAll()
    allEvents = events

    if (events.length === 0) {
      loadingSpinner.style.display = "none"
      noEvents.style.display = "block"
      return
    }

    renderEvents(events)
    loadingSpinner.style.display = "none"
    eventsContainer.style.display = "grid"
  } catch (error) {
    loadingSpinner.style.display = "none"
    showAlert("Failed to load events: " + error.message, "error")
  }
}

// Render events in the grid
function renderEvents(events) {
  const container = document.getElementById("eventsContainer")
  container.innerHTML = ""

  events.forEach((event) => {
    const eventCard = createEventCard(event)
    container.appendChild(eventCard)
  })
}

// Create individual event card
function createEventCard(event) {
  const card = document.createElement("div")
  card.className = "card"

  const isRegistered = userRegistrations.has(event.id)
  const eventDate = formatEventDate(event.date)
  const eventTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  card.innerHTML = `
        <div class="card-title">${escapeHtml(event.title)}</div>
        <div class="card-meta">
            <div>📅 ${eventDate} at ${eventTime}</div>
            <div>📍 ${escapeHtml(event.location)}</div>
        </div>
        <div class="card-description">
            ${escapeHtml(event.description)}
        </div>
        <div class="card-actions">
            <button 
                class="btn ${isRegistered ? "btn-danger" : "btn-primary"}" 
                onclick="${isRegistered ? `unregisterFromEvent(${event.id})` : `registerForEvent(${event.id})`}"
                id="btn-${event.id}"
            >
                ${isRegistered ? "Cancel Registration" : "Register"}
            </button>
        </div>
    `

  return card
}

// Register for an event
async function registerForEvent(eventId) {
  const button = document.getElementById(`btn-${eventId}`)
  const originalText = button.textContent

  try {
    button.disabled = true
    button.textContent = "Registering..."

    await eventsAPI.register(eventId)
    userRegistrations.add(eventId)

    button.textContent = "Cancel Registration"
    button.className = "btn btn-danger"
    button.onclick = () => unregisterFromEvent(eventId)
    button.disabled = false

    showAlert("Successfully registered for event!", "success")
  } catch (error) {
    button.disabled = false
    button.textContent = originalText
    showAlert("Failed to register: " + error.message, "error")
  }
}

// Unregister from an event
async function unregisterFromEvent(eventId) {
  const button = document.getElementById(`btn-${eventId}`)
  const originalText = button.textContent

  try {
    button.disabled = true
    button.textContent = "Cancelling..."

    await eventsAPI.unregister(eventId)
    userRegistrations.delete(eventId)

    button.textContent = "Register"
    button.className = "btn btn-primary"
    button.onclick = () => registerForEvent(eventId)
    button.disabled = false

    showAlert("Registration cancelled successfully!", "success")
  } catch (error) {
    button.disabled = false
    button.textContent = originalText
    showAlert("Failed to cancel registration: " + error.message, "error")
  }
}

// Filter events based on search input
function filterEvents(searchTerm) {
  const filteredEvents = allEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  renderEvents(filteredEvents)

  const noEvents = document.getElementById("noEvents")
  const eventsContainer = document.getElementById("eventsContainer")

  if (filteredEvents.length === 0 && searchTerm.trim() !== "") {
    eventsContainer.style.display = "none"
    noEvents.style.display = "block"
    noEvents.innerHTML = `
            <h3>No events found</h3>
            <p>No events match your search for "${escapeHtml(searchTerm)}"</p>
        `
  } else if (filteredEvents.length === 0) {
    eventsContainer.style.display = "none"
    noEvents.style.display = "block"
    noEvents.innerHTML = `
            <h3>No events found</h3>
            <p>Be the first to create an event in your community!</p>
            <a href="create-event.html" class="btn btn-primary">Create Event</a>
        `
  } else {
    eventsContainer.style.display = "grid"
    noEvents.style.display = "none"
  }
}

// Load user's registered events
async function loadUserEvents() {
  const user = getCurrentUser()
  if (!user) return

  try {
    const userEvents = await usersAPI.getMyEvents(user.id)
    userEvents.forEach((event) => userRegistrations.add(event.id))
  } catch (error) {
    console.error("Failed to load user events:", error)
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Format date for display
function formatEventDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
