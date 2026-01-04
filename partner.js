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
let myConnections = {}; // Tracks requests sent and received
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');
const userPhone = localStorage.getItem('userPhone'); // Ensure this exists in local storage

// Helper: Firebase doesn't allow "." in keys
const encodeEmail = (email) => email ? email.replace(/\./g, '_') : '';

// 3. Start the App
function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    const myEncodedEmail = encodeEmail(userEmail);

    // Listen for Connection Requests (Privacy Layer)
    database.ref('requests').on('value', (snapshot) => {
        myConnections = snapshot.val() || {};
        
        // Listen for Profile Data
        database.ref('profiles').on('value', (snapshot) => {
            const data = snapshot.val();
            partners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
            displayPartners();
        });
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && userName) profileBtn.textContent = userName;
}

// 4. Display Cards with Privacy Logic
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

    const myEncodedEmail = encodeEmail(userEmail);

    partners.forEach(p => {
        const isMine = p.email === userEmail;
        const targetEncodedEmail = encodeEmail(p.email);
        
        // Check relationship status
        // Case 1: They sent me a request
        const incomingReq = myConnections[myEncodedEmail]?.[targetEncodedEmail];
        // Case 2: I sent them a request
        const outgoingReq = myConnections[targetEncodedEmail]?.[myEncodedEmail];
        
        const isConnected = (incomingReq?.status === 'accepted') || (outgoingReq?.status === 'accepted');
        const isPending = outgoingReq?.status === 'pending';

        const card = document.createElement('div');
        card.className = 'partner-card';

        const availabilityClass = p.availability === 'available' ? 'status-available' : 'status-found';
        const availabilityText = p.availability === 'available' ? '✓ Available' : '✗ Partnered';
        
        const skillsArray = p.skills ? p.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const skillsHTML = skillsArray.length > 0 
            ? skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
            : '<span class="no-skills">No skills listed</span>';

        // PRIVACY LOGIC: Hide phone unless connected or is own profile
        const phoneDisplay = (isMine || isConnected) ? p.phone : "<i>Hidden (Connect to view)</i>";
        
        card.innerHTML = `
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
                    <div class="info-row">
                        <span class="info-icon">🎓</span>
                        <div class="info-content"><strong>University</strong><p>${p.university || 'Not specified'}</p></div>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">💼</span>
                        <div class="info-content"><strong>Department</strong><p>${p.department || 'Not specified'}</p></div>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📚</span>
                        <div class="info-content"><strong>Semester</strong><p>${getOrdinalSemester(p.semester)}</p></div>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📧</span>
                        <div class="info-content"><strong>Email</strong><p>${p.email}</p></div>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📱</span>
                        <div class="info-content"><strong>Phone</strong><p>${phoneDisplay}</p></div>
                    </div>
                </div>
                
                ${p.bio ? `<div class="bio-section"><strong>About:</strong><p>${p.bio}</p></div>` : ''}
                <div class="skills-section">
                    <strong>Skills:</strong>
                    <div class="skills-container">${skillsHTML}</div>
                </div>
            </div>
            
            <div class="card-footer" id="footer-${targetEncodedEmail}">
                ${isMine ? 
                    `<button class="btn-contact" onclick="editProfile('${p.id}')" style="flex:1;">✏️ Edit</button>
                     <button class="btn-whatsapp" onclick="deleteProfile('${p.id}')" style="flex:1; background:rgba(239,68,68,0.2); color:#ef4444;">🗑️ Delete</button>` : 
                    renderActionButton(p, targetEncodedEmail, incomingReq, outgoingReq, isConnected, isPending)
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// Helper to render buttons based on privacy/request state
function renderActionButton(p, targetId, incoming, outgoing, isConnected, isPending) {
    if (isConnected) {
        return `
            <button class="btn-contact" onclick="openContactModal('${p.id}', '${p.fullName}', '${p.email}')">📧 Email</button>
            <a href="https://wa.me/${p.phone.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp">💬 WhatsApp</a>
        `;
    } else if (incoming && incoming.status === 'pending') {
        return `
            <button class="btn-contact" onclick="respondRequest('${targetId}', 'accepted')" style="background:#10b981; color:white;">Accept Request</button>
            <button class="btn-whatsapp" onclick="respondRequest('${targetId}', 'declined')" style="background:#ef4444; color:white;">Decline</button>
        `;
    } else if (isPending) {
        return `<button class="btn-contact" disabled style="flex:1; background:#6b7280;">⏳ Request Pending</button>`;
    } else {
        return `<button class="btn-contact" onclick="sendPartnerRequest('${targetId}', '${p.fullName}')" style="flex:1;">🤝 Request to Partner</button>`;
    }
}

// 5. New Privacy Functions (Request/Accept)
window.sendPartnerRequest = function(targetEncodedEmail, targetName) {
    const myEncodedEmail = encodeEmail(userEmail);
    const requestData = {
        fromName: userName,
        fromEmail: userEmail,
        status: 'pending',
        timestamp: Date.now()
    };

    database.ref('requests/' + targetEncodedEmail + '/' + myEncodedEmail).set(requestData)
        .then(() => alert("✅ Partnership request sent to " + targetName + ". They must accept before you can see their contact info."))
        .catch(err => alert("❌ Error: " + err.message));
};

window.respondRequest = function(senderEncodedEmail, status) {
    const myEncodedEmail = encodeEmail(userEmail);
    database.ref('requests/' + myEncodedEmail + '/' + senderEncodedEmail).update({ status: status })
        .then(() => {
            if(status === 'accepted') alert("✅ Connection accepted! You can now see each other's contact details.");
        });
};

// --- PRE-EXISTING FUNCTIONS (Kept Exactly As Requested) ---

function getOrdinalSemester(num) {
    if (!num) return 'Not specified';
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]) + ' Semester';
}

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
    const semesterSelect = document.getElementById('semester');
    const event = new Event('change');
    semesterSelect.dispatchEvent(event);
    setTimeout(() => { document.getElementById('course').value = p.course || ''; }, 100);
    document.getElementById('session').value = p.session || '';
    document.getElementById('skills').value = p.skills || '';
    document.getElementById('bio').value = p.bio || '';
    document.getElementById('availability').value = p.availability || 'available';
    document.getElementById('formTitle').textContent = 'Edit Your Profile';
    document.getElementById('submitBtn').textContent = 'Update My Profile';
};

window.deleteProfile = function(id) {
    if (confirm("⚠️ Are you sure? This action cannot be undone!")) {
        database.ref('profiles/' + id).remove()
            .then(() => alert("✅ Profile deleted successfully!"))
            .catch(err => alert("❌ Error: " + err.message));
    }
};

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
            alert(existingId ? "✅ Profile Updated!" : "✅ Profile Added!");
            profileForm.reset();
            document.getElementById('profileId').value = '';
            document.getElementById('formTitle').textContent = 'Create Your Partner Profile';
            document.getElementById('submitBtn').textContent = 'Add My Profile';
        });
    });
}

function filterProfiles() {
    const filterIds = ['filterUniversity', 'filterDepartment', 'filterBatch', 'filterSection', 'filterSemester', 'filterSession', 'filterCourse', 'filterAvailability'];
    const filters = {};
    filterIds.forEach(id => { filters[id.replace('filter', '').toLowerCase()] = document.getElementById(id)?.value || ''; });
    
    database.ref('profiles').once('value', (snapshot) => {
        const data = snapshot.val();
        let allPartners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        partners = allPartners.filter(p => {
            for (let key in filters) {
                if (filters[key] && p[key] !== filters[key]) return false;
            }
            return true;
        });
        displayPartners();
    });
}

const filterIds = ['filterUniversity', 'filterDepartment', 'filterBatch', 'filterSection', 'filterSemester', 'filterSession', 'filterCourse', 'filterAvailability'];
filterIds.forEach(id => { document.getElementById(id)?.addEventListener('change', filterProfiles); });

const resetFiltersBtn = document.getElementById('resetFilters');
if (resetFiltersBtn) { resetFiltersBtn.addEventListener('click', () => init()); }

window.openContactModal = function(profileId, name, email) {
    const modal = document.getElementById('messageModal');
    if (modal) {
        document.getElementById('partnerNameModal').textContent = name;
        modal.style.display = 'flex';
        const messageForm = document.getElementById('messageForm');
        messageForm.dataset.partnerEmail = email;
        messageForm.dataset.partnerName = name;
    }
};

const messageForm = document.getElementById('messageForm');
if (messageForm) {
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const senderName = document.getElementById('senderName').value;
        const message = document.getElementById('messageText').value;
        const partnerEmail = this.dataset.partnerEmail;
        const subject = encodeURIComponent(`Project Partnership Request`);
        const body = encodeURIComponent(`Hi, ${message}\n\nBest, ${senderName}`);
        window.location.href = `mailto:${partnerEmail}?subject=${subject}&body=${body}`;
        document.getElementById('messageModal').style.display = 'none';
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Logout?')) { localStorage.clear(); window.location.href = 'index.html'; }
    });
}

init();
