$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    // 🔐 If not logged in, redirect to login page
    if (!token || !userId) {
        return window.location.href = "/frontend/Userhandling/login.html";
    }

    // 👁‍🗨 Debug: log token and userId
    console.log("Checking session", { token, userId });

    // 👤 Verify the user role via /profile/:id
    $.ajax({
        method: "GET",
        url: `http://localhost:4000/api/v1/profile/${userId}`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (res) {
            // 🧠 Backend must return: { user: { id, name, role, ... } }
            if (!res.user || res.user.role !== 'customer') {
                // Not a customer, clear session and redirect
                sessionStorage.clear();
                return window.location.href = "/frontend/Userhandling/login.html";
            }

            // ✅ Successful login as customer
            Swal.fire({
                icon: "info",
                title: `Welcome, ${res.user.name}`,
                text: "You are logged in as a customer.",
                timer: 2000,
                showConfirmButton: false
            });

            // 🎯 Edit Profile button
            $("#editProfileBtn").on('click', () => {
                window.location.href = "/frontend/Userhandling/update-profile.html";
            });
        },
        error: function (xhr) {
            console.error("🔴 Failed to verify token or fetch profile", xhr);
            sessionStorage.clear();
            window.location.href = "/frontend/Userhandling/login.html";
        }
    });
});
