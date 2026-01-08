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

// --- FIREBASE INITIALIZATION ---
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
    console.error("Firebase library not found!");
}

const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

// --- LOGIN LOGIC (FIXED) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const passwordInput = document.getElementById('password').value.trim();
        
        if (!database) {
            alert('❌ Database connection failed. Please refresh the page.');
            return;
        }

        // Show loading state
        const loginBtn = loginForm.querySelector('.btn-login');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        // Sanitize email for Firebase key
        const userId = emailInput.replace(/\./g, '_');
        
        // Check Firebase database
        database.ref('users/' + userId).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    
                    // Verify password
                    if (userData.password === passwordInput) {
                        // Successfully logged in - Save to localStorage
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userEmail', userData.email);
                        localStorage.setItem('userName', userData.fullName);
                        localStorage.setItem('userUniversity', userData.university);
                        localStorage.setItem('userSemester', userData.semester);
                        localStorage.setItem('userDepartment', userData.department);
                        localStorage.setItem('userRollNumber', userData.rollNumber);
                        
                        // Save complete user object for reviews system
                        localStorage.setItem('loggedInUser', JSON.stringify({
                            email: userData.email,
                            name: userData.fullName,
                            username: userData.fullName,
                            university: userData.university,
                            semester: userData.semester,
                            department: userData.department,
                            rollNumber: userData.rollNumber
                        }));
                        
                        alert('✅ Login Successful! Welcome back, ' + userData.fullName);
                        window.location.href = 'index.html';
                    } else {
                        alert('❌ Incorrect password. Please try again.');
                        loginBtn.textContent = originalText;
                        loginBtn.disabled = false;
                    }
                } else {
                    alert('❌ No account found with this email. Please sign up first.');
                    loginBtn.textContent = originalText;
                    loginBtn.disabled = false;
                }
            })
            .catch(error => {
                alert('❌ Login Error: ' + error.message);
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            });
    });
}
