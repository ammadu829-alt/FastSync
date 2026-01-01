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

// Login Form Handler
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validate email format
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Here you would normally send data to your backend
    // For now, we'll just simulate a successful login
    
    if (email && password) {
        // Show loading state
        const submitBtn = loginForm.querySelector('.btn-login');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Store login state (in a real app, you'd use tokens)
            if (remember) {
                localStorage.setItem('userEmail', email);
            }
            
            // Store user info
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', email.split('@')[0]);
            
            // Redirect to main page
            window.location.href = 'index.html';
        }, 1500);
    }
});

// Google Login Handler
const googleBtn = document.querySelector('.btn-google');

googleBtn.addEventListener('click', function() {
    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<span>Connecting to Google...</span>';
    this.disabled = true;
    
    // Simulate Google OAuth flow
    setTimeout(() => {
        // In a real application, you would:
        // 1. Redirect to Google OAuth URL
        // 2. Get authorization code
        // 3. Exchange for access token
        // 4. Get user info from Google
        
        // For demo purposes, we'll simulate a successful Google login
        const googleUser = {
            email: 'student@nu.edu.pk',
            name: 'FAST Student',
            picture: 'https://via.placeholder.com/150'
        };
        
        // Store user info
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', googleUser.name);
        localStorage.setItem('userEmail', googleUser.email);
        localStorage.setItem('loginMethod', 'google');
        
        // Show success message
        this.innerHTML = '<span>✓ Connected Successfully!</span>';
        this.style.background = 'rgba(34, 197, 94, 0.2)';
        this.style.borderColor = '#22c55e';
        
        // Redirect to main page after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    }, 2000);
});