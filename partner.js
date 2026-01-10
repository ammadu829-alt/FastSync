// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/", 
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef12345"
};

// 2. Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let partners = [];
let myConnections = [];
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');

// 3. Start the App
function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Pull data from the Cloud and listen for changes
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        partners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        displayPartners();
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && userName) profileBtn.textContent = userName;
    
    // Load connections and requests
    loadMyConnections();
    loadPendingRequests();
}

// Load my connections (accepted requests) - FILTER OUT SELF
function loadMyConnections() {
    if (!userEmail) return;
    
    const userId = emailToId(userEmail);
    
    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            const allConnections = Object.keys(data);
            myConnections = allConnections.filter(connId => connId !== userId);
        } else {
            myConnections = [];
        }
        
        // Refresh display to apply "Unlocked" status to connected partners
        displayPartners();
    });
}

// Load pending requests for badge
function loadPendingRequests() {
    if (!userEmail) return;
    const userId = emailToId(userEmail);
    
    database.ref('requests').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            updateRequestBadge(0);
            return;
        }
        
        const received = Object.entries(data).filter(([id, req]) => 
            req.toUserId === userId && req.status === 'pending'
        );
        
        updateRequestBadge(received.length);
    });
}

function updateRequestBadge(count) {
    const badge = document.getElementById('requestBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Helper function to convert email to ID
function emailToId(email) {
    return email ? email.replace(/[.@]/g, '_') : '';
}

// 4. Display Cards with FIXED PRIVACY CONTROLS
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    const countText = document.getElementById('partnersCount');
    const noResults = document.getElementById('noResults');
    
    if (!grid) return;

    if (countText) countText.textContent = partners.length;
    
    if (partners.length === 0) {
        if (noResults) noResults.style.display = 'block';
        grid.style.display = 'none';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';

    partners.forEach(p => {
        const card = createProfileCard(p);
        grid.appendChild(card);
    });
}

// Create profile card - FIX: Unlock if connected
function createProfileCard(p) {
    const card = document.createElement('div');
    card.className = 'partner-card';

    const profileId = emailToId(p.email);
    const isMine = (p.email && userEmail && p.email.toLowerCase() === userEmail.toLowerCase());
    
    // NEW LOGIC: This profile is unlocked if it's yours OR you are connected
    const isConnected = myConnections.includes(profileId);
    const hasAccess = isMine || isConnected;

    const availabilityClass = p.availability === 'available' ? 'status-available' : 'status-found';
    const availabilityText = p.availability === 'available' ? '✓ Available' : '✗ Partnered';
    
    const skillsArray = p.skills ? p.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const skillsHTML = skillsArray.length > 0 
        ? skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<span class="no-skills">No skills listed</span>';

    // PUBLIC INFORMATION
    let publicInfo = `
        <div class="card-header">
            <div class="profile-avatar">${p.fullName.charAt(0).toUpperCase()}</div>
            <div class="profile-info">
                <h3 class="profile-name">${p.fullName}</h3>
                <p class="profile-roll">${p.rollNumber}</p>
            </div>
            <span class="availability-badge ${availabilityClass}">${availabilityText}</span>
        </div>
        <div class="card-body">
            <div class="info-section">
                <div class="info-row"><span class="info-icon">🎓</span><div class="info-content"><strong>University</strong><p>${p.university || 'Not specified'}</p></div></div>
                <div class="info-row"><span class="info-icon">💼</span><div class="info-content"><strong>Department</strong><p>${p.department || 'Not specified'}</p></div></div>
                <div class="info-row"><span class="info-icon">📅</span><div class="info-content"><strong>Batch</strong><p>${p.batch || 'N/A'}</p></div></div>
                <div class="info-row"><span class="info-icon">🔖</span><div class="info-content"><strong>Section</strong><p>Section ${p.section || 'N/A'}</p></div></div>
                <div class="info-row"><span class="info-icon">📚</span><div class="info-content"><strong>Semester</strong><p>${getOrdinalSemester(p.semester)}</p></div></div>
                <div class="info-row"><span class="info-icon">📖</span><div class="info-content"><strong>Course</strong><p>${p.course || 'Not specified'}</p></div></div>
            </div>`;

    // PRIVATE INFORMATION - Unlock based on access
    let privateInfo = '';
    if (hasAccess) {
        privateInfo = `
            <div class="privacy-unlocked">
                <p class="connection-status">${isMine ? '🔓 My Full Profile' : '✅ Connected'}</p>
                <div class="info-section">
                    <div class="info-row"><span class="info-icon">🗓️</span><div class="info-content"><strong>Session</strong><p>${p.session || 'Not specified'}</p></div></div>
                    <div class="info-row"><span class="info-icon">📧</span><div class="info-content"><strong>Email</strong><p>${p.email}</p></div></div>
                    <div class="info-row"><span class="info-icon">📱</span><div class="info-content"><strong>Phone</strong><p>${p.phone}</p></div></div>
                </div>
                ${p.bio ? `<div class="bio-section"><strong>About:</strong><p>${p.bio}</p></div>` : ''}
                <div class="skills-section"><strong>Skills:</strong><div class="skills-container">${skillsHTML}</div></div>
            </div>`;
    } else {
        privateInfo = `
            <div class="privacy-locked">
                <div class="locked-message">
                    <span class="lock-icon">🔒</span>
                    <p><strong>Private Information Locked</strong></p>
                    <p class="locked-text">Session, Email, Phone, Bio & Skills are hidden for privacy protection.</p>
                    <p class="locked-hint">Send a connection request to view full profile</p>
                </div>
            </div>`;
    }

    // FOOTER BUTTONS
    let footerButtons = '';
    if (isMine) {
        footerButtons = `
            <button class="btn-contact" onclick="editProfile('${p.id}')" style="flex:1;"><span>✏️</span> Edit Profile</button>
            <button class="btn-delete" onclick="deleteProfile('${p.id}')" style="flex:1;"><span>🗑️</span> Delete</button>`;
    } else if (isConnected) {
        footerButtons = `
            <button class="btn-contact" onclick="openContactModal('${p.id}', '${p.fullName}', '${p.email}')" style="flex:1; background-color: #28a745;">
                <span>💬</span> Message Partner
            </button>`;
    } else {
        footerButtons = `
            <button class="btn-request" onclick="sendConnectionRequest('${p.id}', '${p.fullName}')"><span>🔗</span> Send Request</button>`;
    }

    card.innerHTML = publicInfo + privateInfo + `</div><div class="card-footer">${footerButtons}</div>`;
    return card;
}

// Send request
window.sendConnectionRequest = function(toProfileId, toUserName) {
    if (!userEmail) { alert('❌ Please log in first'); return; }
    
    const fromUserId = emailToId(userEmail);
    const recipientProfile = partners.find(p => p.id === toProfileId);
    if (!recipientProfile) return;
    
    const toUserId = emailToId(recipientProfile.email);
    if (fromUserId === toUserId) { alert('❌ You cannot send a request to yourself!'); return; }
    
    database.ref('requests').once('value', (snapshot) => {
        const existing = snapshot.val();
        if (existing) {
            const alreadySent = Object.values(existing).some(req => 
                req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'pending'
            );
            if (alreadySent) { alert('⚠️ Request already pending.'); return; }
        }
        
        database.ref('connections/' + fromUserId + '/' + toUserId).once('value', (connSnap) => {
            if (connSnap.exists()) { alert('✅ Already connected!'); return; }
            
            const requestData = {
                fromUserId: fromUserId, fromUserName: userName, fromUserEmail: userEmail,
                toUserId: toUserId, toUserName: toUserName, toUserEmail: recipientProfile.email,
                status: 'pending', timestamp: Date.now()
            };
            
            database.ref('requests').push(requestData).then(() => {
                alert(`✅ Request sent to ${toUserName}!`);
            });
        });
    });
};

function getOrdinalSemester(num) {
    if (!num) return 'Not specified';
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]) + ' Semester';
}

