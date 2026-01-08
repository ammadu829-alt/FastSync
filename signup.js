// 1. Animated network background
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

for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }

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

// 2. FIREBASE INITIALIZATION
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/", 
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.error("Firebase library not found! Check your signup.html script tags.");
}

const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

// 3. Form Handling
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!database) {
        alert("Database connection failed. Please refresh the page.");
        return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const university = document.getElementById('university').value;
    const department = document.getElementById('department').value;
    const semester = document.getElementById('semester').value;
    const termsAccepted = document.getElementById('terms').checked;

    // Validation
    if (!termsAccepted) return alert('❌ Please accept Terms & Conditions');
    if (password !== confirmPassword) return alert('❌ Passwords do not match');
    if (password.length < 6) return alert('❌ Password must be at least 6 characters');

    // Show loading state
    const submitBtn = signupForm.querySelector('.btn-signup');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    // Sanitize email for Firebase key
    const userId = email.replace(/\./g, '_');

    // Check if user already exists
    database.ref('users/' + userId).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                alert('❌ An account with this email already exists. Please login.');
                submitBtn.textContent = 'Create Account';
                submitBtn.disabled = false;
                return;
            }

            // Create new user data
            const newUser = {
                fullName,
                email,
                password,
                rollNumber,
                university,
                department,
                semester,
                createdAt: new Date().toISOString()
            };

            // Save to Firebase
            database.ref('users/' + userId).set(newUser)
                .then(() => {
                    // Auto-login after signup
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', fullName);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userUniversity', university);
                    localStorage.setItem('userSemester', semester);
                    localStorage.setItem('userDepartment', department);
                    localStorage.setItem('userRollNumber', rollNumber);
                    
                    // Save complete user object for reviews system
                    localStorage.setItem('loggedInUser', JSON.stringify({
                        email: email,
                        name: fullName,
                        username: fullName,
                        university: university,
                        semester: semester,
                        department: department,
                        rollNumber: rollNumber
                    }));
                    
                    alert('✅ Account created successfully! Welcome to FASTSync, ' + fullName + '!');
                    window.location.href = 'find-partner.html';
                })
                .catch(error => {
                    alert('❌ Signup Error: ' + error.message);
                    submitBtn.textContent = 'Create Account';
                    submitBtn.disabled = false;
                });
        })
        .catch(error => {
            alert('❌ Error checking existing user: ' + error.message);
            submitBtn.textContent = 'Create Account';
            submitBtn.disabled = false;
        });
});

// Real-time password match check
document.getElementById('confirmPassword').addEventListener('input', function() {
    const pwd = document.getElementById('password').value;
    if (this.value && pwd !== this.value) {
        this.style.borderColor = '#ef4444';
    } else {
        this.style.borderColor = 'rgba(138, 43, 226, 0.3)';
    }
});
