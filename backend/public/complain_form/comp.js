document.getElementById('complaintForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // 🔒 ✅ Fetch User ID (Cl_Id) from localStorage
    const token = localStorage.getItem("token");
    const Cl_Id = localStorage.getItem("userId");  // 🆕 Use 'userId' (Fix client_id issue)
    
    if (!token || !Cl_Id) {
        alert("🚫 User ID missing! Please log in again.");
        localStorage.setItem("pendingComplaint", JSON.stringify(getFormData()));  // 📝 Save filled form data
        window.location.href = "/login/login_final.html"; // 🔁 Redirect to login
        return;
    }

    // 📌 Convert Cl_Id to integer (important for MySQL)
    const userId = parseInt(Cl_Id, 10);

    // 📌 Form values fetch karna
    const category = document.getElementById('category').value.trim();
    const complaintSubject = document.getElementById('complaintSubject').value.trim();
    const issueDescription = document.getElementById('issueDescription').value.trim();
    const zone = document.getElementById('zone').value.trim();
    const ward = document.getElementById('ward').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const email = document.getElementById('email').value.trim();

    // ✅ Required Fields Check
    if (!category || !complaintSubject || !issueDescription || !zone || !ward || !firstName || !lastName || !mobileNumber || !email) {
        alert('⚠️ Please fill all required fields!');
        return;
    }

    // ✅ Email Validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        alert("⚠️ Please enter a valid email address (example@gmail.com)");
        return;
    }

    // ✅ Mobile Number Validation
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobileNumber)) {
        alert("⚠️ Please enter a valid 10-digit mobile number.");
        return;
    }

    // ✅ Convert Category Name to Category ID
    const Cat_Id = getCategoryId(category);
    if (!Cat_Id) {
        alert("⚠️ Invalid category selected. Please choose a valid category.");
        return;
    }

    // 🆕 Backend API ke liye correct field names set karna
    const complaintData = {
        Cl_Id: userId,  // ✅ User ID dynamically fetched
        Cat_Id: Cat_Id, // ✅ Correctly mapped category ID
        complaint_subject: complaintSubject,
        issue_description: issueDescription,
        zone: zone,
        ward: ward,
        contact_first_name: firstName,
        contact_last_name: lastName,
        mobile_number: mobileNumber,
        email: email,
        status: "Pending" 
    };

    console.log("📤 Sending Complaint Data:", complaintData); // 🔍 Debugging ke liye

    try {
        const response = await fetch("http://localhost:8000/complaints", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // ✅ Secure request with token
            },
            body: JSON.stringify(complaintData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Complaint submitted successfully!");
            document.getElementById("complaintForm").reset();
            window.location.href = "http://localhost:8000/home.html"; 
        } else {
            alert(`❌ Failed to submit complaint: ${result.error}`);
        }
    } catch (error) {
        console.error("❌ Error submitting complaint:", error);
        alert("❌ Something went wrong. Please try again.");
    }
});

// 🆕 Function: Convert Category Name to Category ID
function getCategoryId(category) {
    const categoryMap = {
        "Sewage": 1,
        "Garbage": 2,
        "Stray Animals": 3,
        "Streetlight": 4
    };
    return categoryMap[category] || null;
}

// 🆕 Function: Store form data before redirecting to login
function getFormData() {
    return {
        category: document.getElementById('category').value.trim(),
        complaintSubject: document.getElementById('complaintSubject').value.trim(),
        issueDescription: document.getElementById('issueDescription').value.trim(),
        zone: document.getElementById('zone').value.trim(),
        ward: document.getElementById('ward').value.trim(),
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        mobileNumber: document.getElementById('mobileNumber').value.trim(),
        email: document.getElementById('email').value.trim()
    };
}

