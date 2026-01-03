// 1. Animated network background (Kept exactly as requested)
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

// 2. FIREBASE CONFIGURATION (Enables the Host to see all users)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/", // REPLACE WITH YOUR REAL URL
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 3. Sign Up Form Handler
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

    // Validation logic (Kept exactly as requested)
    if (!termsAccepted) {
        alert('Please accept the Terms & Conditions to continue');
        return;
    }
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Show loading state
    const submitBtn = signupForm.querySelector('.btn-signup');
    submitBtn.textContent = 'Connecting to Cloud...';
    submitBtn.disabled = true;

    // CREATE NEW USER DATA
    const newUser = {
        fullName: fullName,
        email: email,
        password: password, 
        rollNumber: rollNumber,
        department: department,
        createdAt: new Date().toISOString()
    };

    // SAVE TO FIREBASE (This makes it show on your Admin Dashboard)
    // We use a sanitized version of the email as the ID (replacing dots with underscores)
    const userPath = email.replace(/\./g, '_');
    
    database.ref('users/' + userPath).set(newUser)
    .then(() => {
        console.log('✅ User saved to Firebase Cloud');
        
        // Also save to LocalStorage for immediate session login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userEmail', email);
        
        alert('✓ Account created successfully! Welcome to FASTSync!');
        window.location.href = 'find-partner.html';
    })
    .catch((error) => {
        alert('❌ Error saving to cloud: ' + error.message);
        submitBtn.textContent = 'Sign Up';
        submitBtn.disabled = false;
    });
});

// 4. Google Sign Up Handler (Corrected for Firebase)
document.getElementById('googleSignup').addEventListener('click', function() {
    this.innerHTML = '<span>Connecting to Google Cloud...</span>';
    this.disabled = true;
    
    // Simulation of Google Auth saving to your Database
    const googleUser = {
        fullName: 'Google User',
        email: 'user@nu.edu.pk',
        rollNumber: 'N/A',
        department: 'N/A',
        loginMethod: 'google',
        createdAt: new Date().toISOString()
    };

    const userPath = googleUser.email.replace(/\./g, '_');

    database.ref('users/' + userPath).set(googleUser).then(() => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', googleUser.fullName);
        localStorage.setItem('userEmail', googleUser.email);
        
        this.innerHTML = '<span>✓ Connected! Redirecting...</span>';
        setTimeout(() => {
            window.location.href = 'find-partner.html';
        }, 1000);
    });
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