// 5. Edit Profile Function
window.editProfile = function(id) {
    const p = partners.find(item => item.id === id);
    if (!p) return;
    const formSection = document.getElementById('profileSection');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('profileId').value = p.id;
    document.getElementById('fullName').value = p.fullName || '';
    document.getElementById('email').value = p.email || '';
    document.getElementById('phone').value = p.phone || '';
    document.getElementById('rollNumber').value = p.rollNumber || '';
    document.getElementById('university').value = p.university || '';
    document.getElementById('department').value = p.department || '';
    document.getElementById('batch').value = p.batch || '';
    document.getElementById('section').value = p.section || '';
    document.getElementById('semester').value = p.semester || '';
    document.getElementById('semester').dispatchEvent(new Event('change'));
    setTimeout(() => { document.getElementById('course').value = p.course || ''; }, 100);
    document.getElementById('session').value = p.session || '';
    document.getElementById('skills').value = p.skills || '';
    document.getElementById('bio').value = p.bio || '';
    document.getElementById('availability').value = p.availability || 'available';
    document.getElementById('formTitle').textContent = 'Edit Your Profile';
    document.getElementById('submitBtn').textContent = 'Update My Profile';
};

// 6. Delete Profile Function
window.deleteProfile = function(id) {
    if (confirm("⚠️ Are you sure you want to delete your profile?")) {
        database.ref('profiles/' + id).remove().then(() => { alert("✅ Profile deleted!"); });
    }
};

