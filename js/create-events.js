function setupCreateEvent() {
  requireAuth();
  updateAuthUI();

  const form = document.getElementById("createEventForm");
  const previewSection = document.getElementById("eventPreview");
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const locationInput = document.getElementById("location");
  const categoryInput = document.getElementById("category");
  const requirementsInput = document.getElementById("requirements");
  const contactInfoInput = document.getElementById("contactInfo");

  dateInput.min = new Date().toISOString().split("T")[0];

  [titleInput, descriptionInput, dateInput, timeInput, locationInput, categoryInput, requirementsInput, contactInfoInput].forEach(
    (input) => {
      input.addEventListener("input", updatePreview);
    }
  );

  function updatePreview() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const location = locationInput.value.trim();
    const category = categoryInput.value;
    const requirements = requirementsInput.value.trim();
    const contactInfo = contactInfoInput.value.trim();

    if (title || description || date || location) {
      previewSection.style.display = "block";
      document.getElementById("previewTitle").textContent = title || "Event Title";
      document.getElementById("previewDescription").textContent =
        description || "Event description will appear here...";

      let dateTimeText = "📅 ";
      if (date && time) {
        const eventDate = new Date(date + "T" + time);
        dateTimeText +=
          eventDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
          " at " +
          eventDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
      } else if (date) {
        dateTimeText += new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        dateTimeText += "Date & Time";
      }
      document.getElementById("previewDateTime").textContent = dateTimeText;

      document.getElementById("previewLocation").textContent = "📍 " + (location || "Location");
      document.getElementById("previewCategory").textContent = "🏷️ " + (category ? getCategoryName(category) : "Category");

      const requirementsDiv = document.getElementById("previewRequirements");
      if (requirements) {
        requirementsDiv.style.display = "block";
        document.getElementById("previewRequirementsText").textContent = requirements;
      } else {
        requirementsDiv.style.display = "none";
      }
    } else {
      previewSection.style.display = "none";
    }
  }

  function getCategoryName(value) {
    const categories = {
      community: "Community Service",
      social: "Social Gathering",
      educational: "Educational",
      sports: "Sports & Recreation",
      arts: "Arts & Culture",
      business: "Business & Networking",
      other: "Other",
    };
    return categories[value] || value;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const eventData = {
      title: formData.get("title"),
      description: formData.get("description") || null,
      date: formData.get("date"),
      time: formData.get("time"),
      location: formData.get("location"),
      category: formData.get("category") || null,
      max_attendees: formData.get("maxAttendees") ? parseInt(formData.get("maxAttendees")) : null,
      requirements: formData.get("requirements") || null,
      contact_info: formData.get("contactInfo") || null,
      image_url: null, // Add image upload logic later if needed
    };

    await handleFormSubmit(e.target, async () => {
      await eventsAPI.create(eventData);
      showAlert("Event created successfully!", "success");

      setTimeout(() => {
        window.location.href = "my-events.html";
      }, 1500);
    });
  });

  function addCharacterCounter(inputId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.createElement("small");
    counter.className = "character-counter";
    counter.style.float = "right";
    counter.style.color = "#6b7280";

    function updateCounter() {
      const remaining = maxLength - input.value.length;
      counter.textContent = `${remaining} characters remaining`;
      counter.style.color = remaining < 20 ? "#dc2626" : "#6b7280";
    }

    input.addEventListener("input", updateCounter);
    input.parentNode.appendChild(counter);
    updateCounter();
  }

  addCharacterCounter("title", 100);
  addCharacterCounter("description", 1000);
  addCharacterCounter("requirements", 500);
  addCharacterCounter("contactInfo", 100);
}

// Initialize create event page
setupCreateEvent();