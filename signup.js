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

        if (!termsAccepted) {
            alert('Please accept the Terms & Conditions');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Get existing users using the shared key
        let users = JSON.parse(localStorage.getItem('fastsync_users')) || [];

        // Check for duplicate
        if (users.some(u => u.email === email)) {
            alert('❌ This email is already registered.');
            return;
        }

        // Create new user object
        const newUser = {
            id: Date.now(),
            name: fullName, // Saved as 'name' to match login.js
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
