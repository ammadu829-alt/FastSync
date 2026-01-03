// Animated network background
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

// Admin Dashboard Functions
let allUsers = [];
let isAdminLoggedIn = false;

// Admin password - CHANGE THIS TO YOUR OWN!
const ADMIN_PASSWORD = 'admin123'; // ⚠️ CHANGE THIS!

// Check admin login on page load
window.addEventListener('DOMContentLoaded', function() {
    const adminLoginScreen = document.getElementById('adminLoginScreen');
    const mainDashboard = document.getElementById('mainDashboard');
    
    // Check if admin is already logged in (session)
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    
    if (adminSession === 'true') {
        // Already logged in, show dashboard
        adminLoginScreen.style.display = 'none';
        mainDashboard.style.display = 'block';
        isAdminLoggedIn = true;
        loadUsers();
        displayUsers();
        updateStatistics();
    } else {
        // Not logged in, show login screen
        adminLoginScreen.style.display = 'flex';
        mainDashboard.style.display = 'none';
    }
});

// Admin login form
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enteredPassword = document.getElementById('adminPasswordInput').value;
    
    if (enteredPassword === ADMIN_PASSWORD) {
        // Correct password!
        sessionStorage.setItem('adminLoggedIn', 'true');
        isAdminLoggedIn = true;
        
        // Hide login, show dashboard
        document.getElementById('adminLoginScreen').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'block';
        
        // Load data
        loadUsers();
        displayUsers();
        updateStatistics();
        
        alert('✅ Welcome Admin!');
    } else {
        // Wrong password
        alert('❌ Incorrect admin password!');
        document.getElementById('adminPasswordInput').value = '';
    }
});

// Load users from localStorage
function loadUsers() {
    // Try different possible key names
    let users = JSON.parse(localStorage.getItem('users')) || 
                JSON.parse(localStorage.getItem('fastsync_users')) || 
                JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    console.log('📊 Loading users from localStorage...');
    console.log('Found', users.length, 'users');
    console.log('User data:', users);
    
    allUsers = users;
    return users;
}

// Display users in table
function displayUsers(usersToDisplay = null) {
    const users = usersToDisplay || allUsers;
    const tableBody = document.getElementById('usersTableBody');
    const noUsersDiv = document.getElementById('noUsers');
    const tableContainer = document.querySelector('.table-container');

    if (users.length === 0) {
        tableContainer.style.display = 'none';
        noUsersDiv.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    noUsersDiv.style.display = 'none';
    tableBody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        
        const registeredDate = new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${user.fullName}</strong></td>
            <td>${user.email}</td>
            <td>
                <span class="password-field" id="pwd-${user.id}" data-hidden="true">••••••••</span>
                <span class="password-toggle" onclick="togglePassword(${user.id}, '${user.password}')">Show</span>
            </td>
            <td>${user.rollNumber || 'N/A'}</td>
            <td>${user.department || 'N/A'}</td>
            <td>${registeredDate}</td>
            <td>
                <button class="btn-view" onclick="viewUserDetails(${user.id})">View</button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Toggle password visibility
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

// View user details in modal
window.viewUserDetails = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('userDetailsContent');

    content.innerHTML = `
        <div class="detail-item">
            <strong>Full Name</strong>
            <span>${user.fullName}</span>
        </div>
        <div class="detail-item">
            <strong>Email Address</strong>
            <span>${user.email}</span>
        </div>
        <div class="detail-item">
            <strong>Password</strong>
            <span class="password-field">${user.password}</span>
        </div>
        <div class="detail-item">
            <strong>Roll Number</strong>
            <span>${user.rollNumber || 'Not provided'}</span>
        </div>
        <div class="detail-item">
            <strong>Department</strong>
            <span>${user.department || 'Not provided'}</span>
        </div>
        <div class="detail-item">
            <strong>Registered On</strong>
            <span>${new Date(user.createdAt).toLocaleString()}</span>
        </div>
        <div class="detail-item">
            <strong>User ID</strong>
            <span>${user.id}</span>
        </div>
    `;

    modal.style.display = 'block';
}

// Delete user
window.deleteUser = function(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        allUsers = allUsers.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(allUsers));
        displayUsers();
        updateStatistics();
        alert('✓ User deleted successfully!');
    }
}

// Update statistics
function updateStatistics() {
    const users = allUsers;
    
    // Total users
    document.getElementById('totalUsers').textContent = users.length;
    
    // Total emails
    document.getElementById('totalEmails').textContent = users.length;
    
    // Total departments
    const departments = new Set(users.map(u => u.department).filter(d => d));
    document.getElementById('totalDepartments').textContent = departments.size;
    
    // New today
    const today = new Date().toDateString();
    const newToday = users.filter(u => new Date(u.createdAt).toDateString() === today).length;
    document.getElementById('newToday').textContent = newToday;
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
        displayUsers(allUsers);
        return;
    }

    const filtered = allUsers.filter(user => {
        return user.fullName.toLowerCase().includes(searchTerm) ||
               user.email.toLowerCase().includes(searchTerm) ||
               (user.rollNumber && user.rollNumber.toLowerCase().includes(searchTerm)) ||
               (user.department && user.department.toLowerCase().includes(searchTerm));
    });

    displayUsers(filtered);
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', function() {
    loadUsers();
    displayUsers();
    updateStatistics();
    alert('✓ Dashboard refreshed!');
});

// Export to CSV
document.getElementById('exportBtn').addEventListener('click', function() {
    if (allUsers.length === 0) {
        alert('No users to export!');
        return;
    }

    let csv = 'Full Name,Email,Password,Roll Number,Department,Registered On\n';
    
    allUsers.forEach(user => {
        csv += `"${user.fullName}","${user.email}","${user.password}","${user.rollNumber || 'N/A'}","${user.department || 'N/A'}","${new Date(user.createdAt).toLocaleString()}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FASTSync_Users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('✓ Users exported to CSV!');
});

// Close modal
document.querySelector('.close-modal').onclick = function() {
    document.getElementById('detailsModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Admin logout
document.getElementById('adminLogout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        isAdminLoggedIn = false;
        
        // Show login screen
        document.getElementById('adminLoginScreen').style.display = 'flex';
        document.getElementById('mainDashboard').style.display = 'none';
        
        // Clear password field
        document.getElementById('adminPasswordInput').value = '';
    }
});

// Initialize dashboard - REMOVED from here, moved to login success
console.log('✅ Admin Dashboard script loaded!');
