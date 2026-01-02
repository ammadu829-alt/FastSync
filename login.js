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

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const passwordInput = document.getElementById('password').value.trim();
        
        // 1. Fetch from the synchronized key
        const users = JSON.parse(localStorage.getItem('fastsync_users')) || [];

        // 2. Search for the user
        const validUser = users.find(u => 
            u.email === emailInput && u.password === passwordInput
        );

        if (validUser) {
            const submitBtn = loginForm.querySelector('.btn-login');
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // 3. Store login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', validUser.email);
            localStorage.setItem('userName', validUser.name);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            alert('❌ Invalid Email or Password. Please try again.');
            document.getElementById('password').value = '';
        }
    });
}
