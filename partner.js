// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync-8b20e.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/",
    projectId: "fastsync-8b20e",
    storageBucket: "fastsync-8b20e.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. STATE MANAGEMENT
let allUsers = [];
let currentUserProfile = null;
let currentRequests = {};

// Helper to handle Firebase keys (dots not allowed)
const encodeEmail = (email) => email ? email.replace(/\./g, '_') : null;

// 3. INITIALIZATION & AUTH CHECK
window.addEventListener('DOMContentLoaded', () => {
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    
    if (!userEmail) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    loadData(userEmail);
    setupEventListeners();
});

// 4. DATA LOADING
function loadData(userEmail) {
    // Load all users
    database.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        allUsers = data ? Object.entries(data).map(([id, val]) => ({...val, firebaseId: id})) : [];
        
        // Identify current user's profile
        currentUserProfile = allUsers.find(u => u.email === userEmail);
        if (currentUserProfile) {
            fillProfileForm(currentUserProfile);
            document.getElementById('formTitle').textContent = "Update Your Partner Profile";
            document.getElementById('submitBtn').textContent = "Update Profile";
        }
        
        displayPartners();
    });

    // Load connection requests
    const encodedMe = encodeEmail(userEmail);
    database.ref('requests').on('value', (snapshot) => {
        const allReqs = snapshot.val() || {};
        currentRequests = allReqs;
        updateRequestsUI(encodedMe);
    });
}

// 5. CONNECTION REQUEST LOGIC (NEW FEATURE)
function updateRequestsUI(myEncodedEmail) {
    const badge = document.getElementById('requestBadge');
    const incomingList = document.getElementById('incomingRequestsList');
    const outgoingList = document.getElementById('outgoingRequestsList');
    
    // 1. Handle Incoming
    const myIncoming = currentRequests[myEncodedEmail] || {};
    const pendingIncoming = Object.values(myIncoming).filter(r => r.status === 'pending');
    
    // Update Badge
    if (pendingIncoming.length > 0) {
        badge.textContent = pendingIncoming.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }

    // Render Incoming List
    incomingList.innerHTML = '';
    if (Object.keys(myIncoming).length === 0) {
        incomingList.innerHTML = '<p class="empty-msg">No incoming requests.</p>';
    } else {
        for (let senderKey in myIncoming) {
            const req = myIncoming[senderKey];
            const div = document.createElement('div');
            div.className = `request-item ${req.status}`;
            div.innerHTML = `
                <div class="req-info">
                    <strong>${req.fromName}</strong> (${req.fromEmail})
                    <span class="status-tag">${req.status}</span>
                </div>
                ${req.status === 'pending' ? `
                    <div class="req-actions">
                        <button onclick="respondRequest('${senderKey}', 'accepted')">Accept</button>
                        <button class="btn-reject" onclick="respondRequest('${senderKey}', 'rejected')">Decline</button>
                    </div>
                ` : req.status === 'accepted' ? `<p class="contact-hint">Contact: ${req.fromPhone || 'Check Email'}</p>` : ''}
            `;
            incomingList.appendChild(div);
        }
    }

    // 2. Handle Outgoing
    outgoingList.innerHTML = '';
    let hasOutgoing = false;
    for (let receiverKey in currentRequests) {
        if (currentRequests[receiverKey][myEncodedEmail]) {
            hasOutgoing = true;
            const req = currentRequests[receiverKey][myEncodedEmail];
            const div = document.createElement('div');
            div.className = `request-item ${req.status}`;
            div.innerHTML = `
                <div>Sent to <strong>${req.toName}</strong></div>
                <span class="status-tag">${req.status}</span>
            `;
            outgoingList.appendChild(div);
        }
    }
    if (!hasOutgoing) outgoingList.innerHTML = '<p class="empty-msg">No sent requests.</p>';
}

window.sendPartnerRequest = function(targetUserEmail, targetUserName) {
    if (!currentUserProfile) {
        alert("Please create your profile first!");
        document.getElementById('profileSection').scrollIntoView();
        return;
    }

    if (currentUserProfile.email === targetUserEmail) {
        alert("You cannot request yourself!");
        return;
    }

    const encodedTarget = encodeEmail(targetUserEmail);
    const encodedMe = encodeEmail(currentUserProfile.email);

    const requestData = {
        fromName: currentUserProfile.fullName,
        fromEmail: currentUserProfile.email,
        fromPhone: currentUserProfile.phone,
        toName: targetUserName,
        status: 'pending',
        timestamp: Date.now()
    };

    database.ref(`requests/${encodedTarget}/${encodedMe}`).set(requestData)
        .then(() => alert("🚀 Partnership request sent!"))
        .catch(err => alert("Error: " + err.message));
};

