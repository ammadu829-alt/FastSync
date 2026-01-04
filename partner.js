/* ========== partner.js - FULL SYSTEM ========== */

// 1. YOUR FIREBASE CONFIGURATION (Replace with your actual keys)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// State variables
let allUsers = [];
let currentUserId = "TEMP_USER_ID"; // Replace with firebase.auth().currentUser.uid when auth is ready

/* ========== PAGE INITIALIZATION ========== */
document.addEventListener('DOMContentLoaded', () => {
    loadPartners();
    setupEventListeners();
    listenForRequests();
});

function setupEventListeners() {
    // Profile Form Submission
    const profileForm = document.getElementById('profileForm');
    if(profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Modal Toggles
    const requestsBtn = document.getElementById('requestsBtn');
    const requestsModal = document.getElementById('requestsModal');
    const closeRequestsModal = document.getElementById('closeRequestsModal');

    requestsBtn.onclick = () => requestsModal.style.display = "block";
    closeRequestsModal.onclick = () => requestsModal.style.display = "none";

    // Filtering Listeners
    const filters = ['filterUniversity', 'filterDepartment', 'filterBatch', 'filterSection', 'filterSemester', 'filterSession', 'filterCourse', 'filterAvailability'];
    filters.forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });

    document.getElementById('resetFilters').onclick = resetFilters;

    // Semester -> Course dynamic update (using your courses-data.js)
    document.getElementById('semester').addEventListener('change', function(e) {
        const courseSelect = document.getElementById('course');
        const sem = e.target.value;
        if (typeof getCoursesBySemester === "function") {
            const courses = getCoursesBySemester(sem);
            courseSelect.innerHTML = '<option value="">Select Course</option>' + 
                courses.map(c => `<option value="${c}">${c}</option>`).join('');
            courseSelect.disabled = false;
        }
    });
}

/* ========== DATABASE OPERATIONS ========== */

// Save/Update Profile
function handleProfileSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = Object.fromEntries(formData.entries());
    
    // Using email as a temporary unique ID if auth is not active
    const userId = profileData.email.replace(/[^a-zA-Z0-9]/g, '_');
    currentUserId = userId;

    db.ref('users/' + userId).set({
        ...profileData,
        lastUpdated: Date.now()
    }).then(() => {
        alert("Profile updated successfully!");
        loadPartners();
    });
}

// Fetch all partners
function loadPartners() {
    db.ref('users').on('value', (snapshot) => {
        allUsers = [];
        snapshot.forEach(child => {
            allUsers.push({ id: child.key, ...child.val() });
        });
        renderPartners(allUsers);
    });
}

/* ========== UI RENDERING ========== */

function renderPartners(users) {
    const grid = document.getElementById('partnersGrid');
    const countDisplay = document.getElementById('partnersCount');
    const noResults = document.getElementById('noResults');

    grid.innerHTML = '';
    
    // Filter out the current user and show others
    const others = users.filter(u => u.id !== currentUserId);

    if (others.length === 0) {
        noResults.style.display = 'block';
        countDisplay.innerText = '0';
        return;
    }

    noResults.style.display = 'none';
    countDisplay.innerText = others.length;

    others.forEach(user => {
        const card = `
            <div class="partner-card">
                <div class="card-header">
                    <span class="status-badge ${user.availability === 'available' ? 'status-available' : 'status-found'}">
                        ${user.availability}
                    </span>
                </div>
                <h3>${user.fullName || 'User'}</h3>
                <p style="color: #8a2be2; font-weight: bold; font-size: 0.9rem;">${user.university}</p>
                <div class="card-body">
                    <p><strong>Dept:</strong> ${user.department}</p>
                    <p><strong>Course:</strong> ${user.course || 'N/A'}</p>
                    <div class="skills-tags">
                        ${(user.skills || '').split(',').map(s => `<span class="skill-pill">${s.trim()}</span>`).join('')}
                    </div>
                    <p style="font-size: 0.85rem; color: #ccc; margin-top: 10px;">${user.bio || ''}</p>
                </div>
                <button class="btn-request" onclick="sendRequest('${user.id}', '${user.fullName}')">Request Partnership</button>
            </div>
        `;
        grid.innerHTML += card;
    });
}

/* ========== PARTNERSHIP REQUEST SYSTEM ========== */

function sendRequest(targetId, targetName) {
    const requestData = {
        senderId: currentUserId,
        senderName: document.getElementById('fullName').value || "Someone",
        status: 'pending',
        timestamp: Date.now()
    };

    // 1. Add to target's incoming
    db.ref(`requests/${targetId}/incoming/${currentUserId}`).set(requestData);
    // 2. Add to your outgoing
    db.ref(`requests/${currentUserId}/outgoing/${targetId}`).set({
        targetName: targetName,
        status: 'pending',
        timestamp: Date.now()
    });

    alert(`Request sent to ${targetName}!`);
}

function listenForRequests() {
    const badge = document.getElementById('requestBadge');
    const incomingList = document.getElementById('incomingRequestsList');
    const outgoingList = document.getElementById('outgoingRequestsList');

    db.ref(`requests/${currentUserId}`).on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const incoming = data.incoming || {};
        const outgoing = data.outgoing || {};

        // Update Badge
        const pendingCount = Object.values(incoming).filter(r => r.status === 'pending').length;
        if (pendingCount > 0) {
            badge.style.display = 'inline-block';
            badge.innerText = pendingCount;
        } else {
            badge.style.display = 'none';
        }

        // Render Incoming
        incomingList.innerHTML = Object.keys(incoming).length ? '' : '<p class="empty-msg">No incoming requests yet.</p>';
        for (let id in incoming) {
            const req = incoming[id];
            incomingList.innerHTML += `
                <div class="request-item">
                    <span><strong>${req.senderName}</strong> wants to partner up!</span>
                    <div class="req-actions">
                        <button onclick="updateRequestStatus('${id}', 'accepted')" style="background:#22c55e; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Accept</button>
                        <button onclick="updateRequestStatus('${id}', 'declined')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Decline</button>
                    </div>
                </div>
            `;
        }

        // Render Outgoing
        outgoingList.innerHTML = Object.keys(outgoing).length ? '' : '<p class="empty-msg">No sent requests.</p>';
        for (let id in outgoing) {
            const req = outgoing[id];
            outgoingList.innerHTML += `
                <div class="request-item">
                    <span>To: ${req.targetName}</span>
                    <span class="status-tag ${req.status}">${req.status}</span>
                </div>
            `;
        }
    });
}

function updateRequestStatus(senderId, newStatus) {
    db.ref(`requests/${currentUserId}/incoming/${senderId}`).update({ status: newStatus });
    db.ref(`requests/${senderId}/outgoing/${currentUserId}`).update({ status: newStatus });
}

/* ========== FILTER LOGIC ========== */

function applyFilters() {
    const filters = {
        university: document.getElementById('filterUniversity').value,
        department: document.getElementById('filterDepartment').value,
        batch: document.getElementById('filterBatch').value,
        semester: document.getElementById('filterSemester').value,
        availability: document.getElementById('filterAvailability').value
    };

    const filtered = allUsers.filter(u => {
        return (!filters.university || u.university === filters.university) &&
               (!filters.department || u.department === filters.department) &&
               (!filters.batch || u.batch === filters.batch) &&
               (!filters.semester || u.semester === filters.semester) &&
               (!filters.availability || u.availability === filters.availability);
    });

    renderPartners(filtered);
}

function resetFilters() {
    const selects = document.querySelectorAll('.filter-select');
    selects.forEach(s => s.value = '');
    renderPartners(allUsers);
}
