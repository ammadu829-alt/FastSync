// 1. Animated network background - KEPT EXACTLY AS REQUESTED
const canvas = document.getElementById('adminCanvas');
const ctx = canvas.getContext('2d');
if (canvas) {
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

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(102, 126, 234, ${1 - dist / maxDistance})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 2. FIREBASE CONNECTION
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync-8b20e.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/",
    projectId: "fastsync-8b20e",
    storageBucket: "fastsync-8b20e.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.error("Firebase is not defined. Ensure script tags are in admin.html.");
}

const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

// 3. Admin Dashboard State
let allUsers = [];
let allRequests = {}; // NEW: Track connections for monitoring
let isAdminLoggedIn = false;
const ADMIN_PASSWORD = 'admin123';

// 4. Auth & UI Logic
window.addEventListener('DOMContentLoaded', function() {
    const adminLoginScreen = document.getElementById('adminLoginScreen');
    const mainDashboard = document.getElementById('mainDashboard');
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    
    if (adminSession === 'true') {
        if (adminLoginScreen) adminLoginScreen.style.display = 'none';
        if (mainDashboard) mainDashboard.style.display = 'block';
        isAdminLoggedIn = true;
        loadUsers(); 
    } else {
        if (adminLoginScreen) adminLoginScreen.style.display = 'flex';
        if (mainDashboard) mainDashboard.style.display = 'none';
    }
});

const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const enteredPassword = document.getElementById('adminPasswordInput').value;
        if (enteredPassword === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            isAdminLoggedIn = true;
            document.getElementById('adminLoginScreen').style.display = 'none';
            document.getElementById('mainDashboard').style.display = 'block';
            loadUsers();
            alert('✅ Welcome Admin!');
        } else {
            alert('❌ Incorrect admin password!');
        }
    });
}

// 5. DATA SYNC - LOAD USERS & REQUESTS FROM CLOUD
function loadUsers() {
    if (!database) return;
    console.log('📊 Synchronizing with Cloud...');
    
    // NEW FEATURE: Sync connection requests for privacy monitoring
    database.ref('requests').on('value', (snapshot) => {
        allRequests = snapshot.val() || {};
        updateStatistics();
    });

    database.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        allUsers = data ? Object.entries(data).map(([id, val]) => ({...val, firebaseId: id})) : [];
        displayUsers();
        updateStatistics();
    }, (error) => {
        console.error("Database read failed: " + error.code);
    });
}

// Display Table
function displayUsers(usersToDisplay = null) {
    const users = usersToDisplay || allUsers;
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        const regDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '04/01/2026';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${user.fullName}</strong></td>
            <td>${user.email}</td>
            <td>
                <span id="pwd-${user.firebaseId}" data-hidden="true">••••••••</span>
                <span class="password-toggle" style="cursor:pointer; color:#667eea; margin-left:10px;" 
                      onclick="togglePassword('${user.firebaseId}', '${user.password}')">Show</span>
            </td>
            <td>${user.rollNumber || 'N/A'}</td>
            <td>${user.university || 'N/A'}</td> 
            <td>${user.department || 'N/A'}</td>
            <td>${user.semester || 'N/A'}</td>   
            <td>${regDate}</td>
            <td>
                <button class="btn-view" onclick="viewUserDetails('${user.firebaseId}')">View</button>
                <button class="btn-delete" onclick="deleteUser('${user.firebaseId}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Global functions for buttons
window.togglePassword = function(userId, password) {
    const el = document.getElementById(`pwd-${userId}`);
    const isHidden = el.dataset.hidden === 'true';
    el.textContent = isHidden ? password : '••••••••';
    el.dataset.hidden = isHidden ? 'false' : 'true';
    event.target.textContent = isHidden ? 'Hide' : 'Show';
}

window.deleteUser = function(userId) {
    if (prompt('🔒 Enter Admin Password to delete:') === ADMIN_PASSWORD) {
        if (confirm('Permanently delete this user from Cloud?')) {
            database.ref('users/' + userId).remove()
                .then(() => alert('✅ User removed!'))
                .catch(err => alert('❌ Error: ' + err.message));
        }
    } else {
        alert('❌ Incorrect password!');
    }
}

// NEW FEATURE: IMPLEMENTED VIEW USER DETAILS MODAL
window.viewUserDetails = function(userId) {
    const user = allUsers.find(u => u.firebaseId === userId);
    if (!user) return;

    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('userDetailsContent');
    const encodedEmail = user.email.replace(/\./g, '_');

    // Fetch this user's connections
    const userRequests = allRequests[encodedEmail] || {};
    let connectionsHTML = `<div class="connections-summary"><h4>Privacy & Connections</h4>`;
    
    if (Object.keys(userRequests).length === 0) {
        connectionsHTML += `<p>No connection requests yet.</p>`;
    } else {
        connectionsHTML += `<ul>`;
        for (let sender in userRequests) {
            const req = userRequests[sender];
            const statusColor = req.status === 'accepted' ? '#10b981' : '#f59e0b';
            connectionsHTML += `<li>
                <strong>${req.fromName}</strong> (${req.fromEmail}) 
                - <span style="color:${statusColor}">${req.status.toUpperCase()}</span>
            </li>`;
        }
        connectionsHTML += `</ul>`;
    }
    connectionsHTML += `</div>`;

    content.innerHTML = `
        <div class="admin-user-profile">
            <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
            <p><strong>Roll No:</strong> ${user.rollNumber || 'N/A'}</p>
            <p><strong>Semester:</strong> ${user.semester || 'N/A'}</p>
            <p><strong>Registration:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
            <hr>
            ${connectionsHTML}
        </div>
    `;
    modal.style.display = 'block';
}

// Close Modal Logic
const closeBtn = document.querySelector('.close-modal');
if (closeBtn) {
    closeBtn.onclick = () => document.getElementById('detailsModal').style.display = 'none';
}
window.onclick = (event) => {
    const modal = document.getElementById('detailsModal');
    if (event.target == modal) modal.style.display = "none";
}

function updateStatistics() {
    const totalU = document.getElementById('totalUsers');
    const totalE = document.getElementById('totalEmails');
    const totalD = document.getElementById('totalDepartments');
    const totalN = document.getElementById('newToday');
    
    if (totalU) totalU.textContent = allUsers.length;
    if (totalE) totalE.textContent = allUsers.length;
    if (totalD) {
        const depts = new Set(allUsers.map(u => u.department).filter(d => d));
        totalD.textContent = depts.size;
    }
    if (totalN) {
        const today = new Date().toLocaleDateString();
        const count = allUsers.filter(u => {
            const d = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '04/01/2026';
            return d === today;
        }).length;
        totalN.textContent = count;
    }
}

// Search
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsers.filter(u => 
            u.fullName.toLowerCase().includes(term) || 
            u.email.toLowerCase().includes(term) || 
            (u.rollNumber && u.rollNumber.toLowerCase().includes(term))
        );
        displayUsers(filtered);
    });
}

// Logout
const logoutBtn = document.getElementById('adminLogout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Logout?')) {
            sessionStorage.removeItem('adminLoggedIn');
            location.reload();
        }
    });
}
