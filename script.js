// 1. --- NETWORK ANIMATION LOGIC ---
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 80; // Kept your preferred count
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

// 2. --- SMOOTH SCROLLING ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 3. --- USER AUTH DISPLAY LOGIC ---
// This checks if a user is logged in and updates the Navbar
document.addEventListener('DOMContentLoaded', () => {
    const userAuthSection = document.getElementById('userAuthSection');
    const ctaTitle = document.getElementById('cta-title');
    const ctaBtn = document.getElementById('cta-btn');

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');

    if (isLoggedIn === 'true' && userName) {
        // Replace Login link with greeting and Logout button
        if (userAuthSection) {
            userAuthSection.innerHTML = `
                <span style="color: white; margin-right: 15px; font-weight: 500;">Hi, ${userName}</span>
                <button onclick="logout()" class="btn-login" style="background: #ff4b2b; color: white; border: none; cursor: pointer; padding: 8px 20px; border-radius: 5px;">Logout</button>
            `;
        }

        // Update Hero/CTA text for a personalized feel
        if(ctaTitle) ctaTitle.textContent = `Welcome Back, ${userName}!`;
        if(ctaBtn) {
            ctaBtn.textContent = "Go to Find Partner";
            ctaBtn.href = "find-partner.html";
        }
    }
});

// 4. --- LOGOUT FUNCTION ---
// Clears storage to fix the "Array(0)" and "No match" console errors
window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    alert('Logged out successfully');
    window.location.href = 'index.html';
};

// 5. --- GOOGLE INITIALIZATION ---
// Prevents "Something went wrong" errors by initializing the client
window.onload = function () {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "777353956350-f8n6n9039600iipisqiaat3p76o59msh.apps.googleusercontent.com",
            callback: (response) => {
                // Handle response if you add Google Login to index later
                console.log("Google response received");
            }
        });
    }
};
