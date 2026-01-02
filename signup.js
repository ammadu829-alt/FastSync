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

// Get existing users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Sign Up Form Handler
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const department = document.getElementById('department').value;
    const termsAccepted = document.getElementById('terms').checked;

    // Validation
    if (!termsAccepted) {
        alert('Please accept the Terms & Conditions to continue');
        return;
    }

    // Validate email format
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    // Check password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        document.getElementById('confirmPassword').focus();
        return;
    }

    // Check password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Get existing users
    const users = getUsers();

    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        alert('This email is already registered. Please login or use a different email.');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        password: password, // In production, this should be hashed!
        rollNumber: rollNumber,
        department: department,
        createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    saveUsers(users);

    console.log('✅ New user created:', newUser);
    console.log('📊 Total users now:', users.length);
    console.log('💾 Saved to localStorage with key: "users"');

    // Verify it was saved
    const verifyUsers = JSON.parse(localStorage.getItem('users'));
    console.log('🔍 Verification - Users in storage:', verifyUsers.length);

    // Show loading state
    const submitBtn = signupForm.querySelector('.btn-signup');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    // Simulate account creation
    setTimeout(() => {
        // Auto login the user
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userEmail', email);
        
        // Show success and redirect
        alert('✓ Account created successfully! Welcome to FASTSync!');
        window.location.href = 'find-partner.html';
    }, 1500);
});

// Google Sign Up Handler
document.getElementById('googleSignup').addEventListener('click', function() {
    const originalText = this.innerHTML;
    this.innerHTML = '<span>Connecting to Google...</span>';
    this.disabled = true;
    
    setTimeout(() => {
        // Simulate Google OAuth
        const googleUser = {
            id: Date.now(),
            fullName: 'Google User',
            email: 'user@nu.edu.pk',
            rollNumber: 'N/A',
            department: 'N/A',
            loginMethod: 'google',
            createdAt: new Date().toISOString()
        };
        
        // Check if user exists
        const users = getUsers();
        const existingUser = users.find(u => u.email === googleUser.email);
        
        if (!existingUser) {
            users.push(googleUser);
            saveUsers(users);
        }
        
        // Login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', googleUser.fullName);
        localStorage.setItem('userEmail', googleUser.email);
        localStorage.setItem('loginMethod', 'google');
        
        this.innerHTML = '<span>✓ Connected Successfully!</span>';
        this.style.background = 'rgba(34, 197, 94, 0.2)';
        this.style.borderColor = '#22c55e';
        
        setTimeout(() => {
            window.location.href = 'find-partner.html';
        }, 1000);
        
    }, 2000);
});

// Real-time password match validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#ef4444';
    } else {
        this.style.borderColor = 'rgba(138, 43, 226, 0.3)';
    }
});
