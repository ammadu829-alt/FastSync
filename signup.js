// ... (Your Canvas Code) ...

const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (password !== confirmPassword) { alert('Passwords do not match!'); return; }

        let users = JSON.parse(localStorage.getItem('fastsync_users')) || [];
        if (users.some(u => u.email === email)) { alert('❌ Already registered.'); return; }

        const newUser = { id: Date.now(), name: fullName, email: email, password: password };
        users.push(newUser);
        localStorage.setItem('fastsync_users', JSON.stringify(users));

        alert('✅ Account created! Redirecting to login...');
        window.location.href = 'login.html';
    });
}

// GOOGLE LOGIC
function handleGoogleResponse(response) {
    // In a real app, you would decode response.credential
    const googleUser = {
        name: "Ammad ud din",
        email: "ammadu829@gmail.com",
        method: "google"
    };

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', googleUser.name);
    localStorage.setItem('userEmail', googleUser.email);
    window.location.href = 'index.html';
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "777353956350-f8n6n9039600iipisqiaat3p76o59msh.apps.googleusercontent.com", // Replace this with your actual ID
        callback: handleGoogleResponse
    });
};

document.getElementById('googleSignup').onclick = () => {
    google.accounts.id.prompt(); 
};
