// Animated network background - KEPT EXACTLY AS REQUESTED
const canvas = document.getElementById('adminCanvas');
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

// --- FIREBASE CONNECTION (Enables sync across all devices) ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    // IMPORTANT: Replace this with your actual URL to fix the warning
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/",
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Admin Dashboard Functions
let allUsers = [];
let isAdminLoggedIn = false;
const ADMIN_PASSWORD = 'admin123'; 

// Check admin login on page load
window.addEventListener('DOMContentLoaded', function() {
    const adminLoginScreen = document.getElementById('adminLoginScreen');
    const mainDashboard = document.getElementById('mainDashboard');
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    
    if (adminSession === 'true') {
        adminLoginScreen.style.display = 'none';
        mainDashboard.style.display = 'block';
        isAdminLoggedIn = true;
        loadUsers(); // This now pulls from the Cloud
    } else {
        adminLoginScreen.style.display = 'flex';
        mainDashboard.style.display = 'none';
    }
});

// Admin login form
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
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
        document.getElementById('adminPasswordInput').value = '';
    }
});

// FIXED: Load users from Firebase instead of LocalStorage
function loadUsers() {
    console.log('📊 Synchronizing with Cloud Database...');
    // This listens for any new user registered on ANY device
    database.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        // Convert Firebase object into an array for your display logic
        allUsers = data ? Object.entries(data).map(([id, val]) => ({...val, firebaseId: id})) : [];
        
        displayUsers();
        updateStatistics();
    });
}

// Display users in table
function displayUsers(usersToDisplay = null) {
    const users = usersToDisplay || allUsers;
    const tableBody = document.getElementById('usersTableBody');
    const noUsersDiv = document.getElementById('noUsers');
    const tableContainer = document.querySelector('.table-container');
    const currentUserEmail = localStorage.getItem('userEmail');

    if (!tableBody) return; // Prevent TypeError

    if (users.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (noUsersDiv) noUsersDiv.style.display = 'block';
        return;
    }

    if (tableContainer) tableContainer.style.display = 'block';
    if (noUsersDiv) noUsersDiv.style.display = 'none';
    tableBody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        const registeredDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Jan 3, 2026';
        const isMyAccount = user.email === currentUserEmail;

        let actionButtons = '';
        if (isAdminLoggedIn) {
            // Updated IDs to use Firebase reference
            actionButtons = `
                <button class="btn-view" onclick="viewUserDetails('${user.firebaseId}')">View</button>
                <button class="btn-delete" onclick="deleteUser('${user.firebaseId}')">Delete</button>
            `;
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${user.fullName}</strong></td>
            <td>${user.email}</td>
            <td>
                <span class="password-field" id="pwd-${user.firebaseId}" data-hidden="true">••••••••</span>
                <span class="password-toggle" onclick="togglePassword('${user.firebaseId}', '${user.password}')">Show</span>
            </td>
            <td>${user.rollNumber || 'N/A'}</td>
            <td>${user.department || 'N/A'}</td>
            <td>${registeredDate}</td>
            <td>${actionButtons}</td>
        `;
        tableBody.appendChild(row);
    });
}

window.togglePassword = function(userId, password) {
    const pwdElement = document.getElementById(`pwd-${userId}`);
    const toggleBtn = pwdElement.nextElementSibling;
    const isHidden = pwdElement.dataset.hidden === 'true';

    if (isHidden) {
        pwdElement.textContent = password;
        pwdElement.dataset.hidden = 'false';
        toggleBtn.textContent = 'Hide';
    } else {
        pwdElement.textContent = '••••••••';
        pwdElement.dataset.hidden = 'true';
        toggleBtn.textContent = 'Show';
    }
}

window.viewUserDetails = function(userId) {
    const user = allUsers.find(u => u.firebaseId === userId);
    if (!user) return;
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('userDetailsContent');

    content.innerHTML = `
        <div class="detail-item"><strong>Full Name</strong><span>${user.fullName}</span></div>
        <div class="detail-item"><strong>Email Address</strong><span>${user.email}</span></div>
        <div class="detail-item"><strong>Roll Number</strong><span>${user.rollNumber || 'N/A'}</span></div>
        <div class="detail-item"><strong>Department</strong><span>${user.department || 'N/A'}</span></div>
        <div class="detail-item"><strong>User ID</strong><span>${userId}</span></div>
    `;
    modal.style.display = 'block';
}

// FIXED: Delete from Firebase
window.deleteUser = function(userId) {
    const adminPassword = prompt('🔒 Enter Admin Password to delete user:');
    if (adminPassword === ADMIN_PASSWORD) {
        if (confirm('Are you sure? This deletes the user from the cloud permanently.')) {
            database.ref('users/' + userId).remove()
                .then(() => alert('✅ User removed from Cloud!'))
                .catch(err => alert('❌ Error: ' + err.message));
        }
    } else {
        alert('❌ Incorrect password!');
    }
}

function updateStatistics() {
    if (document.getElementById('totalUsers')) document.getElementById('totalUsers').textContent = allUsers.length;
    if (document.getElementById('totalEmails')) document.getElementById('totalEmails').textContent = allUsers.length;
    const departments = new Set(allUsers.map(u => u.department).filter(d => d));
    if (document.getElementById('totalDepartments')) document.getElementById('totalDepartments').textContent = departments.size;
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm) ||
        (user.rollNumber && user.rollNumber.toLowerCase().includes(searchTerm))
    );
    displayUsers(filtered);
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', function() {
    loadUsers();
    alert('✓ Syncing with live database...');
});

// Export to CSV
document.getElementById('exportBtn').addEventListener('click', function() {
    if (allUsers.length === 0) return alert('No users to export!');
    let csv = 'Full Name,Email,Roll Number,Department\n';
    allUsers.forEach(u => {
        csv += `"${u.fullName}","${u.email}","${u.rollNumber || 'N/A'}","${u.department || 'N/A'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Users_List.csv`;
    a.click();
});

// Close modals
document.querySelectorAll('.close-modal, .close-modal-edit').forEach(btn => {
    btn.onclick = () => {
        document.getElementById('detailsModal').style.display = 'none';
        document.getElementById('editAccountModal').style.display = 'none';
    };
});

// Admin logout
document.getElementById('adminLogout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Logout from Admin Dashboard?')) {
        sessionStorage.removeItem('adminLoggedIn');
        location.reload();
    }
});

console.log('✅ Admin Sync Dashboard Ready!');
