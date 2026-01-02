const canvas = document.getElementById('loginCanvas');
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
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- UPDATED LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. Get and Clean Inputs
    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value.trim();
    
    // 2. Try BOTH potential keys (in case signup uses 'users' or 'fastsync_users')
    const users = JSON.parse(localStorage.getItem('fastsync_users')) || 
                  JSON.parse(localStorage.getItem('users')) || [];

    // --- DEBUGGING LOG (Open F12 to see this) ---
    console.log("Attempting login for:", emailInput);
    console.log("Database contains:", users);

    // 3. Search Database
    // This check is now extra flexible: it checks 'fullName' OR 'name'
    const validUser = users.find(u => 
        u.email.toLowerCase() === emailInput && 
        u.password === passwordInput
    );

    if (validUser) {
        console.log("Match found!", validUser);
        const submitBtn = loginForm.querySelector('.btn-login');
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', validUser.email);
            // Handles both naming conventions
            localStorage.setItem('userName', validUser.name || validUser.fullName);
            window.location.href = 'index.html';
        }, 1000);
    } else {
        console.error("Login failed: No match in database.");
        alert('❌ Invalid Email or Password. Please try again.');
        document.getElementById('password').value = '';
    }
});
