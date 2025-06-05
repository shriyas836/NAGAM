document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ feed.js loaded successfully!");

  const submitBtn = document.getElementById("submitFeedbackBtn");

  if (!submitBtn) {
      console.error("❌ Submit button not found!");
      return;
  }

  submitBtn.addEventListener("click", async function (event) {
      event.preventDefault();

      // Get values from inputs
      const rating = document.getElementById("ratingValue").value;
      const comment = document.getElementById("comment").value;

      // Manually set Client ID and Complaint ID (Modify as needed)
      const clientId = localStorage.getItem("userId");
      const urlParams = new URLSearchParams(window.location.search);
      const complaintId = urlParams.get("complaintId");
      
      if (!clientId || !complaintId) {
          console.error("❌ Missing Client ID or Complaint ID!");
      }
      

      console.log("📥 Feedback Data:", { complaintId, clientId, rating, comment });

      if (!rating || !comment) {
          alert("❌ Please provide a rating and comment!");
          return;
      }

      const feedbackData = {
          C_Id: complaintId,
          Cl_Id: clientId,
          rating: parseInt(rating, 10),
          comment: comment.trim()
      };

      try {
          const response = await fetch("http://localhost:8000/feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(feedbackData)
          });

          const result = await response.json();
          console.log("📤 Server Response:", result);

          if (response.ok) {
              alert("✅ Feedback submitted successfully!");
              document.getElementById("feedbackPopup").style.display = "none";
              document.getElementById("thankYouPopup").style.display = "block";
          } else {
              alert("❌ Failed to submit feedback: " + result.error);
          }
      } catch (error) {
          console.error("❌ Error submitting feedback:", error);
          alert("❌ Something went wrong. Please try again.");
      }
  });

  document.getElementById("okButton").addEventListener("click", function () {
      window.location.href = "../home.html";
  });
});













