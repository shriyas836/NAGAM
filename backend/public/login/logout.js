function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    alert("You have been logged out!");
    window.location.href = "/login/login_final.html"; // Redirect to login page
}