// 7. Form Submission
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const existingId = document.getElementById('profileId').value;
        const id = existingId || Date.now().toString();
        const profileData = {
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
            timestamp: Date.now()
        };
        database.ref('profiles/' + id).set(profileData).then(() => {
            alert("✅ Success!");
            profileForm.reset();
            document.getElementById('profileId').value = '';
        });
    });
}

// 8. Filters
function filterProfiles() {
    const filterIds = ['filterUniversity', 'filterDepartment', 'filterBatch', 'filterSection', 'filterSemester', 'filterSession', 'filterCourse', 'filterAvailability'];
    const filters = {};
    filterIds.forEach(id => { filters[id.replace('filter', '').toLowerCase()] = document.getElementById(id)?.value || ''; });
    database.ref('profiles').once('value', (snapshot) => {
        const data = snapshot.val();
        let allPartners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        partners = allPartners.filter(p => {
            for (let key in filters) { if (filters[key] && p[key] !== filters[key]) return false; }
            return true;
        });
        displayPartners();
    });
}
['filterUniversity', 'filterDepartment', 'filterBatch', 'filterSection', 'filterSemester', 'filterSession', 'filterCourse', 'filterAvailability'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', filterProfiles);
});

// 9. Modals Logic (Requests & Reports)
function showRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (modal) { modal.style.display = 'flex'; loadReceivedRequests(); }
}
document.getElementById('requestsBtn')?.addEventListener('click', showRequestsModal);
document.getElementById('closeRequestsModal')?.addEventListener('click', () => { document.getElementById('requestsModal').style.display = 'none'; });

function loadReceivedRequests() {
    const userId = emailToId(userEmail);
    const container = document.getElementById('receivedRequests');
    if (!container) return;
    database.ref('requests').once('value', (snapshot) => {
        const data = snapshot.val();
        const requests = data ? Object.entries(data).filter(([id, req]) => req.toUserId === userId && req.status === 'pending') : [];
        if (requests.length === 0) { container.innerHTML = '<p>No pending requests</p>'; return; }
        container.innerHTML = requests.map(([id, req]) => `
            <div class="request-item">
                <div class="request-info"><strong>${req.fromUserName}</strong><p>${req.fromUserEmail}</p></div>
                <div class="request-actions">
                    <button class="btn-accept" onclick="acceptRequest('${id}', '${req.fromUserId}')">Accept</button>
                    <button class="btn-reject" onclick="rejectRequest('${id}')">Reject</button>
                </div>
            </div>`).join('');
    });
}

window.acceptRequest = function(requestId, fromUserId) {
    const toUserId = emailToId(userEmail);
    database.ref('requests/' + requestId).update({ status: 'accepted', acceptedAt: Date.now() })
    .then(() => {
        const connectionPromises = [
            database.ref('connections/' + toUserId + '/' + fromUserId).set(true),
            database.ref('connections/' + fromUserId + '/' + toUserId).set(true)
        ];
        return Promise.all(connectionPromises);
    })
    .then(() => { alert('✅ Accepted!'); loadReceivedRequests(); loadMyConnections(); });
};

window.rejectRequest = function(requestId) {
    database.ref('requests/' + requestId).update({status: 'rejected'}).then(() => { loadReceivedRequests(); });
};

// 10. Reports
document.getElementById('reportBtn')?.addEventListener('click', () => { document.getElementById('reportModal').style.display = 'flex'; });
document.getElementById('closeReportModal')?.addEventListener('click', () => { document.getElementById('reportModal').style.display = 'none'; });
document.getElementById('reportForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const reportData = {
        reportedUserName: document.getElementById('reportedUserName').value,
        reportedUserRoll: document.getElementById('reportedUserRoll').value,
        reportReason: document.getElementById('reportReason').value,
        reportDescription: document.getElementById('reportDescription').value,
        reporterEmail: userEmail, timestamp: Date.now()
    };
    database.ref('reports').push(reportData).then(() => {
        alert('✅ Report submitted!');
        document.getElementById('reportModal').style.display = 'none';
        this.reset();
    });
});

// 11. Contact Modal
window.openContactModal = function(id, name, email) {
    const modal = document.getElementById('messageModal');
    if (modal) {
        document.getElementById('partnerNameModal').textContent = name;
        modal.style.display = 'flex';
        const messageForm = document.getElementById('messageForm');
        messageForm.dataset.partnerEmail = email;
    }
};
document.getElementById('closeModal')?.addEventListener('click', () => { document.getElementById('messageModal').style.display = 'none'; });

// Start
init();
