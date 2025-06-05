
document.addEventListener("DOMContentLoaded", async function () {
    const feedbackContainer = document.getElementById("feedback-section");
    const submitButton = document.getElementById("submitFeedback");

    // ✅ Function to generate star ratings
    function generateStars(rating) {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    }

    // ✅ Fetch and display feedback
    async function loadFeedback() {
        try {
            const response = await fetch("http://localhost:8000/feedback"); // Adjust based on your API
            if (!response.ok) throw new Error("Failed to fetch feedback.");

            const feedbackData = await response.json();
            feedbackContainer.innerHTML = ""; // Clear old feedback

            feedbackData.forEach(feedback => {
                console.log("🔍 Feedback Entry:", feedback); // Debugging each feedback

                let userName = feedback.name || "Anonymous";
                let feedbackHTML = `
                    <div class="feedback">
                        <p>👤 <b>${userName}</b> - ${new Date(feedback.created_at).toLocaleString()}</p>
                        <p>${feedback.comment}</p>
                        <p>⭐ ${generateStars(feedback.rating)}</p>
                    </div>
                `;
                feedbackContainer.innerHTML += feedbackHTML;
            });
        } catch (error) {
            console.error("❌ Error fetching feedback:", error);
            feedbackContainer.innerHTML = `<p>Failed to load feedback.</p>`;
        }
    }
// ✅ Submit feedback
if (submitButton) {
    submitButton.addEventListener("click", async function () {
        const comment = document.getElementById("feedbackText").value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;

        // ✅ Fetch correct values from localStorage and ensure they are numbers
        const Cl_Id = parseInt(localStorage.getItem("userId"), 10);
        const C_Id = parseInt(localStorage.getItem("complaintId"), 10);

        // ✅ Debugging
        console.log("📩 LocalStorage User ID:", localStorage.getItem("userId"));
        console.log("📩 LocalStorage Complaint ID:", localStorage.getItem("complaintId"));
        console.log("✅ Cl_Id (User ID):", Cl_Id);
        console.log("✅ C_Id (Complaint ID):", C_Id);

        // ✅ Validation Check
        if (isNaN(Cl_Id) || isNaN(C_Id)) {
            alert("🚫 Invalid User or Complaint ID!");
            return;
        }
        if (!comment) {
            alert("🚫 Please enter a comment!");
            return;
        }
        if (!rating) {
            alert("🚫 Please select a rating!");
            return;
        }

        const feedbackData = { Cl_Id, C_Id, comment, rating };

        try {
            const response = await fetch("http://localhost:8000/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedbackData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Server error");
            }

            alert(result.message);
            document.getElementById("feedbackText").value = ""; // Clear input field
            document.querySelector('input[name="rating"]:checked').checked = false; // Clear rating selection
            loadFeedback(); // Refresh feedback section after submission
        } catch (error) {
            console.error("❌ Error submitting feedback:", error);
            alert("Failed to submit feedback!");
        }
    });
}

    // // ✅ Submit feedback
    // if (submitButton) {
    //     submitButton.addEventListener("click", async function () {
    //         const comment = document.getElementById("feedbackText").value;
    //         const rating = document.querySelector('input[name="rating"]:checked')?.value;

    //         // ✅ Fetch correct values from localStorage and ensure they are numbers
    //         const Cl_Id = parseInt(localStorage.getItem("userId"), 10);
    //         const C_Id = parseInt(localStorage.getItem("complaintId"), 10);

    //         // ✅ Debugging
    //         console.log("✅ Cl_Id (User ID):", Cl_Id);
    //         console.log("✅ C_Id (Complaint ID):", C_Id);

    //         // ✅ Validation Check
    //         if (!Cl_Id || isNaN(Cl_Id) || !C_Id || isNaN(C_Id) || !comment || !rating) {
    //             alert("🚫 Please fill all fields correctly before submitting!");
    //             return;
    //         }

    //         const feedbackData = { Cl_Id, C_Id, comment, rating };

    //         try {
    //             const response = await fetch("http://localhost:8000/feedback", {
    //                 method: "POST",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify(feedbackData),
    //             });

    //             const result = await response.json();
    //             alert(result.message);
    //             document.getElementById("feedbackText").value = ""; // Clear input field
    //             document.querySelector('input[name="rating"]:checked').checked = false; // Clear rating selection
    //             loadFeedback(); // Refresh feedback section after submission
    //         } catch (error) {
    //             console.error("❌ Error submitting feedback:", error);
    //             alert("Failed to submit feedback!");
    //         }
    //     });
    // }

    // ✅ Load feedback on page load
    loadFeedback();
});

document.addEventListener("DOMContentLoaded", async function () {
  const feedbackContainer = document.getElementById("feedback-section");

  function generateStars(rating) {
      return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  try {
      const response = await fetch("http://localhost:8000/feedback"); // Adjust based on your API
      const feedbackData = await response.json();

      feedbackContainer.innerHTML = ""; // Clear old feedback

      feedbackData.forEach(feedback => {
        console.log("🔍 Feedback Entry:", feedback); // Debugging each feedback

          let userName = feedback.name || "Anonymous";
          let feedbackHTML = `
              <div class="feedback">
                  <p>👤 <b>${userName}</b> - ${new Date(feedback.created_at).toLocaleString()}</p>
                  <p>${feedback.comment}</p>
                  <p>⭐ ${generateStars(feedback.rating)}</p>
              </div>
          `;
          feedbackContainer.innerHTML += feedbackHTML;
      });

  } catch (error) {
      console.error("❌ Error fetching feedback:", error);
      feedbackContainer.innerHTML = `<p>Failed to load feedback.</p>`;
  }
});

  