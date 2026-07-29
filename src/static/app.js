document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = details.max_participants - details.participants.length;
      const participantsSection = document.createElement("div");
      participantsSection.className = "participants-section";

      const participantsHeading = document.createElement("strong");
      participantsHeading.textContent = "Participants";
      participantsSection.appendChild(participantsHeading);

      if (details.participants.length > 0) {
        const participantsList = document.createElement("div");
        participantsList.className = "participants-list";

        details.participants.forEach((participant) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "participant-chip";
          chip.dataset.activity = name;
          chip.dataset.email = participant;

          const participantName = document.createElement("span");
          participantName.className = "participant-name";
          participantName.textContent = participant;

          const deleteIcon = document.createElement("span");
          deleteIcon.className = "participant-delete";
          deleteIcon.textContent = "×";
          deleteIcon.setAttribute("aria-label", `Remove ${participant}`);

          chip.appendChild(participantName);
          chip.appendChild(deleteIcon);
          participantsList.appendChild(chip);
        });

        participantsSection.appendChild(participantsList);
      } else {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "participants-empty";
        emptyMessage.textContent = "No participants yet.";
        participantsSection.appendChild(emptyMessage);
      }

      const title = document.createElement("h4");
      title.textContent = name;

      const description = document.createElement("p");
      description.innerHTML = `<strong>Description:</strong> ${details.description}`;

      const schedule = document.createElement("p");
      schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

      const availability = document.createElement("p");
      availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

      activityCard.appendChild(title);
      activityCard.appendChild(description);
      activityCard.appendChild(schedule);
      activityCard.appendChild(availability);
      activityCard.appendChild(participantsSection);
      activitiesList.appendChild(activityCard);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  activitiesList.addEventListener("click", async (event) => {
    const chip = event.target.closest(".participant-chip");
    if (!chip) {
      return;
    }

    const { activity, email } = chip.dataset;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        await fetchActivities();
      } else {
        showMessage(result.detail || "Could not remove participant.", "error");
      }
    } catch (error) {
      showMessage("Failed to remove participant. Please try again.", "error");
      console.error("Error removing participant:", error);
    }
  });

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  fetchActivities();
});
