console.log("Admin JS is loaded!");

document.addEventListener("DOMContentLoaded", function () {
    fetchComplaints();
});

function fetchComplaints() {
    fetch("http://172.20.132.32:8000/complaints") // ✅ Ensure correct backend URL
        .then(response => response.json())
        .then(data => {
            console.log("API response:", data);
            let complaintsTable = document.getElementById("complaintsTable");
            if (!complaintsTable) {
                console.error("Table with ID 'complaintsTable' not found!");
                return;
            }
            complaintsTable.innerHTML = ""; // ✅ Clear old data

            data.forEach(complaint => {
                let row = `<tr>
                    <td>${complaint.C_Id}</td>
                    <td>${complaint.category}</td>
                    <td>${complaint.description}</td>
                    <td>${complaint.status}</td>
                    <td>
                        <button class="resolve-btn" data-id="${complaint.C_Id}">Resolve</button>
                    </td>
                </tr>`;
                complaintsTable.insertAdjacentHTML("beforeend", row); // ✅ Prevent overwriting event listeners
            });

            // ✅ Attach event listeners separately
            document.querySelectorAll(".resolve-btn").forEach(button => {
                button.addEventListener("click", function () {
                    resolveComplaint(this.getAttribute("data-id"));
                });
            });
        })
        .catch(error => console.error("Error fetching complaints:", error));
}

async function resolveComplaint(complaintId) {
    try {
        const response = await fetch(`http://172.20.132.32:8000/admin/update-complaint-status/${complaintId}`, { // ✅ Fix API URL
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Resolved" })
        });

        const data = await response.json();
        alert(data.message);  // ✅ Show confirmation

        // ✅ Refresh the complaints list after resolving
        fetchComplaints();
    } catch (error) {
        console.error("Error resolving complaint:", error);
    }
}




function adminLogin() {
fetch("http://localhost:8000/admin/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "aruj.jain@nagam.in",
        password: "aruj_jain123"
    })
})
.then(response => response.json())
.then(data => {
    console.log("Login Response:", data);  // 🔍 Check in browser console

    if (data.token) {
        localStorage.setItem("adminToken", data.token);  // ✅ Store JWT Token
        localStorage.setItem("role", "admin");  // ✅ Store Admin Role
        window.location.href = "admin.html"; // ✅ Redirect to Admin Dashboard
    } else {
        alert("Invalid email or password!");
    }
})
.catch(error => console.error("Login Error:", error));
}


