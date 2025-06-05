document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");  // Ensure 'role' is stored as 'admin'

    console.log("Token:", token);
    console.log("Role:", role);

    // 🚨 If No Token or Role is NOT 'admin', Redirect to Login
    if (!token || role !== "admin") {
        alert("Unauthorized access! Redirecting to login...");
        window.location.href = "/login/login_final.html";  
        return;
    }

    try {
        // ✅ Verify Admin from API
        const response = await fetch("http://localhost:8000/admin/verify-admin", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("API Response:", data); 

        // 🚨 If API Response is Not OK or Admin is False, Redirect
        if (!response.ok || !data.isAdmin) {
            alert("Access denied! Admins only.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login/login_final.html";  
        }
    } catch (error) {
        console.error("❌ Error verifying admin access:", error);
        alert("Error verifying admin access!");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login/login_final.html";  
    }
});

// ✅ Logout Function
function logoutAdmin() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out successfully!");
    window.location.href = "/login/login_final.html";
}
