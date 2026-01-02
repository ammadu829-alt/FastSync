// ... (Your Canvas Code) ...

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const passwordInput = document.getElementById('password').value.trim();
        
        const users = JSON.parse(localStorage.getItem('fastsync_users')) || [];
        const validUser = users.find(u => u.email === emailInput && u.password === passwordInput);

        if (validUser) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', validUser.email);
            localStorage.setItem('userName', validUser.name);
            window.location.href = 'index.html';
        } else {
            alert('❌ Invalid Email or Password.');
        }
    });
}

// GOOGLE LOGIN
function handleGoogleLogin(response) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', "Google User");
    localStorage.setItem('userEmail', "ammadu829@gmail.com");
    window.location.href = 'index.html';
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "777353956350-f8n6n9039600iipisqiaat3p76o59msh.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });
};

document.querySelector('.btn-google').onclick = () => {
    google.accounts.id.prompt(); 
};