window.respondRequest = function(senderKey, newStatus) {
    const myEncoded = encodeEmail(currentUserProfile.email);
    database.ref(`requests/${myEncoded}/${senderKey}/status`).set(newStatus);
};

// 6. DISPLAY PARTNERS (UPDATED TO INTEGRATE REQUESTS)
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    const countEl = document.getElementById('partnersCount');
    const noResults = document.getElementById('noResults');
    
    // Apply Filters
    const filtered = allUsers.filter(u => {
        const matchUniv = !document.getElementById('filterUniversity').value || u.university === document.getElementById('filterUniversity').value;
        const matchDept = !document.getElementById('filterDepartment').value || u.department === document.getElementById('filterDepartment').value;
        const matchBatch = !document.getElementById('filterBatch').value || u.batch === document.getElementById('filterBatch').value;
        const matchSem = !document.getElementById('filterSemester').value || u.semester === document.getElementById('filterSemester').value;
        const matchAvail = !document.getElementById('filterAvailability').value || u.availability === document.getElementById('filterAvailability').value;
        
        // Hide current user from the list
        const isNotMe = u.email !== (currentUserProfile ? currentUserProfile.email : '');
        
        return matchUniv && matchDept && matchBatch && matchSem && matchAvail && isNotMe;
    });

    grid.innerHTML = '';
    countEl.textContent = filtered.length;
    noResults.style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach(user => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        
        // Check if we already sent a request to this person
        const targetEncoded = encodeEmail(user.email);
        const myEncoded = currentUserProfile ? encodeEmail(currentUserProfile.email) : null;
        const existingReq = (myEncoded && currentRequests[targetEncoded]) ? currentRequests[targetEncoded][myEncoded] : null;
        
        let buttonHTML = `<button class="btn-request" onclick="sendPartnerRequest('${user.email}', '${user.fullName}')">Request Partnership</button>`;
        if (existingReq) {
            buttonHTML = `<button class="btn-sent" disabled>Request ${existingReq.status}</button>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <h3>${user.fullName}</h3>
                <span class="badge-${user.availability}">${user.availability}</span>
            </div>
            <div class="card-body">
                <p><strong>🎓 ${user.university}</strong></p>
                <p>📍 ${user.department} | Sem ${user.semester}</p>
                <p class="skills">💻 ${user.skills || 'No skills listed'}</p>
                <p class="bio">"${user.bio || 'Available for projects!'}"</p>
            </div>
            <div class="card-footer">
                ${buttonHTML}
            </div>
        `;
        grid.appendChild(card);
    });
}

// 7. PROFILE FORM HANDLING
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        rollNumber: document.getElementById('rollNumber').value,
        university: document.getElementById('university').value,
        department: document.getElementById('department').value,
        batch: document.getElementById('batch').value,
        section: document.getElementById('section').value,
        semester: document.getElementById('semester').value,
        session: document.getElementById('session').value,
        course: document.getElementById('course').value,
        skills: document.getElementById('skills').value,
        bio: document.getElementById('bio').value,
        availability: document.getElementById('availability').value,
        createdAt: currentUserProfile ? currentUserProfile.createdAt : Date.now()
    };

    const userId = currentUserProfile ? currentUserProfile.firebaseId : database.ref('users').push().key;
    database.ref('users/' + userId).set(formData)
        .then(() => {
            alert("✅ Profile Saved Successfully!");
            location.reload();
        });
});

function fillProfileForm(user) {
    document.getElementById('fullName').value = user.fullName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('rollNumber').value = user.rollNumber || '';
    document.getElementById('university').value = user.university || '';
    document.getElementById('department').value = user.department || '';
    document.getElementById('batch').value = user.batch || '';
    document.getElementById('section').value = user.section || '';
    document.getElementById('semester').value = user.semester || '';
    document.getElementById('session').value = user.session || '';
    document.getElementById('skills').value = user.skills || '';
    document.getElementById('bio').value = user.bio || '';
    document.getElementById('availability').value = user.availability || 'available';
    
    // Trigger course loading if your courses-data.js supports it
    if (window.updateCourses) window.updateCourses(user.semester);
}

// 8. UI HELPERS (Modals & Filters)
function setupEventListeners() {
    // Modal Toggles
    const reqModal = document.getElementById('requestsModal');
    document.getElementById('requestsBtn').onclick = () => reqModal.style.display = 'block';
    document.getElementById('closeRequestsModal').onclick = () => reqModal.style.display = 'none';

    // Filters
    document.querySelectorAll('.filter-select').forEach(select => {
        select.onchange = displayPartners;
    });

    document.getElementById('resetFilters').onclick = () => {
        document.querySelectorAll('.filter-select').forEach(s => s.value = "");
        displayPartners();
    };

    // Logout
    document.getElementById('logoutBtn').onclick = () => {
        sessionStorage.clear();
        window.location.href = "login.html";
    };
}
