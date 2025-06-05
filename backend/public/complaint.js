document.addEventListener("DOMContentLoaded", function () {
    fetchComplaints(); // Load complaints on page load
    fetchSolvedComplaints(); // Load resolved complaints

    // Attach event listeners to filter buttons
    document.querySelectorAll(".filter-buttons").forEach(button => {
        button.addEventListener("click", function () {
            const complaintId = this.dataset.id; // Get complaint ID from button
            console.log("🆔 Complaint ID:", complaintId); // Debugging
            resolveComplaint(complaintId);
        });
    });
});

// ✅ **Fetch & Display All Complaints**
async function fetchComplaints() {
    try {
        const response = await fetch("http://localhost:8000/complaints");
        const data = await response.json();

        console.log("✅ Fetched Complaint Data:", data); // Debugging API response

        if (!Array.isArray(data)) {
            console.error("❌ API did not return an array. Check backend response format.", data);
            return;
        }

        const tableBody = document.getElementById("complaintsTableBody");
        tableBody.innerHTML = ""; // Clear previous data

        data.forEach(complaint => {
            console.log("➡ Processing Complaint:", complaint); // Debugging each complaint object

            const row = document.createElement("tr");
            row.setAttribute("data-subject", complaint.complaint_subject || "Unknown"); // ✅ Set subject attribute

            row.innerHTML = `
                <td>${complaint.C_Id || "N/A"}</td>
                <td>${complaint.complaint_subject || "Unknown"}</td>
                <td>${complaint.issue_description || "No description"}</td>
                <td>${complaint.zone || "No Zone"}</td>
                <td>${complaint.ward || "No Ward"}</td>
                <td>${complaint.contact_first_name} ${complaint.contact_last_name}</td>
                <td>${complaint.mobile_number}</td>
                <td>${complaint.email}</td>
                <td>${complaint.status}</td>
                <td>${new Date(complaint.created_at).toLocaleString()}</td>
                <td>
                    <button class="resolve-btn" data-id="${complaint.C_Id}" 
                    data-email="${complaint.email}" 
                    ${complaint.status === "Resolved" ? "disabled" : ""}>
                    Solve
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // ✅ Attach event listeners to resolve buttons
        document.querySelectorAll(".resolve-btn").forEach(button => {
            button.addEventListener("click", function () {
                resolveComplaint(this.dataset.id, this.dataset.email);
            });
        });

        console.log("✅ Table Rows Generated Successfully!");
    } catch (error) {
        console.error("❌ Error fetching complaints:", error);
    }
}

// ✅ **Send Email Notification After Resolving**
function sendResolutionEmail(userEmail, complaintId) {
    fetch("http://localhost:8000/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: userEmail,
            complaintId: complaintId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`✅ Email sent to ${userEmail}`);
        } else {
            console.log("❌ Failed to send email.");
        }
    })
    .catch(error => console.error("❌ Error sending email:", error));
}

// ✅ **Fetch & Display Resolved Complaints**
function fetchSolvedComplaints() {
    fetch("http://localhost:8000/complaints/solved")
        .then(response => response.json())
        .then(data => {
            let solvedTableBody = document.getElementById("solvedComplaintsBody");
            solvedTableBody.innerHTML = ""; // Clear previous data

            if (!data.length) {
                solvedTableBody.innerHTML = `<tr><td colspan="10">No resolved complaints available</td></tr>`;
                return;
            }

            data.forEach(complaint => {
                let row = `<tr>
                    <td>${complaint.C_Id}</td>
                    <td>${complaint.category || "Unknown"}</td>
                    <td>${complaint.issue_description}</td>
                    <td>${complaint.zone}</td>
                    <td>${complaint.ward}</td>
                    <td>${complaint.contact_first_name} ${complaint.contact_last_name}</td>
                    <td>${complaint.mobile_number}</td>
                    <td>${complaint.email}</td>
                    <td>${complaint.status}</td>
                    <td>${new Date(complaint.created_at).toLocaleString()}</td>
                </tr>`;
                solvedTableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("❌ Error fetching solved complaints:", error));
}

// ✅ **Filter Complaints by Subject**
function filterCategory(subject) {
    const complaints = document.querySelectorAll("#complaint-list tr");

    // ✅ Subject-based mappings
    const subjectMappings = {
        "garbage": ["garbage", "Garbage", "garbage collection", "waste issue"],
        "sewage": ["sewage", "Sewage", "blocked drain", "drainage issue"],
        "street lights": ["street lights", "Street Light", "streetlight broken"],
        "stray animals": ["stray animals", "Stray Animals", "animal problem"]
    };

    complaints.forEach(row => {
        let complaintSubject = row.getAttribute("data-subject");  // ✅ Get subject from attribute

        // ✅ Ensure complaintSubject is valid and lowercase
        complaintSubject = complaintSubject ? complaintSubject.toLowerCase() : "unknown";

        // ✅ Find if subject exists in the mappings
        let subjectMatch = Object.keys(subjectMappings).find(key => 
            subjectMappings[key].some(mappedSubject => mappedSubject.toLowerCase() === complaintSubject)
        );

        // ✅ If subject is not found, set it to "unknown"
        subjectMatch = subjectMatch || "unknown";

        // ✅ Show all if "All" is selected, else filter based on subject
        if (subject === "All" || subjectMatch === subject.toLowerCase()) {
            row.style.display = "";  // Show the row
        } else {
            row.style.display = "none"; // Hide the row
        }
    });
}

async function resolveComplaint(complaintId) {
    if (!confirm("Are you sure you want to resolve this complaint?")) return;

    try {
        const response = await fetch(`http://localhost:8000/admin/resolve-complaint/${complaintId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log("✅ Response:", data);

        if (response.ok) {
            alert("✅ Complaint resolved & Email Sent!");
            fetchComplaints(); // Refresh complaints
            fetchSolvedComplaints(); // Refresh solved complaints
        } else {
            alert("❌ Failed to resolve complaint.");
        }
    } catch (error) {
        console.error("❌ Error resolving complaint:", error);
        alert("❌ Error occurred. Try again!");
    }
}


// ✅ **Show/Hide Solved Complaints Section**
function toggleSolvedSection() {
    let solvedSection = document.getElementById("solvedSection");
    if (solvedSection) {
        solvedSection.style.display = solvedSection.style.display === "none" ? "block" : "none";
    } else {
        console.error("❌ Element with ID 'solvedSection' not found.");
    }
}




