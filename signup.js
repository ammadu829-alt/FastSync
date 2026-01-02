const canvas = document.getElementById('signupCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 60;
const maxDistance = 150;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(102, 126, 234, ${1 - distance / maxDistance})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- SIGN UP LOGIC ---
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const termsAccepted = document.getElementById('terms').checked;

        if (!termsAccepted) { alert('Please accept the Terms & Conditions'); return; }
        if (password !== confirmPassword) { alert('Passwords do not match!'); return; }
        if (password.length < 6) { alert('Password must be at least 6 characters long'); return; }

        let users = JSON.parse(localStorage.getItem('fastsync_users')) || [];
        if (users.some(u => u.email === email)) {
            alert('❌ This email is already registered.');
            return;
        }

        const newUser = {
            id: Date.now(),
            name: fullName,
            email: email,
            password: password
        };

        users.push(newUser);
        localStorage.setItem('fastsync_users', JSON.stringify(users));

        const submitBtn = signupForm.querySelector('.btn-signup');
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('✅ Account created successfully!');
            window.location.href = 'login.html';
        }, 1500);
    });
}

// --- NEW GOOGLE SIGNUP LOGIC ---
function handleGoogleResponse(response) {
    // This decodes the Google data (for a real app, you'd send 'response.credential' to a backend)
    // For this project, we simulate the "Account Chosen" action
    const googleUser = {
        id: Date.now(),
        name: "Google User", 
        email: "student@nu.edu.pk",
        loginMethod: 'google'
    };

    let users = JSON.parse(localStorage.getItem('fastsync_users')) || [];
    if (!users.some(u => u.email === googleUser.email)) {
        users.push(googleUser);
        localStorage.setItem('fastsync_users', JSON.stringify(users));
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', googleUser.name);
    localStorage.setItem('userEmail', googleUser.email);
    window.location.href = 'find-partner.html';
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // You can replace this with a real ID later
        callback: handleGoogleResponse
    });
};

const googleSignupBtn = document.getElementById('googleSignup');
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
        // This opens the real Google Account Switcher
        google.accounts.id.prompt(); 
    });
}
